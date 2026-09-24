const SENTIMENT_SCORE = { positive: 4, neutral: 3, negative: 2, angry: 1 };
const SENTIMENT_COLOR = { positive: "bg-signalBright", neutral: "bg-muted", negative: "bg-amber", angry: "bg-danger" };

export default function SentimentTrend({ history }) {
  if (!history || history.length < 2) return null;

  return (
    <div className="px-4 py-2 border-t border-line bg-graphite/40 flex items-center gap-2">
      <span className="text-[10px] font-mono text-muted">mood:</span>
      <div className="flex items-end gap-1 h-6">
        {history.map((s, i) => (
          <div
            key={i}
            className={`w-2 rounded-t ${SENTIMENT_COLOR[s] || "bg-muted"}`}
            style={{ height: `${(SENTIMENT_SCORE[s] || 3) * 6}px` }}
            title={s}
          />
        ))}
      </div>
    </div>
  );
}