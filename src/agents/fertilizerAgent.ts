import { fertilizerHistory, type Crop, type Region, type SoilType } from "@/data/agri-history";
import { average, topK, weightedSimilarity, validateNumber, validateRequired } from "./utils";
import { AgentResponse, invalidInput, noEvidence } from "./types";

export interface FertilizerAgentInput {
  crop: Crop | "";
  nitrogen: number | string;
  phosphorus: number | string;
  potassium: number | string;
  ph: number | string;
  soilType: SoilType | "";
  region: Region | "";
  areaAcres: number | string;
}

export type NutrientStatus = "LOW" | "MEDIUM" | "HIGH";

export interface FertilizerPlanItem {
  fertilizer: string;
  kgPerAcre: number;
  totalKg: number;
  application: string;
}

export interface FertilizerAgentResult {
  crop: Crop;
  areaAcres: number;
  nutrientStatus: { nitrogen: NutrientStatus; phosphorus: NutrientStatus; potassium: NutrientStatus; ph: number };
  plan: FertilizerPlanItem[];
  schedule: { day: string; action: string }[];
}

export function validateFertilizerInput(input: FertilizerAgentInput): Record<string, string> {
  const errors: Record<string, string> = {};
  const cropErr = validateRequired("Crop", input.crop);
  if (cropErr) errors["crop"] = cropErr;
  const checks: [string, string, number | string, number, number][] = [
    ["nitrogen", "Nitrogen (N)", input.nitrogen, 0, 200],
    ["phosphorus", "Phosphorus (P)", input.phosphorus, 0, 150],
    ["potassium", "Potassium (K)", input.potassium, 0, 150],
    ["ph", "Soil pH", input.ph, 2, 11],
    ["areaAcres", "Area", input.areaAcres, 0.1, 10000],
  ];
  for (const [key, label, value, min, max] of checks) {
    const err = validateNumber(label, value, min, max);
    if (err) errors[key] = err;
  }
  const soilErr = validateRequired("Soil Type", input.soilType);
  if (soilErr) errors["soilType"] = soilErr;
  const regionErr = validateRequired("Region", input.region);
  if (regionErr) errors["region"] = regionErr;
  return errors;
}

function statusFor(value: number, avg: number): NutrientStatus {
  if (value < avg * 0.8) return "LOW";
  if (value > avg * 1.15) return "HIGH";
  return "MEDIUM";
}

const APPLICATION_METHOD: Record<string, string> = {
  Urea: "Split application (basal + top-dress)",
  DAP: "Basal application at sowing",
  SSP: "Basal application at sowing",
  MOP: "Pre-flowering top-dress",
  Gypsum: "Basal / at pegging stage",
};

