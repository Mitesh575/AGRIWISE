import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Bug,
  ChevronDown,
  CloudSun,
  FlaskConical,
  Menu,
  Microscope,
  ShieldCheck,
  Sparkles,
  Sprout,
  Wheat,
} from "lucide-react";
import fieldImage from "@/assets/agriwise-field.jpg";
import { FarmToolCard } from "@/components/agro/FarmToolCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AgriWise Connect | Smart Crop Intelligence" },
      { name: "description", content: "Farmer-friendly crop intelligence for pest and nutrient guidance." },
      { property: "og:title", content: "AgriWise Connect | Smart Crop Intelligence" },
      { property: "og:description", content: "Farmer-friendly crop intelligence for pest and nutrient guidance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <header className="relative z-10 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <a className="flex items-center gap-3" href="#top" aria-label="AgriWise Connect home">
            <span className="grid size-10 place-items-center rounded-xl bg-brand text-brand-foreground shadow-sm">
              <Sprout size={21} strokeWidth={2.5} />
            </span>
            <span>
              <span className="display-font block text-[15px] font-semibold tracking-[-0.02em] text-foreground">AgriWise</span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Connect</span>
            </span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex" aria-label="Primary navigation">
            <a className="text-foreground transition-colors hover:text-brand" href="#farm-tools">Farm Tools</a>
            <a className="transition-colors hover:text-brand" href="#seasonal">Seasonal watch</a>
            <a className="transition-colors hover:text-brand" href="#recent">Recent analyses</a>
          </nav>
          <div className="flex items-center gap-2">
            <button className="relative grid size-10 place-items-center rounded-xl border border-border bg-panel text-muted-foreground transition hover:border-brand/40 hover:text-brand" aria-label="View alerts">
              <Bell size={18} />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-sun" />
            </button>
            <button className="grid size-10 place-items-center rounded-xl border border-border bg-panel text-muted-foreground transition hover:border-brand/40 hover:text-brand md:hidden" aria-label="Open menu">
              <Menu size={19} />
            </button>
            <div className="hidden items-center gap-2.5 pl-2 sm:flex">
              <div className="grid size-9 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">RK</div>
              <div className="hidden leading-tight lg:block">
                <p className="text-xs font-semibold text-foreground">Ravi's farm</p>
                <p className="text-[11px] text-muted-foreground">Karnataka, IN</p>
              </div>
              <ChevronDown size={15} className="text-muted-foreground" />
            </div>
          </div>
        </div>
      </header>

      <section id="top" className="relative isolate min-h-[510px] overflow-hidden border-b border-border/70">
        <img className="absolute inset-0 -z-20 size-full object-cover object-center" src={fieldImage} alt="Farmer inspecting maize plants in a field" width={1600} height={900} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-foreground/90 via-foreground/55 to-foreground/10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-foreground/55 via-transparent to-foreground/10" />
        <div className="grain absolute inset-0 -z-10 opacity-20 mix-blend-soft-light" />
        <div className="mx-auto flex max-w-[1360px] items-end px-5 pb-14 pt-16 sm:px-8 lg:min-h-[510px] lg:px-12 lg:pb-20">
          <div className="max-w-2xl text-primary-foreground animate-rise-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground backdrop-blur-sm">
              <Sparkles size={14} className="text-sun" />
              Crop intelligence for every season
            </div>
            <h1 className="display-font max-w-2xl text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-6xl lg:text-7xl">Smart crop intelligence, grounded in your field.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-primary-foreground/80 sm:text-lg">Spot what your plants are telling you. Get an indicative view of crop fit, pest pressure, nutrient needs, and the next best step.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-primary-foreground/80">
              <span className="inline-flex items-center gap-2"><ShieldCheck size={17} className="text-sun" /> Evidence-led guidance</span>
              <span className="hidden size-1 rounded-full bg-primary-foreground/40 sm:block" />
              <span className="inline-flex items-center gap-2"><a href="#farm-tools" className="hover:underline">Explore the seven farm agents below</a></span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 hidden max-w-xs border-l border-t border-primary-foreground/20 bg-foreground/20 p-5 text-primary-foreground/80 backdrop-blur-md lg:block">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sun">Today's field note</p>
          <p className="mt-2 text-sm leading-6">Warm, humid conditions can increase early pest pressure. A quick image check helps you act sooner.</p>
        </div>
      </section>

      <section id="farm-tools" className="mx-auto max-w-[1360px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Farm Tools</p>
            <h2 className="display-font mt-2 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">Seven agents. One field view.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Each module is a specialized agricultural AI agent or decision-support tool — pick one to get started.</p>
          </div>
          <span className="hidden rounded-full bg-brand-soft px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-brand sm:inline-flex">Agentic AI · not ML prediction</span>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FarmToolCard
            to="/crop-prediction"
            moduleNumber="01"
            icon="🌱"
            title="Crop Prediction"
            description="Find the most suitable crop for your land using soil, weather and historical agricultural data."
          />
          <FarmToolCard
            to="/pest-detection"
            moduleNumber="02"
            icon="🐛"
            title="Pest Detection"
            description="Upload a crop image and identify possible pests, severity and recommended actions."
          />
          <FarmToolCard
            to="/fertilizer-prediction"
            moduleNumber="03"
            icon="🧪"
            title="Fertilizer Prediction"
            description="Get crop-specific fertilizer recommendations and quantity per acre."
          />
          <FarmToolCard
            to="/nutrient-deficiency"
            moduleNumber="04"
            icon="🔬"
            title="Nutrient Deficiency"
            description="Detect nutrient deficiencies from crop images and receive actionable correction guidance."
          />
          <FarmToolCard
            to="/smart-irrigation"
            moduleNumber="05"
            icon="💧"
            title="Smart Water Irrigation"
            description="Get crop- and moisture-aware irrigation quantity, timing and water-saving recommendations."
          />
          <FarmToolCard
            to="/expert-advisor"
            moduleNumber="06"
            icon="🧑‍🌾"
            title="Farm Expert Advisor"
            description="Turn your crop, growth stage and field challenge into practical expert-style decisions and action steps."
          />
          <FarmToolCard
            to="/farm-market-planner"
            moduleNumber="07"
            icon="📈"
            title="Farm Profit & Market Planner"
            description="Estimate harvest economics, break-even price, selling strategy and real-world market actions."
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <MiniStat icon={<Wheat size={16} />} label="Crop agent" value="8 crops" />
          <MiniStat icon={<Bug size={16} />} label="Pest agent" value="6 pests" />
          <MiniStat icon={<FlaskConical size={16} />} label="Fertilizer agent" value="5 fertilizers" />
          <MiniStat icon={<Microscope size={16} />} label="Nutrient agent" value="10 nutrients" />
        </div>
      </section>

      <section id="seasonal" className="border-y border-border/70 bg-panel-muted">
        <div className="mx-auto max-w-[1360px] px-5 py-12 sm:px-8 lg:px-12 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-panel px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand"><CloudSun size={14} /> Seasonal watch</div><h2 className="display-font text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">Stay a week ahead.</h2><p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">A simple pulse on weather and crop stage, so prevention can start before a problem becomes costly.</p><a href="#farm-tools" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand transition hover:gap-3">Explore the farm agents <ArrowRight size={16} /></a></div>
            <div className="grid gap-3 sm:grid-cols-3">
              <InsightStat icon={<CloudSun size={19} />} label="Field weather" value="28° C" detail="Warm · humid" tone="sun" />
              <InsightStat icon={<Wheat size={19} />} label="Crop stage" value="Vegetative" detail="Week 6 of 14" tone="brand" />
              <InsightStat icon={<Bell size={19} />} label="Pest pressure" value="Watch" detail="Rising this week" tone="danger" />
            </div>
          </div>
        </div>
      </section>

      <section id="recent" className="mx-auto max-w-[1360px] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Your field memory</p><h2 className="display-font mt-2 text-3xl font-semibold tracking-[-0.04em] text-foreground">Recent analyses</h2></div><button className="hidden items-center gap-2 text-sm font-bold text-brand sm:inline-flex">View history <ArrowRight size={16} /></button></div>
        <div className="mt-7 grid gap-3 md:grid-cols-3">
          <HistoryItem icon={<Microscope size={18} />} title="Pest check · Maize" label="Fall armyworm signal, medium severity" date="Today, 09:42" status="Review" />
          <HistoryItem icon={<FlaskConical size={18} />} title="Fertilizer plan · Rice" label="Urea + MOP plan generated for 2 acres" date="Yesterday, 16:18" status="Clear" />
          <HistoryItem icon={<Microscope size={18} />} title="Nutrient check · Tomato" label="Possible nitrogen deficiency" date="12 Jun, 11:05" status="Review" />
        </div>
      </section>

      <footer className="border-t border-border/70 bg-foreground text-background">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12"><div className="flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Sprout size={17} /></span><span className="display-font text-sm font-semibold">AgriWise Connect</span></div><p className="text-xs text-background/60">Indicative guidance for better crop decisions · Built with care for the field</p><div className="flex items-center gap-2 text-xs text-background/60"><span className="size-1.5 rounded-full bg-success" /> Demo environment</div></div>
      </footer>
    </main>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-panel px-4 py-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">{icon}</span>
      <div>
        <p className="text-xs font-semibold text-foreground">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function InsightStat({ icon, label, value, detail, tone }: { icon: React.ReactNode; label: string; value: string; detail: string; tone: "sun" | "brand" | "danger" }) {
  const toneClass = tone === "sun" ? "bg-sun/20 text-sun-foreground" : tone === "danger" ? "bg-danger/15 text-danger" : "bg-brand-soft text-brand";
  return <div className="rounded-xl border border-border bg-panel p-4"><div className={`grid size-9 place-items-center rounded-lg ${toneClass}`}>{icon}</div><p className="mt-5 text-xs font-semibold text-muted-foreground">{label}</p><p className="display-font mt-1 text-xl font-semibold tracking-[-0.03em] text-foreground">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
}

function HistoryItem({ icon, title, label, date, status }: { icon: React.ReactNode; title: string; label: string; date: string; status: "Clear" | "Review" | "Retry" }) {
  const statusClass = status === "Clear" ? "bg-success/15 text-success" : status === "Review" ? "bg-warning/20 text-warning-foreground" : "bg-danger/15 text-danger";
  return <article className="flex items-start gap-3 rounded-xl border border-border bg-panel p-4"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-panel-muted text-brand">{icon}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="truncate text-sm font-bold text-foreground">{title}</p><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${statusClass}`}>{status}</span></div><p className="mt-2 text-xs text-muted-foreground">{label}</p><p className="mt-3 text-[11px] text-muted-foreground/75">{date}</p></div></article>;
}
