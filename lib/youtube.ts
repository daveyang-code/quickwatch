import { YoutubeTranscript } from "youtube-transcript";

export async function getTranscript(videoId: string) {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript.map((item) => ({
      text: item.text,
      start: item.offset / 1000, // Convert to seconds
      duration: item.duration / 1000,
    }));
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