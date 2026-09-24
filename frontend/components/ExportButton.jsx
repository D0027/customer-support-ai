export default function ExportButton({ messages, sessionId }) {
  const exportChat = () => {
    if (!messages.length) return;

    const lines = messages.map((m) => {
      const speaker = m.role === "user" ? "You" : "Support";
      return `${speaker}: ${m.content}`;
    });

    const header = `TechMart Support — Conversation Export\nSession: ${sessionId}\nExported: ${new Date().toLocaleString()}\n${"=".repeat(50)}\n\n`;
    const content = header + lines.join("\n\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `techmart-chat-${sessionId.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={exportChat}
      disabled={!messages.length}
      className="w-6 h-6 rounded-full border border-line hover:border-signalBright text-[11px] text-muted hover:text-paper transition-colors flex items-center justify-center disabled:opacity-30"
      title="Export conversation"
    >
      ↓
    </button>
  );
}