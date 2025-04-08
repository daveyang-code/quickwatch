import { NextRequest, NextResponse } from "next/server";
import { pruneScript, summarizeTranscript } from "@/lib/gemini";

import { getTranscript } from "@/lib/youtube";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json(
        { message: "Video ID is required" },
        { status: 400 }
      );
    }

    // Get transcript
    const transcript = await getTranscript(videoId);

    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        { message: "Transcript not found for this video" },
        { status: 404 }
      );
    }

    // Process with Gemini
    const summary = await summarizeTranscript(transcript);
    const keyMoments = await pruneScript(transcript);

    return NextResponse.json({
      transcript,
      summary,
      keyMoments,
    });
  } catch (error) {
    console.error("Error processing video:", error);
    return NextResponse.json(
      {
        message: "Failed to process video",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
