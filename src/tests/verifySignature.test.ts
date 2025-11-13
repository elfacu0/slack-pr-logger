import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { verifyGitHubSignature } from "../helper/verifySignature";

describe("verifyGitHubSignature", () => {
  const secret = "testsecret";
  const body = '{"action":"opened"}';

  it("returns true for valid signature", () => {
    const validSig =
      "sha256=" +
      crypto.createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyGitHubSignature(secret, body, validSig)).toBe(true);
  });

  it("returns false for invalid signature", () => {
    const badSig = "sha256=deadbeef";
    expect(verifyGitHubSignature(secret, body, badSig)).toBe(false);
  });
});
