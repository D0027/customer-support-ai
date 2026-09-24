import { useEffect, useRef } from "react";
import { useRouter } from "next/router";

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_MS = 28 * 60 * 1000; // warn at 28 minutes

export function useSessionTimeout(onWarning) {
  const router = useRouter();
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);

  useEffect(() => {
    const resetTimers = () => {
      clearTimeout(timeoutRef.current);
      clearTimeout(warningRef.current);

      warningRef.current = setTimeout(() => {
        onWarning?.();
      }, WARNING_MS);

      timeoutRef.current = setTimeout(() => {
        localStorage.removeItem("access_token");
        router.push("/login?timeout=1");
      }, TIMEOUT_MS);
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetTimers));
    resetTimers();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimers));
      clearTimeout(timeoutRef.current);
      clearTimeout(warningRef.current);
    };
  }, [router, onWarning]);
}