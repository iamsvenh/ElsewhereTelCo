/**
 * F7 — phone numbers must not reach stdout in full. maskNumber keeps only the
 * last two digits so logs stay debuggable without being a PII copy.
 */
import { describe, test, expect } from "bun:test";
import { maskNumber } from "../../apps/bridge/src/redact";

describe("maskNumber (F7)", () => {
  test("keeps only the last two digits", () => {
    expect(maskNumber("+14158675309")).toBe("••••09");
  });

  test("does not contain the full number", () => {
    const full = "+14158675309";
    expect(maskNumber(full)).not.toContain(full);
    expect(maskNumber(full)).not.toContain("4158675");
  });

  test("passes through the 'unknown' sentinel untouched", () => {
    expect(maskNumber("unknown")).toBe("unknown");
  });

  test("passes through empty string untouched", () => {
    expect(maskNumber("")).toBe("");
  });
});
