import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, FolderOpen, Settings, TestTube, Zap, Box, UtensilsCrossed, GitBranch, Beaker, Package, Folder, Fuel, Wheat, Layers, Leaf, Tractor, Sparkles, Pill, FlaskConical, Search, SortAsc, BarChart3, Eye, EyeOff, GitCompare, X, Info, Trees, Sprout, Factory, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Lightbulb, FileText, Scale, TrendingUp, Download, Star, CheckCircle2, AlertCircle, MapPin, Globe, BookOpen, Trophy, Award, Medal, Check, Target } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceArea, ComposedChart, Bar, Area, BarChart } from 'recharts';
import ProductTable from '@/components/ProductTable';
import PathwayChat from '@/components/PathwayChat';
import feedstockAnalysisChart from '@/assets/feedstock-analysis-chart.png';
import marketApplicationsChart from '@/assets/market-applications-chart.png';
import xyloseMolecule from '@/assets/xylose-molecule.png';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import ValueChainSummary from '@/components/ValueChainSummary';
import SankeyConnections from '@/components/SankeyConnections';
import { Tooltip as UiTooltip, TooltipContent as UiTooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ValueChain = () => {
  const { category, topic } = useParams<{category: string;topic: string;}>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Determine default selection based on route category
  const isProductRoute = category === 'Product';
  const isFeedstockRoute = category === 'Feedstock';
  const defaultSelection = isProductRoute ? 'product' : 'feedstock';

  const [activeTab, setActiveTab] = useState(defaultSelection);
  const [selectedTechCategory, setSelectedTechCategory] = useState<string | null>(null);
  const [selectedTechCategoryFilter, setSelectedTechCategoryFilter] = useState<string[]>([]);
  const [currentTechPage, setCurrentTechPage] = useState(1);
  const [techItemsPerPage] = useState(10); // Show 10 technologies per page
  const [currentCategoryPage, setCurrentCategoryPage] = useState(1); // For category-based pagination
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Chemical']);
  const [activeTechTab, setActiveTechTab] = useState(isFeedstockRoute ? 'Fermentation' : 'Fermentation');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedProductCategory, setSelectedProductCategory] = useState<string[]>([]);
  const [selectedMarketCategory, setSelectedMarketCategory] = useState<string[]>([]);
  const [currentMarketPage, setCurrentMarketPage] = useState(0);
  const [selectedTRLFilter, setSelectedTRLFilter] = useState<string[]>([]);

  // New state for enhanced navigation features
  const [marketSearchTerm, setMarketSearchTerm] = useState('');
  const [marketSortBy, setMarketSortBy] = useState<'alphabetical' | 'growth' | 'subcategory'>('alphabetical');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedComparisons, setSelectedComparisons] = useState<string[]>([]);
  const [expandAllCards, setExpandAllCards] = useState(false);
  const [feedstockSelected, setFeedstockSelected] = useState(!isProductRoute);
  const [productSelected, setProductSelected] = useState(false);
  const [environmentSelected, setEnvironmentSelected] = useState(isProductRoute);
  const [selectedFeedstocks, setSelectedFeedstocks] = useState<string[]>([]);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);

  // Feedstock filter state
  const [selectedFeedstockCategories, setSelectedFeedstockCategories] = useState<string[]>([]);
  const [selectedFeedstock, setSelectedFeedstock] = useState<string | null>(null);
  const [currentFeedstockPage, setCurrentFeedstockPage] = useState(1);
  const feedstocksPerPage = 5;
  const [selectedMaturityLevels, setSelectedMaturityLevels] = useState<string[]>([]);
  const [currentAppPage, setCurrentAppPage] = useState(1);
  const appsPerPage = 5;

  // Resource tab state
  const [resourceTab, setResourceTab] = useState('resources');

  // Show summary only after a card is clicked
  const [showSummary, setShowSummary] = useState(false);

  // View mode: top 3 pathways vs full landscape
  const [showFullLandscape, setShowFullLandscape] = useState(false);

  // Active pathway state for highlighting correlated cards
  const [activePathway, setActivePathway] = useState<{
    type: 'feedstock' | 'technology' | 'market' | null;
    item: string | null;
  }>({ type: null, item: null });

  // Track unread messages for notifications
  const pathwayId = `value-chain-${category}-${topic}`;
  const unreadCount = useUnreadMessages(pathwayId, resourceTab === 'opinions');


  // Feedstock data - conditional on route type
  const feedstockData = isFeedstockRoute ? [
  {
    name: 'High-Fructose Corn Syrup',
    categories: ['Intermediates/precursors'],
    maturity: 'Commercial',
    maturityRating: 4,
    price: '€350-450/ton',
    quantity: '12 million tons/year'
  },
  {
    name: 'Crystalline Fructose',
    categories: ['Bio-based primary feedstocks'],
    maturity: 'Commercial',
    maturityRating: 4,
    price: '€600-900/ton',
    quantity: '0.5 million tons/year'
  },
  {
    name: 'Fruit Processing Waste',
    categories: ['Waste', 'Industrial side-streams'],
    maturity: 'Pilot',
    maturityRating: 3,
    price: '€30-60/ton',
    quantity: '18 million tons/year'
  },
  {
    name: 'Inulin Hydrolysate',
    categories: ['Intermediates/precursors'],
    maturity: 'Pilot',
    maturityRating: 3,
    price: '€400-550/ton',
    quantity: '2.5 million tons/year'
  },
  {
    name: 'Sugar Beet Syrup',
    categories: ['Industrial side-streams'],
    maturity: 'Commercial',
    maturityRating: 4,
    price: '€200-300/ton',
    quantity: '8 million tons/year'
  },
  {
    name: 'Honey By-products',
    categories: ['Bio-based primary feedstocks', 'Industrial side-streams'],
    maturity: 'Lab Scale',
    maturityRating: 2,
    price: '€1,200-2,000/ton',
    quantity: '0.3 million tons/year'
  },
  {
    name: 'Agave Syrup Waste',
    categories: ['Waste', 'Industrial side-streams'],
    maturity: 'Lab Scale',
    maturityRating: 2,
    price: '€80-150/ton',
    quantity: '1.2 million tons/year'
  },
  {
    name: 'Enzymatic Starch Conversion',
    categories: ['Intermediates/precursors'],
    maturity: 'Commercial',
    maturityRating: 4,
    price: '€280-380/ton',
    quantity: '45 million tons/year'
  }] : [
  {
    name: 'Corn Stover',
    categories: ['Biomass', 'Waste'],
    maturity: 'Commercial',
    maturityRating: 4,
    price: '€40-55/ton',
    quantity: '75 million tons/year'
  },
  {
    name: 'Sugarcane Molasses',
    categories: ['Industrial side-streams', 'Bio-based primary feedstocks'],
    maturity: 'Commercial',
    maturityRating: 4,
    price: '€80-120/ton',
    quantity: '62 million tons/year'
  },
  {
    name: 'Fructose',
    categories: ['Intermediates/precursors', 'Bio-based primary feedstocks'],
    maturity: 'Commercial',
    maturityRating: 4,
    price: '€350-600/ton',
    quantity: '12 million tons/year'
  },
  {
    name: 'Whey Permeate',
    categories: ['Industrial side-streams', 'Waste'],
    maturity: 'Commercial',
    maturityRating: 4,
    price: '€150-200/ton',
    quantity: '45 million tons/year'
  },
  {
    name: 'Cassava Starch',
    categories: ['Bio-based primary feedstocks'],
    maturity: 'Commercial',
    maturityRating: 4,
    price: '€250-350/ton',
    quantity: '95 million tons/year'
  },
  {
    name: 'Sugar Beet Pulp',
    categories: ['Biomass', 'Industrial side-streams'],
    maturity: 'Commercial',
    maturityRating: 4,
    price: '€35-50/ton',
    quantity: '14 million tons/year'
  },
  {
    name: 'Wheat Straw',
    categories: ['Biomass', 'Waste'],
    maturity: 'Pilot',
    maturityRating: 3,
    price: '€30-45/ton',
    quantity: '38 million tons/year'
  },
  {
    name: 'Rice Straw',
    categories: ['Biomass', 'Waste'],
    maturity: 'Pilot',
    maturityRating: 3,
    price: '€25-35/ton',
    quantity: '2.8 million tons/year'
  },
  {
    name: 'Food Processing Waste',
    categories: ['Waste', 'Industrial side-streams'],
    maturity: 'Pilot',
    maturityRating: 3,
    price: '€15-30/ton',
    quantity: '88 million tons/year'
  },
  {
    name: 'Bread Waste',
    categories: ['Waste'],
    maturity: 'Lab Scale',
    maturityRating: 2,
    price: '€10-20/ton',
    quantity: '10 million tons/year'
  },
  {
    name: 'CO₂ (via Gas Fermentation)',
    categories: ['Industrial side-streams'],
    maturity: 'Lab Scale',
    maturityRating: 2,
    price: '€20-40/ton',
    quantity: 'Unlimited'
  },
  {
    name: 'Potato Starch Waste',
    categories: ['Industrial side-streams', 'Waste'],
    maturity: 'Pilot',
    maturityRating: 3,
    price: '€25-40/ton',
    quantity: '6.5 million tons/year'
  }];


  // Filter feedstocks based on selected categories and maturity levels
  const filteredFeedstockData = useMemo(() => {
    let filtered = feedstockData;

    // Filter by categories
    if (selectedFeedstockCategories.length > 0) {
      filtered = filtered.filter((feedstock) =>
      feedstock.categories.some((category) => selectedFeedstockCategories.includes(category))
      );
    }

    // Filter by maturity levels
    if (selectedMaturityLevels.length > 0) {
      filtered = filtered.filter((feedstock) =>
      selectedMaturityLevels.includes(feedstock.maturity)
      );
    }

    return filtered;
  }, [selectedFeedstockCategories, selectedMaturityLevels]);

  const top3FeedstockNames = isFeedstockRoute 
    ? ['High-Fructose Corn Syrup', 'Sugar Beet Syrup', 'Enzymatic Starch Conversion']
    : ['Corn Stover', 'Sugarcane Molasses', 'Fructose'];
  // Pagination for feedstocks
  const totalFeedstockPages = Math.ceil(filteredFeedstockData.length / feedstocksPerPage);
  const startFeedstockIndex = (currentFeedstockPage - 1) * feedstocksPerPage;
  const endFeedstockIndex = startFeedstockIndex + feedstocksPerPage;
  const currentFeedstocks = filteredFeedstockData.slice(startFeedstockIndex, endFeedstockIndex);

  const handlePreviousFeedstockPage = () => {
    setCurrentFeedstockPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextFeedstockPage = () => {
    setCurrentFeedstockPage((prev) => Math.min(prev + 1, totalFeedstockPages));
  };

  // Technology data - conditional on route type
  const technologyData = isFeedstockRoute ? [
  {
    category: 'Fermentation',
    technologies: [
    { name: 'Homofermentation (Lactobacillus)', status: 'Commercial', trl: 'TRL 9', description: 'High-yield L-lactic acid production from fructose using Lactobacillus' },
    { name: 'Yeast Fermentation (Ethanol)', status: 'Commercial', trl: 'TRL 9', description: 'Anaerobic fermentation of fructose to ethanol by S. cerevisiae' },
    { name: 'Heterofermentation', status: 'Commercial', trl: 'TRL 8-9', description: 'Mixed acid fermentation producing lactic acid and co-products' },
    { name: 'Engineered E. coli Fermentation', status: 'Pilot', trl: 'TRL 6-7', description: 'Metabolically engineered bacteria for succinic acid from fructose' },
    { name: 'Anaerobic Digestion', status: 'Pilot', trl: 'TRL 6-7', description: 'Biogas production through anaerobic fructose conversion' }]
  },
  {
    category: 'Chemical Conversion',
    technologies: [
    { name: 'Acid-Catalysed Dehydration', status: 'Pilot', trl: 'TRL 7', description: 'Fructose dehydration to 5-hydroxymethylfurfural (HMF)' },
    { name: 'Catalytic Hydrogenation', status: 'Commercial', trl: 'TRL 9', description: 'Hydrogenation of fructose to sorbitol and mannitol' },
    { name: 'Isomerisation', status: 'Commercial', trl: 'TRL 9', description: 'Enzymatic or chemical fructose-glucose interconversion' },
    { name: 'Oxidation (Au/TiO₂)', status: 'Lab', trl: 'TRL 4-5', description: 'Selective oxidation of fructose to gluconic/glucaric acid' },
    { name: 'Acid Dehydration + Hydrogenation', status: 'Pilot', trl: 'TRL 6', description: 'Two-step conversion of fructose to levulinic acid' },
    { name: 'Electrochemical Oxidation', status: 'Lab', trl: 'TRL 4', description: 'Electrochemical route to 2,5-furandicarboxylic acid (FDCA)' }]
  },
  {
    category: 'Purification & Separation',
    technologies: [
    { name: 'Chromatographic Separation', status: 'Commercial', trl: 'TRL 9', description: 'High-purity fructose isolation from mixed sugar streams' },
    { name: 'Membrane Filtration', status: 'Commercial', trl: 'TRL 8-9', description: 'Ultrafiltration for product recovery and purification' },
    { name: 'Crystallization', status: 'Commercial', trl: 'TRL 9', description: 'Selective crystallization for pure fructose isolation' },
    { name: 'Reactive Distillation', status: 'Pilot', trl: 'TRL 6-7', description: 'Integrated reaction-separation for HMF and derivatives' }]
  },
  {
    category: 'Enzymatic Processing',
    technologies: [
    { name: 'Glucose Isomerase', status: 'Commercial', trl: 'TRL 9', description: 'Industrial enzyme for glucose-to-fructose conversion' },
    { name: 'Inulinase Hydrolysis', status: 'Commercial', trl: 'TRL 8-9', description: 'Enzymatic breakdown of inulin to fructose' },
    { name: 'Multi-Enzyme Cascade', status: 'Lab', trl: 'TRL 4-5', description: 'Sequential enzyme systems for fructose-derived platform chemicals' }]
  }] : [
  {
    category: 'Fermentation',
    technologies: [
    { name: 'Homofermentation (Lactobacillus)', status: 'Commercial', trl: 'TRL 9', description: 'High-yield L-lactic acid production using Lactobacillus strains' },
    { name: 'Heterofermentation', status: 'Commercial', trl: 'TRL 8-9', description: 'Mixed acid fermentation producing lactic acid and byproducts' },
    { name: 'Simultaneous Saccharification & Fermentation', status: 'Pilot', trl: 'TRL 6-7', description: 'Combined enzymatic hydrolysis and fermentation in one reactor' },
    { name: 'Solid-State Fermentation', status: 'Pilot', trl: 'TRL 6-7', description: 'Fermentation on solid substrates with minimal water' },
    { name: 'Continuous Fermentation (CSTR)', status: 'Pilot', trl: 'TRL 6-7', description: 'Continuous stirred tank reactor for steady-state production' },
    { name: 'Cell-Recycled Fermentation', status: 'Lab', trl: 'TRL 4-5', description: 'Membrane-coupled bioreactors for cell reuse' },
    { name: 'Gas Fermentation (CO₂)', status: 'R&D', trl: 'TRL 2-3', description: 'Microbial conversion of CO₂ to lactic acid' },
    { name: 'Engineered Yeast Fermentation', status: 'Lab', trl: 'TRL 4-5', description: 'Genetically modified yeast for low-pH lactic acid production' }]
  },
  {
    category: 'Pretreatment',
    technologies: [
    { name: 'Enzymatic Hydrolysis', status: 'Commercial', trl: 'TRL 8-9', description: 'Breaking down complex carbohydrates using cellulase enzymes' },
    { name: 'Acid Hydrolysis', status: 'Commercial', trl: 'TRL 8-9', description: 'Dilute acid treatment for sugar release from lignocellulosics' },
    { name: 'Steam Explosion', status: 'Commercial', trl: 'TRL 8-9', description: 'High-pressure steam treatment and rapid decompression' },
    { name: 'Alkaline Pretreatment', status: 'Pilot', trl: 'TRL 6-7', description: 'NaOH or lime treatment for lignin removal' },
    { name: 'Organosolv Process', status: 'Pilot', trl: 'TRL 6-7', description: 'Organic solvent-based fractionation of biomass' },
    { name: 'Ionic Liquid Pretreatment', status: 'Lab', trl: 'TRL 4-5', description: 'Dissolution using ionic liquids for biomass deconstruction' }]
  },
  {
    category: 'Purification',
    technologies: [
    { name: 'Reactive Distillation', status: 'Commercial', trl: 'TRL 8-9', description: 'Combined reaction and separation for high-purity lactic acid' },
    { name: 'Membrane Separation', status: 'Commercial', trl: 'TRL 8-9', description: 'Ultrafiltration and nanofiltration for product recovery' },
    { name: 'Ion Exchange Chromatography', status: 'Commercial', trl: 'TRL 8-9', description: 'Resin-based purification and decolorization' },
    { name: 'Electrodialysis', status: 'Pilot', trl: 'TRL 6-7', description: 'Electrically driven membrane separation of lactate' },
    { name: 'Crystallization', status: 'Commercial', trl: 'TRL 8-9', description: 'Purification through controlled crystal formation' },
    { name: 'Molecular Distillation', status: 'Lab', trl: 'TRL 4-5', description: 'Short-path distillation for heat-sensitive lactic acid' }]
  },
  {
    category: 'Polymerization',
    technologies: [
    { name: 'Direct Polycondensation', status: 'Commercial', trl: 'TRL 8-9', description: 'Direct conversion of lactic acid to low-MW PLA' },
    { name: 'Ring-Opening Polymerization', status: 'Commercial', trl: 'TRL 9', description: 'Lactide-based route to high-MW PLA polymers' },
    { name: 'Azeotropic Dehydration', status: 'Pilot', trl: 'TRL 6-7', description: 'Solvent-assisted polycondensation for higher MW' },
    { name: 'Enzymatic Polymerization', status: 'Lab', trl: 'TRL 3-4', description: 'Enzyme-catalyzed green polymerization of lactide' }]
  },
  {
    category: 'Chemical Conversion',
    technologies: [
    { name: 'Esterification', status: 'Commercial', trl: 'TRL 8-9', description: 'Conversion to lactate esters as green solvents' },
    { name: 'Catalytic Dehydration', status: 'Pilot', trl: 'TRL 6-7', description: 'Conversion to acrylic acid via catalytic dehydration' },
    { name: 'Hydrogenation', status: 'Pilot', trl: 'TRL 6-7', description: 'Reduction to propylene glycol using metal catalysts' },
    { name: 'Oxidation', status: 'Lab', trl: 'TRL 4-5', description: 'Selective oxidation to pyruvic acid derivatives' },
    { name: 'Electrochemical Conversion', status: 'R&D', trl: 'TRL 2-3', description: 'Electrochemical upgrading of lactate to higher-value chemicals' }]
  }];


  // Market data - conditional on route type
  const marketDataDetail = isFeedstockRoute ? [
  {
    application: 'Food & Beverage',
    totalSize: '€85.2B',
    subcategories: [
    { name: 'Sweetener (HFCS)', maturity: 'High' as const, grade: 'Food-grade', greenPremium: 'Low' as const, description: 'High-fructose corn syrup for soft drinks and processed foods' },
    { name: 'Sorbitol (Food Additive)', maturity: 'High' as const, grade: 'Food-grade', greenPremium: 'Low' as const, description: 'Sugar alcohol used as humectant and sugar substitute' },
    { name: 'Lactic Acid (Food Acidulant)', maturity: 'High' as const, grade: 'Food-grade', greenPremium: 'Medium' as const, description: 'Natural acidulant and preservative from fructose fermentation' }]
  },
  {
    application: 'Platform Chemicals',
    totalSize: '€18.5B',
    subcategories: [
    { name: 'HMF (5-Hydroxymethylfurfural)', maturity: 'Emerging' as const, grade: 'Technical', greenPremium: 'High' as const, description: 'Versatile platform chemical from fructose dehydration' },
    { name: 'Levulinic Acid', maturity: 'Emerging' as const, grade: 'Technical', greenPremium: 'High' as const, description: 'Green solvent precursor and chemical building block' },
    { name: '2,5-FDCA', maturity: 'Low' as const, grade: 'Technical', greenPremium: 'High' as const, description: 'Bio-based monomer for PEF packaging (PET replacement)' }]
  },
  {
    application: 'Bioplastics & Packaging',
    totalSize: '€28.4B',
    subcategories: [
    { name: 'PLA Packaging', maturity: 'High' as const, grade: 'Industrial', greenPremium: 'High' as const, description: 'Fructose → Lactic Acid → PLA for compostable packaging' },
    { name: 'PEF Bottles', maturity: 'Emerging' as const, grade: 'Industrial', greenPremium: 'High' as const, description: 'Fructose → FDCA → PEF as next-gen bio-plastic bottles' },
    { name: 'Biodegradable Films', maturity: 'Emerging' as const, grade: 'Industrial', greenPremium: 'High' as const, description: 'Compostable films from fructose-derived polymers' }]
  },
  {
    application: 'Fuels & Energy',
    totalSize: '€89.1B',
    subcategories: [
    { name: 'Bioethanol', maturity: 'High' as const, grade: 'Fuel-grade', greenPremium: 'Medium' as const, description: 'Fermentative ethanol from fructose for transportation fuel' },
    { name: 'DMF (2,5-Dimethylfuran)', maturity: 'Low' as const, grade: 'Fuel-grade', greenPremium: 'High' as const, description: 'Advanced biofuel from HMF hydrogenation with high energy density' }]
  },
  {
    application: 'Pharmaceuticals & Cosmetics',
    totalSize: '€42.5B',
    subcategories: [
    { name: 'Mannitol (IV Solution)', maturity: 'High' as const, grade: 'Pharma-grade', greenPremium: 'None' as const, description: 'Osmotic diuretic from fructose hydrogenation' },
    { name: 'Gluconic Acid (Cleaning)', maturity: 'High' as const, grade: 'Technical', greenPremium: 'Medium' as const, description: 'Biodegradable chelating and cleaning agent from fructose oxidation' },
    { name: 'Succinic Acid (Cosmetics)', maturity: 'Emerging' as const, grade: 'Cosmetic-grade', greenPremium: 'High' as const, description: 'Bio-based ingredient for skin care formulations' }]
  }] : [
  {
    application: 'Bioplastics & Packaging',
    totalSize: '€28.4B',
    subcategories: [
    { name: 'PLA Packaging', maturity: 'High' as const, grade: 'Industrial', greenPremium: 'High' as const, description: 'Compostable packaging films and containers from polylactic acid' },
    { name: 'Biodegradable Films', maturity: 'Emerging' as const, grade: 'Industrial', greenPremium: 'High' as const, description: 'Thin films for agriculture mulch and food wrap applications' },
    { name: '3D Printing Filaments', maturity: 'Emerging' as const, grade: 'Technical', greenPremium: 'Medium' as const, description: 'PLA-based filaments for additive manufacturing' }]
  },
  {
    application: 'Food & Beverage',
    totalSize: '€85.2B',
    subcategories: [
    { name: 'Food Acidulant', maturity: 'High' as const, grade: 'Food-grade', greenPremium: 'Low' as const, description: 'pH regulator and flavour enhancer in processed foods' },
    { name: 'Preservatives', maturity: 'High' as const, grade: 'Food-grade', greenPremium: 'Low' as const, description: 'Natural antimicrobial preservation for shelf-life extension' },
    { name: 'Fermented Beverages', maturity: 'Emerging' as const, grade: 'Food-grade', greenPremium: 'Medium' as const, description: 'Probiotic and fermented drink formulations' }]
  },
  {
    application: 'Pharmaceuticals & Cosmetics',
    totalSize: '€218B',
    subcategories: [
    { name: 'Excipients & Drug Delivery', maturity: 'High' as const, grade: 'Pharma-grade', greenPremium: 'None' as const, description: 'Biocompatible carriers for controlled drug release' },
    { name: 'Skin Care (AHA)', maturity: 'High' as const, grade: 'Cosmetic-grade', greenPremium: 'High' as const, description: 'Alpha hydroxy acid for exfoliation and anti-aging' },
    { name: 'Bioabsorbable Implants', maturity: 'Emerging' as const, grade: 'Medical-grade', greenPremium: 'Medium' as const, description: 'Resorbable surgical implants and sutures' }]
  },
  {
    application: 'Chemical Intermediates',
    totalSize: '€12.8B',
    subcategories: [
    { name: 'Acrylic Acid Substitute', maturity: 'Emerging' as const, grade: 'Technical', greenPremium: 'High' as const, description: 'Bio-based alternative to petrochemical acrylic acid' },
    { name: 'Propylene Glycol', maturity: 'Emerging' as const, grade: 'Technical', greenPremium: 'Medium' as const, description: 'Green solvent and antifreeze from lactic acid hydrogenation' },
    { name: 'Lactate Esters (Green Solvents)', maturity: 'Low' as const, grade: 'Technical', greenPremium: 'High' as const, description: 'Eco-friendly solvents replacing petroleum-derived alternatives' }]
  },
  {
    application: 'Textiles & Fibers',
    totalSize: '€6.7B',
    subcategories: [
    { name: 'PLA Fibers', maturity: 'Emerging' as const, grade: 'Textile-grade', greenPremium: 'High' as const, description: 'Bio-based fibers for sustainable textile production' },
    { name: 'Nonwoven Fabrics', maturity: 'Low' as const, grade: 'Industrial', greenPremium: 'Medium' as const, description: 'Disposable hygiene and filtration products' },
    { name: 'Sportswear Materials', maturity: 'Low' as const, grade: 'Textile-grade', greenPremium: 'High' as const, description: 'Performance fabrics with moisture-wicking properties' }]
  }];


  // State for expanded categories in inline detail
  const [expandedInlineCategories, setExpandedInlineCategories] = useState<Set<string>>(new Set());

  const toggleInlineCategory = (category: string) => {
    setExpandedInlineCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Helper functions for inline detail sections
  const getCommercialTechCountInline = (category: typeof technologyData[0]) => {
    return category.technologies.filter((tech) => tech.status === 'Commercial').length;
  };

  const maxCommercialCountInline = technologyData.length > 0 ? Math.max(...technologyData.map(getCommercialTechCountInline)) : 0;

  const calculateTotalMarketSizeInline = () => {
    const total = marketDataDetail.reduce((sum, market) => {
      const value = parseFloat(market.totalSize.replace('€', '').replace('B', ''));
      return sum + value;
    }, 0);
    return `€${total.toFixed(1)}B`;
  };

  const getMaturityBadge = (maturity: string) => {
    switch (maturity) {
      case 'High':return { bgClass: 'bg-gradient-to-b from-green-50 to-green-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.08)]', textClass: 'text-green-700' };
      case 'Emerging':return { bgClass: 'bg-gradient-to-b from-amber-50 to-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.08)]', textClass: 'text-amber-700' };
      case 'Low':return { bgClass: 'bg-gradient-to-b from-gray-50 to-gray-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.08)]', textClass: 'text-gray-600' };
      default:return { bgClass: 'bg-gradient-to-b from-gray-50 to-gray-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.08)]', textClass: 'text-gray-600' };
    }
  };

  const getStatusTagStyle = (status: string) => {
    switch (status) {
      case 'Commercial':return 'text-emerald-600 border-emerald-300 bg-white';
      case 'Pilot':return 'text-blue-600 border-blue-300 bg-white';
      case 'Lab':case 'Lab Scale':return 'text-slate-500 border-slate-300 bg-white';
      case 'R&D':case 'Research':default:return 'text-amber-600 border-amber-300 bg-white';
    }
  };

  const getGreenPremiumBadge = (premium: string) => {
    switch (premium) {
      case 'High':return { bgClass: 'bg-emerald-100', textClass: 'text-emerald-800' };
      case 'Medium':return { bgClass: 'bg-teal-100', textClass: 'text-teal-800' };
      case 'Low':return { bgClass: 'bg-sky-100', textClass: 'text-sky-800' };
      case 'None':return { bgClass: 'bg-gray-100', textClass: 'text-gray-500' };
      default:return { bgClass: 'bg-gray-100', textClass: 'text-gray-500' };
    }
  };

  const getStatusDisplayInline = (status: string, context?: 'feedstock' | 'technology') => {
    switch (status) {
      case 'Commercial':
        if (context === 'technology') {
          return { text: 'Commercial Use', icon: <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />, bgClass: 'bg-blue-100', textClass: 'text-blue-800', borderClass: 'border-blue-300' };
        }
        return { text: 'Commercial Use', icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />, bgClass: 'bg-green-100', textClass: 'text-green-800', borderClass: 'border-green-300' };
      case 'Pilot':
        return { text: 'Pilot Scale', icon: <AlertCircle className="w-3.5 h-3.5 text-gray-600" />, bgClass: 'bg-gray-100', textClass: 'text-gray-700', borderClass: 'border-gray-300' };
      case 'Lab':
        return { text: 'Lab Research', icon: <TestTube className="w-3.5 h-3.5 text-gray-500" />, bgClass: 'bg-gray-50', textClass: 'text-gray-600', borderClass: 'border-gray-200' };
      case 'Research':
        return { text: 'Early Research', icon: <Sprout className="w-3.5 h-3.5 text-gray-400" />, bgClass: 'bg-white', textClass: 'text-gray-500', borderClass: 'border-gray-200' };
      default:
        return { text: status, icon: null, bgClass: 'bg-gray-100', textClass: 'text-gray-700', borderClass: 'border-gray-300' };
    }
  };

  // Get category color and style
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Biomass':
        return 'px-2 py-1 text-xs rounded-md bg-green-100 text-green-700 border border-green-200';
      case 'Waste':
        return 'px-2 py-1 text-xs rounded-md bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'Industrial side-streams':
        return 'px-2 py-1 text-xs rounded-md bg-orange-100 text-orange-700 border border-orange-200';
      case 'Bio-based primary feedstocks':
        return 'px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-700 border border-blue-200';
      case 'Intermediates/precursors':
        return 'px-2 py-1 text-xs rounded-md bg-purple-100 text-purple-700 border border-purple-200';
      default:
        return 'px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  // Scatter chart data for product analysis
  const scatterData = [
  { name: 'Ethanol', price: 0.65, marketSize: 89.1, marketGrowth: 4.2, category: 'Chemicals' },
  { name: 'Acetic Acid', price: 1.20, marketSize: 15.6, marketGrowth: 3.8, category: 'Chemicals' },
  { name: 'Lactic Acid', price: 1.80, marketSize: 3.9, marketGrowth: 8.5, category: 'Chemicals' },
  { name: 'Citric Acid', price: 1.45, marketSize: 3.2, marketGrowth: 5.4, category: 'Chemicals' },
  { name: 'Succinic Acid', price: 3.20, marketSize: 0.8, marketGrowth: 12.3, category: 'Chemicals' },
  { name: 'Glycerol', price: 1.25, marketSize: 2.8, marketGrowth: 4.1, category: 'Chemicals' },
  { name: 'Industrial Enzymes', price: 15.20, marketSize: 7.0, marketGrowth: 6.2, category: 'Chemicals' },
  { name: 'Bio-based Solvents', price: 2.65, marketSize: 4.2, marketGrowth: 8.7, category: 'Chemicals' },
  { name: 'Platform Chemicals', price: 1.95, marketSize: 89.7, marketGrowth: 5.8, category: 'Chemicals' },
  { name: 'Organic Acids', price: 2.30, marketSize: 8.9, marketGrowth: 7.4, category: 'Chemicals' },
  { name: 'Bioethanol', price: 0.68, marketSize: 65.8, marketGrowth: 6.2, category: 'Fuels' },
  { name: 'Hydrogen', price: 3.50, marketSize: 174, marketGrowth: 9.8, category: 'Fuels' },
  { name: 'Biodiesel', price: 0.95, marketSize: 39.7, marketGrowth: 4.8, category: 'Fuels' },
  { name: 'Biogas', price: 0.45, marketSize: 33.1, marketGrowth: 7.1, category: 'Fuels' },
  { name: 'Methanol', price: 0.38, marketSize: 31.2, marketGrowth: 3.5, category: 'Fuels' },
  { name: 'Renewable Diesel', price: 1.15, marketSize: 65.4, marketGrowth: 8.9, category: 'Fuels' },
  { name: 'Bioplastics', price: 2.45, marketSize: 13.3, marketGrowth: 11.2, category: 'Materials' },
  { name: 'Bio-based Polymers', price: 2.80, marketSize: 20.9, marketGrowth: 9.7, category: 'Materials' },
  { name: 'Biocomposites', price: 4.50, marketSize: 6.2, marketGrowth: 11.8, category: 'Materials' },
  { name: 'Bio-fibers', price: 2.15, marketSize: 4.8, marketGrowth: 6.9, category: 'Materials' },
  { name: 'Natural Rubber', price: 1.85, marketSize: 18.3, marketGrowth: 4.2, category: 'Materials' },
  { name: 'Biomaterials', price: 7.25, marketSize: 5.7, marketGrowth: 10.3, category: 'Materials' },
  { name: 'Animal Feed', price: 0.28, marketSize: 460, marketGrowth: 2.1, category: 'Food & Feed' },
  { name: 'Functional Foods', price: 12.00, marketSize: 279, marketGrowth: 7.3, category: 'Food & Feed' },
  { name: 'Dietary Supplements', price: 18.50, marketSize: 151.9, marketGrowth: 6.8, category: 'Food & Feed' },
  { name: 'Prebiotics', price: 8.75, marketSize: 7.1, marketGrowth: 9.3, category: 'Food & Feed' },
  { name: 'Pectin', price: 4.20, marketSize: 1.4, marketGrowth: 5.7, category: 'Food & Feed' },
  { name: 'Food Additives', price: 6.80, marketSize: 52.8, marketGrowth: 4.9, category: 'Food & Feed' },
  { name: 'Sweeteners', price: 3.95, marketSize: 18.6, marketGrowth: 3.2, category: 'Food & Feed' },
  { name: 'Biofertilizers', price: 3.40, marketSize: 2.9, marketGrowth: 11.5, category: 'Food & Feed' },
  { name: 'Protein Concentrates', price: 9.80, marketSize: 12.4, marketGrowth: 8.2, category: 'Food & Feed' }];


  // Filter scatter data based on selected categories
  const filteredScatterData = selectedProductCategory.length > 0 ?
  scatterData.filter((item) => selectedProductCategory.includes(item.category)) :
  scatterData;

  // Market sectors data with pagination
  const marketSectors = [
  // Page 1 - Primary Sectors
  [
  {
    title: "Food & Feed Applications",
    color: "amber",
    items: [
    { name: "Livestock Nutrition", value: "$460B" },
    { name: "Human Nutrition & Health", value: "$279B" },
    { name: "Food Processing Industry", value: "$151.9B" },
    { name: "Sugar & Sweetener Markets", value: "$85.2B" },
    { name: "Food Preservation", value: "$52.8B" },
    { name: "Functional Food Development", value: "$18.6B" },
    { name: "Nutraceutical Applications", value: "$7.1B" },
    { name: "Food Texture Enhancement", value: "$1.4B" }]

  },
  {
    title: "Chemical Applications",
    color: "violet",
    items: [
    { name: "Industrial Manufacturing", value: "$89.7B" },
    { name: "Pharmaceutical Manufacturing", value: "$15.6B" },
    { name: "Biotechnology Industry", value: "$7.0B" },
    { name: "Specialty Chemical Production", value: "$4.2B" },
    { name: "Polymer & Plastics Industry", value: "$3.9B" },
    { name: "Food & Beverage Processing", value: "$3.2B" },
    { name: "Personal Care Manufacturing", value: "$2.8B" }]

  },
  {
    title: "Material Applications",
    color: "emerald",
    items: [
    { name: "Building & Construction", value: "$1,430B" },
    { name: "Packaging Industry", value: "$1,050B" },
    { name: "Textile Manufacturing", value: "$993B" },
    { name: "Automotive Industry", value: "$20.9B" },
    { name: "Consumer Goods", value: "$13.3B" },
    { name: "Electronics & Technology", value: "$6.2B" }]

  },
  {
    title: "Fuel Applications",
    color: "blue",
    items: [
    { name: "Transportation Sector", value: "$174B" },
    { name: "Industrial Energy", value: "$65.8B" },
    { name: "Aviation Industry", value: "$65.4B" },
    { name: "Marine Transportation", value: "$39.7B" },
    { name: "Residential Heating", value: "$33.1B" }]

  }],

  // Page 2 - Secondary Sectors
  [
  {
    title: "Pharmaceutical Applications",
    color: "rose",
    items: [
    { name: "Drug Development", value: "$218B" },
    { name: "Medical Device Manufacturing", value: "$89.3B" },
    { name: "Health Supplement Industry", value: "$45.7B" },
    { name: "Clinical Research", value: "$23.1B" }]

  },
  {
    title: "Cosmetic Applications",
    color: "pink",
    items: [
    { name: "Beauty & Personal Care", value: "$126B" },
    { name: "Anti-aging Market", value: "$67.8B" },
    { name: "Natural Cosmetics", value: "$34.5B" }]

  },
  {
    title: "Agricultural Applications",
    color: "green",
    items: [
    { name: "Crop Production", value: "$78.9B" },
    { name: "Pest Management", value: "$45.2B" },
    { name: "Soil Health Management", value: "$23.7B" }]

  },
  {
    title: "Environmental Applications",
    color: "teal",
    items: [
    { name: "Environmental Remediation", value: "$56.4B" },
    { name: "Water Treatment Industry", value: "$34.8B" }]

  }]];



  // Filter market sectors based on selected categories
  const filterMarketSectors = (sectors: any[]) => {
    if (selectedMarketCategory.length === 0) return sectors;

    return sectors.filter((sector) => {
      const sectorTitle = sector.title;

      // Direct mapping between legend names and sector titles
      const categoryMapping: Record<string, string[]> = {
        'Fuel Applications': ['Fuel Applications'],
        'Food & Feed Applications': ['Food & Feed Applications'],
        'Material Applications': ['Material Applications'],
        'Environmental Applications': ['Environmental Applications'],
        'Agricultural Applications': ['Agricultural Applications'],
        'Cosmetic Applications': ['Cosmetic Applications'],
        'Pharmaceutical Applications': ['Pharmaceutical Applications'],
        'Chemical Applications': ['Chemical Applications']
      };

      return selectedMarketCategory.some((category) => {
        const matchingSectors = categoryMapping[category] || [];
        return matchingSectors.includes(sectorTitle);
      });
    });
  };

  const allSectors = marketSectors.flat();

  // Enhanced filtering and sorting logic
  const processedSectors = useMemo(() => {
    let sectors = filterMarketSectors(allSectors);

    // Apply search filter
    if (marketSearchTerm) {
      sectors = sectors.filter((sector) =>
      sector.title.toLowerCase().includes(marketSearchTerm.toLowerCase()) ||
      sector.items.some((item) => item.name.toLowerCase().includes(marketSearchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    sectors = [...sectors].sort((a, b) => {
      switch (marketSortBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'growth':
          // Calculate average growth rate based on market size (simplified)
          const aAvg = a.items.reduce((sum, item) => sum + parseFloat(item.value.replace(/[$B]/g, '')), 0) / a.items.length;
          const bAvg = b.items.reduce((sum, item) => sum + parseFloat(item.value.replace(/[$B]/g, '')), 0) / b.items.length;
          return bAvg - aAvg;
        case 'subcategory':
          return b.items.length - a.items.length;
        default:
          return 0;
      }
    });

    return sectors;
  }, [allSectors, selectedMarketCategory, marketSearchTerm, marketSortBy]);

  // Paginate processed sectors
  const sectorsPerPage = 4; // Show 4 cards (2 rows of 2) per page
  const totalFilteredPages = Math.ceil(processedSectors.length / sectorsPerPage);
  const startIndex = currentMarketPage * sectorsPerPage;
  const currentSectors = processedSectors.slice(startIndex, startIndex + sectorsPerPage);
  const totalPages = totalFilteredPages;

  const nextMarketPage = () => {
    setCurrentMarketPage((prev) => (prev + 1) % totalPages);
  };

  const prevMarketPage = () => {
    setCurrentMarketPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Get icon for sector title
  const getSectorIcon = (title: string) => {
    switch (title) {
      case 'Fuel Applications':
        return <Fuel className="w-4 h-4" />;
      case 'Food & Feed Applications':
        return <UtensilsCrossed className="w-4 h-4" />;
      case 'Material Applications':
        return <Layers className="w-4 h-4" />;
      case 'Environmental Applications':
        return <Leaf className="w-4 h-4" />;
      case 'Agricultural Applications':
        return <Wheat className="w-4 h-4" />;
      case 'Cosmetic Applications':
        return <Sparkles className="w-4 h-4" />;
      case 'Pharmaceutical Applications':
        return <Pill className="w-4 h-4" />;
      case 'Chemical Applications':
        return <FlaskConical className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: {[key: string]: {bg: string;border: string;text: string;textSecondary: string;};} = {
      amber: { bg: "bg-amber-50/50", border: "border-amber-200/50", text: "text-amber-700", textSecondary: "text-amber-600" },
      violet: { bg: "bg-violet-50/50", border: "border-violet-200/50", text: "text-violet-700", textSecondary: "text-violet-600" },
      blue: { bg: "bg-blue-50/50", border: "border-blue-200/50", text: "text-blue-700", textSecondary: "text-blue-600" },
      emerald: { bg: "bg-emerald-50/50", border: "border-emerald-200/50", text: "text-emerald-700", textSecondary: "text-emerald-600" },
      rose: { bg: "bg-rose-50/50", border: "border-rose-200/50", text: "text-rose-700", textSecondary: "text-rose-600" },
      pink: { bg: "bg-pink-50/50", border: "border-pink-200/50", text: "text-pink-700", textSecondary: "text-pink-600" },
      green: { bg: "bg-green-50/50", border: "border-green-200/50", text: "text-green-700", textSecondary: "text-green-600" },
      teal: { bg: "bg-teal-50/50", border: "border-teal-200/50", text: "text-teal-700", textSecondary: "text-teal-600" }
    };
    return colorMap[color] || colorMap.amber;
  };

  // Technology pie chart data  
  const technologyPieData = [
  { name: 'Biochemical', value: 25, color: '#1e40af' },
  { name: 'Chemical', value: 18, color: '#2563eb' },
  { name: 'Physicochemical', value: 15, color: '#3b82f6' },
  { name: 'Mechanical', value: 12, color: '#60a5fa' },
  { name: 'Thermomechanical', value: 8, color: '#93c5fd' },
  { name: 'Thermochemical', value: 7, color: '#bfdbfe' },
  { name: 'Physical', value: 5, color: '#dbeafe' },
  { name: 'Hybrid', value: 10, color: '#eff6ff' }];


  // Technology categories data without subgroups
  const techCategories = [
  {
    name: 'Biochemical',
    icon: <Beaker className="w-5 h-5" />,
    color: 'blue',
    technologies: [
    { name: 'Alcoholic Fermentation', maturity: 'commercial', description: 'Conversion of sugars to ethanol using yeast' },
    { name: 'Lactic Acid Fermentation', maturity: 'commercial', description: 'Production of lactic acid through bacterial fermentation' },
    { name: 'Dark Fermentation', maturity: 'pilot', description: 'Anaerobic fermentation for hydrogen production' },
    { name: 'Enzymatic Hydrolysis', maturity: 'commercial', description: 'Use of cellulase enzymes to convert cellulose to glucose' },
    { name: 'Simultaneous Saccharification and Fermentation', maturity: 'commercial', description: 'Combined enzyme treatment and fermentation process' },
    { name: 'Consolidated Bioprocessing', maturity: 'lab', description: 'Single-step process combining cellulase production and fermentation' },
    { name: 'Synthetic Biology Approaches', maturity: 'research', description: 'Engineered microorganisms for enhanced bioconversion' },
    { name: 'Metabolic Engineering', maturity: 'lab', description: 'Modified metabolic pathways for improved yields' }]

  },
  {
    name: 'Chemical',
    icon: <FlaskConical className="w-5 h-5" />,
    color: 'violet',
    technologies: [
    { name: 'Acid Catalysis', maturity: 'commercial', description: 'Use of acid catalysts for biomass conversion' },
    { name: 'Base Catalysis', maturity: 'pilot', description: 'Alkaline catalysts for selective reactions' },
    { name: 'Heterogeneous Catalysis', maturity: 'commercial', description: 'Solid catalysts for continuous processing' },
    { name: 'Hydrolysis Reactions', maturity: 'commercial', description: 'Chemical breakdown using water' },
    { name: 'Oxidation Processes', maturity: 'pilot', description: 'Selective oxidation for value-added products' },
    { name: 'Reduction Reactions', maturity: 'lab', description: 'Chemical reduction for specific compounds' },
    { name: 'Electrochemical Oxidation', maturity: 'lab', description: 'Electrochemical conversion of biomass compounds' },
    { name: 'Electrolysis', maturity: 'pilot', description: 'Electrochemical splitting of compounds' },
    { name: 'Organosolv Process', maturity: 'pilot', description: 'Organic solvent-based delignification process' },
    { name: 'Ionic Liquid Pretreatment', maturity: 'lab', description: 'Novel pretreatment using ionic liquids' }]

  },
  {
    name: 'Physicochemical',
    icon: <Zap className="w-5 h-5" />,
    color: 'emerald',
    technologies: [
    { name: 'Steam Explosion', maturity: 'commercial', description: 'High-temperature steam treatment followed by rapid decompression' },
    { name: 'Ammonia Fiber Explosion', maturity: 'pilot', description: 'Ammonia-based explosive decompression pretreatment' },
    { name: 'Supercritical Fluid Extraction', maturity: 'pilot', description: 'Use of supercritical CO2 for selective extraction' },
    { name: 'Pressurized Liquid Extraction', maturity: 'pilot', description: 'High-pressure liquid extraction at elevated temperatures' },
    { name: 'Microwave-Assisted Extraction', maturity: 'pilot', description: 'Use of microwave energy to enhance extraction processes' }]

  },
  {
    name: 'Mechanical',
    icon: <Settings className="w-5 h-5" />,
    color: 'amber',
    technologies: [
    { name: 'Mechanical Milling', maturity: 'commercial', description: 'Physical size reduction to increase surface area' },
    { name: 'High-Shear Processing', maturity: 'pilot', description: 'Mechanical disruption using high shear forces' },
    { name: 'Compression Processing', maturity: 'pilot', description: 'Mechanical compression to extract valuable compounds' },
    { name: 'Membrane Separation', maturity: 'commercial', description: 'Selective separation using semi-permeable membranes' },
    { name: 'Ultrafiltration', maturity: 'commercial', description: 'Membrane-based size exclusion separation' }]

  },
  {
    name: 'Thermomechanical',
    icon: <GitBranch className="w-5 h-5" />,
    color: 'rose',
    technologies: [
    { name: 'Thermomechanical Pulping', maturity: 'commercial', description: 'Combined heat and mechanical treatment for fiber separation' },
    { name: 'Refiner Mechanical Pulping', maturity: 'commercial', description: 'Mechanical refining at elevated temperatures' },
    { name: 'Thermal Membrane Processing', maturity: 'pilot', description: 'Heat-assisted membrane separation' },
    { name: 'Thermal Screw Processing', maturity: 'pilot', description: 'Continuous thermal and mechanical processing' }]

  },
  {
    name: 'Thermochemical',
    icon: <Fuel className="w-5 h-5" />,
    color: 'orange',
    technologies: [
    { name: 'Fast Pyrolysis', maturity: 'pilot', description: 'Rapid thermal decomposition for bio-oil production' },
    { name: 'Slow Pyrolysis', maturity: 'commercial', description: 'Controlled pyrolysis for biochar production' },
    { name: 'Catalytic Pyrolysis', maturity: 'lab', description: 'Catalyst-enhanced pyrolysis for improved yields' },
    { name: 'Gasification', maturity: 'commercial', description: 'Thermal conversion to produce synthesis gas' },
    { name: 'Torrefaction', maturity: 'pilot', description: 'Mild pyrolysis to improve fuel properties' },
    { name: 'Hydrothermal Processing', maturity: 'lab', description: 'High-temperature water treatment for biomass conversion' },
    { name: 'Plasma Processing', maturity: 'research', description: 'High-energy plasma for biomass conversion' }]

  },
  {
    name: 'Physical',
    icon: <Package className="w-5 h-5" />,
    color: 'cyan',
    technologies: [
    { name: 'Crystallization', maturity: 'commercial', description: 'Purification through controlled crystal formation' },
    { name: 'Phase Separation', maturity: 'commercial', description: 'Separation based on phase behavior' },
    { name: 'Distillation', maturity: 'commercial', description: 'Separation based on volatility differences' },
    { name: 'Centrifugal Separation', maturity: 'commercial', description: 'Physical separation based on density differences' },
    { name: 'Spray Drying', maturity: 'commercial', description: 'Rapid moisture removal through atomization' }]

  },
  {
    name: 'Hybrid',
    icon: <Layers className="w-5 h-5" />,
    color: 'indigo',
    technologies: [
    { name: 'Integrated Biorefineries', maturity: 'pilot', description: 'Multi-process facilities for comprehensive biomass utilization' },
    { name: 'Sequential Processing', maturity: 'lab', description: 'Combined thermal and biological treatments' },
    { name: 'Process Intensification', maturity: 'lab', description: 'Combining multiple processes for improved efficiency' },
    { name: 'Cascade Processing', maturity: 'pilot', description: 'Sequential processing to maximize value extraction' },
    { name: 'Microbial Fuel Cells', maturity: 'research', description: 'Bioelectrochemical systems for energy and chemicals' },
    { name: 'Bioelectrosynthesis', maturity: 'research', description: 'Electrochemical-biological hybrid systems' },
    { name: 'Multi-Product Biorefineries', maturity: 'lab', description: 'Simultaneous production of multiple products' },
    { name: 'AI-Optimized Processing', maturity: 'research', description: 'Machine learning-enhanced bioprocessing' }]

  }];


  const getMaturityStars = (maturity: string) => {
    switch (maturity) {
      case 'research':return 1;
      case 'lab':return 2;
      case 'pilot':return 3;
      case 'commercial':return 4;
      default:return 0;
    }
  };

  const renderTechnologyStars = (maturity: string, category: string) => {
    const starCount = getMaturityStars(maturity);

    const getStarColor = (category: string) => {
      switch (category) {
        case 'Chemical':return 'text-violet-500';
        case 'Biochemical':return 'text-blue-500';
        case 'Physicochemical':return 'text-emerald-500';
        case 'Mechanical':return 'text-amber-500';
        case 'Thermomechanical':return 'text-rose-500';
        case 'Thermochemical':return 'text-orange-500';
        case 'Physical':return 'text-cyan-500';
        case 'Hybrid':return 'text-indigo-500';
        default:return 'text-slate-700';
      }
    };

    return (
      <span className="inline-flex items-center gap-0.5">
        {[...Array(4)].map((_, index) =>
        <span
          key={index}
          className={`text-sm ${
          index < starCount ?
          getStarColor(category) :
          'text-gray-300'}`
          }>

            ★
          </span>
        )}
      </span>);

  };

  const handlePieClick = (data: any) => {
    if (data && data.name) {
      setSelectedTechCategory(data.name);
    }
  };

  const handleProductClick = (productName: string) => {
    setSelectedProduct(selectedProduct === productName ? null : productName);
  };

  const handleProductCategoryClick = (categoryName: string) => {
    setSelectedProductCategory((prev) =>
    prev.includes(categoryName) ?
    prev.filter((cat) => cat !== categoryName) :
    [...prev, categoryName]
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Chemicals':return 'bg-violet-50 border-violet-300';
      case 'Fuels':return 'bg-blue-50 border-blue-300';
      case 'Materials':return 'bg-emerald-50 border-emerald-300';
      case 'Food':return 'bg-amber-50 border-amber-300';
      default:return 'bg-muted/30 border-border';
    }
  };

  const handleBack = () => {
    navigate(`/landscape/${category}/${topic}/value-chain`);
  };

  // Define pathway connections
  const pathwayConnections = {
    feedstock: {
      'Sugarcane Molasses': ['Fermentation', 'Hydrolysis'],
      'Corn Stover': ['Hydrolysis', 'Gasification'],
      'Wheat Straw': ['Fermentation', 'Gasification', 'Pyrolysis'],
      'Bagasse': ['Fermentation', 'Pyrolysis'],
      'Rice Husk': ['Gasification', 'Pyrolysis'],
      'Wood Chips': ['Gasification', 'Catalysis'],
      'Algae': ['Extraction', 'Fermentation'],
      'Switchgrass': ['Pyrolysis', 'Gasification'],
      'Miscanthus': ['Fermentation', 'Hydrolysis'],
      'Hemp': ['Extraction', 'Pyrolysis'],
      'Sorghum': ['Fermentation', 'Hydrolysis'],
      'Cassava': ['Fermentation', 'Hydrolysis']
    },
    technology: {
      'Fermentation': ['Pharmaceuticals', 'Food & Beverage', 'Biofuels'],
      'Hydrolysis': ['Chemicals', 'Food & Beverage', 'Biofuels'],
      'Gasification': ['Biofuels', 'Energy', 'Chemicals'],
      'Pyrolysis': ['Biofuels', 'Chemicals', 'Agriculture'],
      'Catalysis': ['Chemicals', 'Pharmaceuticals'],
      'Extraction': ['Cosmetics', 'Pharmaceuticals', 'Food & Beverage'],
      'Purification': ['Pharmaceuticals', 'Cosmetics'],
      'Synthesis': ['Chemicals', 'Pharmaceuticals', 'Materials']
    },
    market: {
      'Pharmaceuticals': ['Fermentation', 'Extraction', 'Purification', 'Catalysis', 'Synthesis'],
      'Food & Beverage': ['Fermentation', 'Hydrolysis', 'Extraction'],
      'Cosmetics': ['Extraction', 'Purification'],
      'Biofuels': ['Fermentation', 'Hydrolysis', 'Gasification', 'Pyrolysis'],
      'Chemicals': ['Hydrolysis', 'Gasification', 'Pyrolysis', 'Catalysis', 'Synthesis'],
      'Animal Feed': ['Hydrolysis', 'Fermentation'],
      'Packaging': ['Pyrolysis', 'Synthesis'],
      'Textiles': ['Extraction', 'Synthesis'],
      'Agriculture': ['Pyrolysis', 'Fermentation'],
      'Construction': ['Pyrolysis', 'Synthesis'],
      'Energy': ['Gasification', 'Pyrolysis'],
      'Transportation': ['Gasification', 'Biofuels']
    }
  };

  // Get reverse connections (from technology to feedstock)
  const getReverseConnections = (tech: string): string[] => {
    const feedstocks: string[] = [];
    Object.entries(pathwayConnections.feedstock).forEach(([feedstock, technologies]) => {
      if (technologies.includes(tech)) {
        feedstocks.push(feedstock);
      }
    });
    return feedstocks;
  };

  // Determine if an item should be highlighted based on active pathway
  const isItemHighlighted = (type: 'feedstock' | 'technology' | 'market', item: string): boolean => {
    if (!activePathway.type || !activePathway.item) return false;

    if (activePathway.type === 'feedstock') {
      if (type === 'feedstock') return item === activePathway.item;
      if (type === 'technology') return pathwayConnections.feedstock[activePathway.item]?.includes(item) || false;
      if (type === 'market') {
        const connectedTechs = pathwayConnections.feedstock[activePathway.item] || [];
        return connectedTechs.some((tech) => pathwayConnections.technology[tech]?.includes(item));
      }
    } else if (activePathway.type === 'technology') {
      if (type === 'feedstock') return getReverseConnections(activePathway.item).includes(item);
      if (type === 'technology') return item === activePathway.item;
      if (type === 'market') return pathwayConnections.technology[activePathway.item]?.includes(item) || false;
    } else if (activePathway.type === 'market') {
      if (type === 'market') return item === activePathway.item;
      if (type === 'technology') return pathwayConnections.market[activePathway.item]?.includes(item) || false;
      if (type === 'feedstock') {
        const connectedTechs = pathwayConnections.market[activePathway.item] || [];
        return connectedTechs.some((tech) => getReverseConnections(tech).includes(item));
      }
    }

    return false;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Chemicals':return <TestTube className="w-4 h-4 text-violet-500" />;
      case 'Fuels':return <Zap className="w-4 h-4 text-blue-500" />;
      case 'Materials':return <Box className="w-4 h-4 text-emerald-500" />;
      case 'Food & Feed':return <UtensilsCrossed className="w-4 h-4 text-amber-500" />;
      default:return null;
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
    prev.includes(category) ?
    prev.filter((cat) => cat !== category) :
    [...prev, category]
    );
  };

  // New handler functions for enhanced features
  const handleComparisonToggle = (sectorTitle: string) => {
    if (!comparisonMode) return;

    setSelectedComparisons((prev) => {
      if (prev.includes(sectorTitle)) {
        return prev.filter((title) => title !== sectorTitle);
      } else if (prev.length < 3) {
        return [...prev, sectorTitle];
      }
      return prev;
    });
  };

  const calculateTotalMarketSize = () => {
    return processedSectors.
    filter((sector) => selectedMarketCategory.length === 0 || selectedMarketCategory.some((cat) => sector.title.includes(cat))).
    reduce((total, sector) => {
      const sectorTotal = sector.items.reduce((sum, item) => {
        const value = parseFloat(item.value.replace(/[$B]/g, ''));
        return sum + (isNaN(value) ? 0 : value);
      }, 0);
      return total + sectorTotal;
    }, 0);
  };

  const resetComparison = () => {
    setComparisonMode(false);
    setSelectedComparisons([]);
  };

  const handleTechCategoryClick = (category: string) => {
    setSelectedTechCategoryFilter((prev) =>
    prev.includes(category) ?
    prev.filter((cat) => cat !== category) :
    [...prev, category]
    );
    // Reset to first page when filters change
    setCurrentTechPage(1);
    setCurrentCategoryPage(1);
  };

  const getTechCategoryColors = (categoryName: string) => {
    const category = techCategories.find((cat) => cat.name === categoryName);
    if (!category) return {
      bg: 'bg-gray-500', hover: 'hover:bg-gray-600', text: 'text-white', border: 'border-gray-500',
      hoverBg: 'bg-gray-50 hover:bg-gray-100', unselectedText: 'text-gray-700'
    };

    switch (category.color) {
      case 'blue':
        return {
          bg: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'text-white', border: 'border-blue-500',
          hoverBg: 'bg-blue-50 hover:bg-blue-100', unselectedText: 'text-blue-700'
        };
      case 'violet':
        return {
          bg: 'bg-violet-500', hover: 'hover:bg-violet-600', text: 'text-white', border: 'border-violet-500',
          hoverBg: 'bg-violet-50 hover:bg-violet-100', unselectedText: 'text-violet-700'
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600', text: 'text-white', border: 'border-emerald-500',
          hoverBg: 'bg-emerald-50 hover:bg-emerald-100', unselectedText: 'text-emerald-700'
        };
      case 'amber':
        return {
          bg: 'bg-amber-500', hover: 'hover:bg-amber-600', text: 'text-white', border: 'border-amber-500',
          hoverBg: 'bg-amber-50 hover:bg-amber-100', unselectedText: 'text-amber-700'
        };
      case 'rose':
        return {
          bg: 'bg-rose-500', hover: 'hover:bg-rose-600', text: 'text-white', border: 'border-rose-500',
          hoverBg: 'bg-rose-50 hover:bg-rose-100', unselectedText: 'text-rose-700'
        };
      case 'orange':
        return {
          bg: 'bg-orange-500', hover: 'hover:bg-orange-600', text: 'text-white', border: 'border-orange-500',
          hoverBg: 'bg-orange-50 hover:bg-orange-100', unselectedText: 'text-orange-700'
        };
      case 'cyan':
        return {
          bg: 'bg-cyan-500', hover: 'hover:bg-cyan-600', text: 'text-white', border: 'border-cyan-500',
          hoverBg: 'bg-cyan-50 hover:bg-cyan-100', unselectedText: 'text-cyan-700'
        };
      case 'indigo':
        return {
          bg: 'bg-indigo-500', hover: 'hover:bg-indigo-600', text: 'text-white', border: 'border-indigo-500',
          hoverBg: 'bg-indigo-50 hover:bg-indigo-100', unselectedText: 'text-indigo-700'
        };
      default:
        return {
          bg: 'bg-gray-500', hover: 'hover:bg-gray-600', text: 'text-white', border: 'border-gray-500',
          hoverBg: 'bg-gray-50 hover:bg-gray-100', unselectedText: 'text-gray-700'
        };
    }
  };

  const getTechCategoryIcon = (category: string) => {
    const categoryData = techCategories.find((cat) => cat.name === category);
    const colorClass = categoryData ? `text-${categoryData.color}-500` : 'text-gray-500';

    switch (category) {
      case 'Biochemical':return <Beaker className={`w-4 h-4 ${colorClass}`} />;
      case 'Chemical':return <TestTube className={`w-4 h-4 ${colorClass}`} />;
      case 'Physicochemical':return <FlaskConical className={`w-4 h-4 ${colorClass}`} />;
      case 'Mechanical':return <Settings className={`w-4 h-4 ${colorClass}`} />;
      case 'Thermomechanical':return <Zap className={`w-4 h-4 ${colorClass}`} />;
      case 'Thermochemical':return <Fuel className={`w-4 h-4 ${colorClass}`} />;
      case 'Physical':return <Box className={`w-4 h-4 ${colorClass}`} />;
      case 'Hybrid':return <GitBranch className={`w-4 h-4 ${colorClass}`} />;
      default:return null;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-sm">{data.name}</p>
          <p className="text-xs text-gray-600">Price: ${data.price}/kg</p>
          <p className="text-xs text-gray-600">Market Size: ${data.marketSize}B</p>
          <p className="text-xs text-gray-600">Growth Rate: {data.marketGrowth}%</p>
        </div>);

    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload) return null;

    let color;
    switch (payload.category) {
      case 'Chemicals':
        color = '#8b5cf6';
        break;
      case 'Fuels':
        color = '#3b82f6';
        break;
      case 'Materials':
        color = '#10b981';
        break;
      case 'Food & Feed':
        color = '#f59e0b';
        break;
      default:
        color = '#6b7280';
    }

    return (
      <circle
        cx={cx}
        cy={cy}
        r={selectedProduct === payload.name ? 8 : 6}
        fill={color}
        fillOpacity={selectedProduct === payload.name ? 1 : 0.7}
        stroke={selectedProduct === payload.name ? '#000' : color}
        strokeWidth={selectedProduct === payload.name ? 2 : 1}
        style={{ cursor: 'pointer' }}
        onClick={() => handleProductClick(payload.name)} />);


  };

  // Opportunity map selected category
  // Default opportunity tab excludes the anchor category
  const defaultOpportunityTab = isFeedstockRoute ? 'technologies' : 'feedstocks';
  const [opportunityTab, setOpportunityTab] = useState<'feedstocks' | 'technologies' | 'products' | 'applications' | null>(defaultOpportunityTab as any);
  const [hoveredPathwayIdx, setHoveredPathwayIdx] = useState<number | null>(null);
  const [selectedOpportunityItems, setSelectedOpportunityItems] = useState<Set<string>>(new Set());

  const handleOpportunityTabChange = (tab: 'feedstocks' | 'technologies' | 'products' | 'applications') => {
    setOpportunityTab(tab);
    setSelectedOpportunityItems(new Set());
  };

  const toggleOpportunityItem = (name: string) => {
    setSelectedOpportunityItems(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleExploreFilteredPathways = () => {
    const filterType = opportunityTab === 'feedstocks' ? 'feedstock' : opportunityTab === 'technologies' ? 'technology' : opportunityTab === 'products' ? 'product' : 'application';
    const params = new URLSearchParams();
    params.set('filterType', filterType);
    params.set('filterValues', Array.from(selectedOpportunityItems).join('||'));
    navigate(`/landscape/${category}/${topic}/value-chain/pathways?${params.toString()}`);
  };

  const technologyItems = technologyData.flatMap((categoryGroup) => categoryGroup.technologies);
  const flatTechnologies = technologyData.flatMap((categoryGroup) =>
  categoryGroup.technologies.map((tech) => ({ ...tech, category: categoryGroup.category }))
  );
  const top3TechNames = ['Acid Hydrolysis', 'Enzymatic Hydrolysis', 'Steam Explosion'];
  const techPerPage = 5;
  const totalTechPages = Math.ceil(flatTechnologies.length / techPerPage);
  const startTechIndex = (currentTechPage - 1) * techPerPage;
  const currentTechnologies = flatTechnologies.slice(startTechIndex, startTechIndex + techPerPage);

  const flatApplications = marketDataDetail.flatMap((market) =>
  market.subcategories.map((sub) => ({ ...sub, category: market.application, totalSize: market.totalSize }))
  );
  const top3AppNames = ['PLA Packaging', 'Food Acidulant', 'Skin Care (AHA)'];
  const totalAppPages = Math.ceil(flatApplications.length / appsPerPage);
  const startAppIndex = (currentAppPage - 1) * appsPerPage;
  const currentApplications = flatApplications.slice(startAppIndex, startAppIndex + appsPerPage);

  const stageCounts = { Commercial: 0, Pilot: 0, Lab: 0, Research: 0 };
  technologyItems.forEach((tech) => {
    if (tech.status === 'Commercial') stageCounts.Commercial++;else
    if (tech.status === 'Pilot') stageCounts.Pilot++;else
    if (tech.status === 'Lab') stageCounts.Lab++;else
    stageCounts.Research++;
  });
  const trlDistributionData = [
  { stage: 'Commercial', count: stageCounts.Commercial, fill: 'hsl(142, 71%, 45%)' },
  { stage: 'Pilot', count: stageCounts.Pilot, fill: 'hsl(217, 91%, 60%)' },
  { stage: 'Lab', count: stageCounts.Lab, fill: 'hsl(220, 9%, 46%)' },
  { stage: 'Research', count: stageCounts.Research, fill: 'hsl(220, 9%, 70%)' }];


  // Key facts data
  const keyFacts = [
  { label: 'Producers', value: '520+' },
  { label: 'Off-take Signals', value: '142 signed' },
  { label: 'Projects', value: '680+' },
  { label: 'Patents', value: '1,240+' },
  { label: 'Research Publications', value: '3,800+' }];


  return (
    <>
      <div className="h-full bg-background flex flex-col" key="value-chain-layout">
        <div className="max-w-[1400px] w-full mx-auto px-6 pt-4 pb-3 flex items-center justify-between flex-shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={() => navigate('/')}>
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Button>
          <div />
        </div>


        {/* Main layout: Left content + Right sidebar */}
        <div className="max-w-[1400px] w-full mx-auto px-6 pb-6 flex-1 min-h-0">
          <div className="grid gap-5 h-full" style={{ gridTemplateColumns: '1fr 280px', rowGap: '12px' }}>
            {/* Titles row */}
            <div>
              <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Executive Summary</h2>
            </div>
            <div>
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Landscape Analytics</h3>
            </div>

            {/* LEFT column: Hero + Opportunity Map */}
            <div className="min-w-0 space-y-3 overflow-y-auto h-full pr-1 pb-6">
              {/* Outer white card wrapping Hero + Pathway Readiness + Opportunity Map */}
              <div className="space-y-4">
              {/* Hero Block */}
              <div className="border border-border/60 rounded-lg bg-card/50 backdrop-blur-sm px-5 py-4">
                <div className="flex items-start justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-violet-100 text-violet-700 border-violet-200 uppercase text-[9px] font-bold tracking-wider px-2.5 py-0.5 rounded-full">
                        {category || 'Product'}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] font-medium px-2 py-0.5 rounded-full text-muted-foreground border-border">
                        Chemical
                      </Badge>
                      <Badge variant="outline" className="text-[9px] font-medium px-2 py-0.5 rounded-full text-muted-foreground border-border">
                        Organic Acid
                      </Badge>
                    </div>
                    <h1 className="text-xl font-bold text-foreground">{decodeURIComponent(topic || 'Xylose')}</h1>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-lg">
                      {isFeedstockRoute
                        ? `${decodeURIComponent(topic || 'Fructose')} is a versatile feedstock used in multiple biorefinery pathways. Explore downstream technologies, products, and market applications enabled by this feedstock.`
                        : `Lactic acid (C₃H₆O₃) is a versatile organic acid used across food, pharmaceutical, and chemical industries. It is a key building block for polylactic acid (PLA) bioplastics and is increasingly produced via microbial fermentation from renewable feedstocks.`
                      }
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                    {/* Left column: Market cards */}
                    <div className="flex flex-col gap-2 h-full">
                      <div className="border border-border rounded-md px-3 py-2 bg-background min-w-[155px] flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Globe className="w-3 h-3" />
                            <span className="text-[10px] font-medium">Global Market</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5 text-primary" />
                            <span className="text-[10px] font-semibold text-primary">+8.5%</span>
                          </div>
                        </div>
                        <div className="flex items-baseline justify-between mt-0.5">
                          <div className="text-base font-bold text-foreground">$3.9B</div>
                          <span className="text-[9px] text-muted-foreground">CAGR 2024–30</span>
                        </div>
                      </div>
                      {isFeedstockRoute ? (
                      <div className="border border-border rounded-md px-3 py-2 bg-background min-w-[155px] flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span className="text-[10px] font-medium">Available Volumes in Europe</span>
                        </div>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <div className="text-base font-bold text-foreground">1.2 – 3.8</div>
                          <span className="text-[9px] text-muted-foreground">Mt/year</span>
                        </div>
                      </div>
                      ) : (
                      <div className="border border-border rounded-md px-3 py-2 bg-background min-w-[155px] flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="text-[10px] font-medium">Europe</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5 text-primary" />
                            <span className="text-[10px] font-semibold text-primary">+9.2%</span>
                          </div>
                        </div>
                        <div className="flex items-baseline justify-between mt-0.5">
                          <div className="text-base font-bold text-foreground">€1.4B</div>
                          <span className="text-[9px] text-muted-foreground">CAGR 2024–30</span>
                        </div>
                      </div>
                      )}
                    </div>
                    {/* Right column: Circularity Potential */}
                    <div className="border border-border rounded-md px-3 py-2.5 bg-background min-w-[155px] flex flex-col justify-center">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Leaf className="w-3 h-3 text-primary" />
                          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Pathways Identified</span>
                        </div>
                        <div className="text-2xl font-bold text-primary leading-none">88</div>
                        <span className="text-[9px] text-muted-foreground">for valorisation of Fructose</span>
                      </div>
                    </div>
                  </div>
              </div>

              {(() => {
                    // Different data depending on entry point
                    const scatterPathwaysProduct = [
                    { trl: 9, availability: 92, pathway: 'Corn Starch > Fermentation > Lactic Acid > PLA Packaging', score: 91, price: 82, season: 75, cagr: 11, conc: 'HIGH' },
                    { trl: 9, availability: 88, pathway: 'Fructose > Homofermentation > Lactic Acid > Food Acidulant', score: 89, price: 78, season: 80, cagr: 8, conc: 'HIGH' },
                    { trl: 8, availability: 85, pathway: 'Sugarcane Molasses > Fermentation > Lactic Acid > Food Acidulant', score: 87, price: 71, season: 65, cagr: 8, conc: 'HIGH' },
                    { trl: 7, availability: 78, pathway: 'Cassava Starch > Fermentation > Lactic Acid > Preservatives', score: 79, price: 68, season: 58, cagr: 6, conc: 'HIGH' },
                    { trl: 6, availability: 70, pathway: 'Whey Permeate > Fermentation > Lactic Acid > Skin Care', score: 72, price: 55, season: 42, cagr: 9, conc: 'MEDIUM' },
                    { trl: 5, availability: 82, pathway: 'Corn Stover > Enzymatic Hydrolysis > Lactic Acid > PLA Fibers', score: 68, price: 48, season: 50, cagr: 7, conc: 'MEDIUM' },
                    { trl: 5, availability: 65, pathway: 'Sugar Beet Pulp > Fermentation > Lactic Acid > Green Solvents', score: 63, price: 42, season: 35, cagr: 5, conc: 'LOW' },
                    { trl: 4, availability: 74, pathway: 'Food Waste > SSF > Lactic Acid > Biodegradable Films', score: 58, price: 38, season: 28, cagr: 10, conc: 'LOW' },
                    { trl: 4, availability: 58, pathway: 'Wheat Straw > Hydrolysis > Lactic Acid > Acrylic Acid Substitute', score: 52, price: 35, season: 22, cagr: 12, conc: 'LOW' },
                    { trl: 3, availability: 53, pathway: 'Bread Waste > SSF > Lactic Acid > 3D Printing Filament', score: 45, price: 30, season: 18, cagr: 14, conc: 'LOW' },
                    { trl: 2, availability: 90, pathway: 'CO₂ > Gas Fermentation > Lactic Acid > Chemical Intermediates', score: 64, price: 45, season: 10, cagr: 15, conc: 'MEDIUM' },
                    { trl: 2, availability: 35, pathway: 'Microalgae > Fermentation > Lactic Acid > Bioabsorbable Implants', score: 35, price: 22, season: 8, cagr: 18, conc: 'LOW' }];

                    // Feedstock-centric data: TRL vs Market Size of produced products from Fructose
                    const scatterPathwaysFeedstock = [
                    { trl: 9, marketSize: 3.9, pathway: 'Fermentation > Lactic Acid > PLA Packaging', product: 'Lactic Acid', score: 91, cagr: 8.5 },
                    { trl: 9, marketSize: 89.1, pathway: 'Yeast Fermentation > Ethanol > Biofuels', product: 'Ethanol', score: 88, cagr: 4.2 },
                    { trl: 9, marketSize: 2.4, pathway: 'Hydrogenation > Sorbitol > Food Additive', product: 'Sorbitol', score: 85, cagr: 5.1 },
                    { trl: 7, marketSize: 0.6, pathway: 'Acid Dehydration > HMF > Platform Chemical', product: 'HMF', score: 72, cagr: 18.5 },
                    { trl: 6, marketSize: 0.8, pathway: 'Dehydration + Hydrogenation > Levulinic Acid > Green Solvents', product: 'Levulinic Acid', score: 68, cagr: 12.3 },
                    { trl: 6, marketSize: 0.5, pathway: 'Fermentation > Succinic Acid > Biodegradable Polymers', product: 'Succinic Acid', score: 65, cagr: 11.8 },
                    { trl: 9, marketSize: 1.8, pathway: 'Hydrogenation > Mannitol > Pharma', product: 'Mannitol', score: 82, cagr: 3.2 },
                    { trl: 8, marketSize: 1.2, pathway: 'Oxidation > Gluconic Acid > Concrete Admixture', product: 'Gluconic Acid', score: 78, cagr: 4.8 },
                    { trl: 4, marketSize: 12.5, pathway: 'Oxidation > 2,5-FDCA > PEF Packaging', product: '2,5-FDCA', score: 52, cagr: 22.0 },
                    { trl: 5, marketSize: 0.3, pathway: 'HMF Hydrogenation > DMF > Biofuel', product: 'DMF', score: 45, cagr: 15.0 },
                    { trl: 6, marketSize: 13.3, pathway: 'Fermentation > Lactic Acid > PLA Bioplastics', product: 'PLA', score: 70, cagr: 11.2 }];

                    const scatterData = isFeedstockRoute ? scatterPathwaysFeedstock : scatterPathwaysProduct;
                    const yKey = isFeedstockRoute ? 'marketSize' : 'availability';
                    const yLabel = isFeedstockRoute ? 'MARKET SIZE ($B)' : 'FEEDSTOCK AVAILABILITY';
                    const yDomain = isFeedstockRoute ? [0, 100] : [0, 100];
                    const chartTitle = isFeedstockRoute
                      ? 'Pathway Scalability - TRL vs Product Market Size'
                      : 'Pathway Scalability - TRL vs Feedstock Availability';
                    const chartSubtitle = isFeedstockRoute
                      ? 'Pathways mapped by technology readiness and downstream product market size.'
                      : 'Scatter plot of all identified pathways mapped by technology readiness level and feedstock availability.';

                    return (
                      <div className="border border-border/60 rounded-lg p-4 bg-card/50 backdrop-blur-sm mt-4">
                      {/* Pathway count banner */}
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 p-1.5 rounded-md">
                              <GitBranch className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <h2 className="text-sm font-bold text-foreground">{chartTitle}</h2>
                              <p className="text-[10px] text-muted-foreground">{chartSubtitle}</p>
                            </div>
                          </div>
                          <Button size="sm" className="gap-1.5 h-7 text-xs bg-foreground text-background hover:bg-foreground/90" onClick={() => navigate(`/landscape/${category}/${topic}/value-chain/pathways`)}>
                            <ArrowRight className="w-3.5 h-3.5" />
                            Explore Pathways
                          </Button>
                        </div>
                        <div className="h-[200px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 15, bottom: 15, left: isFeedstockRoute ? 15 : 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis type="number" dataKey="trl" name="TRL" domain={[1, 9]} ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9]} label={{ value: 'TRL', position: 'insideBottom', offset: -8, style: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' } }} tick={{ fontSize: 10 }} />
                              <YAxis type="number" dataKey={yKey} name={yLabel} domain={yDomain} label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: isFeedstockRoute ? -5 : 10, dy: 0, style: { fontSize: 10, fill: 'hsl(var(--muted-foreground))', textAnchor: 'middle' } }} tick={{ fontSize: 10 }} />
                              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const d = payload[0].payload;
                                    const stage = d.trl >= 8 ? 'Commercial' : d.trl >= 6 ? 'Pilot' : d.trl >= 4 ? 'Lab' : 'R&D';
                                    return (
                                      <div className="bg-card border border-border rounded-md p-1.5 shadow-md text-[10px]">
                                      <p className="font-semibold text-foreground">{d.pathway}</p>
                                      {isFeedstockRoute ? (
                                        <p className="text-muted-foreground">{stage} · {d.product} · ${d.marketSize}B · {d.cagr}% CAGR</p>
                                      ) : (
                                        <p className="text-muted-foreground">{stage} · Availability: {d.availability}</p>
                                      )}
                                    </div>);
                                  }
                                  return null;
                                }} />
                              <Scatter
                                  data={scatterData}
                                  onMouseEnter={(_, idx) => setHoveredPathwayIdx(idx)}
                                  onMouseLeave={() => setHoveredPathwayIdx(null)}
                                  shape={(props: any) => {
                                    const { cx, cy, payload } = props;
                                    const idx = scatterData.findIndex((p: any) => p.pathway === payload.pathway);
                                    const isTop3 = idx < 3;
                                    const isHovered = hoveredPathwayIdx === idx;
                                    const fill = isTop3 ? '#22c55e' : '#9ca3af';
                                    const r = isHovered ? 7 : 5;
                                    return (
                                      <circle
                                        cx={cx} cy={cy} r={r}
                                        fill={fill}
                                        stroke={isHovered ? '#16a34a' : 'none'}
                                        strokeWidth={isHovered ? 2 : 0}
                                        style={{ cursor: 'pointer', transition: 'r 0.2s' }}
                                        onMouseEnter={() => setHoveredPathwayIdx(idx)}
                                        onMouseLeave={() => setHoveredPathwayIdx(null)} />);

                                  }} />
                                
                            </ScatterChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Top 3 Pathways */}
                      <div className="space-y-2">
                        <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Top 3 Pathways Identified</h4>
                        <div className="space-y-2">
                          {scatterData.slice(0, 3).map((row: any, idx: number) => {
                              const isHovered = hoveredPathwayIdx === idx;
                              const rawParts = row.pathway.split(' > ');
                              // For feedstock routes, prepend the feedstock (topic) as the first node
                              const parts = isFeedstockRoute && rawParts.length === 3
                                ? [decodeURIComponent(topic || ''), ...rawParts]
                                : rawParts;
                              const trlNum = row.trl;
                              const stageLabel = trlNum >= 8 ? 'Commercial' : trlNum >= 6 ? 'Pilot' : trlNum >= 4 ? 'Lab' : 'R&D';
                              const stageColors = trlNum >= 8 ? 'bg-primary/10 text-primary border-primary/30' : trlNum >= 6 ? 'bg-blue-50 text-blue-700 border-blue-200' : trlNum >= 4 ? 'bg-muted text-muted-foreground border-border' : 'bg-amber-50 text-amber-700 border-amber-200';
                              const scoreColor = row.score >= 70 ? 'text-primary font-bold' : row.score >= 40 ? 'text-amber-600 font-bold' : 'text-muted-foreground font-bold';
                              const medalConfig = [
                              { icon: Trophy, label: 'High-Feasibility Pathway', color: 'text-amber-500' },
                              { icon: Award, label: 'Breakthrough Innovation Pathway', color: 'text-sky-500' },
                              { icon: Medal, label: 'Emerging Opportunity Pathway', color: 'text-violet-500' }][
                              idx];
                              const MedalIcon = medalConfig.icon;
                              return (
                                <div key={idx} className="space-y-1">
                                {/* Trophy + number outside the card */}
                                





                                  

                                {/* Card */}
                                <div
                                    className={`border border-border rounded-lg bg-card px-3 py-2.5 cursor-pointer transition-all duration-200 ${
                                    isHovered ? 'ring-1 ring-primary/40 shadow-sm' : 'hover:shadow-md hover:border-primary/30'}`
                                    }
                                    onMouseEnter={() => setHoveredPathwayIdx(idx)}
                                    onMouseLeave={() => setHoveredPathwayIdx(null)}
                                    onClick={() => navigate(`/landscape/${category}/${topic}/value-chain/pathways/${idx}`)}>
                                    
                                  {/* VCG Scoring + Stage badge */}
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-muted-foreground border border-border rounded px-2 py-0.5">
                                        VCG Scoring: <span className={scoreColor}>{row.score}</span>
                                      </span>
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${stageColors} border`}>
                                        {stageLabel}
                                      </span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                  </div>

                                  {/* Pathway flow row */}
                                  <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-x-2">
                                    {parts.map((part, pi) => {
                                      const labels = ['Feedstock', 'Process', 'Product', 'Application'];
                                      const isAnchor = (isProductRoute && pi === 2) || (isFeedstockRoute && pi === 0);
                                      return (
                                        <React.Fragment key={pi}>
                                          {pi > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 mt-3" />}
                                          <div>
                                            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5">
                                              {labels[pi]}
                                            </span>
                                            <div className={`rounded-md border px-2 py-1.5 ${isAnchor ? 'border-primary/50 bg-primary/10' : 'border-border bg-muted/30'}`}>
                                              <span className={`text-[11px] font-medium ${isAnchor ? 'text-primary' : 'text-foreground'}`}>{part}</span>
                                            </div>
                                          </div>
                                        </React.Fragment>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>);

                            })}
                        </div>
                      </div>
                    </div>);

                  })()}

              {/* Opportunity Map */}
              <div className="border border-border/60 rounded-lg p-4 space-y-3 bg-card/50 backdrop-blur-sm mt-4">
              <div className="flex items-center">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Opportunity Map</h3>
              </div>

              {/* Category Tabs — pill style, exclude the anchor category */}
              <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1">
                {(() => {
                  const allTabs = [
                    { key: 'feedstocks' as const, icon: Sprout, label: 'Feedstocks', count: feedstockData.length },
                    { key: 'technologies' as const, icon: Settings, label: 'Technologies', count: technologyData.reduce((sum, c) => sum + c.technologies.length, 0) },
                    { key: 'products' as const, icon: Box, label: 'Products', count: scatterData.length },
                    { key: 'applications' as const, icon: Target, label: 'Applications', count: marketDataDetail.reduce((sum, m) => sum + m.subcategories.length, 0) },
                  ];
                  // For product route: exclude 'products' (anchor is the product)
                  // For feedstock route: exclude 'feedstocks' (anchor is the feedstock)
                  const filteredTabs = allTabs.filter(tab => {
                    if (isProductRoute && tab.key === 'products') return false;
                    if (isFeedstockRoute && tab.key === 'feedstocks') return false;
                    return true;
                  });
                  return filteredTabs.map((tab) =>
                    <button
                      key={tab.key}
                      onClick={() => handleOpportunityTabChange(tab.key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-[10px] font-semibold transition-all ${
                      opportunityTab === tab.key ?
                      'bg-card text-foreground shadow-sm' :
                      'text-muted-foreground hover:text-foreground'}`
                      }>
                      
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className="text-[9px] text-muted-foreground font-normal">({tab.count})</span>
                </button>
                  );
                })()}
              </div>

              {/* Content Area */}
              <div className="min-h-[300px]">
                {!opportunityTab &&
                      <div className="flex flex-col items-center justify-center h-[350px] text-center px-8">
                    <Settings className="w-8 h-8 text-muted-foreground/20 mb-3" />
                    <h3 className="text-sm font-semibold text-foreground mb-1">Select a category to explore</h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      Choose a category above to see opportunities, maturity levels, and key players.
                    </p>
                  </div>
                      }

                {opportunityTab === 'feedstocks' &&
                      <TooltipProvider>
                  <div className="pt-2">
                    <div className="w-full">
                      <div className="flex flex-col overflow-hidden">
                         <div className="grid grid-cols-[auto,0.3fr,2.5fr,2.5fr,2fr,1.2fr,1fr,1.2fr] gap-1.5 px-3 py-1.5 bg-muted/50">
                          <div className="w-4" />
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">#</div>
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Feedstock</div>
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Category</div>
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Quantity (EU)</div>
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Price</div>
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide text-center">Market Players</div>
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Status</div>
                        </div>
                        {currentFeedstocks.map((item, index) => {
                                if (!item) return null;
                                const rank = startFeedstockIndex + index + 1;
                                const isTop3 = rank <= 3;
                                const statusTag = getStatusTagStyle(item.maturity || 'Research');
                                const playerCount = [8, 12, 6, 4, 9, 3, 2, 15, 5, 7, 11, 3][(startFeedstockIndex + index) % 12];
                                return (
                                  <div key={index} onClick={() => toggleOpportunityItem(item.name)} className={`grid grid-cols-[auto,0.3fr,2.5fr,2.5fr,2fr,1.2fr,1fr,1.2fr] gap-1.5 px-3 py-2 transition-colors border-b border-border/50 last:border-0 cursor-pointer ${selectedOpportunityItems.has(item.name) ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-card hover:bg-muted/30'}`}>
                              <div className="flex items-center">
                                <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-colors ${selectedOpportunityItems.has(item.name) ? 'bg-primary border-primary' : 'border-muted-foreground/40'}`}>
                                  {selectedOpportunityItems.has(item.name) && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                                </div>
                              </div>
                              <div className="text-[10px] tabular-nums font-medium flex items-center gap-1">
                                <span className="text-muted-foreground">{rank}</span>
                              </div>
                              <div className="text-[10px] font-medium text-foreground">{item.name}</div>
                              <div className="text-[10px] text-muted-foreground">{item.categories.join(', ')}</div>
                              <div className="text-[10px] text-muted-foreground">{item.quantity}</div>
                              <div className="text-[10px] text-muted-foreground">{item.price}</div>
                              <div className="text-[10px] font-semibold text-green-700 tabular-nums text-center">{playerCount}</div>
                              <div className="flex items-center">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold tracking-wide border ${statusTag}`}>{item.maturity || 'Research'}</span>
                              </div>
                            </div>);
                              })}

                        <div className="flex items-center justify-between px-3 py-2 border-t border-border">
                          <span className="text-[10px] text-muted-foreground">
                            {startFeedstockIndex + 1}-{Math.min(endFeedstockIndex, filteredFeedstockData.length)} of {filteredFeedstockData.length}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handlePreviousFeedstockPage} disabled={currentFeedstockPage === 1} className="h-6 w-6 p-0">
                              <ChevronLeft className="w-3 h-3" />
                            </Button>
                            <span className="text-[10px] text-muted-foreground">Page {currentFeedstockPage} of {totalFeedstockPages}</span>
                            <Button variant="outline" size="sm" onClick={handleNextFeedstockPage} disabled={currentFeedstockPage === totalFeedstockPages} className="h-6 w-6 p-0">
                              <ChevronRight className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </TooltipProvider>
                      }

                {opportunityTab === 'technologies' &&
                      <TooltipProvider>
                  <div className="pt-2">
                    <div className="w-full">
                      <div className="flex flex-col overflow-hidden">
                          <div className="grid grid-cols-[auto,0.3fr,2.5fr,1.5fr,3fr,1.2fr] gap-1.5 px-3 py-1.5 bg-muted/50">
                          <div className="w-4" />
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">#</div>
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Process</div>
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Category</div>
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Description</div>
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Status</div>
                        </div>
                        {currentTechnologies.map((tech, index) => {
                                const rank = startTechIndex + index + 1;
                                const isTop3 = rank <= 3;
                                const statusTag = getStatusTagStyle(tech.status);
                                const playerCount = [5, 9, 3, 7, 2, 4, 6, 11, 8, 1][(startTechIndex + index) % 10];
                                return (
                                  <div key={index} onClick={() => toggleOpportunityItem(tech.name)} className={`grid grid-cols-[auto,0.3fr,2.5fr,1.5fr,3fr,1.2fr] gap-1.5 px-3 py-2 transition-colors border-b border-border/50 last:border-0 cursor-pointer ${selectedOpportunityItems.has(tech.name) ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-card hover:bg-muted/30'}`}>
                              <div className="flex items-center">
                                <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-colors ${selectedOpportunityItems.has(tech.name) ? 'bg-primary border-primary' : 'border-muted-foreground/40'}`}>
                                  {selectedOpportunityItems.has(tech.name) && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                                </div>
                              </div>
                              <div className="text-[10px] tabular-nums font-medium flex items-center gap-1">
                                <span className="text-muted-foreground">{rank}</span>
                              </div>
                              <div className="text-[10px] font-medium text-foreground">{tech.name}</div>
                              <div className="text-[10px] text-muted-foreground">{tech.category}</div>
                              <div className="text-[10px] text-muted-foreground">{tech.description}</div>
                              <div className="flex items-center">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold tracking-wide border ${statusTag}`}>{tech.status}</span>
                              </div>
                            </div>);
                              })}

                        <div className="flex items-center justify-between px-3 py-2 border-t border-border">
                          <span className="text-[10px] text-muted-foreground">
                            {startTechIndex + 1}-{Math.min(startTechIndex + techPerPage, flatTechnologies.length)} of {flatTechnologies.length}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentTechPage((p) => Math.max(p - 1, 1))} disabled={currentTechPage === 1} className="h-6 w-6 p-0">
                              <ChevronLeft className="w-3 h-3" />
                            </Button>
                            <span className="text-[10px] text-muted-foreground">Page {currentTechPage} of {totalTechPages}</span>
                            <Button variant="outline" size="sm" onClick={() => setCurrentTechPage((p) => Math.min(p + 1, totalTechPages))} disabled={currentTechPage === totalTechPages} className="h-6 w-6 p-0">
                              <ChevronRight className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </TooltipProvider>
                      }

                {opportunityTab === 'applications' &&
                      <TooltipProvider>
                  <div className="pt-2">
                    <div className="w-full">
                      <div className="flex flex-col overflow-hidden">
                         <div className="grid grid-cols-[auto,0.3fr,2fr,1.5fr,3fr,1fr,1fr] gap-1.5 px-3 py-1.5 bg-muted/50">
                          <div className="w-4" />
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">#</div>
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Application</div>
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Category</div>
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Description</div>
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide text-center">Market Players</div>
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Market Maturity</div>
                        </div>
                        {currentApplications.map((app, index) => {
                                const rank = startAppIndex + index + 1;
                                const isTop3 = rank <= 3;
                                const matBadge = getMaturityBadge(app.maturity);
                                const gpBadge = getGreenPremiumBadge(app.greenPremium);
                                const playerCount = [14, 22, 8, 6, 18, 3, 10, 5, 12, 7, 9, 16, 4, 11, 2][(startAppIndex + index) % 15];
                                return (
                                  <div key={index} onClick={() => toggleOpportunityItem(app.name)} className={`grid grid-cols-[auto,0.3fr,2fr,1.5fr,3fr,1fr,1fr] gap-1.5 px-3 py-2 transition-colors border-b border-border/50 last:border-0 cursor-pointer ${selectedOpportunityItems.has(app.name) ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-card hover:bg-muted/30'}`}>
                              <div className="flex items-center">
                                <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-colors ${selectedOpportunityItems.has(app.name) ? 'bg-primary border-primary' : 'border-muted-foreground/40'}`}>
                                  {selectedOpportunityItems.has(app.name) && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                                </div>
                              </div>
                              <div className="text-[10px] tabular-nums font-medium flex items-center gap-1">
                                <span className="text-muted-foreground">{rank}</span>
                              </div>
                              <div className="text-[10px] font-medium text-foreground">{app.name}</div>
                              <div className="text-[10px] text-muted-foreground">{app.category}</div>
                              <div className="text-[10px] text-muted-foreground">{(app as any).description || ''}</div>
                              <div className="text-[10px] font-semibold text-amber-700 tabular-nums text-center">{playerCount}</div>
                              <div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold tracking-wide border ${matBadge.bgClass} ${matBadge.textClass}`}>{app.maturity}</span>
                              </div>
                            </div>);
                              })}

                        <div className="flex items-center justify-between px-3 py-2 border-t border-border">
                          <span className="text-[10px] text-muted-foreground">
                            {startAppIndex + 1}-{Math.min(startAppIndex + appsPerPage, flatApplications.length)} of {flatApplications.length}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentAppPage((p) => Math.max(p - 1, 1))} disabled={currentAppPage === 1} className="h-6 w-6 p-0">
                              <ChevronLeft className="w-3 h-3" />
                            </Button>
                            <span className="text-[10px] text-muted-foreground">Page {currentAppPage} of {totalAppPages}</span>
                            <Button variant="outline" size="sm" onClick={() => setCurrentAppPage((p) => Math.min(p + 1, totalAppPages))} disabled={currentAppPage === totalAppPages} className="h-6 w-6 p-0">
                              <ChevronRight className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </TooltipProvider>
                      }

                {/* Products tab (shown when starting from Feedstock) */}
                {opportunityTab === 'products' &&
                      <TooltipProvider>
                  <div className="pt-2">
                    <div className="w-full">
                       <div className="flex flex-col overflow-hidden">
                         <div className="grid grid-cols-[auto,0.3fr,2fr,1.5fr,1.5fr,1fr] gap-1.5 px-3 py-1.5 bg-muted/50">
                          <div className="w-4" />
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">#</div>
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Product</div>
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Category</div>
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Market Size</div>
                          <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Growth</div>
                        </div>
                        {scatterData.slice(0, 10).map((product, index) => {
                                const rank = index + 1;
                                return (
                                  <div key={index} onClick={() => toggleOpportunityItem(product.name)} className={`grid grid-cols-[auto,0.3fr,2fr,1.5fr,1.5fr,1fr] gap-1.5 px-3 py-2 transition-colors border-b border-border/50 last:border-0 cursor-pointer ${selectedOpportunityItems.has(product.name) ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-card hover:bg-muted/30'}`}>
                              <div className="flex items-center">
                                <div className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-colors ${selectedOpportunityItems.has(product.name) ? 'bg-primary border-primary' : 'border-muted-foreground/40'}`}>
                                  {selectedOpportunityItems.has(product.name) && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                                </div>
                              </div>
                              <div className="text-[10px] tabular-nums font-medium flex items-center gap-1">
                                <span className="text-muted-foreground">{rank}</span>
                              </div>
                              <div className="text-[10px] font-medium text-foreground">{product.name}</div>
                              <div className="text-[10px] text-muted-foreground">{product.category}</div>
                              <div className="text-[10px] text-muted-foreground">${product.marketSize}B</div>
                              <div className="text-[10px] font-semibold text-primary tabular-nums">{product.marketGrowth}%</div>
                            </div>);
                              })}
                      </div>
                    </div>
                  </div>
                  </TooltipProvider>
                      }
              </div>

              {/* Explore Pathways action bar */}
              {selectedOpportunityItems.size > 0 && (
                <div className="flex items-center justify-between pt-3 border-t border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      <span className="font-bold text-foreground">{selectedOpportunityItems.size}</span> {opportunityTab === 'feedstocks' ? 'feedstock' : opportunityTab === 'technologies' ? 'technolog' : opportunityTab === 'products' ? 'product' : 'application'}{selectedOpportunityItems.size > 1 ? (opportunityTab === 'technologies' ? 'ies' : 's') : (opportunityTab === 'technologies' ? 'y' : '')} selected
                    </span>
                    <button onClick={() => setSelectedOpportunityItems(new Set())} className="text-[10px] text-muted-foreground hover:text-foreground underline">
                      Clear
                    </button>
                  </div>
                  <Button size="sm" className="gap-1.5 h-7 text-xs bg-foreground text-background hover:bg-foreground/90" onClick={handleExploreFilteredPathways}>
                    <ArrowRight className="w-3.5 h-3.5" />
                    Explore Pathways
                  </Button>
                </div>
              )}
              </div>
              </div>
              </div>
            </div>

            {/* LANDSCAPE ANALYTICS - Right Sidebar */}
             <div className="space-y-1.5">
              
              <button
                onClick={() => navigate(`/landscape/${category}/${topic}/market-activity`)}
                className="w-full rounded-lg border border-border/60 bg-card px-4 py-3 text-left hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-foreground">Market Players</span>
                  <span className="text-xs font-bold text-primary tabular-nums">1,384</span>
                </div>
                <p className="text-[9px] text-muted-foreground mt-0.5">Companies & startups across the value chain</p>
              </button>

              <button
                onClick={() => navigate(`/landscape/${category}/${topic}/patents`)}
                className="w-full rounded-lg border border-border/60 bg-card px-4 py-3 text-left hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-foreground">IP Landscape</span>
                  <span className="text-xs font-bold text-primary tabular-nums">{isProductRoute ? '890' : '1,240'}</span>
                </div>
                <p className="text-[9px] text-muted-foreground mt-0.5">Patents & intellectual property filings</p>
              </button>

              <button
                onClick={() => navigate(`/landscape/${category}/${topic}/publications`)}
                className="w-full rounded-lg border border-border/60 bg-card px-4 py-3 text-left hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-foreground">Research Landscape</span>
                  <span className="text-xs font-bold text-primary tabular-nums">{isProductRoute ? '2,150' : '3,800'}</span>
                </div>
                <p className="text-[9px] text-muted-foreground mt-0.5">Scientific publications & academic research</p>
              </button>

              <button disabled className="w-full rounded-lg border border-border/40 bg-card px-4 py-3 text-left opacity-50 cursor-default">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-foreground">Regulation</span>
                  <Badge variant="outline" className="text-[8px] px-1.5 py-0 border-muted-foreground/30 text-muted-foreground font-normal">Soon</Badge>
                </div>
                <p className="text-[9px] text-muted-foreground mt-0.5">Regulatory frameworks & compliance</p>
              </button>

              <div className="pt-1">
                <p className="text-[9px] text-muted-foreground/60 text-right"><span className="font-semibold text-muted-foreground/80">5,560+</span> records | Updated Sep 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>);

};

export default ValueChain;