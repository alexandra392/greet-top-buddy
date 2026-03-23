import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Calendar, FileText, Filter, Download, Globe, FlaskConical, ShoppingBag, Leaf, Cpu, ChevronRight, ChevronDown, Search, X, Beaker, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, ScatterChart, Scatter, ZAxis, Tooltip, Legend, BarChart, Bar } from "recharts";
import worldPatentMap from '@/assets/world-patent-map.png';

type PatentView = 'feedstock' | 'technology' | 'production' | 'applications' | 'products';

// ── View Configurations ──
const viewConfigs: Record<PatentView, {
  label: string;
  icon: typeof FlaskConical;
  description: (topic: string) => string;
  trendData: {year: string;US: number;EU: number;Other: number;}[];
  cpcData: {code: string;name: string;count: number;color: string;}[];
  pieData: {name: string;value: number;fill: string;}[];
  patents: {title: string;company: string;filingYear: number;grantedYear: number | null;status: string;jurisdiction: number;}[];
  geoData: {location: string;countries: string;total: number;granted: number;filed: number;}[];
  developers: {org: string;total: number;granted: number;filed: number;}[];
  trendDescription: (topic: string) => string;
  developerLabel: string;
  developerDescription: string;
  geoDescription: string;
  cpcDescription: string;
  patentDescription: string;
  totalPatents: string;
  filedCount: string;
  grantedCount: string;
  sectors?: {name: string;patents: number;share: string;cagr: string;borderColor: string;cagrColor: string;shareColor: string;subs: {n: string;v: number;}[];}[][];
  productionSectorGroups?: {label: string; sectors: {name: string;patents: number;share: string;cagr: string;borderColor: string;cagrColor: string;shareColor: string;subs: {n: string;v: number;}[];}[];}[];
  sectorTitle: string;
  heatMatrixTitle: string;
  heatMatrixRows?: {name: string;total: number;values: number[];children?: {name: string;total: number;values: number[];}[];}[];
  feedstockHeatMatrixRows?: {name: string;total: number;values: number[];children?: {name: string;total: number;values: number[];}[];}[];
  bubbleTitle: string;
  bubbleSubtitle: string;
  bubbleData?: {name: string;patentVolume: number;hhi: number;growth: number;fill: string;}[];
  concentration?: {hhi: string;hhiLabel: string;top5: string;top10: string;gini: string;};
}> = {
  feedstock: {
    label: "Feedstock & Biomass",
    icon: Leaf,
    description: (topic) => `Patents related to the sourcing, preprocessing, and supply of biomass feedstocks for ${topic} production.`,
    trendData: [
    { year: '2014', US: 10, EU: 18, Other: 6 },
    { year: '2015', US: 13, EU: 22, Other: 8 },
    { year: '2016', US: 16, EU: 27, Other: 10 },
    { year: '2017', US: 19, EU: 32, Other: 12 },
    { year: '2018', US: 23, EU: 37, Other: 15 },
    { year: '2019', US: 28, EU: 42, Other: 18 },
    { year: '2020', US: 35, EU: 52, Other: 24 },
    { year: '2021', US: 48, EU: 65, Other: 32 },
    { year: '2022', US: 58, EU: 78, Other: 40 },
    { year: '2023', US: 68, EU: 92, Other: 48 }],

    cpcData: [
    { code: "A", name: "Human Necessities", count: 72089, color: "bg-purple-500" },
    { code: "B", name: "Performing Operations; Transporting", count: 17168, color: "bg-orange-500" },
    { code: "C", name: "Chemistry; Metallurgy", count: 99888, color: "bg-pink-400" },
    { code: "D", name: "Textiles; Paper", count: 2025, color: "bg-gray-800" },
    { code: "E", name: "Fixed Constructions", count: 1526, color: "bg-sky-500" },
    { code: "F", name: "Mechanical Engineering; Lighting; Heating; Weapons; Blasting", count: 1325, color: "bg-blue-600" },
    { code: "G", name: "Physics", count: 13965, color: "bg-orange-400" },
    { code: "H", name: "Electricity", count: 15299, color: "bg-red-700" },
    { code: "Y", name: "General Tagging of New Technological Developments; General Tagging of Cross-...", count: 1192, color: "bg-yellow-400" }],

    pieData: [
    { name: "A", value: 72089, fill: "#8b5cf6" },
    { name: "B", value: 17168, fill: "#f97316" },
    { name: "C", value: 99888, fill: "#f472b6" },
    { name: "D", value: 2025, fill: "#1f2937" },
    { name: "E", value: 1526, fill: "#0ea5e9" },
    { name: "F", value: 1325, fill: "#2563eb" },
    { name: "G", value: 13965, fill: "#fb923c" },
    { name: "H", value: 15299, fill: "#b91c1c" },
    { name: "Y", value: 1192, fill: "#facc15" }],

    patents: [
    { title: "High-Yield Corn Stover Harvesting Method", company: "Deere & Company", filingYear: 2023, grantedYear: null, status: "Filed", jurisdiction: 7 },
    { title: "Lignocellulosic Biomass Quality Grading System", company: "ANDRITZ AG", filingYear: 2022, grantedYear: 2023, status: "Granted", jurisdiction: 12 },
    { title: "Sugar Beet Pulp Pre-treatment for Pentose Recovery", company: "Südzucker AG", filingYear: 2023, grantedYear: null, status: "Filed", jurisdiction: 5 },
    { title: "Automated Biomass Moisture Content Analyser", company: "Metso Outotec", filingYear: 2022, grantedYear: 2023, status: "Granted", jurisdiction: 9 },
    { title: "Integrated Crop-Biorefinery Logistics Platform", company: "ADM", filingYear: 2023, grantedYear: null, status: "Filed", jurisdiction: 4 }],

    geoData: [
    { location: "North America", countries: "3 countries", total: 60394, granted: 9126, filed: 51268 },
    { location: "Asia", countries: "12 countries", total: 57635, granted: 9746, filed: 47889 },
    { location: "Europe", countries: "16 countries", total: 29019, granted: 7693, filed: 21326 },
    { location: "Oceania", countries: "4 countries", total: 1134, granted: 229, filed: 905 },
    { location: "South America", countries: "6 countries", total: 2840, granted: 512, filed: 2328 }],

    developers: [
    { org: "Deere & Company", total: 72, granted: 48, filed: 24 },
    { org: "ANDRITZ AG", total: 58, granted: 40, filed: 18 },
    { org: "Südzucker AG", total: 45, granted: 30, filed: 15 },
    { org: "ADM", total: 38, granted: 24, filed: 14 },
    { org: "Metso Outotec", total: 32, granted: 20, filed: 12 },
    { org: "Bühler Group", total: 28, granted: 18, filed: 10 },
    { org: "Cargill Inc.", total: 25, granted: 16, filed: 9 },
    { org: "POET LLC", total: 22, granted: 14, filed: 8 },
    { org: "Raízen S.A.", total: 19, granted: 12, filed: 7 },
    { org: "Verbio AG", total: 16, granted: 10, filed: 6 }],

    trendDescription: (topic) => `Filing trends for patents covering biomass feedstock sourcing, preprocessing, and supply chain innovations for ${topic}.`,
    developerLabel: "Feedstock",
    developerDescription: "Top organisations filing patents for biomass feedstock sourcing and preprocessing technologies.",
    geoDescription: "Where feedstock and biomass sourcing IP is being filed. Explore regional patent intensity for supply chain innovations.",
    cpcDescription: "CPC classification breakdown for feedstock-related patents. Agriculture & Human Necessities dominates biomass sourcing IP.",
    patentDescription: "Most recent patent filings for feedstock sourcing and biomass preprocessing.",
    totalPatents: '4,180',
    filedCount: '2,890',
    grantedCount: '1,290',
    sectorTitle: "Feedstock Sectors",
    heatMatrixTitle: "Feedstock Heat Matrix",
    bubbleTitle: "Feedstock Concentration & Supply Map",
    bubbleSubtitle: "Patent volume × HHI · Bubble size = growth rate",
    sectors: [
    [
    { name: 'Lignocellulosic', patents: 1280, share: '30.6%', cagr: '+18.4%', borderColor: 'border-l-[hsl(142,60%,40%)]', cagrColor: 'text-[hsl(142,60%,40%)]', shareColor: 'text-[hsl(142,60%,40%)]', subs: [{ n: 'Corn Stover', v: 480 }, { n: 'Wheat Straw', v: 390 }, { n: 'Wood Chips', v: 280 }] },
    { name: 'Sugar Crops', patents: 980, share: '23.4%', cagr: '+14.2%', borderColor: 'border-l-[hsl(36,95%,54%)]', cagrColor: 'text-[hsl(36,95%,54%)]', shareColor: 'text-[hsl(36,95%,54%)]', subs: [{ n: 'Sugar Beet Pulp', v: 420 }, { n: 'Sugarcane Bagasse', v: 340 }, { n: 'Sweet Sorghum', v: 220 }] },
    { name: 'Forestry Residues', patents: 720, share: '17.2%', cagr: '+11.8%', borderColor: 'border-l-[hsl(25,80%,50%)]', cagrColor: 'text-[hsl(25,80%,50%)]', shareColor: 'text-[hsl(25,80%,50%)]', subs: [{ n: 'Hardwood', v: 310 }, { n: 'Softwood', v: 240 }, { n: 'Bark & Branches', v: 170 }] }],

    [
    { name: 'Agricultural Waste', patents: 540, share: '12.9%', cagr: '+21.3%', borderColor: 'border-l-[hsl(262,83%,58%)]', cagrColor: 'text-[hsl(262,83%,58%)]', shareColor: 'text-[hsl(262,83%,58%)]', subs: [{ n: 'Rice Husks', v: 210 }, { n: 'Coconut Shells', v: 180 }, { n: 'Palm EFB', v: 150 }] },
    { name: 'Algae & Aquatic', patents: 380, share: '9.1%', cagr: '+28.5%', borderColor: 'border-l-[hsl(195,70%,50%)]', cagrColor: 'text-[hsl(195,70%,50%)]', shareColor: 'text-[hsl(195,70%,50%)]', subs: [{ n: 'Microalgae', v: 180 }, { n: 'Seaweed', v: 120 }, { n: 'Duckweed', v: 80 }] },
    { name: 'Municipal Waste', patents: 280, share: '6.7%', cagr: '+16.7%', borderColor: 'border-l-[hsl(340,50%,55%)]', cagrColor: 'text-[hsl(340,50%,55%)]', shareColor: 'text-[hsl(340,50%,55%)]', subs: [{ n: 'Food Waste', v: 130 }, { n: 'Paper Waste', v: 90 }, { n: 'Garden Waste', v: 60 }] }]],


    heatMatrixRows: [
    { name: 'Lignocellulosic', total: 820, values: [140, 160, 175, 190, 155] },
    { name: 'Sugar Crops', total: 580, values: [100, 112, 125, 135, 108] },
    { name: 'Forestry Residues', total: 440, values: [78, 85, 92, 98, 87] },
    { name: 'Agricultural Waste', total: 350, values: [60, 68, 75, 82, 65] },
    { name: 'Algae & Aquatic', total: 260, values: [40, 50, 55, 62, 53] },
    { name: 'Municipal Waste', total: 180, values: [30, 34, 38, 42, 36] }],

    bubbleData: [
    { name: 'Lignocellulosic', patentVolume: 1280, hhi: 0.035, growth: 18.4, fill: 'hsl(142 60% 40%)' },
    { name: 'Sugar Crops', patentVolume: 980, hhi: 0.042, growth: 14.2, fill: 'hsl(36 95% 54%)' },
    { name: 'Forestry', patentVolume: 720, hhi: 0.058, growth: 11.8, fill: 'hsl(25 80% 50%)' },
    { name: 'Agri Waste', patentVolume: 540, hhi: 0.088, growth: 21.3, fill: 'hsl(262 83% 58%)' },
    { name: 'Algae', patentVolume: 380, hhi: 0.105, growth: 28.5, fill: 'hsl(195 70% 50%)' },
    { name: 'Municipal', patentVolume: 280, hhi: 0.12, growth: 16.7, fill: 'hsl(340 50% 55%)' }],

    concentration: { hhi: '0.098', hhiLabel: 'Fragmented', top5: '54.8%', top10: '74.2%', gini: '0.48' }
  },
  technology: {
    label: "Process & Engineering",
    icon: Cpu,
    description: (topic) => `Patents related to conversion technologies, process engineering, and novel methods for ${topic} manufacturing.`,
    trendData: [
    { year: '2014', US: 15, EU: 12, Other: 8 },
    { year: '2015', US: 20, EU: 16, Other: 10 },
    { year: '2016', US: 26, EU: 22, Other: 13 },
    { year: '2017', US: 32, EU: 28, Other: 16 },
    { year: '2018', US: 38, EU: 33, Other: 19 },
    { year: '2019', US: 45, EU: 38, Other: 22 },
    { year: '2020', US: 55, EU: 48, Other: 28 },
    { year: '2021', US: 72, EU: 62, Other: 38 },
    { year: '2022', US: 88, EU: 76, Other: 48 },
    { year: '2023', US: 102, EU: 90, Other: 58 }],

    cpcData: [
    { code: "A", name: "Human Necessities", count: 45230, color: "bg-purple-500" },
    { code: "B", name: "Performing Operations; Transporting", count: 22450, color: "bg-orange-500" },
    { code: "C", name: "Chemistry; Metallurgy", count: 85640, color: "bg-pink-400" },
    { code: "D", name: "Textiles; Paper", count: 1840, color: "bg-gray-800" },
    { code: "E", name: "Fixed Constructions", count: 2180, color: "bg-sky-500" },
    { code: "F", name: "Mechanical Engineering; Lighting; Heating; Weapons; Blasting", count: 3920, color: "bg-blue-600" },
    { code: "G", name: "Physics", count: 18760, color: "bg-orange-400" },
    { code: "H", name: "Electricity", count: 12340, color: "bg-red-700" },
    { code: "Y", name: "General Tagging of New Technological Developments; General Tagging of Cross-...", count: 980, color: "bg-yellow-400" }],

    pieData: [
    { name: "A", value: 45230, fill: "#8b5cf6" },
    { name: "B", value: 22450, fill: "#f97316" },
    { name: "C", value: 85640, fill: "#f472b6" },
    { name: "D", value: 1840, fill: "#1f2937" },
    { name: "E", value: 2180, fill: "#0ea5e9" },
    { name: "F", value: 3920, fill: "#2563eb" },
    { name: "G", value: 18760, fill: "#fb923c" },
    { name: "H", value: 12340, fill: "#b91c1c" },
    { name: "Y", value: 980, fill: "#facc15" }],

    patents: [
    { title: "Continuous Flow Enzymatic Reactor Design", company: "Novozymes A/S", filingYear: 2023, grantedYear: null, status: "Filed", jurisdiction: 14 },
    { title: "AI-Optimised Fermentation Control System", company: "Siemens AG", filingYear: 2022, grantedYear: 2023, status: "Granted", jurisdiction: 11 },
    { title: "Membrane Electrodialysis for Sugar Separation", company: "Nouryon", filingYear: 2023, grantedYear: null, status: "Filed", jurisdiction: 6 },
    { title: "Supercritical CO₂ Extraction of Hemicellulose", company: "Linde plc", filingYear: 2022, grantedYear: 2023, status: "Granted", jurisdiction: 9 },
    { title: "Catalytic Dehydration Process for Furfural", company: "Clariant AG", filingYear: 2023, grantedYear: null, status: "Filed", jurisdiction: 8 }],

    geoData: [
    { location: "North America", countries: "3 countries", total: 52180, granted: 8340, filed: 43840 },
    { location: "Asia", countries: "14 countries", total: 48920, granted: 7850, filed: 41070 },
    { location: "Europe", countries: "19 countries", total: 31450, granted: 8120, filed: 23330 },
    { location: "Oceania", countries: "4 countries", total: 980, granted: 195, filed: 785 },
    { location: "South America", countries: "5 countries", total: 2310, granted: 420, filed: 1890 }],

    developers: [
    { org: "Novozymes A/S", total: 82, granted: 58, filed: 24 },
    { org: "Siemens AG", total: 64, granted: 42, filed: 22 },
    { org: "Clariant AG", total: 51, granted: 35, filed: 16 },
    { org: "Nouryon", total: 42, granted: 28, filed: 14 },
    { org: "Linde plc", total: 35, granted: 22, filed: 13 },
    { org: "Genomatica Inc.", total: 30, granted: 19, filed: 11 },
    { org: "DSM-Firmenich", total: 27, granted: 17, filed: 10 },
    { org: "Evonik Industries", total: 23, granted: 15, filed: 8 },
    { org: "Haldor Topsøe", total: 20, granted: 13, filed: 7 },
    { org: "Johnson Matthey", total: 17, granted: 11, filed: 6 }],

    trendDescription: (topic) => `Filing trends for patents covering conversion technologies, process engineering, and manufacturing methods for ${topic}.`,
    developerLabel: "Process",
    developerDescription: "Top organisations filing patents for conversion technologies and process innovations.",
    geoDescription: "Where technology and process engineering IP is being filed. Explore regional patent intensity for manufacturing innovations.",
    cpcDescription: "CPC classification breakdown for technology-related patents. Chemistry & Metallurgy dominates process innovation IP.",
    patentDescription: "Most recent patent filings for conversion technologies and process engineering.",
    totalPatents: '5,640',
    filedCount: '3,720',
    grantedCount: '1,920',
    sectorTitle: "Technology Sectors",
    heatMatrixTitle: "Technology Heat Matrix",
    bubbleTitle: "Technology Concentration & Process Map",
    bubbleSubtitle: "Patent volume × HHI · Bubble size = growth rate",
    sectors: [
    [
    { name: 'Enzymatic Hydrolysis', patents: 1450, share: '25.7%', cagr: '+19.2%', borderColor: 'border-l-[hsl(152,60%,40%)]', cagrColor: 'text-[hsl(152,60%,40%)]', shareColor: 'text-[hsl(152,60%,40%)]', subs: [{ n: 'Cellulase Systems', v: 580 }, { n: 'Hemicellulase', v: 480 }, { n: 'Enzyme Engineering', v: 390 }] },
    { name: 'Chemical Catalysis', patents: 1180, share: '20.9%', cagr: '+15.4%', borderColor: 'border-l-[hsl(217,91%,60%)]', cagrColor: 'text-[hsl(217,91%,60%)]', shareColor: 'text-[hsl(217,91%,60%)]', subs: [{ n: 'Acid Catalysis', v: 450 }, { n: 'Metal Catalysts', v: 380 }, { n: 'Ionic Liquids', v: 350 }] },
    { name: 'Fermentation', patents: 920, share: '16.3%', cagr: '+22.8%', borderColor: 'border-l-[hsl(262,83%,58%)]', cagrColor: 'text-[hsl(262,83%,58%)]', shareColor: 'text-[hsl(262,83%,58%)]', subs: [{ n: 'Yeast Engineering', v: 380 }, { n: 'Bacterial Pathways', v: 310 }, { n: 'Co-fermentation', v: 230 }] }],

    [
    { name: 'Separation & Purification', patents: 780, share: '13.8%', cagr: '+17.1%', borderColor: 'border-l-[hsl(36,95%,54%)]', cagrColor: 'text-[hsl(36,95%,54%)]', shareColor: 'text-[hsl(36,95%,54%)]', subs: [{ n: 'Membrane Tech', v: 320 }, { n: 'Chromatography', v: 260 }, { n: 'Crystallisation', v: 200 }] },
    { name: 'Pretreatment', patents: 680, share: '12.1%', cagr: '+13.5%', borderColor: 'border-l-[hsl(340,50%,55%)]', cagrColor: 'text-[hsl(340,50%,55%)]', shareColor: 'text-[hsl(340,50%,55%)]', subs: [{ n: 'Steam Explosion', v: 280 }, { n: 'Organosolv', v: 220 }, { n: 'Ammonia Fibre', v: 180 }] },
    { name: 'Process Integration', patents: 630, share: '11.2%', cagr: '+25.6%', borderColor: 'border-l-[hsl(160,50%,45%)]', cagrColor: 'text-[hsl(160,50%,45%)]', shareColor: 'text-[hsl(160,50%,45%)]', subs: [{ n: 'Biorefinery Design', v: 260 }, { n: 'Heat Integration', v: 200 }, { n: 'Water Recycling', v: 170 }] }]],


    heatMatrixRows: [
    { name: 'Enzymatic Hydrolysis', total: 890, values: [155, 170, 185, 200, 180] },
    { name: 'Chemical Catalysis', total: 720, values: [130, 140, 150, 160, 140] },
    { name: 'Fermentation', total: 610, values: [105, 118, 128, 140, 119] },
    { name: 'Separation', total: 490, values: [88, 95, 102, 110, 95] },
    { name: 'Pretreatment', total: 420, values: [78, 82, 88, 92, 80] },
    { name: 'Process Integration', total: 380, values: [62, 72, 80, 88, 78] }],

    bubbleData: [
    { name: 'Enzymatic', patentVolume: 1450, hhi: 0.032, growth: 19.2, fill: 'hsl(152 60% 40%)' },
    { name: 'Catalysis', patentVolume: 1180, hhi: 0.038, growth: 15.4, fill: 'hsl(217 91% 60%)' },
    { name: 'Fermentation', patentVolume: 920, hhi: 0.055, growth: 22.8, fill: 'hsl(262 83% 58%)' },
    { name: 'Separation', patentVolume: 780, hhi: 0.072, growth: 17.1, fill: 'hsl(36 95% 54%)' },
    { name: 'Pretreatment', patentVolume: 680, hhi: 0.085, growth: 13.5, fill: 'hsl(340 50% 55%)' },
    { name: 'Integration', patentVolume: 630, hhi: 0.098, growth: 25.6, fill: 'hsl(160 50% 45%)' }],

    concentration: { hhi: '0.112', hhiLabel: 'Moderately Fragmented', top5: '58.2%', top10: '77.8%', gini: '0.51' }
  },
  production: {
    label: "Production & Extraction",
    icon: FlaskConical,
    description: (topic) => `Patents related to the production, extraction, and purification of ${topic} from biomass feedstocks.`,
    trendData: [
    { year: '2014', US: 18, EU: 10, Other: 7 },
    { year: '2015', US: 24, EU: 14, Other: 9 },
    { year: '2016', US: 30, EU: 18, Other: 12 },
    { year: '2017', US: 36, EU: 22, Other: 15 },
    { year: '2018', US: 43, EU: 26, Other: 18 },
    { year: '2019', US: 50, EU: 30, Other: 20 },
    { year: '2020', US: 60, EU: 40, Other: 25 },
    { year: '2021', US: 80, EU: 55, Other: 35 },
    { year: '2022', US: 95, EU: 70, Other: 45 },
    { year: '2023', US: 110, EU: 85, Other: 55 }],

    cpcData: [
    { code: "A", name: "Human Necessities", count: 38420, color: "bg-purple-500" },
    { code: "B", name: "Performing Operations; Transporting", count: 19850, color: "bg-orange-500" },
    { code: "C", name: "Chemistry; Metallurgy", count: 76530, color: "bg-pink-400" },
    { code: "D", name: "Textiles; Paper", count: 4180, color: "bg-gray-800" },
    { code: "E", name: "Fixed Constructions", count: 1120, color: "bg-sky-500" },
    { code: "F", name: "Mechanical Engineering; Lighting; Heating; Weapons; Blasting", count: 2640, color: "bg-blue-600" },
    { code: "G", name: "Physics", count: 11290, color: "bg-orange-400" },
    { code: "H", name: "Electricity", count: 9870, color: "bg-red-700" },
    { code: "Y", name: "General Tagging of New Technological Developments; General Tagging of Cross-...", count: 1450, color: "bg-yellow-400" }],

    pieData: [
    { name: "A", value: 38420, fill: "#8b5cf6" },
    { name: "B", value: 19850, fill: "#f97316" },
    { name: "C", value: 76530, fill: "#f472b6" },
    { name: "D", value: 4180, fill: "#1f2937" },
    { name: "E", value: 1120, fill: "#0ea5e9" },
    { name: "F", value: 2640, fill: "#2563eb" },
    { name: "G", value: 11290, fill: "#fb923c" },
    { name: "H", value: 9870, fill: "#b91c1c" },
    { name: "Y", value: 1450, fill: "#facc15" }],

    patents: [
    { title: "Preservative System for Emulsion-based Therapeutic Topical Formulations", company: "Arbor Pharmaceuticals, Llc", filingYear: 2023, grantedYear: null, status: "Filed", jurisdiction: 8 },
    { title: "Lactic Bacterium With Modified Galactokinase Expression for Texturizing Food Products by Overexpression of Exopolysaccharide", company: "Chr. Hansen A/s", filingYear: 2022, grantedYear: 2023, status: "Granted", jurisdiction: 15 },
    { title: "Hard Capsule Formulation", company: "Capsugel Belgium Nv", filingYear: 2023, grantedYear: null, status: "Filed", jurisdiction: 5 },
    { title: "Methods for Enhancing Microbial Production of Specific Length Fatty Alcohols in the Presence of Methanol", company: "Genomatica, Inc.", filingYear: 2022, grantedYear: 2023, status: "Granted", jurisdiction: 12 },
    { title: "Process for Obtaining Nanocomposite Food Packages", company: "Universitatea Tehnica Din Cluj-napoca, Centrul Universitar Nord Din Baia Mare", filingYear: 2023, grantedYear: null, status: "Filed", jurisdiction: 4 },
    { title: "Pyrimidinyloxy Benzene Derivatives as Herbicidal Compounds", company: "BASF SE", filingYear: 2021, grantedYear: 2022, status: "Granted", jurisdiction: 9 }],

    geoData: [
    { location: "North America", countries: "3 countries", total: 44250, granted: 7180, filed: 37070 },
    { location: "Asia", countries: "12 countries", total: 41890, granted: 6920, filed: 34970 },
    { location: "Europe", countries: "18 countries", total: 26780, granted: 6950, filed: 19830 },
    { location: "Oceania", countries: "4 countries", total: 890, granted: 178, filed: 712 },
    { location: "South America", countries: "5 countries", total: 1950, granted: 365, filed: 1585 }],

    developers: [
    { org: "Novozymes A/S", total: 87, granted: 64, filed: 23 },
    { org: "BASF SE", total: 72, granted: 48, filed: 24 },
    { org: "Valmet Corp.", total: 55, granted: 38, filed: 17 },
    { org: "UPM-Kymmene Oyj", total: 43, granted: 31, filed: 12 },
    { org: "DuPont de Nemours", total: 38, granted: 25, filed: 13 },
    { org: "Borregaard ASA", total: 33, granted: 21, filed: 12 },
    { org: "Lenzing AG", total: 29, granted: 19, filed: 10 },
    { org: "Stora Enso", total: 24, granted: 15, filed: 9 },
    { org: "Arkema S.A.", total: 20, granted: 13, filed: 7 },
    { org: "Corbion N.V.", total: 17, granted: 11, filed: 6 }],

    trendDescription: (topic) => `Filing trends for patents covering ${topic} production processes, extraction methods, and purification technologies.`,
    developerLabel: "Process",
    developerDescription: "Organisations with the largest IP portfolios",
    geoDescription: "Where production and extraction IP is being filed. Explore regional patent intensity for manufacturing technologies.",
    cpcDescription: "CPC classification breakdown for production-related patents. Chemistry & Metallurgy dominates extraction IP.",
    patentDescription: "Most recent patent filings for production and extraction processes.",
    totalPatents: '6,421',
    filedCount: '4,832',
    grantedCount: '1,589',
    sectorTitle: "IP HOTSPOTS",
    heatMatrixTitle: "IP HEAT MATRIX",
    bubbleTitle: "Production Concentration & Process Map",
    bubbleSubtitle: "Patent volume × HHI · Bubble size = growth rate",
    sectors: [
    [
    { name: 'Fermentation', patents: 1820, share: '28.3%', cagr: '+20.1%', borderColor: 'border-l-[hsl(142,60%,40%)]', cagrColor: 'text-[hsl(142,60%,40%)]', shareColor: 'text-[hsl(142,60%,40%)]', subs: [{ n: 'Batch Fermentation', v: 720 }, { n: 'Continuous Fermentation', v: 580 }, { n: 'Fed-batch Systems', v: 520 }] },
    { name: 'Catalytic Conversion', patents: 1340, share: '20.9%', cagr: '+16.5%', borderColor: 'border-l-[hsl(217,91%,60%)]', cagrColor: 'text-[hsl(217,91%,60%)]', shareColor: 'text-[hsl(217,91%,60%)]', subs: [{ n: 'Heterogeneous Catalysis', v: 520 }, { n: 'Homogeneous Catalysis', v: 440 }, { n: 'Biocatalysis', v: 380 }] },
    { name: 'Extraction & Separation', patents: 1080, share: '16.8%', cagr: '+18.7%', borderColor: 'border-l-[hsl(262,83%,58%)]', cagrColor: 'text-[hsl(262,83%,58%)]', shareColor: 'text-[hsl(262,83%,58%)]', subs: [{ n: 'Membrane Separation', v: 420 }, { n: 'Solvent Extraction', v: 360 }, { n: 'Distillation', v: 300 }] }],
    [
    { name: 'Purification', patents: 890, share: '13.9%', cagr: '+14.3%', borderColor: 'border-l-[hsl(36,95%,54%)]', cagrColor: 'text-[hsl(36,95%,54%)]', shareColor: 'text-[hsl(36,95%,54%)]', subs: [{ n: 'Crystallisation', v: 340 }, { n: 'Chromatography', v: 300 }, { n: 'Ion Exchange', v: 250 }] },
    { name: 'Enzymatic Hydrolysis', patents: 720, share: '11.2%', cagr: '+22.4%', borderColor: 'border-l-[hsl(195,70%,50%)]', cagrColor: 'text-[hsl(195,70%,50%)]', shareColor: 'text-[hsl(195,70%,50%)]', subs: [{ n: 'Cellulase Systems', v: 290 }, { n: 'Hemicellulase', v: 240 }, { n: 'Enzyme Cocktails', v: 190 }] },
    { name: 'Thermochemical', patents: 571, share: '8.9%', cagr: '+12.8%', borderColor: 'border-l-[hsl(340,50%,55%)]', cagrColor: 'text-[hsl(340,50%,55%)]', shareColor: 'text-[hsl(340,50%,55%)]', subs: [{ n: 'Pyrolysis', v: 230 }, { n: 'Gasification', v: 190 }, { n: 'Hydrothermal', v: 151 }] }]],

    productionSectorGroups: [
      {
        label: 'Feedstock',
        sectors: [
          { name: 'Lignocellulosic Biomass', patents: 1420, share: '22.1%', cagr: '+17.8%', borderColor: 'border-l-[hsl(142,60%,40%)]', cagrColor: 'text-[hsl(142,60%,40%)]', shareColor: 'text-[hsl(142,60%,40%)]', subs: [{ n: 'Corn Stover', v: 520 }, { n: 'Wheat Straw', v: 460 }, { n: 'Wood Chips', v: 440 }] },
          { name: 'Sugar Crops', patents: 1180, share: '18.4%', cagr: '+14.6%', borderColor: 'border-l-[hsl(36,95%,54%)]', cagrColor: 'text-[hsl(36,95%,54%)]', shareColor: 'text-[hsl(36,95%,54%)]', subs: [{ n: 'Sugar Beet Pulp', v: 490 }, { n: 'Sugarcane Bagasse', v: 380 }, { n: 'Sweet Sorghum', v: 310 }] },
          { name: 'Starch Sources', patents: 860, share: '13.4%', cagr: '+11.2%', borderColor: 'border-l-[hsl(262,83%,58%)]', cagrColor: 'text-[hsl(262,83%,58%)]', shareColor: 'text-[hsl(262,83%,58%)]', subs: [{ n: 'Corn Starch', v: 360 }, { n: 'Potato Starch', v: 280 }, { n: 'Cassava Starch', v: 220 }] },
          { name: 'Food Waste', patents: 680, share: '10.6%', cagr: '+24.3%', borderColor: 'border-l-[hsl(195,70%,50%)]', cagrColor: 'text-[hsl(195,70%,50%)]', shareColor: 'text-[hsl(195,70%,50%)]', subs: [{ n: 'Bread Waste', v: 280 }, { n: 'Fruit Pomace', v: 220 }, { n: 'Coffee Grounds', v: 180 }] },
          { name: 'Algal Biomass', patents: 540, share: '8.4%', cagr: '+28.1%', borderColor: 'border-l-[hsl(170,60%,45%)]', cagrColor: 'text-[hsl(170,60%,45%)]', shareColor: 'text-[hsl(170,60%,45%)]', subs: [{ n: 'Microalgae', v: 260 }, { n: 'Macroalgae', v: 160 }, { n: 'Cyanobacteria', v: 120 }] },
          { name: 'Oilseed Crops', patents: 420, share: '6.5%', cagr: '+9.8%', borderColor: 'border-l-[hsl(45,90%,50%)]', cagrColor: 'text-[hsl(45,90%,50%)]', shareColor: 'text-[hsl(45,90%,50%)]', subs: [{ n: 'Rapeseed', v: 180 }, { n: 'Soybean', v: 140 }, { n: 'Palm Kernel', v: 100 }] },
        ]
      },
      {
        label: 'Process',
        sectors: [
          { name: 'Fermentation', patents: 1820, share: '28.3%', cagr: '+20.1%', borderColor: 'border-l-[hsl(217,91%,60%)]', cagrColor: 'text-[hsl(217,91%,60%)]', shareColor: 'text-[hsl(217,91%,60%)]', subs: [{ n: 'Batch Fermentation', v: 720 }, { n: 'Continuous Fermentation', v: 580 }, { n: 'Fed-batch Systems', v: 520 }] },
          { name: 'Catalytic Conversion', patents: 1340, share: '20.9%', cagr: '+16.5%', borderColor: 'border-l-[hsl(195,70%,50%)]', cagrColor: 'text-[hsl(195,70%,50%)]', shareColor: 'text-[hsl(195,70%,50%)]', subs: [{ n: 'Heterogeneous Catalysis', v: 520 }, { n: 'Homogeneous Catalysis', v: 440 }, { n: 'Biocatalysis', v: 380 }] },
          { name: 'Extraction & Separation', patents: 1080, share: '16.8%', cagr: '+18.7%', borderColor: 'border-l-[hsl(340,50%,55%)]', cagrColor: 'text-[hsl(340,50%,55%)]', shareColor: 'text-[hsl(340,50%,55%)]', subs: [{ n: 'Membrane Separation', v: 420 }, { n: 'Solvent Extraction', v: 360 }, { n: 'Distillation', v: 300 }] },
          { name: 'Purification', patents: 890, share: '13.9%', cagr: '+14.3%', borderColor: 'border-l-[hsl(36,95%,54%)]', cagrColor: 'text-[hsl(36,95%,54%)]', shareColor: 'text-[hsl(36,95%,54%)]', subs: [{ n: 'Crystallisation', v: 340 }, { n: 'Chromatography', v: 300 }, { n: 'Ion Exchange', v: 250 }] },
          { name: 'Enzymatic Hydrolysis', patents: 720, share: '11.2%', cagr: '+22.4%', borderColor: 'border-l-[hsl(262,83%,58%)]', cagrColor: 'text-[hsl(262,83%,58%)]', shareColor: 'text-[hsl(262,83%,58%)]', subs: [{ n: 'Cellulase Systems', v: 290 }, { n: 'Hemicellulase', v: 240 }, { n: 'Enzyme Cocktails', v: 190 }] },
          { name: 'Thermochemical', patents: 571, share: '8.9%', cagr: '+12.8%', borderColor: 'border-l-[hsl(340,50%,55%)]', cagrColor: 'text-[hsl(340,50%,55%)]', shareColor: 'text-[hsl(340,50%,55%)]', subs: [{ n: 'Pyrolysis', v: 230 }, { n: 'Gasification', v: 190 }, { n: 'Hydrothermal', v: 151 }] },
        ]
      }
    ],

    heatMatrixRows: [
    { name: 'Fermentation', total: 1120, values: [190, 210, 230, 250, 240], children: [
      { name: 'Microbial Fermentation', total: 480, values: [78, 88, 98, 108, 108] },
      { name: 'SSF (Simultaneous Saccharification)', total: 320, values: [55, 62, 68, 72, 63] },
      { name: 'Consolidated Bioprocessing', total: 185, values: [30, 34, 38, 42, 41] },
      { name: 'Continuous Fermentation', total: 135, values: [27, 26, 26, 28, 28] },
    ]},
    { name: 'Catalytic Conversion', total: 880, values: [155, 170, 185, 195, 175], children: [
      { name: 'Heterogeneous Catalysis', total: 380, values: [65, 72, 80, 86, 77] },
      { name: 'Homogeneous Catalysis', total: 290, values: [52, 56, 60, 64, 58] },
      { name: 'Biocatalysis', total: 210, values: [38, 42, 45, 45, 40] },
    ]},
    { name: 'Extraction & Separation', total: 710, values: [125, 138, 148, 160, 139], children: [
      { name: 'Membrane Separation', total: 310, values: [52, 60, 66, 72, 60] },
      { name: 'Solvent Extraction', total: 240, values: [44, 48, 50, 54, 44] },
      { name: 'Distillation', total: 160, values: [29, 30, 32, 34, 35] },
    ]},
    { name: 'Purification', total: 580, values: [102, 112, 122, 130, 114], children: [
      { name: 'Crystallisation', total: 260, values: [46, 50, 55, 58, 51] },
      { name: 'Ion Exchange', total: 190, values: [34, 37, 40, 42, 37] },
      { name: 'Electrodialysis', total: 130, values: [22, 25, 27, 30, 26] },
    ]},
    { name: 'Enzymatic Hydrolysis', total: 470, values: [80, 90, 98, 108, 94], children: [
      { name: 'Cellulase Cocktails', total: 220, values: [36, 42, 46, 52, 44] },
      { name: 'Hemicellulase Systems', total: 150, values: [26, 28, 30, 34, 32] },
      { name: 'Laccase Treatment', total: 100, values: [18, 20, 22, 22, 18] },
    ]},
    { name: 'Thermochemical', total: 380, values: [68, 74, 80, 86, 72], children: [
      { name: 'Pyrolysis', total: 160, values: [28, 30, 34, 36, 32] },
      { name: 'Gasification', total: 130, values: [24, 26, 28, 30, 22] },
      { name: 'Hydrothermal', total: 90, values: [16, 18, 18, 20, 18] },
    ]}],

    feedstockHeatMatrixRows: [
    { name: 'Lignocellulosic Biomass', total: 980, values: [165, 185, 205, 220, 205], children: [
      { name: 'Corn Stover', total: 380, values: [62, 72, 80, 88, 78] },
      { name: 'Wheat Straw', total: 340, values: [58, 64, 72, 76, 70] },
      { name: 'Wood Chips', total: 260, values: [45, 49, 53, 56, 57] },
    ]},
    { name: 'Sugar Crops', total: 820, values: [142, 158, 172, 185, 163], children: [
      { name: 'Sugar Beet Pulp', total: 340, values: [58, 66, 72, 78, 66] },
      { name: 'Sugarcane Bagasse', total: 280, values: [48, 54, 60, 64, 54] },
      { name: 'Sweet Sorghum', total: 200, values: [36, 38, 40, 43, 43] },
    ]},
    { name: 'Starch Sources', total: 620, values: [108, 118, 130, 140, 124], children: [
      { name: 'Corn Starch', total: 260, values: [46, 50, 55, 60, 49] },
      { name: 'Potato Starch', total: 200, values: [35, 38, 42, 45, 40] },
      { name: 'Cassava Starch', total: 160, values: [27, 30, 33, 35, 35] },
    ]},
    { name: 'Food Waste', total: 480, values: [78, 88, 100, 112, 102], children: [
      { name: 'Bread Waste', total: 190, values: [30, 34, 40, 46, 40] },
      { name: 'Fruit Pomace', total: 160, values: [26, 30, 34, 38, 32] },
      { name: 'Coffee Grounds', total: 130, values: [22, 24, 26, 28, 30] },
    ]},
    { name: 'Algal Biomass', total: 350, values: [55, 65, 74, 85, 71], children: [
      { name: 'Microalgae', total: 200, values: [30, 38, 44, 50, 38] },
      { name: 'Macroalgae', total: 150, values: [25, 27, 30, 35, 33] },
    ]}],

    bubbleData: [
    { name: 'Fermentation', patentVolume: 1820, hhi: 0.030, growth: 20.1, fill: 'hsl(142 60% 40%)' },
    { name: 'Catalytic', patentVolume: 1340, hhi: 0.040, growth: 16.5, fill: 'hsl(217 91% 60%)' },
    { name: 'Extraction', patentVolume: 1080, hhi: 0.052, growth: 18.7, fill: 'hsl(262 83% 58%)' },
    { name: 'Purification', patentVolume: 890, hhi: 0.068, growth: 14.3, fill: 'hsl(36 95% 54%)' },
    { name: 'Enzymatic', patentVolume: 720, hhi: 0.082, growth: 22.4, fill: 'hsl(195 70% 50%)' },
    { name: 'Thermochemical', patentVolume: 571, hhi: 0.095, growth: 12.8, fill: 'hsl(340 50% 55%)' }],

    concentration: { hhi: '0.105', hhiLabel: 'Moderately Fragmented', top5: '56.4%', top10: '76.1%', gini: '0.49' }
  },
  applications: {
    label: "Applications & Off-take",
    icon: ShoppingBag,
    description: (topic) => `Patents related to the downstream use of ${topic} in end-market applications such as food, pharma, and materials.`,
    trendData: [
    { year: '2014', US: 12, EU: 18, Other: 5 },
    { year: '2015', US: 16, EU: 24, Other: 7 },
    { year: '2016', US: 20, EU: 30, Other: 9 },
    { year: '2017', US: 25, EU: 35, Other: 11 },
    { year: '2018', US: 30, EU: 40, Other: 13 },
    { year: '2019', US: 35, EU: 45, Other: 15 },
    { year: '2020', US: 42, EU: 55, Other: 22 },
    { year: '2021', US: 58, EU: 72, Other: 30 },
    { year: '2022', US: 70, EU: 90, Other: 42 },
    { year: '2023', US: 82, EU: 105, Other: 55 }],

    cpcData: [
    { code: "A", name: "Human Necessities", count: 62340, color: "bg-purple-500" },
    { code: "B", name: "Performing Operations; Transporting", count: 14520, color: "bg-orange-500" },
    { code: "C", name: "Chemistry; Metallurgy", count: 58970, color: "bg-pink-400" },
    { code: "D", name: "Textiles; Paper", count: 3210, color: "bg-gray-800" },
    { code: "E", name: "Fixed Constructions", count: 890, color: "bg-sky-500" },
    { code: "F", name: "Mechanical Engineering; Lighting; Heating; Weapons; Blasting", count: 1760, color: "bg-blue-600" },
    { code: "G", name: "Physics", count: 16480, color: "bg-orange-400" },
    { code: "H", name: "Electricity", count: 11920, color: "bg-red-700" },
    { code: "Y", name: "General Tagging of New Technological Developments; General Tagging of Cross-...", count: 2080, color: "bg-yellow-400" }],

    pieData: [
    { name: "A", value: 62340, fill: "#8b5cf6" },
    { name: "B", value: 14520, fill: "#f97316" },
    { name: "C", value: 58970, fill: "#f472b6" },
    { name: "D", value: 3210, fill: "#1f2937" },
    { name: "E", value: 890, fill: "#0ea5e9" },
    { name: "F", value: 1760, fill: "#2563eb" },
    { name: "G", value: 16480, fill: "#fb923c" },
    { name: "H", value: 11920, fill: "#b91c1c" },
    { name: "Y", value: 2080, fill: "#facc15" }],

    patents: [
    { title: "Xylose-based Bioplastic Formulation", company: "NatureWorks LLC", filingYear: 2023, grantedYear: null, status: "Filed", jurisdiction: 6 },
    { title: "Xylitol Production via Catalytic Hydrogenation", company: "Danisco / IFF", filingYear: 2022, grantedYear: 2023, status: "Granted", jurisdiction: 18 },
    { title: "Xylose-derived Surfactants for Cosmetics", company: "Evonik Industries", filingYear: 2023, grantedYear: null, status: "Filed", jurisdiction: 4 },
    { title: "Furfural Synthesis from Pentose Sugars", company: "Avantium N.V.", filingYear: 2021, grantedYear: 2022, status: "Granted", jurisdiction: 11 },
    { title: "Dietary Fibre Supplements from Xylan", company: "Cargill Inc.", filingYear: 2023, grantedYear: 2023, status: "Granted", jurisdiction: 7 }],

    geoData: [
    { location: "North America", countries: "3 countries", total: 38750, granted: 6280, filed: 32470 },
    { location: "Asia", countries: "15 countries", total: 45120, granted: 7640, filed: 37480 },
    { location: "Europe", countries: "21 countries", total: 33890, granted: 8450, filed: 25440 },
    { location: "Oceania", countries: "4 countries", total: 1250, granted: 248, filed: 1002 },
    { location: "South America", countries: "6 countries", total: 3180, granted: 580, filed: 2600 }],

    developers: [
    { org: "Danisco / IFF", total: 94, granted: 72, filed: 22 },
    { org: "Cargill Inc.", total: 68, granted: 45, filed: 23 },
    { org: "Avantium N.V.", total: 52, granted: 34, filed: 18 },
    { org: "NatureWorks LLC", total: 41, granted: 28, filed: 13 },
    { org: "Evonik Industries", total: 36, granted: 22, filed: 14 },
    { org: "TotalEnergies Corbion", total: 31, granted: 20, filed: 11 },
    { org: "Novamont S.p.A.", total: 26, granted: 17, filed: 9 },
    { org: "Eastman Chemical", total: 22, granted: 14, filed: 8 },
    { org: "Mitsubishi Chemical", total: 18, granted: 12, filed: 6 },
    { org: "Plantic Technologies", total: 15, granted: 9, filed: 6 }],

    trendDescription: (topic) => `Filing trends for patents covering downstream ${topic} applications, formulations, and end-use innovations.`,
    developerLabel: "Application",
    developerDescription: "Top organisations filing patents for downstream applications and formulations.",
    geoDescription: "Where application and off-take IP is concentrated. See which markets are driving downstream innovation.",
    cpcDescription: "CPC classification breakdown for application-related patents. Human Necessities leads in off-take innovation.",
    patentDescription: "Most recent patent filings for downstream applications and market use-cases.",
    totalPatents: '5,522',
    filedCount: '3,406',
    grantedCount: '2,116',
    sectorTitle: "Application Sectors",
    heatMatrixTitle: "Application Heat Matrix",
    bubbleTitle: "Assignee Concentration & Off-Taker Map",
    bubbleSubtitle: "Patent volume × HHI · Bubble size = growth rate",
    sectors: [
    [
    { name: 'Packaging', patents: 1640, share: '33.7%', cagr: '+22.1%', borderColor: 'border-l-[hsl(217,91%,60%)]', cagrColor: 'text-[hsl(217,91%,60%)]', shareColor: 'text-[hsl(217,91%,60%)]', subs: [{ n: 'Food Containers', v: 580 }, { n: 'Film & Wrap', v: 420 }, { n: 'Rigid Packaging', v: 340 }] },
    { name: 'Biomedical', patents: 1120, share: '23.0%', cagr: '+15.8%', borderColor: 'border-l-[hsl(262,83%,58%)]', cagrColor: 'text-[hsl(262,83%,58%)]', shareColor: 'text-[hsl(262,83%,58%)]', subs: [{ n: 'Drug Delivery', v: 380 }, { n: 'Tissue Engineering', v: 320 }, { n: 'Surgical Sutures', v: 240 }] },
    { name: 'Textiles', patents: 780, share: '16.0%', cagr: '+24.6%', borderColor: 'border-l-[hsl(152,60%,40%)]', cagrColor: 'text-[hsl(152,60%,40%)]', shareColor: 'text-[hsl(152,60%,40%)]', subs: [{ n: 'Nonwoven Fabrics', v: 310 }, { n: 'Fiber Blends', v: 250 }, { n: 'Technical Textiles', v: 220 }] }],

    [
    { name: '3D Printing', patents: 560, share: '11.5%', cagr: '+31.2%', borderColor: 'border-l-[hsl(36,95%,54%)]', cagrColor: 'text-[hsl(36,95%,54%)]', shareColor: 'text-[hsl(36,95%,54%)]', subs: [{ n: 'FDM Filaments', v: 280 }, { n: 'SLA Resins', v: 160 }, { n: 'Composites', v: 120 }] },
    { name: 'Agriculture', patents: 420, share: '8.6%', cagr: '+12.3%', borderColor: 'border-l-[hsl(340,50%,55%)]', cagrColor: 'text-[hsl(340,50%,55%)]', shareColor: 'text-[hsl(340,50%,55%)]', subs: [{ n: 'Mulch Films', v: 200 }, { n: 'Controlled Release', v: 140 }, { n: 'Seed Coatings', v: 80 }] },
    { name: 'Electronics', patents: 352, share: '7.2%', cagr: '+19.7%', borderColor: 'border-l-[hsl(160,50%,45%)]', cagrColor: 'text-[hsl(160,50%,45%)]', shareColor: 'text-[hsl(160,50%,45%)]', subs: [{ n: 'Flexible Substrates', v: 140 }, { n: 'Encapsulation', v: 120 }, { n: 'Disposable Sensors', v: 92 }] }]],


    heatMatrixRows: [
    { name: 'Packaging', total: 995, values: [190, 210, 225, 240, 130], children: [
      { name: 'Food Packaging', total: 420, values: [80, 90, 95, 100, 55] },
      { name: 'Industrial Packaging', total: 310, values: [60, 65, 70, 75, 40] },
      { name: 'Consumer Goods Packaging', total: 265, values: [50, 55, 60, 65, 35] },
    ]},
    { name: 'Biomedical', total: 612, values: [120, 132, 148, 158, 54], children: [
      { name: 'Drug Delivery Systems', total: 245, values: [48, 53, 60, 63, 21] },
      { name: 'Tissue Engineering', total: 198, values: [39, 43, 48, 51, 17] },
      { name: 'Surgical Implants', total: 169, values: [33, 36, 40, 44, 16] },
    ]},
    { name: 'Textiles', total: 556, values: [95, 110, 120, 128, 103], children: [
      { name: 'Technical Textiles', total: 230, values: [40, 46, 50, 52, 42] },
      { name: 'Apparel Fibres', total: 185, values: [32, 37, 40, 43, 33] },
      { name: 'Non-woven Fabrics', total: 141, values: [23, 27, 30, 33, 28] },
    ]},
    { name: '3D Printing', total: 414, values: [78, 85, 92, 98, 61], children: [
      { name: 'Filament Materials', total: 180, values: [34, 37, 40, 42, 27] },
      { name: 'Bioprinting', total: 138, values: [26, 28, 30, 33, 21] },
      { name: 'Resin Formulations', total: 96, values: [18, 20, 22, 23, 13] },
    ]},
    { name: 'Agriculture', total: 258, values: [48, 52, 55, 58, 45], children: [
      { name: 'Mulch Films', total: 110, values: [20, 22, 24, 25, 19] },
      { name: 'Controlled Release', total: 88, values: [17, 18, 18, 20, 15] },
      { name: 'Seed Coatings', total: 60, values: [11, 12, 13, 13, 11] },
    ]},
    { name: 'Electronics', total: 242, values: [42, 48, 52, 58, 42], children: [
      { name: 'Flexible Substrates', total: 105, values: [18, 21, 23, 25, 18] },
      { name: 'Biodegradable Circuits', total: 82, values: [14, 16, 17, 20, 15] },
      { name: 'Encapsulation', total: 55, values: [10, 11, 12, 13, 9] },
    ]}],

    bubbleData: [
    { name: 'Packaging', patentVolume: 1640, hhi: 0.028, growth: 22.1, fill: 'hsl(230 40% 60%)' },
    { name: 'Biomedical', patentVolume: 1120, hhi: 0.032, growth: 15.8, fill: 'hsl(195 70% 72%)' },
    { name: 'Textiles', patentVolume: 780, hhi: 0.065, growth: 24.6, fill: 'hsl(270 50% 65%)' },
    { name: '3D Printing', patentVolume: 520, hhi: 0.12, growth: 31.2, fill: 'hsl(160 50% 65%)' },
    { name: 'Electronics', patentVolume: 352, hhi: 0.115, growth: 19.7, fill: 'hsl(340 50% 70%)' },
    { name: 'Agriculture', patentVolume: 420, hhi: 0.092, growth: 12.3, fill: 'hsl(35 70% 65%)' }],

    concentration: { hhi: '0.128', hhiLabel: 'Moderately Fragmented', top5: '62.4%', top10: '81.2%', gini: '0.54' }
  },
  products: {
    label: "Products & Derivatives",
    icon: ShoppingBag,
    description: (topic) => `Patents related to the products and chemical derivatives produced from ${topic} through various conversion pathways.`,
    trendData: [
    { year: '2014', US: 14, EU: 11, Other: 6 },
    { year: '2015', US: 18, EU: 15, Other: 8 },
    { year: '2016', US: 23, EU: 20, Other: 10 },
    { year: '2017', US: 28, EU: 25, Other: 13 },
    { year: '2018', US: 34, EU: 30, Other: 15 },
    { year: '2019', US: 40, EU: 35, Other: 18 },
    { year: '2020', US: 52, EU: 45, Other: 25 },
    { year: '2021', US: 68, EU: 60, Other: 34 },
    { year: '2022', US: 82, EU: 74, Other: 44 },
    { year: '2023', US: 96, EU: 88, Other: 52 }],

    cpcData: [
    { code: "A", name: "Human Necessities", count: 52140, color: "bg-purple-500" },
    { code: "B", name: "Performing Operations; Transporting", count: 18320, color: "bg-orange-500" },
    { code: "C", name: "Chemistry; Metallurgy", count: 92450, color: "bg-pink-400" },
    { code: "D", name: "Textiles; Paper", count: 3150, color: "bg-gray-800" },
    { code: "E", name: "Fixed Constructions", count: 1340, color: "bg-sky-500" },
    { code: "F", name: "Mechanical Engineering; Lighting; Heating; Weapons; Blasting", count: 2280, color: "bg-blue-600" },
    { code: "G", name: "Physics", count: 15120, color: "bg-orange-400" },
    { code: "H", name: "Electricity", count: 12680, color: "bg-red-700" },
    { code: "Y", name: "General Tagging of New Technological Developments; General Tagging of Cross-...", count: 1580, color: "bg-yellow-400" }],

    pieData: [
    { name: "A", value: 52140, fill: "#8b5cf6" },
    { name: "B", value: 18320, fill: "#f97316" },
    { name: "C", value: 92450, fill: "#f472b6" },
    { name: "D", value: 3150, fill: "#1f2937" },
    { name: "E", value: 1340, fill: "#0ea5e9" },
    { name: "F", value: 2280, fill: "#2563eb" },
    { name: "G", value: 15120, fill: "#fb923c" },
    { name: "H", value: 12680, fill: "#b91c1c" },
    { name: "Y", value: 1580, fill: "#facc15" }],

    patents: [
    { title: "High-Purity Lactic Acid Production from Fructose Streams", company: "Corbion N.V.", filingYear: 2023, grantedYear: null, status: "Filed", jurisdiction: 11 },
    { title: "Succinic Acid Crystallisation and Purification Process", company: "BioAmber Inc.", filingYear: 2022, grantedYear: 2023, status: "Granted", jurisdiction: 8 },
    { title: "Furfural Derivatives for Specialty Chemicals", company: "Avantium N.V.", filingYear: 2023, grantedYear: null, status: "Filed", jurisdiction: 6 },
    { title: "Bio-based Adipic Acid Synthesis from Sugar Feedstocks", company: "Verdezyne Inc.", filingYear: 2022, grantedYear: 2023, status: "Granted", jurisdiction: 14 },
    { title: "Levulinic Acid Extraction from Hexose-Pentose Mixtures", company: "GFBiochemicals", filingYear: 2023, grantedYear: null, status: "Filed", jurisdiction: 5 }],

    geoData: [
    { location: "North America", countries: "3 countries", total: 46820, granted: 7540, filed: 39280 },
    { location: "Asia", countries: "13 countries", total: 44350, granted: 7180, filed: 37170 },
    { location: "Europe", countries: "20 countries", total: 29640, granted: 7620, filed: 22020 },
    { location: "Oceania", countries: "4 countries", total: 920, granted: 185, filed: 735 },
    { location: "South America", countries: "5 countries", total: 2150, granted: 395, filed: 1755 }],

    developers: [
    { org: "Corbion N.V.", total: 78, granted: 54, filed: 24 },
    { org: "NatureWorks LLC", total: 65, granted: 42, filed: 23 },
    { org: "Avantium N.V.", total: 52, granted: 36, filed: 16 },
    { org: "BASF SE", total: 46, granted: 32, filed: 14 },
    { org: "Cargill Inc.", total: 38, granted: 24, filed: 14 },
    { org: "GFBiochemicals", total: 32, granted: 20, filed: 12 },
    { org: "DuPont de Nemours", total: 28, granted: 18, filed: 10 },
    { org: "Evonik Industries", total: 24, granted: 16, filed: 8 },
    { org: "Genomatica Inc.", total: 20, granted: 13, filed: 7 },
    { org: "DSM-Firmenich", total: 17, granted: 11, filed: 6 }],

    trendDescription: (topic) => `Filing trends for patents covering products and chemical derivatives produced from ${topic}.`,
    developerLabel: "Products",
    developerDescription: "Top organisations filing patents for product synthesis and derivative manufacturing.",
    geoDescription: "Where product and derivative IP is being filed globally.",
    cpcDescription: "CPC classification breakdown for product-related patents. Chemistry & Metallurgy dominates product innovation.",
    patentDescription: "Most recent patent filings for products and derivatives.",
    totalPatents: '5,890',
    filedCount: '3,950',
    grantedCount: '1,940',
    sectorTitle: "Product Sectors",
    heatMatrixTitle: "Product Heat Matrix",
    bubbleTitle: "Product Concentration & Innovation Map",
    bubbleSubtitle: "Patent volume × HHI · Bubble size = growth rate",
    sectors: [
    [
    { name: 'Organic Acids', patents: 1580, share: '26.8%', cagr: '+18.5%', borderColor: 'border-l-[hsl(152,60%,40%)]', cagrColor: 'text-[hsl(152,60%,40%)]', shareColor: 'text-[hsl(152,60%,40%)]', subs: [{ n: 'Lactic Acid', v: 620 }, { n: 'Succinic Acid', v: 520 }, { n: 'Levulinic Acid', v: 440 }] },
    { name: 'Platform Chemicals', patents: 1240, share: '21.1%', cagr: '+21.3%', borderColor: 'border-l-[hsl(217,91%,60%)]', cagrColor: 'text-[hsl(217,91%,60%)]', shareColor: 'text-[hsl(217,91%,60%)]', subs: [{ n: 'Furfural', v: 480 }, { n: 'HMF', v: 420 }, { n: 'Glycerol', v: 340 }] },
    { name: 'Biopolymers', patents: 980, share: '16.6%', cagr: '+24.1%', borderColor: 'border-l-[hsl(262,83%,58%)]', cagrColor: 'text-[hsl(262,83%,58%)]', shareColor: 'text-[hsl(262,83%,58%)]', subs: [{ n: 'PLA', v: 420 }, { n: 'PBS', v: 320 }, { n: 'PHA', v: 240 }] }],

    [
    { name: 'Sugar Alcohols', patents: 820, share: '13.9%', cagr: '+16.8%', borderColor: 'border-l-[hsl(36,95%,54%)]', cagrColor: 'text-[hsl(36,95%,54%)]', shareColor: 'text-[hsl(36,95%,54%)]', subs: [{ n: 'Xylitol', v: 340 }, { n: 'Sorbitol', v: 280 }, { n: 'Mannitol', v: 200 }] },
    { name: 'Amino Acids', patents: 680, share: '11.5%', cagr: '+14.2%', borderColor: 'border-l-[hsl(340,50%,55%)]', cagrColor: 'text-[hsl(340,50%,55%)]', shareColor: 'text-[hsl(340,50%,55%)]', subs: [{ n: 'L-Lysine', v: 280 }, { n: 'L-Glutamic Acid', v: 220 }, { n: 'L-Threonine', v: 180 }] },
    { name: 'Specialty Chemicals', patents: 590, share: '10.0%', cagr: '+19.7%', borderColor: 'border-l-[hsl(160,50%,45%)]', cagrColor: 'text-[hsl(160,50%,45%)]', shareColor: 'text-[hsl(160,50%,45%)]', subs: [{ n: 'Flavours', v: 240 }, { n: 'Fragrances', v: 190 }, { n: 'Surfactants', v: 160 }] }]],

    heatMatrixRows: [
    { name: 'Organic Acids', total: 960, values: [170, 188, 200, 215, 187] },
    { name: 'Platform Chemicals', total: 780, values: [140, 152, 165, 178, 145] },
    { name: 'Biopolymers', total: 640, values: [110, 125, 135, 148, 122] },
    { name: 'Sugar Alcohols', total: 520, values: [95, 102, 110, 118, 95] },
    { name: 'Amino Acids', total: 430, values: [80, 85, 90, 96, 79] },
    { name: 'Specialty Chemicals', total: 380, values: [65, 72, 80, 88, 75] }],

    bubbleData: [
    { name: 'Organic Acids', patentVolume: 1580, hhi: 0.030, growth: 18.5, fill: 'hsl(152 60% 40%)' },
    { name: 'Platform Chem', patentVolume: 1240, hhi: 0.035, growth: 21.3, fill: 'hsl(217 91% 60%)' },
    { name: 'Biopolymers', patentVolume: 980, hhi: 0.058, growth: 24.1, fill: 'hsl(262 83% 58%)' },
    { name: 'Sugar Alcohols', patentVolume: 820, hhi: 0.075, growth: 16.8, fill: 'hsl(36 95% 54%)' },
    { name: 'Amino Acids', patentVolume: 680, hhi: 0.088, growth: 14.2, fill: 'hsl(340 50% 55%)' },
    { name: 'Specialty', patentVolume: 590, hhi: 0.095, growth: 19.7, fill: 'hsl(160 50% 45%)' }],

    concentration: { hhi: '0.105', hhiLabel: 'Fragmented', top5: '56.8%', top10: '76.4%', gini: '0.49' }
  }
};

