import { useState } from "react";
import { getTicketStatus } from "../services/api";

const STAGES = ["open", "in_progress", "resolved"];
const STAGE_LABELS = { open: "Open", in_progress: "In Progress", resolved: "Resolved" };

export default function TicketTracker() {
  const [open, setOpen] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const check = async (e) => {
    e.preventDefault();
    if (!ticketId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await getTicketStatus(ticketId.trim());
      setResult(data);
    } catch (err) {
      setResult({ found: false });
    } finally {
      setLoading(false);
    }
  };

  const currentStageIndex = result?.found ? STAGES.indexOf(result.status) : -1;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-6 h-6 rounded-full border border-line hover:border-signalBright text-[11px] text-muted hover:text-paper transition-colors flex items-center justify-center"
        title="Track a ticket"
      >
        🎫
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
            <h2 className="font-display text-lg font-semibold text-paper mb-1">Track your ticket</h2>
            <p className="text-xs text-muted mb-5">Enter the ticket ID shown after an escalation</p>

            <form onSubmit={check} className="flex gap-2 mb-5">
              <input
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                placeholder="e.g. 8027d5fc"
                className="flex-1 px-3 py-2.5 rounded-lg bg-graphite border border-line text-paper text-sm outline-none focus:border-signalBright transition-colors font-mono"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 rounded-lg bg-signal hover:bg-signalBright text-paper text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "…" : "Check"}
              </button>
            </form>

            {result && !result.found && (
              <p className="text-sm text-danger font-mono text-center py-4">Ticket not found</p>
            )}

            {result?.found && (
              <div>
                <p className="text-sm text-paper mb-1">{result.subject}</p>
                <p className="text-xs text-muted font-mono mb-5">#{result.ticket_id}</p>

                <div className="flex items-center justify-between">
                  {STAGES.map((stage, i) => (
                    <div key={stage} className="flex-1 flex flex-col items-center relative">
                      {i > 0 && (
                        <div
                          className={`absolute top-2.5 right-1/2 w-full h-0.5 -z-10 ${
                            i <= currentStageIndex ? "bg-signalBright" : "bg-line"
                          }`}
                        />
                      )}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] ${
                          i <= currentStageIndex
                            ? "bg-signalBright border-signalBright text-graphite"
                            : "bg-graphite border-line text-muted"
                        }`}
                      >
                        {i < currentStageIndex ? "✓" : ""}
                      </div>
                      <span className={`text-[10px] font-mono mt-2 text-center ${
                        i <= currentStageIndex ? "text-paper" : "text-muted"
                      }`}>
                        {STAGE_LABELS[stage]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
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