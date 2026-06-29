import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { getLcaResult, getProduct } from "@/lib/lcaData";
import { ArrowLeft, BarChart3, Flame, FileText } from "lucide-react";

export default function LcaPerformance() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = id ? getProduct(id) : undefined;
  if (!product)
    return <div className="p-10 text-sm text-muted-foreground">Product not found.</div>;
  const result = getLcaResult(product.id);

  const params: { label: string; value: string }[] = [
    { label: "Product", value: product.name },
    { label: "Functional unit", value: product.functionalUnit },
    { label: "System boundary", value: product.systemBoundary },
    { label: "Reference flow", value: `${product.mass_kg} kg` },
    { label: "Methodology", value: "EF 3.0 (PEF)" },
    { label: "Reference year", value: "2025" },
    { label: "Geographical scope", value: "EU-27" },
    { label: "Cut-off criterion", value: "1% (mass / energy)" },
  ];

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
            <BarChart3 className="w-3 h-3" />
            Environmental Performance
          </div>
          <h1 className="text-xl font-semibold text-foreground mt-1">
            {product.name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/lca/products/${product.id}/questionnaire`)}
          >
            <FileText className="w-3.5 h-3.5" />
            Edit inputs
          </Button>
          <Button
            size="sm"
            onClick={() => navigate(`/lca/products/${product.id}/hotspots`)}
          >
            <Flame className="w-3.5 h-3.5" />
            Hotspots
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Study Parameters (2 cols) */}
        <Card className="lg:col-span-2 border-border/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Study Parameters
            </h3>
            <Badge
              variant="outline"
              className="text-[10px] bg-primary/10 text-primary border-primary/30"
            >
              EF 3.0
            </Badge>
          </div>
          <div className="space-y-2.5">
            {params.map((p) => (
              <div
                key={p.label}
                className="flex items-start justify-between gap-3 border-b border-border/40 pb-2 last:border-0"
              >
                <span className="text-xs text-muted-foreground">{p.label}</span>
                <span className="text-xs text-foreground font-medium text-right">
                  {p.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <h4 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Data sources
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {result.dataSources.map((d) => (
                <Badge
                  key={d}
                  variant="outline"
                  className="text-[10px] border-border/60 text-muted-foreground"
                >
                  {d}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Right: LCI table (3 cols) */}
        <Card className="lg:col-span-3 border-border/60 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Life Cycle Inventory (LCI)
            </h3>
            <span className="text-xs text-muted-foreground">
              Per {product.functionalUnit}
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="h-8 text-[10px] uppercase tracking-widest">
                  Stage
                </TableHead>
                <TableHead className="h-8 text-[10px] uppercase tracking-widest">
                  Flow
                </TableHead>
                <TableHead className="h-8 text-[10px] uppercase tracking-widest text-right">
                  Amount
                </TableHead>
                <TableHead className="h-8 text-[10px] uppercase tracking-widest">
                  Unit
                </TableHead>
                <TableHead className="h-8 text-[10px] uppercase tracking-widest">
                  Source
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.inventory.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="py-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] border-border/60 text-muted-foreground"
                    >
                      {row.stage}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2 text-xs text-foreground">
                    {row.flow}
                  </TableCell>
                  <TableCell className="py-2 text-xs text-right tabular-nums font-medium">
                    {row.amount}
                  </TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground">
                    {row.unit}
                  </TableCell>
                  <TableCell className="py-2 text-xs text-muted-foreground">
                    {row.source}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
