"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { FileText } from "lucide-react";

interface SummaryCardProps {
  summary: string;
}

export default function SummaryCard({ summary }: SummaryCardProps) {
  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="pb-3 flex flex-row items-center">
        <FileText className="h-5 w-5 mr-2 text-primary" />
        <CardTitle className="text-xl">Video Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {summary
            .split(" ")
            .map((word, index) =>
              word.startsWith("**") && word.endsWith("**") ? (
              <strong key={index}>{word.slice(2, -2)}</strong>
              ) : word.startsWith("*") && word.endsWith("*") ? (
              <em key={index}>{word.slice(1, -1)}</em>
              ) : (
              `${word} `
              )
            )}
        </p>
      </CardContent>
    </Card>
  );
}
