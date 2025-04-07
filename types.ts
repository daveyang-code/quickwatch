export interface TranscriptItem {
    text: string;
    start: number;
    duration: number;
  }
  
  export interface KeyMoment {
    startTime: number;
    endTime: number;
    text: string;
    importance?: string;
  }