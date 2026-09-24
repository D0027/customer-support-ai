const AGENT_LABELS = {
  billing: "Billing",
  technical: "Technical",
  product: "Product",
  complaint: "Complaint",
  faq: "FAQ",
};

const SENTIMENT_COLORS = {
  positive: "text-signalBright",
  neutral: "text-muted",
  negative: "text-amber",
  angry: "text-danger",
};

export default function MetaPanel({ meta }) {
  if (!meta) return null;

  return (
    <div className="border-t border-line bg-graphite/60 px-4 py-2.5 text-xs font-mono flex flex-wrap gap-x-5 gap-y-1.5 items-center">
      {meta.agents?.length > 0 && (
        <span className="flex items-center gap-1.5 text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-signalBright" />
          {meta.agents.map((a) => AGENT_LABELS[a] || a).join(" + ")}
        </span>
      )}
      {meta.sentiment && (
        <span className={`${SENTIMENT_COLORS[meta.sentiment] || "text-muted"}`}>
          {meta.sentiment}
        </span>
      )}
      {meta.escalated && (
        <span className="text-danger flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-danger status-pulse" />
           Escalated{meta.ticketId ? ` · Ticket #${meta.ticketId}` : ""}
        </span>
      )}
      
    </div>
  );
}