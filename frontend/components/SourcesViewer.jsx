import { useState } from "react";

export default function SourcesViewer({ sources }) {
  const [open, setOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-2 text-[11px] font-mono text-signalBright hover:underline flex items-center gap-1"
      >
        📄 {sources.length} source{sources.length > 1 ? "s" : ""} used
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-panel border border-line rounded-panel shadow-panel p-6 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-lg font-semibold text-paper mb-4">Retrieved sources</h2>
            <div className="space-y-3">
              {sources.map((s, i) => (
                <div key={i} className="bg-graphite border border-line rounded-lg p-3">
                  <p className="text-[10px] font-mono text-amber mb-1.5">{s.source}</p>
                  <p className="text-xs text-muted leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-full mt-5 py-2.5 rounded-lg border border-line hover:border-signalBright transition-colors text-sm text-muted"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}