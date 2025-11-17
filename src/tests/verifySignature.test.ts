import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { verifyGitHubSignature } from "../github/helper/verifySignature";

describe("verifyGitHubSignature", () => {
  const secret = "testsecret";
  const body = '{"action":"opened"}';

  const makeSig = () =>
    "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex");

  it("returns true for valid signature", () => {
    const sig = makeSig();
    expect(verifyGitHubSignature(secret, body, sig)).toBe(true);
  });

  it("returns false for missing header", () => {
    expect(verifyGitHubSignature(secret, body, undefined)).toBe(false);
  });

  it("returns false for invalid signature", () => {
    expect(verifyGitHubSignature(secret, body, "sha256=deadbeef")).toBe(false);
  });
});
