import VCGWelcomeWidget from "@/components/VCGWelcomeWidget";
import PortfolioUpdatesWidget from "@/components/PortfolioUpdatesWidget";
import { Sparkles } from "lucide-react";

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

      {/* Latest Updates Section - Coming Soon */}
      <div className="space-y-2.5">
        <div>
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Latest Updates</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Real-time updates across your portfolio topics
          </p>
        </div>
        <div className="border border-dashed border-border/60 rounded-xl px-6 py-10 flex flex-col items-center justify-center text-center bg-muted/20">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20 mb-2">
            <Sparkles className="w-3 h-3 text-success" />
            <span className="text-[10px] font-bold tracking-widest text-success uppercase">Coming Soon</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-md">
            We're putting the finishing touches on a unified feed of research, patents, projects, and market activity for your portfolio topics.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
