import { cropYieldHistory, CROPS, type Crop, type Region, type SoilType, type Season } from "@/data/agri-history";
import { average, mode, topK, weightedSimilarity, validateNumber, validateRequired } from "./utils";
import { AgentResponse, invalidInput, noEvidence } from "./types";

export interface CropAgentInput {
  nitrogen: number | string;
  phosphorus: number | string;
  potassium: number | string;
  ph: number | string;
  temperature: number | string;
  humidity: number | string;
  rainfall: number | string;
  soilType: SoilType | "";
  region: Region | "";
  season: Season | "";
}

export interface CropCandidate {
  crop: Crop;
  suitabilityScore: number;
  avgHistoricalYield: number;
  bestMatchingRegion?: Region | undefined;
  recordsAnalyzed: number;
  matchedReasons: string[];
}

export interface CropAgentResult {
  recommended: CropCandidate;
  alternatives: CropCandidate[];
}

/** Step 1 — validate farmer inputs before any retrieval happens. */
export function validateCropInput(input: CropAgentInput): Record<string, string> {
  const errors: Record<string, string> = {};
  const checks: [string, string, number | string, number, number][] = [
    ["nitrogen", "Nitrogen (N)", input.nitrogen, 0, 200],
    ["phosphorus", "Phosphorus (P)", input.phosphorus, 0, 150],
    ["potassium", "Potassium (K)", input.potassium, 0, 150],
    ["ph", "Soil pH", input.ph, 2, 11],
    ["temperature", "Temperature", input.temperature, -5, 55],
    ["humidity", "Humidity", input.humidity, 0, 100],
    ["rainfall", "Rainfall", input.rainfall, 0, 600],
  ];
  for (const [key, label, value, min, max] of checks) {
    const err = validateNumber(label, value, min, max);
    if (err) errors[key] = err;
  }
  const soilErr = validateRequired("Soil Type", input.soilType);
  if (soilErr) errors["soilType"] = soilErr;
  const regionErr = validateRequired("Region", input.region);
  if (regionErr) errors["region"] = regionErr;
  const seasonErr = validateRequired("Season", input.season);
  if (seasonErr) errors["season"] = seasonErr;
  return errors;
}

export interface CropAgentNumericInput {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  soilType: SoilType;
  region: Region;
  season: Season;
}

function scoreCrop(crop: Crop, input: CropAgentNumericInput): CropCandidate | undefined {
  const records = cropYieldHistory.filter((r) => r.crop === crop);
  if (records.length === 0) return undefined;

  const scored = records.map((r) => ({
    record: r,
    score: weightedSimilarity([
      { value: input.nitrogen, target: r.nitrogen, span: 140, weight: 1 },
      { value: input.phosphorus, target: r.phosphorus, span: 80, weight: 1 },
      { value: input.potassium, target: r.potassium, span: 80, weight: 1 },
      { value: input.ph, target: r.ph, span: 6, weight: 1.6 },
      { value: input.temperature, target: r.temperature, span: 40, weight: 1.2 },
      { value: input.humidity, target: r.humidity, span: 90, weight: 0.8 },
      { value: input.rainfall, target: r.rainfall, span: 350, weight: 1.1 },
      { value: input.soilType === r.soilType ? 1 : 0, target: 1, span: 1, weight: 1.4 },
      { value: input.season === r.season ? 1 : 0, target: 1, span: 1, weight: 1.2 },
      { value: input.region === r.region ? 1 : 0, target: 1, span: 1, weight: 0.5 },
    ]),
  }));

  const best = topK(scored, (s) => s.score, 8);
  const suitabilityScore = Math.round(average(best.map((b) => b.score)));
  const avgHistoricalYield = Math.round(average(best.map((b) => b.record.yieldTonnesPerAcre)) * 100) / 100;
  const bestMatchingRegion = mode(best.map((b) => b.record.region));

  const matchedReasons: string[] = [];
  const phMin = Math.min(...best.map((b) => b.record.ph));
  const phMax = Math.max(...best.map((b) => b.record.ph));
  if (input.ph >= phMin - 0.3 && input.ph <= phMax + 0.3) {
    matchedReasons.push(`Soil pH (${input.ph}) is within the suitable range observed in historical ${crop.toLowerCase()} cultivation (${phMin.toFixed(1)}–${phMax.toFixed(1)}).`);
  }
  const nAvg = average(best.map((b) => b.record.nitrogen));
  if (Math.abs(input.nitrogen - nAvg) <= 25) {
    matchedReasons.push(`Available nitrogen (${input.nitrogen}) is compatible with historical ${crop.toLowerCase()} cultivation (avg ${Math.round(nAvg)}).`);
  }
  const rainAvg = average(best.map((b) => b.record.rainfall));
  if (Math.abs(input.rainfall - rainAvg) <= 60) {
    matchedReasons.push(`Rainfall conditions (${input.rainfall}mm) match successful historical records (avg ${Math.round(rainAvg)}mm).`);
  }
  const tempAvg = average(best.map((b) => b.record.temperature));
  if (Math.abs(input.temperature - tempAvg) <= 6) {
    matchedReasons.push(`Temperature (${input.temperature}°C) is suitable for the ${input.season} season.`);
  }
  const soilMatches = best.filter((b) => b.record.soilType === input.soilType).length;
  if (soilMatches >= Math.ceil(best.length / 2)) {
    matchedReasons.push(`Soil type (${input.soilType}) matches ${soilMatches} of ${best.length} closest successful historical cultivations.`);
  }

  return { crop, suitabilityScore, avgHistoricalYield, bestMatchingRegion, recordsAnalyzed: records.length, matchedReasons };
}

