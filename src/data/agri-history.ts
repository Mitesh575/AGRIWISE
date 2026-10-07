/**
 * ============================================================================
 * SAMPLE / MOCK HISTORICAL AGRICULTURAL DATASET — FOR DEVELOPMENT ONLY
 * ============================================================================
 * No real agronomic records were bundled with this project, so this file
 * generates a clearly-labeled, deterministic sample dataset that stands in
 * for a real historical records store. It exists so the four farm agents
 * (crop / pest / fertilizer / nutrient) have something concrete to retrieve
 * and reason over during development and demos.
 *
 * To go to production: replace `buildSampleDataset()` below with a loader
 * that reads your real historical records (CSV/DB/API) into the same
 * `CropYieldRecord[]` / `FertilizerRecord[]` / `PestRecord[]` /
 * `NutrientRecord[]` shapes — every agent in `src/agents/` consumes only
 * these typed arrays, so nothing else needs to change.
 *
 * IMPORTANT: this dataset is deliberately NOT a trained model and is never
 * used to fit one. Agents only ever filter/score/read these records at
 * request time (retrieval + reasoning), per the project's agentic-AI
 * requirement.
 * ============================================================================
 */

export const REGIONS = [
  "Karnataka", "Odisha", "Punjab", "Maharashtra", "Tamil Nadu", "Uttar Pradesh", "West Bengal", "Andhra Pradesh",
] as const;

export const SOIL_TYPES = ["Alluvial", "Black (Regur)", "Red Loam", "Laterite", "Sandy Loam", "Clay Loam"] as const;

export const SEASONS = ["Kharif", "Rabi", "Zaid"] as const;

export const CROPS = ["Rice", "Maize", "Groundnut", "Pulses", "Cotton", "Wheat", "Sugarcane", "Tomato"] as const;

export type Region = (typeof REGIONS)[number];
export type SoilType = (typeof SOIL_TYPES)[number];
export type Season = (typeof SEASONS)[number];
export type Crop = (typeof CROPS)[number];

export interface CropYieldRecord {
  id: string;
  year: number;
  region: Region;
  crop: Crop;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  soilType: SoilType;
  season: Season;
  yieldTonnesPerAcre: number;
}

export interface FertilizerRecord {
  id: string;
  year: number;
  region: Region;
  crop: Crop;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  soilType: SoilType;
  season: Season;
  fertilizer: string;
  quantityKgPerAcre: number;
  yieldTonnesPerAcre: number;
}

export type Severity = "Low" | "Medium" | "High";

export interface PestRecord {
  id: string;
  year: number;
  region: Region;
  crop: Crop;
  pest: string;
  season: Season;
  symptoms: string[];
  weather: string;
  severity: Severity;
  historicalOccurrence: number; // times recorded in the sample set's source years
  treatment: string;
  prevention: string[];
  pesticideCategory: string;
  nonChemicalControl: string[];
}

export type Nutrient = "Nitrogen" | "Phosphorus" | "Potassium" | "Calcium" | "Magnesium" | "Sulfur" | "Iron" | "Zinc" | "Boron" | "Manganese";

export interface NutrientRecord {
  id: string;
  year: number;
  region: Region;
  crop: Crop;
  nutrient: Nutrient;
  deficiency: string;
  symptoms: string[];
  leafSymptoms: string[];
  growthStage: string;
  soilType: SoilType;
  ph: number;
  season: Season;
  weather: string;
  recommendedCorrection: string;
  fertilizer: string;
  applicationGuidance: string;
}

