import crypto from "crypto";

/**
 * Verify GitHub HMAC SHA256 signature.
 * @param secret the webhook secret from GitHub App
 * @param payload raw request body text
 * @param signatureHeader full header value (sha256=...)
 * @returns true if valid, false otherwise
 */
export function verifyGitHubSignature(
  secret: string,
  payload: string,
  signatureHeader?: string,
): boolean {
  if (!signatureHeader) return false;
  if (!signatureHeader.startsWith("sha256=")) return false;

  const theirSig = signatureHeader.split("=")[1];
  const ourSig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const theirs = Buffer.from(theirSig);
  const ours = Buffer.from(ourSig);

  if (theirs.length !== ours.length) return false;
  return crypto.timingSafeEqual(theirs, ours);
}
