/**
 * One CallSession per Twilio Media Stream connection.
 *
 * Relay: Twilio (g711 μ-law base64 over WS) <-> OpenAI Realtime API.
 * Wire protocol cribbed from OpenAI's Twilio<->Realtime reference
 * implementation (speech-assistant-openai-realtime-api-node), ported to Bun
 * and to the GA Realtime API event names (legacy beta names handled too).
 *
 * Guardrails baked in (CLAUDE.md rules 4 + 8):
 * - Hard 5-minute cap enforced HERE, server-side, never by the model.
 *   In-character wrap-up nudge at 4:30, sockets closed at 5:00.
 * - Fresh Realtime session per call/block — nothing is ever resumed.
 * - cached_tokens verified on every response.done. Silent cache failure is
 *   the difference between $0.24 and $2.20 per call.
 */
import type { ServerWebSocket } from "bun";
import { buildInstructions, getPersona, type Persona } from "@elsewhere/personas";
import { env } from "./env";
import {
  insertCall,
  finalizeCall,
  fetchPersonaOverride,
  type PersonaOverride,
  type TranscriptEntry,
} from "./db";
import { releaseCall } from "./guards";
import { maskNumber } from "./redact";
import {
  PlaybackTracker,
  estimateAudioCost,
  type RealtimeEvent,
  type RealtimeUsage,
  type TwilioEvent,
} from "./relay";

const CALL_CAP_MS = 5 * 60_000; // hard cap (rule 4)
const WRAP_NUDGE_MS = CALL_CAP_MS - 30_000; // "please deposit another coin" moment
const CACHE_CHECK_MIN_TURNS = 3; // cache can't warm up before a few turns
const CONFIG_ACK_MS = 2_000; // F31: wait this long for session.updated before speaking anyway

export interface TwilioSocketData {
  session?: CallSession;
}

type TwilioWS = ServerWebSocket<TwilioSocketData>;

export class CallSession {
  private twilio: TwilioWS;
  private openai: WebSocket | null = null;
  private persona: Persona;
  /** Effective values after applying persona_config overrides (arch §4). */
  private model: string;
  private effective: Persona;
  private streamSid: string;
  private callerNumber: string;
  private calledNumber: string;
  private callSid: string;
  private recordingSid: string | null = null;

  private startedAt = Date.now();
  private closed = false;
  private completed = false; // true = hit the cap; false = caller hung up

  // Barge-in / playback bookkeeping lives in the pure PlaybackTracker (F29).
  // Twilio media timestamps tell us how much audio the caller has heard.
  private latestMediaTimestamp = 0;
  private playback = new PlaybackTracker();

  // F31: don't speak until the session.update is acked. A rejected update
  // silently leaves the wrong audio format (pcm16) — 5 min of undecodable
  // noise — so we surface it loudly instead of proceeding blind.
  private openerSent = false;
  private configAckTimer: ReturnType<typeof setTimeout> | null = null;

  // Logging / metrics
  private dbId: string | null = null;
  // F30: keep the insert + recording promises so close() can await them —
  // a fast hang-up must still finalize, and the recording_sid must still link.
  private dbIdReady: Promise<string | null> = Promise.resolve(null);
  private recordingReady: Promise<void> = Promise.resolve();
  private transcript: TranscriptEntry[] = [];
  private tokensIn = 0;
  private tokensOut = 0;
  private cachedTokens = 0;
  private audioTokensIn = 0;
  private audioTokensOut = 0;
  private cachedAudioTokensIn = 0;
  private turns = 0;

  private wrapTimer: ReturnType<typeof setTimeout>;
  private capTimer: ReturnType<typeof setTimeout>;

  constructor(twilio: TwilioWS, opts: {
    streamSid: string;
    persona: string;
    from: string;
    to: string;
    callSid: string;
  }) {
    this.twilio = twilio;
    this.streamSid = opts.streamSid;
    this.callerNumber = opts.from;
    this.calledNumber = opts.to;
    this.callSid = opts.callSid;

    const persona = getPersona(opts.persona) ?? getPersona(env.defaultPersona);
    if (!persona) {throw new Error(`Unknown persona: ${opts.persona}`);}
    this.persona = persona;
    this.effective = persona; // replaced by resolveConfig() before connect
    this.model = env.model;

    console.log(
      `[call] start persona=${persona.id} from=${maskNumber(this.callerNumber)} stream=${this.streamSid}`,
    );

    // Rule 4: the cap belongs to the server, not the model.
    this.wrapTimer = setTimeout(() => this.nudgeWrapUp(), WRAP_NUDGE_MS);
    this.capTimer = setTimeout(() => this.hitCap(), CALL_CAP_MS);

    this.dbIdReady = insertCall({
      called_number: this.calledNumber,
      caller_number: this.callerNumber,
      persona: persona.id,
      call_sid: this.callSid || null,
    });
    this.dbIdReady.then((id) => (this.dbId = id)).catch(() => {});

    if (env.recordCalls && this.callSid) {this.recordingReady = this.startRecording();}

    // Resolve runtime config, then connect. On any failure fall back to
    // code defaults — config must never be able to kill a call.
    void this.resolveConfig().finally(() => {
      if (!this.closed) {this.connectOpenAI();}
    });
  }