/** Small deterministic PRNG so the sample dataset is stable across reloads/builds. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20240601);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)] as T;
const range = (min: number, max: number) => min + rand() * (max - min);
const roundTo = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

/** Typical agro-climatic "home range" per crop, used to generate plausible (not random) records. */
const CROP_PROFILES: Record<Crop, {
  n: [number, number]; p: [number, number]; k: [number, number]; ph: [number, number];
  temp: [number, number]; humidity: [number, number]; rainfall: [number, number];
  soils: SoilType[]; seasons: Season[]; baseYield: [number, number];
}> = {
  Rice: { n: [70, 110], p: [30, 55], k: [35, 60], ph: [5.5, 6.8], temp: [24, 34], humidity: [70, 92], rainfall: [150, 300], soils: ["Alluvial", "Clay Loam"], seasons: ["Kharif"], baseYield: [3.2, 4.8] },
  Maize: { n: [60, 100], p: [25, 50], k: [25, 45], ph: [5.8, 7.2], temp: [21, 32], humidity: [55, 78], rainfall: [70, 160], soils: ["Red Loam", "Sandy Loam", "Alluvial"], seasons: ["Kharif", "Rabi"], baseYield: [2.6, 4.0] },
  Groundnut: { n: [20, 45], p: [35, 60], k: [30, 55], ph: [6.0, 7.5], temp: [24, 33], humidity: [45, 68], rainfall: [50, 120], soils: ["Sandy Loam", "Red Loam"], seasons: ["Kharif", "Zaid"], baseYield: [1.2, 2.1] },
  Pulses: { n: [15, 35], p: [30, 55], k: [20, 40], ph: [6.2, 7.6], temp: [20, 30], humidity: [40, 62], rainfall: [40, 100], soils: ["Black (Regur)", "Red Loam"], seasons: ["Rabi", "Zaid"], baseYield: [0.8, 1.6] },
  Cotton: { n: [55, 95], p: [20, 42], k: [25, 48], ph: [6.0, 8.0], temp: [25, 36], humidity: [40, 65], rainfall: [60, 130], soils: ["Black (Regur)", "Sandy Loam"], seasons: ["Kharif"], baseYield: [1.0, 1.9] },
  Wheat: { n: [65, 105], p: [30, 55], k: [25, 45], ph: [6.3, 7.8], temp: [12, 24], humidity: [40, 60], rainfall: [40, 90], soils: ["Alluvial", "Clay Loam"], seasons: ["Rabi"], baseYield: [2.8, 4.2] },
  Sugarcane: { n: [100, 160], p: [40, 70], k: [60, 100], ph: [6.0, 7.5], temp: [24, 36], humidity: [65, 85], rainfall: [150, 280], soils: ["Alluvial", "Black (Regur)"], seasons: ["Kharif", "Zaid"], baseYield: [28, 42] },
  Tomato: { n: [50, 90], p: [35, 60], k: [40, 70], ph: [6.0, 7.0], temp: [20, 29], humidity: [55, 75], rainfall: [50, 110], soils: ["Red Loam", "Sandy Loam"], seasons: ["Rabi", "Zaid"], baseYield: [9, 16] },
};

function buildCropYieldHistory(): CropYieldRecord[] {
  const records: CropYieldRecord[] = [];
  let i = 0;
  for (const crop of CROPS) {
    const profile = CROP_PROFILES[crop];
    const sampleSize = 26; // per crop
    for (let s = 0; s < sampleSize; s++) {
      i++;
      records.push({
        id: `cy-${i}`,
        year: Math.floor(range(2018, 2025)),
        region: pick(REGIONS),
        crop,
        nitrogen: Math.round(range(...profile.n)),
        phosphorus: Math.round(range(...profile.p)),
        potassium: Math.round(range(...profile.k)),
        ph: roundTo(range(...profile.ph), 1),
        temperature: Math.round(range(...profile.temp)),
        humidity: Math.round(range(...profile.humidity)),
        rainfall: Math.round(range(...profile.rainfall)),
        soilType: pick(profile.soils),
        season: pick(profile.seasons),
        yieldTonnesPerAcre: roundTo(range(...profile.baseYield), 2),
      });
    }
  }
  return records;
}

const FERTILIZER_BY_CROP: Record<Crop, { name: string; kgPerAcre: [number, number] }[]> = {
  Rice: [{ name: "Urea", kgPerAcre: [35, 55] }, { name: "DAP", kgPerAcre: [20, 35] }, { name: "MOP", kgPerAcre: [15, 28] }],
  Maize: [{ name: "Urea", kgPerAcre: [30, 48] }, { name: "SSP", kgPerAcre: [25, 40] }, { name: "MOP", kgPerAcre: [12, 22] }],
  Groundnut: [{ name: "SSP", kgPerAcre: [30, 48] }, { name: "Gypsum", kgPerAcre: [18, 30] }, { name: "MOP", kgPerAcre: [10, 18] }],
  Pulses: [{ name: "DAP", kgPerAcre: [15, 25] }, { name: "SSP", kgPerAcre: [18, 28] }],
  Cotton: [{ name: "Urea", kgPerAcre: [28, 45] }, { name: "DAP", kgPerAcre: [18, 30] }, { name: "MOP", kgPerAcre: [14, 24] }],
  Wheat: [{ name: "Urea", kgPerAcre: [32, 50] }, { name: "DAP", kgPerAcre: [20, 32] }],
  Sugarcane: [{ name: "Urea", kgPerAcre: [60, 90] }, { name: "SSP", kgPerAcre: [35, 55] }, { name: "MOP", kgPerAcre: [30, 48] }],
  Tomato: [{ name: "Urea", kgPerAcre: [25, 40] }, { name: "DAP", kgPerAcre: [20, 32] }, { name: "MOP", kgPerAcre: [18, 30] }],
};

