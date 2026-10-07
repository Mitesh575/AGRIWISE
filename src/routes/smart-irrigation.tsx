import { createFileRoute } from "@tanstack/react-router";
import { Droplets, Gauge, Leaf, Ruler, Thermometer, TimerReset, Waves } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { BackToFarmTools } from "@/components/agro/BackToFarmTools";
import { NumberField, SelectField } from "@/components/agro/FormFields";
import { ConfidenceMeter, NextActionBlock, RecommendationBlock, ResultSection } from "@/components/agro/AgentResultSections";
import { calculateIrrigation, GROWTH_STAGES, IRRIGATION_CROPS, IRRIGATION_METHODS, type IrrigationInput, MOISTURE_BANDS } from "@/data/agri-modules";
import { SOIL_TYPES } from "@/data/agri-history";
import { saveAnalysis } from "@/lib/agri-database";

export const Route = createFileRoute("/smart-irrigation")({
  head: () => ({ meta: [{ title: "Smart Water Irrigation | AgriWise Connect" }, { name: "description", content: "Crop-specific irrigation scheduling and water-efficiency guidance." }] }),
  component: SmartIrrigationPage,
});

const initial: IrrigationInput = { crop: "", growthStage: "", moisture: "", area: "", temperature: "", rainfallForecast: "", soilType: "", method: "" };

function SmartIrrigationPage() {
  const [input, setInput] = useState<IrrigationInput>(initial);
  const [result, setResult] = useState<ReturnType<typeof calculateIrrigation> | null>(null);
  const set = <K extends keyof IrrigationInput>(key: K, value: IrrigationInput[K]) => setInput((p) => ({ ...p, [key]: value }));
  const analyze = () => {
    const next = calculateIrrigation(input);
    setResult(next);
    void saveAnalysis({ module: "smart-irrigation", title: `Irrigation plan · ${input.crop}`, input: { ...input }, result: next as unknown as Record<string, unknown> });
  };
  const moistureNumber = Number(input.moisture);
  const moistureBand = Number.isFinite(moistureNumber) ? moistureNumber < 25 ? MOISTURE_BANDS[0] : moistureNumber < 40 ? MOISTURE_BANDS[1] : moistureNumber < 60 ? MOISTURE_BANDS[2] : moistureNumber < 75 ? MOISTURE_BANDS[3] : MOISTURE_BANDS[4] : "Enter moisture %";

  return <main className="min-h-screen bg-background"><div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
    <BackToFarmTools />
    <div className="mt-6 flex items-start gap-4"><span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand"><Droplets size={28} /></span><div><h1 className="display-font text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">Smart Water Irrigation</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Plan the next irrigation event using crop demand, root-zone moisture, growth stage, soil, temperature and rainfall forecast.</p></div></div>
    <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
      <div className="rounded-2xl border border-border bg-panel p-5 shadow-[0_14px_45px_-32px_var(--foreground)] sm:p-7">
        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Cultivated Crop" value={input.crop} onChange={(v) => set("crop", v as IrrigationInput["crop"])} options={IRRIGATION_CROPS} placeholder="Select Crop" />
          <SelectField label="Growth Stage" value={input.growthStage} onChange={(v) => set("growthStage", v as IrrigationInput["growthStage"])} options={GROWTH_STAGES} placeholder="Select Stage" />
          <NumberField label="Root-zone Moisture" value={input.moisture} onChange={(v) => set("moisture", v)} placeholder="45" suffix="%" min={0} max={100} />
          <NumberField label="Field Area" value={input.area} onChange={(v) => set("area", v)} placeholder="2" suffix="acre" min={0.1} />
          <NumberField label="Temperature" value={input.temperature} onChange={(v) => set("temperature", v)} placeholder="30" suffix="°C" min={0} max={50} />
          <NumberField label="Rain Forecast" value={input.rainfallForecast} onChange={(v) => set("rainfallForecast", v)} placeholder="5" suffix="mm" min={0} max={300} />
          <SelectField label="Soil Type" value={input.soilType} onChange={(v) => set("soilType", v as IrrigationInput["soilType"])} options={SOIL_TYPES} placeholder="Select Soil" />
          <SelectField label="Irrigation Method" value={input.method} onChange={(v) => set("method", v as IrrigationInput["method"])} options={IRRIGATION_METHODS} placeholder="Select Method" />
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-panel-muted px-4 py-3 text-xs text-muted-foreground"><Gauge size={15} className="text-brand" /> Current moisture band: <span className="font-bold text-foreground">{moistureBand}</span></div>
        <button onClick={analyze} disabled={!input.crop || !input.growthStage || !input.moisture || !input.area || !input.temperature || !input.soilType || !input.method} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 text-sm font-bold text-brand-foreground transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"><Droplets size={17} /> Generate Irrigation Plan</button>
      </div>
      <div className="space-y-5">
        {!result && <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-border bg-panel-muted p-10 text-center"><div><Waves size={30} className="mx-auto text-brand" /><p className="mt-3 text-sm font-semibold text-foreground">Your crop-specific irrigation plan will appear here.</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Use a measured moisture value when possible; visual soil appearance alone is less reliable.</p></div></div>}
        {result && <>
          <ResultSection icon={<Droplets size={16} />} title="Next irrigation recommendation"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Event depth" value={`${result.eventMm} mm`} /><Metric label="Per acre" value={`${result.litersPerAcre.toLocaleString()} L`} /><Metric label="Whole field" value={`${result.totalLiters.toLocaleString()} L`} /><Metric label="Urgency" value={result.urgency} /></div><p className="mt-4 text-sm leading-6 text-muted-foreground">{result.moistureTarget}</p></ResultSection>
          <ConfidenceMeter value={result.score} label="Scheduling confidence" />
          <ResultSection icon={<TimerReset size={16} />} title="Crop water demand"><p className="text-sm font-semibold text-foreground">Approx. {result.dailyMm} mm/day under the supplied conditions</p><p className="mt-1 text-xs text-muted-foreground">{result.frequency}. Recalculate after meaningful rainfall or a major weather change.</p></ResultSection>
          <RecommendationBlock title="Field recommendations" items={result.recommendations} />
          <ResultSection icon={<Leaf size={16} />} title="Water-efficiency practices"><ul className="space-y-2.5">{result.efficiencyTips.map((x) => <li key={x} className="flex gap-2 text-sm leading-6"><span className="text-brand">✓</span>{x}</li>)}</ul></ResultSection>
          <NextActionBlock items={[`Recheck moisture before the next event. Record the irrigation duration and actual rainfall.`, `For ${input.area} acre(s), the current plan corresponds to about ${result.totalLiters.toLocaleString()} litres for the suggested event.`]} />
        </>}
      </div>
    </div>
    <div className="mt-6 grid gap-3 sm:grid-cols-3"><Info icon={<Thermometer size={17} />} title="Weather aware" text="Heat and forecast rain change the recommendation." /><Info icon={<Ruler size={17} />} title="Root-zone focused" text="Use measured moisture, not only surface appearance." /><Info icon={<Leaf size={17} />} title="Crop specific" text="Demand changes by crop and growth stage." /></div>
  </div></main>;
}
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-border bg-panel-muted p-3"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p><p className="mt-1 text-lg font-bold text-foreground">{value}</p></div>; }
function Info({ icon, title, text }: { icon: ReactNode; title: string; text: string }) { return <div className="rounded-xl border border-border bg-panel p-4"><div className="flex items-center gap-2 text-sm font-bold text-foreground">{icon}<span>{title}</span></div><p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p></div>; }
