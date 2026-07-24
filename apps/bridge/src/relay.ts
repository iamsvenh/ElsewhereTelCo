/**
 * Pure relay logic, split out of session.ts so it can be unit-tested against
 * synthetic event sequences without any sockets. session.ts owns the I/O and
 * drives these; they own the tricky bookkeeping.
 */

// ---------- wire event shapes (only the fields we read) ----------

export interface RealtimeUsage {
  input_tokens?: number;
  output_tokens?: number;
  input_token_details?: {
    cached_tokens?: number;
    audio_tokens?: number;
    cached_tokens_details?: { audio_tokens?: number };
  };
  output_token_details?: { audio_tokens?: number };
}

export interface RealtimeEvent {
  type?: string;
  delta?: string;
  item_id?: string;
  transcript?: string;
  response?: { usage?: RealtimeUsage };
  error?: unknown;
}

export interface TwilioEvent {
  event?: string;
  media?: { timestamp?: number | string; payload?: string };
  mark?: { name?: string };
}

// ---------- cost estimate (logging aid, not billing) ----------

/**
 * Rough per-token audio pricing (USD/token) by model. Verify against the
 * pricing page when models change. (Learned 2026-07-23: a flat mini table
 * under-reported gpt-realtime-2 calls ~3x vs the real dashboard spend.)
 */
const PRICE_BY_MODEL = {
  mini: { audioIn: 10 / 1e6, audioInCached: 0.3 / 1e6, audioOut: 20 / 1e6 },
  full: { audioIn: 32 / 1e6, audioInCached: 0.4 / 1e6, audioOut: 64 / 1e6 },
} as const;

export function priceFor(model: string): (typeof PRICE_BY_MODEL)["mini"] {
  return model.includes("mini") ? PRICE_BY_MODEL.mini : PRICE_BY_MODEL.full;
}

export interface AudioTokens {
  audioTokensIn: number;
  cachedAudioTokensIn: number;
  audioTokensOut: number;
}

export function estimateAudioCost(t: AudioTokens, model: string): number {
  const p = priceFor(model);
  return (
    (t.audioTokensIn - t.cachedAudioTokensIn) * p.audioIn +
    t.cachedAudioTokensIn * p.audioInCached +
    t.audioTokensOut * p.audioOut
  );
}

// ---------- barge-in / playback bookkeeping (F29) ----------

export interface BargeIn {
  /** The assistant item to truncate to what the caller actually heard. */
  truncateItemId: string;
  /** How many ms of that item were heard before the interruption. */
  audioEndMs: number;
}

/**
 * Tracks whether Twilio is still playing buffered assistant audio, using one
 * "mark" per emitted chunk (Twilio echoes each when it finishes playing it).
 *
 * The subtlety F29 fixes: OpenAI streams a whole response faster than realtime,
 * so `response.done` arrives while Twilio is STILL playing the tail. Keying
 * barge-in off "marks outstanding" — not off response.done — is what makes an
 * interruption in that tail window truncate + clear instead of talking over the
 * caller. Bookkeeping resets only when the buffer has fully drained (last mark
 * back AND response done) or on an actual barge-in.
 */
export class PlaybackTracker {
  private outstanding = 0; // chunks sent but not yet confirmed played
  private responseStart: number | null = null; // caller-heard ms at response start
  private lastItem: string | null = null;
  private inProgress = false; // OpenAI still streaming this response

  /** An assistant audio chunk was emitted; `heardMs` is the current caller-heard timestamp. */
  onAudioDelta(itemId: string | undefined, heardMs: number): void {
    if (this.responseStart === null) {
      this.responseStart = heardMs;
    }
    this.inProgress = true;
    if (itemId) {
      this.lastItem = itemId;
    }
    this.outstanding += 1;
  }

  /** OpenAI finished sending this response (Twilio may still be draining it). */
  onResponseDone(): void {
    this.inProgress = false;
  }

  /** Twilio confirmed one chunk finished playing. */
  onMark(): void {
    if (this.outstanding > 0) {
      this.outstanding -= 1;
    }
    if (this.outstanding === 0 && !this.inProgress) {
      this.responseStart = null;
      this.lastItem = null;
    }
  }

  /**
   * The caller started speaking at `heardMs`. Returns a barge-in action iff
   * assistant audio is still playing (something to interrupt); otherwise null.
   */
  onSpeechStarted(heardMs: number): BargeIn | null {
    if (this.outstanding > 0 && this.lastItem !== null && this.responseStart !== null) {
      const bargeIn: BargeIn = {
        truncateItemId: this.lastItem,
        audioEndMs: Math.max(0, heardMs - this.responseStart),
      };
      this.outstanding = 0;
      this.lastItem = null;
      this.responseStart = null;
      return bargeIn;
    }
    return null;
  }

  /** True while Twilio is (believed to be) still playing assistant audio. */
  get playing(): boolean {
    return this.outstanding > 0;
  }
}
