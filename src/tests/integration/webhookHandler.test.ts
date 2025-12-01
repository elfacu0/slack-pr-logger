import crypto from "crypto";
import { describe, it, expect, vi } from "vitest";
import "../mocks/firestore";
import app from "../../index";
import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env.test" });

const secret = process.env.GITHUB_WEBHOOK_SECRET || "testsecret";
const webhookUrl =
  process.env.SLACK_WEBHOOK_URL || "http://localhost/webhook/github";

function sign(body: string) {
  return (
    "sha256=" + crypto.createHmac("sha256", secret).update(body).digest("hex")
  );
}

describe("GitHub Webhook Handler", () => {
  it("accepts valid PR payload and sends Slack message", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve("ok"),
    });
    global.fetch = fetchMock;

    const prPayload = {
      action: "opened",
      pull_request: {
        id: 1,
        number: 2,
        title: "Test PR",
        html_url: "https://example.com/pr/2",
        user: { login: "john" },
      },
      repository: {
        name: "repo",
        full_name: "user/repo",
      },
    };
    const encoded = encodeURIComponent(JSON.stringify(prPayload));
    const body = `payload=${encoded}`;

    const req = new Request(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-github-event": "pull_request",
        "x-hub-signature-256": sign(body),
      },
      body,
    });

    const res = await app.request(req);

    expect(res.status).toBe(202);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("rejects invalid signature", async () => {
    const body = "{}";

    const req = new Request(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-github-event": "pull_request",
        "x-hub-signature-256": "sha256=invalid",
      },
      body,
    });

    const res = await app.request(req);

    expect(res.status).toBe(401);
  });
});
