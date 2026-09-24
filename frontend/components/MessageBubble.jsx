import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { submitReaction } from "../services/api";
import SourcesViewer from "./SourcesViewer";
import SpeakButton from "./SpeakButton";

const AGENT_ICONS = {
  billing: "💳",
  technical: "🛠️",
  product: "📦",
  complaint: "⚠️",
  faq: "📋",
};

export default function MessageBubble({ role, content, agent, sessionId, messageIndex, isLastAssistant, onRegenerate, status, sources, confidence, isDuplicate, ticketId }) {
  const isUser = role === "user";
  const primaryAgent = agent?.split(",")[0]?.trim();
  const icon = AGENT_ICONS[primaryAgent];
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState(null);

  const displayTicketId = !isUser && ticketId;

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      // clipboard not available — fail silently
    }
  };

  const react = async (type) => {
    const newReaction = reaction === type ? null : type;
    setReaction(newReaction);
    if (newReaction && sessionId != null && messageIndex != null) {
      try {
        await submitReaction(sessionId, messageIndex, newReaction);
      } catch (e) {
        // fail silently
      }
    }
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3 animate-messageIn gap-2 group`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-signal/15 border border-signal/30 flex items-center justify-center text-sm shrink-0 mt-0.5">
          {icon || "🤖"}
        </div>
      )}
      <div className="relative max-w-[75%]">
        <div
          className={`px-4 py-3 rounded-chat text-[14.5px] leading-relaxed hover-lift ${
            isUser
              ? "bg-signal text-paper rounded-br-sm whitespace-pre-wrap"
              : "bg-panel text-paper border border-line rounded-bl-sm markdown-body"
          }`}
        >
          {isUser ? content : <ReactMarkdown>{content}</ReactMarkdown>}

          {displayTicketId && (
            <div className="mt-2 pt-2 border-t border-line/50 flex items-center gap-2 text-xs">
              <span className="text-amber">🎫</span>
              <span className="text-muted">Ticket referenced:</span>
              <span className="font-mono text-paper">#{ticketId}</span>
            </div>
          )}
          {!isUser && sources?.length > 0 && <SourcesViewer sources={sources} />}
          {!isUser && confidence && (
            <span
               className={`inline-flex items-center gap-1 mt-2 text-[10px] font-mono px-1.5 py-0.5 rounded ${
                confidence === "high"
                ? "bg-signal/10 text-signalBright"
                : confidence === "medium"
                ? "bg-amber/10 text-amber"
                : "bg-danger/10 text-danger"
            }`}
          >
            ● {confidence} confidence
          </span>
          )}

          {isUser && isDuplicate && (
            <div className="flex justify-end mt-1">
              <span className="text-[10px] text-amber font-mono">⟲ asked before</span>
              </div>
          )}


          {isUser && status && (
            <div className="flex justify-end mt-1">
              <span className="text-[10px] text-paper/60 font-mono">
                {status === "sent" && "✓ Sent"}
                {status === "answered" && "✓✓ Answered"}
              </span>
            </div>
          )}
        </div>

        {!isUser && (
          <>
            <button
              onClick={copyText}
              className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-graphite border border-line opacity-0 group-hover:opacity-100 hover:border-signalBright transition-all flex items-center justify-center text-[10px]"
              title="Copy reply"
            >
              {copied ? "✓" : "⧉"}
            </button>

            <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => react("up")}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                  reaction === "up" ? "bg-signal/20 border border-signal" : "hover:bg-panel border border-transparent"
                }`}
                title="Helpful"
              >
                👍
              </button>
              <button
                onClick={() => react("down")}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                  reaction === "down" ? "bg-danger/20 border border-danger" : "hover:bg-panel border border-transparent"
                }`}
                title="Not helpful"
              >
                👎
              </button>
              {isLastAssistant && (
                <button
                  onClick={onRegenerate}
                  className="ml-1 w-6 h-6 rounded-full hover:bg-panel border border-transparent hover:border-line flex items-center justify-center text-xs transition-colors"
                  title="Regenerate response"
                >
                  🔄
                </button>
              )}
              <SpeakButton text={content} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}