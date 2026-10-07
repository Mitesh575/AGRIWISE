import type { Crop, SoilType, Season } from "@/data/agri-history";

export const IRRIGATION_CROPS = [
  "Rice", "Maize", "Groundnut", "Pulses", "Cotton", "Wheat", "Sugarcane", "Tomato",
] as const;

export type IrrigationCrop = (typeof IRRIGATION_CROPS)[number];
export const GROWTH_STAGES = ["Establishment", "Vegetative", "Flowering", "Fruit / Grain Filling", "Maturity"] as const;
export type GrowthStage = (typeof GROWTH_STAGES)[number];
export const IRRIGATION_METHODS = ["Drip", "Sprinkler", "Furrow", "Flood / Basin", "Rainfed"] as const;
export type IrrigationMethod = (typeof IRRIGATION_METHODS)[number];
export const MOISTURE_BANDS = ["Very dry (<25%)", "Dry (25–40%)", "Adequate (40–60%)", "Wet (60–75%)", "Waterlogged (>75%)"] as const;
export type MoistureBand = (typeof MOISTURE_BANDS)[number];

const CROP_WATER: Record<IrrigationCrop, { dailyMm: [number, number]; critical: GrowthStage[]; notes: string }> = {
  Rice: { dailyMm: [5, 8], critical: ["Establishment", "Flowering"], notes: "Keep the root zone moist; avoid unnecessary continuous standing water where alternate wetting and drying is suitable." },
  Maize: { dailyMm: [3, 5], critical: ["Flowering", "Fruit / Grain Filling"], notes: "Moisture stress around tasseling and grain filling can reduce yield quickly." },
  Groundnut: { dailyMm: [3, 5], critical: ["Flowering", "Fruit / Grain Filling"], notes: "Maintain steady moisture during pegging and pod development; avoid prolonged waterlogging." },
  Pulses: { dailyMm: [2, 4], critical: ["Flowering", "Fruit / Grain Filling"], notes: "Use light, timely irrigation; excessive moisture can increase disease risk." },
  Cotton: { dailyMm: [3, 5], critical: ["Flowering", "Fruit / Grain Filling"], notes: "Consistent moisture supports boll formation, but saturated soil can hurt roots." },
  Wheat: { dailyMm: [3, 5], critical: ["Establishment", "Flowering", "Fruit / Grain Filling"], notes: "Prioritize crown-root establishment, flowering and grain filling irrigations." },
  Sugarcane: { dailyMm: [5, 8], critical: ["Vegetative", "Fruit / Grain Filling"], notes: "High water demand is best managed with frequent root-zone irrigation rather than wasteful flooding." },
  Tomato: { dailyMm: [3, 5], critical: ["Flowering", "Fruit / Grain Filling"], notes: "Uniform moisture reduces blossom-end problems and fruit cracking risk." },
};

export interface IrrigationInput {
  crop: IrrigationCrop | "";
  growthStage: GrowthStage | "";
  moisture: number | string;
  area: number | string;
  temperature: number | string;
  rainfallForecast: number | string;
  soilType: SoilType | "";
  method: IrrigationMethod | "";
}

export interface IrrigationResult {
  dailyMm: number;
  eventMm: number;
  litersPerAcre: number;
  totalLiters: number;
  frequency: string;
  urgency: "Low" | "Moderate" | "High" | "Avoid";
  score: number;
  moistureTarget: string;
  recommendations: string[];
  efficiencyTips: string[];
}

