import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import client, { updateTicketStatus, getCannedResponses, createCannedResponse, deleteCannedResponse, getAuditLog, getKbGaps, getCustomerHealth, getOnlineAdmins, getAbTestResults  } from "../services/api";
import HomeButton from "../components/HomeButton";

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCount, setNewCount] = useState(0);
  const lastSeenRef = useRef(null);
  const [responseTimeTrend, setResponseTimeTrend] = useState([]);
  const [cannedResponses, setCannedResponses] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [auditLog, setAuditLog] = useState([]);
  const [kbGaps, setKbGaps] = useState([]);
  const [customerHealth, setCustomerHealth] = useState([]);
  const [onlineAdmins, setOnlineAdmins] = useState([]);
  const [abResults, setAbResults] = useState(null);

  const fetchData = () => {
    Promise.all([
      client.get("/analytics/summary").then((r) => r.data),
      client.get("/admin/tickets").then((r) => r.data),
      client.get("/analytics/response-times").then((r) => r.data),
    ])
      .then(([s, t, rt]) => {
        setSummary(s);

        const openCount = t.filter((tk) => tk.status === "open").length;
        if (lastSeenRef.current !== null && openCount > lastSeenRef.current) {
          setNewCount((prev) => prev + (openCount - lastSeenRef.current));
        }
        lastSeenRef.current = openCount;

        setTickets(t);
        setResponseTimeTrend(rt);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    getCannedResponses().then(setCannedResponses).catch(() => {});
  }, []);

  useEffect(() => {
    getAuditLog().then(setAuditLog).catch(() => {});
  }, [tickets, cannedResponses]);

  useEffect(() => {
    getKbGaps().then(setKbGaps).catch(() => {});
  }, [tickets]);

  useEffect(() => {
    getCustomerHealth().then(setCustomerHealth).catch(() => {});
  }, [tickets]);

  useEffect(() => {
  getAbTestResults().then(setAbResults).catch(() => {});
  }, [tickets]);

  useEffect(() => {
    getOnlineAdmins().then(setOnlineAdmins).catch(() => {});
  const interval = setInterval(() => getOnlineAdmins().then(setOnlineAdmins).catch(() => {}), 10000);
  return () => clearInterval(interval);
  }, []);

  const handleAddCanned = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    const created = await createCannedResponse(newTitle, newContent);
    setCannedResponses((prev) => [...prev, created]);
    setNewTitle("");
    setNewContent("");
  };

  const handleDeleteCanned = async (id) => {
    await deleteCannedResponse(id);
    setCannedResponses((prev) => prev.filter((r) => r.id !== id));
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    await updateTicketStatus(ticketId, newStatus);
    setTickets((prev) =>
      prev.map((t) => (t.ticket_id === ticketId ? { ...t, status: newStatus } : t))
    );
  };

  const maxUsage = summary?.agent_usage
    ? Math.max(...Object.values(summary.agent_usage), 1)
    : 1;

  const maxResponseMs =
    responseTimeTrend.length > 0
      ? Math.max(...responseTimeTrend.map((x) => x.avg_ms), 1)
      : 1;

  return (
    <>
      <Head>
        <title>Analytics — TechMart Support</title>
      </Head>
      <main className="min-h-screen bg-graphite grid-texture p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-signalBright status-pulse" />
            <span className="font-mono text-xs tracking-widest text-muted uppercase">Live Console</span>
            {newCount > 0 && (
              <button
                onClick={() => setNewCount(0)}
                className="ml-2 px-2 py-0.5 rounded-full bg-danger text-paper text-[10px] font-mono font-semibold"
              >
                +{newCount} new
              </button>
            )}
            {onlineAdmins.length > 0 && (
              <span className="ml-2 text-[10px] font-mono text-signalBright flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-signalBright status-pulse" />
                {onlineAdmins.length} online: {onlineAdmins.map((a) => a.name).join(", ")}
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl font-semibold text-paper mb-8">Support Analytics</h1>

          {loading && <p className="text-muted text-sm font-mono">Loading…</p>}

          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard label="Conversations" value={summary.total_conversations} accent="signal" />
              <StatCard
                label="Avg. Satisfaction"
                value={summary.avg_satisfaction ? summary.avg_satisfaction.toFixed(1) + " / 5" : "—"}
                accent="amber"
              />
              <StatCard label="Open Tickets" value={tickets.filter((t) => t.status === "open").length} accent="danger" />
              <StatCard label="Total Tickets" value={tickets.length} accent="muted" />
              <StatCard label="👍 Helpful" value={summary.thumbs_up || 0} accent="signal" />
              <StatCard label="👎 Not helpful" value={summary.thumbs_down || 0} accent="danger" />
            </div>
          )}

          {summary?.agent_usage && (
            <div className="bg-panel rounded-panel border border-line p-6 mb-6">
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted mb-5">Agent Usage</h2>
              <div className="space-y-4">
                {Object.entries(summary.agent_usage).map(([agent, count]) => (
                  <div key={agent} className="flex items-center gap-4">
                    <span className="w-20 text-sm text-paper capitalize font-mono">{agent}</span>
                    <div className="flex-1 h-1.5 bg-graphite rounded-full overflow-hidden">
                      <div
                        className="h-full bg-signalBright rounded-full transition-all"
                        style={{ width: `${(count / maxUsage) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted font-mono w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {responseTimeTrend.length > 0 && (
            <div className="bg-panel rounded-panel border border-line p-6 mb-6">
              <h2 className="font-mono text-xs uppercase tracking-wider text-muted mb-5">Response Time (last 7 days)</h2>
              <div className="flex items-end gap-2 h-32">
                {responseTimeTrend.map((d) => {
                  const barHeightPx = Math.max((d.avg_ms / maxResponseMs) * 96, 8);
                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full">
                      <span className="text-[10px] text-muted font-mono">{(d.avg_ms / 1000).toFixed(1)}s</span>
                      <div
                        className="w-full max-w-[32px] bg-signalBright rounded-t"
                        style={{ height: barHeightPx + "px" }}
                      />
                      <span className="text-[9px] text-muted font-mono">{d.date.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-panel rounded-panel border border-line p-6 mb-6">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted mb-5">Recent Escalation Tickets</h2>
            {tickets.length === 0 && <p className="text-sm text-muted font-mono">No tickets yet.</p>}
            <div className="space-y-1">
              {tickets.slice(0, 10).map((t) => (
                <div key={t.ticket_id} className="flex items-center justify-between text-sm border-b border-line py-3 last:border-0 gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-amber text-xs shrink-0">#{t.ticket_id}</span>
                    {t.sla_deadline && t.status !== "resolved" && (
                      <SlaBadge deadline={t.sla_deadline} />
                    )}
                    <span className="text-paper truncate">{t.subject}</span>
                  </div>
                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChange(t.ticket_id, e.target.value)}
                    className={`text-xs font-mono px-2.5 py-1.5 rounded-full capitalize outline-none cursor-pointer shrink-0 ${
                      t.status === "open"
                        ? "bg-danger/10 text-danger border border-danger/30"
                        : t.status === "in_progress"
                        ? "bg-amber/10 text-amber border border-amber/30"
                        : "bg-signal/10 text-signalBright border border-signal/30"
                    }`}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-panel rounded-panel border border-line p-6">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted mb-5">Canned Responses</h2>

            <form onSubmit={handleAddCanned} className="mb-5 space-y-2">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Title (e.g. Refund policy quick reply)"
                className="w-full px-3 py-2 rounded-lg bg-graphite border border-line text-sm text-paper outline-none focus:border-signalBright"
              />
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Response text…"
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-graphite border border-line text-sm text-paper outline-none focus:border-signalBright resize-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-signal hover:bg-signalBright text-paper text-sm font-medium transition-colors"
              >
                Save response
              </button>
            </form>

            <div className="space-y-2">
              {cannedResponses.map((r) => (
                <div key={r.id} className="flex items-start justify-between gap-3 border-b border-line py-2.5 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm text-paper font-medium">{r.title}</p>
                    <p className="text-xs text-muted truncate">{r.content}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCanned(r.id)}
                    className="text-muted hover:text-danger text-xs shrink-0"
                  >
                    🗑
                  </button>
                </div>
              ))}
              {cannedResponses.length === 0 && <p className="text-xs text-muted font-mono">No saved responses yet.</p>}
            </div>
          </div>
          <div className="bg-panel rounded-panel border border-line p-6 mt-6">
             <h2 className="font-mono text-xs uppercase tracking-wider text-muted mb-5">Audit Log</h2>
             {auditLog.length === 0 && <p className="text-xs text-muted font-mono">No actions logged yet.</p>}
             <div className="space-y-2 max-h-64 overflow-y-auto">
              {auditLog.map((log, i) => (
                <div key={i} className="flex items-center justify-between text-xs border-b border-line py-2 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-signalBright font-mono shrink-0">{log.action.replace(/_/g, " ")}</span>
                    <span className="text-muted truncate">{log.details}</span>
                  </div>
                   <span className="text-muted font-mono shrink-0 ml-2">
                    {new Date(log.timestamp).toLocaleTimeString()}
                 </span>
                </div>
                ))}
             </div>
          </div>
             {kbGaps.length > 0 && (
              <div className="bg-panel rounded-panel border border-line p-6 mt-6">
                <h2 className="font-mono text-xs uppercase tracking-wider text-muted mb-2">Knowledge Base Gaps</h2>
                <p className="text-[11px] text-muted mb-5">Queries the AI answered with low confidence — consider adding documentation for these.</p>
                <div className="space-y-2">
                  {kbGaps.map((g, i) => (
                    <div key={i} className="flex items-center justify-between text-xs border-b border-line py-2 last:border-0 gap-3">
                    <span className="text-paper truncate">{g.query}</span>
                    <span className="text-amber font-mono shrink-0">{g.agent}</span>
                </div>
              ))}
           </div>
         </div>
        )}

      {customerHealth.length > 0 && (
        <div className="bg-panel rounded-panel border border-line p-6 mt-6">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted mb-5">Customer Health</h2>
          <div className="space-y-2">
            {customerHealth.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs border-b border-line py-2.5 last:border-0 gap-3">
                <div className="min-w-0">
                  <p className="text-paper font-medium truncate">{c.name}</p>
                  <p className="text-muted truncate">{c.total_messages} messages{c.avg_rating ? ` · ${c.avg_rating}/5 avg` : ""}</p>
          </div>
          <span className={`text-[10px] font-mono px-2 py-1 rounded-full shrink-0 ${
            c.risk === "high"
            ? "bg-danger/10 text-danger"
            : c.risk === "medium"
            ? "bg-amber/10 text-amber"
            : "bg-signal/10 text-signalBright"
          }`}>
            {c.risk} risk · {c.score}
         </span>
        </div>
        ))}
      </div>
    </div>
    )}
    {abResults && (
  <div className="bg-panel rounded-panel border border-line p-6 mt-6">
    <h2 className="font-mono text-xs uppercase tracking-wider text-muted mb-2">A/B Test — FAQ Agent Prompt</h2>
    <p className="text-[11px] text-muted mb-5">Variant A: formal tone · Variant B: warm/personable tone</p>
    <div className="grid grid-cols-2 gap-4">
      {["A", "B"].map((v) => {
        const r = abResults[v];
        const positiveRate = r.total > 0 ? Math.round((r.up / r.total) * 100) : 0;
        return (
          <div key={v} className="bg-graphite border border-line rounded-lg p-4">
            <p className="text-sm font-semibold text-paper mb-2">Variant {v}</p>
            <p className="text-2xl font-display text-signalBright">{positiveRate}%</p>
            <p className="text-[10px] text-muted font-mono">{r.up}👍 {r.down}👎 · {r.total} shown</p>
          </div>
        );
      })}
    </div>
  </div>
)}
  </div>
  </main>
  <HomeButton />
   </>
  );
}

function StatCard({ label, value, accent }) {
  const accentColor = {
    signal: "text-signalBright",
    amber: "text-amber",
    danger: "text-danger",
    muted: "text-paper",
  }[accent];

  return (
    <div className="bg-panel rounded-panel border border-line p-5">
      <p className="text-xs font-mono uppercase tracking-wider text-muted mb-2">{label}</p>
      <p className={`font-display text-3xl font-semibold ${accentColor}`}>{value}</p>
    </div>
  );
}


function SlaBadge({ deadline }) {
  const [remaining, setRemaining] = useState("");
  const [breached, setBreached] = useState(false);

  useEffect(() => {
    const update = () => {
      const diff = new Date(deadline) - new Date();
      if (diff <= 0) {
        setBreached(true);
        setRemaining("Breached");
      } else {
        const hrs = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        setRemaining(`${hrs}h ${mins}m left`);
      }
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
      breached ? "bg-danger/20 text-danger" : "bg-graphite text-muted"
    }`}>
      {remaining}
    </span>
  );
}