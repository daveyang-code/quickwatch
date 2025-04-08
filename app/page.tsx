"use client";

import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import SummaryCard from "@/components/SummaryCard";
import Transcript from "@/components/Transcript";
import { TranscriptItem } from "@/types";
import VideoForm from "@/components/VideoForm";
import VideoPlayer from "@/components/VideoPlayer";
import { extractVideoId } from "@/lib/youtube";
import { useState } from "react";

export default function Home() {
  const [videoId, setVideoId] = useState<string>("");
  const [transcript, setTranscript] = useState<TranscriptItem[] | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [keyMoments, setKeyMoments] = useState<number[]>([]);
  const [sections, setSections] = useState<
    Array<{ start: number; duration: number }>
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (url: string) => {
    setIsLoading(true);

    const id = extractVideoId(url);
    if (!id) {
      setIsLoading(false);
      return;
    }

    setVideoId(id);

    try {
      const response = await fetch("/api/process-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId: id }),
      });

      if (!response.ok) {
        throw new Error("Failed to process video");
      }

      const data = await response.json();
      setTranscript(data.transcript);
      setSummary(data.summary);
      setKeyMoments(data.keyMoments);

      const keyMomentSections = data.keyMoments.map((keyMoment: number) => {
        const transcriptItem = data.transcript[keyMoment];
        return {
          start: transcriptItem.start,
          duration: transcriptItem.duration,
        };
      });
      setSections(keyMomentSections);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto py-10 px-4 max-w-7xl">
        <h1 className="text-4xl font-bold text-center mb-6 text-slate-900 dark:text-white">
          Quick Watch
        </h1>

        <VideoForm onSubmit={handleSubmit} isLoading={isLoading} />

        {isLoading && (
          <div className="flex justify-center items-center my-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Processing video content...</span>
          </div>
        )}

        {videoId && !isLoading && (
          <div className="mt-10 grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <VideoPlayer videoId={videoId} sections={sections} />
              {summary && <SummaryCard summary={summary} />}
            </div>
            <div>
              <Card className="pt-6">
                {transcript && keyMoments.length > 0 && (
                  <Transcript
                    transcript={keyMoments.map((index) => transcript[index])}
                  />
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
