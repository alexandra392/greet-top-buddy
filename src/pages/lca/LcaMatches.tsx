import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LCA_PRODUCTS, type LcaProduct } from "@/lib/lcaData";
import { ArrowLeft, ChevronLeft, ChevronRight, Search, ExternalLink, Bookmark } from "lucide-react";
import { Input } from "@/components/ui/input";

const LCA_MATCHES_PAGE_SIZE = 8;

type RankedLca = {
  id: string;
  title: string;
  provider: string;
  year: number;
  method: string;
  score: number;
  url: string;
};

const LCA_PROVIDERS = [
  "ecoinvent", "Sphera GaBi", "EF 3.0 Reference", "Agribalyse", "PEF Pilot",
  "Industry Consortium", "ELCD", "Quantis WORLD", "Idemat", "Supplier EPD",
  "Thinkstep", "SimaPro", "OpenLCA", "Brightway", "GreenDelta",
];
const LCA_METHODS = ["EF 3.0", "ReCiPe 2016", "CML-IA", "TRACI 2.1", "IPCC 2021"];

function getRankedLcas(p: LcaProduct): RankedLca[] {
  const seed = Array.from(p.id).reduce((a, c) => a + c.charCodeAt(0), 0);
  const count = 16 + (seed % 6);
  const items: RankedLca[] = [];
  for (let i = 0; i < count; i++) {
    const s = (seed * (i + 7)) % 100;
    const score = Math.max(42, 98 - i * (3 + (s % 4)) - (s % 5));
    const provider = LCA_PROVIDERS[(seed + i) % LCA_PROVIDERS.length];
    items.push({
      id: `${p.id}-lca-${i}`,
      title:
        i === 0
          ? `${p.name} — Reference baseline (${p.systemBoundary})`
          : `${p.name} — ${provider} dataset v${1 + ((seed + i) % 4)}.${(i * 3) % 9}`,
      provider,
      year: 2020 + ((seed + i * 3) % 6),
      method: LCA_METHODS[(seed + i) % LCA_METHODS.length],
      score,
      url: `https://lca-database.example.org/datasets/${p.id}-${i}`,
    });
  }
  return items.sort((a, b) => b.score - a.score);
}

