import { useEffect, useState, useMemo } from "react";
import { fetchSessions, deleteSession, toggleSessionPin, updateSessionTag } from "../services/api";
import { useLanguage } from "../context/LanguageContext";

const TAGS = ["", "Billing", "Technical", "Urgent", "Resolved"];

export default function Sidebar({ currentSessionId, onSelectSession, onNewChat }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    fetchSessions()
      .then(setSessions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentSessionId]);

  const filteredSessions = useMemo(() => {
    if (!query.trim()) return sessions;
    return sessions.filter((s) => s.preview.toLowerCase().includes(query.toLowerCase()));
  }, [sessions, query]);

  const pinnedSessions = filteredSessions.filter((s) => s.pinned);
  const otherSessions = filteredSessions.filter((s) => !s.pinned);

  const handleDelete = async (sessionId) => {
    await deleteSession(sessionId);
    setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
    setConfirmId(null);
    if (sessionId === currentSessionId) {
      onNewChat();
    }
  };

  const handlePin = async (sessionId, e) => {
    e.stopPropagation();
    const result = await toggleSessionPin(sessionId);
    setSessions((prev) =>
      prev.map((s) => (s.session_id === sessionId ? { ...s, pinned: result.pinned } : s))
    );
  };

  const handleTagChange = async (sessionId, tag, e) => {
    e.stopPropagation();
    await updateSessionTag(sessionId, tag);
    setSessions((prev) => prev.map((s) => (s.session_id === sessionId ? { ...s, tag } : s)));
  };

  const renderSession = (s) => (
    <div
      key={s.session_id}
      className={`group relative rounded-lg mb-1 transition-colors ${
        s.session_id === currentSessionId
          ? "bg-panel border border-signal/40"
          : "hover:bg-panel/60 border border-transparent"
      }`}
    >
      {confirmId === s.session_id ? (
        <div className="px-3 py-2.5 flex items-center justify-between gap-2">
          <span className="text-[11px] text-muted">Delete this chat?</span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => handleDelete(s.session_id)}
              className="w-6 h-6 rounded-full bg-danger/20 border border-danger text-danger text-[10px] flex items-center justify-center"
            >
              ✓
            </button>
            <button
              onClick={() => setConfirmId(null)}
              className="w-6 h-6 rounded-full border border-line text-muted text-[10px] flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => onSelectSession(s.session_id)} className="w-full text-left px-3 py-2.5 pr-14">
          <p className="text-xs text-paper truncate">{s.preview}</p>
          <div className="flex items-center gap-1.5 mt-1">
            {s.tag && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-signal/10 text-signalBright font-mono">
                {s.tag}
              </span>
            )}
            <select
              value={s.tag || ""}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => handleTagChange(s.session_id, e.target.value, e)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] bg-graphite border border-line rounded px-1 py-0.5 text-muted outline-none"
            >
              {TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag || "No tag"}
                </option>
              ))}
            </select>
          </div>
        </button>
      )}

      {confirmId !== s.session_id && (
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          <button
            onClick={(e) => handlePin(s.session_id, e)}
            className={`w-6 h-6 rounded-full transition-all flex items-center justify-center text-xs ${
              s.pinned ? "opacity-100 text-amber" : "opacity-0 group-hover:opacity-100 hover:bg-panel text-muted hover:text-amber"
            }`}
            title={s.pinned ? "Unpin" : "Pin conversation"}
          >
            {s.pinned ? "★" : "☆"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setConfirmId(s.session_id);
            }}
            className="w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 hover:bg-danger/10 text-muted hover:text-danger transition-all flex items-center justify-center text-xs"
            title="Delete conversation"
          >
            🗑
          </button>
        </div>
      )}
    </div>
  );

  return (
    <aside className="w-60 shrink-0 bg-graphite border-r border-line flex flex-col h-full">
      <div className="p-3 border-b border-line space-y-2">
        <button
          onClick={onNewChat}
          className="w-full py-2.5 rounded-lg border border-line hover:border-signalBright hover:bg-signal/5 transition-all text-sm font-medium flex items-center justify-center gap-2"
        >
          {t("newConversation")}
        </button>

        {sessions.length > 0 && (
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats…"
            className="w-full px-3 py-2 rounded-lg bg-panel border border-line text-xs text-paper outline-none focus:border-signalBright transition-colors placeholder:text-muted"
          />
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading && <p className="text-xs text-muted px-2 font-mono">Loading…</p>}

        {!loading && pinnedSessions.length > 0 && (
          <>
            <p className="font-mono text-[10px] uppercase tracking-wider text-amber px-2 py-2">★ Pinned</p>
            {pinnedSessions.map(renderSession)}
          </>
        )}

        {!loading && (
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted px-2 py-2">{t("recent")}</p>
        )}
        {!loading && otherSessions.length === 0 && pinnedSessions.length === 0 && (
          <p className="text-xs text-muted px-2 font-mono">{query ? "No matches" : t("noConversations")}</p>
        )}
        {otherSessions.map(renderSession)}
      </div>
    </aside>
  );
}