import { useEffect } from "react";

const SHORTCUTS = [
  { keys: ["Ctrl", "K"], desc: "Open command palette" },
  { keys: ["?"], desc: "Show this shortcuts panel" },
  { keys: ["Esc"], desc: "Close any open panel" },
  { keys: ["Enter"], desc: "Send message" },
];

export default function ShortcutsPanel({ open, onToggle, onClose }) {
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isTyping = tag === "input" || tag === "textarea";

      if (e.key === "?" && !isTyping) {
        e.preventDefault();
        onToggle();
      }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onToggle, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-panel border border-line rounded-panel shadow-panel p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-semibold text-paper mb-5">Keyboard shortcuts</h2>
        <div className="space-y-3">
          {SHORTCUTS.map((s) => (
            <div key={s.desc} className="flex items-center justify-between">
              <span className="text-sm text-muted">{s.desc}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="px-2 py-1 rounded-md bg-graphite border border-line font-mono text-xs text-paper"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-6 py-2.5 rounded-lg border border-line hover:border-signalBright transition-colors text-sm text-muted"
        >
          Close
        </button>
      </div>
    </div>
  );
}