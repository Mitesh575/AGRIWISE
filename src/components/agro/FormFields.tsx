import type { ReactNode } from "react";

const fieldClass =
  "mt-2 block w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm font-medium text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20";

export function FieldLabel({ children, error }: { children: ReactNode; error?: string | undefined }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
      {error && <span className="ml-2 normal-case text-[11px] font-semibold tracking-normal text-danger">{error}</span>}
    </label>
  );
}

export function NumberField({
  label, value, onChange, error, placeholder, suffix, min, max, step,
}: {
  label: string;
  value: number | string;
  onChange: (value: string) => void;
  error?: string | undefined;
  placeholder?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div>
      <FieldLabel error={error}>{label}</FieldLabel>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step ?? "any"}
          className={`${fieldClass} ${error ? "border-danger focus:border-danger focus:ring-danger/20" : ""} ${suffix ? "pr-14" : ""}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export function SelectField({
  label, value, onChange, options, error, placeholder = "Select…",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  error?: string | undefined;
  placeholder?: string;
}) {
  return (
    <div>
      <FieldLabel error={error}>{label}</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClass} cursor-pointer ${error ? "border-danger focus:border-danger focus:ring-danger/20" : ""}`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
