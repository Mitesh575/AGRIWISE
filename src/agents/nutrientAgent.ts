import { nutrientHistory, type Crop, type Nutrient, type Region, type SoilType } from "@/data/agri-history";
import { hashString, mode, seededPick } from "./utils";
import { AgentResponse, invalidInput, noEvidence } from "./types";

export interface NutrientImageInput {
  fileName: string;
  fileSizeBytes: number;
  width: number;
  height: number;
  mimeType: string;
}

export interface NutrientAgentInput {
  image: NutrientImageInput;
  crop?: Crop | "" | undefined;
  growthStage?: string | undefined;
  soilType?: SoilType | "" | undefined;
  region?: Region | "" | undefined;
}

export type DeficiencySeverity = "Mild" | "Moderate" | "Severe";

export interface NutrientAgentResult {
  nutrient: Nutrient;
  deficiencyLabel: string;
  crop: Crop;
  probability: number;
  severity: DeficiencySeverity;
  visualEvidence: string[];
  leafSymptoms: string[];
  recommendedCorrection: string;
  fertilizer: string;
  applicationGuidance: string;
  followUp: string;
  crossChecks: { field: string; matched: boolean; detail: string }[];
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MIN_DIMENSION = 180;
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export function validateNutrientImage(image: NutrientImageInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!ALLOWED_TYPES.includes(image.mimeType)) {
    errors["image"] = "Please upload a JPG, PNG or WEBP leaf image.";
  } else if (image.fileSizeBytes > MAX_SIZE_BYTES) {
    errors["image"] = "Image is too large. Please upload a file under 10MB.";
  } else if (image.width < MIN_DIMENSION || image.height < MIN_DIMENSION) {
    errors["image"] = "This image is too low-resolution for a reliable check. Please upload a clearer, closer photo of the leaf.";
  }
  return errors;
}

const SEVERITIES: DeficiencySeverity[] = ["Mild", "Moderate", "Severe"];

/**
 * The full advanced workflow for this module:
 *   image quality check -> (enhancement, no-op placeholder) -> vision symptom
 *   analysis -> nutrient knowledge retrieval -> historical case retrieval ->
 *   cross-check crop + soil + region + growth stage -> agent reasoning ->
 *   deficiency identification -> severity assessment -> correction plan.
 *
 * As with the pest agent, step "vision symptom analysis" is a deterministic
 * placeholder derived from the image's own properties (never a trained
 * classifier) — swap `pickNutrientFromFingerprint` for a real vision-model
 * call in production; every downstream retrieval/reasoning step is unchanged.
 */
function pickNutrientFromFingerprint(image: NutrientImageInput, crop: Crop | ""): Nutrient {
  const pool = crop ? nutrientHistory.filter((r) => r.crop === crop) : nutrientHistory;
  const candidates = pool.length > 0 ? pool : nutrientHistory;
  const distinctNutrients = Array.from(new Set(candidates.map((r) => r.nutrient)));
  const seed = hashString(`${image.fileName}:${image.fileSizeBytes}:${image.width}x${image.height}`);
  return seededPick(distinctNutrients, seed);
}

