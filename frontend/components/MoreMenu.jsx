import { useState, useRef, useEffect } from "react";

export default function MoreMenu({ children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-6 h-6 rounded-full border border-line hover:border-signalBright text-muted hover:text-paper transition-colors flex items-center justify-center text-xs"
        title="More options"
      >
        •••
      </button>

      {open && (
        <div className="absolute right-0 top-8 w-48 bg-panel border border-line rounded-lg shadow-panel py-1.5 z-50">
          {children}
        </div>
      )}
    </div>
  );
}