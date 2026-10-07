import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export function FarmToolCard({
  to, moduleNumber, icon, title, description,
}: {
  to: string;
  moduleNumber: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-panel p-6 shadow-[0_14px_45px_-32px_var(--foreground)] transition-all duration-300 hover:-translate-y-1 hover:border-brand/50 sm:p-7"
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="grid size-12 place-items-center rounded-xl bg-brand-soft text-2xl text-brand transition-transform duration-300 group-hover:scale-105">
            {icon}
          </span>
          <span className="display-font text-xs font-bold tracking-[0.16em] text-muted-foreground/70">MODULE {moduleNumber}</span>
        </div>
        <h3 className="display-font mt-5 text-xl font-semibold tracking-[-0.02em] text-foreground sm:text-2xl">{title}</h3>
        <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="mt-7 flex items-center gap-1.5 text-sm font-bold text-brand">
        Explore
        <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-2 ring-brand/40 transition-opacity duration-300 group-hover:opacity-100" />
    </Link>
  );
}