export function calculateIrrigation(input: IrrigationInput): IrrigationResult {
  const crop = input.crop as IrrigationCrop;
  const profile = CROP_WATER[crop];
  const moisture = Number(input.moisture);
  const area = Number(input.area);
  const temperature = Number(input.temperature);
  const forecast = Number(input.rainfallForecast);
  const stage = input.growthStage as GrowthStage;
  const method = input.method as IrrigationMethod;
  const soil = input.soilType as SoilType;

  const base = (profile.dailyMm[0] + profile.dailyMm[1]) / 2;
  let dailyMm = base;
  if (temperature >= 34) dailyMm += 1;
  if (temperature <= 20) dailyMm -= 0.5;
  if (soil === "Sandy Loam") dailyMm += 0.5;
  if (soil === "Clay Loam") dailyMm -= 0.5;
  if (profile.critical.includes(stage)) dailyMm += 0.5;
  dailyMm = Math.max(profile.dailyMm[0], Math.min(profile.dailyMm[1] + 1, Math.round(dailyMm * 10) / 10));

  const deficit = Math.max(0, 60 - moisture) / 60;
  let eventMm = Math.max(0, Math.round(dailyMm * (0.8 + deficit * 1.4) * 10) / 10);
  if (forecast >= 15) eventMm = Math.max(0, Math.round(eventMm - Math.min(4, forecast * 0.15)));
  if (moisture >= 75) eventMm = 0;
  if (method === "Drip") eventMm = Math.round(eventMm * 0.85 * 10) / 10;
  if (method === "Flood / Basin") eventMm = Math.round(eventMm * 1.15 * 10) / 10;

  const litersPerAcre = Math.round(eventMm * 4047);
  const totalLiters = Math.round(litersPerAcre * area);
  const urgency: IrrigationResult["urgency"] = moisture >= 75 ? "Avoid" : moisture < 25 ? "High" : moisture < 40 ? "Moderate" : "Low";
  const score = Math.max(45, Math.min(98, Math.round(100 - Math.abs(52 - moisture) * 0.9 - (forecast > 10 ? 5 : 0))));

  const recommendations = [
    moisture >= 75 ? "Do not irrigate now. Improve drainage and recheck root-zone moisture before the next decision." : `Target the root zone with about ${eventMm} mm in the next irrigation event, then reassess moisture before repeating it.`,
    `${crop} typically needs about ${profile.dailyMm[0]}–${profile.dailyMm[1]} mm/day under normal conditions; adjust for heat, soil and rainfall rather than following a fixed calendar alone.`,
    profile.critical.includes(stage) ? `${stage} is a moisture-sensitive stage for ${crop}; avoid long dry gaps during this period.` : `At the ${stage.toLowerCase()} stage, avoid both severe drying and prolonged saturation.`,
  ];
  if (forecast >= 15) recommendations.push(`A rainfall forecast of ${forecast} mm can offset part of the requirement; delay or reduce irrigation if rain is actually received.`);
  if (temperature >= 34) recommendations.push("Hot conditions increase evaporative demand; irrigate during early morning or late evening and inspect plants for heat stress.");
  if (soil === "Sandy Loam") recommendations.push("Sandy soil drains quickly, so smaller and more frequent irrigation events are usually more efficient than large applications.");
  if (soil === "Clay Loam") recommendations.push("Clay soil stores water longer; allow the root zone to drain before another irrigation to reduce waterlogging.");

  const efficiencyTips = [
    method === "Drip" ? "Use emitter uniformity checks and flush filters/lines regularly." : "If practical, move toward drip or sprinkler scheduling to reduce conveyance and field losses.",
    "Check moisture 10–15 cm below the surface rather than judging only from the topsoil appearance.",
    "Irrigate in the cooler part of the day and record the date, duration and rainfall after each event.",
  ];

  return {
    dailyMm,
    eventMm,
    litersPerAcre,
    totalLiters,
    frequency: moisture < 40 ? "Recheck within 24 hours" : moisture < 60 ? "Recheck within 1–2 days" : "Recheck within 2–3 days",
    urgency,
    score,
    moistureTarget: "Aim for roughly 40–60% root-zone moisture for general scheduling; crop and soil conditions can shift the target.",
    recommendations,
    efficiencyTips,
  };
}

export const EXPERT_CROPS = IRRIGATION_CROPS;
export const FARM_GOALS = ["Higher yield", "Save water", "Reduce input cost", "Improve crop quality", "Reduce pest / disease risk"] as const;
export const CHALLENGES = ["Water shortage", "Pest pressure", "Nutrient problem", "Weather stress", "Low market price", "No major issue"] as const;
export const WATER_ACCESS = ["Reliable", "Limited", "Highly limited"] as const;

export interface ExpertInput {
  crop: IrrigationCrop | "";
  stage: GrowthStage | "";
  goal: (typeof FARM_GOALS)[number] | "";
  challenge: (typeof CHALLENGES)[number] | "";
  water: (typeof WATER_ACCESS)[number] | "";
  area: number | string;
}

export interface ExpertResult {
  score: number;
  specialist: string;
  priority: string;
  actions: string[];
  decisions: { label: string; value: string }[];
  warning: string;
}