/** Full crop agent pipeline: validate -> retrieve -> compare -> reason -> rank -> recommend. */
export function runCropAgent(raw: CropAgentInput): AgentResponse<CropAgentResult> {
  const errors = validateCropInput(raw);
  if (Object.keys(errors).length > 0) return invalidInput(errors);

  const input: CropAgentNumericInput = {
    nitrogen: Number(raw.nitrogen), phosphorus: Number(raw.phosphorus), potassium: Number(raw.potassium),
    ph: Number(raw.ph), temperature: Number(raw.temperature), humidity: Number(raw.humidity), rainfall: Number(raw.rainfall),
    soilType: raw.soilType as SoilType, region: raw.region as Region, season: raw.season as Season,
  };

  const candidates = CROPS.map((crop) => scoreCrop(crop, input)).filter((c): c is CropCandidate => !!c);
  if (candidates.length === 0) {
    return noEvidence("We couldn't find enough historical evidence for this condition. Please provide additional soil or crop information.");
  }

  const ranked = [...candidates].sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  const recommended = ranked[0];
  if (!recommended) {
    return noEvidence("We couldn't find enough historical evidence for this condition. Please provide additional soil or crop information.");
  }
  const alternatives = ranked.slice(1, 4);

  const totalAnalyzed = candidates.reduce((sum, c) => sum + c.recordsAnalyzed, 0);

  return {
    status: "ok",
    result: { recommended, alternatives },
    confidence: recommended.suitabilityScore,
    reasoning: recommended.matchedReasons.length > 0
      ? recommended.matchedReasons
      : [`${recommended.crop} scored highest across nutrient, climate and soil similarity to historical records, though the match is only moderate.`],
    historicalEvidence: [
      {
        summary: `${totalAnalyzed.toLocaleString()} historical records analyzed across ${CROPS.length} crops`,
        recordsAnalyzed: totalAnalyzed,
        detail: `Average historical yield for ${recommended.crop}: ${recommended.avgHistoricalYield} tonnes/acre · Best matching region: ${recommended.bestMatchingRegion ?? "—"}`,
      },
    ],
    recommendation: [
      `${recommended.crop} is the best-matched crop for your land this ${input.season} season, with a ${recommended.suitabilityScore}% suitability score.`,
    ],
    nextAction: [
      `Open the Fertilizer Prediction agent for a ${recommended.crop}-specific nutrient plan.`,
      "Re-check soil pH and nutrient levels if they sit far outside the ranges shown above.",
    ],
  };
}
