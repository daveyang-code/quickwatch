"use client";

import { Card, CardContent } from "@/components/ui/card";
import { FastForward, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { KeyMoment } from "@/types";
import YouTube from "react-youtube";

interface VideoPlayerProps {
  videoId: string;
  keyMoments: KeyMoment[];
}

interface YouTubePlayer {
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getDuration: () => number;
  getCurrentTime: () => number;
  getPlayerState: () => number;
}

declare global {
  interface Window {
    ytPlayer?: YouTubePlayer;
    playKeyMoments?: () => void;
    skipToNextKeyMoment?: () => void;
    stopKeyMoments?: () => void;
  }
}

export default function VideoPlayer({ videoId, keyMoments }: VideoPlayerProps) {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentKeyMomentIndex, setCurrentKeyMomentIndex] =
    useState<number>(-1);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // YouTube player states
  const YT_PLAYING = 1;

  const onReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
    // Make the player accessible globally
    if (typeof window !== "undefined") {
      window.ytPlayer = event.target;
    }

    // Start monitoring player position to keep currentKeyMomentIndex updated
    startProgressTracking();
  };

  const stopPlayback = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPlaying(false);
  };

  // Start monitoring player position to update currentKeyMomentIndex
  const startProgressTracking = () => {
    // Clear any existing interval first
    if (progressCheckIntervalRef.current) {
      clearInterval(progressCheckIntervalRef.current);
    }

    // Check position every 500ms to update the current index
    progressCheckIntervalRef.current = setInterval(() => {
      if (!playerRef.current || keyMoments.length === 0) return;

      const currentTime = playerRef.current.getCurrentTime();

      // Find the current moment based on position
      let newIndex = -1;
      for (let i = keyMoments.length - 1; i >= 0; i--) {
        if (currentTime >= keyMoments[i].startTime) {
          newIndex = i;
          break;
        }
      }

      if (newIndex !== currentKeyMomentIndex) {
        setCurrentKeyMomentIndex(newIndex);
      }
    }, 500);
  };

  // Clear intervals and timeouts when the component unmounts
  useEffect(() => {
    return () => {
      stopPlayback();
      if (progressCheckIntervalRef.current) {
        clearInterval(progressCheckIntervalRef.current);
      }
    };
  }, []);

  const skipToNextKeyMoment = () => {
    if (!playerRef.current || keyMoments.length === 0) return;

    const currentTime = playerRef.current.getCurrentTime();
    let nextIndex = keyMoments.findIndex(
      (moment) => moment.startTime > currentTime
    );

    if (nextIndex === -1) nextIndex = 0; // Loop back to start

    setCurrentKeyMomentIndex(nextIndex);
    playerRef.current.seekTo(keyMoments[nextIndex].startTime, true);
    playerRef.current.playVideo();
  };

  const playKeyMoments = () => {
    if (!playerRef.current || keyMoments.length === 0 || isPlaying) return;

    // Stop any existing playback first
    stopPlayback();
    setIsPlaying(true);

    const playSegment = (index: number) => {
      if (!playerRef.current || index >= keyMoments.length) {
        setIsPlaying(false);
        return;
      }

      setCurrentKeyMomentIndex(index);
      const moment = keyMoments[index];
      playerRef.current.seekTo(moment.startTime, true);
      playerRef.current.playVideo();

      // Calculate segment duration
      const segmentDuration = moment.endTime
        ? moment.endTime - moment.startTime
        : Math.min(60, playerRef.current.getDuration() - moment.startTime);

      // Clear any existing timeout before setting a new one
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        // Check if video is still playing before moving to next segment
        if (
          playerRef.current &&
          playerRef.current.getPlayerState() === YT_PLAYING
        ) {
          playSegment(index + 1);
        } else {
          // If video was paused by the user, stop the auto-playback sequence
          stopPlayback();
        }
      }, segmentDuration * 1000);
    };

    playSegment(0);
  };

  // Make methods available globally
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.playKeyMoments = playKeyMoments;
      window.skipToNextKeyMoment = skipToNextKeyMoment;
      window.stopKeyMoments = stopPlayback;
    }

    return () => {
      if (typeof window !== "undefined") {
        delete window.playKeyMoments;
        delete window.skipToNextKeyMoment;
        delete window.stopKeyMoments;
      }
    };
  }, [keyMoments, isPlaying]); // Add isPlaying to deps to ensure global methods use current state

  return (
    <Card className="overflow-hidden border-slate-200 dark:border-slate-800 mb-6">
      <div className="aspect-video bg-black">
        <YouTube
          videoId={videoId}
          id="video-player"
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

      {keyMoments.length > 0 && (
        <CardContent className="px-4 py-3 flex justify-end">
          {/* <Button onClick={skipToNextKeyMoment} variant="outline" size="sm">
            <SkipForward className="mr-2 h-4 w-4" />
            Next Key Moment
          </Button> */}
          <div>
            {isPlaying ? (
              <Button onClick={stopPlayback} variant="outline" size="sm">
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            ) : (
              <Button
                onClick={playKeyMoments}
                className="bg-red-600 hover:bg-red-700"
                size="sm"
              >
                <FastForward className="mr-2 h-4 w-4" />
                Quick Watch
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
