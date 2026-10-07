import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Microscope, Leaf, Download, ClipboardCheck } from "lucide-react";
import { BackToFarmTools } from "@/components/agro/BackToFarmTools";
import { AgentErrorBoundary } from "@/components/agro/AgentErrorBoundary";
import { SelectField } from "@/components/agro/FormFields";
import { ImageUploadBox, type SelectedImage } from "@/components/agro/ImageUploadBox";
import { AgentWorkflowTimeline, useWorkflowProgress } from "@/components/agro/AgentWorkflowTimeline";
import { ConfidenceMeter, ReasoningBlock, HistoricalEvidenceBlock, NextActionBlock, AgentErrorNotice, ResultSection } from "@/components/agro/AgentResultSections";
import { runNutrientAgent, type NutrientAgentInput, type NutrientAgentResult, type DeficiencySeverity } from "@/agents/nutrientAgent";
import { runAgentSafely, type AgentResponse } from "@/agents/types";
import { REGIONS, SOIL_TYPES, CROPS, type Crop, type Region, type SoilType } from "@/data/agri-history";
import { readImageMeta } from "@/lib/image";
import { downloadTextReport } from "@/lib/report";

export const Route = createFileRoute("/nutrient-deficiency")({
  head: () => ({
    meta: [
      { title: "Nutrient Deficiency Intelligence | AgriWise Connect" },
      { name: "description", content: "Detect crop nutrient deficiencies and get actionable recommendations using an AI agricultural agent." },
    ],
  }),
  component: NutrientDeficiencyPage,
});

const GROWTH_STAGES = ["Seedling", "Vegetative", "Tillering", "Flowering", "Fruiting / Pod development", "Maturity"];

const WORKFLOW_STEPS = [
  "Checking image quality",
  "Enhancing image",
  "Running agricultural vision agent",
  "Analyzing visual symptoms",
  "Retrieving nutrient knowledge & historical cases",
  "Cross-checking crop, soil, region & growth stage",
  "Reasoning over evidence",
  "Assessing severity & building correction plan",
];

const SEVERITY_TONE: Record<DeficiencySeverity, string> = {
  Mild: "bg-success/15 text-success",
  Moderate: "bg-warning/20 text-warning-foreground",
  Severe: "bg-danger/15 text-danger",
};

