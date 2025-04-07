"use client";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KeyMoment } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KeyMomentsListProps {
  keyMoments: KeyMoment[];
}

export default function KeyMomentsList({ keyMoments }: KeyMomentsListProps) {
  if (!keyMoments || keyMoments.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500">
        No key moments identified
      </div>
    );
  }

  const seekToMoment = (time: number) => {
    if (typeof window !== "undefined" && window.ytPlayer) {
      window.ytPlayer.seekTo(time);
      window.ytPlayer.playVideo();
    } else {
      console.error("YouTube player not available");
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <Clock className="h-5 w-5 mr-2 text-primary" />
          Key Moments
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pt-0">
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {keyMoments.map((moment, index) => (
              <div
                key={index}
                className="border dark:border-slate-800 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary"
                  >
                    {formatTime(moment.startTime)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => seekToMoment(moment.startTime)}
                    className="h-8 w-8 p-0"
                  >
                    <Play className="h-4 w-4" />
                    <span className="sr-only">Play</span>
                  </Button>
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  {moment.text
                    .replace(/&amp;#39;/g, "'")
                    .replace(/&#39;/g, "'")}
                </p>
                {moment.importance && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 italic">
                    {moment.importance}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </>
  );
}
