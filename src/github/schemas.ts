import { z } from "zod";

export const PullRequestEventSchema = z.object({
  action: z.string(),
  pull_request: z.object({
    id: z.number(),
    number: z.number(),
    title: z.string(),
    html_url: z.string().url(),
    user: z.object({
      login: z.string(),
    }),
    merged: z.boolean().optional(),
  }),
  repository: z.object({
    name: z.string(),
    full_name: z.string(),
  }),
});
