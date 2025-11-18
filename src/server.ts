import "dotenv/config";
import app from "./index";
import { serve } from "@hono/node-server";

const port = Number(process.env.PORT) || 8080;
console.log(process.env.PORT);

console.log("Starting DataPipe Hono server on port", port);

serve({ fetch: app.fetch, port });
