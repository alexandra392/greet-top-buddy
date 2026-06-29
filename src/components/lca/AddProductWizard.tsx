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
      { title: "Energy & Resources", subtitle: "Energy consumption, fuel, water and auxiliary materials" },
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
    if (!isLastStepOfSection) {
      setStepIdx((s) => s + 1);
      return;
    }
    if (!isLastSection) {
      setSectionIdx((s) => s + 1);
      setStepIdx(0);
      return;
    }
    // submit
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

  const nextLabel = useMemo(() => {
    if (isLastSection && isLastStepOfSection) return "Submit";
    if (isLastStepOfSection) return "Next Section";
    return "Continue";
  }, [isLastSection, isLastStepOfSection]);

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="text-[10px] uppercase tracking-widest text-primary font-semibold">
            LCA Tool · Add Product
          </div>
          <DialogTitle className="text-base">Register a new product in the platform</DialogTitle>
          <DialogDescription className="text-xs">
            Capture identification, production, and sustainability data needed to start a baseline LCA.
          </DialogDescription>
        </DialogHeader>

        {/* Top section stepper */}
        <div className="flex items-center gap-3 border-b border-border pb-3">
          {SECTIONS.map((s, i) => {
            const done = i < sectionIdx;
            const active = i === sectionIdx;
            return (
              <div key={s.key} className="flex items-center gap-2 flex-1">
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-semibold border ${
                    done
                      ? "bg-primary text-primary-foreground border-primary"
                      : active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground bg-muted"
                  }`}
                >
                  {done ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <div
                  className={`text-xs ${
                    active ? "text-foreground font-semibold border-b-2 border-primary pb-2 -mb-3" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Section heading + sub-step progress */}
        <div className="flex items-end justify-between pt-2">
          <div>
            <h3 className="text-base font-bold text-foreground">{section.label}</h3>
            <div className="flex gap-1 mt-1">
              {section.steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-8 rounded-full ${
                    i <= stepIdx ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {stepIdx + 1} of {totalSteps}
          </div>
        </div>

        {/* Step card */}
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-foreground">{step.title}</h4>
            <p className="text-xs text-muted-foreground">{step.subtitle}</p>
          </div>

          <StepFields sectionKey={section.key} stepIdx={stepIdx} v={v} set={set} />
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goBack}
            disabled={sectionIdx === 0 && stepIdx === 0}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back
          </Button>
          <Button size="sm" onClick={goNext}>
            {nextLabel}
            {!(isLastSection && isLastStepOfSection) && <ChevronRight className="w-3.5 h-3.5" />}
          </Button>
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
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${full ? "md:col-span-2" : ""}`}>
      <Label className="text-xs">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

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
    <Input value={v(k)} onChange={(e) => set(k, e.target.value)} placeholder={placeholder} />
  );
  const area = (k: string, placeholder?: string, rows = 3) => (
    <Textarea
      rows={rows}
      value={v(k)}
      onChange={(e) => set(k, e.target.value)}
      placeholder={placeholder}
    />
  );
  const select = (k: string, opts: string[]) => (
    <Select value={v(k)} onValueChange={(val) => set(k, val)}>
      <SelectTrigger>
        <SelectValue placeholder="Select…" />
      </SelectTrigger>
      <SelectContent>
        {opts.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  switch (key) {
    /* General Information */
    case "general-0":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Product Name / Commercial Name" required>
            {input("productName", "Biomethane")}
          </Field>
          <Field label="Model / Variant / Grade">{input("modelVariant", "BM-CAM-A, Grid-Quality")}</Field>
          <Field label="Product Form (how it is sold)" full>
            {input("productForm", "Compressed biomethane injected into the natural gas grid")}
          </Field>
          <Field label="Main Use of the Product" full>
            {area("mainUse", "Renewable energy carrier for heating and transport fuel", 2)}
          </Field>
          <Field label="Product Measurement Unit">{input("productMeasurementUnit", "Nm³ biomethane")}</Field>
          <Field label="Unique Product Identifier (UID)" required>
            {input("uid", "GTIN-IT-8033421-BM001")}
          </Field>
          <Field label="Identifier Scheme">{select("identifierScheme", ["GTIN", "GS1", "ISBN", "Internal"])}</Field>
          <Field label="Granularity">{select("granularity", ["item", "batch", "model"])}</Field>
          <Field label="Data Carrier Type">{select("dataCarrier", ["QR", "Barcode", "NFC", "RFID"])}</Field>
          <Field label="Product Category / UN CPC">
            {input("productCategory", "Energy / Gaseous Fuels — Biomethane (UN CPC 1200)")}
          </Field>
        </div>
      );
    case "general-1":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Manufacturer / Producer Legal Name" required>
            {input("manufacturerName", "BioEnergia Campania S.r.l.")}
          </Field>
          <Field label="Business Identifier / Registration Number">
            {input("businessId", "IT-NA-REA-512874")}
          </Field>
          <Field label="Economic Operator Role">
            {select("operatorRole", ["manufacturer", "importer", "distributor", "authorised representative"])}
          </Field>
          <Field label="Production Site Name">{input("siteName", "Impianto Biometano Campania Nord")}</Field>
          <Field label="Production Site Address">{input("siteAddress", "Campania, South Italy / IT")}</Field>
          <Field label="Country" required>{input("country", "Italy")}</Field>
          <Field label="Region">{input("region", "Campania")}</Field>
          <Field label="Facility Identifier">{input("facilityId", "FAC-IT-CE-00312")}</Field>
          <Field label="Production Date">
            <Input type="date" value={v("productionDate")} onChange={(e) => set("productionDate", e.target.value)} />
          </Field>
        </div>
      );
    case "general-2":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Applicable Regulation(s) and Standard(s)" full>
            {area("regulations", "EU ESPR 2024/1781; EN 16723-1", 3)}
          </Field>
          <Field label="Declaration of Performance & Conformity (DoPC)">
            {input("dopc", "DoPC-BM-CAM-2021")}
          </Field>
          <Field label="Linked Technical Documentation">
            {input("technicalDocs", "https://...")}
          </Field>
          <Field label="Safety Information / Instructions for Use">
            {input("safetyInfo", "URL to safety info")}
          </Field>
          <Field label="Contact Email / Support URL">
            {input("contact", "info@example.com")}
          </Field>
        </div>
      );

    /* Product Information */
    case "product-0":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Product Description (composition, form, physical state)" required full>
            {area("productDescription", "Biomethane gas, upgraded from agricultural and food-industry waste biogas…")}
          </Field>
          <Field label="Key Functional Materials / Components" full>
            {area("functionalMaterials", "Raw biogas: CH₄ 57.2 vol%…")}
          </Field>
          <Field label="Feedstocks / Input Materials (type, mass, source)" full>
            {area("feedstocksInputs", "Mixed biomass (organic waste) — 30.0 kg/Nm³ — Municipal waste collection")}
          </Field>
          <Field label="Feedstock Shares (%)" full>
            {area("feedstockShares", "Mixed municipal bio-waste (OFMSW) 100%", 2)}
          </Field>
          <Field label="Feedstock Origin & Provenance" full>
            {area("feedstockOrigin", "Municipal organic waste from Campania region municipalities", 2)}
          </Field>
          <Field label="Do Any Inputs Have a DPP or EPD?" full>
            {area("inputsDppEpd", "Polymer antifoam additive — EPD available (PTC100)", 2)}
          </Field>
          <Field label="Biogenic vs. Synthetic Material Fraction">{input("biogenicFraction", "~100% biogenic")}</Field>
          <Field label="Chemical Composition (N, moisture, protein, lignin)">
            {input("chemicalComposition", "CH₄ 57.2 vol% raw biogas; upgraded to >97% CH₄")}
          </Field>
          <Field label="Source of Bio-based Materials">{input("bioSource", "Municipal organic waste (OFMSW)")}</Field>
          <Field label="Pre- and Post-consumer Recycled Content">{input("recycledContent", "100% waste-derived feedstock")}</Field>
          <Field label="Packaging Type and Mass" full>
            {input("packaging", "No packaging — gaseous product injected directly into pipeline network")}
          </Field>
        </div>
      );
    case "product-1":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Production Technology" full>
            {area("productionTech", "Mesophilic anaerobic digestion with membrane biogas upgrading", 2)}
          </Field>
          <Field label="Reactor / Equipment Type">{input("reactorType", "Continuous Stirred Tank Reactor (CSTR)")}</Field>
          <Field label="Operating Temperature">{input("operatingTemp", "~37°C (mesophilic digestion)")}</Field>
          <Field label="Emission Treatment Systems" full>
            {area("emissionTreatment", "Biological scrubber for H₂S removal…", 2)}
          </Field>
          <Field label="Plant Production Capacity">{input("plantCapacity", "300 Nm³ biomethane/hour")}</Field>
          <Field label="Number of Production Facilities">{input("numFacilities", "2")}</Field>
          <Field label="Annual Production Output" full>
            {input("annualOutput", "6,804,000 Nm³/year biomethane (total both plants)")}
          </Field>
          <Field label="Manufacturing Process Overview" full>
            {area("processOverview", "Anaerobic digestion → biogas purification → upgrading → compression → grid injection", 3)}
          </Field>
          <Field label="Packaging Produced During Manufacturing" full>
            {input("manufacturingPackaging", "N/A")}
          </Field>
        </div>
      );
    case "product-2":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Electricity Consumption">{input("electricityConsumption", "1.01 kWh/Nm³ biomethane")}</Field>
          <Field label="Electricity Source">{input("electricitySource", "CHP engine + 960 kWp PV")}</Field>
          <Field label="Fuel Use (on-site)">{input("fuelUse", "Diesel — 0.003 L/Nm³; Natural gas — auxiliary boiler")}</Field>
          <Field label="Water Use">{input("waterUse", "0.21 L/Nm³ make-up water; wastewater 0.21 L")}</Field>
          <Field label="Additional / Auxiliary Materials" full>
            {area("auxMaterials", "NaOH (scrubbing) — 0.03 kg/Nm³\nPolymer antifoam additive", 2)}
          </Field>
          <Field label="Direct Emissions (air, water, soil)">{input("directEmissions", "CH₄ slip ~1% of biogas flow; CO₂ from…")}</Field>
          <Field label="Waste Streams (type, quantity, treatment)">{input("wasteStreams", "Screening rejects from waste pre-treatment")}</Field>
        </div>
      );
    case "product-3":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Feedstock / Raw Material Transport Distances" full>
            {area("feedstockTransportDist", "<50 km", 2)}
          </Field>
          <Field label="Feedstock Transport Modes" full>
            {area("feedstockTransportModes", "Truck", 2)}
          </Field>
          <Field label="Finished Product Distribution Distances">{input("productDistDist", "0 km (300 m on-site pipeline)")}</Field>
          <Field label="Transport Vehicle Type, Payload, Load Utilization">
            {input("vehicleType", "Pipeline (DN 100, 70 bar injection pressure)")}
          </Field>
        </div>
      );
    case "product-4":
      return (
        <div className="grid grid-cols-1 gap-3">
          <Field label="Co-products Generated">
            {area("coProductsGenerated", "Slow-release NPK fertilizer (digestate) — 2.3 kg/Nm³\nBeverage-grade liquid CO₂ — 1.4 kg/Nm³\nSurplus electricity exported — 0.04 kWh/Nm³", 4)}
          </Field>
          <Field label="Quantity of Co-products">
            {input("coProductsQuantity", "Digestate fertilizer ~2.3 kg/Nm³; Beverage-grade CO₂ ~1.4 kg/Nm³")}
          </Field>
          <Field label="Co-product End Use">
            {area("coProductEndUse", "Digestate applied to local agricultural land as organic fertilizer\nCO₂ sold for beverage carbonation\nSurplus electricity exported to grid", 3)}
          </Field>
        </div>
      );
    case "product-5":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Biogenic Carbon Content (product & packaging)">
            {input("biogenicCarbon", "Biogenic CO₂ released during combustion — carbon neutral cycle")}
          </Field>
          <Field label="Carbon Sequestration During Raw Material Growth">
            {input("carbonSeq", "N/A — waste-derived feedstock")}
          </Field>
          <Field label="Fertilizers, Pesticides, Biocides in Bio-based Inputs">{input("fertilizers", "N/A")}</Field>
          <Field label="VOCs or Other Emissions from Production or Use">
            {input("vocs", "Minor VOC emissions from digestate storage (mitigated by biofilter)")}
          </Field>
          <Field label="Reference Service Life (RSL)">{input("rsl", "N/A — consumable energy carrier")}</Field>
          <Field label="Typical Application and Installation Method" full>
            {area("application", "Injected into national gas grid for downstream use", 2)}
          </Field>
          <Field label="Maintenance Requirements">{input("maintenance", "N/A")}</Field>
          <Field label="End-of-life Scenarios">{input("eolScenarios", "Combustion — 100%")}</Field>
          <Field label="Take-back or Product Recovery Schemes">
            {select("takeBack", ["No", "Yes", "Partial"])}
          </Field>
          <Field label="Compliance with Standards">{input("complianceStandards", "ISO 14040:2006, ISO 14044:2006, EN 16723-1, RED II")}</Field>
          <Field label="Green Building Certifications">{input("greenCerts", "N/A")}</Field>
          <Field label="Hazardous Substance Declarations">{input("hazardous", "H₂S controlled below 5 ppm at injection point")}</Field>
          <Field label="System Boundary">
            {select("systemBoundary", ["Cradle-to-Gate", "Cradle-to-Grave", "Gate-to-Gate"])}
          </Field>
          <Field label="Reference Year & Data Collection Period">{input("referenceYear", "2025")}</Field>
        </div>
      );

    /* Review / Data Quality */
    case "review-0":
      return (
        <div className="grid grid-cols-1 gap-3">
          <Field label="Data Accuracy (measured vs. estimated)">
            {area("dataAccuracy", "Measured: electricity consumption, production volume, gas composition\nEstimated: transport distances\nLCI source: Amato et al. (2023) Table 2", 4)}
          </Field>
          <Field label="Data Recording Frequency">
            {area("dataFrequency", "Production: daily\nEnergy: monthly\nFeedstock: weekly", 3)}
          </Field>
        </div>
      );

    default:
      return null;
  }
}
