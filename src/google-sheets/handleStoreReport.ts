import { Context } from "hono";
import { generateReportForDate } from "../reports/generateReport";
import { storeReportInSheet } from "./storeInSheet";

export async function handleStoreReport(c: Context) {
  const reportDate =
    c.req.query("date") || new Date().toISOString().slice(0, 10);
  const result = await generateReportForDate(reportDate);

  if ("error" in result) {
    return c.json({ error: result.error }, 400);
  }

  try {
    await storeReportInSheet(result);
    return c.json({ success: true, stored: true, date: reportDate }, 200);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return c.json({ error: "Failed to store report in sheet: " + errMsg }, 500);
  }
}
