import { useEffect, useState } from "react";

const STEPS = [
  {
    title: "Welcome to TechMart Support",
    desc: "Ask anything — billing, technical issues, product questions. Our AI routes you to the right specialist automatically.",
  },
  {
    title: "Your conversation history",
    desc: "Every chat is saved here on the left. Click '+ New conversation' anytime to start fresh.",
  },
  {
    title: "Quick access with ⌘K",
    desc: "Press Ctrl+K (or Cmd+K on Mac) anywhere to open the command palette — jump to new chats, admin panel, or quick questions.",
  },
];

export default function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("onboarding_seen");
    if (!seen) {
      setVisible(true);
    }
  }, []);

  const close = () => {
    localStorage.setItem("onboarding_seen", "true");
    setVisible(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      close();
    }
  };

  if (!visible) return null;
  const current = STEPS[step];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-panel border border-line rounded-panel shadow-panel p-6">
        <div className="flex items-center gap-1.5 mb-5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all ${
                i === step ? "w-6 bg-signalBright" : "w-1.5 bg-line"
              }`}
            />
          ))}
        </div>

        <h2 className="font-display text-lg font-semibold text-paper mb-2">{current.title}</h2>
        <p className="text-sm text-muted leading-relaxed mb-6">{current.desc}</p>

        <div className="flex items-center justify-between">
          <button onClick={close} className="text-xs text-muted hover:text-paper transition-colors font-mono">
            skip
          </button>
          <button
            onClick={next}
            className="px-4 py-2 rounded-lg bg-signal hover:bg-signalBright text-paper text-sm font-medium transition-colors"
          >
            {step < STEPS.length - 1 ? "Next" : "Get started"}
          </button>
        </div>
      </div>
    </div>
  );
}