import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLcaResult, getProduct } from "@/lib/lcaData";
import { ArrowLeft, BarChart3, Flame } from "lucide-react";

const stageColors: Record<string, string> = {
  "Raw Materials": "bg-primary",
  "Manufacturing": "bg-info",
  "Transport": "bg-warning",
  "Use": "bg-application-purple",
  "End-of-Life": "bg-muted-foreground",
};

export default function LcaHotspots() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = id ? getProduct(id) : undefined;
  if (!product)
    return <div className="p-10 text-sm text-muted-foreground">Product not found.</div>;
  const result = getLcaResult(product.id);
  const maxImpact = Math.max(...result.impacts.map((i) => i.value));

  return (
    <div className="mx-auto max-w-[1400px] px-6 pt-4 pb-10">
      <header className="mb-5 flex items-end justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/lca")}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> Back to catalog
          </button>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
            <Flame className="w-3 h-3" />
            Hotspot Analysis · EF 3.0 → ESRS E1–E5
          </div>
          <h1 className="text-xl font-semibold text-foreground mt-1">
            {product.name}
          </h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/lca/products/${product.id}/performance`)}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Performance
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Impact category bars */}
        <Card className="border-border/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground">
              EF 3.0 Impact Categories
            </h3>
            <span className="text-xs text-muted-foreground">
              Per {product.functionalUnit}
            </span>
          </div>
          <div className="space-y-3">
            {result.impacts.map((imp) => {
              const pct = (imp.value / maxImpact) * 100;
              return (
                <div key={imp.category}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">
                        {imp.category}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[9px] border-border/60 text-muted-foreground"
                      >
                        {imp.esrs}
                      </Badge>
                    </div>
                    <span className="tabular-nums font-medium text-foreground">
                      {imp.value} <span className="text-muted-foreground font-normal">{imp.unit}</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Contribution by life-cycle stage */}
        <Card className="border-border/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Contribution by Life-Cycle Stage
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stageColors).map(([s, c]) => (
                <div key={s} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-sm ${c}`} />
                  <span className="text-[10px] text-muted-foreground">{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {result.impacts.map((imp) => {
              const total = imp.byStage.reduce((a, b) => a + b.value, 0) || 1;
              return (
                <div key={imp.category}>
                  <div className="text-xs text-foreground mb-1 font-medium">
                    {imp.category}
                  </div>
                  <div className="flex h-3 w-full rounded-sm overflow-hidden bg-muted">
                    {imp.byStage.map((s) => {
                      const pct = (s.value / total) * 100;
                      return (
                        <div
                          key={s.stage}
                          className={stageColors[s.stage]}
                          style={{ width: `${pct}%` }}
                          title={`${s.stage}: ${pct.toFixed(1)}%`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ESRS summary strip */}
      <Card className="border-border/60 p-5 mt-4">
        <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          ESRS E1–E5 Mapped Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {["E1 Climate", "E2 Pollution", "E3 Water", "E4 Biodiversity", "E5 Circularity"].map(
            (label, i) => {
              const impactsForEsrs = result.impacts.filter((imp) =>
                imp.esrs.toLowerCase().includes(label.split(" ")[0].toLowerCase())
              );
              const sum = impactsForEsrs.reduce((a, b) => a + b.value, 0);
              return (
                <div
                  key={label}
                  className="rounded-lg border border-border/60 p-3"
                >
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {label}
                  </div>
                  <div className="text-base font-semibold text-foreground mt-1 tabular-nums">
                    {impactsForEsrs.length}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    indicators ·{" "}
                    <span className="text-foreground font-medium">
                      {sum.toPrecision(3)}
                    </span>{" "}
                    sum
                  </div>
                </div>
              );
            }
          )}
        </div>
      </Card>
    </div>
  );
}
