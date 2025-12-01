import type { z } from "zod";

import { verifyGitHubSignature } from "./helper/verifySignature";
import { PullRequestEventSchema } from "../github/schemas";
import { formatPRMessage } from "../slack/formatPRMessage";
import { sendSlackMessage } from "../slack/sendMessage";
import type { Context } from "hono";
import { savePullRequest } from "../storage/storage";
import type { PRInterface } from "./interfaces/pr.interface";

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
  const decodedBody = decodeURIComponent(bodyText.split("=")[1]);
  const json = JSON.parse(decodedBody);
  return PullRequestEventSchema.safeParse(json);
}

async function storePr(event: z.infer<typeof PullRequestEventSchema>) {
  const prToSave: PRInterface = {
    action: event.action,
    author: event.pull_request.user.login,
    id: event.pull_request.id,
    repo: event.repository.full_name,
    title: event.pull_request.title,
    url: event.pull_request.html_url,
  };
  await savePullRequest(prToSave);
}

async function handlePullRequestEvent(
  event: z.infer<typeof PullRequestEventSchema>,
) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL!;
  const slackMessage = formatPRMessage(event);
  await sendSlackMessage(webhookUrl, slackMessage);
  await storePr(event);
  console.log("📨 Sent PR event to Slack.");
}

export const webhookHandler = async (c: Context) => {
  const { signature, eventType, id, bodyText } =
    await getRequestHeadersAndBody(c);
  if (eventType !== "pull_request") return;

  if (!isValidSignature(bodyText, signature)) {
    console.warn("❌ Invalid signature for delivery", id);
    return c.text("Invalid signature", 401);
  }

  const parsed = parsePullRequestEventSchema(bodyText);
  if (!parsed.success) {
    console.error("❌ Invalid payload", parsed.error.issues);
    return c.text("Invalid payload", 400);
  }

  await handlePullRequestEvent(parsed.data);

  console.log("✅ Valid signature for event:", eventType, "ID:", id);
  return c.json({ ok: true }, 202);
};