function NutrientDeficiencyPage() {
  const [crop, setCrop] = useState<Crop | "">("");
  const [growthStage, setGrowthStage] = useState("");
  const [soilType, setSoilType] = useState<SoilType | "">("");
  const [region, setRegion] = useState<Region | "">("");
  const [image, setImage] = useState<SelectedImage | null>(null);
  const [imageError, setImageError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AgentResponse<NutrientAgentResult> | null>(null);

  const stepIndex = useWorkflowProgress(WORKFLOW_STEPS.length, loading);

  const onSelect = (file: File) => {
    setImage({ file, previewUrl: URL.createObjectURL(file) });
    setImageError(undefined);
    setResponse(null);
  };
  const onClear = () => {
    setImage(null);
    setResponse(null);
  };

  const analyze = async () => {
    if (!image) {
      setImageError("Please upload a leaf image first.");
      return;
    }
    setLoading(true);
    setResponse(null);
    try {
      const meta = await readImageMeta(image.file);
      window.setTimeout(() => {
        const res = runAgentSafely(() =>
          runNutrientAgent({
            image: { fileName: image.file.name, fileSizeBytes: image.file.size, mimeType: image.file.type, width: meta.width, height: meta.height },
            crop, growthStage: growthStage || undefined, soilType, region,
          })
        );
        setImageError(res.fieldErrors?.["image"]);
        setResponse(res);
        setLoading(false);
      }, WORKFLOW_STEPS.length * 320 + 300);
    } catch {
      setLoading(false);
      setImageError("We couldn't read this image file. Please try a different photo.");
    }
  };

  const result = response?.status === "ok" ? response.result : undefined;

  const downloadReport = () => {
    if (!result || !response) return;
    try {
      downloadTextReport(`nutrient-deficiency-report-${result.crop.toLowerCase()}.txt`, [
      "AGRIWISE CONNECT — NUTRIENT DEFICIENCY INTELLIGENCE REPORT",
      "=".repeat(58),
      `Crop: ${result.crop}`,
      `Most likely deficiency: ${result.deficiencyLabel} (${result.nutrient})`,
      `Probability: ${result.probability}%`,
      `Severity: ${result.severity}`,
      "",
      "VISUAL EVIDENCE",
      ...result.visualEvidence.map((s) => `- ${s}`),
      "",
      "LEAF SYMPTOMS",
      ...result.leafSymptoms.map((s) => `- ${s}`),
      "",
      "AGENT REASONING",
      ...(response.reasoning ?? []).map((s) => `- ${s}`),
      "",
      "HISTORICAL EVIDENCE",
      ...(response.historicalEvidence ?? []).map((e) => `- ${e.summary}${e.detail ? ` (${e.detail})` : ""}`),
      "",
      "RECOMMENDED CORRECTION",
      `Nutrient: ${result.nutrient}`,
      `Correction: ${result.recommendedCorrection}`,
      `Fertilizer: ${result.fertilizer}`,
      `Application guidance: ${result.applicationGuidance}`,
      `Follow-up: ${result.followUp}`,
      "",
      "NEXT ACTION",
      ...(response.nextAction ?? []).map((s) => `- ${s}`),
      "",
        "Generated by AgriWise Connect — Nutrient Deficiency Intelligence Agent (demo build, sample historical dataset).",
      ]);
    } catch (err) {
      console.error("[report download failed]", err);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <BackToFarmTools />

        <div className="mt-6 flex items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-soft text-3xl text-brand">🔬</span>
          <div>
            <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-foreground">
              Core module
            </div>
            <h1 className="display-font text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">Nutrient Deficiency Intelligence</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Detect crop nutrient deficiencies and receive actionable correction guidance using an AI agricultural agent.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="rounded-2xl border border-border bg-panel p-5 shadow-[0_14px_45px_-32px_var(--foreground)] sm:p-7">
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Crop Name" value={crop} onChange={(v) => setCrop(v as Crop | "")} options={CROPS} placeholder="Select Crop" />
              <SelectField label="Growth Stage" value={growthStage} onChange={setGrowthStage} options={GROWTH_STAGES} placeholder="Select Stage" />
              <SelectField label="Soil Type" value={soilType} onChange={(v) => setSoilType(v as SoilType | "")} options={SOIL_TYPES} placeholder="Select Soil Type" />
              <SelectField label="Region" value={region} onChange={(v) => setRegion(v as Region | "")} options={REGIONS} placeholder="Select Region" />
            </div>
            <p className="mb-2 mt-6 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Leaf image</p>
            <ImageUploadBox label="Upload Leaf Image" image={image} onSelect={onSelect} onClear={onClear} error={imageError} />

            <button
              onClick={analyze}
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 text-sm font-bold text-brand-foreground transition hover:brightness-95 disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? "Analyzing deficiency…" : "Analyze Deficiency"}
            </button>
            <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">
              Crop, growth stage, soil type and region are optional but sharpen the agent's cross-checked result.
            </p>
          </div>

          <div className="space-y-5">
            {loading && <AgentWorkflowTimeline steps={WORKFLOW_STEPS} currentIndex={stepIndex} />}

            {!loading && !response && (
              <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-border bg-panel-muted p-10 text-center text-sm text-muted-foreground">
                Upload a leaf image to check for nutrient deficiency symptoms.
              </div>
            )}

            {!loading && response && response.status !== "ok" && (
              <AgentErrorNotice
                title={response.status === "invalid_input" ? "Image needs attention" : response.status === "error" ? "The agent hit a snag" : "Not enough evidence yet"}
                message={response.message ?? "Something went wrong while analyzing this image."}
              />
            )}

            {!loading && result && response && (
              <AgentErrorBoundary>
                <ResultSection icon={<Microscope size={16} />} title="Most likely deficiency">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="display-font text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">{result.deficiencyLabel}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{result.crop} · {result.nutrient}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${SEVERITY_TONE[result.severity]}`}>{result.severity}</span>
                  </div>
                </ResultSection>

                <ConfidenceMeter value={result.probability} label="Probability" />

                <ResultSection icon={<Leaf size={16} />} title="Visual evidence">
                  <ul className="space-y-2">
                    {[...result.visualEvidence, ...result.leafSymptoms].map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm leading-6 text-foreground">
                        <span className="text-success">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </ResultSection>

                <ReasoningBlock items={response.reasoning ?? []} />

                {result.crossChecks.length > 0 && (
                  <ResultSection icon={<ClipboardCheck size={16} />} title="Cross-check">
                    <div className="space-y-2.5">
                      {result.crossChecks.map((c) => (
                        <div key={c.field} className="flex items-start gap-2.5 rounded-xl border border-border bg-panel-muted p-3">
                          <span className={c.matched ? "text-success" : "text-muted-foreground"}>{c.matched ? "✓" : "–"}</span>
                          <div>
                            <p className="text-xs font-bold text-foreground">{c.field}</p>
                            <p className="text-xs leading-5 text-muted-foreground">{c.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ResultSection>
                )}

                <HistoricalEvidenceBlock items={response.historicalEvidence ?? []} />

                <ResultSection icon={<Leaf size={16} />} title="Recommended correction">
                  <div className="space-y-2 text-sm leading-6 text-foreground">
                    <p><span className="font-bold">Nutrient:</span> {result.nutrient}</p>
                    <p><span className="font-bold">Correction:</span> {result.recommendedCorrection}</p>
                    <p><span className="font-bold">Fertilizer:</span> {result.fertilizer}</p>
                    <p><span className="font-bold">Application:</span> {result.applicationGuidance}</p>
                    <p><span className="font-bold">Follow-up:</span> {result.followUp}</p>
                  </div>
                </ResultSection>

                <NextActionBlock items={response.nextAction ?? []} />

                <button
                  onClick={downloadReport}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-panel px-4 py-3 text-sm font-bold text-foreground transition hover:border-brand/50 hover:text-brand"
                >
                  <Download size={16} /> Download Report
                </button>
              </AgentErrorBoundary>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