function buildFertilizerHistory(): FertilizerRecord[] {
  const records: FertilizerRecord[] = [];
  let i = 0;
  for (const crop of CROPS) {
    const profile = CROP_PROFILES[crop];
    const options = FERTILIZER_BY_CROP[crop];
    for (let s = 0; s < 18; s++) {
      i++;
      const fert = pick(options);
      records.push({
        id: `fr-${i}`,
        year: Math.floor(range(2018, 2025)),
        region: pick(REGIONS),
        crop,
        nitrogen: Math.round(range(...profile.n)),
        phosphorus: Math.round(range(...profile.p)),
        potassium: Math.round(range(...profile.k)),
        ph: roundTo(range(...profile.ph), 1),
        soilType: pick(profile.soils),
        season: pick(profile.seasons),
        fertilizer: fert.name,
        quantityKgPerAcre: Math.round(range(...fert.kgPerAcre)),
        yieldTonnesPerAcre: roundTo(range(...profile.baseYield), 2),
      });
    }
  }
  return records;
}

const PEST_PROFILES: {
  pest: string; crops: Crop[]; symptoms: string[]; severity: Severity[];
  treatment: string; prevention: string[]; pesticideCategory: string; nonChemical: string[];
}[] = [
  { pest: "Fall Armyworm", crops: ["Maize"], symptoms: ["Irregular holes in leaves", "Larval feeding marks", "Damaged whorl tissue", "Sawdust-like frass"], severity: ["Medium", "High"], treatment: "Apply recommended larvicide to the whorl region and affected leaves.", prevention: ["Field sanitation", "Regular crop monitoring", "Early pest detection", "Pheromone trapping"], pesticideCategory: "Larvicide (whorl application)", nonChemical: ["Hand-picking larvae in small plots", "Encouraging natural predators (birds, parasitic wasps)", "Intercropping with legumes"] },
  { pest: "Stem Borer", crops: ["Rice"], symptoms: ["Dead heart in young plants", "White ear heads", "Holes near the stem base"], severity: ["Low", "Medium", "High"], treatment: "Apply recommended systemic insecticide at early tillering stage.", prevention: ["Remove stubble after harvest", "Synchronous planting across the field", "Light traps for adult moths"], pesticideCategory: "Systemic insecticide (stem/root zone)", nonChemical: ["Release of Trichogramma egg parasitoids", "Clipping and destroying egg masses"] },
  { pest: "Aphids", crops: ["Cotton", "Pulses", "Wheat"], symptoms: ["Curled, yellowing leaves", "Sticky honeydew residue", "Sooty mould growth", "Stunted shoot growth"], severity: ["Low", "Medium"], treatment: "Apply recommended aphicide if colonies exceed threshold.", prevention: ["Avoid excess nitrogen", "Encourage ladybird beetle population", "Border cropping with sorghum"], pesticideCategory: "Aphicide / insecticidal soap", nonChemical: ["Neem-based spray", "Yellow sticky traps", "Conserving natural predators"] },
  { pest: "Whitefly", crops: ["Cotton", "Tomato"], symptoms: ["Yellowing and curling leaves", "Sooty mould on leaf surface", "Reduced vigor", "Viral mosaic symptoms in severe cases"], severity: ["Medium", "High"], treatment: "Apply recommended systemic insecticide, rotate chemical groups to manage resistance.", prevention: ["Yellow sticky traps", "Remove alternate weed hosts", "Avoid water stress"], pesticideCategory: "Systemic insecticide (foliar)", nonChemical: ["Reflective mulches", "Neem oil spray", "Encouraging Encarsia parasitic wasps"] },
  { pest: "Pod Borer", crops: ["Pulses", "Groundnut"], symptoms: ["Circular holes in pods", "Larvae feeding inside pods", "Premature pod drop"], severity: ["Medium", "High"], treatment: "Apply recommended larvicide during flowering/pod formation.", prevention: ["Pheromone traps for monitoring", "Timely sowing", "Crop rotation with cereals"], pesticideCategory: "Larvicide (foliar/pod application)", nonChemical: ["Bird perches to encourage predation", "Hand-collection in small plots", "NPV-based biopesticide"] },
  { pest: "Leaf Folder", crops: ["Rice"], symptoms: ["Folded, tube-like leaves", "Scraped leaf tissue", "White longitudinal streaks"], severity: ["Low", "Medium"], treatment: "Apply recommended insecticide only if damage exceeds threshold.", prevention: ["Balanced nitrogen application", "Maintain field bunds clean", "Avoid water stagnation"], pesticideCategory: "Foliar insecticide", nonChemical: ["Conserve spiders and parasitic wasps", "Rope-dragging to dislodge larvae"] },
];

