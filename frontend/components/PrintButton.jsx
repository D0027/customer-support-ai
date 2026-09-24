export default function PrintButton({ messages, sessionId }) {
  const handlePrint = () => {
    if (!messages.length) return;

    const printWindow = window.open("", "_blank");
    const rows = messages
      .map((m) => {
        const speaker = m.role === "user" ? "You" : "TechMart Support";
        const align = m.role === "user" ? "right" : "left";
        return `
          <div style="margin-bottom:16px; text-align:${align};">
            <div style="font-size:11px; color:#666; margin-bottom:4px; font-family:monospace;">${speaker}</div>
            <div style="display:inline-block; max-width:75%; padding:10px 14px; border-radius:10px; background:${m.role === "user" ? "#f0f0f0" : "#fff"}; border:1px solid #ddd; text-align:left; white-space:pre-wrap; font-size:13px; line-height:1.5;">
              ${m.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
            </div>
          </div>
        `;
      })
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>TechMart Support — Conversation</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #14171C; max-width: 700px; margin: 0 auto; }
            h1 { font-size: 18px; margin-bottom: 4px; }
            .meta { font-size: 11px; color: #888; margin-bottom: 24px; font-family: monospace; }
            @media print { body { padding: 16px; } }
          </style>
        </head>
        <body>
          <h1>TechMart Support — Conversation Transcript</h1>
          <div class="meta">Session: ${sessionId}<br/>Printed: ${new Date().toLocaleString()}</div>
          ${rows}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  return (
    <button
      onClick={handlePrint}
      disabled={!messages.length}
      className="w-6 h-6 rounded-full border border-line hover:border-signalBright text-[11px] text-muted hover:text-paper transition-colors flex items-center justify-center disabled:opacity-30"
      title="Print conversation"
    >
      🖨
    </button>
  );
}