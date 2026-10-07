import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sprout, Wheat } from "lucide-react";
import { BackToFarmTools } from "@/components/agro/BackToFarmTools";
import { AgentErrorBoundary } from "@/components/agro/AgentErrorBoundary";
import { NumberField, SelectField } from "@/components/agro/FormFields";
import { AgentWorkflowTimeline, useWorkflowProgress } from "@/components/agro/AgentWorkflowTimeline";
import { ConfidenceMeter, ReasoningBlock, HistoricalEvidenceBlock, RecommendationBlock, NextActionBlock, AgentErrorNotice, ResultSection } from "@/components/agro/AgentResultSections";
import { runCropAgent, type CropAgentInput } from "@/agents/cropAgent";
import { runAgentSafely, type AgentResponse } from "@/agents/types";
import type { CropAgentResult } from "@/agents/cropAgent";
import { REGIONS, SOIL_TYPES, SEASONS } from "@/data/agri-history";

export const Route = createFileRoute("/crop-prediction")({
  head: () => ({
    meta: [
      { title: "Crop Prediction | AgriWise Connect" },
      { name: "description", content: "AI-powered crop suitability analysis based on soil, climate and historical agricultural data." },
    ],
  }),
  component: CropPredictionPage,
});

const WORKFLOW_STEPS = [
  "Validating field inputs",
  "Retrieving historical agricultural records",
  "Comparing against successful cultivation conditions",
  "Reasoning over matched evidence",
  "Ranking suitable crops",
];

const initialInput: CropAgentInput = {
  nitrogen: "", phosphorus: "", potassium: "", ph: "", temperature: "", humidity: "", rainfall: "",
  soilType: "", region: "", season: "",
};

function CropPredictionPage() {
  const [input, setInput] = useState<CropAgentInput>(initialInput);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AgentResponse<CropAgentResult> | null>(null);
  const stepIndex = useWorkflowProgress(WORKFLOW_STEPS.length, loading);

  const set = <K extends keyof CropAgentInput>(key: K, value: CropAgentInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const analyze = () => {
    setLoading(true);
    setResponse(null);
    window.setTimeout(() => {
      const res = runAgentSafely(() => runCropAgent(input));
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
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-soft text-3xl text-brand">🌱</span>
          <div>
            <h1 className="display-font text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">Crop Prediction</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              AI-powered crop suitability analysis based on soil, climate and historical agricultural data.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          {/* Form */}
          <div className="rounded-2xl border border-border bg-panel p-5 shadow-[0_14px_45px_-32px_var(--foreground)] sm:p-7">
            <div className="grid grid-cols-2 gap-4">
              <NumberField label="Nitrogen (N)" value={input.nitrogen} onChange={(v) => set("nitrogen", v)} error={errors["nitrogen"]} placeholder="80" />
              <NumberField label="Phosphorus (P)" value={input.phosphorus} onChange={(v) => set("phosphorus", v)} error={errors["phosphorus"]} placeholder="40" />
              <NumberField label="Potassium (K)" value={input.potassium} onChange={(v) => set("potassium", v)} error={errors["potassium"]} placeholder="50" />
              <NumberField label="Soil pH" value={input.ph} onChange={(v) => set("ph", v)} error={errors["ph"]} placeholder="6.5" step={0.1} />
              <NumberField label="Temperature" value={input.temperature} onChange={(v) => set("temperature", v)} error={errors["temperature"]} placeholder="27" suffix="°C" />
              <NumberField label="Humidity" value={input.humidity} onChange={(v) => set("humidity", v)} error={errors["humidity"]} placeholder="70" suffix="%" />
              <NumberField label="Rainfall" value={input.rainfall} onChange={(v) => set("rainfall", v)} error={errors["rainfall"]} placeholder="120" suffix="mm" />
              <SelectField label="Soil Type" value={input.soilType} onChange={(v) => set("soilType", v as CropAgentInput["soilType"])} options={SOIL_TYPES} error={errors["soilType"]} placeholder="Select Soil Type" />
              <SelectField label="Region" value={input.region} onChange={(v) => set("region", v as CropAgentInput["region"])} options={REGIONS} error={errors["region"]} placeholder="Select Region" />
              <SelectField label="Season" value={input.season} onChange={(v) => set("season", v as CropAgentInput["season"])} options={SEASONS} error={errors["season"]} placeholder="Select Season" />
            </div>

            <button
              onClick={analyze}
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 text-sm font-bold text-brand-foreground transition hover:brightness-95 disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? "Analyzing land…" : "Analyze Land"}
            </button>
          </div>

          {/* Result */}
          <div className="space-y-5">
            {loading && <AgentWorkflowTimeline steps={WORKFLOW_STEPS} currentIndex={stepIndex} />}

            {!loading && !response && (
              <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-border bg-panel-muted p-10 text-center text-sm text-muted-foreground">
                Your crop recommendation will appear here once you analyze your land.
              </div>
            )}

            {!loading && response && response.status !== "ok" && (
              <AgentErrorNotice
                title={response.status === "invalid_input" ? "Check the highlighted fields" : response.status === "error" ? "The agent hit a snag" : "Not enough evidence yet"}
                message={response.message ?? "Something went wrong while analyzing your land."}
              />
            )}

            {!loading && result && response && (
              <AgentErrorBoundary>
                <ResultSection icon={<Wheat size={16} />} title="Recommended crop">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="display-font text-3xl font-semibold tracking-[-0.03em] text-foreground">{result.recommended.crop}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Best match for your land this season</p>
                    </div>
                    <span className="rounded-full bg-brand-soft px-3 py-1.5 text-sm font-bold text-brand">{result.recommended.suitabilityScore}%</span>
                  </div>
                </ResultSection>

                <ConfidenceMeter value={response.confidence ?? result.recommended.suitabilityScore} label="Suitability score" />
                <ReasoningBlock items={response.reasoning ?? []} />
                <HistoricalEvidenceBlock items={response.historicalEvidence ?? []} />

                {result.alternatives.length > 0 && (
                  <ResultSection icon={<Sprout size={16} />} title="Alternative crops">
                    <ol className="space-y-2.5">
                      {result.alternatives.map((alt, i) => (
                        <li key={alt.crop} className="flex items-center justify-between rounded-xl border border-border bg-panel-muted px-4 py-2.5">
                          <span className="text-sm font-semibold text-foreground">{i + 2}. {alt.crop}</span>
                          <span className="text-xs font-bold text-brand">{alt.suitabilityScore}%</span>
                        </li>
                      ))}
                    </ol>
                  </ResultSection>
                )}

                <RecommendationBlock items={response.recommendation ?? []} />
                <NextActionBlock items={response.nextAction ?? []} />
              </AgentErrorBoundary>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
