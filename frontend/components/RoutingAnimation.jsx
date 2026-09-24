import { useEffect, useState } from "react";

const STAGES = [
  { key: "intent", label: "Detecting intent" },
  { key: "route", label: "Routing to agent(s)" },
  { key: "retrieve", label: "Retrieving context" },
  { key: "generate", label: "Generating response" },
];

export default function RoutingAnimation() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 750);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-start mb-3">
      <div className="bg-panel border border-line rounded-chat rounded-bl-sm px-4 py-3.5 min-w-[220px]">
        <div className="space-y-2">
          {STAGES.map((stage, i) => {
            const done = i < activeIndex;
            const active = i === activeIndex;
            return (
              <div key={stage.key} className="flex items-center gap-2.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300 ${
                    done
                      ? "bg-signalBright"
                      : active
                      ? "bg-amber status-pulse"
                      : "bg-line"
                  }`}
                />
                <span
                  className={`font-mono text-[11px] transition-colors duration-300 ${
                    done ? "text-muted line-through decoration-signalBright/40" : active ? "text-paper" : "text-muted/50"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}