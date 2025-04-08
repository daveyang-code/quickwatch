import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";

import { TranscriptItem } from "@/types";

const API_KEY = process.env.GEMINI_API_KEY || "";

// Initialize Gemini
let genAI: GoogleGenerativeAI;
let model: GenerativeModel;

try {
  genAI = new GoogleGenerativeAI(API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
} catch (error) {
  console.error("Failed to initialize Gemini:", error);
}

export async function summarizeTranscript(
  transcript: TranscriptItem[]
): Promise<string> {
  if (!model) {
    throw new Error("Gemini model not initialized");
  }

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

export async function pruneScript(
  transcript: TranscriptItem[]
): Promise<number[]> {
  if (!model) throw new Error("Gemini model not initialized");

  const prompt = `
    AGGRESSIVELY reduce this transcript to only the ABSOLUTELY ESSENTIAL lines while maintaining proper sentence structure and meaning.
    The goal is to create a concise summary of the content, while still preserving the overall context and flow of the conversation.
    Return ONLY a JSON array of line indices to KEEP, like [0, 15, 30].
    NO explanations, just numbers.

    Transcript:
    ${transcript.map((item, i) => `[${i}] ${item.text}`).join("\n")}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();
    const indices = JSON.parse(response.match(/\[[\d,\s]*\]/)?.[0] || "[]");
    return indices;
  } catch {
    return [];
  }
}
