import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck, Compass, Lightbulb, ShieldCheck, Sprout, Target } from "lucide-react";
import { useState } from "react";
import { BackToFarmTools } from "@/components/agro/BackToFarmTools";
import { NumberField, SelectField } from "@/components/agro/FormFields";
import { ConfidenceMeter, NextActionBlock, RecommendationBlock, ResultSection } from "@/components/agro/AgentResultSections";
import { CHALLENGES, EXPERT_CROPS, FARM_GOALS, getExpertAdvice, GROWTH_STAGES, WATER_ACCESS, type ExpertInput } from "@/data/agri-modules";
import { saveAnalysis } from "@/lib/agri-database";

export const Route = createFileRoute("/expert-advisor")({ head: () => ({ meta: [{ title: "Farm Expert Advisor | AgriWise Connect" }, { name: "description", content: "Decision-support recommendations for efficient farm management." }] }), component: ExpertAdvisorPage });
const initial: ExpertInput = { crop: "", stage: "", goal: "", challenge: "", water: "", area: "" };

function ExpertAdvisorPage() {
  const [input, setInput] = useState<ExpertInput>(initial); const [result, setResult] = useState<ReturnType<typeof getExpertAdvice> | null>(null);
  const set = <K extends keyof ExpertInput>(key: K, value: ExpertInput[K]) => setInput((p) => ({ ...p, [key]: value }));
  const analyze = () => {
    const next = getExpertAdvice(input);
    setResult(next);
    void saveAnalysis({ module: "expert-advisor", title: `Expert advice · ${input.crop}`, input: { ...input }, result: next as unknown as Record<string, unknown> });
  };
  return <main className="min-h-screen bg-background"><div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14"><BackToFarmTools />
    <div className="mt-6 flex items-start gap-4"><span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand"><Compass size={28} /></span><div><h1 className="display-font text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">Farm Expert Advisor</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Turn your crop, farm goal and current challenge into a practical decision checklist for better farming efficiency.</p></div></div>
    <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start"><div className="rounded-2xl border border-border bg-panel p-5 shadow-[0_14px_45px_-32px_var(--foreground)] sm:p-7"><div className="grid grid-cols-2 gap-4">
      <SelectField label="Crop" value={input.crop} onChange={(v) => set("crop", v as ExpertInput["crop"])} options={EXPERT_CROPS} placeholder="Select Crop" /><SelectField label="Growth Stage" value={input.stage} onChange={(v) => set("stage", v as ExpertInput["stage"])} options={GROWTH_STAGES} placeholder="Select Stage" />
      <SelectField label="Primary Goal" value={input.goal} onChange={(v) => set("goal", v as ExpertInput["goal"])} options={FARM_GOALS} placeholder="Select Goal" /><SelectField label="Current Challenge" value={input.challenge} onChange={(v) => set("challenge", v as ExpertInput["challenge"])} options={CHALLENGES} placeholder="Select Challenge" />
      <SelectField label="Water Availability" value={input.water} onChange={(v) => set("water", v as ExpertInput["water"])} options={WATER_ACCESS} placeholder="Select Availability" /><NumberField label="Farm Area" value={input.area} onChange={(v) => set("area", v)} placeholder="2" suffix="acre" min={0.1} />
    </div><button onClick={analyze} disabled={Object.values(input).some((v) => !v)} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 text-sm font-bold text-brand-foreground transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"><Lightbulb size={17} /> Get Expert Recommendations</button></div>
    <div className="space-y-5">{!result && <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-border bg-panel-muted p-10 text-center"><div><Target size={30} className="mx-auto text-brand" /><p className="mt-3 text-sm font-semibold text-foreground">Your farm decision guide will appear here.</p><p className="mt-1 text-xs leading-5 text-muted-foreground">The advisor prioritizes actions instead of giving a one-size-fits-all farming answer.</p></div></div>}
      {result && <><ResultSection icon={<ShieldCheck size={16} />} title="Advisor view"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xl font-bold text-foreground">{result.specialist}</p><p className="mt-1 text-xs text-muted-foreground">{result.priority}</p></div><span className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-bold text-brand">Decision readiness {result.score}%</span></div></ResultSection><ConfidenceMeter value={result.score} label="Decision readiness" /><RecommendationBlock title="Expert action plan" items={result.actions} /><ResultSection icon={<ClipboardCheck size={16} />} title="Decision checkpoints"><div className="grid gap-3 sm:grid-cols-3">{result.decisions.map((d) => <div key={d.label} className="rounded-xl border border-border bg-panel-muted p-4"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{d.label}</p><p className="mt-2 text-sm font-semibold leading-5 text-foreground">{d.value}</p></div>)}</div></ResultSection><NextActionBlock items={["Do a field walk before applying a new input.", "Review the recommendation after 7 days using actual observations and farm records.", result.warning]} /></>}
    </div></div>
    <div className="mt-6 rounded-2xl border border-border bg-panel-muted p-5"><div className="flex items-center gap-2 text-sm font-bold text-foreground"><Sprout size={17} className="text-brand" /> What the advisor considers</div><div className="mt-3 grid gap-3 sm:grid-cols-4"><Small text="Crop + growth stage" /><Small text="Water availability" /><Small text="Farm goal" /><Small text="Current field challenge" /></div></div>
  </div></main>;
}
function Small({ text }: { text: string }) { return <div className="rounded-xl border border-border bg-panel px-3 py-2 text-xs font-semibold text-muted-foreground">{text}</div>; }
