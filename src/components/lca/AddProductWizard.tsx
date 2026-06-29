import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LcaProduct } from "@/lib/lcaData";

type Section = {
  key: string;
  label: string;
  steps: { title: string; subtitle: string }[];
};

const SECTIONS: Section[] = [
  {
    key: "general",
    label: "General Information",
    steps: [
      { title: "Identity", subtitle: "Basic product identification details" },
      { title: "Manufacturer", subtitle: "Manufacturer, production site and geographic context" },
      { title: "Compliance & Docs", subtitle: "Regulatory information and documentation" },
    ],
  },
  {
    key: "product",
    label: "Product Information",
    steps: [
      { title: "Feedstocks & Composition", subtitle: "Raw materials, feedstocks and product composition" },
      { title: "Manufacturing & Technology", subtitle: "Production processes, technology and plant details" },
      { title: "Energy & Resources", subtitle: "Energy, fuel, water and auxiliary materials" },
      { title: "Transport", subtitle: "Logistics and distribution information" },
      { title: "Outputs & Co-products", subtitle: "Co-products, by-products and their utilisation" },
      { title: "Sustainability", subtitle: "Environmental impact and end-of-life details" },
    ],
  },
  {
    key: "review",
    label: "Review",
    steps: [{ title: "Data Confidence", subtitle: "Data accuracy and recording practices" }],
  },
];

type Draft = Record<string, string>;

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (p: LcaProduct) => void;
}