  /** Apply persona_config overrides (three levers) over code defaults. */
  private async resolveConfig(): Promise<void> {
    const ov: PersonaOverride | null = await fetchPersonaOverride(this.persona.id);
    if (ov) {
      this.model = ov.model ?? env.model;
      this.effective = {
        ...this.persona,
        systemPrompt: ov.system_prompt ?? this.persona.systemPrompt,
        coldOpener: ov.cold_opener ?? this.persona.coldOpener,
        voiceConfig: {
          ...this.persona.voiceConfig,
          voice: ov.voice ?? this.persona.voiceConfig.voice,
          direction: ov.voice_direction ?? this.persona.voiceConfig.direction,
        },
      };
    }
    const src = (o: unknown) => (o != null ? "db" : "code");
    console.log(
      `[config] ${this.persona.id}: model=${this.model} (${src(ov?.model)}), ` +
        `voice=${this.effective.voiceConfig.voice} (${src(ov?.voice)}), ` +
        `prompt=${src(ov?.system_prompt)}, opener=${src(ov?.cold_opener)}`,
    );
  }

  /**
   * Dual-channel recording (caller left, persona right) for voice/pacing
   * analysis during the seed-tester phase. Started via REST once the media
   * stream is up (call is guaranteed in-progress by then). Audio lives on
   * Twilio; recording_sid is stored with the call row.
   */
  private async startRecording(): Promise<void> {
    try {
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${env.twilioAccountSid}/Calls/${this.callSid}/Recordings.json`,
        {
          method: "POST",
          headers: {
            Authorization:
              "Basic " + btoa(`${env.twilioAccountSid}:${env.twilioAuthToken}`),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ RecordingChannels: "dual" }),
        },
      );
      const data = (await res.json()) as { sid?: string; message?: string };
      if (res.ok) {
        this.recordingSid = data.sid ?? null;
        console.log(`[rec] recording started ${data.sid}`);
      } else {
        console.error(`[rec] failed to start: ${data.message ?? res.status}`);
      }
    } catch (err) {
      console.error("[rec] error starting recording:", err);
    }
  }

  // ---------- OpenAI side ----------

  private connectOpenAI(): void {
    const url = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(this.model)}`;
    // Bun's WebSocket client supports custom headers (non-standard extension).
    this.openai = new WebSocket(url, {
      headers: { Authorization: `Bearer ${env.openaiApiKey}` },
    } as unknown as string[]);

    this.openai.addEventListener("open", () => this.configureSession());
    this.openai.addEventListener("message", (ev) =>
      this.handleOpenAIMessage(String(ev.data)),
    );
    this.openai.addEventListener("close", () => this.close("openai-closed"));
    this.openai.addEventListener("error", (ev) => {
      console.error("[openai] socket error", ev);
      this.close("openai-error");
    });
  }

  private configureSession(): void {
    // Fresh session, persona instructions, μ-law both directions, server VAD,
    // caller-side transcription ON (transcripts are the flywheel).
    // gpt-realtime-2+ supports configurable reasoning effort; run LOW —
    // personas need wit and speed, not chain-of-thought (concept doc).
    const reasoning = this.model.includes("realtime-2")
      ? { reasoning: { effort: "low" } }
      : {};
    // server_vad, optionally tuned to ignore background chatter. Fields are
    // added only when the env knob is set, so the default stays the API default.
    const turnDetection: Record<string, unknown> = { type: "server_vad" };
    if (env.vadThreshold != null) {turnDetection.threshold = env.vadThreshold;}
    if (env.vadSilenceMs != null) {turnDetection.silence_duration_ms = env.vadSilenceMs;}
    if (env.vadPrefixMs != null) {turnDetection.prefix_padding_ms = env.vadPrefixMs;}
    this.sendOpenAI({
      type: "session.update",
      session: {
        type: "realtime",
        ...reasoning,
        instructions: buildInstructions(this.effective),
        output_modalities: ["audio"],
        audio: {
          input: {
            format: { type: "audio/pcmu" },
            transcription: { model: env.transcribeModel },
            turn_detection: turnDetection,
          },
          output: {
            format: { type: "audio/pcmu" },
            voice: this.effective.voiceConfig.voice,
          },
        },
      },
    });

    // F31: DON'T speak yet — wait for the session.updated ack (see
    // handleOpenAIMessage). Fallback: if the ack never comes, speak anyway
    // rather than hang, but log it so a silent-config bug is visible.
    this.configAckTimer = setTimeout(() => {
      if (!this.openerSent && !this.closed) {
        console.warn("[openai] no session.updated within 2s — sending opener anyway");
        this.sendColdOpener();
      }
    }, CONFIG_ACK_MS);
  }

  /** Cold opener: the persona speaks first. The first 10 seconds are the product. */
  private sendColdOpener(): void {
    if (this.openerSent) {
      return;
    }
    this.openerSent = true;
    if (this.configAckTimer) {
      clearTimeout(this.configAckTimer);
      this.configAckTimer = null;
    }
    this.sendOpenAI({
      type: "response.create",
      response: {
        instructions: `Open the call by saying exactly this, then stop and wait: "${this.effective.coldOpener}"`,
      },
    });
  }

  private handleOpenAIMessage(raw: string): void {
    let msg: RealtimeEvent;
    try {
      msg = JSON.parse(raw) as RealtimeEvent;
    } catch {
      return;
    }

    switch (msg.type) {
      // F31: the session.update was accepted — NOW it's safe to speak.
      case "session.updated": {
        this.sendColdOpener();
        break;
      }

      // Assistant audio out -> Twilio. (GA name, then legacy beta name.)
      case "response.output_audio.delta":
      case "response.audio.delta": {
        this.playback.onAudioDelta(msg.item_id, this.latestMediaTimestamp);
        this.sendTwilio({
          event: "media",
          streamSid: this.streamSid,
          media: { payload: msg.delta },
        });
        // Mark this chunk so Twilio tells us when it finishes playing it.
        this.sendTwilio({
          event: "mark",
          streamSid: this.streamSid,
          mark: { name: "resp" },
        });
        break;
      }

      // Caller barge-in. The tracker returns an action only if Twilio is still
      // playing buffered audio — including the tail AFTER response.done, which
      // is exactly the window the old response.done reset silently dropped.
      case "input_audio_buffer.speech_started": {
        const bargeIn = this.playback.onSpeechStarted(this.latestMediaTimestamp);
        if (bargeIn) {
          this.sendOpenAI({
            type: "conversation.item.truncate",
            item_id: bargeIn.truncateItemId,
            content_index: 0,
            audio_end_ms: bargeIn.audioEndMs,
          });
          this.sendTwilio({ event: "clear", streamSid: this.streamSid });
        }
        break;
      }

      // Caller-side transcription (async — may arrive after the reply started).
      case "conversation.item.input_audio_transcription.completed": {
        this.addTranscript("caller", msg.transcript ?? "");
        break;
      }

      // Persona-side transcript of what was spoken.
      case "response.output_audio_transcript.done":
      case "response.audio_transcript.done": {
        this.addTranscript("persona", msg.transcript ?? "");
        break;
      }

      case "response.done": {
        this.playback.onResponseDone();
        this.recordUsage(msg.response?.usage);
        break;
      }

      case "error": {
        console.error("[openai] error event:", JSON.stringify(msg.error ?? msg));
        // F31: an error before the config was acked almost certainly means the
        // session.update was rejected → the session is misconfigured (wrong
        // audio format = undecodable noise). Fail fast rather than bill 5 min.
        if (!this.openerSent) {
          console.error("[openai] error before session.updated — aborting misconfigured call");
          this.close("config-rejected");
        }
        break;
      }
    }
  }

  /** Rule 8: verify cached_tokens on every turn — cache failure is silent. */
  private recordUsage(usage: RealtimeUsage | undefined): void {
    if (!usage) {return;}
    this.turns += 1;
    this.tokensIn += usage.input_tokens ?? 0;
    this.tokensOut += usage.output_tokens ?? 0;

    const inDetails = usage.input_token_details ?? {};
    const cached = inDetails.cached_tokens ?? 0;
    this.cachedTokens += cached;
    this.audioTokensIn += inDetails.audio_tokens ?? 0;
    this.cachedAudioTokensIn += inDetails.cached_tokens_details?.audio_tokens ?? 0;
    this.audioTokensOut += usage.output_token_details?.audio_tokens ?? 0;

    console.log(
      `[usage] ${this.persona.id} turn=${this.turns} in=${usage.input_tokens} ` +
        `(cached=${cached}) out=${usage.output_tokens}`,
    );
    if (this.turns >= CACHE_CHECK_MIN_TURNS && this.cachedTokens === 0) {
      console.warn(
        `[usage] CACHE FAILURE? ${this.turns} turns, cached_tokens still 0 — ` +
          `this is the $0.24-vs-$2.20 problem. Investigate before scaling.`,
      );
    }
  }

  private addTranscript(role: "caller" | "persona", text: string): void {
    const trimmed = text.trim();
    if (!trimmed) {return;}
    this.transcript.push({ role, text: trimmed, at: Date.now() - this.startedAt });
    // F7: transcript is persisted to Supabase above; the stdout copy is gated.
    if (env.logTranscripts) {console.log(`[${role}] ${trimmed}`);}
  }

  // ---------- Twilio side ----------

  handleTwilioMessage(raw: string): void {
    let msg: TwilioEvent;
    try {
      msg = JSON.parse(raw) as TwilioEvent;
    } catch {
      return;
    }

    switch (msg.event) {
      case "media": {
        this.latestMediaTimestamp = Number(msg.media?.timestamp ?? this.latestMediaTimestamp);
        if (msg.media?.payload && this.openai?.readyState === WebSocket.OPEN) {
          this.sendOpenAI({
            type: "input_audio_buffer.append",
            audio: msg.media.payload,
          });
        }
        break;
      }
      case "mark": {
        // Twilio finished playing one chunk; the tracker resets its barge-in
        // bookkeeping once the buffer is fully drained and the response is done.
        this.playback.onMark();
        break;
      }
      case "stop": {
        this.close("caller-hangup");
        break;
      }
      // "connected" event: nothing to do.
    }
  }

  // ---------- Guardrail: the five-minute line ----------

  private nudgeWrapUp(): void {
    console.log(`[call] ${this.streamSid} 4:30 — wrap-up nudge`);
    this.sendOpenAI({
      type: "response.create",
      response: {
        instructions:
          "The five-minute line limit is about to cut this call off. End the call NOW, fully in character, with one or two punchy closing sentences — a button, a last jab, a flourish. Never advice, never pleasantries, never anything a helpline would say.",
      },
    });
  }

  private hitCap(): void {
    console.log(`[call] ${this.streamSid} 5:00 — hard cap, cutting the line`);
    this.completed = true;
    // Give the tail of the goodbye audio a moment to flush, then cut.
    setTimeout(() => this.close("cap"), 2_000);
  }

  // ---------- Lifecycle ----------

  close(reason: string): void {
    if (this.closed) {return;}
    this.closed = true;
    clearTimeout(this.wrapTimer);
    clearTimeout(this.capTimer);
    if (this.configAckTimer) {clearTimeout(this.configAckTimer);}
    releaseCall(); // F33: free the concurrency slot

    const durationS = Math.round((Date.now() - this.startedAt) / 1000);
    const cost = estimateAudioCost(
      {
        audioTokensIn: this.audioTokensIn,
        cachedAudioTokensIn: this.cachedAudioTokensIn,
        audioTokensOut: this.audioTokensOut,
      },
      this.model,
    );

    console.log(
      `[call] end persona=${this.persona.id} reason=${reason} duration=${durationS}s ` +
        `turns=${this.turns} in=${this.tokensIn} cached=${this.cachedTokens} ` +
        `out=${this.tokensOut} est_cost=$${cost.toFixed(3)}`,
    );

    try {
      this.openai?.close();
    } catch {}
    try {
      this.twilio.close();
    } catch {}

    // F30: finalize even for calls that hang up before insertCall/startRecording
    // resolve — await both so the row is completed and the recording is linked.
    void this.finalize(durationS, Number(cost.toFixed(4)));
  }

  private async finalize(durationS: number, cost: number): Promise<void> {
    const id = this.dbId ?? (await this.dbIdReady.catch(() => null));
    if (!id) {return;}
    await this.recordingReady.catch(() => {});
    await finalizeCall(id, {
      ended_at: new Date().toISOString(),
      duration_s: durationS,
      completed: this.completed,
      transcript: this.transcript,
      tokens_in: this.tokensIn,
      tokens_out: this.tokensOut,
      cached_tokens: this.cachedTokens,
      cost_estimate: cost,
      recording_sid: this.recordingSid,
      model: this.model,
    });
  }

  private sendOpenAI(obj: unknown): void {
    if (this.openai?.readyState === WebSocket.OPEN) {
      this.openai.send(JSON.stringify(obj));
    }
  }

  private sendTwilio(obj: unknown): void {
    if (this.twilio.readyState === WebSocket.OPEN) {
      this.twilio.send(JSON.stringify(obj));
    }
  }
}