export default function LcaMatches() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = useMemo(() => LCA_PRODUCTS.find((p) => p.id === id), [id]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  if (!product) {
    return (
      <div className="max-w-[1400px] w-full mx-auto px-6 pt-6">
        <button
          onClick={() => navigate("/lca")}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to LCA Tool
        </button>
        <p className="text-sm text-muted-foreground mt-4">Product not found.</p>
      </div>
    );
  }

  const ranked = useMemo(() => getRankedLcas(product), [product]);
  const years = useMemo(
    () => Array.from(new Set(ranked.map((r) => r.year))).sort((a, b) => b - a),
    [ranked]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ranked.filter((r) => {
      if (yearFilter !== "all" && String(r.year) !== yearFilter) return false;
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.provider.toLowerCase().includes(q) ||
        r.method.toLowerCase().includes(q)
      );
    });
  }, [ranked, query, yearFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / LCA_MATCHES_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * LCA_MATCHES_PAGE_SIZE;
  const end = Math.min(start + LCA_MATCHES_PAGE_SIZE, filtered.length);
  const paged = filtered.slice(start, end);

  const allPagedSelected = paged.length > 0 && paged.every((lca) => selectedIds.has(lca.id));
  const somePagedSelected = paged.some((lca) => selectedIds.has(lca.id)) && !allPagedSelected;

  function toggleId(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllPaged() {
    if (allPagedSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paged.forEach((lca) => next.delete(lca.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        paged.forEach((lca) => next.add(lca.id));
        return next;
      });
    }
  }

  return (
    <div className="h-full bg-background flex flex-col">
      <div className="max-w-[1400px] w-full mx-auto px-6 pt-4 pb-6 flex-1 flex flex-col">
        {/* Back button */}
        <div className="mb-3">
          <button
            onClick={() => navigate("/lca")}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>

        {/* Heading */}
        <div className="mb-3">
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            LCA Tool
          </h2>
        </div>


        {/* Filters */}
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by dataset, provider or method..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className="pl-9 h-8 text-xs"
            />
          </div>
          <select
            value={yearFilter}
            onChange={(e) => { setYearFilter(e.target.value); setPage(1); }}
            className="h-8 text-xs rounded-md border border-border bg-background px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All years</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        </div>

        <div className="rounded-xl border border-border/60 bg-card overflow-hidden flex-1">
          <div className="grid grid-cols-[36px_44px_1fr_140px_80px_90px_40px] gap-4 px-6 py-2.5 border-b border-border/60 bg-muted/30 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider items-center">
            <div />
            <div>Rank</div>
            <div>Dataset</div>
            <div>Provider</div>
            <div>Year</div>
            <div className="text-right">Score</div>
            <div />
          </div>
          {paged.length === 0 && (
            <div className="px-6 py-8 text-center text-xs text-muted-foreground">
              No matches found.
            </div>
          )}
          {paged.map((lca) => {
            const isSelected = selectedIds.has(lca.id);
            return (
              <div
                key={lca.id}
                className={`grid grid-cols-[44px_1fr_130px_72px_90px_40px_32px] gap-4 items-center px-6 py-3 border-b border-border/40 last:border-b-0 hover:bg-muted/40 transition-colors group ${
                  isSelected ? "bg-primary/[0.04]" : ""
                }`}
              >
                <div className="text-xs font-bold text-muted-foreground tabular-nums">
                  #{ranked.findIndex((r) => r.id === lca.id) + 1}
                </div>
                <button
                  onClick={() => navigate(`/lca/products/${product.id}/performance`)}
                  className="text-left text-xs font-semibold text-foreground truncate hover:text-primary transition-colors"
                >
                  {lca.title}
                </button>
                <div className="text-[11px] text-muted-foreground truncate">
                  {lca.provider}
                </div>
                <div className="text-[11px] text-muted-foreground tabular-nums">
                  {lca.year}
                </div>
                <div className="text-xs font-bold text-primary tabular-nums text-right">
                  {lca.score}%
                </div>
                <a
                  href={lca.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open source URL"
                  onClick={(e) => e.stopPropagation()}
                  className="h-7 w-7 inline-flex items-center justify-center rounded text-muted-foreground hover:text-primary hover:bg-muted transition-colors justify-self-end"
                  aria-label="Open dataset source"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => toggleId(lca.id)}
                  title={isSelected ? "Remove from shortlist" : "Add to shortlist"}
                  className={`h-7 w-7 inline-flex items-center justify-center rounded transition-colors justify-self-end ${
                    isSelected
                      ? "text-primary hover:bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}
                  aria-label={isSelected ? "Remove from shortlist" : "Add to shortlist"}
                  aria-pressed={isSelected}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSelected ? "fill-current" : ""}`} />
                </button>
              </div>
            );
          })}
        </div>


        <div className="flex items-center justify-between pt-4">
          <span className="text-xs text-muted-foreground">
            Showing <span className="text-foreground font-medium">{filtered.length === 0 ? 0 : start + 1}–{end}</span> of <span className="text-foreground font-medium">{filtered.length}</span> matches
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-7 w-7 inline-flex items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs text-muted-foreground px-2 tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-7 w-7 inline-flex items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sticky shortlist bar */}
      {selectedIds.size > 0 && (
        <div className="sticky bottom-0 left-0 right-0 border-t border-border/60 bg-card/95 backdrop-blur-sm z-50">
          <div className="max-w-[1400px] w-full mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {selectedIds.size}
              </span>
              <span className="text-xs text-foreground font-medium">
                {selectedIds.size === 1 ? "1 dataset selected" : `${selectedIds.size} datasets selected`}
              </span>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-[11px] text-muted-foreground hover:text-foreground underline"
              >
                Clear all
              </button>
            </div>
            <button
              onClick={() => {
                const ids = Array.from(selectedIds);
                navigate(`/lca/products/${product.id}/performance`, { state: { selectedLcaIds: ids } });
              }}
              className="inline-flex items-center gap-1.5 h-8 px-4 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              Proceed with selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
