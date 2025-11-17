import type { z } from "zod";
import { PullRequestEventSchema } from "../github/schemas";
import { SlackPRMessage } from "./interfaces/slackPrMessage.interface";

export function formatPRMessage(
  event: z.infer<typeof PullRequestEventSchema>
): SlackPRMessage {
  const pr = event.pull_request;

  return {
    text: `Pull Request ${event.action}: <${pr.html_url}|#${pr.number} - ${pr.title}> by *${pr.user.login}*`,
    attachments: [
      {
        color: "#36a64f",
        fields: [
          {
            title: "Repository",
            value: event.repository.full_name,
            short: true,
          },
          { title: "Action", value: event.action, short: true },
        ],
      },
    ],
  };
}
