/**
 * Shared response envelope every farm agent returns.
 *
 * This shape is what makes the project visibly "agentic" rather than a bare
 * prediction endpoint: every agent always reports WHAT it concluded, HOW
 * confident it is, WHY (its reasoning over retrieved historical evidence),
 * and WHAT TO DO next — never just a bare number or label.
 */
export interface HistoricalEvidenceSummary {
  summary: string;
  recordsAnalyzed: number;
  detail?: string;
}

export interface AgentResponse<TResult> {
  status: "ok" | "no_evidence" | "invalid_input" | "error";
  /** Friendly message for no_evidence / invalid_input / error states. Never a raw stack trace. */
  message?: string;
  fieldErrors?: Record<string, string>;
  result?: TResult;
  confidence?: number; // 0-100
  reasoning?: string[];
  historicalEvidence?: HistoricalEvidenceSummary[];
  recommendation?: string[];
  nextAction?: string[];
}

export function invalidInput<T>(fieldErrors: Record<string, string>): AgentResponse<T> {
  return {
    status: "invalid_input",
    message: "A few fields need your attention before the agent can analyze your land.",
    fieldErrors,
  };
}

export function noEvidence<T>(message: string): AgentResponse<T> {
  return {
    status: "no_evidence",
    message,
  };
}

export function agentError<T>(message = "Something went wrong while the agent was analyzing your request. Please try again."): AgentResponse<T> {
  return {
    status: "error",
    message,
  };
}

/**
 * Runs an agent pipeline function and guarantees a valid AgentResponse is
 * always returned, even if the pipeline throws unexpectedly (e.g. a
 * malformed input slipping past validation, or a data-layer problem).
 * This is what keeps an agent failure from ever reaching the app's
 * route-level error boundary — the UI always gets a friendly, in-page
 * "agent failure" state instead of a blank/broken page.
 */
export function runAgentSafely<T>(fn: () => AgentResponse<T>): AgentResponse<T> {
  try {
    return fn();
  } catch (err) {
    console.error("[agent failure]", err);
    return agentError<T>();
  }
}
