import { SlackPRMessage } from "./interfaces/slackPrMessage.interface";

export async function sendSlackMessage(
  webhookUrl: string,
  message: SlackPRMessage
) {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Slack error ${res.status}: ${text}`);
  }
}
