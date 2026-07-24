/**
 * Persona invariants — the CLAUDE.md non-negotiables, as executable guards.
 * These don't judge whether a persona is *funny* (that's the transcript-review
 * loop); they lock the structural rules a prompt change must not silently break.
 */
import { describe, test, expect } from "bun:test";
import {
  personas,
  getPersona,
  buildInstructions,
  HOUSE_RULES,
  type MemoryStyle,
  type Persona,
} from "@elsewhere/personas";

const VALID_MEMORY: MemoryStyle[] = [
  "petty-perfect-recall",
  "fond-misremembering",
  "omniscient-clerk",
  "summary-only",
  "none",
];

const all: [string, Persona][] = Object.entries(personas);

describe("registry", () => {
  test("id keys match each persona's own id", () => {
    for (const [key, p] of all) expect(p.id).toBe(key);
  });

  test("getPersona returns undefined for an unknown id", () => {
    expect(getPersona("no-such-persona")).toBeUndefined();
  });
});

for (const [id, p] of all) {
  describe(`persona: ${id}`, () => {
    test("has the required shape", () => {
      expect(p.id).toBeTruthy();
      expect(p.displayName).toBeTruthy();
      expect(p.systemPrompt.trim().length).toBeGreaterThan(0);
      expect(p.voiceConfig.voice).toBeTruthy();
      expect(VALID_MEMORY).toContain(p.memoryStyle);
    });

    test("cold opener exists and asks a question (rule 5: the machine-checkable slice)", () => {
      expect(p.coldOpener.trim().length).toBeGreaterThan(0);
      expect(p.coldOpener).toContain("?");
    });

    test("buildInstructions folds in the character AND the shared house rules", () => {
      const out = buildInstructions(p);
      expect(out).toContain(p.systemPrompt.trim());
      expect(out).toContain(HOUSE_RULES);
    });
  });
}

describe("house rules (canon + safety)", () => {
  test("uses the canonical surveillance phrase, not the retired wording (F26)", () => {
    expect(HOUSE_RULES).toContain("quality assurance");
    expect(HOUSE_RULES).not.toContain("quality by the management");
  });

  test("forbids collecting real personal data", () => {
    expect(HOUSE_RULES.toLowerCase()).toContain("never ask for or accept real personal data");
  });
});

describe("devil prompt — diagnosed loops stay fixed (F24)", () => {
  test("no longer hardcodes the sample-price list that looped in testing", () => {
    // The transcript failure: the model ping-ponged this exact list.
    expect(personas.devil!.systemPrompt).not.toContain("every left sock");
    expect(personas.devil!.systemPrompt).not.toContain("third-best birthday");
  });

  test("no longer hardcodes the verbatim notary gag", () => {
    expect(personas.devil!.systemPrompt).not.toContain("you don't want to meet our notary");
  });
});
