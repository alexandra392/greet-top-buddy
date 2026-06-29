import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  LCA_PRODUCTS,
  type LcaProduct,
  type LcaStatus,
} from "@/lib/lcaData";
import {
  ArrowRight,
  BarChart3,
  Flame,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";

const statusMeta: Record<LcaStatus, { label: string; className: string }> = {
  not_started: {
    label: "Not started",
    className: "bg-muted text-muted-foreground border-border",
  },
  in_progress: {
    label: "In progress",
    className: "bg-warning/15 text-warning-foreground border-warning/30",
  },
  completed: {
    label: "Completed",
    className: "bg-primary/10 text-primary border-primary/30",
  },
};

const PAGE_SIZE = 8;
const PRODUCT_EMOJIS = ["📦", "🧪", "🧴", "🥫", "🍴", "🔋", "🌬️", "💨", "🧱", "👕", "🪵", "⚙️"];

const STEPS = [
  "Identification",
  "Functional unit",
  "System boundary",
  "Review",
] as const;

type NewProductDraft = {
  name: string;
  category: string;
  description: string;
  image: string;
  functionalUnit: string;
  systemBoundary: LcaProduct["systemBoundary"];
  mass_kg: number;
};

const emptyDraft: NewProductDraft = {
  name: "",
  category: "",
  description: "",
  image: PRODUCT_EMOJIS[0],
  functionalUnit: "",
  systemBoundary: "Cradle-to-Gate",
  mass_kg: 1,
};

export default function LcaCatalog() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<LcaProduct | null>(null);
  const [extraProducts, setExtraProducts] = useState<LcaProduct[]>([]);
  const [page, setPage] = useState(1);

  // add-product workflow
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [draft, setDraft] = useState<NewProductDraft>(emptyDraft);

  const products = useMemo(
    () => [...extraProducts, ...LCA_PRODUCTS],
    [extraProducts]
  );
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, products.length);
  const pageItems = products.slice(pageStart, pageEnd);

  const resetWizard = () => {
    setWizardStep(0);
    setDraft(emptyDraft);
  };

  const submitDraft = () => {
    const id = `custom-${Date.now()}`;
    const np: LcaProduct = {
      id,
      name: draft.name || "Untitled product",
      category: draft.category || "Uncategorised",
      description: draft.description || "User-added product (baseline pending).",
      image: draft.image,
      functionalUnit: draft.functionalUnit || "1 unit",
      systemBoundary: draft.systemBoundary,
      status: "not_started",
      mass_kg: Number(draft.mass_kg) || 1,
    };
    setExtraProducts((p) => [np, ...p]);
    setWizardOpen(false);
    resetWizard();
    setPage(1);
  };

  const canNext =
    (wizardStep === 0 && draft.name.trim() && draft.category.trim()) ||
    (wizardStep === 1 && draft.functionalUnit.trim() && Number(draft.mass_kg) > 0) ||
    (wizardStep === 2 && !!draft.systemBoundary) ||
    wizardStep === 3;

  return (
    <div className="h-full bg-background flex flex-col">
      <div className="max-w-[1400px] w-full mx-auto px-6 pt-4 pb-6 flex-1 flex flex-col">
        {/* Heading matching platform style */}
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              LCA Tool: <span className="text-primary">Life Cycle Assessment</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
              Browse products in your portfolio, capture baseline system data,
              and review environmental performance and hotspots aligned with EF
              3.0 and ESRS E1–E5.
            </p>
          </div>
          <Button size="sm" className="h-7 text-xs gap-1.5" onClick={() => setWizardOpen(true)}>
            <Plus className="w-3.5 h-3.5" />
            Add product
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pageItems.map((p) => {
            const meta = statusMeta[p.status];
            return (
              <Card
                key={p.id}
                onClick={() => setSelected(p)}
                className="group cursor-pointer p-4 bg-card border border-border/60 hover:border-primary/40 hover:shadow-md transition-all flex flex-col rounded-xl shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center text-3xl">
                    {p.image}
                  </div>
                  <Badge
                    variant="outline"
                    className={`${meta.className} text-[10px] font-medium`}
                  >
                    {meta.label}
                  </Badge>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {p.category}
                </div>
                <h3 className="text-sm font-semibold text-foreground mt-1 leading-snug">
                  {p.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                  {p.description}
                </p>
                <div className="pt-3 mt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border/60">
                  <span>{p.systemBoundary}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-5 mt-auto">
          <div className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="text-foreground font-medium">
              {pageStart + 1}–{pageEnd}
            </span>{" "}
            of <span className="text-foreground font-medium">{products.length}</span>{" "}
            products
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </Button>
            <div className="text-xs text-muted-foreground px-2 tabular-nums">
              Page <span className="text-foreground font-medium">{page}</span> /{" "}
              {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Product detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-xl">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                    {selected.image}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {selected.category}
                    </div>
                    <DialogTitle className="text-base">{selected.name}</DialogTitle>
                  </div>
                </div>
                <DialogDescription className="pt-2">
                  {selected.description}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-3 py-2">
                <div className="rounded-lg border border-border/60 p-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Functional unit
                  </div>
                  <div className="text-sm text-foreground mt-1">
                    {selected.functionalUnit}
                  </div>
                </div>
                <div className="rounded-lg border border-border/60 p-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    System boundary
                  </div>
                  <div className="text-sm text-foreground mt-1">
                    {selected.systemBoundary}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex sm:justify-between gap-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/lca/products/${selected.id}/performance`)}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    Performance
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/lca/products/${selected.id}/hotspots`)}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    Hotspots
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate(`/lca/products/${selected.id}/questionnaire`)}
                >
                  Start Assessment
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add product workflow */}
      <Dialog
        open={wizardOpen}
        onOpenChange={(o) => {
          setWizardOpen(o);
          if (!o) resetWizard();
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="text-[10px] uppercase tracking-widest text-primary font-semibold">
              LCA Tool · Add Product
            </div>
            <DialogTitle className="text-base">
              Register a new product in the platform
            </DialogTitle>
            <DialogDescription>
              Capture the minimum metadata required to start a baseline
              assessment. Detailed inventory data is collected later in the
              questionnaire.
            </DialogDescription>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex items-center gap-2 py-1">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-semibold border ${
                    i < wizardStep
                      ? "bg-primary text-primary-foreground border-primary"
                      : i === wizardStep
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {i < wizardStep ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <div
                  className={`text-[11px] truncate ${
                    i === wizardStep
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px bg-border" />
                )}
              </div>
            ))}
          </div>

          <div className="py-2">
            {wizardStep === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-xs">Product name</Label>
                  <Input
                    placeholder="e.g. Recycled PET tray 250g"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Category</Label>
                  <Input
                    placeholder="Packaging, Energy, Textiles…"
                    value={draft.category}
                    onChange={(e) =>
                      setDraft({ ...draft, category: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Icon</Label>
                  <Select
                    value={draft.image}
                    onValueChange={(v) => setDraft({ ...draft, image: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_EMOJIS.map((e) => (
                        <SelectItem key={e} value={e}>
                          {e} &nbsp; product icon
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    placeholder="Short description (materials, production site, intended market)…"
                    className="min-h-20"
                    value={draft.description}
                    onChange={(e) =>
                      setDraft({ ...draft, description: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {wizardStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Functional unit</Label>
                  <Input
                    placeholder="e.g. 1 filled 500 ml bottle"
                    value={draft.functionalUnit}
                    onChange={(e) =>
                      setDraft({ ...draft, functionalUnit: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Reference mass (kg)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    placeholder="0.028"
                    value={draft.mass_kg}
                    onChange={(e) =>
                      setDraft({ ...draft, mass_kg: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">System boundary</Label>
                  <Select
                    value={draft.systemBoundary}
                    onValueChange={(v) =>
                      setDraft({
                        ...draft,
                        systemBoundary: v as LcaProduct["systemBoundary"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cradle-to-Gate">Cradle-to-Gate</SelectItem>
                      <SelectItem value="Cradle-to-Grave">Cradle-to-Grave</SelectItem>
                      <SelectItem value="Gate-to-Gate">Gate-to-Gate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-[11px] text-muted-foreground self-end pb-1.5">
                  Boundary determines which life-cycle stages are included in
                  the assessment. Can be edited later.
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  ["Name", draft.name || "—"],
                  ["Category", draft.category || "—"],
                  ["Functional unit", draft.functionalUnit || "—"],
                  ["Reference mass", `${draft.mass_kg || 0} kg`],
                  ["System boundary", draft.systemBoundary],
                  ["Initial status", "Not started"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-lg border border-border/60 p-3 flex items-center justify-between"
                  >
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {k}
                    </span>
                    <span className="text-xs text-foreground font-medium text-right">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="flex sm:justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (wizardStep === 0) {
                  setWizardOpen(false);
                  resetWizard();
                } else {
                  setWizardStep((s) => s - 1);
                }
              }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              {wizardStep === 0 ? "Cancel" : "Back"}
            </Button>
            {wizardStep < STEPS.length - 1 ? (
              <Button
                size="sm"
                disabled={!canNext}
                onClick={() => setWizardStep((s) => s + 1)}
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button size="sm" onClick={submitDraft}>
                <Check className="w-3.5 h-3.5" />
                Add to catalog
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
