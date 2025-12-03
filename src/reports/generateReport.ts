import { PRInterface } from "../github/interfaces/pr.interface";
import { getPullRequestsByDate } from "../storage/storage";
import { generateDailyPrReport } from "./aiReport";

export interface ReportResult {
  date: string;
  count: number;
  prs: PRInterface[];
  summary: string;
  status: number;
}

interface ReportError {
  error: string;
  status: number;
}

export async function generateReportForDate(
  date: string,
): Promise<ReportResult | ReportError> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return {
      error: "Invalid date format. Use YYYY-MM-DD.",
      status: 400,
    };
  }

  const prs = await getPullRequestsByDate(date);
  const summary = await generateDailyPrReport(prs);

  return {
    date,
    count: prs.length,
    prs,
    summary,
    status: 200,
  };
}
