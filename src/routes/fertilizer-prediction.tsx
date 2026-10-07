import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FlaskConical, CalendarClock } from "lucide-react";
import { BackToFarmTools } from "@/components/agro/BackToFarmTools";
import { AgentErrorBoundary } from "@/components/agro/AgentErrorBoundary";
import { NumberField, SelectField } from "@/components/agro/FormFields";
import { AgentWorkflowTimeline, useWorkflowProgress } from "@/components/agro/AgentWorkflowTimeline";
import { ReasoningBlock, HistoricalEvidenceBlock, NextActionBlock, AgentErrorNotice, ResultSection } from "@/components/agro/AgentResultSections";
import { runFertilizerAgent, type FertilizerAgentInput, type FertilizerAgentResult, type NutrientStatus } from "@/agents/fertilizerAgent";
import { runAgentSafely, type AgentResponse } from "@/agents/types";
import { REGIONS, SOIL_TYPES, CROPS } from "@/data/agri-history";

export const Route = createFileRoute("/fertilizer-prediction")({
  head: () => ({
    meta: [
      { title: "Fertilizer Prediction | AgriWise Connect" },
      { name: "description", content: "Get crop-specific fertilizer recommendations based on soil nutrients and historical agricultural data." },
    ],
  }),
  component: FertilizerPredictionPage,
});

const WORKFLOW_STEPS = [
  "Validating soil inputs",
  "Retrieving historical fertilizer records",
  "Comparing nutrient levels to historical ranges",
  "Reasoning over comparable fields",
  "Building the fertilizer plan",
];

const STATUS_TONE: Record<NutrientStatus, string> = {
  LOW: "bg-danger/15 text-danger",
  MEDIUM: "bg-warning/20 text-warning-foreground",
  HIGH: "bg-success/15 text-success",
};

const initialInput: FertilizerAgentInput = {
  crop: "", nitrogen: "", phosphorus: "", potassium: "", ph: "", soilType: "", region: "", areaAcres: "1",
};

