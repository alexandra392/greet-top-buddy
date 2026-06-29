import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LCA_PRODUCTS } from "@/lib/lcaData";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  Link2,
  Ruler,
  MapPin,
  Target,
  Calendar,
  Table as TableIcon,
} from "lucide-react";

type SelectedLca = {
  id: string;
  title: string;
  provider: string;
  year: number;
  method: string;
};

type StudyParams = {
  valueChain: string;
  functionalUnit: string;
  location: string;
  scope: string;
  year: number;
};

type LciRow = {
  flow: string;
  type: "Input" | "Output";
  amount: string;
  unit: string;
};

const VALUE_CHAINS = [
  "Agricultural residues to bio-based polymers",
  "Sugarcane molasses to bio-ethanol",
  "Forestry residues to bio-methanol",
  "Municipal organics to biomethane",
  "Vegetable oils to bio-lubricants",
];
const LOCATIONS = ["Italy", "Germany", "France", "Spain", "Netherlands", "EU-27"];
const SCOPES = ["Cradle to gate", "Cradle to grave", "Gate to gate"];
const UNITS = ["kg", "MJ", "Nm³", "kWh", "L"];

function hash(s: string) {
  return Array.from(s).reduce((a, c) => a + c.charCodeAt(0), 0);
}

function buildStudyParams(lca: SelectedLca, productName: string): StudyParams {
  const h = hash(lca.id);
  return {
    valueChain: VALUE_CHAINS[h % VALUE_CHAINS.length],
    functionalUnit: `1 ${UNITS[h % UNITS.length]} ${productName}`,
    location: LOCATIONS[h % LOCATIONS.length],
    scope: SCOPES[h % SCOPES.length],
    year: lca.year,
  };
}

function buildLciTable(lca: SelectedLca): LciRow[] {
  const h = hash(lca.id);
  const base = [
    { flow: "Biomass feedstock", type: "Input" as const, unit: "kg" },
    { flow: "Process water", type: "Input" as const, unit: "L" },
    { flow: "Electricity (grid)", type: "Input" as const, unit: "kWh" },
    { flow: "Natural gas", type: "Input" as const, unit: "MJ" },
    { flow: "Catalyst / enzymes", type: "Input" as const, unit: "kg" },
    { flow: "Main product", type: "Output" as const, unit: "kg" },
    { flow: "CO₂ emissions", type: "Output" as const, unit: "kg" },
    { flow: "Wastewater", type: "Output" as const, unit: "L" },
    { flow: "Solid residues", type: "Output" as const, unit: "kg" },
  ];
  return base.map((r, i) => {
    const v = ((h * (i + 3)) % 900) / 10 + 0.4;
    return { ...r, amount: v.toFixed(2) };
  });
}

