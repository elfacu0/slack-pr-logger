import { describe, it, expect, vi } from "vitest";
import { sendSlackMessage } from "../../slack/sendMessage";

describe("sendSlackMessage", () => {
  it("calls Slack webhook", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve("ok"),
    });

    global.fetch = fetchMock;

    const url = "https://slack.test/webhook";
    const msg = { text: "Hello", attachments: [] };

    await sendSlackMessage(url, msg);

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock).toHaveBeenCalledWith(url, expect.any(Object));
  });

  it("throws on Slack error", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve("Bad req"),
    });

    global.fetch = fetchMock;

    await expect(
      sendSlackMessage("https://slack.test/w", {
        text: "Hi",
        attachments: [],
      }),
    ).rejects.toThrow();
  });
});