export default function AddProductWizard({ open, onOpenChange, onSubmit }: Props) {
  const [sectionIdx, setSectionIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [draft, setDraft] = useState<Draft>({});

  const section = SECTIONS[sectionIdx];
  const step = section.steps[stepIdx];
  const totalSteps = section.steps.length;
  const isLastStepOfSection = stepIdx === totalSteps - 1;
  const isLastSection = sectionIdx === SECTIONS.length - 1;

  const set = (k: string, v: string) => setDraft((d) => ({ ...d, [k]: v }));
  const v = (k: string) => draft[k] ?? "";

  const reset = () => {
    setSectionIdx(0);
    setStepIdx(0);
    setDraft({});
  };

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) reset();
  };

  const goNext = () => {
    if (!isLastStepOfSection) return setStepIdx((s) => s + 1);
    if (!isLastSection) {
      setSectionIdx((s) => s + 1);
      setStepIdx(0);
      return;
    }
    const np: LcaProduct = {
      id: `custom-${Date.now()}`,
      name: v("productName") || "Untitled product",
      category: v("category") || v("productCategory") || "Uncategorised",
      description: v("productDescription") || v("mainUse") || "User-added product (baseline pending).",
      image: "📦",
      functionalUnit: v("productMeasurementUnit") || "1 unit",
      systemBoundary:
        (v("systemBoundary") as LcaProduct["systemBoundary"]) || "Cradle-to-Gate",
      status: "not_started",
      mass_kg: Number(v("annualOutput")) || 1,
    };
    onSubmit(np);
    close(false);
  };

  const goBack = () => {
    if (stepIdx > 0) return setStepIdx((s) => s - 1);
    if (sectionIdx > 0) {
      const prev = SECTIONS[sectionIdx - 1];
      setSectionIdx((s) => s - 1);
      setStepIdx(prev.steps.length - 1);
    }
  };

  const goToStep = (sIdx: number, stIdx: number) => {
    // only allow navigating to already-visited steps or current section's steps
    if (sIdx > sectionIdx) return;
    setSectionIdx(sIdx);
    setStepIdx(stIdx);
  };

  const nextLabel = useMemo(() => {
    if (isLastSection && isLastStepOfSection) return "Submit";
    if (isLastStepOfSection) return "Next section";
    return "Continue";
  }, [isLastSection, isLastStepOfSection]);

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden p-0 gap-0">
        <div className="flex flex-col max-h-[92vh]">
          {/* Compact top header */}
          <div className="px-6 pt-4 pb-2 border-b border-border bg-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="text-[10px] uppercase tracking-widest text-primary font-semibold">
                  LCA Tool
                </div>
                <span className="text-muted-foreground/40">·</span>
                <div className="text-sm font-semibold text-foreground leading-tight">
                  Add Product
                </div>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {section.label} · {step.title}
              </div>
            </div>

            {/* Minimal horizontal stepper */}
            <div className="flex items-center gap-1">
              {SECTIONS.map((s, i) => {
                const done = i < sectionIdx;
                const active = i === sectionIdx;
                const reachable = i <= sectionIdx;
                return (
                  <div key={s.key} className="flex items-center flex-1 min-w-0">
                    <button
                      type="button"
                      disabled={!reachable}
                      onClick={() => goToStep(i, 0)}
                      className={cn(
                        "flex items-center gap-1.5 w-full text-left transition-colors rounded px-2 py-1",
                        active && "bg-primary/5",
                        !active && !done && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold tabular-nums",
                          active && "bg-primary text-primary-foreground",
                          done && !active && "bg-primary/15 text-primary",
                          !active && !done && "bg-muted text-muted-foreground",
                        )}
                      >
                        {done ? <Check className="w-2.5 h-2.5" /> : i + 1}
                      </span>
                      <span className={cn(
                        "text-[10px] uppercase tracking-wider font-medium truncate",
                        active ? "text-foreground" : "text-muted-foreground",
                      )}>
                        {s.label}
                      </span>
                    </button>
                    {i < SECTIONS.length - 1 && (
                      <ChevronRight className={cn(
                        "w-3 h-3 shrink-0 mx-0.5",
                        done ? "text-primary/40" : "text-muted-foreground/30",
                      )} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-[220px_1fr] flex-1 min-h-0">
            {/* Vertical sub-step sidebar */}
            <aside className="bg-muted/20 border-r border-border px-3 py-4 overflow-y-auto">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-2 mb-2">
                {section.label}
              </div>
              <ul className="space-y-0.5">
                {section.steps.map((st, j) => {
                  const stActive = j === stepIdx;
                  const stDone = j < stepIdx;
                  return (
                    <li key={st.title}>
                      <button
                        type="button"
                        onClick={() => goToStep(sectionIdx, j)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs transition-colors",
                          stActive
                            ? "bg-primary/10 text-foreground font-semibold"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                        )}
                      >
                        <span className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold tabular-nums",
                          stActive && "bg-primary text-primary-foreground",
                          stDone && "bg-primary/15 text-primary",
                          !stActive && !stDone && "bg-muted text-muted-foreground",
                        )}>
                          {stDone ? <Check className="w-2.5 h-2.5" /> : j + 1}
                        </span>
                        <span className="truncate">{st.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>

            {/* Main content */}
            <div className="flex flex-col min-h-0">
              <DialogHeader className="px-6 pt-4 pb-3 border-b border-border space-y-0.5">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-sm font-bold text-foreground">
                    {step.title}
                  </DialogTitle>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    Step {stepIdx + 1} of {totalSteps}
                  </span>
                </div>
                <DialogDescription className="text-[11px] text-muted-foreground">
                  {step.subtitle}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                <StepFields sectionKey={section.key} stepIdx={stepIdx} v={v} set={set} />
              </div>

              <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-muted/30">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goBack}
                  disabled={sectionIdx === 0 && stepIdx === 0}
                  className="h-7 text-[11px]"
                >
                  <ChevronLeft className="w-3 h-3" />
                  Back
                </Button>
                <Button size="sm" onClick={goNext} className="h-7 text-[11px]">
                  {nextLabel}
                  {!(isLastSection && isLastStepOfSection) && <ChevronRight className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- step fields ---------------- */

function Field({
  label,
  children,
  required,
  full,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  full?: boolean;
  hint?: string;
}) {
  return (
    <div className={cn("space-y-1.5", full && "md:col-span-2")}>
      <div>
        <Label className="text-[11px] font-semibold text-foreground uppercase tracking-wide">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        {hint && (
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{hint}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function SectionGroup({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <div className="flex items-center gap-3">
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-primary whitespace-nowrap">
            {title}
          </h3>
          <div className="h-px flex-1 bg-border" />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
        {children}
      </div>
    </div>
  );
}

const inputCls = "h-8 !text-xs md:!text-xs";
const areaCls = "!text-xs min-h-[60px] py-2";
const triggerCls = "h-8 !text-xs";

function StepFields({
  sectionKey,
  stepIdx,
  v,
  set,
}: {
  sectionKey: string;
  stepIdx: number;
  v: (k: string) => string;
  set: (k: string, v: string) => void;
}) {
  const key = `${sectionKey}-${stepIdx}`;
  const input = (k: string, placeholder?: string) => (
    <Input className={inputCls} value={v(k)} onChange={(e) => set(k, e.target.value)} placeholder={placeholder} />
  );
  const area = (k: string, placeholder?: string, rows = 2) => (
    <Textarea
      className={areaCls}
      rows={rows}
      value={v(k)}
      onChange={(e) => set(k, e.target.value)}
      placeholder={placeholder}
    />
  );
  const select = (k: string, opts: string[]) => (
    <Select value={v(k)} onValueChange={(val) => set(k, val)}>
      <SelectTrigger className={triggerCls}>
        <SelectValue placeholder="Select…" />
      </SelectTrigger>
      <SelectContent>
        {opts.map((o) => (
          <SelectItem key={o} value={o} className="text-[11px]">
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  switch (key) {
    case "general-0":
      return (
        <div className="space-y-5">
          <SectionGroup title="Identity">
            <Field label="Product / Commercial Name" required hint="e.g. Biomethane">{input("productName", "Biomethane")}</Field>
            <Field label="Model / Variant / Grade" hint="e.g. BM-CAM-A, Grid-Quality">{input("modelVariant", "BM-CAM-A, Grid-Quality")}</Field>
            <Field label="Product Form (how it is sold)" full hint="e.g. Compressed biomethane injected into the natural gas grid">{input("productForm", "Compressed biomethane injected into the natural gas grid")}</Field>
          </SectionGroup>
          <SectionGroup title="Usage">
            <Field label="Main Use of the Product" full hint="e.g. Renewable energy carrier for heating and transport fuel">{area("mainUse", "Renewable energy carrier for heating and transport fuel")}</Field>
            <Field label="Product Measurement Unit" hint="e.g. Nm³ biomethane">{input("productMeasurementUnit", "Nm³ biomethane")}</Field>
          </SectionGroup>
          <SectionGroup title="Classification &amp; Tracking">
            <Field label="Unique Product Identifier (UID)" required hint="e.g. GTIN-IT-8033421-BM001">{input("uid", "GTIN-IT-8033421-BM001")}</Field>
            <Field label="Identifier Scheme">{select("identifierScheme", ["GTIN", "GS1", "ISBN", "Internal"])}</Field>
            <Field label="Granularity">{select("granularity", ["item", "batch", "model"])}</Field>
            <Field label="Data Carrier Type">{select("dataCarrier", ["QR", "Barcode", "NFC", "RFID"])}</Field>
            <Field label="Product Category / UN CPC" full hint="e.g. Energy / Gaseous Fuels — Biomethane (UN CPC 1200)">{input("productCategory", "Energy / Gaseous Fuels — Biomethane (UN CPC 1200)")}</Field>
          </SectionGroup>
        </div>
      );
    case "general-1":
      return (
        <div className="space-y-5">
          <SectionGroup title="Manufacturer">
            <Field label="Manufacturer / Producer Legal Name" required hint="e.g. BioEnergia Campania S.r.l.">{input("manufacturerName", "BioEnergia Campania S.r.l.")}</Field>
            <Field label="Business Identifier / Registration Number" hint="e.g. IT-NA-REA-512874">{input("businessId", "IT-NA-REA-512874")}</Field>
            <Field label="Economic Operator Role">{select("operatorRole", ["manufacturer", "importer", "distributor", "authorised representative"])}</Field>
            <Field label="Facility Identifier" hint="e.g. FAC-IT-CE-00312">{input("facilityId", "FAC-IT-CE-00312")}</Field>
          </SectionGroup>
          <SectionGroup title="Production Site">
            <Field label="Production Site Name" hint="e.g. Impianto Biometano Campania Nord">{input("siteName", "Impianto Biometano Campania Nord")}</Field>
            <Field label="Production Site Address" hint="e.g. Campania, South Italy / IT">{input("siteAddress", "Campania, South Italy / IT")}</Field>
            <Field label="Country" required>{input("country", "Italy")}</Field>
            <Field label="Region">{input("region", "Campania")}</Field>
            <Field label="Production Date">
              <Input className={inputCls} type="date" value={v("productionDate")} onChange={(e) => set("productionDate", e.target.value)} />
            </Field>
          </SectionGroup>
        </div>
      );
    case "general-2":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Applicable Regulation(s) and Standard(s)" full>{area("regulations", "EU ESPR 2024/1781; EN 16723-1")}</Field>
          <Field label="Declaration of Performance & Conformity (DoPC)">{input("dopc", "DoPC-BM-CAM-2021")}</Field>
          <Field label="Linked Technical Documentation">{input("technicalDocs", "https://...")}</Field>
          <Field label="Safety Information / Instructions for Use">{input("safetyInfo", "URL to safety info")}</Field>
          <Field label="Contact Email / Support URL">{input("contact", "info@example.com")}</Field>
        </div>
      );
    case "product-0":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Product Description (composition, form, physical state)" required full>{area("productDescription", "Biomethane gas, upgraded from agricultural and food-industry waste biogas…")}</Field>
          <Field label="Key Functional Materials / Components" full>{area("functionalMaterials", "Raw biogas: CH₄ 57.2 vol%…")}</Field>
          <Field label="Feedstocks / Input Materials (type, mass, source)" full>{area("feedstocksInputs", "Mixed biomass (organic waste) — 30.0 kg/Nm³ — Municipal waste collection")}</Field>
          <Field label="Feedstock Shares (%)" full>{area("feedstockShares", "Mixed municipal bio-waste (OFMSW) 100%")}</Field>
          <Field label="Feedstock Origin & Provenance" full>{area("feedstockOrigin", "Municipal organic waste from Campania region municipalities")}</Field>
          <Field label="Do Any Inputs Have a DPP or EPD?" full>{area("inputsDppEpd", "Polymer antifoam additive — EPD available (PTC100)")}</Field>
          <Field label="Biogenic vs. Synthetic Material Fraction">{input("biogenicFraction", "~100% biogenic")}</Field>
          <Field label="Chemical Composition (N, moisture, protein, lignin)">{input("chemicalComposition", "CH₄ 57.2 vol% raw biogas; upgraded to >97% CH₄")}</Field>
          <Field label="Source of Bio-based Materials">{input("bioSource", "Municipal organic waste (OFMSW)")}</Field>
          <Field label="Pre- and Post-consumer Recycled Content">{input("recycledContent", "100% waste-derived feedstock")}</Field>
          <Field label="Packaging Type and Mass" full>{input("packaging", "No packaging — gaseous product injected directly into pipeline network")}</Field>
        </div>
      );
    case "product-1":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Production Technology" full>{area("productionTech", "Mesophilic anaerobic digestion with membrane biogas upgrading")}</Field>
          <Field label="Reactor / Equipment Type">{input("reactorType", "Continuous Stirred Tank Reactor (CSTR)")}</Field>
          <Field label="Operating Temperature">{input("operatingTemp", "~37°C (mesophilic digestion)")}</Field>
          <Field label="Emission Treatment Systems" full>{area("emissionTreatment", "Biological scrubber for H₂S removal…")}</Field>
          <Field label="Plant Production Capacity">{input("plantCapacity", "300 Nm³ biomethane/hour")}</Field>
          <Field label="Number of Production Facilities">{input("numFacilities", "2")}</Field>
          <Field label="Annual Production Output" full>{input("annualOutput", "6,804,000 Nm³/year biomethane (total both plants)")}</Field>
          <Field label="Manufacturing Process Overview" full>{area("processOverview", "Anaerobic digestion → biogas purification → upgrading → compression → grid injection", 3)}</Field>
          <Field label="Packaging Produced During Manufacturing" full>{input("manufacturingPackaging", "N/A")}</Field>
        </div>
      );
    case "product-2":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Electricity Consumption">{input("electricityConsumption", "1.01 kWh/Nm³ biomethane")}</Field>
          <Field label="Electricity Source">{input("electricitySource", "CHP engine + 960 kWp PV")}</Field>
          <Field label="Fuel Use (on-site)">{input("fuelUse", "Diesel — 0.003 L/Nm³; Natural gas — auxiliary boiler")}</Field>
          <Field label="Water Use">{input("waterUse", "0.21 L/Nm³ make-up water; wastewater 0.21 L")}</Field>
          <Field label="Additional / Auxiliary Materials" full>{area("auxMaterials", "NaOH (scrubbing) — 0.03 kg/Nm³\nPolymer antifoam additive")}</Field>
          <Field label="Direct Emissions (air, water, soil)">{input("directEmissions", "CH₄ slip ~1% of biogas flow; CO₂ from…")}</Field>
          <Field label="Waste Streams (type, quantity, treatment)">{input("wasteStreams", "Screening rejects from waste pre-treatment")}</Field>
        </div>
      );
    case "product-3":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Feedstock / Raw Material Transport Distances" full>{area("feedstockTransportDist", "<50 km")}</Field>
          <Field label="Feedstock Transport Modes" full>{area("feedstockTransportModes", "Truck")}</Field>
          <Field label="Finished Product Distribution Distances">{input("productDistDist", "0 km (300 m on-site pipeline)")}</Field>
          <Field label="Transport Vehicle Type, Payload, Load Utilization">{input("vehicleType", "Pipeline (DN 100, 70 bar injection pressure)")}</Field>
        </div>
      );
    case "product-4":
      return (
        <div className="grid grid-cols-1 gap-3">
          <Field label="Co-products Generated">{area("coProductsGenerated", "Slow-release NPK fertilizer (digestate) — 2.3 kg/Nm³\nBeverage-grade liquid CO₂ — 1.4 kg/Nm³\nSurplus electricity exported — 0.04 kWh/Nm³", 4)}</Field>
          <Field label="Quantity of Co-products">{input("coProductsQuantity", "Digestate fertilizer ~2.3 kg/Nm³; Beverage-grade CO₂ ~1.4 kg/Nm³")}</Field>
          <Field label="Co-product End Use">{area("coProductEndUse", "Digestate applied to local agricultural land as organic fertilizer\nCO₂ sold for beverage carbonation\nSurplus electricity exported to grid", 3)}</Field>
        </div>
      );
    case "product-5":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Biogenic Carbon Content (product & packaging)">{input("biogenicCarbon", "Biogenic CO₂ released during combustion — carbon neutral cycle")}</Field>
          <Field label="Carbon Sequestration During Raw Material Growth">{input("carbonSeq", "N/A — waste-derived feedstock")}</Field>
          <Field label="Fertilizers, Pesticides, Biocides in Bio-based Inputs">{input("fertilizers", "N/A")}</Field>
          <Field label="VOCs or Other Emissions from Production or Use">{input("vocs", "Minor VOC emissions from digestate storage (mitigated by biofilter)")}</Field>
          <Field label="Reference Service Life (RSL)">{input("rsl", "N/A — consumable energy carrier")}</Field>
          <Field label="Typical Application and Installation Method" full>{area("application", "Injected into national gas grid for downstream use")}</Field>
          <Field label="Maintenance Requirements">{input("maintenance", "N/A")}</Field>
          <Field label="End-of-life Scenarios">{input("eolScenarios", "Combustion — 100%")}</Field>
          <Field label="Take-back or Product Recovery Schemes">{select("takeBack", ["No", "Yes", "Partial"])}</Field>
          <Field label="Compliance with Standards">{input("complianceStandards", "ISO 14040:2006, ISO 14044:2006, EN 16723-1, RED II")}</Field>
          <Field label="Green Building Certifications">{input("greenCerts", "N/A")}</Field>
          <Field label="Hazardous Substance Declarations">{input("hazardous", "H₂S controlled below 5 ppm at injection point")}</Field>
          <Field label="System Boundary">{select("systemBoundary", ["Cradle-to-Gate", "Cradle-to-Grave", "Gate-to-Gate"])}</Field>
          <Field label="Reference Year & Data Collection Period">{input("referenceYear", "2025")}</Field>
        </div>
      );
    case "review-0":
      return (
        <div className="grid grid-cols-1 gap-3">
          <Field label="Data Accuracy (measured vs. estimated)">{area("dataAccuracy", "Measured: electricity consumption, production volume, gas composition\nEstimated: transport distances\nLCI source: Amato et al. (2023) Table 2", 4)}</Field>
          <Field label="Data Recording Frequency">{area("dataFrequency", "Production: daily\nEnergy: monthly\nFeedstock: weekly", 3)}</Field>
        </div>
      );
    default:
      return null;
  }
}
