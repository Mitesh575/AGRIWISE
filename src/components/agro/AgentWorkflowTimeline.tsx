import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

export function useWorkflowProgress(stepCount: number, running: boolean, stepMs = 420) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!running) {
      setIndex(0);
      return;
    }
    const id = window.setInterval(() => {
      setIndex((i) => (i < stepCount - 1 ? i + 1 : i));
    }, stepMs);
    return () => window.clearInterval(id);
  }, [running, stepCount, stepMs]);

  return index;
}

export function AgentWorkflowTimeline({ steps, currentIndex }: { steps: string[]; currentIndex: number }) {
  return (
    <div className="rounded-2xl border border-border bg-panel p-5 sm:p-6">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-brand">Agent workflow</p>
      <ol className="space-y-3">
        {steps.map((step, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <li key={step} className="flex items-center gap-3">
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors ${
                  done ? "bg-brand text-brand-foreground" : active ? "bg-brand/90 text-brand-foreground" : "bg-panel-muted text-muted-foreground"
                }`}
              >
                {done ? <Check size={13} /> : active ? <Loader2 size={13} className="animate-spin" /> : i + 1}
              </span>
              <span className={`text-sm ${done ? "text-foreground" : active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                {step}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
