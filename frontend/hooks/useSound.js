import { useCallback, useRef, useState, useEffect } from "react";

export function useSound() {
  const ctxRef = useRef(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sound_muted");
    setMuted(saved === "true");
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem("sound_muted", String(next));
      return next;
    });
  }, []);

  const getCtx = () => {
    if (!ctxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctxRef.current = new AudioCtx();
    }
    return ctxRef.current;
  };

  const playTone = useCallback((freq, duration, type = "sine", volume = 0.05) => {
    if (muted) return;
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio not available — fail silently
    }
  }, [muted]);

  const playSent = useCallback(() => playTone(720, 0.08, "sine", 0.04), [playTone]);
  const playReceived = useCallback(() => playTone(520, 0.12, "sine", 0.05), [playTone]);
  const playEscalated = useCallback(() => playTone(320, 0.25, "triangle", 0.05), [playTone]);

  return { playSent, playReceived, playEscalated, muted, toggleMute };
}