export function runFertilizerAgent(raw: FertilizerAgentInput): AgentResponse<FertilizerAgentResult> {
  const errors = validateFertilizerInput(raw);
  if (Object.keys(errors).length > 0) return invalidInput(errors);

  const crop = raw.crop as Crop;
  const nitrogen = Number(raw.nitrogen);
  const phosphorus = Number(raw.phosphorus);
  const potassium = Number(raw.potassium);
  const ph = Number(raw.ph);
  const soilType = raw.soilType as SoilType;
  const region = raw.region as Region;
  const areaAcres = Number(raw.areaAcres);

  const records = fertilizerHistory.filter((r) => r.crop === crop);
  if (records.length === 0) {
    return noEvidence(`We couldn't find enough historical evidence for ${crop || "this crop"}. Please provide additional soil information or choose a different crop.`);
  }

  const scored = records.map((r) => ({
    record: r,
    score: weightedSimilarity([
      { value: nitrogen, target: r.nitrogen, span: 140, weight: 1 },
      { value: phosphorus, target: r.phosphorus, span: 80, weight: 1 },
      { value: potassium, target: r.potassium, span: 80, weight: 1 },
      { value: ph, target: r.ph, span: 6, weight: 1.4 },
      { value: soilType === r.soilType ? 1 : 0, target: 1, span: 1, weight: 1.2 },
      { value: region === r.region ? 1 : 0, target: 1, span: 1, weight: 0.5 },
    ]),
  }));

  const best = topK(scored, (s) => s.score, 10);
  const confidence = Math.round(average(best.map((b) => b.score)));

  const avgN = average(best.map((b) => b.record.nitrogen));
  const avgP = average(best.map((b) => b.record.phosphorus));
  const avgK = average(best.map((b) => b.record.potassium));

  const nStatus = statusFor(nitrogen, avgN);
  const pStatus = statusFor(phosphorus, avgP);
  const kStatus = statusFor(potassium, avgK);

  // Build a plan from the fertilizers most frequently used in the closest historical matches,
  // scaled toward higher quantities for nutrients the current field is LOW on.
  const byFertilizer = new Map<string, number[]>();
  for (const b of best) {
    const list = byFertilizer.get(b.record.fertilizer) ?? [];
    list.push(b.record.quantityKgPerAcre);
    byFertilizer.set(b.record.fertilizer, list);
  }
  const statusMultiplier = (fert: string) => {
    if (fert === "Urea" && nStatus === "LOW") return 1.15;
    if ((fert === "DAP" || fert === "SSP") && pStatus === "LOW") return 1.15;
    if ((fert === "MOP" || fert === "Gypsum") && kStatus === "LOW") return 1.1;
    return 1;
  };

  const plan: FertilizerPlanItem[] = Array.from(byFertilizer.entries())
    .map(([fertilizer, quantities]) => {
      const kgPerAcre = Math.round(average(quantities) * statusMultiplier(fertilizer));
      return {
        fertilizer,
        kgPerAcre,
        totalKg: Math.round(kgPerAcre * areaAcres),
        application: APPLICATION_METHOD[fertilizer] ?? "As per local agronomic guidance",
      };
    })
    .sort((a, b) => b.totalKg - a.totalKg);

  const schedule = [
    { day: "Day 1", action: "Base fertilizer application (basal dose)" },
    { day: "Day 20", action: `Nitrogen top-dress${nStatus === "LOW" ? " (priority — nitrogen is currently low)" : ""}` },
    { day: "Day 40", action: "Second nutrient application (potassium / micronutrient top-up)" },
  ];

  const reasoning: string[] = [];
  if (nStatus === "LOW") reasoning.push(`Nitrogen (${nitrogen}) is below the historical optimal range for ${crop} cultivation under similar soil and climatic conditions (avg ${Math.round(avgN)}).`);
  if (pStatus === "LOW") reasoning.push(`Phosphorus (${phosphorus}) is below the historical optimal range for ${crop} (avg ${Math.round(avgP)}).`);
  if (kStatus === "LOW") reasoning.push(`Potassium (${potassium}) is below the historical optimal range for ${crop} (avg ${Math.round(avgK)}).`);
  if (reasoning.length === 0) reasoning.push(`Current N-P-K levels are broadly in line with historically successful ${crop} fields, so this plan focuses on maintenance rather than correction.`);
  reasoning.push(`The recommendation is based on ${best.length} comparable historical agricultural records with similar soil type, pH and region.`);

  return {
    status: "ok",
    result: {
      crop,
      areaAcres,
      nutrientStatus: { nitrogen: nStatus, phosphorus: pStatus, potassium: kStatus, ph },
      plan,
      schedule,
    },
    confidence,
    reasoning,
    historicalEvidence: [
      {
        summary: `${records.length} historical ${crop} fertilizer records analyzed, ${best.length} closely comparable`,
        recordsAnalyzed: records.length,
        detail: `Average historical N-P-K for comparable ${crop} fields: ${Math.round(avgN)}-${Math.round(avgP)}-${Math.round(avgK)}`,
      },
    ],
    recommendation: plan.map((p) => `${p.fertilizer}: ${p.kgPerAcre} kg/acre (${p.totalKg} kg total) — ${p.application}`),
    nextAction: [
      "Follow the application schedule below, adjusting for local weather.",
      `Open the Nutrient Deficiency agent if ${crop} leaves show visible discoloration after applying this plan.`,
    ],
  };
}
