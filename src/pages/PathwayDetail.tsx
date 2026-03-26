import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, FileText, BookOpen, FolderKanban, Scale, BarChart3, ChevronRight, Search, ChevronDown, ChevronUp, MessageSquare, Bookmark, ThumbsDown, Download, List, ExternalLink, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import PathwayResourcesTab from "@/components/PathwayResourcesTab";
import PathwayFlowPopover from "@/components/PathwayFlowPopover";
import PathwayOpinionsTab from "@/components/PathwayOpinionsTab";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import VCGScoreBadge from '@/components/VCGScoreBadge';

const PathwayDetail = () => {
  const { pathwayId, category, topic } = useParams<{pathwayId: string;category: string;topic: string;}>();
  const navigate = useNavigate();
  const [activeOpinionsTab, setActiveOpinionsTab] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);

  // State for favorites and saves
  const pathwayIndex = parseInt(pathwayId || "0");
  const [isFavorited, setIsFavorited] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load favorite and save states from localStorage
  useEffect(() => {
    const favoritedPathways = localStorage.getItem('favoritedPathways');
    const savedPathways = localStorage.getItem('savedPathways');

    if (favoritedPathways) {
      const favorited = new Set(JSON.parse(favoritedPathways));
      setIsFavorited(favorited.has(pathwayIndex));
    }

    if (savedPathways) {
      const saved = new Set(JSON.parse(savedPathways));
      setIsSaved(saved.has(pathwayIndex));
    }
  }, [pathwayIndex]);

  const toggleFavorite = () => {
    const favoritedPathways = localStorage.getItem('favoritedPathways');
    const favorited = favoritedPathways ? new Set(JSON.parse(favoritedPathways)) : new Set();

    if (favorited.has(pathwayIndex)) {
      favorited.delete(pathwayIndex);
      setIsFavorited(false);
    } else {
      favorited.add(pathwayIndex);
      setIsFavorited(true);
    }

    localStorage.setItem('favoritedPathways', JSON.stringify(Array.from(favorited)));
  };

  const toggleSave = () => {
    const savedPathways = localStorage.getItem('savedPathways');
    const saved = savedPathways ? new Set(JSON.parse(savedPathways)) : new Set();

    if (saved.has(pathwayIndex)) {
      saved.delete(pathwayIndex);
      setIsSaved(false);
    } else {
      saved.add(pathwayIndex);
      setIsSaved(true);
    }

    localStorage.setItem('savedPathways', JSON.stringify(Array.from(saved)));
  };

  // Get pathway data from localStorage
  const getPathwayData = () => {
    const customPathways = localStorage.getItem('customPathways');
    const allPathways = customPathways ? JSON.parse(customPathways) : [];

    // Predefined pathways would be loaded here too
    const decodedTopic = topic ? decodeURIComponent(topic) : 'Lactic Acid';
    const PREDEFINED_PATHWAYS = [
    {
      feedstock: "Corn Starch",
      technology: "Homofermentation (Lactobacillus)",
      product: decodedTopic,
      application: "PLA Packaging",
      trl: "TRL 9",
      patents: "12 Patents",
      category1: "Agricultural Waste",
      category2: "Biotechnology",
      category3: "Bioplastics",
      category4: "Packaging"
    },
    {
      feedstock: "Sugarcane Molasses",
      technology: "Heterofermentation",
      product: decodedTopic,
      application: "Food Preservatives",
      trl: "TRL 7",
      patents: "8 Patents",
      category1: "Agricultural By-product",
      category2: "Biotechnology",
      category3: "Food & Beverage",
      category4: "Food & Beverage"
    }];


    const combined = [...PREDEFINED_PATHWAYS, ...allPathways];
    const index = parseInt(pathwayId || "0");
    return combined[index] || combined[0];
  };

  const pathway = getPathwayData();
  const pathwayNumber = parseInt(pathwayId || "0") + 1;
  const [activeTab, setActiveTab] = useState<'feedstock' | 'technology' | 'product' | 'application' | null>('feedstock');
  const [hoveredFlowType, setHoveredFlowType] = useState<string | null>(null);
  const unreadCount = useUnreadMessages(pathwayId || "0", activeOpinionsTab);
  const displayUnreadCount = 3;

  // Swappable pathway values
  const [swaps, setSwaps] = useState<Record<string, string>>({});
  const currentFeedstock = swaps.feedstock || pathway.feedstock;
  const currentTechnology = swaps.technology || pathway.technology;
  const currentProduct = swaps.product || pathway.product;
  const currentApplication = swaps.application || pathway.application;

  const handleSwap = (type: string, newValue: string) => {
    setSwaps(prev => ({ ...prev, [type]: newValue }));
  };

  // Alternative metrics data - keyed by name
  const alternativeMetrics: Record<string, {
    radar: { feedstockPrice: number; supplyVolume: number; capex: number; yield: number; marketPrice: number; sizeGlobal: number; sizeEU: number; growthGlobal: number; growthEU: number; appPrice: number };
    metrics: { feedstockPrice: string; feedstockQty: string; capex: string; trl: string; marketGlobal: string; marketEU: string; growthGlobal: string; growthEU: string; appPrice: string };
  }> = {
    // Default / original
    _default: {
      radar: { feedstockPrice: 85, supplyVolume: 90, capex: 72, yield: 88, marketPrice: 78, sizeGlobal: 92, sizeEU: 85, growthGlobal: 80, growthEU: 83, appPrice: 82 },
      metrics: { feedstockPrice: '€120-180/t', feedstockQty: '8.2M t/yr', capex: '€15-25M', trl: 'TRL 9', marketGlobal: '$3.9B', marketEU: '€1.4B', growthGlobal: '8.5% CAGR', growthEU: '9.2% CAGR', appPrice: '€2,800-3,500/t' },
    },
    // Feedstock alternatives
    'Sugarcane Molasses': {
      radar: { feedstockPrice: 70, supplyVolume: 75, capex: 72, yield: 88, marketPrice: 78, sizeGlobal: 92, sizeEU: 85, growthGlobal: 80, growthEU: 83, appPrice: 82 },
      metrics: { feedstockPrice: '€80-130/t', feedstockQty: '12.5M t/yr', capex: '€15-25M', trl: 'TRL 9', marketGlobal: '$3.9B', marketEU: '€1.4B', growthGlobal: '8.5% CAGR', growthEU: '9.2% CAGR', appPrice: '€2,800-3,500/t' },
    },
    'Wheat Bran': {
      radar: { feedstockPrice: 78, supplyVolume: 65, capex: 72, yield: 88, marketPrice: 78, sizeGlobal: 92, sizeEU: 85, growthGlobal: 80, growthEU: 83, appPrice: 82 },
      metrics: { feedstockPrice: '€90-140/t', feedstockQty: '5.8M t/yr', capex: '€15-25M', trl: 'TRL 9', marketGlobal: '$3.9B', marketEU: '€1.4B', growthGlobal: '8.5% CAGR', growthEU: '9.2% CAGR', appPrice: '€2,800-3,500/t' },
    },
    'Cassava Starch': {
      radar: { feedstockPrice: 82, supplyVolume: 70, capex: 72, yield: 88, marketPrice: 78, sizeGlobal: 92, sizeEU: 85, growthGlobal: 80, growthEU: 83, appPrice: 82 },
      metrics: { feedstockPrice: '€100-160/t', feedstockQty: '6.4M t/yr', capex: '€15-25M', trl: 'TRL 9', marketGlobal: '$3.9B', marketEU: '€1.4B', growthGlobal: '8.5% CAGR', growthEU: '9.2% CAGR', appPrice: '€2,800-3,500/t' },
    },
    // Technology alternatives
    'Heterofermentation': {
      radar: { feedstockPrice: 85, supplyVolume: 90, capex: 65, yield: 72, marketPrice: 78, sizeGlobal: 92, sizeEU: 85, growthGlobal: 80, growthEU: 83, appPrice: 82 },
      metrics: { feedstockPrice: '€120-180/t', feedstockQty: '8.2M t/yr', capex: '€20-35M', trl: 'TRL 7', marketGlobal: '$3.9B', marketEU: '€1.4B', growthGlobal: '8.5% CAGR', growthEU: '9.2% CAGR', appPrice: '€2,800-3,500/t' },
    },
    'Enzymatic Hydrolysis + Fermentation': {
      radar: { feedstockPrice: 85, supplyVolume: 90, capex: 58, yield: 80, marketPrice: 78, sizeGlobal: 92, sizeEU: 85, growthGlobal: 80, growthEU: 83, appPrice: 82 },
      metrics: { feedstockPrice: '€120-180/t', feedstockQty: '8.2M t/yr', capex: '€25-40M', trl: 'TRL 6', marketGlobal: '$3.9B', marketEU: '€1.4B', growthGlobal: '8.5% CAGR', growthEU: '9.2% CAGR', appPrice: '€2,800-3,500/t' },
    },
    'Continuous Fermentation (CSTR)': {
      radar: { feedstockPrice: 85, supplyVolume: 90, capex: 68, yield: 82, marketPrice: 78, sizeGlobal: 92, sizeEU: 85, growthGlobal: 80, growthEU: 83, appPrice: 82 },
      metrics: { feedstockPrice: '€120-180/t', feedstockQty: '8.2M t/yr', capex: '€18-30M', trl: 'TRL 8', marketGlobal: '$3.9B', marketEU: '€1.4B', growthGlobal: '8.5% CAGR', growthEU: '9.2% CAGR', appPrice: '€2,800-3,500/t' },
    },
    // Product alternatives
    'D-Lactic Acid': {
      radar: { feedstockPrice: 85, supplyVolume: 90, capex: 72, yield: 88, marketPrice: 82, sizeGlobal: 68, sizeEU: 60, growthGlobal: 92, growthEU: 88, appPrice: 82 },
      metrics: { feedstockPrice: '€120-180/t', feedstockQty: '8.2M t/yr', capex: '€15-25M', trl: 'TRL 9', marketGlobal: '$1.2B', marketEU: '€480M', growthGlobal: '12.1% CAGR', growthEU: '13.5% CAGR', appPrice: '€2,800-3,500/t' },
    },
    'Lactide': {
      radar: { feedstockPrice: 85, supplyVolume: 90, capex: 72, yield: 88, marketPrice: 75, sizeGlobal: 72, sizeEU: 65, growthGlobal: 85, growthEU: 82, appPrice: 82 },
      metrics: { feedstockPrice: '€120-180/t', feedstockQty: '8.2M t/yr', capex: '€15-25M', trl: 'TRL 9', marketGlobal: '$2.1B', marketEU: '€850M', growthGlobal: '10.2% CAGR', growthEU: '11.0% CAGR', appPrice: '€2,800-3,500/t' },
    },
    // Application alternatives
    'Food Preservatives': {
      radar: { feedstockPrice: 85, supplyVolume: 90, capex: 72, yield: 88, marketPrice: 78, sizeGlobal: 92, sizeEU: 85, growthGlobal: 80, growthEU: 83, appPrice: 70 },
      metrics: { feedstockPrice: '€120-180/t', feedstockQty: '8.2M t/yr', capex: '€15-25M', trl: 'TRL 9', marketGlobal: '$3.9B', marketEU: '€1.4B', growthGlobal: '8.5% CAGR', growthEU: '9.2% CAGR', appPrice: '€1,200-1,800/t' },
    },
    'PLA Fiber': {
      radar: { feedstockPrice: 85, supplyVolume: 90, capex: 72, yield: 88, marketPrice: 78, sizeGlobal: 92, sizeEU: 85, growthGlobal: 80, growthEU: 83, appPrice: 88 },
      metrics: { feedstockPrice: '€120-180/t', feedstockQty: '8.2M t/yr', capex: '€15-25M', trl: 'TRL 9', marketGlobal: '$3.9B', marketEU: '€1.4B', growthGlobal: '8.5% CAGR', growthEU: '9.2% CAGR', appPrice: '€3,200-4,200/t' },
    },
    'Green Solvents': {
      radar: { feedstockPrice: 85, supplyVolume: 90, capex: 72, yield: 88, marketPrice: 78, sizeGlobal: 92, sizeEU: 85, growthGlobal: 80, growthEU: 83, appPrice: 75 },
      metrics: { feedstockPrice: '€120-180/t', feedstockQty: '8.2M t/yr', capex: '€15-25M', trl: 'TRL 9', marketGlobal: '$3.9B', marketEU: '€1.4B', growthGlobal: '8.5% CAGR', growthEU: '9.2% CAGR', appPrice: '€1,800-2,500/t' },
    },
    '3D Printing Filament': {
      radar: { feedstockPrice: 85, supplyVolume: 90, capex: 72, yield: 88, marketPrice: 78, sizeGlobal: 92, sizeEU: 85, growthGlobal: 80, growthEU: 83, appPrice: 92 },
      metrics: { feedstockPrice: '€120-180/t', feedstockQty: '8.2M t/yr', capex: '€15-25M', trl: 'TRL 9', marketGlobal: '$3.9B', marketEU: '€1.4B', growthGlobal: '8.5% CAGR', growthEU: '9.2% CAGR', appPrice: '€4,500-6,000/t' },
    },
  };

  // Compute active metrics by merging swaps
  const getActiveMetrics = () => {
    let radar = { ...alternativeMetrics._default.radar };
    let metrics = { ...alternativeMetrics._default.metrics };
    
    // Apply feedstock swap
    if (swaps.feedstock && alternativeMetrics[swaps.feedstock]) {
      const alt = alternativeMetrics[swaps.feedstock];
      radar.feedstockPrice = alt.radar.feedstockPrice;
      radar.supplyVolume = alt.radar.supplyVolume;
      metrics.feedstockPrice = alt.metrics.feedstockPrice;
      metrics.feedstockQty = alt.metrics.feedstockQty;
    }
    // Apply technology swap
    if (swaps.technology && alternativeMetrics[swaps.technology]) {
      const alt = alternativeMetrics[swaps.technology];
      radar.capex = alt.radar.capex;
      radar.yield = alt.radar.yield;
      metrics.capex = alt.metrics.capex;
      metrics.trl = alt.metrics.trl;
    }
    // Apply product swap
    if (swaps.product && alternativeMetrics[swaps.product]) {
      const alt = alternativeMetrics[swaps.product];
      radar.marketPrice = alt.radar.marketPrice;
      radar.sizeGlobal = alt.radar.sizeGlobal;
      radar.sizeEU = alt.radar.sizeEU;
      radar.growthGlobal = alt.radar.growthGlobal;
      radar.growthEU = alt.radar.growthEU;
      metrics.marketGlobal = alt.metrics.marketGlobal;
      metrics.marketEU = alt.metrics.marketEU;
      metrics.growthGlobal = alt.metrics.growthGlobal;
      metrics.growthEU = alt.metrics.growthEU;
    }
    // Apply application swap
    if (swaps.application && alternativeMetrics[swaps.application]) {
      const alt = alternativeMetrics[swaps.application];
      radar.appPrice = alt.radar.appPrice;
      metrics.appPrice = alt.metrics.appPrice;
    }
    
    return { radar, metrics };
  };

  const activeMetrics = getActiveMetrics();
  const activeScore = Math.round(Object.values(activeMetrics.radar).reduce((a, b) => a + b, 0) / Object.values(activeMetrics.radar).length);

  // Popover data for each flow item
  const flowPopoverData = {
    feedstock: {
      name: currentFeedstock,
      category1: pathway.category1 || 'Agricultural Waste',
      category2: 'Starch-based',
      description: 'A renewable carbohydrate-rich feedstock commonly derived from cereal crops. Widely available and cost-effective for industrial fermentation processes.',
      alternatives: [
        { name: 'Sugarcane Molasses' },
        { name: 'Wheat Bran' },
        { name: 'Cassava Starch' },
      ],
    },
    technology: {
      name: currentTechnology,
      category1: pathway.category2 || 'Biotechnology',
      category2: 'Fermentation',
      description: 'A microbial fermentation process using Lactobacillus strains to convert sugars into lactic acid with high selectivity and yield.',
      alternatives: [
        { name: 'Heterofermentation' },
        { name: 'Enzymatic Hydrolysis + Fermentation' },
        { name: 'Continuous Fermentation (CSTR)' },
      ],
    },
    product: {
      name: currentProduct,
      category1: pathway.category3 || 'Chemicals',
      category2: 'Organic Acid',
      description: 'A versatile organic acid (C₃H₆O₃) used across food, pharmaceutical, and chemical industries. Key building block for PLA bioplastics.',
      alternatives: [
        { name: 'D-Lactic Acid' },
        { name: 'Lactide' },
      ],
    },
    application: {
      name: currentApplication,
      category1: pathway.category4 || 'Packaging',
      category2: 'Bioplastics',
      description: 'Polylactic acid (PLA) based packaging materials offering compostability and reduced carbon footprint compared to conventional plastics.',
      alternatives: [
        { name: 'Food Preservatives' },
        { name: 'PLA Fiber' },
        { name: 'Green Solvents' },
        { name: '3D Printing Filament' },
      ],
    },
  };

  // Function to convert TRL to Market Ready status
  const getMarketReadyStatus = (trl: string) => {
    const trlNumber = parseInt(trl.replace('TRL ', ''));
    if (trlNumber >= 8) return "Market Ready Now";
    if (trlNumber >= 6) return "Market Ready in 2-5 years";
    if (trlNumber >= 4) return "Market Ready in >10 years";
    return "Market Ready in <10 years";
  };

  // Function to get TRL stage label
  const getTRLStageLabel = (trl: string) => {
    const trlNumber = parseInt(trl.replace('TRL ', ''));
    if (trlNumber >= 8) return "Commercial";
    if (trlNumber >= 6) return "Pilot";
    if (trlNumber >= 4) return "Lab";
    return "R&D";
  };

  return (
    <div className="h-full bg-background flex flex-col animate-fade-in">
      <div className="max-w-[1400px] w-full mx-auto px-6 pt-4 pb-3 flex items-center justify-between flex-shrink-0">
        <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/landscape/${category}/${topic}/value-chain/pathways`)}
            className="gap-1.5 h-7 text-xs">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Button>
      </div>

      <div className="max-w-[1400px] w-full mx-auto px-6 pb-6 flex-1 min-h-0">
        <div className="grid gap-5 h-full" style={{ gridTemplateColumns: '1fr 280px' }}>
          {/* Left: Pathway Profile */}
          <div className="min-w-0">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Pathway Profile</h3>
              <div className="border border-border rounded-xl bg-card p-5 shadow-sm flex flex-col gap-3 h-full">
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">Detailed breakdown of this pathway's value chain, scoring, and key metrics. Click on any node to explore alternatives.</p>
              <div className="border border-border rounded-lg bg-card shadow-sm">
                {/* Header row */}
                <div className="px-3 py-1.5 border-b border-border bg-muted/50 rounded-t-lg grid grid-cols-[28px_50px_minmax(0,1.8fr)_minmax(0,1.8fr)_minmax(0,1.8fr)_minmax(0,1.5fr)_65px_55px_75px] items-center gap-2">
                  <span></span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest text-center flex items-center justify-center gap-0.5">VCG <Info className="w-2.5 h-2.5 text-muted-foreground/50" /></span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest text-center">Feedstock</span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest text-center">Process</span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest text-center">Product</span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest text-center">Application</span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest text-center flex items-center justify-center gap-0.5">Research <Info className="w-2.5 h-2.5 text-muted-foreground/50" /></span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest text-center flex items-center justify-center gap-0.5">IP <Info className="w-2.5 h-2.5 text-muted-foreground/50" /></span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest text-center">TRL</span>
                </div>
                {/* Single row matching table format */}
                {(() => {
                  const score = Math.max(20, 95 - (parseInt(pathwayId || "0")) * 3);
                  const researchScore = Math.min(100, Math.round(score * 0.95 + (parseInt(pathwayId || "0") % 5) * 2));
                  const ipScore = Math.max(0, Math.min(100, Math.round(100 - score + (parseInt(pathwayId || "0") % 7) * 3)));
                  const trlLabel = getTRLStageLabel(pathway.trl);
                  const trlNum = parseInt(pathway.trl.replace('TRL ', ''));
                  return (
                    <div className="px-3 py-2 grid grid-cols-[28px_50px_minmax(0,1.8fr)_minmax(0,1.8fr)_minmax(0,1.8fr)_minmax(0,1.5fr)_65px_55px_75px] items-center gap-2">
                      <button
                        onClick={toggleSave}
                        className="flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                        title={isSaved ? 'Remove from shortlist' : 'Add to shortlist'}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-primary text-primary' : ''}`} />
                      </button>
                      <div className="text-[11px] font-bold text-foreground text-center">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="cursor-help hover:text-primary transition-colors">{score}</button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 p-3" side="bottom" align="start">
                            <div className="space-y-2.5">
                              <div>
                                <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-1">VCG Score Methodology</h4>
                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                  The VCG Score evaluates pathways by blending three positive performance indicators and subtracting one negative indicator.
                                </p>
                              </div>
                              <div className="space-y-1.5">
                                {[
                                  { label: 'Research', weight: '25%', value: 65, color: 'bg-blue-500' },
                                  { label: 'TRL', weight: '40%', value: 70, color: 'bg-emerald-500' },
                                  { label: 'Market Size', weight: '35%', value: 60, color: 'bg-amber-500' },
                                  { label: 'IP Score', weight: '−20%', value: 40, color: 'bg-red-400', negative: true },
                                ].map((w) => (
                                  <div key={w.label} className="flex items-center gap-2">
                                    <span className="text-[9px] font-medium text-foreground w-16 shrink-0">{w.label}</span>
                                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                      <div className={`h-full ${w.color} rounded-full`} style={{ width: `${w.value}%` }} />
                                    </div>
                                    <span className={`text-[9px] font-semibold w-8 text-right ${w.negative ? 'text-red-500' : 'text-muted-foreground'}`}>
                                      {w.weight}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      {([
                        { label: 'Feedstock', value: currentFeedstock, type: 'feedstock' as const, isAnchor: category === 'Feedstock' },
                        { label: 'Process', value: currentTechnology, type: 'technology' as const, isAnchor: false },
                        { label: 'Product', value: currentProduct, type: 'product' as const, isAnchor: category === 'Product' },
                        { label: 'Application', value: currentApplication, type: 'application' as const, isAnchor: false },
                      ]).map((node, pi) => (
                        <div
                          key={pi}
                          onMouseEnter={() => setHoveredFlowType(node.type)}
                          onMouseLeave={() => setHoveredFlowType(null)}
                        >
                          <PathwayFlowPopover
                            type={node.type}
                            data={flowPopoverData[node.type]}
                            originalValue={pathway[node.type === 'technology' ? 'technology' : node.type]}
                            onSwap={(v) => handleSwap(node.type, v)}
                            onRestore={() => setSwaps(prev => { const next = { ...prev }; delete next[node.type]; return next; })}
                          >
                            <div className={`text-[10px] font-medium truncate border rounded px-1.5 py-1 text-center transition-all ${node.isAnchor ? 'border-primary/40 bg-primary/5 text-primary' : hoveredFlowType === node.type ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20 text-foreground' : 'border-border bg-muted/20 text-foreground'}`}>
                              {node.value}
                            </div>
                          </PathwayFlowPopover>
                        </div>
                      ))}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="text-[11px] font-medium text-blue-600 text-center cursor-help hover:underline">{researchScore}</button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2.5" side="bottom" align="start">
                          <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-1">Research Score</h4>
                          <p className="text-[9px] text-muted-foreground leading-relaxed">
                            Measures the volume and quality of scientific publications supporting this pathway. Based on publication count.
                          </p>
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className={`text-[11px] font-medium text-center cursor-help hover:underline ${ipScore > 60 ? 'text-red-500' : ipScore > 30 ? 'text-amber-600' : 'text-green-600'}`}>{ipScore}</button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2.5" side="bottom" align="start">
                          <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider mb-1">IP Score</h4>
                          <p className="text-[9px] text-muted-foreground leading-relaxed">
                            Indicates patent saturation. A high IP score means dense patent coverage — less room to operate. A low score signals open IP space and greater freedom to innovate.
                          </p>
                        </PopoverContent>
                      </Popover>
                      <div className="text-center">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                          trlNum >= 8 ? 'bg-green-100 text-green-800 border border-green-200' :
                          trlNum >= 6 ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          'bg-muted text-muted-foreground border border-border'
                        }`}>
                          {trlLabel}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Technical Feasibility Evaluation Card */}
              <div className="border border-border rounded-lg bg-card px-5 py-4 shadow-sm flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Pathway Evaluation</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-1.5 max-w-[550px]">
                  This evaluation scores the pathway across key economic and technical dimensions. Higher scores indicate stronger commercial viability and lower investment risk.
                </p>
                <div className="flex gap-3 flex-1">
                  {/* Radar Chart */}
                  <div className="flex-shrink-0 w-[340px] border border-border rounded-lg bg-muted/50 p-1 flex flex-col">
                    <div className="flex flex-col items-center flex-1 justify-center">
                       <div className="relative">
                         <ResponsiveContainer width={380} height={220}>
                          <RadarChart data={[
                            { param: 'Feedstock Price', value: activeMetrics.radar.feedstockPrice, fullMark: 100, metricType: 'feedstock' },
                            { param: 'Feedstock Qty', value: activeMetrics.radar.supplyVolume, fullMark: 100, metricType: 'feedstock' },
                            { param: 'Process CAPEX', value: activeMetrics.radar.capex, fullMark: 100, metricType: 'technology' },
                            { param: 'Process TRL', value: activeMetrics.radar.yield, fullMark: 100, metricType: 'technology' },
                            { param: 'Market Size (Global)', value: activeMetrics.radar.sizeGlobal, fullMark: 100, metricType: 'product' },
                            { param: 'Market Size (EU)', value: activeMetrics.radar.sizeEU, fullMark: 100, metricType: 'product' },
                            { param: 'Growth (Global)', value: activeMetrics.radar.growthGlobal, fullMark: 100, metricType: 'product' },
                            { param: 'Growth (EU)', value: activeMetrics.radar.growthEU, fullMark: 100, metricType: 'product' },
                            { param: 'App. Price', value: activeMetrics.radar.appPrice, fullMark: 100, metricType: 'application' },
                          ]}
                          onMouseLeave={() => setHoveredFlowType(null)}
                          >
                            <PolarGrid stroke="hsl(var(--border))" />
                            <PolarAngleAxis 
                              dataKey="param" 
                              tick={({ x, y, payload, index }: any) => {
                                const radarTypes = [
                                  'feedstock', 'feedstock',
                                  'technology', 'technology',
                                  'product', 'product',
                                  'product', 'product',
                                  'application',
                                ];
                                const metricType = radarTypes[index];
                                return (
                                  <text
                                    x={x} y={y}
                                    fontSize={7}
                                    fill={hoveredFlowType === metricType ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                                    fontWeight={hoveredFlowType === metricType ? 600 : 400}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    style={{ cursor: 'pointer', transition: 'fill 0.2s' }}
                                    onMouseEnter={() => setHoveredFlowType(metricType || null)}
                                  >
                                    {payload.value}
                                  </text>
                                );
                              }}
                            />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="VCG Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={1.5} dot={{ r: 2, fill: 'hsl(var(--primary))' }} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-2 px-2">
                        <details className="group">
                          <summary className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors flex items-center gap-1">
                            <Info className="w-2.5 h-2.5" />
                            Methodology
                          </summary>
                          <div className="mt-1.5 text-[8px] text-muted-foreground leading-relaxed space-y-1">
                            <p>Each axis represents a normalized score (0–100) derived from publicly available data sources. Higher values indicate more favorable conditions for pathway viability.</p>
                            <p><strong className="text-foreground">Feedstock Price</strong> — Inverse of raw material cost. <strong className="text-foreground">Feedstock Qty</strong> — Supply volume availability relative to demand.</p>
                            <p><strong className="text-foreground">Process CAPEX</strong> — Inverse of capital expenditure. <strong className="text-foreground">Process TRL</strong> — Technology Readiness Level mapped linearly.</p>
                            <p><strong className="text-foreground">Market Size</strong> — Addressable market value normalized against benchmarks. <strong className="text-foreground">Growth</strong> — CAGR scaled to sector averages.</p>
                            <p><strong className="text-foreground">App. Price</strong> — Selling price relative to production cost, indicating margin potential.</p>
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>

                  {/* Data breakdown */}
                  <div className="flex-1 space-y-0">
                    <h4 className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5 bg-muted/50 rounded-md -mx-1.5 px-1.5 py-1.5">Key Pathway Metrics</h4>
                    {[
                      { label: 'Feedstock Price (EU)', value: activeMetrics.metrics.feedstockPrice, url: 'https://www.indexmundi.com/commodities/?commodity=corn', sources: 4, type: 'feedstock' },
                      { label: 'Feedstock Quantity (EU)', value: activeMetrics.metrics.feedstockQty, url: 'https://ec.europa.eu/eurostat', sources: 3, type: 'feedstock' },
                      { label: 'Process CAPEX Investment', value: activeMetrics.metrics.capex, url: 'https://www.grandviewresearch.com', sources: 2, type: 'technology' },
                      { label: 'Process TRL', value: activeMetrics.metrics.trl, url: 'https://www.sciencedirect.com', sources: 5, type: 'technology' },
                      { label: 'Product Market Size (Global)', value: activeMetrics.metrics.marketGlobal, url: 'https://www.marketsandmarkets.com', sources: 6, type: 'product' },
                      { label: 'Product Market Size (EU)', value: activeMetrics.metrics.marketEU, url: 'https://www.marketsandmarkets.com', sources: 4, type: 'product' },
                      { label: 'Product Market Growth (Global)', value: activeMetrics.metrics.growthGlobal, url: 'https://www.grandviewresearch.com', sources: 5, type: 'product' },
                      { label: 'Product Market Growth (EU)', value: activeMetrics.metrics.growthEU, url: 'https://www.grandviewresearch.com', sources: 3, type: 'product' },
                      { label: 'Application Product Price', value: activeMetrics.metrics.appPrice, url: 'https://www.plasticsinsight.com', sources: 2, type: 'application' },
                    ].map((item, i) => {
                      const isHighlighted = hoveredFlowType === item.type;
                      return (
                        <div key={i} onMouseEnter={() => setHoveredFlowType(item.type)} onMouseLeave={() => setHoveredFlowType(null)} className={`flex justify-between items-center border-b border-border/30 py-[3px] transition-all duration-200 cursor-default ${isHighlighted ? 'bg-primary/8 -mx-1.5 px-1.5 rounded-sm border-l-2 border-l-primary' : i % 2 === 1 ? 'bg-muted/40 -mx-1.5 px-1.5 rounded-sm' : ''}`}>
                          <span className={`text-[9px] transition-colors duration-200 ${isHighlighted ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{item.label}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-semibold transition-colors duration-200 ${isHighlighted ? 'text-primary' : 'text-foreground'}`}>{item.value}</span>
                            <a href={item.url} target="_blank" rel="noopener noreferrer" title="View source">
                              <ExternalLink className="w-2.5 h-2.5 text-muted-foreground hover:text-primary transition-colors" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                </div>
              </div>
            </div>
            
            {/* Right: Sidebar */}
            <div className="space-y-2.5">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0">Landscape Analytics</h3>
              <PathwayResourcesTab productName={topic ? decodeURIComponent(topic) : "Product"} pathwayNumber={pathwayNumber} showFooter={true} />
            </div>
          </div>
        </div>
      </div>
  );
};

export default PathwayDetail;
