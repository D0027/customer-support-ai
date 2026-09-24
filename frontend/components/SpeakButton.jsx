import { useState, useEffect, useRef } from "react";

export default function SpeakButton({ text }) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const utteranceRef = useRef(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const toggleSpeak = () => {
    if (!supported) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    // Strip markdown symbols for cleaner speech
    const cleanText = text
      .replace(/[*_#`]/g, "")
      .replace(/\[([^\]]+)\]/g, "$1")
      .replace(/\n+/g, ". ");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  if (!supported) return null;

  return (
    <button
      onClick={toggleSpeak}
      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
        speaking ? "bg-signal/20 border border-signal text-signalBright" : "hover:bg-panel border border-transparent text-muted"
      }`}
      title={speaking ? "Stop speaking" : "Listen to this reply"}
    >
      {speaking ? "⏸" : "🔊"}
    </button>
  );
}