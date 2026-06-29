import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  LCA_PRODUCTS,
  type LcaProduct,
  type LcaStatus,
} from "@/lib/lcaData";
import AddProductWizard from "@/components/lca/AddProductWizard";
import ProductOptionsModal from "@/components/lca/ProductOptionsModal";
import {
  ArrowLeft,
  ArrowRight,
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
  const [extraProducts, setExtraProducts] = useState<LcaProduct[]>([]);
  const [page, setPage] = useState(1);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<LcaProduct | null>(null);

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
      <div className="max-w-[1400px] w-full mx-auto px-6 pt-4 pb-3 flex items-center justify-between flex-shrink-0">
        <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={() => navigate('/')}>
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Button>
        <Button size="sm" className="h-7 text-xs gap-1.5 bg-foreground text-background hover:bg-foreground/90" onClick={() => setWizardOpen(true)}>
          <Plus className="w-3.5 h-3.5" />
          Add product
        </Button>

      </div>
      <div className="max-w-[1400px] w-full mx-auto px-6 pb-6 flex-1 flex flex-col">
        {/* Heading matching platform style */}
        <div className="mb-3">
          <h1 className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
            LCA Tool
          </h1>
        </div>



        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search products by name, category or description..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="pl-9 h-8 text-[11px] placeholder:text-[11px]"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pageItems.map((p) => {
            const meta = statusMeta[p.status];
            return (
              <Card
                key={p.id}
                onClick={() => navigate(`/lca/products/${p.id}/matches`)}
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
                <h3 className="text-sm font-semibold text-foreground mt-1 leading-snug">
                  {p.name}
                </h3>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
                  Main use
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-3 flex-1">
                  {(p as any).mainUse || p.description}
                </p>
                <div className="pt-3 mt-3 flex items-center justify-end border-t border-border/60">
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
            of <span className="text-foreground font-medium">{filteredProducts.length}</span>{" "}
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

      {/* Add product workflow */}
      <AddProductWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onSubmit={handleAddProduct}
      />

    </div>
  );
}
