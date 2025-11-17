import { expect, describe, test } from "vitest";
import app from "../index";

describe("Health check", () => {
  test("GET /health returns ok", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");
  });
});