function buildPestHistory(): PestRecord[] {
  const records: PestRecord[] = [];
  let i = 0;
  for (const profile of PEST_PROFILES) {
    const occurrenceBase = Math.floor(range(180, 420));
    for (const crop of profile.crops) {
      for (let s = 0; s < 10; s++) {
        i++;
        records.push({
          id: `pr-${i}`,
          year: Math.floor(range(2019, 2025)),
          region: pick(REGIONS),
          crop,
          pest: profile.pest,
          season: pick(SEASONS),
          symptoms: profile.symptoms,
          weather: pick(["Warm & humid", "Hot & dry", "Mild & wet", "Post-monsoon humidity"]),
          severity: pick(profile.severity),
          historicalOccurrence: occurrenceBase,
          treatment: profile.treatment,
          prevention: profile.prevention,
          pesticideCategory: profile.pesticideCategory,
          nonChemicalControl: profile.nonChemical,
        });
      }
    }
  }
  return records;
}

const NUTRIENT_PROFILES: {
  nutrient: Nutrient; crops: Crop[]; deficiency: string; symptoms: string[]; leafSymptoms: string[];
  growthStages: string[]; correction: string; fertilizer: string; guidance: string;
}[] = [
  { nutrient: "Nitrogen", crops: ["Rice", "Maize", "Wheat", "Cotton", "Sugarcane"], deficiency: "Nitrogen Deficiency", symptoms: ["General chlorosis", "Reduced leaf growth", "Thin, spindly stems"], leafSymptoms: ["Yellowing of older (lower) leaves first", "V-shaped yellowing from leaf tip"], growthStages: ["Vegetative", "Tillering", "Early growth"], correction: "Apply an appropriate nitrogen fertilizer according to crop requirements and soil-test guidance.", fertilizer: "Urea (split application)", guidance: "Apply in 2-3 split doses rather than one single dose, with the final dose before peak vegetative growth." },
  { nutrient: "Phosphorus", crops: ["Groundnut", "Pulses", "Wheat"], deficiency: "Phosphorus Deficiency", symptoms: ["Dark green to purplish leaf tinge", "Stunted root development", "Delayed maturity"], leafSymptoms: ["Purplish discoloration on older leaves", "Dull, dark-green leaf colour"], growthStages: ["Seedling", "Early vegetative"], correction: "Apply a phosphorus-rich basal fertilizer at sowing, placed close to the root zone.", fertilizer: "SSP (Single Super Phosphate) / DAP", guidance: "Apply as basal dose at sowing; phosphorus is largely immobile so late correction has limited benefit." },
  { nutrient: "Potassium", crops: ["Cotton", "Sugarcane", "Tomato", "Groundnut"], deficiency: "Potassium Deficiency", symptoms: ["Weak stalks", "Poor fruit/boll filling", "Increased lodging risk"], leafSymptoms: ["Scorching/browning of leaf margins", "Yellowing between veins on older leaves"], growthStages: ["Flowering", "Fruiting/boll development"], correction: "Apply potash fertilizer, particularly ahead of the flowering/fruiting stage.", fertilizer: "MOP (Muriate of Potash)", guidance: "Split into basal and top-dress applications timed before flowering." },
  { nutrient: "Calcium", crops: ["Tomato", "Groundnut"], deficiency: "Calcium Deficiency", symptoms: ["Blossom-end rot on fruit", "Weak new growth", "Pod-tip necrosis in groundnut"], leafSymptoms: ["Distorted young leaves", "Necrotic leaf margins on new growth"], growthStages: ["Fruiting", "Pod development"], correction: "Apply gypsum or a calcium-based soil amendment and ensure consistent irrigation.", fertilizer: "Gypsum", guidance: "Apply at pegging/flowering stage for groundnut; maintain even soil moisture to aid calcium uptake." },
  { nutrient: "Magnesium", crops: ["Cotton", "Sugarcane"], deficiency: "Magnesium Deficiency", symptoms: ["Interveinal chlorosis on older leaves", "Premature leaf drop"], leafSymptoms: ["Interveinal yellowing with green veins on older leaves"], growthStages: ["Mid-vegetative", "Flowering"], correction: "Apply magnesium sulfate as a foliar spray or soil amendment.", fertilizer: "Magnesium Sulfate (Epsom salt)", guidance: "Foliar spray gives a faster response than soil application on standing crop." },
  { nutrient: "Sulfur", crops: ["Groundnut", "Pulses", "Rice"], deficiency: "Sulfur Deficiency", symptoms: ["Overall pale yellow-green colour", "Stunted growth", "Delayed flowering"], leafSymptoms: ["Yellowing of younger leaves first (opposite of nitrogen)"], growthStages: ["Vegetative"], correction: "Apply a sulfur-containing fertilizer such as gypsum or ammonium sulfate.", fertilizer: "Gypsum / Ammonium Sulfate", guidance: "Apply as a basal dose; particularly common on sandy, low-organic-matter soils." },
  { nutrient: "Iron", crops: ["Rice", "Groundnut"], deficiency: "Iron Deficiency", symptoms: ["Pale, nearly white new growth", "Stunted young leaves"], leafSymptoms: ["Interveinal chlorosis on young (upper) leaves with green veins"], growthStages: ["Early vegetative"], correction: "Apply a foliar iron chelate spray; avoid overwatering which worsens uptake.", fertilizer: "Iron Chelate (Fe-EDTA) foliar spray", guidance: "2-3 foliar sprays at 10-day intervals typically resolve visible symptoms faster than soil application." },
  { nutrient: "Zinc", crops: ["Rice", "Maize"], deficiency: "Zinc Deficiency", symptoms: ["Stunted plant height", "Shortened internodes", "Delayed maturity"], leafSymptoms: ["Interveinal chlorotic bands on middle leaves", "Bronzing of leaf tissue"], growthStages: ["Tillering", "Early vegetative"], correction: "Apply zinc sulfate to the soil or as a foliar spray.", fertilizer: "Zinc Sulfate", guidance: "Common on alkaline and heavily-irrigated soils; soil application at transplanting works well for rice." },
  { nutrient: "Boron", crops: ["Cotton", "Groundnut", "Tomato"], deficiency: "Boron Deficiency", symptoms: ["Hollow stem or fruit cavities", "Poor flower/boll set", "Cracked petioles"], leafSymptoms: ["Thickened, brittle young leaves", "Death of growing tip in severe cases"], growthStages: ["Flowering", "Boll/fruit set"], correction: "Apply borax as a soil or foliar application, in small, carefully measured amounts.", fertilizer: "Borax", guidance: "Boron has a narrow safe range — apply only the recommended small quantity per acre." },
  { nutrient: "Manganese", crops: ["Wheat", "Rice"], deficiency: "Manganese Deficiency", symptoms: ["Grey-brown necrotic flecks on leaves", "Reduced tillering"], leafSymptoms: ["Interveinal chlorosis with grey speckling on younger leaves"], growthStages: ["Tillering"], correction: "Apply manganese sulfate as a foliar spray, especially on high-pH soils.", fertilizer: "Manganese Sulfate", guidance: "Foliar correction is preferred since manganese becomes less available in alkaline soils." },
];

