"use client";

import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

interface VideoFormProps {
  onSubmit: (url: string) => Promise<void>;
  isLoading: boolean;
}

export default function VideoForm({ onSubmit, isLoading }: VideoFormProps) {
  const [url, setUrl] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(url);
  };

  return (
    <Card className="shadow-md border-slate-200 dark:border-slate-800">
      <CardContent className="pt-6">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube URL"
              className="pl-10"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
          >
            {isLoading ? "Processing..." : "Analyze Video"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
