import { Innertube } from "youtubei.js/web";

export async function getTranscript(videoId: string) {
  try {
    const youtube = await Innertube.create({
      lang: "en",
      location: "US",
      retrieve_player: false,
    });

    const info = await youtube.getInfo(videoId);
    const transcriptData = await info.getTranscript();

    // Check for null/undefined at each level
    if (!transcriptData?.transcript?.content?.body?.initial_segments) {
      throw new Error("Transcript data is not available");
    }

    // Filter and transform the segments
    return (
      transcriptData.transcript.content.body.initial_segments
        .filter(
          // eslint-disable-next-line
          (segment: any) =>
            segment &&
            "snippet" in segment &&
            segment.snippet &&
            typeof segment.snippet.text === "string"
        )
        // eslint-disable-next-line
        .map((segment: any) => ({
          text: segment.snippet.text,
          // Convert string values to numbers and from milliseconds to seconds
          start:
            typeof segment.start_ms === "string"
              ? parseFloat(segment.start_ms) / 1000
              : 0,
          duration:
            typeof segment.duration_ms === "string"
              ? parseFloat(segment.duration_ms) / 1000
              : 0,
        }))
    );
  } catch (error) {
    console.error("Error fetching transcript:", error);
    throw new Error("Failed to fetch video transcript");
  }
}

export const extractVideoId = (url: string): string | false => {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : false;
};

export async function getTranscriptFromUrl(url: string) {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }
  return getTranscript(videoId);
}