function buildNutrientHistory(): NutrientRecord[] {
  const records: NutrientRecord[] = [];
  let i = 0;
  for (const profile of NUTRIENT_PROFILES) {
    for (const crop of profile.crops) {
      const cropProfile = CROP_PROFILES[crop];
      for (let s = 0; s < 8; s++) {
        i++;
        records.push({
          id: `nr-${i}`,
          year: Math.floor(range(2019, 2025)),
          region: pick(REGIONS),
          crop,
          nutrient: profile.nutrient,
          deficiency: profile.deficiency,
          symptoms: profile.symptoms,
          leafSymptoms: profile.leafSymptoms,
          growthStage: pick(profile.growthStages),
          soilType: pick(cropProfile.soils),
          ph: roundTo(range(...cropProfile.ph), 1),
          season: pick(cropProfile.seasons),
          weather: pick(["Warm & humid", "Hot & dry", "Mild", "Post-monsoon"]),
          recommendedCorrection: profile.correction,
          fertilizer: profile.fertilizer,
          applicationGuidance: profile.guidance,
        });
      }
    }
  }
  return records;
}

export const cropYieldHistory: CropYieldRecord[] = buildCropYieldHistory();
export const fertilizerHistory: FertilizerRecord[] = buildFertilizerHistory();
export const pestHistory: PestRecord[] = buildPestHistory();
export const nutrientHistory: NutrientRecord[] = buildNutrientHistory();

export const DATASET_META = {
  label: "Sample historical agricultural dataset (development only)",
  years: "2018 – 2024",
  totalRecords: cropYieldHistory.length + fertilizerHistory.length + pestHistory.length + nutrientHistory.length,
};
