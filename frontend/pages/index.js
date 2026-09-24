import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useChat } from "../hooks/useChat";
import MessageBubble from "../components/MessageBubble";
import RoutingAnimation from "../components/RoutingAnimation";
import ChatInput from "../components/ChatInput";
import MetaPanel from "../components/MetaPanel";
import Sidebar from "../components/Sidebar";
import { submitFeedback } from "../services/api";
import CommandPalette from "../components/CommandPalette";
import ThemeToggle from "../components/ThemeToggle";
import ShortcutsPanel from "../components/ShortcutsPanel";
import ExportButton from "../components/ExportButton";
import OnboardingTour from "../components/OnboardingTour";
import LanguageToggle from "../components/LanguageToggle";
import { useLanguage } from "../context/LanguageContext";
import SoundToggle from "../components/SoundToggle";
import PrintButton from "../components/PrintButton";
import TicketTracker from "../components/TicketTracker";
import MoreMenu from "../components/MoreMenu";
import OfflineBanner from "../components/OfflineBanner";
import { useSessionTimeout } from "../hooks/useSessionTimeout";
import { usePersona } from "../context/PersonaContext";
import SummaryButton from "../components/SummaryButton";
import SentimentTrend from "../components/SentimentTrend";
import { pingPresence } from "../services/api";
import HomeButton from "../components/HomeButton";

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { t } = useLanguage();
  const { personaName, updatePersonaName, resetPersonaName } = usePersona();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/welcome");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  const { sessionId, messages, isTyping, lastMeta, send, switchSession, startNewChat, muted, toggleMute, regenerate, cancelNudge, sentimentHistory } = useChat();
  const scrollRef = useRef(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const autoScrollRef = useRef(true);
  const [showJumpButton, setShowJumpButton] = useState(false);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFile, setDroppedFile] = useState(null);

  useEffect(() => {
    autoScrollRef.current = autoScroll;
  }, [autoScroll]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isScrollable = el.scrollHeight > el.clientHeight + 40;

    if (autoScrollRef.current) {
      el.scrollTo({ top: el.scrollHeight });
      setShowJumpButton(false);
    } else if (isScrollable) {
      setShowJumpButton(true);
    }
  }, [messages, isTyping]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 80) {
      autoScrollRef.current = true;
      setAutoScroll(true);
      setShowJumpButton(false);
    }
  };

  const jumpToBottom = () => {
    autoScrollRef.current = true;
    setAutoScroll(true);
    setShowJumpButton(false);
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => {
    setFeedbackSent(false);
    autoScrollRef.current = true;
    setAutoScroll(true);
    setShowJumpButton(false);
  }, [sessionId]);

  const rate = async (rating) => {
    if (!sessionId) return;
    await submitFeedback(sessionId, rating, "");
    setFeedbackSent(true);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setDroppedFile(file);
  };

  useSessionTimeout(() => setShowTimeoutWarning(true));

  useEffect(() => {
  pingPresence().catch(() => {});
  const interval = setInterval(() => pingPresence().catch(() => {}), 20000);
  return () => clearInterval(interval);
}, []);

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-graphite flex items-center justify-center">
        <p className="text-muted text-sm font-mono">Checking session…</p>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>{personaName}</title>
      </Head>
      <main className="min-h-screen bg-graphite grid-texture flex items-center justify-center p-4">
        <div
          className="w-full max-w-4xl h-[85vh] glass-panel rounded-panel overflow-hidden flex border border-line shadow-panel relative"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 z-50 bg-signal/10 border-2 border-dashed border-signalBright rounded-panel flex items-center justify-center pointer-events-none">
              <div className="bg-panel border border-line rounded-lg px-6 py-4 text-center">
                <div className="text-2xl mb-2">📎</div>
                <p className="text-sm text-paper font-medium">Drop file to attach</p>
              </div>
            </div>
          )}
          <OfflineBanner />
          <div className="mobile-hide-sidebar md:block">
              <Sidebar currentSessionId={sessionId} onSelectSession={switchSession} onNewChat={startNewChat} />
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <header className="px-5 py-4 bg-graphite border-b border-line flex items-center justify-between">
              <div>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          updatePersonaName(nameInput);
                          setEditingName(false);
                        }
                      }}
                      onBlur={() => {
                        updatePersonaName(nameInput);
                        setEditingName(false);
                      }}
                      className="font-display text-lg font-semibold bg-transparent border-b border-signalBright outline-none text-paper w-32"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        resetPersonaName();
                        setEditingName(false);
                      }}
                      className="text-[10px] text-muted hover:text-danger font-mono transition-colors"
                      title="Reset to default name"
                    >
                      reset
                    </button>
                  </div>
                ) : (
                  <h1
                    onClick={() => {
                      setNameInput(personaName);
                      setEditingName(true);
                    }}
                    className="font-display text-lg font-semibold leading-tight text-paper cursor-pointer hover:text-signalBright transition-colors"
                    title="Click to rename your assistant"
                  >
                    {personaName}
                  </h1>
                )}
                <p className="text-xs text-muted font-mono">multi-agent · billing · technical · product</p>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle />

                <MoreMenu>
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted">Options</div>
                  <div className="flex flex-wrap items-center gap-1.5 px-3 pb-2">
                    <LanguageToggle />
                    <SoundToggle muted={muted} onToggle={toggleMute} />
                    <button
                      onClick={() => setShortcutsOpen(true)}
                      className="w-6 h-6 rounded-full border border-line hover:border-signalBright text-[11px] font-mono text-muted hover:text-paper transition-colors flex items-center justify-center"
                      title="Keyboard shortcuts"
                    >
                      ?
                    </button>
                    <ExportButton messages={messages} sessionId={sessionId} />
                    <PrintButton messages={messages} sessionId={sessionId} />
                    <TicketTracker />
                    <SummaryButton sessionId={sessionId} messageCount={messages.length} />
                  </div>
                </MoreMenu>

                <button
                  onClick={() => router.push("/profile")}
                  className="w-6 h-6 rounded-full bg-signal/20 border border-signal/40 flex items-center justify-center text-[10px] font-mono text-signalBright hover:bg-signal/30 transition-colors"
                  title="Your profile"
                >
                  👤
                </button>

                <button onClick={logout} className="text-xs text-muted hover:text-paper transition-colors font-mono">
                  {t("logout")}
                </button>
                <span className="w-2 h-2 rounded-full bg-signalBright status-pulse shadow-glow" title="Online" />
              </div>
            </header>

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              onWheel={() => { autoScrollRef.current = false; setAutoScroll(false); }}
              onTouchMove={() => { autoScrollRef.current = false; setAutoScroll(false); }}
              className="flex-1 overflow-y-auto px-4 py-4 relative"
            >
              {messages.length === 0 && (
                <div className="empty-state text-center text-muted text-sm mt-16 font-mono flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-signal/10 border border-signal/20 flex items-center justify-center text-xl">
                    💬
                  </div>
                  {t("emptyChat")}
                </div>
              )}
              {messages.map((m, i) => (
                <MessageBubble
                  key={i}
                  role={m.role}
                  content={m.content}
                  agent={m.agent}
                  sessionId={sessionId}
                  messageIndex={i}
                  isLastAssistant={m.role === "assistant" && i === messages.length - 1}
                  onRegenerate={regenerate}
                  status={
                    m.role === "user"
                      ? (i < messages.length - 1 || !isTyping) && messages[i + 1]?.role === "assistant"
                        ? "answered"
                        : "sent"
                      : undefined
                  }
                  sources={m.role === "assistant" && i === messages.length - 1 && !m.content.startsWith("Still there?") ? lastMeta?.sources : undefined}
                  confidence={m.role === "assistant" && i === messages.length - 1 && !m.content.startsWith("Still there?") ? lastMeta?.confidence : undefined}
                  isDuplicate={m.isDuplicate}
                  ticketId={m.ticketId}
                />
              ))}
              {isTyping && <RoutingAnimation />}

              {showJumpButton && (
                <button
                  onClick={jumpToBottom}
                  className="sticky bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-signal hover:bg-signalBright text-paper text-xs font-mono shadow-panel flex items-center gap-1.5 mx-auto"
                >
                  ↓ New messages
                </button>
              )}
            </div>

            <MetaPanel meta={lastMeta} />
            <SentimentTrend history={sentimentHistory} />

            {lastMeta && !feedbackSent && (
              <div className="px-4 py-2 bg-graphite/60 border-t border-line flex items-center gap-2 text-xs text-muted font-mono">
                <span>{t("wasHelpful")}</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => rate(n)}
                    className="w-6 h-6 rounded-full border border-line hover:bg-signal hover:text-paper hover:border-signal transition-colors"
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}

            {lastMeta?.suggestions?.length > 0 && !isTyping && (
              <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-line bg-graphite/40">
                {lastMeta.suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s)}
                    className="px-3 py-1.5 rounded-full border border-line hover:border-signalBright hover:bg-signal/5 text-xs text-muted hover:text-paper transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

          <div onFocus={cancelNudge}>
            <ChatInput onSend={send} disabled={isTyping} droppedFile={droppedFile} onDroppedFileHandled={() => setDroppedFile(null)} />
           </div>
          </div>
        </div>

        <CommandPalette onNewChat={startNewChat} onSendQuery={(q) => send(q)} onLogout={logout} />
        <ShortcutsPanel
          open={shortcutsOpen}
          onToggle={() => setShortcutsOpen((prev) => !prev)}
          onClose={() => setShortcutsOpen(false)}
        />
        <OnboardingTour />
        {showTimeoutWarning && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-panel border border-line rounded-panel p-6 text-center">
              <div className="text-2xl mb-3">⏱</div>
              <h2 className="font-display text-lg font-semibold text-paper mb-2">Still there?</h2>
              <p className="text-sm text-muted mb-6">You'll be logged out in 2 minutes due to inactivity.</p>
              <button
                onClick={() => setShowTimeoutWarning(false)}
                className="w-full py-2.5 rounded-lg bg-signal hover:bg-signalBright text-paper text-sm font-medium transition-colors"
              >
                I'm still here
              </button>
            </div>
          </div>
        )}
      </main>
      <HomeButton />
    </>
  );
}