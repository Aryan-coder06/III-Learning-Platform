"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type TranscriptChunk = {
  text: string;
  startedAtMs: number | null;
  endedAtMs: number | null;
};

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: {
    transcript: string;
  };
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
};

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

export function useLiveTranscript(onChunk?: (chunk: TranscriptChunk) => void) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [supported] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  });
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setRunning(false);
  }, []);

  const start = useCallback(() => {
    if (typeof window === "undefined") return;
    const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!RecognitionCtor) {
      setError("Browser speech recognition is not available.");
      return;
    }

    setError(null);
    const recognition = new RecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const now = Date.now();
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (!result?.isFinal) continue;
        const transcript = `${result[0]?.transcript || ""}`.trim();
        if (!transcript) continue;
        onChunk?.({
          text: transcript,
          startedAtMs: null,
          endedAtMs: now,
        });
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const msg = event?.error ? `Speech error: ${event.error}` : "Speech recognition error.";
      setError(msg);
      setRunning(false);
    };

    recognition.onend = () => {
      setRunning(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setRunning(true);
  }, [onChunk]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  return {
    supported,
    running,
    error,
    start,
    stop,
  };
}