const productViewOrder: PatentView[] = ['production', 'feedstock', 'technology', 'applications'];
const feedstockViewOrder: PatentView[] = ['production', 'products', 'technology', 'applications'];

const PatentLandscape = () => {
  const { category, topic } = useParams<{category: string;topic: string;}>();
  const navigate = useNavigate();
  const [view, setView] = useState<PatentView>('production');
  const [generalSubView, setGeneralSubView] = useState<'production' | 'applications'>('production');
  const [expandedHeatRows, setExpandedHeatRows] = useState<Set<string>>(new Set());
  const [heatMatrixSubView, setHeatMatrixSubView] = useState<'technology' | 'feedstock'>('feedstock');
  const [patentSearchTerm, setPatentSearchTerm] = useState('');
  const [trendChartMode] = useState<'spot'>('spot');
  const [trendTimeRange, setTrendTimeRange] = useState<string>('5');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedTechInPopup, setSelectedTechInPopup] = useState<string | null>(null);

  // Mock data for subcategory detail popups - patents grouped by technology
  const subcategoryDetails: Record<string, { technologies: { name: string; patents: number; trend: string; trendColor: string; patentList: { title: string; company: string; year: number; status: string }[] }[] }> = {
    'Corn Stover': {
      technologies: [
        { name: 'Enzymatic Hydrolysis', patents: 42, trend: '+24%', trendColor: 'text-[hsl(142,60%,40%)]', patentList: [
          { title: 'High-Yield Cellulose Extraction from Corn Stover via Enzymatic Cascade', company: 'Novozymes A/S', year: 2024, status: 'Filed' },
          { title: 'Optimised Lignin Recovery from Corn Stover Hydrolysis Residue', company: 'Clariant AG', year: 2023, status: 'Granted' },
        ]},
        { name: 'Steam Explosion Pretreatment', patents: 35, trend: '+18%', trendColor: 'text-[hsl(142,60%,40%)]', patentList: [
          { title: 'Integrated Steam Explosion and Fermentation Process for Corn Stover', company: 'POET LLC', year: 2023, status: 'Granted' },
        ]},
        { name: 'Dilute Acid Hydrolysis', patents: 28, trend: '+12%', trendColor: 'text-[hsl(142,60%,40%)]', patentList: [
          { title: 'Continuous Dilute Acid Pretreatment Reactor for Corn Stover Biomass', company: 'ADM', year: 2023, status: 'Filed' },
        ]},
        { name: 'Simultaneous Saccharification', patents: 22, trend: '+31%', trendColor: 'text-[hsl(142,60%,40%)]', patentList: [
          { title: 'AI-Driven Feedstock Quality Grading for Corn Stover Supply Chains', company: 'Deere & Company', year: 2024, status: 'Filed' },
        ]},
      ],
    },
    'Wheat Straw': {
      technologies: [
        { name: 'Organosolv Fractionation', patents: 38, trend: '+22%', trendColor: 'text-[hsl(142,60%,40%)]', patentList: [
          { title: 'Organosolv Process for High-Purity Cellulose from Wheat Straw', company: 'ANDRITZ AG', year: 2024, status: 'Filed' },
        ]},
        { name: 'Alkaline Pretreatment', patents: 30, trend: '+15%', trendColor: 'text-[hsl(142,60%,40%)]', patentList: [
          { title: 'Alkaline Pretreatment Method for Wheat Straw Hemicellulose Extraction', company: 'Südzucker AG', year: 2023, status: 'Granted' },
        ]},
        { name: 'Pyrolysis', patents: 24, trend: '+19%', trendColor: 'text-[hsl(142,60%,40%)]', patentList: [
          { title: 'Fast Pyrolysis of Wheat Straw for Bio-Oil Production', company: 'BTG Bioliquids', year: 2023, status: 'Filed' },
        ]},
        { name: 'Enzymatic Saccharification', patents: 20, trend: '+28%', trendColor: 'text-[hsl(142,60%,40%)]', patentList: [
          { title: 'Continuous Enzymatic Hydrolysis System for Wheat Straw', company: 'DSM-Firmenich', year: 2024, status: 'Filed' },
        ]},
      ],
    },
    'Wood Chips': {
      technologies: [
        { name: 'Kraft Pulping Modified', patents: 32, trend: '+14%', trendColor: 'text-[hsl(142,60%,40%)]', patentList: [
          { title: 'Modified Kraft Process for Nanocellulose from Softwood Chips', company: 'Stora Enso', year: 2024, status: 'Filed' },
        ]},
        { name: 'Hydrothermal Treatment', patents: 26, trend: '+20%', trendColor: 'text-[hsl(142,60%,40%)]', patentList: [
          { title: 'Subcritical Water Treatment of Wood Chips for Sugar Release', company: 'UPM-Kymmene', year: 2023, status: 'Granted' },
        ]},
        { name: 'Mechanical Refining', patents: 21, trend: '+11%', trendColor: 'text-[hsl(142,60%,40%)]', patentList: [
          { title: 'High-Efficiency Disc Refiner for Wood Chip Fibrillation', company: 'Valmet', year: 2023, status: 'Filed' },
        ]},
        { name: 'Torrefaction', patents: 18, trend: '+16%', trendColor: 'text-[hsl(142,60%,40%)]', patentList: [] },
      ],
    },
  };

  const getSubcategoryData = (name: string) => {
    if (subcategoryDetails[name]) return subcategoryDetails[name];
    return {
      technologies: [
        { name: 'Enzymatic Processing', patents: 28, trend: '+18%', trendColor: 'text-[hsl(142,60%,40%)]', patentList: [
          { title: `Advanced Valorisation Process for ${name}`, company: 'Novozymes A/S', year: 2024, status: 'Filed' },
        ]},
        { name: 'Chemical Conversion', patents: 22, trend: '+14%', trendColor: 'text-[hsl(142,60%,40%)]', patentList: [
          { title: `Integrated Biorefinery Approach for ${name} Conversion`, company: 'BASF SE', year: 2023, status: 'Granted' },
        ]},
        { name: 'Thermal Processing', patents: 16, trend: '+21%', trendColor: 'text-[hsl(142,60%,40%)]', patentList: [
          { title: `Novel Catalyst System for ${name} Upgrading`, company: 'Clariant AG', year: 2023, status: 'Filed' },
        ]},
        { name: 'Biological Treatment', patents: 12, trend: '+25%', trendColor: 'text-[hsl(142,60%,40%)]', patentList: [] },
      ],
    };
  };

  const decodedTopic = decodeURIComponent(topic || "");
  const decodedCategory = decodeURIComponent(category || "");
  const isFeedstockRoute = decodedCategory === 'Feedstock';
  const viewOrder = isFeedstockRoute ? feedstockViewOrder : productViewOrder;

  const handleBack = () => {
    navigate(`/landscape/${category}/${topic}/value-chain`);
  };

  const activeConfig = view === 'production' ? viewConfigs[generalSubView] : viewConfigs[view];
  const allTrendData = activeConfig.trendData;
  const trendData = trendTimeRange === '5' ? allTrendData.slice(-5) : allTrendData;
  const cpcCategories = activeConfig.cpcData;
  const pieData = activeConfig.pieData;
  const allPatents = activeConfig.patents;
  const latestPatents = patentSearchTerm
    ? allPatents.filter(p => p.title.toLowerCase().includes(patentSearchTerm.toLowerCase()) || p.company.toLowerCase().includes(patentSearchTerm.toLowerCase()))
    : allPatents;
  const geoData = activeConfig.geoData;
  const developers = activeConfig.developers;
  const hasDetailedSections = !!activeConfig.sectors;

  const toggleBtn = (active: boolean) =>
  `flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
  active ?
  'bg-foreground text-background shadow-sm' :
  'text-muted-foreground hover:text-foreground'}`;


  return (
    <div className="h-full bg-background flex flex-col">
      <div className="max-w-[1400px] w-full mx-auto px-6 pt-4 pb-3 flex items-center justify-between flex-shrink-0">
        <Button variant="outline" size="sm" onClick={handleBack} className="gap-1.5 h-7 text-xs">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Button>
        <div />
      </div>

      <div className="max-w-[1400px] w-full mx-auto px-6 pb-6 flex-1 min-h-0 flex flex-col">
        <div className="mb-2 flex-shrink-0">
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Patent Landscape: <span className="text-primary">{decodedTopic}</span></h2>
        </div>

        <Card className="bg-card border border-border/60 shadow-sm flex-1 min-w-0 flex flex-col">
          <CardContent className="px-5 py-4 pb-2 flex flex-col h-full">


            {/* Sub-toggle for General Overview */}
            {view === 'production' && (
              <div className="flex items-center bg-muted rounded-lg p-0.5 mb-2 flex-shrink-0 self-start">
                <button onClick={() => setGeneralSubView('production')} className={toggleBtn(generalSubView === 'production')}>
                  <FlaskConical className="w-3 h-3" />
                  Production
                </button>
                <button onClick={() => setGeneralSubView('applications')} className={toggleBtn(generalSubView === 'applications')}>
                  <ShoppingBag className="w-3 h-3" />
                  Application
                </button>
              </div>
            )}
            <p className="text-[9px] text-muted-foreground mb-2 flex-shrink-0">{activeConfig.description(decodedTopic)}</p>

            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
               <div className="space-y-3">

                <div className="grid grid-cols-[150px_1fr] gap-2">
                  {/* Legend / Filter Panel */}
                  <div className="bg-muted/30 border border-border/40 rounded-xl p-3 flex flex-col">
                    <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Filters</h4>
                    <div className="space-y-2.5">
                      <div>
                        <h4 className="text-[9px] font-bold text-foreground uppercase tracking-wider mb-1.5">Patent Status</h4>
                        <div className="space-y-1">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <Checkbox defaultChecked className="h-3 w-3 border-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-background" />
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span className="text-[9px] text-foreground">Filed</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <Checkbox defaultChecked className="h-3 w-3 border-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-background" />
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-[9px] text-foreground">Granted</span>
                          </label>
                        </div>
                      </div>
                      <div className="border-t border-border/40 pt-2.5">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <Checkbox defaultChecked className="h-3 w-3 border-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-background" />
                          <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                          <span className="text-[9px] text-foreground font-medium">Total patents</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Trend Chart */}
                  <div className="bg-muted/30 border border-border/40 rounded-xl p-3">
                    <div className="mb-1.5">
                      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Patent Trends</h3>
                      <p className="text-[9px] text-muted-foreground leading-tight">This view highlights innovation intensity across key regions, helping you identify technological hotspots, potential IP barriers, and market leaders in circular feedstock development.</p>
                    </div>
                    <div className="flex items-center justify-end mb-1.5">
                      <Select value={trendTimeRange} onValueChange={setTrendTimeRange}>
                        <SelectTrigger className="h-5 w-auto gap-1 px-1.5 text-[9px] border-border bg-background text-muted-foreground [&>svg]:h-2.5 [&>svg]:w-2.5">
                          <Calendar className="w-2.5 h-2.5" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5" className="text-[10px]">Last 5 years</SelectItem>
                          <SelectItem value="10" className="text-[10px]">Last 10 years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="h-[150px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={trendData} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                            <XAxis dataKey="year" tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={{ stroke: 'hsl(var(--border))' }} />
                            <YAxis tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} label={{ value: 'Number of patents', angle: -90, position: 'center', dx: -18, style: { fontSize: 7, fill: 'hsl(var(--muted-foreground))' } }} />
                            <Tooltip contentStyle={{ fontSize: 9, borderRadius: 6, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', padding: '4px 8px' }} />
                            <Line type="monotone" dataKey="US" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 2.5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 1 }} name="US" />
                            <Line type="monotone" dataKey="EU" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={{ r: 2.5, fill: 'hsl(var(--primary))', stroke: '#fff', strokeWidth: 1 }} name="EU" />
                            <Line type="monotone" dataKey="Other" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 2.5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 1 }} name="Other" />
                          </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Leading Developers */}
                {(
                <div className="bg-muted/30 border border-border/40 rounded-xl p-4">
                  <div className="mb-2">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Leading Process Developers</h3>
                    <p className="text-[9px] text-muted-foreground">{activeConfig.developerDescription}</p>
                  </div>
                   <div className="grid grid-cols-[1fr_auto_1fr] gap-4">
                     {[developers.slice(0, 5), developers.slice(5, 10)].map((col, colIdx) => (
                      <React.Fragment key={colIdx}>
                        {colIdx === 1 && <div className="w-px bg-border/60" />}
                        <table className="w-full text-xs">
                       <thead>
                         <tr className="border-b border-border">
                           <th className="text-left py-[3px] text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Organization</th>
                           <th className="text-center py-[3px] text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Total</th>
                           <th className="text-center py-[3px] text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Granted</th>
                           <th className="text-center py-[3px] text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">Filed</th>
                         </tr>
                       </thead>
                       <tbody>
                         {col.map((dev, i) => {
                           const rank = colIdx * 5 + i + 1;
                           return (
                         <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                             <td className="py-[3px]"><div className="flex items-center gap-1.5"><span className="text-[9px] text-muted-foreground w-3 font-medium">{rank}</span><span className="font-medium text-foreground text-[10px]">{dev.org}</span></div></td>
                             <td className="text-center py-[3px]"><div className="flex items-center justify-center gap-1"><div className="w-10 h-1 bg-muted rounded-full overflow-hidden"><div className="h-full bg-foreground/60 rounded-full" style={{ width: `${dev.total / 100 * 100}%` }}></div></div><span className="text-[10px] font-medium">{dev.total}</span></div></td>
                             <td className="text-center py-[3px]"><div className="flex items-center justify-center gap-1"><div className="w-10 h-1 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${dev.granted / dev.total * 100}%` }}></div></div><span className="text-[10px] text-primary font-medium">{dev.granted}</span></div></td>
                             <td className="text-center py-[3px]"><div className="flex items-center justify-center gap-1"><div className="w-10 h-1 bg-muted rounded-full overflow-hidden"><div className="h-full bg-muted-foreground/50 rounded-full" style={{ width: `${dev.filed / dev.total * 100}%` }}></div></div><span className="text-[10px] text-muted-foreground font-medium">{dev.filed}</span></div></td>
                           </tr>);
                         })}
                       </tbody>
                     </table>
                      </React.Fragment>
                      ))}
                   </div>
                </div>
                )}


                {/* Sectors + Market Concentration (for feedstock, technology, applications) */}
                {hasDetailedSections && activeConfig.sectors && activeConfig.concentration &&
                <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 bg-muted/30 border border-border/40 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                         <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{activeConfig.sectorTitle}</h3>
                         <p className="text-[9px] text-muted-foreground">Share of total patents</p>
                       </div>

                      {/* Production tab: split into Feedstock (left) / Technology (right) */}
                      {activeConfig.productionSectorGroups ? (
                        <div className="grid grid-cols-2 gap-4">
                          {activeConfig.productionSectorGroups.map((group) => (
                            <div key={group.label} className={`rounded-xl p-3 ${group.label === 'Feedstock' ? 'bg-[hsl(142,60%,40%,0.06)] border border-[hsl(142,60%,40%,0.15)]' : 'bg-[hsl(217,91%,60%,0.06)] border border-[hsl(217,91%,60%,0.15)]'}`}>
                              <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${group.label === 'Feedstock' ? 'bg-[hsl(142,60%,40%)]' : 'bg-[hsl(217,91%,60%)]'}`}></span>
                                {group.label}
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                {group.sectors.map((sector) =>
                                  <div key={sector.name} className={`border-l-4 ${sector.borderColor} bg-background rounded-lg p-3 cursor-pointer hover:bg-muted/40 transition-colors shadow-sm`}>
                                    <div className="flex items-start justify-between mb-0.5">
                                      <div>
                                        <div className="font-bold text-[11px] text-foreground">{sector.name}</div>
                                        <div className="text-[9px] text-muted-foreground">{sector.patents.toLocaleString()} patents</div>
                                      </div>
                                      <span className={`text-sm font-bold ${sector.shareColor}`}>{sector.share}</span>
                                    </div>
                                    <div className={`text-[9px] font-semibold ${sector.cagrColor} mb-2`}>{sector.cagr} CAGR</div>
                                    <div className="space-y-1">
                                      {sector.subs.map((s) =>
                                        <div key={s.n} className="flex justify-between text-[9px]">
                                          <span className="text-muted-foreground">{s.n}</span>
                                          <span className="font-medium text-foreground">{s.v}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* Default: flat rows for other tabs */
                        activeConfig.sectors.map((row, rowIdx) =>
                          <div key={rowIdx} className={`grid grid-cols-3 gap-2 ${rowIdx < activeConfig.sectors!.length - 1 ? 'mb-2' : ''}`}>
                            {row.map((sector) =>
                              <div key={sector.name} className={`border-l-4 ${sector.borderColor} bg-muted/20 rounded-lg p-3 cursor-pointer hover:bg-muted/40 transition-colors`}>
                                <div className="flex items-start justify-between mb-0.5">
                                  <div>
                                    <div className="font-bold text-[11px] text-foreground">{sector.name}</div>
                                    <div className="text-[9px] text-muted-foreground">{sector.patents.toLocaleString()} patents</div>
                                  </div>
                                  <span className={`text-sm font-bold ${sector.shareColor}`}>{sector.share}</span>
                                </div>
                                <div className={`text-[9px] font-semibold ${sector.cagrColor} mb-2`}>{sector.cagr} CAGR</div>
                                <div className="space-y-1">
                                  {sector.subs.map((s) =>
                                    <div key={s.n} className="flex justify-between text-[9px]">
                                      <span className="text-muted-foreground">{s.n}</span>
                                      <span className="font-medium text-foreground">{s.v}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                }

                {/* Heat Matrix */}
                 {hasDetailedSections && activeConfig.heatMatrixRows &&
                 <div className="bg-muted/30 border border-border/40 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              {activeConfig.heatMatrixTitle}
                            </h3>
                          <p className="text-[9px] text-muted-foreground mt-0.5">
                            {`${activeConfig.sectorTitle.replace(' Sectors', '')}`} × Year · Color = patent count
                          </p>
                       </div>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      {activeConfig.feedstockHeatMatrixRows ? (
                        <div className="flex gap-0.5">
                          <button onClick={() => setHeatMatrixSubView('feedstock')} className={`px-2 py-0.5 rounded text-[9px] font-medium transition-all ${heatMatrixSubView === 'feedstock' ? 'bg-foreground text-background shadow-sm' : 'bg-background border border-border text-foreground hover:bg-muted'}`}>Feedstocks</button>
                          <button onClick={() => setHeatMatrixSubView('technology')} className={`px-2 py-0.5 rounded text-[9px] font-medium transition-all ${heatMatrixSubView === 'technology' ? 'bg-foreground text-background shadow-sm' : 'bg-background border border-border text-foreground hover:bg-muted'}`}>Processes</button>
                        </div>
                      ) : <div />}
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] text-muted-foreground">Low</span>
                        <div className="flex h-2 rounded overflow-hidden">
                          {['hsl(220 20% 94%)', 'hsl(220 25% 86%)', 'hsl(222 30% 76%)', 'hsl(222 35% 66%)', 'hsl(222 40% 56%)', 'hsl(222 42% 46%)', 'hsl(222 47% 36%)'].map((c, i) =>
                        <div key={i} className="w-4" style={{ backgroundColor: c }} />
                        )}
                        </div>
                        <span className="text-[8px] text-muted-foreground">High</span>
                        <span className="text-[8px] text-muted-foreground ml-1">Annual patent filings</span>
                      </div>
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                           <th className="text-left py-[3px] text-[8px] font-semibold uppercase tracking-widest text-muted-foreground w-1/4">{activeConfig.feedstockHeatMatrixRows ? (heatMatrixSubView === 'feedstock' ? 'Feedstock' : 'Technology') : activeConfig.sectorTitle.replace(' Sectors', '')}</th>
                           {['2020', '2021', '2022', '2023', '2024'].map((y) =>
                         <th key={y} className="text-center py-[3px] text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">{y}</th>
                         )}
                         </tr>
                       </thead>
                       <tbody>
                          {(() => {
                            const allRows = (activeConfig.feedstockHeatMatrixRows && heatMatrixSubView === 'feedstock') ? activeConfig.feedstockHeatMatrixRows : activeConfig.heatMatrixRows!;
                            const maxVal = Math.max(...allRows.flatMap((r) => [...r.values, ...(r.children ? r.children.flatMap(c => c.values) : [])]));
                            return allRows.map((row) => {
                              const hasChildren = 'children' in row && row.children && (row as any).children.length > 0;
                              const isExpanded = expandedHeatRows.has(row.name);
                              const renderRow = (r: typeof row, isChild: boolean = false) => (
                                <tr 
                                  key={r.name} 
                                  className={`border-b border-border/30 transition-colors cursor-pointer ${isChild ? 'bg-muted/15 hover:bg-muted/30' : ''} ${hasChildren && !isChild ? 'hover:bg-muted/30' : 'hover:bg-muted/20'}`}
                                  onClick={isChild ? (e) => {
                                    e.stopPropagation();
                                    setSelectedSubcategory(r.name);
                                  } : (hasChildren ? () => {
                                    setExpandedHeatRows(prev => {
                                      const next = new Set(prev);
                                      if (next.has(row.name)) next.delete(row.name);
                                      else next.add(row.name);
                                      return next;
                                    });
                                  } : undefined)}
                                >
                                  <td className="py-[3px]">
                                    <div className={`flex items-center gap-1 ${isChild ? 'pl-5' : ''}`}>
                                      {!isChild && hasChildren && (isExpanded ? <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />)}
                                      <div>
                                        <div className={`font-bold ${isChild ? 'text-[9px]' : 'text-[10px]'} text-foreground`}>{r.name}</div>
                                        <div className="text-[8px] text-muted-foreground">{r.total} total</div>
                                      </div>
                                    </div>
                                  </td>
                                  {r.values.map((v, i) => {
                                    const intensity = v / maxVal;
                                    const lightness = 94 - intensity * 58;
                                    const saturation = 20 + intensity * 27;
                                    const hue = isChild ? 152 : 222;
                                    const bgColor = `hsl(${hue} ${saturation}% ${lightness}%)`;
                                    const textColor = lightness < 55 ? 'white' : `hsl(${hue}, 47%, 11%)`;
                                    return (
                                      <td key={i} className="text-center py-[3px]">
                                        <div className="mx-0.5 py-1.5 rounded-md text-[10px] font-bold" style={{ backgroundColor: bgColor, color: textColor }}>
                                          {v}
                                        </div>
                                      </td>
                                    );
                                  })}
                                </tr>
                              );
                              return (
                                <React.Fragment key={row.name}>
                                  {renderRow(row)}
                                  {isExpanded && hasChildren && (row as any).children.map((child: any) => renderRow(child, true))}
                                </React.Fragment>
                              );
                            });
                          })()}
                       </tbody>
                     </table>
                   </div>
                 }

                 {/* Subcategory Detail Dialog */}
                 <Dialog open={!!selectedSubcategory} onOpenChange={(open) => { if (!open) { setSelectedSubcategory(null); setSelectedTechInPopup(null); } }}>
                   <DialogContent className="max-w-[560px] p-0 gap-0 max-h-[80vh] overflow-hidden flex flex-col">
                     {selectedSubcategory && (() => {
                       const detail = getSubcategoryData(selectedSubcategory);
                       return (
                         <>
                           <div className="px-5 py-4 border-b border-border flex-shrink-0">
                             <DialogTitle className="text-[9px] font-bold uppercase tracking-wider text-primary mb-1">Feedstock Subcategory</DialogTitle>
                             <h4 className="text-sm font-semibold text-foreground">{selectedSubcategory}</h4>
                             <p className="text-[10px] text-muted-foreground mt-1">Top technologies to valorise {selectedSubcategory.toLowerCase()} based on patent activity.</p>
                           </div>

                           <div className="overflow-y-auto flex-1">
                             <div className="px-5 py-4">
                               <h5 className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                 <Beaker className="w-3 h-3" />
                                 Top Technologies ({detail.technologies.length})
                               </h5>
                               <div className="space-y-2">
                                 {detail.technologies.map((tech, i) => (
                                   <div key={i}>
                                     <button
                                       onClick={() => setSelectedTechInPopup(selectedTechInPopup === tech.name ? null : tech.name)}
                                       className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-colors ${selectedTechInPopup === tech.name ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/30 hover:bg-muted/50'}`}
                                     >
                                       <div className="flex items-center gap-2">
                                         <span className="text-[9px] font-bold text-muted-foreground w-4">{i + 1}.</span>
                                         <span className="text-[10px] font-medium text-foreground">{tech.name}</span>
                                       </div>
                                       <div className="flex items-center gap-3">
                                         <span className="text-[9px] text-muted-foreground">{tech.patents} patents</span>
                                         <span className={`text-[9px] font-semibold ${tech.trendColor}`}>{tech.trend}</span>
                                         <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${selectedTechInPopup === tech.name ? 'rotate-180' : ''}`} />
                                       </div>
                                     </button>
                                     {selectedTechInPopup === tech.name && tech.patentList.length > 0 && (
                                       <div className="mt-1.5 ml-6 space-y-1.5">
                                         {tech.patentList.map((patent, j) => (
                                           <div key={j} className="px-3 py-2.5 rounded-lg border border-border bg-muted/20">
                                             <div className="flex items-start justify-between gap-2">
                                               <div className="min-w-0">
                                                 <p className="text-[10px] font-medium text-foreground leading-snug">{patent.title}</p>
                                                 <div className="flex items-center gap-2 mt-1">
                                                   <span className="text-[8px] text-muted-foreground">{patent.company}</span>
                                                   <span className="text-[8px] text-muted-foreground">·</span>
                                                   <span className="text-[8px] text-muted-foreground">{patent.year}</span>
                                                 </div>
                                               </div>
                                               <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${patent.status === 'Granted' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                                 {patent.status}
                                               </span>
                                             </div>
                                           </div>
                                         ))}
                                       </div>
                                     )}
                                     {selectedTechInPopup === tech.name && tech.patentList.length === 0 && (
                                       <p className="mt-1.5 ml-6 text-[9px] text-muted-foreground italic">No patents available for this technology.</p>
                                     )}
                                   </div>
                                 ))}
                               </div>
                              </div>
                            </div>

                            <div className="px-5 py-3 border-t border-border flex-shrink-0">
                              <Button
                                onClick={() => {
                                  setSelectedSubcategory(null);
                                  setSelectedTechInPopup(null);
                                  navigate(`/landscape/${category}/${topic}/value-chain/pathways?feedstock=${encodeURIComponent(selectedSubcategory!)}&from=patents`);
                                }}
                                className="w-full bg-foreground hover:bg-foreground/90 text-background text-xs gap-2"
                              >
                                Explore Pathways for {selectedSubcategory}
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </>
                       );
                     })()}
                   </DialogContent>
                 </Dialog>


                {/* Geographic Distribution + CPC side by side */}
                <div className="space-y-3">
                  <div className="bg-muted/30 border border-border/40 rounded-xl p-4">
                    <div className="mb-3">
                      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Geographic Patent Distribution</h3>
                      <p className="text-[10px] text-muted-foreground">{activeConfig.geoDescription}</p>
                    </div>
                    <div className="mb-1">
                        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-foreground">Interactive patent intensity map</h4>
                    </div>
                    <div className="grid gap-4 items-start" style={{ gridTemplateColumns: '2fr 1fr' }}>
                      <div>
                        <div className="rounded-lg flex items-center justify-center relative overflow-hidden border border-border/40" style={{ minHeight: '320px' }}>
                          <img src={worldPatentMap} alt="World Patent Intensity Map" className="w-full h-full object-cover rounded-lg" />
                          <div className="absolute top-4 left-4 w-3 h-3 bg-destructive rounded-full animate-pulse"></div>
                          <div className="absolute top-12 right-1/3 w-2 h-2 bg-primary rounded-full animate-pulse delay-300"></div>
                          <div className="absolute bottom-1/3 left-1/4 w-4 h-4 bg-primary rounded-full animate-pulse delay-700"></div>
                          <div className="absolute inset-0 bg-gradient-to-t from-background/5 to-transparent pointer-events-none"></div>
                        </div>
                      </div>
                      <div className="space-y-2 overflow-y-auto" style={{ maxHeight: '340px' }}>
                        {geoData.map((item, index) =>
                        <div key={index} className="bg-background rounded-lg px-3 py-3 border border-border/40">
                            <h5 className="font-bold text-[12px] text-foreground mb-1.5">{item.location}</h5>
                            <div className="grid grid-cols-3 gap-2 text-[10px]">
                              <div>
                                <div className="text-muted-foreground font-medium">Total Patents</div>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-muted-foreground">♀</span>
                                  <span className="font-semibold text-foreground text-[11px]">{item.total.toLocaleString()}</span>
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground font-medium">Granted</div>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-primary">✓</span>
                                  <span className="font-semibold text-foreground text-[11px]">{item.granted.toLocaleString()}</span>
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground font-medium">Filed</div>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <FileText className="w-2.5 h-2.5 text-muted-foreground" />
                                  <span className="font-semibold text-foreground text-[11px]">{item.filed.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/30 border border-border/40 rounded-xl p-4">
                    <div className="mb-3">
                       <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Patent Distribution by CPC – {activeConfig.label}</h3>
                       <p className="text-[10px] text-muted-foreground">{activeConfig.cpcDescription}</p>
                    </div>
                    <div className="grid gap-4" style={{ gridTemplateColumns: '1fr auto' }}>
                      <div className="space-y-1.5">
                        {cpcCategories.map((cat, index) =>
                        <div key={index} className="flex items-center justify-between px-3 py-2.5 border border-border/40 rounded-lg">
                            <div className="flex items-center gap-2.5">
                              <span className="text-[10px] font-bold text-foreground border border-border rounded px-1.5 py-0.5 min-w-[22px] text-center">{cat.code}</span>
                              <span className="text-[11px] text-foreground">{cat.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-[10px]">♀</span>
                              <span className="text-[11px] font-semibold text-foreground">{cat.count.toLocaleString()}</span>
                              <div className={`w-3 h-3 rounded-sm ${cat.color}`}></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-center w-full h-full min-h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius="80%" dataKey="value" label={({ name }) => name} labelLine={false}>
                                {pieData.map((entry, i) => (
                                  <Cell key={i} fill={entry.fill} />
                                ))}
                              </Pie>
                              <ChartTooltip />
                            </PieChart>
                          </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>


                {/* Latest Patents */}
                <div className="bg-muted/30 border border-border/40 rounded-xl p-4">
                  <div className="mb-3">
                     <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Latest Patents – {activeConfig.label}</h3>
                     <p className="text-[10px] text-muted-foreground">{activeConfig.patentDescription}</p>
                  </div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <button className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium bg-foreground text-background shadow-sm">
                        <span>ALL</span>
                        <span className="opacity-70">{activeConfig.totalPatents}</span>
                      </button>
                      <Button variant="outline" size="sm" className="text-[10px] h-6 px-2.5 border-border/60">
                        <FileText className="w-2.5 h-2.5 mr-1" />
                        Filed
                        <span className="ml-1.5 text-[10px] text-muted-foreground">{activeConfig.filedCount}</span>
                      </Button>
                      <Button variant="outline" size="sm" className="text-[10px] h-6 px-2.5 border-border/60">
                        <span className="text-primary mr-1">✓</span>
                        Granted
                        <span className="ml-1.5 text-[10px] text-muted-foreground">{activeConfig.grantedCount}</span>
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-52">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-muted-foreground" />
                        <Input
                          placeholder="Search patents..."
                          value={patentSearchTerm}
                          onChange={e => setPatentSearchTerm(e.target.value)}
                          className="pl-6 pr-6 h-6 !text-[9px] border-border w-full"
                        />
                        {patentSearchTerm && (
                          <Button variant="ghost" size="sm" onClick={() => setPatentSearchTerm('')} className="absolute right-0.5 top-1/2 -translate-y-1/2 h-4 w-4 p-0 hover:bg-muted">
                            <X className="h-2 w-2" />
                          </Button>
                        )}
                      </div>
                      <Button variant="outline" size="sm" className="text-[10px] h-6 px-2.5 border-border/60">
                        <Filter className="w-2.5 h-2.5 mr-1" />
                        Filter
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground" style={{ width: '45%' }}>Patents and Applications</th>
                          <th className="text-center py-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Filing Year</th>
                          <th className="text-center py-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Granted Year</th>
                          <th className="text-center py-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                          <th className="text-center py-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Jurisdiction</th>
                          
                        </tr>
                      </thead>
                      <tbody>
                        {latestPatents.map((patent, index) =>
                        <tr key={index} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                            <td className="py-1.5" style={{ maxWidth: '300px' }}>
                              <div>
                                <div className="font-medium text-[10px] text-foreground line-clamp-2">{patent.title}</div>
                                <div className="text-[9px] text-muted-foreground mt-0.5">Applicant: {patent.company}</div>
                              </div>
                            </td>
                            <td className="text-center py-1.5 text-[11px] text-muted-foreground">{patent.filingYear}</td>
                            <td className="text-center py-1.5 text-[11px] text-muted-foreground">{patent.grantedYear || ""}</td>
                            <td className="text-center py-1.5">
                              {patent.status === "Granted" ?
                            <div className="inline-flex items-center gap-0.5 text-primary text-[10px] font-medium"><span>✓</span><span>Granted</span></div> :
                            <div className="text-muted-foreground text-[10px]">Filed</div>
                            }
                            </td>
                            <td className="text-center py-1.5"><span className="text-[10px] text-muted-foreground">{patent.jurisdiction}</span></td>
                            
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);

};

export default PatentLandscape;