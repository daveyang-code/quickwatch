import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Define transcript type
type TranscriptEntry = {
  text: string;
  start: number;
  duration: number;
};

// Define key moment type
type KeyMoment = {
  startTime: number;
  endTime?: number;
  text: string;
  importance: string;
};

export async function summarizeTranscript(
  transcript: TranscriptEntry[]
): Promise<string> {
  const fullText = transcript.map((item) => item.text).join(" ");

  const prompt = `
    Below is a transcript from a YouTube video. Please provide a concise summary (150-200 words) that captures the main points and key insights:
    
    ${fullText}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error in Gemini summarization:", error);
    throw new Error("Failed to summarize transcript");
  }
}

export async function identifyKeyMoments(
  transcript: TranscriptEntry[]
): Promise<KeyMoment[]> {
  const fullText = transcript
    .map((item) => `[${item.start}] ${item.text}`)
    .join("\n");

  const prompt = `
    Below is a timestamped transcript from a YouTube video. Please identify the 5-7 most important segments that capture the key points, insights or valuable information. 
    
    For each segment, provide:
    1. The start time in seconds
    2. A brief description of why this segment is important
    3. The text of the segment
    
    Format your response as JSON array like this:
    [
      {
        "startTime": 120,
        "endTime": 145, 
        "text": "Brief description of this key moment",
        "importance": "Why this segment is important"
      }
    ]
    
    Transcript:
    ${fullText}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;

    // Extract the JSON from the response
    const responseText = response.text();
    const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);

    if (!jsonMatch) {
      throw new Error("Failed to parse key moments from Gemini response");
    }

    const keyMoments: KeyMoment[] = JSON.parse(jsonMatch[0]);

    // Ensure proper formatting and find end times
    return keyMoments.map((moment, index, array): KeyMoment => {
      if (!moment.endTime) {
        moment.endTime =
          index < array.length - 1
            ? array[index + 1].startTime
            : moment.startTime + 30;
      }
      return moment;
    });
  } catch (error) {
    console.error("Error in Gemini key moments identification:", error);
    throw new Error("Failed to identify key moments");
  }
}
