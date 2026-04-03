import { inngest } from "../client";

export const analyzeVideo = inngest.createFunction(
  { id: "analyze-video", name: "Analyze Video Response" },
  { event: "video/analyze" },
  async ({ event }) => {
    const { responseId } = event.data as { responseId: string };

    // TODO: Fetch video URL from response record
    // TODO: Send to Gemini 2.5 Flash for analysis
    // TODO: Extract tags from Gemini response
    // TODO: Write tags to database

    return { responseId, status: "analyzed" };
  }
);
