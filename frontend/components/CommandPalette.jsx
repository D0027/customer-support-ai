import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";

const QUICK_QUERIES = [
  "What is your refund policy?",
  "My payment failed but the feature is still locked",
  "How do I reset my password?",
  "What laptops do you have available?",
];

export default function CommandPalette({ onNewChat, onSendQuery, onLogout }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  const actions = [
    { label: "New conversation", run: () => onNewChat() },
    { label: "Go to admin dashboard", run: () => router.push("/admin") },
    { label: "Log out", run: () => onLogout() },
  ];

  const filteredActions = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );
  const filteredQueries = QUICK_QUERIES.filter((q) =>
    q.toLowerCase().includes(query.toLowerCase())
  );

  const run = (fn) => {
    fn();
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-panel border border-line rounded-panel shadow-panel overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
          <span className="font-mono text-muted text-sm">⌘K</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search…"
            className="flex-1 bg-transparent outline-none text-sm text-paper placeholder:text-muted"
          />
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredActions.length > 0 && (
            <>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted px-2 py-1.5">Actions</p>
              {filteredActions.map((a) => (
                <button
                  key={a.label}
                  onClick={() => run(a.run)}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-signal/10 text-sm text-paper transition-colors"
                >
                  {a.label}
                </button>
              ))}
            </>
          )}

          {filteredQueries.length > 0 && (
            <>
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted px-2 py-1.5 mt-2">
                Quick questions
              </p>
              {filteredQueries.map((q) => (
                <button
                  key={q}
                  onClick={() => run(() => onSendQuery(q))}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-signal/10 text-sm text-muted transition-colors"
                >
                  {q}
                </button>
              ))}
            </>
          )}

          {filteredActions.length === 0 && filteredQueries.length === 0 && (
            <p className="text-center text-xs text-muted font-mono py-6">No matches</p>
          )}
        </div>
      </div>
    </div>
  );
}