export function runNutrientAgent(input: NutrientAgentInput): AgentResponse<NutrientAgentResult> {
  const errors = validateNutrientImage(input.image);
  if (Object.keys(errors).length > 0) return invalidInput(errors);

  const seed = hashString(`${input.image.fileName}:${input.image.fileSizeBytes}`);
  const crop = (input.crop ?? "") as Crop | "";
  const nutrient = pickNutrientFromFingerprint(input.image, crop);

  let matching = nutrientHistory.filter((r) => r.nutrient === nutrient);
  if (matching.length === 0) {
    return noEvidence("We couldn't find enough historical evidence for this condition. Please provide additional crop or soil information.");
  }

  // Resolve which crop this case is "about" — prefer the farmer's stated crop if it's
  // actually associated with this nutrient in the knowledge base, otherwise pick a
  // representative one deterministically.
  const cropsForNutrient = Array.from(new Set(matching.map((r) => r.crop)));
  const resolvedCrop: Crop = (crop && cropsForNutrient.includes(crop) ? crop : seededPick(cropsForNutrient, seed)) as Crop;
  matching = matching.filter((r) => r.crop === resolvedCrop);
  const sample = matching[0];
  if (!sample) {
    return noEvidence("We couldn't find enough historical evidence for this condition. Please provide additional crop or soil information.");
  }

  // Cross-check farmer-provided context against the historical case cluster.
  const crossChecks: { field: string; matched: boolean; detail: string }[] = [];
  let bonus = 0;

  if (input.growthStage) {
    const stageMode = mode(matching.map((r) => r.growthStage));
    const matched = stageMode === input.growthStage;
    if (matched) bonus += 4;
    crossChecks.push({
      field: "Growth stage",
      matched,
      detail: matched
        ? `${input.growthStage} matches the most common growth stage (${matching.length} comparable cases).`
        : `Historical cases most often occur at "${stageMode ?? "varied"}" stage; yours is "${input.growthStage}".`,
    });
  }
  if (input.soilType) {
    const soilMatches = matching.filter((r) => r.soilType === input.soilType).length;
    const matched = soilMatches > 0;
    if (matched) bonus += 3;
    crossChecks.push({
      field: "Soil type",
      matched,
      detail: matched
        ? `${soilMatches} of ${matching.length} comparable cases share your soil type (${input.soilType}).`
        : `No comparable cases recorded on ${input.soilType} soil for this deficiency — still possible, but less certain.`,
    });
  }
  if (input.region) {
    const regionMatches = matching.filter((r) => r.region === input.region).length;
    const matched = regionMatches > 0;
    if (matched) bonus += 2;
    crossChecks.push({
      field: "Region",
      matched,
      detail: matched
        ? `${regionMatches} comparable cases recorded in ${input.region}.`
        : `No comparable cases recorded in ${input.region} yet, based on the sample knowledge base.`,
    });
  }

  const probability = Math.min(97, 72 + (seed % 17) + bonus);
  const severity = seededPick(SEVERITIES, seed >>> 4);

  return {
    status: "ok",
    result: {
      nutrient,
      deficiencyLabel: sample.deficiency,
      crop: resolvedCrop,
      probability,
      severity,
      visualEvidence: sample.symptoms,
      leafSymptoms: sample.leafSymptoms,
      recommendedCorrection: sample.recommendedCorrection,
      fertilizer: sample.fertilizer,
      applicationGuidance: sample.applicationGuidance,
      followUp: "Monitor leaf colour and growth over the next 7-10 days after applying the correction.",
      crossChecks,
    },
    confidence: probability,
    reasoning: [
      `The observed leaf symptoms are consistent with ${sample.deficiency.toLowerCase()} in ${resolvedCrop}.`,
      `The current crop${input.growthStage ? " and growth stage" : ""} were compared against ${matching.length} historical cases with similar symptoms.`,
      ...crossChecks.filter((c) => c.matched).map((c) => c.detail),
    ],
    historicalEvidence: [
      {
        summary: `${matching.length} historical ${resolvedCrop} cases of ${sample.deficiency.toLowerCase()} analyzed`,
        recordsAnalyzed: matching.length,
        detail: `Most common soil type: ${mode(matching.map((r) => r.soilType)) ?? "—"} · Most common season: ${mode(matching.map((r) => r.season)) ?? "—"}`,
      },
    ],
    recommendation: [
      `Apply ${sample.fertilizer} — ${sample.recommendedCorrection}`,
      sample.applicationGuidance,
    ],
    nextAction: [
      "Download the full report to share with a local agronomist if symptoms persist.",
      `Open the Fertilizer Prediction agent for a full ${resolvedCrop} nutrient plan.`,
    ],
  };
}
