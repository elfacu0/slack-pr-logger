import { describe, it, expect } from "vitest";
import { PullRequestEventSchema } from "../../github/schemas";

describe("PullRequestEventSchema", () => {
  const valid = {
    action: "opened",
    pull_request: {
      id: 1,
      number: 10,
      title: "Fix bug",
      html_url: "https://example.com/pr/10",
      user: { login: "jhon" },
      merged: false,
    },
    repository: {
      name: "repo",
      full_name: "user/repo",
    },
  };

  it("validates correct structure", () => {
    expect(PullRequestEventSchema.safeParse(valid).success).toBe(true);
  });

  it("fails on missing fields", () => {
    const bad = { ...valid, pull_request: { title: "nope" } };
    expect(PullRequestEventSchema.safeParse(bad).success).toBe(false);
  });
});
