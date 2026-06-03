import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Calendar, ChevronRight, ChevronDown, Lightbulb, LifeBuoy, Sparkles } from "lucide-react";
import { ReleaseNotesModal, useHasUnseenRelease } from "@/components/ReleaseNotesModal";
import { Button } from "@/components/ui/button";
import { CompanyNotifications } from "@/components/CompanyNotifications";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import Analytics from "./pages/Analytics";
import AnalysisManagement from "./pages/AnalysisManagement";
import OrganizationManagement from "./pages/OrganizationManagement";
import TopicLandscape from "./pages/TopicLandscape";
import PatentLandscape from "./pages/PatentLandscape";
import ScientificPublications from "./pages/ScientificPublications";
import MarketActivity from "./pages/MarketActivity";
import MarketActivityReview from "./pages/MarketActivityReview";
import ValueChain from "./pages/ValueChain";
import ValueChainPathways from "./pages/ValueChainPathways";
import ValueChainPathwaysFunnel from "./pages/ValueChainPathwaysFunnel";
import PathwayDetail from "./pages/PathwayDetail";
import PathwayIPLandscape from "./pages/PathwayIPLandscape";
import PathwayResearchLandscape from "./pages/PathwayResearchLandscape";
import InnovationProjects from "./pages/InnovationProjects";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Projects from "./pages/Projects";
import Profile from "./pages/Profile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const HeaderBreadcrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const match = location.pathname.match(/\/landscape\/([^/]+)\/([^/]+)/);
  if (!match) {
    // Show "Dashboard" on the home page
    if (location.pathname === '/') {
      return (
        <div className="flex items-center gap-2 text-xs text-foreground font-medium ml-3">
          Dashboard
        </div>
      );
    }
    return null;
  }
  
  const category = decodeURIComponent(match[1]);
  const topic = decodeURIComponent(match[2]);
  const path = location.pathname;
  
  const isPathways = path.includes('/pathways');
  const isPathwayDetail = path.match(/\/pathways\/(\d+)/);
  const pathwayId = isPathwayDetail?.[1];
  const isMarketActivity = path.includes('/market-activity');
  const isMarketReview = path.includes('/market-activity/review');
  const isPatents = path.includes('/patents') && !path.includes('/pathways');
  const isPublications = path.includes('/publications') && !path.includes('/pathways');
  const isIPLandscape = path.includes('/ip-landscape');
  const isResearchLandscape = path.includes('/research-landscape');
  const isInnovationProjects = path.includes('/innovation-projects');
  
  // Check if navigated from a pathway context
  const navState = location.state as any;
  const fromPathway = navState?.fromPathway;
  const sourcePathwayId = navState?.pathwayId || pathwayId;
  
  // Build breadcrumb segments
  const segments: { label: string; onClick?: () => void }[] = [];
  
  // Always start with Dashboard > Topic
  segments.push({ label: 'Dashboard', onClick: () => navigate('/') });
  const execSummaryLabel = category === 'Feedstock' ? 'Feedstock Executive Summary' : 'Product Executive Summary';
  segments.push({ label: execSummaryLabel, onClick: () => navigate(`/landscape/${match[1]}/${match[2]}/value-chain`) });
  
  // Pathway context (either from URL or navigation state)
  const hasPathwayContext = isPathways || isIPLandscape || isResearchLandscape || isInnovationProjects || fromPathway;
  
  if (hasPathwayContext) {
    segments.push({ label: 'Pathway Explorer', onClick: () => navigate(`/landscape/${match[1]}/${match[2]}/value-chain/pathways`) });
    
    const isOnSubPage = isIPLandscape || isResearchLandscape || isInnovationProjects || (isMarketActivity && fromPathway);
    const isPlainPathwayProfile = isPathwayDetail && !isOnSubPage;
    
    if (isOnSubPage) {
      const pid = sourcePathwayId || '1';
      segments.push({ label: 'Pathway Profile', onClick: () => navigate(`/landscape/${match[1]}/${match[2]}/value-chain/pathways/${pid}`) });
    } else if (isPlainPathwayProfile) {
      segments.push({ label: 'Pathway Profile' }); // current page, no click
    }
  }
  
  // Current page (sub-pages) - prefix with "Pathway" when from pathway context
  const prefix = hasPathwayContext ? 'Pathway ' : '';
  
  if (isMarketReview) {
    segments.push({ label: `${prefix}Market Players`, onClick: () => navigate(`/landscape/${match[1]}/${match[2]}/market-activity`) });
    segments.push({ label: 'Review' });
  } else if (isMarketActivity) {
    segments.push({ label: `${prefix}Market Players` });
  } else if (isPatents) {
    segments.push({ label: 'IP Landscape' });
  } else if (isPublications) {
    segments.push({ label: 'Research Landscape' });
  } else if (isIPLandscape) {
    segments.push({ label: 'Pathway IP Landscape' });
  } else if (isResearchLandscape) {
    segments.push({ label: 'Pathway Research Landscape' });
  } else if (isInnovationProjects) {
    segments.push({ label: 'Pathway Innovation Projects' });
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground ml-3">
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        return (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="w-3 h-3" />}
            {isLast || !seg.onClick ? (
              <span className={isLast ? "text-foreground font-medium" : ""}>{seg.label}</span>
            ) : (
              <button onClick={seg.onClick} className="hover:text-foreground transition-colors">{seg.label}</button>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};


const WhatsNewButton = () => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedVersion, setSelectedVersion] = React.useState<string | null>(null);
  const { hasUnseen, markSeen } = useHasUnseenRelease();
  return (
    <>
      <DropdownMenu onOpenChange={(o) => { if (o) markSeen(); }}>
        <DropdownMenuTrigger asChild>
          <button
            className="relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="What's new"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>What's New</span>
            {hasUnseen && (
              <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72 p-0">
          <div className="px-3 py-2 border-b border-border/60 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Release Notes
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto py-1">
            {RELEASE_NOTES.map((note) => {
              const dateLabel = new Date(note.date).toLocaleDateString(undefined, {
                year: "numeric", month: "short", day: "numeric",
              });
              const isCurrent = note.version === CURRENT_VERSION;
              return (
                <DropdownMenuItem
                  key={note.version}
                  onSelect={() => { setSelectedVersion(note.version); setModalOpen(true); }}
                  className="flex flex-col items-start gap-0.5 px-3 py-2 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold tabular-nums">v{note.version}</span>
                      {isCurrent && (
                        <span className="text-[9px] px-1.5 py-0 h-4 inline-flex items-center rounded bg-primary text-primary-foreground font-medium">
                          Latest
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">{dateLabel}</span>
                  </div>
                  {note.title && (
                    <span className="text-[11px] text-muted-foreground line-clamp-1">{note.title}</span>
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      <ReleaseNotesModal
        open={modalOpen}
        onOpenChange={(v) => { setModalOpen(v); if (!v) setSelectedVersion(null); }}
        version={selectedVersion}
      />
    </>
  );
};

const App = () => {
  const location = useLocation();

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset className="!m-0 !ml-0 !p-0 bg-transparent flex flex-col h-screen">
          <div className="pointer-events-none fixed inset-x-0 top-12 z-50 border-t border-primary/8" />
          <header className="sticky top-0 z-40 bg-card/70 backdrop-blur-lg">
            <div className="h-12 flex items-center justify-between px-4">
              <div className="flex items-center">
                <SidebarTrigger className="p-2 hover:bg-muted rounded-lg transition-colors" />
                <HeaderBreadcrumb />
              </div>
              <div className="flex items-center gap-1">
                <a
                  href="mailto:support@vcg.ai?subject=VCG.AI%20Support%20Request"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <LifeBuoy className="w-3.5 h-3.5" />
                  <span>Contact Support</span>
                </a>
                <WhatsNewButton />
              </div>
            </div>
          </header>
          <div className="flex-1 bg-background overflow-y-auto">
            <div key={location.pathname} className="animate-page-in h-full">
              <Routes location={location}>
                <Route path="/" element={<Index />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/analysis-management" element={<AnalysisManagement />} />
                <Route path="/organization/:id" element={<OrganizationManagement />} />
                <Route path="/landscape/:category/:topic" element={<TopicLandscape />} />
                <Route path="/landscape/:category/:topic/value-chain" element={<ValueChain />} />
                <Route path="/landscape/:category/:topic/value-chain/analysis" element={<ValueChain />} />
                <Route path="/landscape/:category/:topic/value-chain/pathways/funnel" element={<ValueChainPathwaysFunnel />} />
                <Route path="/landscape/:category/:topic/value-chain/pathways" element={<ValueChainPathways />} />
                <Route path="/landscape/:category/:topic/value-chain/pathways/:pathwayId" element={<PathwayDetail />} />
                <Route path="/landscape/:category/:topic/value-chain/pathways/:pathwayId/ip-landscape" element={<PathwayIPLandscape />} />
                <Route path="/landscape/:category/:topic/value-chain/pathways/:pathwayId/research-landscape" element={<PathwayResearchLandscape />} />
                <Route path="/landscape/:category/:topic/value-chain/pathways/:pathwayId/innovation-projects" element={<InnovationProjects />} />
                <Route path="/landscape/:category/:topic/value-chain/pathways/:pathwayId/market-players" element={<MarketActivity />} />
                <Route path="/landscape/:category/:topic/publications" element={<ScientificPublications />} />
                <Route path="/landscape/:category/:topic/patents" element={<PatentLandscape />} />
                <Route path="/landscape/:category/:topic/market-activity" element={<MarketActivity />} />
                <Route path="/landscape/:category/:topic/market-activity/review" element={<MarketActivityReview />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
};

const AppWrapper = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
);

export default AppWrapper;
