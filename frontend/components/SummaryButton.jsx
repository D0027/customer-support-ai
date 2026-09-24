import { useState } from "react";
import { getSessionSummary } from "../services/api";

export default function SummaryButton({ sessionId, messageCount }) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setOpen(true);
    if (summary) return;
    setLoading(true);
    try {
      const data = await getSessionSummary(sessionId);
      setSummary(data.summary);
    } catch (err) {
      setSummary("Unable to generate summary right now.");
    } finally {
      setLoading(false);
    }
  };

  if (messageCount < 4) return null;

  return (
    <>
      <button
        onClick={handleClick}
        className="w-6 h-6 rounded-full border border-line hover:border-signalBright text-[11px] text-muted hover:text-paper transition-colors flex items-center justify-center"
        title="Summarize this conversation"
      >
        📝
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-panel border border-line rounded-panel shadow-panel p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-lg font-semibold text-paper mb-4">Conversation summary</h2>
            {loading ? (
              <p className="text-sm text-muted font-mono">Generating…</p>
            ) : (
              <p className="text-sm text-paper leading-relaxed">{summary}</p>
            )}
            <button
              onClick={() => setOpen(false)}
              className="w-full mt-6 py-2.5 rounded-lg border border-line hover:border-signalBright transition-colors text-sm text-muted"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}