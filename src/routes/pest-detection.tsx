import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bug, ShieldAlert } from "lucide-react";
import { BackToFarmTools } from "@/components/agro/BackToFarmTools";
import { AgentErrorBoundary } from "@/components/agro/AgentErrorBoundary";
import { ImageUploadBox, type SelectedImage } from "@/components/agro/ImageUploadBox";
import { AgentWorkflowTimeline, useWorkflowProgress } from "@/components/agro/AgentWorkflowTimeline";
import { ConfidenceMeter, ReasoningBlock, HistoricalEvidenceBlock, RecommendationBlock, NextActionBlock, AgentErrorNotice, ResultSection } from "@/components/agro/AgentResultSections";
import { runPestAgent, type PestAgentResult } from "@/agents/pestAgent";
import { runAgentSafely, type AgentResponse } from "@/agents/types";
import { readImageMeta } from "@/lib/image";

export const Route = createFileRoute("/pest-detection")({
  head: () => ({
    meta: [
      { title: "Pest Detection | AgriWise Connect" },
      { name: "description", content: "Identify crop pests from field images using an AI agricultural agent." },
    ],
  }),
  component: PestDetectionPage,
});

const WORKFLOW_STEPS = [
  "Checking image quality",
  "Running agricultural vision agent",
  "Identifying likely pest",
  "Retrieving historical pest knowledge",
  "Assessing risk level",
];

const SEVERITY_TONE: Record<string, string> = {
  Low: "bg-success/15 text-success",
  Medium: "bg-warning/20 text-warning-foreground",
  High: "bg-danger/15 text-danger",
};
const SEVERITY_DOT: Record<string, string> = { Low: "🟢", Medium: "🟡", High: "🔴" };

function PestDetectionPage() {
  const [image, setImage] = useState<SelectedImage | null>(null);
  const [imageError, setImageError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AgentResponse<PestAgentResult> | null>(null);

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
      setImageError("Please upload a crop or leaf image first.");
      return;
    }
    setLoading(true);
    setResponse(null);
    try {
      const meta = await readImageMeta(image.file);
      window.setTimeout(() => {
        const res = runAgentSafely(() =>
          runPestAgent({
            fileName: image.file.name,
            fileSizeBytes: image.file.size,
            mimeType: image.file.type,
            width: meta.width,
            height: meta.height,
          })
        );
        setImageError(res.fieldErrors?.["image"]);
        setResponse(res);
        setLoading(false);
      }, WORKFLOW_STEPS.length * 420 + 200);
    } catch {
      setLoading(false);
      setImageError("We couldn't read this image file. Please try a different photo.");
    }
  };

  const result = response?.status === "ok" ? response.result : undefined;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <BackToFarmTools />

        <div className="mt-6 flex items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-soft text-3xl text-brand">🐛</span>
          <div>
            <h1 className="display-font text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">Pest Detection</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Identify crop pests from field images using an AI agricultural agent.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="rounded-2xl border border-border bg-panel p-5 shadow-[0_14px_45px_-32px_var(--foreground)] sm:p-7">
            <ImageUploadBox label="Upload Crop Image" image={image} onSelect={onSelect} onClear={onClear} error={imageError} />
            <button
              onClick={analyze}
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 text-sm font-bold text-brand-foreground transition hover:brightness-95 disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? "Analyzing image…" : "Analyze Pest"}
            </button>
            <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">
              This demo agent reasons over a sample historical pest knowledge base, not a live camera feed.
            </p>
          </div>

          <div className="space-y-5">
            {loading && <AgentWorkflowTimeline steps={WORKFLOW_STEPS} currentIndex={stepIndex} />}

            {!loading && !response && (
              <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-border bg-panel-muted p-10 text-center text-sm text-muted-foreground">
                Upload a crop image to check for visible pest signals.
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
                <ResultSection icon={<Bug size={16} />} title="Pest detected">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="display-font text-3xl font-semibold tracking-[-0.03em] text-foreground">{result.pest}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Affected crop: {result.cropAffected}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${SEVERITY_TONE[result.severity]}`}>
                      {SEVERITY_DOT[result.severity]} {result.severity.toUpperCase()}
                    </span>
                  </div>
                </ResultSection>

                <ConfidenceMeter value={response.confidence ?? 0} />

                <ResultSection icon={<ShieldAlert size={16} />} title="Observed symptoms">
                  <ul className="space-y-2">
                    {result.symptoms.map((s, i) => (
                      <li key={i} className="text-sm leading-6 text-foreground">• {s}</li>
                    ))}
                  </ul>
                </ResultSection>

                <ReasoningBlock items={response.reasoning ?? []} />
                <HistoricalEvidenceBlock items={response.historicalEvidence ?? []} />
                <RecommendationBlock title="Recommended action" items={result.recommendedAction} />

                <ResultSection icon={<ShieldAlert size={16} />} title="Prevention">
                  <ul className="space-y-2">
                    {result.prevention.map((p, i) => (
                      <li key={i} className="flex gap-2 text-sm leading-6 text-foreground">
                        <span className="text-success">✓</span> {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border bg-panel-muted p-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Pesticide category</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{result.pesticideCategory}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-panel-muted p-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Non-chemical control</p>
                      <p className="mt-1 text-xs leading-5 text-foreground">{result.nonChemicalControl.join(" · ")}</p>
                    </div>
                  </div>
                </ResultSection>

                <NextActionBlock items={response.nextAction ?? []} />
              </AgentErrorBoundary>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