export default function LcaRetrieval() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const product = useMemo(() => LCA_PRODUCTS.find((p) => p.id === id), [id]);

  const selected: SelectedLca[] = (location.state as any)?.selectedLcas ?? [];

  const ITEM_DURATION_MS = 60000; // ~1 minute per dataset
  const TICK_MS = 500;
  const [progress, setProgress] = useState(0); // 0..selected.length (completed count)
  const [subProgress, setSubProgress] = useState(0); // 0..1 progress within current item
  const [phase, setPhase] = useState<"loading" | "review">(
    selected.length === 0 ? "review" : "loading"
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (phase !== "loading") return;
    if (progress >= selected.length) {
      const t = setTimeout(() => setPhase("review"), 400);
      return () => clearTimeout(t);
    }
    const step = TICK_MS / ITEM_DURATION_MS;
    const interval = setInterval(() => {
      setSubProgress((s) => {
        const next = s + step;
        if (next >= 1) {
          setProgress((p) => p + 1);
          return 0;
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [progress, phase, selected.length]);

  if (!product) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 pt-6">
        <Button variant="outline" size="sm" onClick={() => navigate("/lca")}>Back to LCA Tool</Button>
        <p className="text-sm text-muted-foreground mt-4">Product not found.</p>
      </div>
    );
  }

  if (selected.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 pt-6">
        <Button variant="outline" size="sm" onClick={() => navigate(`/lca/products/${product.id}/matches`)}>
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to matches
        </Button>
        <p className="text-sm text-muted-foreground mt-4">No datasets selected.</p>
      </div>
    );
  }

  // LOADING PHASE
  if (phase === "loading") {
    const pct = Math.min(100, Math.round(((progress + subProgress) / selected.length) * 100));
    return (
      <div className="h-full bg-background flex flex-col">
        <div className="max-w-[1400px] w-full mx-auto px-6 pt-4 pb-6 flex-1 flex flex-col">
          <div className="mb-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-7 text-xs"
              onClick={() => navigate(`/lca/products/${product.id}/matches`)}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
          </div>
          <h1 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
            Retrieving LCA Analyses for {product.name}
          </h1>
          <p className="text-xs text-muted-foreground mb-6">
            Extracting study parameters and LCI tables from {selected.length} selected datasets…
          </p>

          <div className="rounded-xl border border-border/60 bg-card p-6 max-w-3xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                Processing {progress} / {selected.length}
              </div>
              <span className="text-xs font-bold text-primary tabular-nums">{pct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-5">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="space-y-2">
              {selected.map((lca, i) => {
                const done = i < progress;
                const active = i === progress;
                return (
                  <div
                    key={lca.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-md border border-border/40 bg-background"
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      ) : active ? (
                        <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-border" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{lca.title}</div>
                      <div className="text-[11px] text-muted-foreground">{lca.provider} · {lca.year}</div>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                      {done ? "Retrieved" : active ? "Retrieving…" : "Queued"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // REVIEW PHASE
  const lca = selected[activeIdx];
  const params = buildStudyParams(lca, product.name);
  const lci = buildLciTable(lca);
  const isConfirmed = !!confirmed[lca.id];
  const allConfirmed = selected.every((s) => confirmed[s.id]);

  function confirmCurrent() {
    setConfirmed((c) => ({ ...c, [lca.id]: true }));
    if (activeIdx < selected.length - 1) {
      setActiveIdx(activeIdx + 1);
    }
  }

  function proceedAll() {
    navigate(`/lca/products/${product.id}/performance`, {
      state: { selectedLcaIds: selected.map((s) => s.id) },
    });
  }

  return (
    <div className="h-full bg-background flex flex-col">
      <div className="max-w-[1400px] w-full mx-auto px-6 pt-4 pb-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-7 text-xs"
            onClick={() => navigate(`/lca/products/${product.id}/matches`)}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {Object.values(confirmed).filter(Boolean).length} / {selected.length} confirmed
            </span>
            <button
              onClick={proceedAll}
              disabled={!allConfirmed}
              className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Proceed to performance <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <h1 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
          Confirm Extracted Data — {product.name}
        </h1>
        <p className="text-xs text-muted-foreground mb-4">
          Review the study parameters and LCI table extracted from each dataset before proceeding.
        </p>

        <div className="grid grid-cols-[260px_1fr] gap-4 flex-1 min-h-0">
          {/* Sidebar: dataset list */}
          <div className="rounded-xl border border-border/60 bg-card p-2 overflow-y-auto">
            {selected.map((s, i) => {
              const done = !!confirmed[s.id];
              const active = i === activeIdx;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveIdx(i)}
                  className={`w-full text-left px-3 py-2.5 rounded-md mb-1 transition-colors ${
                    active ? "bg-primary/[0.08] border border-primary/30" : "hover:bg-muted border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      ) : (
                        <div className={`w-3.5 h-3.5 rounded-full border ${active ? "border-primary" : "border-border"}`} />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground tabular-nums">#{i + 1}</span>
                    <span className="text-xs font-semibold text-foreground truncate flex-1">{s.provider}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate mt-1 pl-6">{s.title}</div>
                </button>
              );
            })}
          </div>

          {/* Main: study params + LCI */}
          <div className="flex flex-col gap-4 overflow-y-auto pr-1">
            <div className="rounded-xl border border-border/60 bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="w-3.5 h-3.5 text-primary" />
                </div>
                <h2 className="text-sm font-bold text-foreground">Study Parameters</h2>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground ml-2">
                  {lca.provider} · {lca.method}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <ParamRow icon={Link2} label="Value Chain" value={params.valueChain} />
                <ParamRow icon={Ruler} label="Functional Unit" value={params.functionalUnit} />
                <ParamRow icon={MapPin} label="Geographical Location" value={params.location} />
                <ParamRow icon={Target} label="Scope" value={params.scope} />
                <ParamRow icon={Calendar} label="Year of Analysis" value={String(params.year)} />
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border/60">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <TableIcon className="w-3.5 h-3.5 text-primary" />
                </div>
                <h2 className="text-sm font-bold text-foreground">LCI Table Extracted</h2>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground ml-2">
                  {lci.length} flows
                </span>
              </div>
              <div className="grid grid-cols-[1fr_90px_120px_80px] gap-4 px-5 py-2 bg-muted/30 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                <div>Flow</div>
                <div>Type</div>
                <div className="text-right">Amount</div>
                <div>Unit</div>
              </div>
              {lci.map((row) => (
                <div
                  key={row.flow}
                  className="grid grid-cols-[1fr_90px_120px_80px] gap-4 px-5 py-2.5 border-b border-border/40 last:border-b-0 text-xs"
                >
                  <div className="font-medium text-foreground">{row.flow}</div>
                  <div>
                    <span
                      className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        row.type === "Input"
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {row.type}
                    </span>
                  </div>
                  <div className="text-right font-semibold text-foreground tabular-nums">{row.amount}</div>
                  <div className="text-muted-foreground">{row.unit}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1 pb-2">
              <div className="text-xs text-muted-foreground">
                Dataset {activeIdx + 1} of {selected.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  disabled={activeIdx === 0}
                  onClick={() => setActiveIdx(activeIdx - 1)}
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Previous
                </Button>
                {isConfirmed && activeIdx < selected.length - 1 ? (
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-foreground text-background hover:bg-foreground/90"
                    onClick={() => setActiveIdx(activeIdx + 1)}
                  >
                    Next dataset <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={confirmCurrent}
                    disabled={isConfirmed}
                  >
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    {isConfirmed ? "Confirmed" : "Confirm & continue"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ParamRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="text-sm font-semibold text-foreground truncate">{value}</div>
      </div>
    </div>
  );
}
