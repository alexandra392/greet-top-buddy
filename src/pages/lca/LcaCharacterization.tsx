import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LCA_PRODUCTS } from "@/lib/lcaData";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Database,
  Sigma,
  Scale,
  Loader2,
  Play,
} from "lucide-react";

/**
 * Biomethane (Amato et al. 2023) EF 3.0 walk-through.
 * Step 1 — match each LCI flow to an ecoinvent 3.9 background EF
 * Step 2 — characterise per impact category (EF × CF)
 * Step 3 — normalise (÷ NF) & weight (× WF) → EF single score [PE]
 */

type Match = {
  flow: string;
  amount: number;
  unit: string;
  ecoinventRef: string;
  ef: number;        // kg CO2 eq per unit (for visual GWP column)
  efUnit: string;
};

const LCI_MATCHES: Match[] = [
  { flow: "Boiler natural gas",      amount: 0.040,  unit: "Nm³", ecoinventRef: "market for natural gas, high pressure | IT", ef: 1.9635, efUnit: "kg CO₂/Nm³" },
  { flow: "Grid electricity (net)",  amount: -0.0518, unit: "kWh", ecoinventRef: "market for electricity, medium voltage | IT", ef: 0.233,  efUnit: "kg CO₂ eq/kWh" },
  { flow: "Diesel, transport",       amount: 0.003,  unit: "L",   ecoinventRef: "market for diesel, low-sulfur | RER",          ef: 3.17,   efUnit: "kg CO₂/L" },
  { flow: "CH₄ slip (biogenic)",     amount: 0.0071, unit: "kg",  ecoinventRef: "elementary flow · IPCC AR5 GWP100",            ef: 34.0,   efUnit: "kg CO₂ eq/kg" },
  { flow: "NPK fertiliser credit",   amount: -2.3,   unit: "kg",  ecoinventRef: "market for inorganic NPK fertiliser | RER",    ef: 0.60,   efUnit: "kg CO₂ eq/kg" },
  { flow: "Beverage-grade CO₂ cr.",  amount: -1.4,   unit: "kg",  ecoinventRef: "market for liquid CO₂, food grade | RER",      ef: 0.41,   efUnit: "kg CO₂ eq/kg" },
];

// EF 3.0 results for 1 Nm³ biomethane (from the Amato report)
type Category = {
  key: string;
  name: string;
  result: number;
  unit: string;
  nf: number;     // normalisation factor (per person)
  wf: number;     // weighting factor (%)
};

const CATEGORIES: Category[] = [
  { key: "cc",   name: "Climate change",                result: -1.06,      unit: "kg CO₂ eq",     nf: 7553,     wf: 21.06 },
  { key: "ac",   name: "Acidification",                 result: -8.14e-3,   unit: "mol H⁺ eq",     nf: 55.6,     wf: 6.20 },
  { key: "eu_f", name: "Eutrophication, freshwater",    result: -2.10e-4,   unit: "kg P eq",       nf: 1.61,     wf: 2.80 },
  { key: "eu_m", name: "Eutrophication, marine",        result: -3.64e-4,   unit: "kg N eq",       nf: 19.5,     wf: 2.96 },
  { key: "eu_t", name: "Eutrophication, terrestrial",   result: -3.10e-3,   unit: "mol N eq",      nf: 176.8,    wf: 3.71 },
  { key: "pof",  name: "Photochemical ozone formation", result: -1.18e-3,   unit: "kg NMVOC eq",   nf: 40.9,     wf: 4.78 },
  { key: "pm",   name: "Particulate matter",            result: -4.50e-8,   unit: "disease inc.",  nf: 5.95e-4,  wf: 8.96 },
  { key: "od",   name: "Ozone depletion",               result: 1.40e-9,    unit: "kg CFC-11 eq",  nf: 0.0536,   wf: 6.31 },
  { key: "ir",   name: "Ionising radiation",            result: 0.116,      unit: "kBq U235 eq",   nf: 4220,     wf: 5.01 },
  { key: "etx",  name: "Ecotoxicity, freshwater",       result: 0.0083,     unit: "CTUe",          nf: 42700,    wf: 1.92 },
  { key: "lu",   name: "Land use",                      result: 0.067,      unit: "Pt",            nf: 819498,   wf: 7.94 },
  { key: "wu",   name: "Water use",                     result: 0.0021,     unit: "m³ world eq",   nf: 11468.7,  wf: 8.51 },
  { key: "rf",   name: "Resource use, fossils",         result: -2.45,      unit: "MJ",            nf: 65004.3,  wf: 8.32 },
  { key: "rm",   name: "Resource use, min. & metals",   result: 4.25e-6,    unit: "kg Sb eq",      nf: 0.0636,   wf: 7.55 },
];

