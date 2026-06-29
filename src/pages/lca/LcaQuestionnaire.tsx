import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardList,
} from "lucide-react";
import { getProduct, QUESTIONNAIRE_STEPS } from "@/lib/lcaData";

type FieldProps = {
  label: string;
  sub?: string;
  children: React.ReactNode;
};
const Field = ({ label, sub, children }: FieldProps) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-medium text-foreground">{label}</Label>
    {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    {children}
  </div>
);

export default function LcaQuestionnaire() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = id ? getProduct(id) : undefined;
  const [step, setStep] = useState(0);
  const total = QUESTIONNAIRE_STEPS.length;
  const progress = ((step + 1) / total) * 100;

  if (!product) {
    return (
      <div className="p-10 text-sm text-muted-foreground">Product not found.</div>
    );
  }

  const next = () => {
    if (step < total - 1) setStep(step + 1);
    else navigate(`/lca/products/${product.id}/performance`);
  };
  const back = () => {
    if (step > 0) setStep(step - 1);
    else navigate("/lca");
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 pt-4 pb-10">
      <header className="mb-4">
        <button
          onClick={() => navigate("/lca")}
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" /> Back to catalog
        </button>
        <div className="flex items-end justify-between mt-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              <ClipboardList className="w-3 h-3" />
              Baseline System Questionnaire
            </div>
            <h1 className="text-xl font-semibold text-foreground mt-1">
              {product.name}
            </h1>
          </div>
          <div className="text-xs text-muted-foreground">
            Step <span className="text-foreground font-semibold">{step + 1}</span>{" "}
            of {total} · {QUESTIONNAIRE_STEPS[step]}
          </div>
        </div>
        <Progress value={progress} className="h-1.5 mt-3" />
      </header>

      <Card className="border-border/60 p-6">
        <div className="mb-5">
          <Badge
            variant="outline"
            className="text-[10px] bg-primary/10 text-primary border-primary/30"
          >
            {QUESTIONNAIRE_STEPS[step]}
          </Badge>
        </div>

        {step === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Product name">
              <Input defaultValue={product.name} placeholder="e.g. Bio-PET bottle 500ml" />
            </Field>
            <Field label="Internal product code">
              <Input placeholder="SKU-00432" />
            </Field>
            <Field label="Category">
              <Input defaultValue={product.category} placeholder="Packaging, Energy…" />
            </Field>
            <Field label="Reference year">
              <Input placeholder="2025" defaultValue="2025" />
            </Field>
            <Field label="Manufacturing site">
              <Input placeholder="Plant location / city" />
            </Field>
            <Field label="Responsible analyst">
              <Input placeholder="Full name" />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Functional unit">
              <Input defaultValue={product.functionalUnit} placeholder="e.g. 1 filled 500ml bottle" />
            </Field>
            <Field label="Reference flow">
              <Input placeholder="Quantity & unit, e.g. 28 g PET" />
            </Field>
            <Field label="Service life" sub="Expected duration of the functional unit">
              <Input placeholder="e.g. 1 use cycle / 10 years" />
            </Field>
            <Field label="Reference mass (kg)">
              <Input type="number" defaultValue={product.mass_kg} />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="System boundary">
              <Select defaultValue={product.systemBoundary}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cradle-to-Gate">Cradle-to-Gate</SelectItem>
                  <SelectItem value="Cradle-to-Grave">Cradle-to-Grave</SelectItem>
                  <SelectItem value="Gate-to-Gate">Gate-to-Gate</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Cut-off criterion" sub="Mass / energy threshold per EF 3.0">
              <Select defaultValue="1">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1% (default EF 3.0)</SelectItem>
                  <SelectItem value="3">3%</SelectItem>
                  <SelectItem value="5">5%</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Geographical scope">
              <Input placeholder="e.g. EU-27" defaultValue="EU-27" />
            </Field>
            <Field label="Time horizon">
              <Input placeholder="e.g. 2024–2029" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Included / excluded processes">
                <Textarea
                  placeholder="Describe what is in scope and any justified exclusions…"
                  className="min-h-24"
                />
              </Field>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Main material">
                <Input placeholder="e.g. PET resin" />
              </Field>
              <Field label="Mass (kg)">
                <Input type="number" placeholder="0.028" />
              </Field>
              <Field label="Recycled content (%)">
                <Input type="number" placeholder="30" />
              </Field>
              <Field label="Supplier / origin">
                <Input placeholder="Supplier, country" />
              </Field>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Secondary material">
                <Input placeholder="e.g. HDPE cap" />
              </Field>
              <Field label="Mass (kg)">
                <Input type="number" placeholder="0.003" />
              </Field>
              <Field label="Recycled content (%)">
                <Input type="number" placeholder="0" />
              </Field>
              <Field label="Supplier / origin">
                <Input placeholder="Supplier, country" />
              </Field>
            </div>
            <Button variant="outline" size="sm" className="text-xs">
              + Add material row
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Electricity consumption (kWh)">
              <Input type="number" placeholder="e.g. 0.45" />
            </Field>
            <Field label="Electricity mix">
              <Select>
                <SelectTrigger><SelectValue placeholder="Select grid mix" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="eu27">EU-27 average</SelectItem>
                  <SelectItem value="green">100% renewable PPA</SelectItem>
                  <SelectItem value="country">Country-specific grid</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Natural gas (MJ)">
              <Input type="number" placeholder="e.g. 0.12" />
            </Field>
            <Field label="Process heat source">
              <Select>
                <SelectTrigger><SelectValue placeholder="Heat carrier" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gas">Natural gas boiler</SelectItem>
                  <SelectItem value="elec">Electric heating</SelectItem>
                  <SelectItem value="hp">Heat pump</SelectItem>
                  <SelectItem value="biomass">Biomass</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Direct emissions (kg CO₂)">
              <Input type="number" placeholder="0.02" />
            </Field>
            <Field label="Process water (L)">
              <Input type="number" placeholder="0.34" />
            </Field>
          </div>
        )}

        {step === 5 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Inbound transport mode">
              <Select>
                <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="truck">Truck &gt;32t, EURO 6</SelectItem>
                  <SelectItem value="rail">Rail freight</SelectItem>
                  <SelectItem value="sea">Sea container</SelectItem>
                  <SelectItem value="air">Air freight</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Inbound distance (km)">
              <Input type="number" placeholder="450" />
            </Field>
            <Field label="Outbound transport mode">
              <Select>
                <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="truck">Truck &gt;32t, EURO 6</SelectItem>
                  <SelectItem value="rail">Rail freight</SelectItem>
                  <SelectItem value="sea">Sea container</SelectItem>
                  <SelectItem value="air">Air freight</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Outbound distance (km)">
              <Input type="number" placeholder="320" />
            </Field>
            <Field label="Average load factor (%)">
              <Input type="number" placeholder="80" />
            </Field>
            <Field label="Packaging mass per shipment (kg)">
              <Input type="number" placeholder="0.6" />
            </Field>
          </div>
        )}

        {step === 6 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Energy consumption in use (kWh)">
              <Input type="number" placeholder="0" />
            </Field>
            <Field label="Consumables required">
              <Input placeholder="e.g. detergent, water" />
            </Field>
            <Field label="Maintenance frequency">
              <Input placeholder="e.g. annual service" />
            </Field>
            <Field label="Expected lifetime">
              <Input placeholder="e.g. 10 years" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Notes on use-phase assumptions">
                <Textarea placeholder="User behaviour, regional differences…" className="min-h-20" />
              </Field>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Recycling rate (%)">
              <Input type="number" placeholder="55" />
            </Field>
            <Field label="Incineration rate (%)">
              <Input type="number" placeholder="30" />
            </Field>
            <Field label="Landfill rate (%)">
              <Input type="number" placeholder="15" />
            </Field>
            <Field label="EoL allocation method" sub="EF 3.0 default is CFF">
              <Select defaultValue="cff">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cff">Circular Footprint Formula (CFF)</SelectItem>
                  <SelectItem value="cutoff">Cut-off</SelectItem>
                  <SelectItem value="avoided">Avoided burden</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Recovered energy (MJ/kg)">
              <Input type="number" placeholder="3.2" />
            </Field>
            <Field label="Material recovery efficiency (%)">
              <Input type="number" placeholder="88" />
            </Field>
          </div>
        )}

        {step === 8 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Temporal representativeness">
              <Select>
                <SelectTrigger><SelectValue placeholder="Select rating" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Very good — &lt; 3 yrs</SelectItem>
                  <SelectItem value="2">Good — 3–6 yrs</SelectItem>
                  <SelectItem value="3">Fair — 6–10 yrs</SelectItem>
                  <SelectItem value="4">Poor — &gt; 10 yrs</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Geographical representativeness">
              <Select>
                <SelectTrigger><SelectValue placeholder="Select rating" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Site-specific</SelectItem>
                  <SelectItem value="2">Country</SelectItem>
                  <SelectItem value="3">Region</SelectItem>
                  <SelectItem value="4">Global proxy</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Technological representativeness">
              <Select>
                <SelectTrigger><SelectValue placeholder="Select rating" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Same technology</SelectItem>
                  <SelectItem value="2">Comparable technology</SelectItem>
                  <SelectItem value="3">Different technology</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Primary vs secondary data share (%)">
              <Input type="number" placeholder="60" />
            </Field>
            <div className="md:col-span-2">
              <Field label="Data gaps & limitations">
                <Textarea placeholder="Document assumptions, proxies and exclusions…" className="min-h-24" />
              </Field>
            </div>
          </div>
        )}

        {step === 9 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please review your inputs. On submit, the baseline assessment is
              calculated using EF 3.0 characterisation factors and made
              available in the Performance and Hotspots views.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                ["Product", product.name],
                ["Category", product.category],
                ["Functional unit", product.functionalUnit],
                ["System boundary", product.systemBoundary],
                ["Reference mass", `${product.mass_kg} kg`],
                ["Methodology", "EF 3.0 (PEF)"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-lg border border-border/60 p-3 flex items-center justify-between"
                >
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    {k}
                  </span>
                  <span className="text-sm text-foreground font-medium">
                    {v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/60">
          <Button variant="outline" size="sm" onClick={back}>
            <ArrowLeft className="w-3.5 h-3.5" />
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          <div className="text-[11px] text-muted-foreground">
            All values are illustrative — data not persisted.
          </div>
          <Button size="sm" onClick={next}>
            {step === total - 1 ? (
              <>
                Submit assessment
                <Check className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
