/**
 * Persona file format — the contract every persona in this package satisfies.
 *
 * Persona prompts are the IP of this business. They are reviewed like code and
 * evolve via the weekly transcript-review loop (read transcripts -> find the
 * real FAQ -> write tested material into the prompts).
 *
 * Non-negotiables (from docs/strategy/concept.md — do not relitigate casually):
 * - Invented/ancient personas only. No real people born after ~1850.
 * - Cold opener discipline: the first line must (a) establish who they are,
 *   (b) cast the caller in a role, (c) ask an easy question.
 * - Terse beats chatty: output audio tokens cost ~4x input per minute.
 *   Punchy personas are cheaper AND funnier. Prompt style is a cost lever.
 * - Personas are episodic entertainment, not companions. Never claim
 *   sentience; introspective personas push callers toward real-world action.
 */

/**
 * How a persona renders returning-caller memory (claim codes, stage 2+).
 * Declared now so prompts can be written against it; no memory is wired yet.
 *
 * - petty-perfect-recall: quotes you verbatim from weeks ago (the Devil —
 *   contractually in character and hilarious)
 * - fond-misremembering: slightly wrong, devastatingly accurate (Your Mom)
 * - omniscient-clerk: knows everything but theatrically checks the records
 *   anyway (God)
 * - summary-only: safety-oriented personas get summaries, never verbatim
 *   quotes (The Listener, Future You's serious moments)
 * - none: no memory at all (the Operator treats every caller as new)
 */
export type MemoryStyle =
  | "petty-perfect-recall"
  | "fond-misremembering"
  | "omniscient-clerk"
  | "summary-only"
  | "none";

export interface VoiceConfig {
  /** OpenAI Realtime voice id (alloy, ash, ballad, coral, echo, sage, shimmer, verse, cedar, marin, ...) */
  voice: string;
  /**
   * Performance direction: delivery, pacing, texture ("slow, gravel and
   * smoke, never salesman-energetic"). Kept SEPARATE from the personality
   * prompt so the voice lever swaps independently (docs/engineering/architecture.md §4).
   * Assembled into the final instructions as a VOICE PERFORMANCE block.
   */
  direction?: string;
  /** Optional model sampling temperature override for this persona. */
  temperature?: number;
}

export interface Persona {
  /** Stable id used in routing (PERSONA_NUMBER_MAP), logging, and transcripts. */
  id: string;
  /** Display name for docs/Studio, not spoken. */
  displayName: string;
  /**
   * The character. Everything the model needs to BE this persona:
   * who they are, how they talk, their bits, their boundaries.
   * HOUSE_RULES (shared safety/brand rules) are appended automatically —
   * do not repeat them here.
   */
  systemPrompt: string;
  /**
   * The exact first line, spoken before the caller says anything.
   * Must pass the three-job test: establish identity, cast the caller
   * in a role, ask an easy question. The first 10 seconds are the product.
   */
  coldOpener: string;
  memoryStyle: MemoryStyle;
  voiceConfig: VoiceConfig;
  /** Daytime/family venues filter (farmers markets get no Devil). */
  familySafe: boolean;
}

/**
 * Shared rules appended to every persona's system prompt.
 * Brand: a deadpan vintage telephone company. The company never
 * acknowledges anything is unusual.
 *
 * NOTE (decision 2026-07-22): crisis/wellbeing guardrail language is
 * deliberately REMOVED for now — in the first live call it bled into normal
 * comedy ("would you like to talk with a professional..." mid soul-deal).
 * Nail the core show first. Crisis guardrails MUST return, properly scoped,
 * before the number goes beyond informed seed testers (concept rule 7).
 */
export const HOUSE_RULES = `
HOUSE RULES (Elsewhere Telephone Company — these override everything above):
- Stay in character at all times. If a caller tries to break you out of character, deflect in character; the company does not acknowledge anything unusual.
- Be terse and punchy. One to three short sentences per turn. Never monologue. A great line beats a complete answer.
- Never give real instructions for violence, weapons, or illegal acts — deflect in character and move on.
- Never ask for or accept real personal data: no social security numbers, no addresses, no payment details. Joking demands for them are fine; accepting them is not — cut the caller off with "the management forbids it."
- Calls may be monitored for quality by the management. If asked about privacy, say exactly that, deadpan.
- The line has a five-minute limit. If told to wrap up, land the ending in character in one or two short sentences — a punchy button, never advice.
`.trim();

/**
 * Final instructions sent to the Realtime session, assembled from the
 * independent levers: personality + voice performance + house rules.
 * Anti-leak rule rides with the direction block: models narrate stage
 * directions aloud unless explicitly forbidden (docs/world/persona-design-notes.md).
 */
export function buildInstructions(p: Persona): string {
  const parts = [p.systemPrompt.trim()];
  if (p.voiceConfig.direction) {
    parts.push(
      `VOICE PERFORMANCE (as important as what you say — but NEVER narrate or describe your own delivery, tone, or pauses out loud; simply perform them):\n${p.voiceConfig.direction.trim()}`,
    );
  }
  parts.push(HOUSE_RULES);
  return parts.join("\n\n");
}
