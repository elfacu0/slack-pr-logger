import { Hono } from "hono";
import { webhookHandler } from "./github/webhookHandler";
import { generateReportForDate } from "./reports/generateReport";

const app = new Hono();

app.get("/health", (c) => c.text("ok"));

app.post("/webhook/github", webhookHandler);

app.get("/reports", async (c) => {
  const date = c.req.query("date") || new Date().toISOString().slice(0, 10);
  const result = await generateReportForDate(date);

  if ("error" in result) {
    return c.json({ error: result.error });
  }
  return c.json(result, 200);
});

export default app;
