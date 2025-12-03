import { ReportResult } from "../reports/generateReport";
import { google } from "googleapis";
import path from "path";
import fs from "fs";

export async function storeReportInSheet(report: ReportResult): Promise<void> {
  const SHEET_ID = process.env.GOOGLE_SHEET_ID;
  const SERVICE_ACCOUNT_FILE =
    process.env.GOOGLE_SERVICE_ACCOUNT_FILE ||
    path.resolve(__dirname, "../../sheet-account.json");

  if (
    !SHEET_ID ||
    !SERVICE_ACCOUNT_FILE ||
    !fs.existsSync(SERVICE_ACCOUNT_FILE)
  ) {
    throw new Error(
      "Missing Google Sheet configuration or service account file."
    );
  }

  const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

  const creds = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, "utf-8"));
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: SCOPES,
  });
  const sheets = google.sheets({ version: "v4", auth });

  const prList = report.prs.map((pr) => pr.id || pr.title).join(", ");
  const values = [[report.date, report.count, prList, report.summary]];

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Sheet1!A:D",
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}
