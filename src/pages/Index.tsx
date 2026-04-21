import VCGWelcomeWidget from "@/components/VCGWelcomeWidget";
import PortfolioUpdatesWidget from "@/components/PortfolioUpdatesWidget";
import { Sparkles, Clock } from "lucide-react";

const Index = () => {
  return (
    <div className="px-6 pt-4 pb-6 max-w-[1400px] w-full mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-card via-card to-success/8 border border-border/40 rounded-xl px-5 py-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-4 h-4 rounded-md bg-success/20 flex items-center justify-center">
            <Sparkles className="w-2.5 h-2.5 text-success" />
          </div>
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Welcome back!</span>
        </div>
        <h1 className="text-base font-bold text-foreground tracking-tight mb-1">
          Hello, <span className="text-success">Alexandra!</span>
        </h1>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          VCG.AI helps you make <span className="bg-success/10 text-success font-medium px-1 py-0.5 rounded text-[11px]">smarter value chain decisions</span> with real-time data, science, technology & market insights.
        </p>
      </div>

      {/* My Portfolio Section */}
      <VCGWelcomeWidget />

      {/* Latest Updates Section - Coming Soon (preview with mock data) */}
      <div className="space-y-2.5 relative">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Latest Updates</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Preview of upcoming feed — sample data shown
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/10 border border-warning/30">
            <Clock className="w-3 h-3 text-warning" />
            <span className="text-[10px] font-bold tracking-widest text-warning uppercase">Coming Soon</span>
          </div>
        </div>
        <div className="relative rounded-xl overflow-hidden border border-dashed border-border/60">
          <div className="opacity-40 grayscale pointer-events-none select-none p-3 bg-muted/10">
            <PortfolioUpdatesWidget />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/40 pointer-events-none" />
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-sm">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Mock preview</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
