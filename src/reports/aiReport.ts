import type { PRInterface } from "../github/interfaces/pr.interface";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function generateDailyPrReport(
  prs: PRInterface[],
): Promise<string> {
  if (!GEMINI_API_KEY) {
    return "AI reporting is not configured (missing GEMINI_API_KEY).";
  }

  if (!prs.length) {
    return "No pull requests were found for this date.";
  }

  const prompt = [
    "You are an assistant that writes concise daily engineering PR summaries for Slack.",
    "Use clear language, highlight key changes, risk areas, and reviewers' workload.",
    "Keep it under 250 words.",
    "",
    "Generate a daily report summarizing the following pull requests.",
    "For each repo, mention how many PRs there were and notable work.",
    "Format with short paragraphs and bullet points when helpful.",
    "",
    "Pull requests JSON:",
    JSON.stringify(prs, null, 2),
  ].join("\n");

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
    encodeURIComponent(GEMINI_API_KEY);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 600,
        },
      }),
    });

    if (!response.ok) {
      console.error(
        "Failed to call Gemini API:",
        response.status,
        await response.text(),
      );
      return "Failed to generate AI report.";
    }

    const json = (await response.json()) as {
      candidates?: {
        content?: {
          parts?: Array<{
            text?: string;
            inlineData?: { data?: string };
          }>;
        };
      }[];
    };

    if (!json?.candidates || json.candidates.length === 0) return "Error ";

    const content =
      json.candidates?.[0]?.content?.parts?.[0]?.text ||
      json.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!content) {
      return "AI report was empty.";
    }

    return content.trim();
  } catch (error) {
    console.error("Error while generating AI report (Gemini):", error);
    return "An error occurred while generating the AI report.";
  }
}
