export type { Persona, MemoryStyle, VoiceConfig } from "./types";
export { HOUSE_RULES, buildInstructions } from "./types";

import type { Persona } from "./types";
import { devil } from "./devil";
import { mom } from "./mom";
import { futureYou } from "./future-you";
import { operator } from "./operator";

export { devil, mom, futureYou, operator };

/** Registry keyed by persona id (the ids used in PERSONA_NUMBER_MAP and call logs). */
export const personas: Record<string, Persona> = {
  [devil.id]: devil,
  [mom.id]: mom,
  [futureYou.id]: futureYou,
  [operator.id]: operator,
};

export function getPersona(id: string): Persona | undefined {
  return personas[id];
}
