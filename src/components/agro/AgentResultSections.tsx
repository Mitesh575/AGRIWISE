import type { ReactNode } from "react";
import { AlertTriangle, BarChart3, Check, Compass, History, ListChecks } from "lucide-react";
import type { HistoricalEvidenceSummary } from "@/agents/types";

export function ConfidenceMeter({ value, label = "Confidence" }: { value: number; label?: string }) {
  const tone = value >= 85 ? "bg-success" : value >= 65 ? "bg-brand" : "bg-warning";
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-panel p-4">
      <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <BarChart3 size={16} className="text-brand" /> {label}
      </span>
      <div className="flex items-center gap-3">
        <div className="h-2 w-28 overflow-hidden rounded-full bg-border sm:w-36">
          <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max(4, Math.min(100, value))}%` }} />
        </div>
        <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand">{value}%</span>
      </div>
    </div>
  );
}

export function ReasoningBlock({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ResultSection icon={<Compass size={16} />} title="Agent reasoning">
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-6 text-foreground">
            <Check size={15} className="mt-0.5 shrink-0 text-brand" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </ResultSection>
  );
}

export function HistoricalEvidenceBlock({ items }: { items: HistoricalEvidenceSummary[] }) {
  if (items.length === 0) return null;
  return (
    <ResultSection icon={<History size={16} />} title="Historical evidence">
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-border bg-panel-muted p-4">
            <p className="text-sm font-bold text-foreground">{item.summary}</p>
            {item.detail && <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</p>}
          </div>
        ))}
      </div>
    </ResultSection>
  );
}

export function RecommendationBlock({ title = "Recommendation", items }: { title?: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ResultSection icon={<ListChecks size={16} />} title={title}>
      <ol className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm leading-6 text-foreground">
            <span className="display-font mt-px shrink-0 text-xs font-bold text-brand">{String(i + 1).padStart(2, "0")}</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </ResultSection>
  );
}

export function NextActionBlock({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-xl bg-brand px-4 py-4 text-brand-foreground">
      <p className="text-sm font-bold">Next action</p>
      <ul className="mt-2 space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs leading-5 text-brand-foreground/85">• {item}</li>
        ))}
      </ul>
    </div>
  );
}

export function ResultSection({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-panel p-5 sm:p-6">
      <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand">
        {icon} {title}
      </p>
      {children}
    </div>
  );
}

export function AgentErrorNotice({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-warning/35 bg-warning/10 p-5">
      <AlertTriangle size={20} className="mt-0.5 shrink-0 text-warning-foreground" />
      <div>
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