function FertilizerPredictionPage() {
  const [input, setInput] = useState<FertilizerAgentInput>(initialInput);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AgentResponse<FertilizerAgentResult> | null>(null);
  const stepIndex = useWorkflowProgress(WORKFLOW_STEPS.length, loading);

  const set = <K extends keyof FertilizerAgentInput>(key: K, value: FertilizerAgentInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const analyze = () => {
    setLoading(true);
    setResponse(null);
    window.setTimeout(() => {
      const res = runAgentSafely(() => runFertilizerAgent(input));
      setErrors(res.fieldErrors ?? {});
      setResponse(res);
      setLoading(false);
    }, WORKFLOW_STEPS.length * 420 + 200);
  };

  const result = response?.status === "ok" ? response.result : undefined;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <BackToFarmTools />

        <div className="mt-6 flex items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-soft text-3xl text-brand">🧪</span>
          <div>
            <h1 className="display-font text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">Fertilizer Prediction</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Get crop-specific fertilizer recommendations based on soil nutrients and historical agricultural data.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="rounded-2xl border border-border bg-panel p-5 shadow-[0_14px_45px_-32px_var(--foreground)] sm:p-7">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Soil parameters</p>
            <div className="grid grid-cols-2 gap-4">
              <NumberField label="Nitrogen (N)" value={input.nitrogen} onChange={(v) => set("nitrogen", v)} error={errors["nitrogen"]} />
              <NumberField label="Phosphorus (P)" value={input.phosphorus} onChange={(v) => set("phosphorus", v)} error={errors["phosphorus"]} />
              <NumberField label="Potassium (K)" value={input.potassium} onChange={(v) => set("potassium", v)} error={errors["potassium"]} />
              <NumberField label="Soil pH" value={input.ph} onChange={(v) => set("ph", v)} error={errors["ph"]} step={0.1} />
            </div>

            <p className="mb-3 mt-6 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Crop & field</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <SelectField label="Crop" value={input.crop} onChange={(v) => set("crop", v as FertilizerAgentInput["crop"])} options={CROPS} error={errors["crop"]} placeholder="Select Crop" />
              </div>
              <SelectField label="Soil Type" value={input.soilType} onChange={(v) => set("soilType", v as FertilizerAgentInput["soilType"])} options={SOIL_TYPES} error={errors["soilType"]} placeholder="Select Soil Type" />
              <SelectField label="Region" value={input.region} onChange={(v) => set("region", v as FertilizerAgentInput["region"])} options={REGIONS} error={errors["region"]} placeholder="Select Region" />
              <NumberField label="Area" value={input.areaAcres} onChange={(v) => set("areaAcres", v)} error={errors["areaAcres"]} suffix="Acre" />
            </div>

            <button
              onClick={analyze}
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 text-sm font-bold text-brand-foreground transition hover:brightness-95 disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? "Generating plan…" : "Generate Fertilizer Plan"}
            </button>
          </div>

          <div className="space-y-5">
            {loading && <AgentWorkflowTimeline steps={WORKFLOW_STEPS} currentIndex={stepIndex} />}

            {!loading && !response && (
              <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-border bg-panel-muted p-10 text-center text-sm text-muted-foreground">
                Your fertilizer plan will appear here.
              </div>
            )}

            {!loading && response && response.status !== "ok" && (
              <AgentErrorNotice
                title={response.status === "invalid_input" ? "Check the highlighted fields" : response.status === "error" ? "The agent hit a snag" : "Not enough evidence yet"}
                message={response.message ?? "Something went wrong while building your fertilizer plan."}
              />
            )}

            {!loading && result && response && (
              <AgentErrorBoundary>
                <ResultSection icon={<FlaskConical size={16} />} title={`Current soil status · ${result.crop}`}>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {([
                      ["Nitrogen", result.nutrientStatus.nitrogen],
                      ["Phosphorus", result.nutrientStatus.phosphorus],
                      ["Potassium", result.nutrientStatus.potassium],
                    ] as [string, NutrientStatus][]).map(([label, status]) => (
                      <div key={label} className="rounded-xl border border-border bg-panel-muted p-3 text-center">
                        <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
                        <span className={`mt-1.5 inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_TONE[status]}`}>{status}</span>
                      </div>
                    ))}
                    <div className="rounded-xl border border-border bg-panel-muted p-3 text-center">
                      <p className="text-[11px] font-semibold text-muted-foreground">pH</p>
                      <p className="mt-1.5 display-font text-lg font-semibold text-foreground">{result.nutrientStatus.ph}</p>
                    </div>
                  </div>
                </ResultSection>

                <ResultSection icon={<FlaskConical size={16} />} title="Recommended fertilizer plan">
                  <div className="space-y-3">
                    {result.plan.map((item) => (
                      <div key={item.fertilizer} className="rounded-xl border border-border bg-panel-muted p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-foreground">{item.fertilizer}</p>
                          <span className="text-xs font-bold text-brand">{item.kgPerAcre} kg / acre</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Total for {result.areaAcres} acre(s): {item.totalKg} kg</p>
                        <p className="mt-1 text-xs font-semibold text-foreground">{item.application}</p>
                      </div>
                    ))}
                  </div>
                </ResultSection>

                <ResultSection icon={<CalendarClock size={16} />} title="Application schedule">
                  <div className="flex flex-col gap-2">
                    {result.schedule.map((s, i) => (
                      <div key={s.day} className="flex items-center gap-3">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-brand-foreground">{i + 1}</span>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.1em] text-brand">{s.day}</p>
                          <p className="text-sm text-foreground">{s.action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ResultSection>

                <ReasoningBlock items={response.reasoning ?? []} />
                <HistoricalEvidenceBlock items={response.historicalEvidence ?? []} />
                <NextActionBlock items={response.nextAction ?? []} />
              </AgentErrorBoundary>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
