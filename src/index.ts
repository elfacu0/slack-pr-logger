import { Hono } from "hono";
import { verifyGitHubSignature } from "./helper/verifySignature";

const app = new Hono();

app.get("/health", (c) => c.text("ok"));

app.post("/webhook/github", async (c) => {
  const signature = c.req.header("x-hub-signature-256");
  const event = c.req.header("x-github-event");
  const id = c.req.header("x-github-delivery");

  const bodyText = await c.req.text();

  const secret = process.env.GITHUB_WEBHOOK_SECRET || "";
  const valid = verifyGitHubSignature(secret, bodyText, signature);

  if (!valid) {
    console.warn("❌ Invalid signature for delivery", id);
    return c.text("Invalid signature", 401);
  }

  console.log("✅ Valid signature for event:", event, "ID:", id);
  return c.json({ ok: true }, 202);
});

export default app;
