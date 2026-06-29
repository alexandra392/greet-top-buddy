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
} from "@/components/ui/dialog";
import {
  LCA_PRODUCTS,
  type LcaProduct,
  type LcaStatus,
} from "@/lib/lcaData";
import AddProductWizard from "@/components/lca/AddProductWizard";
import {
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
const LCA_MATCHES_PAGE_SIZE = 5;

type RankedLca = {
  id: string;
  title: string;
  provider: string;
  year: number;
  method: string;
  score: number;
};

const LCA_PROVIDERS = [
  "ecoinvent", "Sphera GaBi", "EF 3.0 Reference", "Agribalyse", "PEF Pilot",
  "Industry Consortium", "ELCD", "Quantis WORLD", "Idemat", "Supplier EPD",
  "Thinkstep", "SimaPro", "OpenLCA", "Brightway", "GreenDelta",
];
const LCA_METHODS = ["EF 3.0", "ReCiPe 2016", "CML-IA", "TRACI 2.1", "IPCC 2021"];

function getRankedLcas(p: LcaProduct): RankedLca[] {
  const seed = Array.from(p.id).reduce((a, c) => a + c.charCodeAt(0), 0);
  const count = 16 + (seed % 6); // 16–21 matches so pagination is visible
  const items: RankedLca[] = [];
  for (let i = 0; i < count; i++) {
    const s = (seed * (i + 7)) % 100;
    const score = Math.max(42, 98 - i * (3 + (s % 4)) - (s % 5));
    items.push({
      id: `${p.id}-lca-${i}`,
      title:
        i === 0
          ? `${p.name} — Reference baseline (${p.systemBoundary})`
          : `${p.name} — ${LCA_PROVIDERS[(seed + i) % LCA_PROVIDERS.length]} dataset v${1 + ((seed + i) % 4)}.${(i * 3) % 9}`,
      provider: LCA_PROVIDERS[(seed + i) % LCA_PROVIDERS.length],
      year: 2020 + ((seed + i * 3) % 6),
      method: LCA_METHODS[(seed + i) % LCA_METHODS.length],
      score,
    });
  }
  return items.sort((a, b) => b.score - a.score);
}


export default function LcaCatalog() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<LcaProduct | null>(null);
  const [lcaMatchesPage, setLcaMatchesPage] = useState(1);
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

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search products by name, category or description..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="pl-9 h-8 text-xs"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pageItems.map((p) => {
            const meta = statusMeta[p.status];
            return (
              <Card
                key={p.id}
                onClick={() => { setSelected(p); setLcaMatchesPage(1); }}
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

      {/* Product detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) { setSelected(null); setLcaMatchesPage(1); } }}>
        <DialogContent className="max-w-[960px] p-0 overflow-hidden flex flex-col max-h-[85vh]">
          {selected && (() => {
            const ranked = getRankedLcas(selected);
            const totalLcaPages = Math.max(1, Math.ceil(ranked.length / LCA_MATCHES_PAGE_SIZE));
            const currentLcaPage = Math.min(lcaMatchesPage, totalLcaPages);
            const lcaStart = (currentLcaPage - 1) * LCA_MATCHES_PAGE_SIZE;
            const lcaEnd = Math.min(lcaStart + LCA_MATCHES_PAGE_SIZE, ranked.length);
            const pagedLcas = ranked.slice(lcaStart, lcaEnd);
            return (
              <>
                <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
                  <div className="text-[10px] font-bold text-primary uppercase tracking-widest">
                    LCA Matches
                  </div>
                  <DialogTitle className="text-base font-bold text-foreground mt-1 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {selected.name}
                    <span className="text-primary text-sm font-bold ml-1">{ranked[0]?.score}%</span>
                  </DialogTitle>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {ranked.length} matches · ranked by similarity score
                  </p>
                </DialogHeader>

                <div className="overflow-y-auto">
                  <div className="grid grid-cols-[1fr_140px_100px_32px] gap-4 px-6 py-2.5 border-y border-border/60 bg-muted/30 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <div>Dataset</div>
                    <div>Provider</div>
                    <div className="text-right">Score</div>
                    <div />
                  </div>
                  {pagedLcas.map((lca) => (
                    <button
                      key={lca.id}
                      onClick={() => navigate(`/lca/products/${selected.id}/performance`)}
                      className="w-full text-left grid grid-cols-[1fr_140px_100px_32px] gap-4 items-center px-6 py-3 border-b border-border/40 hover:bg-muted/40 transition-colors group"
                    >
                      <div className="text-xs font-semibold text-foreground truncate">
                        {lca.title}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {lca.provider} · {lca.year}
                      </div>
                      <div className="text-xs font-bold text-primary tabular-nums text-right">
                        {lca.score}%
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors justify-self-end" />
                    </button>
                  ))}
                </div>

                <div className="px-6 py-3 border-t border-border/60 shrink-0 mt-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      Showing <span className="text-foreground font-medium">{lcaStart + 1}–{lcaEnd}</span> of <span className="text-foreground font-medium">{ranked.length}</span> matches
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setLcaMatchesPage(p => Math.max(1, p - 1))}
                        disabled={currentLcaPage === 1}
                        className="h-6 w-6 inline-flex items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </button>
                      <span className="text-[10px] text-muted-foreground px-1 tabular-nums">{currentLcaPage} / {totalLcaPages}</span>
                      <button
                        type="button"
                        onClick={() => setLcaMatchesPage(p => Math.min(totalLcaPages, p + 1))}
                        disabled={currentLcaPage === totalLcaPages}
                        className="h-6 w-6 inline-flex items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                        aria-label="Next page"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

              </>
            );
          })()}
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
