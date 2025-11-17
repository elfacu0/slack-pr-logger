import { Hono } from "hono";
import { webhookHandler } from "./github/webhookHandler";

const app = new Hono();

app.get("/health", (c) => c.text("ok"));

app.post("/webhook/github", webhookHandler);

export default app;
