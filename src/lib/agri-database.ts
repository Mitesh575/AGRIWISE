import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type AnalysisModule =
  | "crop-prediction"
  | "pest-detection"
  | "fertilizer-prediction"
  | "nutrient-deficiency"
  | "smart-irrigation"
  | "expert-advisor"
  | "farm-market-planner";

export interface AnalysisRecord {
  module: AnalysisModule;
  title: string;
  input: Record<string, unknown>;
  result: Record<string, unknown>;
}

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const databaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

function getClient() {
  if (!databaseConfigured) return null;
  client ??= createClient(url!, anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/**
 * Saves a compact field-analysis record. The application remains fully usable
 * without Supabase, so local development/demo mode never depends on a cloud DB.
 */
export async function saveAnalysis(record: AnalysisRecord): Promise<void> {
  const supabase = getClient();
  if (!supabase) return;

  const { error } = await supabase.from("field_analyses").insert({
    module: record.module,
    title: record.title,
    input_data: record.input,
    result_data: record.result,
  });

  if (error) console.warn("AgriWise database save skipped:", error.message);
}
