import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FileText, Factory, Leaf, ChevronRight, ArrowLeft } from "lucide-react";
import { REVIEW_GROUPS } from "@/components/lca/AddProductWizard";
import type { LcaProduct } from "@/lib/lcaData";

interface Props {
  product: LcaProduct | null;
  onClose: () => void;
}

type View = "menu" | "general" | "product";

const OPTIONS = [
  {
    key: "general" as const,
    icon: FileText,
    iconBg: "bg-blue-100 text-blue-600",
    title: "General Information",
    subtitle: "Identity, manufacturer & compliance docs",
  },
  {
    key: "product" as const,
    icon: Factory,
    iconBg: "bg-amber-100 text-amber-700",
    title: "Product Information",
    subtitle:
      "Feedstocks, manufacturing, energy, transport, co-products & sustainability",
  },
  {
    key: "performance" as const,
    icon: Leaf,
    iconBg: "bg-primary/15 text-primary",
    title: "Environmental Performance",
    subtitle: "Auto-derived indicators & system diagram",
  },
];

export default function ProductOptionsModal({ product, onClose }: Props) {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("menu");

  if (!product) return null;

  const handleSelect = (key: "general" | "product" | "performance") => {
    if (key === "performance") {
      onClose();
      navigate(`/lca/products/${product.id}/matches`);
      return;
    }
    setView(key);
  };

  const data = product.formData ?? {};

  const groups = REVIEW_GROUPS.filter((g) =>
    view === "general"
      ? g.title.startsWith("General Information")
      : g.title.startsWith("Product Information")
  ).map((g) => ({
    title: g.title.split(" — ")[1] ?? g.title,
    fields: g.fields.map((f) => ({ ...f, value: data[f.key] })),
  }));

  return (
    <Dialog
      open={!!product}
      onOpenChange={(o) => {
        if (!o) {
          onClose();
          setView("menu");
        }
      }}
    >
      <DialogContent className="max-w-[920px] p-0 bg-card border-border">
        {view === "menu" ? (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-5">
              {product.name}
            </h2>
            <div className="grid grid-cols-[260px_1fr] gap-5">
              {/* Left preview */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col">
                <div className="rounded-lg bg-muted aspect-square flex items-center justify-center text-6xl mb-3">
                  {product.image}
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {product.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {product.category}
                </div>
                <div className="border-t border-border my-3" />
                <div className="text-[11px] text-muted-foreground font-mono">
                  ID: {product.id}
                </div>
              </div>

              {/* Right options */}
              <div className="flex flex-col gap-3">
                {OPTIONS.map((o) => {
                  const Icon = o.icon;
                  return (
                    <button
                      key={o.key}
                      onClick={() => handleSelect(o.key)}
                      className="group flex items-center gap-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all p-4 text-left"
                    >
                      <div
                        className={`h-11 w-11 rounded-lg flex items-center justify-center ${o.iconBg} flex-shrink-0`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground">
                          {o.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {o.subtitle}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-0">
            <div className="px-6 pt-5 pb-3 border-b border-border">
              <button
                onClick={() => setView("menu")}
                className="inline-flex items-center gap-1.5 text-primary text-xs font-medium mb-2 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                {view === "general" ? "General Information" : "Product Information"}
              </div>
              <h2 className="text-lg font-semibold text-foreground mt-1">
                {product.name}
              </h2>
            </div>
            <div className="max-h-[65vh] overflow-y-auto px-6 py-5 space-y-5">
              {groups.map((g) => (
                <section key={g.title}>
                  <h3 className="text-sm font-semibold text-foreground mb-2.5">
                    {g.title}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {g.fields.map((f) => (
                      <div
                        key={f.key}
                        className="rounded-lg border border-border bg-muted/30 px-3 py-2"
                      >
                        <div className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                          {f.label}
                        </div>
                        <div className="text-xs text-foreground mt-1 whitespace-pre-wrap break-words">
                          {f.value && f.value.trim().length > 0 ? (
                            f.value
                          ) : (
                            <span className="text-muted-foreground/60 italic">
                              Not provided
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
              {groups.every((g) => g.fields.every((f) => !f.value)) && (
                <div className="text-xs text-muted-foreground text-center py-8">
                  No information was provided for this section.
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
