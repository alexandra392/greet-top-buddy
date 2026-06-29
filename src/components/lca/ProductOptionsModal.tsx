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
    iconBg: "bg-muted text-foreground",
    title: "General Information",
    subtitle: "Identity, manufacturer & compliance docs",
  },
  {
    key: "product" as const,
    icon: Factory,
    iconBg: "bg-muted text-foreground",
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
      <DialogContent className="max-w-[820px] p-0 bg-card border-border">
        {view === "menu" ? (
          <div className="p-5">
            <div className="mb-4">
              <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                LCA Tool · Product
              </div>
              <h2 className="text-base font-semibold text-foreground mt-1">
                {product.name}
              </h2>
            </div>
            <div className="grid grid-cols-[220px_1fr] gap-4 items-stretch">
              {/* Left preview */}
              <div className="rounded-xl border border-border/60 bg-muted p-3 flex flex-col">
                <div className="rounded-lg bg-muted/70 flex items-center justify-center text-5xl flex-1 min-h-[120px]">
                  {product.image}
                </div>
                <div className="mt-3">
                  <div className="text-xs font-semibold text-foreground leading-tight">
                    {product.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {product.category}
                  </div>
                </div>
                <div className="border-t border-border/60 my-2.5" />
                <div className="text-[10px] text-muted-foreground font-mono truncate">
                  ID: {product.id}
                </div>
              </div>

              {/* Right options */}
              <div className="flex flex-col gap-2.5">
                {OPTIONS.map((o) => {
                  const Icon = o.icon;
                  return (
                    <button
                      key={o.key}
                      onClick={() => handleSelect(o.key)}
                      className="group flex flex-1 items-center gap-3 rounded-xl border border-border/60 bg-muted/40 hover:border-primary/40 hover:shadow-sm transition-all px-3.5 py-3 text-left"
                    >
                      <div
                        className="h-9 w-9 rounded-lg flex items-center justify-center bg-muted/70 text-foreground flex-shrink-0"
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-foreground">
                          {o.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          {o.subtitle}
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
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
                        className="rounded-lg border border-border bg-muted/60 px-3 py-2"
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
