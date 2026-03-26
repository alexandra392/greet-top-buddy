import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Search, ExternalLink, FlaskConical, ShoppingBag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import InstitutionPublicationsModal from "@/components/InstitutionPublicationsModal";
import CategoryPublicationsModal from "@/components/CategoryPublicationsModal";
import PublicationDetailModal from "@/components/PublicationDetailModal";

const ScientificPublications = () => {
  const { category, topic } = useParams();
  const navigate = useNavigate();
  const [selectedResearchType, setSelectedResearchType] = useState<string>("all");
  const [researchView, setResearchView] = useState<'production' | 'application'>('production');
  const [timeRange, setTimeRange] = useState<string>("5");
  
  const decodedTopic = decodeURIComponent(topic || "");
  const isFeedstockRoute = decodeURIComponent(category || "") === 'Feedstock';

  const allPublicationTrend = [
    { year: "2015", publications: 800 },
    { year: "2016", publications: 1100 },
    { year: "2017", publications: 1400 },
    { year: "2018", publications: 1900 },
    { year: "2019", publications: 1200 },
    { year: "2020", publications: 1500 },
    { year: "2021", publications: 4500 },
    { year: "2022", publications: 1500 },
    { year: "2023", publications: 6800 },
    { year: "2024", publications: 2800 }
  ];

  const publicationTrend = timeRange === '5' ? allPublicationTrend.slice(-5) : allPublicationTrend;

  const institutions = [
    { rank: 1, name: "ETH Zürich", country: "Switzerland", papers: 1240, citations: 18500, hIndex: 62, focus: "Bioprocess Engineering" },
    { rank: 2, name: "Wageningen University", country: "Netherlands", papers: 1180, citations: 16200, hIndex: 58, focus: "Biomass Conversion" },
    { rank: 3, name: "MIT", country: "United States", papers: 980, citations: 15800, hIndex: 55, focus: "Synthetic Biology" },
    { rank: 4, name: "Technical University of Denmark", country: "Denmark", papers: 920, citations: 12400, hIndex: 51, focus: "Enzyme Technology" },
    { rank: 5, name: "University of São Paulo", country: "Brazil", papers: 860, citations: 10800, hIndex: 47, focus: "Sugarcane Biorefineries" },
    { rank: 6, name: "Chinese Academy of Sciences", country: "China", papers: 840, citations: 9600, hIndex: 44, focus: "Catalytic Processes" },
    { rank: 7, name: "Imperial College London", country: "United Kingdom", papers: 780, citations: 11200, hIndex: 49, focus: "Green Chemistry" },
    { rank: 8, name: "NREL", country: "United States", papers: 720, citations: 13400, hIndex: 52, focus: "Bioenergy Systems" },
  ];

  const researchTypes = [
    { value: "all", label: "All Types" },
    { value: "meta-analysis", label: "Meta Analysis" },
    { value: "market", label: "Market Research" },
    { value: "techno-economics", label: "Techno-Economic Analysis" },
    { value: "sustainability", label: "Sustainability & LCA" },
    { value: "experimental", label: "Experimental" },
    { value: "review", label: "Review Papers" }
  ];
  
  const publications = [
    { id: 1, title: "Advanced Biochemical Valorization of Sugar Beet Pulp for Sustainable Chemical Production", date: "3 Mar 2025", authors: ["Dr. Jane Smith", "Prof. John Doe", "Dr. Sarah Wilson"], summary: "License the developed technology to industrial partners and launch a pilot-scale production.", topics: ["Apple Pomace", "Waste Valorisation"], researchType: "experimental" },
    { id: 2, title: "Circular Economy Approaches in Sugar Beet Processing: A Comprehensive Review", date: "3 Mar 2025", authors: ["Dr. Michael Chen", "Prof. Lisa Brown", "Dr. David Park"], summary: "Comprehensive analysis of circular economy principles applied to sugar beet processing chains and waste stream optimization.", topics: ["Circular Economy", "Waste Valorisation", "Sustainability"], researchType: "meta-analysis" },
    { id: 3, title: "Techno-Economic Assessment of Sugar Beet Waste Biorefinery Concepts", date: "2 Mar 2025", authors: ["Dr. Emma Johnson", "Prof. Robert Taylor", "Dr. Anna Garcia"], summary: "Investigation of innovative fermentation technologies for converting sugar beet processing residues into value-added products.", topics: ["Techno-Economics", "Biorefinery"], researchType: "techno-economics" },
    { id: 4, title: "Life Cycle Assessment of Xylose Production from Agricultural Residues", date: "1 Mar 2025", authors: ["Dr. Lars Müller", "Prof. Ingrid Svensson"], summary: "Comprehensive sustainability assessment comparing environmental impacts of different xylose production pathways.", topics: ["LCA", "Sustainability"], researchType: "sustainability" },
    { id: 5, title: "European Market Analysis for Bio-based Chemicals from Hemicellulose Streams", date: "28 Feb 2025", authors: ["Dr. Pierre Dubois", "Prof. Maria Rossi"], summary: "Market sizing and competitive landscape analysis for bio-based chemicals derived from hemicellulose feedstocks in Europe.", topics: ["Market Analysis", "Bio-chemicals"], researchType: "market" },
  ];

  const filteredPublications = selectedResearchType === "all" 
    ? publications 
    : publications.filter(p => p.researchType === selectedResearchType);

  // Heat matrix data - categories with sub-items for drill-down
  const years = ['2020', '2021', '2022', '2023', '2024'];

  interface HeatCategory {
    name: string;
    total: number;
    values: number[];
    subItems: { name: string; total: number; values: number[] }[];
  }

  const feedstockHeatData: HeatCategory[] = [
    { name: 'Lignocellulosic Biomass', total: 9800, values: [350, 380, 400, 420, 440], subItems: [
      { name: 'Corn Stover', total: 3800, values: [140, 150, 160, 170, 175] },
      { name: 'Wheat Straw', total: 3200, values: [120, 125, 130, 135, 140] },
      { name: 'Wood Chips', total: 2800, values: [90, 105, 110, 115, 125] },
    ]},
    { name: 'Sugar Crops', total: 7200, values: [280, 300, 310, 330, 320], subItems: [
      { name: 'Sugar Beet Pulp', total: 3100, values: [120, 130, 135, 145, 140] },
      { name: 'Sugarcane Bagasse', total: 2400, values: [95, 100, 105, 110, 105] },
      { name: 'Sweet Sorghum', total: 1700, values: [65, 70, 70, 75, 75] },
    ]},
    { name: 'Starch Sources', total: 6500, values: [250, 260, 270, 290, 280], subItems: [
      { name: 'Corn Starch', total: 2800, values: [110, 112, 115, 125, 120] },
      { name: 'Potato Starch', total: 2000, values: [80, 82, 85, 90, 88] },
      { name: 'Cassava Starch', total: 1700, values: [60, 66, 70, 75, 72] },
    ]},
    { name: 'Food Waste', total: 5800, values: [200, 220, 240, 250, 260], subItems: [
      { name: 'Bread Waste', total: 2200, values: [75, 85, 92, 95, 100] },
      { name: 'Fruit Pomace', total: 1900, values: [65, 72, 80, 82, 85] },
      { name: 'Coffee Grounds', total: 1700, values: [60, 63, 68, 73, 75] },
    ]},
    { name: 'Algal Biomass', total: 4300, values: [180, 200, 210, 230, 220], subItems: [
      { name: 'Microalgae', total: 2000, values: [85, 95, 100, 110, 105] },
      { name: 'Macroalgae', total: 1300, values: [55, 60, 63, 68, 65] },
      { name: 'Cyanobacteria', total: 1000, values: [40, 45, 47, 52, 50] },
    ]},
  ];

  const technologyHeatData: HeatCategory[] = [
    { name: 'Fermentation', total: 12393, values: [300, 320, 340, 360, 350], subItems: [
      { name: 'Batch Fermentation', total: 5200, values: [130, 135, 140, 150, 145] },
      { name: 'Continuous Fermentation', total: 4200, values: [100, 110, 120, 125, 120] },
      { name: 'Fed-batch Systems', total: 2993, values: [70, 75, 80, 85, 85] },
    ]},
    { name: 'Catalytic Conversion', total: 8393, values: [250, 260, 280, 270, 290], subItems: [
      { name: 'Heterogeneous Catalysis', total: 3500, values: [105, 110, 118, 114, 122] },
      { name: 'Homogeneous Catalysis', total: 2800, values: [85, 88, 95, 92, 98] },
      { name: 'Biocatalysis', total: 2093, values: [60, 62, 67, 64, 70] },
    ]},
    { name: 'Extraction & Separation', total: 7800, values: [240, 250, 260, 275, 265], subItems: [
      { name: 'Membrane Separation', total: 3100, values: [95, 100, 105, 110, 106] },
      { name: 'Solvent Extraction', total: 2600, values: [82, 85, 88, 93, 90] },
      { name: 'Distillation', total: 2100, values: [63, 65, 67, 72, 69] },
    ]},
    { name: 'Purification', total: 6200, values: [200, 215, 230, 245, 235], subItems: [
      { name: 'Crystallisation', total: 2500, values: [80, 86, 92, 98, 94] },
      { name: 'Chromatography', total: 2100, values: [68, 73, 78, 83, 80] },
      { name: 'Ion Exchange', total: 1600, values: [52, 56, 60, 64, 61] },
    ]},
    { name: 'Enzymatic Hydrolysis', total: 5400, values: [180, 190, 200, 210, 205], subItems: [
      { name: 'Cellulase Systems', total: 2200, values: [74, 78, 82, 86, 84] },
      { name: 'Hemicellulase', total: 1800, values: [60, 63, 67, 70, 68] },
      { name: 'Enzyme Cocktails', total: 1400, values: [46, 49, 51, 54, 53] },
    ]},
  ];

  const applicationHeatData: HeatCategory[] = [
    { name: 'Bioplastics & Packaging', total: 8900, values: [320, 350, 380, 410, 400], subItems: [
      { name: 'PLA Production', total: 3800, values: [135, 150, 162, 175, 170] },
      { name: 'Bio-based Films', total: 2800, values: [100, 110, 120, 130, 127] },
      { name: 'Biodegradable Packaging', total: 2300, values: [85, 90, 98, 105, 103] },
    ]},
    { name: 'Pharmaceuticals', total: 7100, values: [280, 300, 310, 330, 320], subItems: [
      { name: 'Drug Intermediates', total: 3000, values: [118, 127, 131, 140, 135] },
      { name: 'Excipients', total: 2200, values: [87, 93, 96, 102, 99] },
      { name: 'Active Ingredients', total: 1900, values: [75, 80, 83, 88, 86] },
    ]},
    { name: 'Food & Beverage', total: 6400, values: [240, 250, 260, 280, 270], subItems: [
      { name: 'Food Additives', total: 2700, values: [102, 106, 110, 119, 115] },
      { name: 'Fermented Foods', total: 2100, values: [79, 82, 86, 92, 89] },
      { name: 'Preservatives', total: 1600, values: [59, 62, 64, 69, 66] },
    ]},
    { name: 'Cosmetics & Personal Care', total: 5200, values: [200, 210, 220, 230, 240], subItems: [
      { name: 'Skin Care Actives', total: 2200, values: [85, 89, 93, 97, 102] },
      { name: 'Hair Care', total: 1700, values: [65, 69, 72, 76, 79] },
      { name: 'Natural Fragrances', total: 1300, values: [50, 52, 55, 57, 59] },
    ]},
    { name: 'Construction Materials', total: 3800, values: [150, 160, 170, 180, 190], subItems: [
      { name: 'Bio-based Adhesives', total: 1600, values: [63, 67, 72, 76, 80] },
      { name: 'Insulation Materials', total: 1200, values: [48, 51, 54, 57, 60] },
      { name: 'Composite Materials', total: 1000, values: [39, 42, 44, 47, 50] },
    ]},
  ];

  const productHeatData: HeatCategory[] = [
    { name: 'Organic Acids', total: 10200, values: [380, 400, 420, 440, 460], subItems: [
      { name: 'Lactic Acid', total: 4200, values: [158, 165, 172, 180, 188] },
      { name: 'Succinic Acid', total: 3400, values: [126, 133, 140, 147, 154] },
      { name: 'Levulinic Acid', total: 2600, values: [96, 102, 108, 113, 118] },
    ]},
    { name: 'Sugar Alcohols', total: 7800, values: [290, 310, 330, 350, 340], subItems: [
      { name: 'Xylitol', total: 3200, values: [119, 127, 135, 143, 139] },
      { name: 'Sorbitol', total: 2600, values: [97, 103, 110, 117, 114] },
      { name: 'Mannitol', total: 2000, values: [74, 80, 85, 90, 87] },
    ]},
    { name: 'Platform Chemicals', total: 6200, values: [230, 245, 260, 275, 265], subItems: [
      { name: 'Furfural', total: 2600, values: [96, 103, 109, 115, 111] },
      { name: 'HMF', total: 2000, values: [74, 79, 84, 89, 86] },
      { name: '5-ALA', total: 1600, values: [60, 63, 67, 71, 68] },
    ]},
    { name: 'Biopolymers', total: 5400, values: [200, 215, 230, 245, 235], subItems: [
      { name: 'PHA', total: 2300, values: [85, 92, 98, 104, 100] },
      { name: 'Cellulose Nanocrystals', total: 1800, values: [67, 72, 77, 82, 79] },
      { name: 'Chitosan', total: 1300, values: [48, 51, 55, 59, 56] },
    ]},
    { name: 'Biofuels', total: 4100, values: [150, 165, 175, 190, 180], subItems: [
      { name: 'Bioethanol', total: 1800, values: [66, 73, 77, 84, 79] },
      { name: 'Biodiesel', total: 1300, values: [48, 52, 56, 60, 57] },
      { name: 'Biogas', total: 1000, values: [36, 40, 42, 46, 44] },
    ]},
  ];

  const allSections = isFeedstockRoute ? [
    { title: 'Process Distribution', subtitle: 'Process × Year · Color = publication count', columnLabel: 'PROCESS', data: technologyHeatData, description: 'Highlighting where innovation is most intense across conversion process categories.', view: 'production' as const },
    { title: 'Product Distribution', subtitle: 'Product × Year · Color = publication count', columnLabel: 'PRODUCT', data: productHeatData, description: 'Research distribution across different products derived from this feedstock.', view: 'production' as const },
    { title: 'Application Distribution', subtitle: 'Application × Year · Color = publication count', columnLabel: 'APPLICATION', data: applicationHeatData, description: 'Research focus across market application areas.', view: 'application' as const },
  ] : [
    { title: 'Feedstock Distribution', subtitle: 'Feedstock × Year · Color = publication count', columnLabel: 'FEEDSTOCK', data: feedstockHeatData, description: 'Research distribution across different feedstock types.', view: 'production' as const },
    { title: 'Process Distribution', subtitle: 'Process × Year · Color = publication count', columnLabel: 'PROCESS', data: technologyHeatData, description: 'Highlighting where innovation is most intense across conversion process categories.', view: 'production' as const },
    { title: 'Application Distribution', subtitle: 'Application × Year · Color = publication count', columnLabel: 'APPLICATION', data: applicationHeatData, description: 'Research focus across market application areas.', view: 'application' as const },
  ];

  const sections = allSections.filter(s => s.view === researchView);

  const col1 = institutions.slice(0, 4);
  const col2 = institutions.slice(4, 8);

  // Drill-down state per section
  const [expandedCategory, setExpandedCategory] = useState<Record<string, string | null>>({});
  const [selectedInstitution, setSelectedInstitution] = useState<typeof institutions[0] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<{ name: string; total: number; subs: { name: string; total: number }[] } | null>(null);
  const [selectedPublicationDetail, setSelectedPublicationDetail] = useState<typeof publications[0] | null>(null);

  // Top 3 trending topics by YoY citation growth
  const getTopTrendingTopics = () => {
    const activeData = isFeedstockRoute ? technologyHeatData : feedstockHeatData;
    const withGrowth = activeData.map(cat => {
      const lastYear = cat.values[cat.values.length - 1];
      const prevYear = cat.values[cat.values.length - 2];
      const growth = prevYear > 0 ? ((lastYear - prevYear) / prevYear) * 100 : 0;
      return { topic: cat, growth };
    });
    return withGrowth.sort((a, b) => b.growth - a.growth).slice(0, 3);
  };

  const topTrending = getTopTrendingTopics();

  const renderDistributionBars = (section: typeof sections[0]) => {
    const maxTotal = Math.max(...section.data.map(d => d.total));
    const sortedData = [...section.data].sort((a, b) => b.total - a.total);

    return (
      <div key={section.title} className="bg-muted/30 border border-border/40 rounded-xl p-4">
        <div className="mb-3">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{section.title}</h3>
          <p className="text-[9px] text-muted-foreground">{section.description}</p>
        </div>
        <div className="space-y-2">
          {sortedData.map((cat, idx) => {
            const pct = (cat.total / maxTotal) * 100;
            const isExpanded = expandedCategory[section.title] === cat.name;
            return (
              <div key={cat.name}>
                <div
                  className="cursor-pointer hover:bg-muted/30 rounded-lg p-1.5 transition-colors"
                  onClick={() => {
                    setExpandedCategory(prev => ({
                      ...prev,
                      [section.title]: isExpanded ? null : cat.name
                    }));
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 w-[180px] flex-shrink-0">
                      <ChevronRight className={`w-3 h-3 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                      <span className="text-[10px] font-semibold text-foreground truncate">{cat.name}</span>
                    </div>
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: idx === 0
                            ? 'hsl(222 47% 36%)'
                            : idx === 1
                            ? 'hsl(222 40% 46%)'
                            : idx === 2
                            ? 'hsl(222 35% 56%)'
                            : idx === 3
                            ? 'hsl(222 30% 66%)'
                            : 'hsl(222 25% 76%)'
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-foreground w-[50px] text-right flex-shrink-0">{cat.total.toLocaleString()}</span>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-1 space-y-1.5 pb-1" style={{ marginLeft: '180px', paddingLeft: '12px' }}>
                    {cat.subItems.sort((a, b) => b.total - a.total).map((sub) => {
                      const subMax = Math.max(...cat.subItems.map(s => s.total));
                      const subPct = (sub.total / subMax) * 100;
                      return (
                        <div
                          key={sub.name}
                          className="cursor-pointer hover:bg-primary/[0.06] rounded-md p-1 transition-colors"
                          onClick={(e) => { e.stopPropagation(); setSelectedCategory({ name: sub.name, total: sub.total, subs: [{ name: sub.name, total: sub.total }] }); }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-medium text-foreground w-[130px] flex-shrink-0 truncate">{sub.name}</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${subPct}%`,
                                  backgroundColor: 'hsl(152 35% 50%)'
                                }}
                              />
                            </div>
                            <span className="text-[9px] font-semibold text-muted-foreground w-[50px] text-right flex-shrink-0">{sub.total.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-background flex flex-col">
      <div className="max-w-[1400px] w-full mx-auto px-6 pt-4 pb-3 flex items-center justify-between flex-shrink-0">
        <Button variant="outline" size="sm" onClick={() => navigate(`/landscape/${category}/${topic}/value-chain`)} className="gap-1.5 h-7 text-xs">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Button>
        <div />
      </div>

      <div className="max-w-[1400px] w-full mx-auto px-6 pb-6 flex-1 min-h-0 flex flex-col">
        <div className="mb-2 flex-shrink-0">
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Research Landscape: <span className="text-primary">{decodedTopic}</span></h2>
        </div>

        <Card className="bg-card border border-border/60 shadow-sm flex-1 min-w-0 flex flex-col">
          <CardContent className="px-5 py-4 pb-2 flex flex-col h-full">
            <div className="flex items-center bg-muted rounded-lg p-0.5 mb-2 flex-shrink-0 self-start">
              <button
                onClick={() => setResearchView('production')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${researchView === 'production' ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <FlaskConical className="w-3 h-3" />
                Production
              </button>
              <button
                onClick={() => setResearchView('application')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${researchView === 'application' ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <ShoppingBag className="w-3 h-3" />
                Application
              </button>
            </div>
            <p className="text-[9px] text-muted-foreground mb-2 flex-shrink-0">
              {researchView === 'production'
                ? `Research related to the production, extraction, and purification of ${decodedTopic} from biomass feedstocks.`
                : `Research related to the downstream use of ${decodedTopic} in end-market applications such as food, pharma, and materials.`
              }
            </p>

            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
              <div className="space-y-3">

                {/* Publication Trend */}
                <div className="bg-muted/30 border border-border/40 rounded-xl p-4">
                  <div className="mb-2">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Research Publication Trend</h3>
                    <p className="text-[9px] text-muted-foreground">Innovation intensity across key regions, highlighting technological hotspots and market leaders.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-[3]">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="rounded-lg border border-border/40 bg-background px-2.5 py-1">
                          <span className="text-[8px] text-muted-foreground uppercase tracking-wide">Total: </span>
                          <span className="text-[11px] font-bold text-foreground">54,600</span>
                        </div>
                        <Select value={timeRange} onValueChange={setTimeRange}>
                          <SelectTrigger className="h-6 w-auto text-[9px] border-border gap-1 px-1.5 py-0.5">
                            <Calendar className="w-2.5 h-2.5" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5" className="text-[10px]">Last 5 years</SelectItem>
                            <SelectItem value="10" className="text-[10px]">Last 10 years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={publicationTrend} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                            <XAxis dataKey="year" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 8 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tickFormatter={(v) => v.toLocaleString()} />
                            <Tooltip
                              content={({ active, payload, label }) => {
                                if (active && payload?.length) {
                                  return (
                                    <div className="bg-card border border-border rounded-lg p-1.5 shadow-lg text-[9px]">
                                      <p className="font-semibold text-foreground mb-0.5">{`${payload[0].value?.toLocaleString()} publications`}</p>
                                      <p className="text-muted-foreground">{`In ${label}`}</p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Line type="monotone" dataKey="publications" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 2.5 }} activeDot={{ r: 4, stroke: "hsl(var(--primary))", strokeWidth: 2, fill: "hsl(var(--background))" }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="flex-[2] space-y-2">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">🔥 Trending Topics</div>
                      {topTrending.map((t, i) => (
                        <div key={t.topic.name} className="rounded-lg border border-border/40 bg-background p-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-bold text-foreground">{t.topic.name}</div>
                              <div className="text-[8px] text-muted-foreground mt-0.5">{t.topic.total.toLocaleString()} publications</div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {t.topic.subItems.slice(0, 2).map(sub => (
                                  <Badge key={sub.name} variant="secondary" className="text-[7px] px-1 py-0">{sub.name}</Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-sm font-bold text-primary">+{t.growth.toFixed(1)}%</div>
                              <div className="text-[7px] text-muted-foreground">YoY growth</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Trending Topic */}
                <div className="bg-muted/30 border border-border/40 rounded-xl p-4">
                  <div className="mb-2">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">🔥 Trending Topic</h3>
                    <p className="text-[9px] text-muted-foreground">Topic with the highest year-over-year citation growth in the last year.</p>
                  </div>
                  <div className="flex items-center gap-4 bg-background border border-border/40 rounded-lg p-3">
                    <div className="flex-1">
                      <div className="text-[12px] font-bold text-foreground">{trending.topic.name}</div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">{trending.topic.total.toLocaleString()} total publications</div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {trending.topic.subItems.map(sub => (
                          <Badge key={sub.name} variant="secondary" className="text-[8px] px-1.5 py-0">{sub.name}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">+{trending.growth.toFixed(1)}%</div>
                      <div className="text-[8px] text-muted-foreground">YoY citation growth</div>
                    </div>
                  </div>
                </div>

                {/* Distribution Bar Charts */}
                {sections.map(renderDistributionBars)}

                {/* Leading Research Institutions */}
                <div className="bg-muted/30 border border-border/40 rounded-xl p-4">
                  <div className="mb-2">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Leading Research Institutions</h3>
                    <p className="text-[9px] text-muted-foreground">Top academic and research organizations driving scientific output in {decodedTopic} research.</p>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
                    {[col1, col2].map((col, colIdx) => (
                      <React.Fragment key={colIdx}>
                        {colIdx === 1 && <div className="w-px bg-border/60" />}
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-[3px] text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Institution</th>
                              <th className="text-center py-[3px] text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Papers</th>
                              <th className="text-center py-[3px] text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Citations</th>
                            </tr>
                          </thead>
                          <tbody>
                            {col.map((inst) => (
                              <tr key={inst.rank} className="border-b border-border/30 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setSelectedInstitution(inst)}>
                                <td className="py-[3px]">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] text-muted-foreground w-3 font-medium">{inst.rank}</span>
                                    <div>
                                      <span className="font-medium text-foreground text-[10px]">{inst.name}</span>
                                      <div className="text-[8px] text-muted-foreground">{inst.country} · {inst.focus}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-center py-[3px]">
                                  <div className="flex items-center justify-center gap-1">
                                    <div className="w-10 h-1 bg-muted rounded-full overflow-hidden">
                                      <div className="h-full bg-foreground/60 rounded-full" style={{ width: `${inst.papers / 1240 * 100}%` }}></div>
                                    </div>
                                    <span className="text-[10px] font-medium">{inst.papers.toLocaleString()}</span>
                                  </div>
                                </td>
                                <td className="text-center py-[3px]">
                                  <div className="flex items-center justify-center gap-1">
                                    <div className="w-10 h-1 bg-muted rounded-full overflow-hidden">
                                      <div className="h-full bg-primary rounded-full" style={{ width: `${inst.citations / 18500 * 100}%` }}></div>
                                    </div>
                                    <span className="text-[10px] text-primary font-medium">{inst.citations.toLocaleString()}</span>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Latest Publications */}
                <div className="bg-muted/30 border border-border/40 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Latest Publications</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search" className="pl-7 w-44 h-7 text-[10px]" />
                      </div>
                      <Select value={selectedResearchType} onValueChange={setSelectedResearchType}>
                        <SelectTrigger className="w-40 h-7 text-[10px]">
                          <SelectValue placeholder="Research Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {researchTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select defaultValue="date">
                        <SelectTrigger className="w-24 h-7 text-[10px]">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="relevance">Relevance</SelectItem>
                          <SelectItem value="citations">Citations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {filteredPublications.map((pub) => (
                      <div key={pub.id} className="border-l-2 border-l-border border border-border/30 bg-background rounded-lg p-3 hover:border-border/60 transition-colors cursor-pointer" onClick={() => setSelectedPublicationDetail(pub)}>
                        <div className="grid grid-cols-[2fr_auto_1fr_2fr_auto] gap-4 items-start">
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold text-foreground leading-snug">{pub.title}</div>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              <Badge variant="outline" className="text-[8px] px-1.5 py-0.5 font-medium">
                                {researchTypes.find(t => t.value === pub.researchType)?.label || pub.researchType}
                              </Badge>
                              {pub.topics.map((t, i) => (
                                <Badge key={i} variant="secondary" className="text-[8px] px-1.5 py-0.5">{t}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-[9px] text-muted-foreground whitespace-nowrap pt-0.5">{pub.date}</div>
                          <div className="text-[9px] text-muted-foreground pt-0.5">{pub.authors.join(", ")}</div>
                          <div className="text-[9px] text-muted-foreground leading-snug pt-0.5">{pub.summary}</div>
                          <div className="flex-shrink-0 pt-0.5">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0"><ExternalLink className="w-3.5 h-3.5" /></Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-7 text-xs">Previous</Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs">Next</Button>
                    </div>
                    <div className="text-[9px] text-muted-foreground">Page 1 of 10</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <InstitutionPublicationsModal
          open={!!selectedInstitution}
          onOpenChange={() => setSelectedInstitution(null)}
          institution={selectedInstitution?.name || ''}
          country={selectedInstitution?.country || ''}
          focus={selectedInstitution?.focus || ''}
          totalPapers={selectedInstitution?.papers || 0}
          citations={selectedInstitution?.citations || 0}
          hIndex={selectedInstitution?.hIndex || 0}
          topic={decodedTopic}
        />
        <CategoryPublicationsModal
          open={!!selectedCategory}
          onOpenChange={() => setSelectedCategory(null)}
          categoryName={selectedCategory?.name || ''}
          totalPublications={selectedCategory?.total || 0}
          subcategories={selectedCategory?.subs || []}
          topic={decodedTopic}
        />
        <PublicationDetailModal
          open={!!selectedPublicationDetail}
          onOpenChange={() => setSelectedPublicationDetail(null)}
          publication={selectedPublicationDetail}
        />
      </div>
    </div>
  );
};

export default ScientificPublications;