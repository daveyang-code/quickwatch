"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FastForward, Pause, Play } from "lucide-react";
import YouTube, { YouTubePlayer, YouTubeProps } from "react-youtube";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  videoId: string;
  sections: Array<{ start: number; duration: number }>;
}

declare global {
  interface Window {
    ytPlayer?: YouTubePlayer;
    playKeyMoments?: () => void;
  }
}

export default function VideoPlayer({ videoId, sections }: VideoPlayerProps) {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(-1);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  const onReady: YouTubeProps["onReady"] = (event) => {
    playerRef.current = event.target;
    if (typeof window !== "undefined") {
      window.ytPlayer = event.target;
    }
  };

  const cleanup = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const pausePlayback = () => {
    if (!playerRef.current || currentSectionIndex < 0) return;

    cleanup();

    const currentTime = playerRef.current.getCurrentTime();
    const currentSection = sections[currentSectionIndex];
    if (!currentSection) return;

    const endTime = calculateSectionEndTime(currentSectionIndex);
    setRemainingTime(Math.max(0, endTime - currentTime) * 1000);
    playerRef.current.pauseVideo();
    setIsPlaying(false);
  };

  const calculateSectionEndTime = (index: number): number => {
    if (index < 0 || index >= sections.length) return 0;

    const currentSection = sections[index];
    if (!currentSection) return 0;

    if (index < sections.length - 1) {
      const nextSection = sections[index + 1];
      return Math.min(
        currentSection.start + currentSection.duration,
        nextSection.start
      );
    }
    return currentSection.start + currentSection.duration;
  };

  const resumePlayback = () => {
    if (!playerRef.current || currentSectionIndex < 0) return;

    playerRef.current.playVideo();
    setIsPlaying(true);

    cleanup();

    timeoutRef.current = setTimeout(() => {
      const nextIndex = currentSectionIndex + 1;
      if (nextIndex < sections.length) {
        playSection(nextIndex);
      } else {
        stopPlayback();
      }
    }, remainingTime);
  };

  const stopPlayback = () => {
    playerRef.current?.pauseVideo();
    setIsPlaying(false);
    setCurrentSectionIndex(-1);
    cleanup();
  };

  const playSection = (index: number) => {
    if (!playerRef.current || index >= sections.length) {
      stopPlayback();
      return;
    }

    cleanup();

    const section = sections[index];
    if (
      !section ||
      typeof section.start !== "number" ||
      typeof section.duration !== "number"
    ) {
      console.error("Invalid section format at index", index, section);
      playSection(index + 1);
      return;
    }

    setCurrentSectionIndex(index);
    playerRef.current.seekTo(section.start, true);
    playerRef.current.playVideo();
    setIsPlaying(true);

    const endTime = calculateSectionEndTime(index);
    const playbackTime = (endTime - section.start) * 1000;
    setRemainingTime(playbackTime);

    timeoutRef.current = setTimeout(() => {
      const nextIndex = index + 1;
      if (nextIndex < sections.length) {
        playSection(nextIndex);
      } else {
        stopPlayback();
      }
    }, playbackTime);
  };

  const playKeyMoments = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      pausePlayback();
      return;
    }

    if (currentSectionIndex >= 0) {
      resumePlayback();
      return;
    }

    if (sections.length > 0) {
      playSection(0);
    }
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const getButtonContent = () => {
    if (isPlaying) {
      return (
        <>
          <Pause className="mr-2 h-4 w-4" />
          Pause
        </>
      );
    }
    if (currentSectionIndex >= 0) {
      return (
        <>
          <Play className="mr-2 h-4 w-4" />
          Resume
        </>
      );
    }
    return (
      <>
        <FastForward className="mr-2 h-4 w-4" />
        Quick Watch
      </>
    );
  };

  const getButtonVariant = () => {
    if (isPlaying) return "bg-yellow-600 hover:bg-yellow-700";
    if (currentSectionIndex >= 0) return "bg-green-600 hover:bg-green-700";
    return "bg-red-600 hover:bg-red-700";
  };

  return (
    <Card className="overflow-hidden border-slate-200 mb-6">
      <div className="aspect-video bg-black">
        <YouTube
          videoId={videoId}
          opts={{
            height: "100%",
            width: "100%",
            playerVars: {
              autoplay: 0,
              controls: 1,
              modestbranding: 1,
              rel: 0,
            },
          }}
          onReady={onReady}
          className="w-full h-full"
        />
      </div>

      {sections.length > 0 && (
        <CardContent className="px-4 py-3 flex justify-end">
          <Button
            onClick={playKeyMoments}
            className={getButtonVariant()}
            size="sm"
          >
            {getButtonContent()}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
