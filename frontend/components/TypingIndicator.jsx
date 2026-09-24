export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-panel border border-line rounded-chat rounded-bl-sm px-4 py-3 flex gap-1 items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-signalBright typing-dot" style={{ animationDelay: "0s" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-signalBright typing-dot" style={{ animationDelay: "0.15s" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-signalBright typing-dot" style={{ animationDelay: "0.3s" }} />
      </div>
    </div>
  );
}