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
import { insertCall, finalizeCall, type TranscriptEntry } from "./db";

const CALL_CAP_MS = 5 * 60_000; // hard cap (rule 4)
const WRAP_NUDGE_MS = CALL_CAP_MS - 30_000; // "please deposit another coin" moment
const CACHE_CHECK_MIN_TURNS = 3; // cache can't warm up before a few turns

/**
 * Rough per-token pricing for cost_estimate (USD per token, gpt-realtime-mini
 * audio rates). Verify against the pricing page when the model changes —
 * this is a logging aid, not billing.
 */
const PRICE = {
  audioIn: 10 / 1e6,
  audioInCached: 0.3 / 1e6,
  audioOut: 20 / 1e6,
};

export interface TwilioSocketData {
  session?: CallSession;
}

type TwilioWS = ServerWebSocket<TwilioSocketData>;

export class CallSession {
  private twilio: TwilioWS;
  private openai: WebSocket | null = null;
  private persona: Persona;
  private streamSid: string;
  private callerNumber: string;
  private calledNumber: string;
  private callSid: string;
  private recordingSid: string | null = null;

  private startedAt = Date.now();
  private closed = false;
  private completed = false; // true = hit the cap; false = caller hung up

  // Interruption bookkeeping (from the reference implementation):
  // Twilio media timestamps tell us how much audio the caller has actually
  // heard, so on barge-in we truncate the assistant item to that point and
  // clear Twilio's playback buffer.
  private latestMediaTimestamp = 0;
  private responseStartTimestamp: number | null = null;
  private lastAssistantItem: string | null = null;

  // Logging / metrics
  private dbId: string | null = null;
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
    if (!persona) throw new Error(`Unknown persona: ${opts.persona}`);
    this.persona = persona;

    console.log(
      `[call] start persona=${persona.id} from=${this.callerNumber} stream=${this.streamSid}`,
    );

    // Rule 4: the cap belongs to the server, not the model.
    this.wrapTimer = setTimeout(() => this.nudgeWrapUp(), WRAP_NUDGE_MS);
    this.capTimer = setTimeout(() => this.hitCap(), CALL_CAP_MS);

    void insertCall({
      called_number: this.calledNumber,
      caller_number: this.callerNumber,
      persona: persona.id,
      call_sid: this.callSid || null,
    }).then((id) => (this.dbId = id));

    if (env.recordCalls && this.callSid) void this.startRecording();

    this.connectOpenAI();
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
      const data: any = await res.json();
      if (res.ok) {
        this.recordingSid = data.sid;
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
    const url = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(env.model)}`;
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
    const reasoning = env.model.includes("realtime-2")
      ? { reasoning: { effort: "low" } }
      : {};
    this.sendOpenAI({
      type: "session.update",
      session: {
        type: "realtime",
        ...reasoning,
        instructions: buildInstructions(this.persona),
        output_modalities: ["audio"],
        audio: {
          input: {
            format: { type: "audio/pcmu" },
            transcription: { model: env.transcribeModel },
            turn_detection: { type: "server_vad" },
          },
          output: {
            format: { type: "audio/pcmu" },
            voice: this.persona.voiceConfig.voice,
          },
        },
      },
    });

    // Cold opener: the persona speaks first. The first 10 seconds are the product.
    this.sendOpenAI({
      type: "response.create",
      response: {
        instructions: `Open the call by saying exactly this, then stop and wait: "${this.persona.coldOpener}"`,
      },
    });
  }

  private handleOpenAIMessage(raw: string): void {
    let msg: any;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    switch (msg.type) {
      // Assistant audio out -> Twilio. (GA name, then legacy beta name.)
      case "response.output_audio.delta":
      case "response.audio.delta": {
        if (this.responseStartTimestamp === null) {
          this.responseStartTimestamp = this.latestMediaTimestamp;
        }
        if (msg.item_id) this.lastAssistantItem = msg.item_id;
        this.sendTwilio({
          event: "media",
          streamSid: this.streamSid,
          media: { payload: msg.delta },
        });
        break;
      }

      // Caller barge-in: truncate what the model thinks it said to what the
      // caller actually heard, and flush Twilio's buffered playback.
      case "input_audio_buffer.speech_started": {
        if (this.lastAssistantItem && this.responseStartTimestamp !== null) {
          const heardMs = Math.max(
            0,
            this.latestMediaTimestamp - this.responseStartTimestamp,
          );
          this.sendOpenAI({
            type: "conversation.item.truncate",
            item_id: this.lastAssistantItem,
            content_index: 0,
            audio_end_ms: heardMs,
          });
          this.sendTwilio({ event: "clear", streamSid: this.streamSid });
        }
        this.lastAssistantItem = null;
        this.responseStartTimestamp = null;
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
        this.responseStartTimestamp = null;
        this.recordUsage(msg.response?.usage);
        break;
      }

      case "error": {
        console.error("[openai] error event:", JSON.stringify(msg.error ?? msg));
        break;
      }
    }
  }

  /** Rule 8: verify cached_tokens on every turn — cache failure is silent. */
  private recordUsage(usage: any): void {
    if (!usage) return;
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
    if (!trimmed) return;
    this.transcript.push({ role, text: trimmed, at: Date.now() - this.startedAt });
    console.log(`[${role}] ${trimmed}`);
  }

  // ---------- Twilio side ----------

  handleTwilioMessage(raw: string): void {
    let msg: any;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    switch (msg.event) {
      case "media": {
        this.latestMediaTimestamp = Number(msg.media?.timestamp ?? this.latestMediaTimestamp);
        if (this.openai?.readyState === WebSocket.OPEN) {
          this.sendOpenAI({
            type: "input_audio_buffer.append",
            audio: msg.media.payload,
          });
        }
        break;
      }
      case "stop": {
        this.close("caller-hangup");
        break;
      }
      // "connected"/"mark" events: nothing to do.
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
    if (this.closed) return;
    this.closed = true;
    clearTimeout(this.wrapTimer);
    clearTimeout(this.capTimer);

    const durationS = Math.round((Date.now() - this.startedAt) / 1000);
    const cost =
      (this.audioTokensIn - this.cachedAudioTokensIn) * PRICE.audioIn +
      this.cachedAudioTokensIn * PRICE.audioInCached +
      this.audioTokensOut * PRICE.audioOut;

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

    if (this.dbId) {
      void finalizeCall(this.dbId, {
        ended_at: new Date().toISOString(),
        duration_s: durationS,
        completed: this.completed,
        transcript: this.transcript,
        tokens_in: this.tokensIn,
        tokens_out: this.tokensOut,
        cached_tokens: this.cachedTokens,
        cost_estimate: Number(cost.toFixed(4)),
        recording_sid: this.recordingSid,
      });
    }
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