const STAGES = [
  { key: "match",     title: "Matching LCI with ecoinvent emission factors",   subtitle: "Each foreground flow is paired with an ecoinvent 3.9 background dataset.", icon: Database },
  { key: "character", title: "Characterising flows (EF × CF) → impact results", subtitle: "Activity × emission factor × EF 3.0 characterisation factor per category.", icon: Sigma },
  { key: "normalize", title: "Normalising & weighting → EF Single Score",       subtitle: "Result ÷ NF × WF, summed across the 16 EF 3.0 categories.",                icon: Scale },
] as const;

const STEP_SLUGS = ["match", "characterize", "normalize"] as const;
type StepSlug = (typeof STEP_SLUGS)[number];

export default function LcaCharacterization() {
  const { id, step: stepParam } = useParams<{ id: string; step?: StepSlug }>();
  const navigate = useNavigate();
  const product = useMemo(() => LCA_PRODUCTS.find((p) => p.id === id), [id]);

  const stage = Math.max(0, STEP_SLUGS.indexOf((stepParam ?? "match") as StepSlug));
  const goStep = (i: number) =>
    navigate(`/lca/products/${id}/characterization/${STEP_SLUGS[i]}`);

  // Per-stage animation state — resets on remount when route changes
  const [matchedCount, setMatchedCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [normRunning, setNormRunning] = useState(false);
  const [normCount, setNormCount] = useState(0);

  useEffect(() => {
    if (stage !== 0 || matchedCount >= LCI_MATCHES.length) return;
    const t = setTimeout(() => setMatchedCount((c) => c + 1), 450);
    return () => clearTimeout(t);
  }, [stage, matchedCount]);

  useEffect(() => {
    if (stage !== 1 || charCount >= CATEGORIES.length) return;
    const t = setTimeout(() => setCharCount((c) => c + 1), 220);
    return () => clearTimeout(t);
  }, [stage, charCount]);

  useEffect(() => {
    if (stage !== 2 || !normRunning || normCount >= CATEGORIES.length) return;
    const t = setTimeout(() => setNormCount((c) => c + 1), 260);
    return () => clearTimeout(t);
  }, [stage, normRunning, normCount]);

  if (!product) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 pt-6">
        <Button variant="outline" size="sm" onClick={() => navigate("/lca")}>Back to LCA Tool</Button>
        <p className="text-sm text-muted-foreground mt-4">Product not found.</p>
      </div>
    );
  }

  const normalized = CATEGORIES.map((c) => (c.result / c.nf) * (c.wf / 100));
  const singleScore = normalized.reduce((a, b) => a + b, 0);
  const revealedScore = normalized.slice(0, normCount).reduce((a, b) => a + b, 0);

  const matchDone = matchedCount >= LCI_MATCHES.length;
  const charDone = charCount >= CATEGORIES.length;
  const normDone = normCount >= CATEGORIES.length;

  return (
    <div className="h-full bg-background">
      <div className="max-w-[1400px] w-full mx-auto px-6 pt-4 pb-8">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-7 text-xs"
            onClick={() =>
              stage > 0
                ? goStep(stage - 1)
                : navigate(`/lca/products/${product.id}/retrieval`)
            }
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>
          <button
            onClick={() => navigate(`/lca/products/${product.id}/performance`)}
            disabled={!normDone}
            className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue to performance <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <h1 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">
          LCA Tool · {product.name}
        </h1>
        <h2 className="text-xl font-bold text-foreground mb-1">Impact Characterisation — EF 3.0</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Functional unit: 1 Nm³ biomethane delivered to the IT grid · Source: Amato et al. (2023) · ecoinvent 3.9 background
        </p>

        {/* Stage stepper */}
        <div className="flex items-center gap-2 mb-5">
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            const done =
              (i === 0 && matchDone) || (i === 1 && charDone) || (i === 2 && normDone);
            const active = stage === i;
            return (
              <div key={s.key} className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => goStep(i)}
                  className={`flex items-center gap-2 flex-1 rounded-lg border px-3 py-2 text-left transition-colors hover:border-primary/40 ${
                    active
                      ? "border-primary/40 bg-primary/[0.04]"
                      : done
                      ? "border-primary/30 bg-primary/[0.02]"
                      : "border-border/60 bg-card"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      done
                        ? "bg-primary text-primary-foreground"
                        : active
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Step {i + 1}
                    </div>
                    <div className="text-xs font-semibold text-foreground truncate">{s.title}</div>
                  </div>
                </button>
                {i < STAGES.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground mb-3">{STAGES[stage].subtitle}</p>

        {/* Stage content */}
        {stage === 0 && (
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <div className="grid grid-cols-[1.4fr_90px_80px_1.6fr_140px] gap-3 px-4 py-2 bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <div>LCI Flow</div>
              <div className="text-right">Amount</div>
              <div>Unit</div>
              <div>ecoinvent 3.9 reference</div>
              <div className="text-right">Emission factor</div>
            </div>
            {LCI_MATCHES.map((m, i) => {
              const shown = i < matchedCount;
              const matching = i === matchedCount;
              return (
                <div
                  key={m.flow}
                  className={`grid grid-cols-[1.4fr_90px_80px_1.6fr_140px] gap-3 px-4 py-2.5 border-b border-border/40 last:border-b-0 text-xs transition-colors ${
                    matching ? "bg-primary/[0.04]" : shown ? "" : "opacity-40"
                  }`}
                >
                  <div className="font-medium text-foreground">{m.flow}</div>
                  <div className="text-right font-semibold text-foreground tabular-nums">
                    {m.amount}
                  </div>
                  <div className="text-muted-foreground">{m.unit}</div>
                  <div className="text-muted-foreground italic flex items-center gap-1.5">
                    {matching ? (
                      <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    ) : shown ? (
                      <CheckCircle2 className="w-3 h-3 text-primary" />
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-border" />
                    )}
                    <span className="truncate">{m.ecoinventRef}</span>
                  </div>
                  <div className="text-right font-mono text-[11px] text-foreground">
                    {shown ? `${m.ef} ${m.efUnit}` : "—"}
                  </div>
                </div>
              );
            })}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/20 border-t border-border/60">
              <div className="text-[11px] text-muted-foreground">
                {matchedCount} / {LCI_MATCHES.length} flows matched
              </div>
              <Button
                size="sm"
                className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!matchDone}
                onClick={() => goStep(1)}
              >
                Characterise impacts <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {stage === 1 && (
          <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
            <div className="grid grid-cols-[1.6fr_160px_120px_1fr] gap-3 px-4 py-2 bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <div>Impact category</div>
              <div className="text-right">Result</div>
              <div>Unit</div>
              <div className="text-right pr-2">Sign</div>
            </div>
            {CATEGORIES.map((c, i) => {
              const shown = i < charCount;
              const negative = c.result < 0;
              return (
                <div
                  key={c.key}
                  className={`grid grid-cols-[1.6fr_160px_120px_1fr] gap-3 px-4 py-2 border-b border-border/40 last:border-b-0 text-xs transition-opacity ${
                    shown ? "opacity-100" : "opacity-30"
                  }`}
                >
                  <div className="font-medium text-foreground">{c.name}</div>
                  <div className="text-right font-mono text-[11px] text-foreground tabular-nums">
                    {shown ? c.result.toExponential(2) : "…"}
                  </div>
                  <div className="text-muted-foreground">{c.unit}</div>
                  <div className="flex justify-end pr-2">
                    {shown && (
                      <span
                        className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          negative
                            ? "bg-primary/10 text-primary"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {negative ? "Net benefit" : "Net burden"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="flex items-center justify-between px-4 py-3 bg-muted/20 border-t border-border/60">
              <div className="text-[11px] text-muted-foreground">
                {charCount} / {CATEGORIES.length} categories computed
              </div>
              <Button
                size="sm"
                className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!charDone}
                onClick={() => goStep(2)}
              >
                Normalise & weight <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {stage === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="grid grid-cols-[1.5fr_110px_110px_90px_120px] gap-3 px-4 py-2 bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <div>Category</div>
                <div className="text-right">Result</div>
                <div className="text-right">÷ NF</div>
                <div className="text-right">× WF%</div>
                <div className="text-right">PE</div>
              </div>
              {CATEGORIES.map((c, i) => {
                const shown = i < normCount;
                const pe = (c.result / c.nf) * (c.wf / 100);
                return (
                  <div
                    key={c.key}
                    className={`grid grid-cols-[1.5fr_110px_110px_90px_120px] gap-3 px-4 py-1.5 border-b border-border/40 last:border-b-0 text-[11px] transition-opacity ${
                      shown ? "opacity-100" : "opacity-30"
                    }`}
                  >
                    <div className="font-medium text-foreground truncate">{c.name}</div>
                    <div className="text-right font-mono tabular-nums text-foreground">
                      {c.result.toExponential(2)}
                    </div>
                    <div className="text-right font-mono tabular-nums text-muted-foreground">
                      {c.nf.toExponential(2)}
                    </div>
                    <div className="text-right font-mono tabular-nums text-muted-foreground">
                      {c.wf.toFixed(2)}
                    </div>
                    <div
                      className={`text-right font-mono tabular-nums font-semibold ${
                        pe < 0 ? "text-primary" : "text-amber-600"
                      }`}
                    >
                      {shown ? pe.toExponential(2) : "…"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-border/60 bg-card p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  EF Single Score
                </div>
                <div className="text-3xl font-bold text-foreground tabular-nums mb-1">
                  {(normRunning ? revealedScore : 0).toExponential(3)}
                </div>
                <div className="text-[11px] text-muted-foreground mb-3">Person-Equivalents / Nm³</div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden mb-3">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${(normCount / CATEGORIES.length) * 100}%` }}
                  />
                </div>
                <div className="text-[11px] text-muted-foreground leading-relaxed">
                  Score is the sum of <span className="font-mono">(result ÷ NF) × WF</span> across
                  all {CATEGORIES.length} EF 3.0 categories. A negative score indicates a net
                  environmental benefit vs. the displaced fossil reference.
                </div>
              </div>

              {!normRunning ? (
                <Button
                  className="h-9 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setNormRunning(true)}
                >
                  <Play className="w-3.5 h-3.5 mr-1.5" /> Run normalisation
                </Button>
              ) : normDone ? (
                <div className="rounded-lg border border-primary/30 bg-primary/[0.05] px-3 py-2 text-[11px] text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  Final EF score: <span className="font-mono font-semibold">{singleScore.toExponential(3)} PE</span>
                </div>
              ) : (
                <div className="rounded-lg border border-border/60 bg-card px-3 py-2 text-[11px] text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  Normalising category {normCount + 1} / {CATEGORIES.length}…
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