export function getExpertAdvice(input: ExpertInput): ExpertResult {
  const crop = input.crop as IrrigationCrop;
  const stage = input.stage as GrowthStage;
  const baseSpecialist = input.challenge === "Pest pressure" ? "Integrated Pest Management advisor" : input.challenge === "Water shortage" ? "Water & irrigation specialist" : input.challenge === "Low market price" ? "Farm business & market advisor" : "Crop production advisor";
  const actions = [
    `Prioritize ${input.goal.toLowerCase()} for ${crop} at the ${stage.toLowerCase()} stage; make one measurable decision at a time and record the outcome.`,
    input.water === "Highly limited" ? "Use moisture-based scheduling, prioritize critical growth stages and avoid irrigating by routine calendar intervals." : "Match irrigation to root-zone moisture, recent rainfall and crop stage rather than using a fixed schedule.",
    input.challenge === "Pest pressure" ? "Scout twice a week, record pest incidence by area, and prefer threshold-based integrated pest management before spraying." : "Walk a representative section of the field before changing fertilizer, irrigation or crop-protection inputs.",
    "Keep simple records of irrigation, fertilizer, pest observations, labour and harvest so the next season's decisions are evidence-based.",
  ];
  if (input.goal === "Reduce input cost") actions.push("Compare cost per expected yield gain before adding another input; avoid overlapping products with the same nutrient or control objective.");
  if (input.goal === "Improve crop quality") actions.push("Prioritize uniform irrigation, balanced nutrition and harvest at the crop's recommended maturity stage.");
  if (input.challenge === "Weather stress") actions.push("Use short-term weather alerts to postpone risky sprays and protect moisture during heat or dry spells.");

  const decisions = [
    { label: "First decision", value: input.challenge === "No major issue" ? "Run a field walk + moisture check" : `Address ${input.challenge.toLowerCase()} first` },
    { label: "Efficiency focus", value: input.water === "Highly limited" ? "Water productivity" : input.goal === "Reduce input cost" ? "Input cost per acre" : "Yield per acre" },
    { label: "Review cycle", value: "Every 7 days" },
  ];

  return {
    score: Math.min(96, 74 + (input.challenge === "No major issue" ? 8 : 0) + (input.water === "Reliable" ? 6 : 0)),
    specialist: baseSpecialist,
    priority: input.challenge === "No major issue" ? "Preventive farm management" : `Immediate focus: ${input.challenge}`,
    actions,
    decisions,
    warning: "This is decision-support guidance, not a substitute for an on-site agricultural officer, soil test, plant-disease diagnosis or pesticide label directions.",
  };
}

export const MARKET_CROPS = IRRIGATION_CROPS;
export const STORAGE_OPTIONS = ["No storage", "1–7 days", "1–4 weeks", "More than 1 month"] as const;
export const SELLING_CHANNELS = ["Local market", "Wholesale trader", "Farmer Producer Organization (FPO)", "Direct to retailer", "Direct to consumer"] as const;

export interface MarketInput {
  crop: IrrigationCrop | "";
  area: number | string;
  expectedYield: number | string;
  sellingPrice: number | string;
  productionCost: number | string;
  transportCost: number | string;
  storage: (typeof STORAGE_OPTIONS)[number] | "";
  channel: (typeof SELLING_CHANNELS)[number] | "";
}

export interface MarketResult {
  production: number;
  revenue: number;
  totalCost: number;
  profit: number;
  margin: number;
  breakEven: number;
  strategy: string;
  actions: string[];
}

export function calculateMarketPlan(input: MarketInput): MarketResult {
  const area = Number(input.area);
  const yieldPerAcre = Number(input.expectedYield);
  const price = Number(input.sellingPrice);
  const costPerAcre = Number(input.productionCost);
  const transportPerAcre = Number(input.transportCost);
  const production = area * yieldPerAcre;
  const revenue = production * price;
  const totalCost = area * (costPerAcre + transportPerAcre);
  const profit = revenue - totalCost;
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
  const breakEven = yieldPerAcre > 0 ? Math.round((costPerAcre + transportPerAcre) / yieldPerAcre) : 0;

  let strategy = input.storage === "No storage" ? "Compare at least two buyers before harvest and avoid holding produce without a confirmed storage option." : "If quality can be maintained safely, compare today's offer with a short holding strategy after accounting for storage, spoilage and price risk.";
  if (input.channel.includes("FPO")) strategy = "Use the FPO channel to compare pooled volumes, grading requirements and negotiated price before committing the entire harvest.";
  if (margin < 10) strategy = "The estimated margin is tight. Recheck input costs, transport and buyer price before committing to the full selling plan.";

  return {
    production: Math.round(production * 100) / 100,
    revenue: Math.round(revenue),
    totalCost: Math.round(totalCost),
    profit: Math.round(profit),
    margin,
    breakEven,
    strategy,
    actions: [
      `Estimated break-even selling price is about ₹${breakEven} per kg/unit used in your price input.`,
      `For ${input.area} acre(s), plan transport and loading against the full estimated ${Math.round(production * 100) / 100} kg/unit production before booking a buyer.`,
      input.channel === "Local market" ? "Check mandi/local market arrivals and quality-grade price differences on the selling day." : "Confirm buyer grade, weighing method, payment terms and rejection rules before dispatch.",
      "Keep a simple harvest-to-sale record so the next crop plan uses actual realised price rather than only expected price.",
    ],
  };
}
