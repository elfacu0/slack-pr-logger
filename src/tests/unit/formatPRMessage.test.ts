import { describe, it, expect } from "vitest";
import { formatPRMessage } from "../../slack/formatPRMessage";

const mockEvent = {
  action: "opened",
  pull_request: {
    id: 1,
    number: 10,
    title: "Add new endpoint",
    html_url: "https://github.com/test/pr/10",
    user: { login: "alice" },
  },
  repository: {
    name: "repo",
    full_name: "team/repo",
  },
};

describe("formatPRMessage", () => {
  it("formats a Slack message correctly", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const msg = formatPRMessage(mockEvent as any);

    expect(msg.text).toContain("opened");
    expect(msg.text).toContain("Add new endpoint");
    expect(msg.text).toContain("alice");
    expect(msg.attachments[0].fields[0].value).toBe("team/repo");
  });
});
