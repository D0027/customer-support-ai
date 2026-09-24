import { useState, useEffect, useCallback, useRef } from "react";
import { fetchHistory, streamChatMessage } from "../services/api";
import { useSound } from "./useSound";

function getOrCreateSessionId() {
  if (typeof window === "undefined") return null;
  let id = localStorage.getItem("session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("session_id", id);
  }
  return id;
}

export function useChat() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [lastMeta, setLastMeta] = useState(null);
  const { playSent, playReceived, muted, toggleMute } = useSound();
  const [sentimentHistory, setSentimentHistory] = useState([]);
  const lastSentRef = useRef(0);

  const loadSession = useCallback((id) => {
    setSessionId(id);
    setMessages([]);
    setLastMeta(null);
    if (id) {
      fetchHistory(id)
        .then((hist) => {
          if (hist?.messages?.length) {
            setMessages(hist.messages.map((m) => ({ role: m.role, content: m.content, agent: m.agent, ticketId: m.ticket_id })));
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const id = getOrCreateSessionId();
    loadSession(id);
  }, [loadSession]);

  const switchSession = useCallback(
    (id) => {
      localStorage.setItem("session_id", id);
      loadSession(id);
    },
    [loadSession]
  );

  const startNewChat = useCallback(() => {
    const id = crypto.randomUUID();
    localStorage.setItem("session_id", id);
    loadSession(id);
  }, [loadSession]);

  const send = useCallback(
    async (text, attachment) => {
      if ((!text.trim() && !attachment) || !sessionId) return;

      const now = Date.now();
      if (now - lastSentRef.current < 2000) {
        return; // ignore if sent less than 2s ago
      }
      lastSentRef.current = now;

      const isDuplicate = messages
         .filter((m) => m.role === "user")
         .some((m) => m.content.trim().toLowerCase() === text.trim().toLowerCase());

      setMessages((prev) => [...prev, { role: "user", content: text, attachmentName: attachment?.filename, isDuplicate }]);
      playSent();
      setIsTyping(true);

      const actualMessage = attachment
        ? `${text}\n\n[User attached an image: ${attachment.filename}]${attachment.description ? `\nImage content: ${attachment.description}` : ""}`
        : text;

      let fullText = "";
      let revealedText = "";
      let placeholderAdded = false;
      let agentName = "faq";
      let revealTimer = null;

      const startReveal = () => {
        if (revealTimer) return;
        revealTimer = setInterval(() => {
          if (revealedText.length < fullText.length) {
            revealedText = fullText.slice(0, revealedText.length + 2);
            setMessages((prev) => {
              if (!placeholderAdded) {
                placeholderAdded = true;
                return [...prev, { role: "assistant", content: revealedText, agent: agentName }];
              }
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: revealedText, agent: agentName };
              return updated;
            });
          }
        }, 15);
      };

      try {
        await streamChatMessage(
          sessionId,
          actualMessage,
          (chunk) => {
            fullText += chunk;
            setIsTyping(false);
            startReveal();
          },
          () => {
            const checkDone = setInterval(() => {
              if (revealedText.length >= fullText.length) {
                clearInterval(checkDone);
                clearInterval(revealTimer);
                playReceived();
                setLastMeta({
                  agents: [agentName],
                  sentiment: null,
                  escalated: false,
                  ticketId: null,
                  sources: [],
                });
              }
            }, 50);
          },
          (meta) => {
            if (meta?.agents_invoked?.length) {
              agentName = meta.agents_invoked[0];
            }
          }
          ,
          (items) => {
             setLastMeta((prev) => ({ ...(prev || {}), suggestions: items }));
            }
          ,
          (sourceItems) => {
              setLastMeta((prev) => ({ ...(prev || {}), sources: sourceItems }));
            }

          ,
          (confidenceLevel) => {
            setLastMeta((prev) => ({ ...(prev || {}), confidence: confidenceLevel }));
          }

          ,
          (sentimentLevel) => {
            setSentimentHistory((prev) => [...prev, sentimentLevel]);
          }
          
          ,
          (ticketId) => {
            setLastMeta((prev) => ({ ...(prev || {}), escalated: true, ticketId }));
          }
        );
      } catch (err) {
        const isRateLimit = err?.message?.includes("429");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: isRateLimit
              ? "You're sending messages too fast — please wait a moment."
              : "Sorry, something went wrong reaching support. Please try again.",
          },
        ]);
      } finally {
        setIsTyping(false);
        scheduleNudge();
      }
    },
    [sessionId, playSent, playReceived, messages]
  );

const nudgeTimerRef = useRef(null);

const scheduleNudge = useCallback(() => {
  clearTimeout(nudgeTimerRef.current);
  nudgeTimerRef.current = setTimeout(() => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant" && !last.content.includes("Still there")) {
        return [
          ...prev,
          { role: "assistant", content: "Still there? Let me know if you need anything else, or if this resolved your issue." },
        ];
      }
      return prev;
    });
  }, 45000);
}, []);

const cancelNudge = useCallback(() => {
  clearTimeout(nudgeTimerRef.current);
}, []);


  const regenerate = useCallback(() => {
    setMessages((prev) => {
      if (prev.length < 2) return prev;
      const lastUserMsgIndex = [...prev].reverse().findIndex((m) => m.role === "user");
      if (lastUserMsgIndex === -1) return prev;
      const actualIndex = prev.length - 1 - lastUserMsgIndex;
      const lastUserText = prev[actualIndex].content;

      const trimmed = prev.slice(0, actualIndex + 1);

      setTimeout(() => send(lastUserText), 0);
      return trimmed;
    });
  }, [send]);

  return { sessionId, messages, isTyping, lastMeta, send, switchSession, startNewChat, muted, toggleMute, regenerate, cancelNudge, sentimentHistory };
}