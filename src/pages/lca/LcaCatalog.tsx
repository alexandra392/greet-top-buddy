import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import AddProductWizard from "@/components/lca/AddProductWizard";
import {
  ArrowRight,
  BarChart3,
  Flame,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";


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

export default function LcaCatalog() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<LcaProduct | null>(null);
  const [extraProducts, setExtraProducts] = useState<LcaProduct[]>([]);
  const [page, setPage] = useState(1);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const products = useMemo(
    () => [...extraProducts, ...LCA_PRODUCTS],
    [extraProducts]
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, filteredProducts.length);
  const pageItems = filteredProducts.slice(pageStart, pageEnd);

  const handleAddProduct = (np: LcaProduct) => {
    setExtraProducts((p) => [np, ...p]);
    setPage(1);
  };


  return (
    <div className="h-full bg-background flex flex-col">
      <div className="max-w-[1400px] w-full mx-auto px-6 pt-4 pb-6 flex-1 flex flex-col">
        {/* Heading matching platform style */}
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              LCA Tool
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
      <AddProductWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onSubmit={handleAddProduct}
      />

    </div>
  );
}
