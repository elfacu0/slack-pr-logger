import type { z } from "zod";

import { verifyGitHubSignature } from "../helper/verifySignature";
import { PullRequestEventSchema } from "../github/schemas";
import { formatPRMessage } from "../slack/formatPRMessage";
import { sendSlackMessage } from "../slack/sendMessage";
import type { Context } from "hono";

async function getRequestHeadersAndBody(c: Context) {
  const signature = c.req.header("x-hub-signature-256");
  const eventType = c.req.header("x-github-event");
  const id = c.req.header("x-github-delivery");
  const bodyText = await c.req.text();
  return { signature, eventType, id, bodyText };
}

function isValidSignature(bodyText: string, signature: string | undefined) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET || "";
  return verifyGitHubSignature(secret, bodyText, signature);
}

function parsePullRequestEventSchema(bodyText: string) {
  const json = JSON.parse(bodyText);
  return PullRequestEventSchema.safeParse(json);
}

async function handlePullRequestEvent(
  event: z.infer<typeof PullRequestEventSchema>
) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL!;
  const slackMessage = formatPRMessage(event);
  await sendSlackMessage(webhookUrl, slackMessage);
  console.log("📨 Sent PR event to Slack.");
}

export const webhookHandler = async (c: Context) => {
  const { signature, eventType, id, bodyText } =
    await getRequestHeadersAndBody(c);

  if (!isValidSignature(bodyText, signature)) {
    console.warn("❌ Invalid signature for delivery", id);
    return c.text("Invalid signature", 401);
  }

  const parsed = parsePullRequestEventSchema(bodyText);
  if (!parsed.success) {
    console.error("❌ Invalid payload", parsed.error.issues);
    return c.text("Invalid payload", 400);
  }

  if (eventType === "pull_request") {
    await handlePullRequestEvent(parsed.data);
  }

  console.log("✅ Valid signature for event:", eventType, "ID:", id);
  return c.json({ ok: true }, 202);
};
