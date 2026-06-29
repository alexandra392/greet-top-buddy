import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LCA_PRODUCTS, type LcaProduct } from "@/lib/lcaData";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

const LCA_MATCHES_PAGE_SIZE = 8;

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
  const count = 16 + (seed % 6);
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

export default function LcaMatches() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = useMemo(() => LCA_PRODUCTS.find((p) => p.id === id), [id]);
  const [page, setPage] = useState(1);

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

  const ranked = getRankedLcas(product);
  const totalPages = Math.max(1, Math.ceil(ranked.length / LCA_MATCHES_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * LCA_MATCHES_PAGE_SIZE;
  const end = Math.min(start + LCA_MATCHES_PAGE_SIZE, ranked.length);
  const paged = ranked.slice(start, end);

  return (
    <div className="h-full bg-background">
      <div className="max-w-[1400px] w-full mx-auto px-6 pt-4 pb-6">
        <button
          onClick={() => navigate("/lca")}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to LCA Tool
        </button>

        <div className="mb-4">
          <div className="text-[10px] font-bold text-primary uppercase tracking-widest">
            LCA Matches
          </div>
          <h1 className="text-base font-bold text-foreground flex items-center gap-2 leading-tight mt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {product.name}
          </h1>
          <p className="text-[11px] text-muted-foreground mt-1">
            {ranked.length} matches · ranked by similarity score
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="grid grid-cols-[44px_1fr_130px_72px_100px_32px] gap-4 px-6 py-2.5 border-b border-border/60 bg-muted/30 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            <div>Rank</div>
            <div>Dataset</div>
            <div>Provider</div>
            <div>Year</div>
            <div className="text-right">Score</div>
            <div />
          </div>
          {paged.map((lca, idx) => (
            <button
              key={lca.id}
              onClick={() => navigate(`/lca/products/${product.id}/performance`)}
              className="w-full text-left grid grid-cols-[44px_1fr_130px_72px_100px_32px] gap-4 items-center px-6 py-3 border-b border-border/40 last:border-b-0 hover:bg-muted/40 transition-colors group"
            >
              <div className="text-xs font-bold text-muted-foreground tabular-nums">
                #{start + idx + 1}
              </div>
              <div className="text-xs font-semibold text-foreground truncate">
                {lca.title}
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                {lca.provider}
              </div>
              <div className="text-[11px] text-muted-foreground tabular-nums">
                {lca.year}
              </div>
              <div className="text-xs font-bold text-primary tabular-nums text-right">
                {lca.score}%
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors justify-self-end" />
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4">
          <span className="text-xs text-muted-foreground">
            Showing <span className="text-foreground font-medium">{start + 1}–{end}</span> of <span className="text-foreground font-medium">{ranked.length}</span> matches
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
    </div>
  );
}
