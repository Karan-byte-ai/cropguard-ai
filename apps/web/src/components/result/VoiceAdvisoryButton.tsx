"use client";

import * as React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceAdvisoryButtonProps {
  textToSpeak: string;
  locale: string;
}

export function VoiceAdvisoryButton({ textToSpeak, locale }: VoiceAdvisoryButtonProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isSupported, setIsSupported] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
    }
  }, []);

  const handleToggleSpeak = () => {
    if (!isSupported) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Map locale to BCP 47 tag
    if (locale === "hi") utterance.lang = "hi-IN";
    else if (locale === "mr") utterance.lang = "mr-IN";
    else utterance.lang = "en-IN";

    utterance.rate = 0.95; // Slightly slower for clear comprehension

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  React.useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isSupported) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggleSpeak}
      className={`gap-1.5 text-xs ${
        isPlaying ? "border-crop-500 text-crop-700 bg-crop-50 dark:bg-crop-950/40" : ""
      }`}
    >
      {isPlaying ? (
        <>
          <VolumeX className="h-4 w-4 text-crop-600 animate-pulse" />
          <span>Stop Audio</span>
        </>
      ) : (
        <>
          <Volume2 className="h-4 w-4 text-crop-600" />
          <span>Listen to Advisory</span>
        </>
      )}
    </Button>
  );
}
