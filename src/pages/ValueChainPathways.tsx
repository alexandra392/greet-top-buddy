import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, GitBranch, Zap, Factory, Leaf, ChevronRight, ChevronDown, ArrowRight, Star, Bookmark, ThumbsDown, Package, Target, Plus, Download, ArrowRight as ArrowRightIcon, Clock, Network, FolderKanban, Search, SlidersHorizontal, ArrowUpDown, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CustomPathway {
  feedstock: string;
  technology: string;
  product: string;
  application: string;
  trl: string;
  category1: string;
  category2: string;
  category3: string;
  category4: string;
  patents?: string;
  isCustom?: boolean;
}

const PREDEFINED_PATHWAYS: CustomPathway[] = [
  { feedstock: "Corn Starch", technology: "Homofermentation (Lactobacillus)", product: "Lactic Acid", application: "PLA Packaging", trl: "TRL 9", patents: "45 Patents", category1: "Bio-based primary feedstocks", category2: "Fermentation", category3: "Chemicals", category4: "Packaging" },
  { feedstock: "Sugarcane Molasses", technology: "Homofermentation (Lactobacillus)", product: "Lactic Acid", application: "Food Acidulant", trl: "TRL 9", patents: "38 Patents", category1: "Industrial side-streams", category2: "Fermentation", category3: "Chemicals", category4: "Food & Beverage" },
  { feedstock: "Whey Permeate", technology: "Homofermentation (Lactobacillus)", product: "Lactic Acid", application: "Skin Care (AHA)", trl: "TRL 9", patents: "22 Patents", category1: "Industrial side-streams", category2: "Fermentation", category3: "Chemicals", category4: "Personal Care" },
  { feedstock: "Corn Stover", technology: "Simultaneous Saccharification & Fermentation", product: "Lactic Acid", application: "Green Solvents", trl: "TRL 7", patents: "18 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Chemicals", category4: "Chemical Industry" },
  { feedstock: "Cassava Starch", technology: "Heterofermentation", product: "Lactic Acid", application: "PLA Fiber", trl: "TRL 8", patents: "12 Patents", category1: "Bio-based primary feedstocks", category2: "Fermentation", category3: "Chemicals", category4: "Textiles" },
  { feedstock: "Glucose Syrup", technology: "Homofermentation (Lactobacillus)", product: "Lactic Acid", application: "Pharmaceutical Excipient", trl: "TRL 9", patents: "28 Patents", category1: "Bio-based primary feedstocks", category2: "Fermentation", category3: "Chemicals", category4: "Pharma & Healthcare" },
  { feedstock: "Rice Bran", technology: "Solid-State Fermentation", product: "Lactic Acid", application: "Animal Feed Additive", trl: "TRL 6", patents: "8 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Chemicals", category4: "Agriculture" },
  { feedstock: "Corn Starch", technology: "Ring-Opening Polymerization", product: "PLA Polymer", application: "3D Printing Filament", trl: "TRL 8", patents: "32 Patents", category1: "Bio-based primary feedstocks", category2: "Polymerization", category3: "Materials", category4: "Advanced Manufacturing" },
  { feedstock: "Potato Starch", technology: "Homofermentation (Lactobacillus)", product: "Lactic Acid", application: "Food Preservative", trl: "TRL 9", patents: "15 Patents", category1: "Bio-based primary feedstocks", category2: "Fermentation", category3: "Chemicals", category4: "Food & Beverage" },
  { feedstock: "Wheat Bran", technology: "Heterofermentation", product: "Lactic Acid", application: "Descaling Agent", trl: "TRL 7", patents: "6 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Chemicals", category4: "Chemical Industry" },
  { feedstock: "Sugarcane Molasses", technology: "Continuous Fermentation (CSTR)", product: "Lactic Acid", application: "PLA Film", trl: "TRL 7", patents: "14 Patents", category1: "Industrial side-streams", category2: "Fermentation", category3: "Chemicals", category4: "Packaging" },
  { feedstock: "Whey Permeate", technology: "Membrane Separation", product: "L-Lactic Acid (Purified)", application: "Dialysis Solution", trl: "TRL 8", patents: "19 Patents", category1: "Industrial side-streams", category2: "Purification", category3: "Chemicals", category4: "Pharma & Healthcare" },
  { feedstock: "Corn Stover", technology: "Enzymatic Hydrolysis + Fermentation", product: "Lactic Acid", application: "Bio-based Solvent", trl: "TRL 6", patents: "11 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Chemicals", category4: "Chemical Industry" },
  { feedstock: "Sugar Beet Pulp", technology: "Solid-State Fermentation", product: "Lactic Acid", application: "Silage Preservative", trl: "TRL 7", patents: "7 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Chemicals", category4: "Agriculture" },
  { feedstock: "Corn Starch", technology: "Direct Polycondensation", product: "Low-MW PLA", application: "Compostable Cutlery", trl: "TRL 8", patents: "21 Patents", category1: "Bio-based primary feedstocks", category2: "Polymerization", category3: "Materials", category4: "Packaging" },
  { feedstock: "Glucose Syrup", technology: "Reactive Distillation", product: "Lactide", application: "Medical Implants", trl: "TRL 8", patents: "35 Patents", category1: "Bio-based primary feedstocks", category2: "Purification", category3: "Chemicals", category4: "Pharma & Healthcare" },
  { feedstock: "Cassava Starch", technology: "Engineered Yeast Fermentation", product: "D-Lactic Acid", application: "Stereocomplex PLA", trl: "TRL 5", patents: "9 Patents", category1: "Bio-based primary feedstocks", category2: "Fermentation", category3: "Chemicals", category4: "Advanced Manufacturing" },
  { feedstock: "Food Waste", technology: "Mixed-Culture Fermentation", product: "Lactic Acid", application: "Green Cleaning Products", trl: "TRL 5", patents: "5 Patents", category1: "Waste streams", category2: "Fermentation", category3: "Chemicals", category4: "Household" },
  { feedstock: "Microalgae Biomass", technology: "Photofermentation", product: "Lactic Acid", application: "Cosmetic Peel", trl: "TRL 3", patents: "3 Patents", category1: "Bio-based primary feedstocks", category2: "Fermentation", category3: "Chemicals", category4: "Personal Care" },
  { feedstock: "Corn Stover", technology: "Gas Fermentation (CO₂)", product: "Lactic Acid", application: "Carbon-Negative PLA", trl: "TRL 2", patents: "2 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Materials", category4: "Packaging" },
  { feedstock: "Bagasse", technology: "Alkaline Pretreatment + Fermentation", product: "Lactic Acid", application: "Textile Finishing", trl: "TRL 6", patents: "7 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Chemicals", category4: "Textiles" },
  { feedstock: "Sorghum Grain", technology: "Homofermentation (Lactobacillus)", product: "Lactic Acid", application: "Beverage Acidulant", trl: "TRL 8", patents: "10 Patents", category1: "Bio-based primary feedstocks", category2: "Fermentation", category3: "Chemicals", category4: "Food & Beverage" },
  { feedstock: "Barley Straw", technology: "Cell-Recycled Fermentation", product: "Lactic Acid", application: "Biodegradable Mulch Film", trl: "TRL 4", patents: "4 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Materials", category4: "Agriculture" },
  { feedstock: "Potato Starch", technology: "Ion Exchange Chromatography", product: "Ultra-Pure Lactic Acid", application: "IV Solution Grade", trl: "TRL 9", patents: "25 Patents", category1: "Bio-based primary feedstocks", category2: "Purification", category3: "Chemicals", category4: "Pharma & Healthcare" },
  { feedstock: "Sugarcane Molasses", technology: "Electrodialysis", product: "Sodium Lactate", application: "Meat Preservative", trl: "TRL 7", patents: "11 Patents", category1: "Industrial side-streams", category2: "Purification", category3: "Chemicals", category4: "Food & Beverage" },
  { feedstock: "Whey Permeate", technology: "Crystallization", product: "Calcium Lactate", application: "Calcium Supplement", trl: "TRL 8", patents: "16 Patents", category1: "Industrial side-streams", category2: "Purification", category3: "Chemicals", category4: "Pharma & Healthcare" },
  { feedstock: "Corn Starch", technology: "Azeotropic Dehydration", product: "High-MW PLA", application: "Automotive Parts", trl: "TRL 6", patents: "13 Patents", category1: "Bio-based primary feedstocks", category2: "Polymerization", category3: "Materials", category4: "Automotive" },
  { feedstock: "Glucose Syrup", technology: "Molecular Distillation", product: "Heat-Sensitive Lactic Acid", application: "Dermal Filler", trl: "TRL 5", patents: "8 Patents", category1: "Bio-based primary feedstocks", category2: "Purification", category3: "Chemicals", category4: "Personal Care" },
  { feedstock: "Rice Straw", technology: "Simultaneous Saccharification & Fermentation", product: "Lactic Acid", application: "Paper Coating", trl: "TRL 5", patents: "6 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Chemicals", category4: "Packaging" },
  { feedstock: "Food Waste", technology: "Anaerobic Fermentation", product: "Lactic Acid", application: "pH Regulator", trl: "TRL 6", patents: "9 Patents", category1: "Waste streams", category2: "Fermentation", category3: "Chemicals", category4: "Chemical Industry" },
  { feedstock: "Corn Starch", technology: "Homofermentation (Lactobacillus)", product: "Lactic Acid", application: "Probiotic Ingredient", trl: "TRL 9", patents: "20 Patents", category1: "Bio-based primary feedstocks", category2: "Fermentation", category3: "Chemicals", category4: "Food & Beverage" },
  { feedstock: "Sugarcane Molasses", technology: "Heterofermentation", product: "Lactic Acid + Ethanol", application: "Dual-Product Biorefinery", trl: "TRL 6", patents: "7 Patents", category1: "Industrial side-streams", category2: "Fermentation", category3: "Chemicals", category4: "Chemical Industry" },
  { feedstock: "Cassava Starch", technology: "Reactive Distillation", product: "Ethyl Lactate", application: "Green Solvent (Electronics)", trl: "TRL 7", patents: "15 Patents", category1: "Bio-based primary feedstocks", category2: "Purification", category3: "Chemicals", category4: "Chemical Industry" },
  { feedstock: "Wheat Straw", technology: "Organosolv Pretreatment + Fermentation", product: "Lactic Acid", application: "Biodegradable Coating", trl: "TRL 4", patents: "5 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Materials", category4: "Packaging" },
  { feedstock: "Corn Stover", technology: "Continuous Fermentation (CSTR)", product: "Lactic Acid", application: "Brewery Acidulant", trl: "TRL 7", patents: "8 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Chemicals", category4: "Food & Beverage" },
  { feedstock: "Sugar Beet Pulp", technology: "Homofermentation (Lactobacillus)", product: "Lactic Acid", application: "Dairy Starter Culture", trl: "TRL 9", patents: "30 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Chemicals", category4: "Food & Beverage" },
  { feedstock: "Whey Permeate", technology: "Engineered Yeast Fermentation", product: "Optically Pure L-LA", application: "Chiral Synthesis", trl: "TRL 4", patents: "6 Patents", category1: "Industrial side-streams", category2: "Fermentation", category3: "Chemicals", category4: "Pharma & Healthcare" },
  { feedstock: "Glucose Syrup", technology: "Ring-Opening Polymerization", product: "PLA-PEG Copolymer", application: "Drug Delivery System", trl: "TRL 5", patents: "18 Patents", category1: "Bio-based primary feedstocks", category2: "Polymerization", category3: "Materials", category4: "Pharma & Healthcare" },
  { feedstock: "Potato Starch", technology: "Direct Polycondensation", product: "PLA Oligomer", application: "Biodegradable Lubricant", trl: "TRL 4", patents: "4 Patents", category1: "Bio-based primary feedstocks", category2: "Polymerization", category3: "Materials", category4: "Chemical Industry" },
  { feedstock: "Corn Starch", technology: "Membrane Separation", product: "Concentrated Lactic Acid", application: "Industrial Descaler", trl: "TRL 8", patents: "14 Patents", category1: "Bio-based primary feedstocks", category2: "Purification", category3: "Chemicals", category4: "Chemical Industry" },
  { feedstock: "Food Waste", technology: "Solid-State Fermentation", product: "Lactic Acid", application: "Compost Accelerator", trl: "TRL 5", patents: "3 Patents", category1: "Waste streams", category2: "Fermentation", category3: "Chemicals", category4: "Agriculture" },
  { feedstock: "Bagasse", technology: "Steam Explosion + Fermentation", product: "Lactic Acid", application: "Construction Additive", trl: "TRL 5", patents: "6 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Chemicals", category4: "Construction" },
  { feedstock: "Microalgae Biomass", technology: "Cell-Recycled Fermentation", product: "Lactic Acid", application: "Algae-Based Skin Serum", trl: "TRL 3", patents: "2 Patents", category1: "Bio-based primary feedstocks", category2: "Fermentation", category3: "Chemicals", category4: "Personal Care" },
  { feedstock: "Rice Bran", technology: "Heterofermentation", product: "Lactic Acid", application: "Rice Wine Fermentation", trl: "TRL 7", patents: "5 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Chemicals", category4: "Food & Beverage" },
  { feedstock: "Corn Stover", technology: "Electrodialysis", product: "Ammonium Lactate", application: "Moisturizer Active", trl: "TRL 6", patents: "9 Patents", category1: "Agricultural residues", category2: "Purification", category3: "Chemicals", category4: "Personal Care" },
  { feedstock: "Sugarcane Molasses", technology: "Crystallization", product: "Zinc Lactate", application: "Oral Care Ingredient", trl: "TRL 7", patents: "8 Patents", category1: "Industrial side-streams", category2: "Purification", category3: "Chemicals", category4: "Personal Care" },
  { feedstock: "Wheat Straw", technology: "Simultaneous Saccharification & Fermentation", product: "Lactic Acid", application: "Biodegradable Adhesive", trl: "TRL 4", patents: "3 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Materials", category4: "Advanced Manufacturing" },
  { feedstock: "Corn Starch", technology: "Homofermentation (Lactobacillus)", product: "Lactic Acid", application: "Textile Dyeing Aid", trl: "TRL 8", patents: "11 Patents", category1: "Bio-based primary feedstocks", category2: "Fermentation", category3: "Chemicals", category4: "Textiles" },
  { feedstock: "Cassava Starch", technology: "Continuous Fermentation (CSTR)", product: "Lactic Acid", application: "Leather Tanning", trl: "TRL 6", patents: "5 Patents", category1: "Bio-based primary feedstocks", category2: "Fermentation", category3: "Chemicals", category4: "Textiles" },
  { feedstock: "Glucose Syrup", technology: "Homofermentation (Lactobacillus)", product: "Lactic Acid", application: "Confectionery Acidulant", trl: "TRL 9", patents: "17 Patents", category1: "Bio-based primary feedstocks", category2: "Fermentation", category3: "Chemicals", category4: "Food & Beverage" },
  { feedstock: "Whey Permeate", technology: "Reactive Distillation", product: "Butyl Lactate", application: "Paint Solvent", trl: "TRL 6", patents: "7 Patents", category1: "Industrial side-streams", category2: "Purification", category3: "Chemicals", category4: "Chemical Industry" },
  { feedstock: "Food Waste", technology: "Engineered E. coli Fermentation", product: "Lactic Acid", application: "Water Treatment Agent", trl: "TRL 3", patents: "4 Patents", category1: "Waste streams", category2: "Fermentation", category3: "Chemicals", category4: "Environmental" },
  { feedstock: "Sorghum Grain", technology: "Direct Polycondensation", product: "PLA Wax", application: "Candle Making", trl: "TRL 5", patents: "2 Patents", category1: "Bio-based primary feedstocks", category2: "Polymerization", category3: "Materials", category4: "Household" },
  { feedstock: "Corn Starch", technology: "Ring-Opening Polymerization", product: "PLGA Copolymer", application: "Tissue Engineering Scaffold", trl: "TRL 4", patents: "24 Patents", category1: "Bio-based primary feedstocks", category2: "Polymerization", category3: "Materials", category4: "Pharma & Healthcare" },
  { feedstock: "Potato Starch", technology: "Homofermentation (Lactobacillus)", product: "Lactic Acid", application: "Bakery Preservative", trl: "TRL 9", patents: "13 Patents", category1: "Bio-based primary feedstocks", category2: "Fermentation", category3: "Chemicals", category4: "Food & Beverage" },
  { feedstock: "Sugar Beet Pulp", technology: "Cell-Recycled Fermentation", product: "Lactic Acid", application: "Biodegradable Straw", trl: "TRL 5", patents: "4 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Materials", category4: "Packaging" },
  { feedstock: "Corn Stover", technology: "Homofermentation (Lactobacillus)", product: "Lactic Acid", application: "Detergent Builder", trl: "TRL 7", patents: "10 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Chemicals", category4: "Household" },
  { feedstock: "Sugarcane Molasses", technology: "Solid-State Fermentation", product: "Lactic Acid", application: "Ensilage Inoculant", trl: "TRL 8", patents: "9 Patents", category1: "Industrial side-streams", category2: "Fermentation", category3: "Chemicals", category4: "Agriculture" },
  { feedstock: "Glucose Syrup", technology: "Electrodialysis", product: "Potassium Lactate", application: "Fire Suppressant", trl: "TRL 7", patents: "6 Patents", category1: "Bio-based primary feedstocks", category2: "Purification", category3: "Chemicals", category4: "Chemical Industry" },
  { feedstock: "Corn Starch", technology: "Azeotropic Dehydration", product: "Stereocomplex PLA", application: "Heat-Resistant Packaging", trl: "TRL 5", patents: "11 Patents", category1: "Bio-based primary feedstocks", category2: "Polymerization", category3: "Materials", category4: "Packaging" },
  { feedstock: "Whey Permeate", technology: "Homofermentation (Lactobacillus)", product: "Lactic Acid", application: "Yogurt Production", trl: "TRL 9", patents: "33 Patents", category1: "Industrial side-streams", category2: "Fermentation", category3: "Chemicals", category4: "Food & Beverage" },
  { feedstock: "Rice Straw", technology: "Alkaline Pretreatment + Fermentation", product: "Lactic Acid", application: "Fertilizer Chelator", trl: "TRL 4", patents: "3 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Chemicals", category4: "Agriculture" },
  { feedstock: "Food Waste", technology: "Continuous Fermentation (CSTR)", product: "Lactic Acid", application: "Bioplastic Pellets", trl: "TRL 4", patents: "5 Patents", category1: "Waste streams", category2: "Fermentation", category3: "Materials", category4: "Packaging" },
  { feedstock: "Cassava Starch", technology: "Membrane Separation", product: "Purified Lactic Acid", application: "Semiconductor Cleaning", trl: "TRL 6", patents: "8 Patents", category1: "Bio-based primary feedstocks", category2: "Purification", category3: "Chemicals", category4: "Advanced Manufacturing" },
  { feedstock: "Barley Straw", technology: "Simultaneous Saccharification & Fermentation", product: "Lactic Acid", application: "Animal Hygiene Product", trl: "TRL 5", patents: "3 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Chemicals", category4: "Agriculture" },
  { feedstock: "Corn Starch", technology: "Homofermentation (Lactobacillus)", product: "Lactic Acid", application: "Infant Formula Acidulant", trl: "TRL 9", patents: "26 Patents", category1: "Bio-based primary feedstocks", category2: "Fermentation", category3: "Chemicals", category4: "Food & Beverage" },
  { feedstock: "Sugarcane Molasses", technology: "Ion Exchange Chromatography", product: "Pharma-Grade Lactic Acid", application: "Wound Healing Gel", trl: "TRL 7", patents: "14 Patents", category1: "Industrial side-streams", category2: "Purification", category3: "Chemicals", category4: "Pharma & Healthcare" },
  { feedstock: "Wheat Bran", technology: "Heterofermentation", product: "Lactic Acid + Acetic Acid", application: "Natural Pickling Agent", trl: "TRL 8", patents: "7 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Chemicals", category4: "Food & Beverage" },
  { feedstock: "Corn Stover", technology: "Gas Fermentation (CO₂)", product: "Lactic Acid", application: "Carbon-Capture Chemical", trl: "TRL 2", patents: "1 Patent", category1: "Agricultural residues", category2: "Fermentation", category3: "Chemicals", category4: "Environmental" },
  { feedstock: "Microalgae Biomass", technology: "Engineered Yeast Fermentation", product: "Lactic Acid", application: "Sustainable Aviation Additive", trl: "TRL 2", patents: "1 Patent", category1: "Bio-based primary feedstocks", category2: "Fermentation", category3: "Chemicals", category4: "Automotive" },
  { feedstock: "Glucose Syrup", technology: "Crystallization", product: "Manganese Lactate", application: "Dietary Supplement", trl: "TRL 6", patents: "5 Patents", category1: "Bio-based primary feedstocks", category2: "Purification", category3: "Chemicals", category4: "Pharma & Healthcare" },
  { feedstock: "Corn Starch", technology: "Reactive Distillation", product: "Methyl Lactate", application: "Green Propellant", trl: "TRL 3", patents: "4 Patents", category1: "Bio-based primary feedstocks", category2: "Purification", category3: "Chemicals", category4: "Chemical Industry" },
  { feedstock: "Food Waste", technology: "Solid-State Fermentation", product: "Lactic Acid", application: "Soil pH Amendment", trl: "TRL 6", patents: "4 Patents", category1: "Waste streams", category2: "Fermentation", category3: "Chemicals", category4: "Agriculture" },
  { feedstock: "Potato Starch", technology: "Continuous Fermentation (CSTR)", product: "Lactic Acid", application: "Dishwasher Rinse Aid", trl: "TRL 6", patents: "5 Patents", category1: "Bio-based primary feedstocks", category2: "Fermentation", category3: "Chemicals", category4: "Household" },
  { feedstock: "Whey Permeate", technology: "Molecular Distillation", product: "Ultra-Pure L-LA", application: "Ophthalmic Solution", trl: "TRL 5", patents: "10 Patents", category1: "Industrial side-streams", category2: "Purification", category3: "Chemicals", category4: "Pharma & Healthcare" },
  { feedstock: "Bagasse", technology: "Heterofermentation", product: "Lactic Acid", application: "Cement Retarder", trl: "TRL 5", patents: "3 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Chemicals", category4: "Construction" },
  { feedstock: "Sorghum Grain", technology: "Membrane Separation", product: "Concentrated Lactic Acid", application: "Pool pH Control", trl: "TRL 7", patents: "6 Patents", category1: "Bio-based primary feedstocks", category2: "Purification", category3: "Chemicals", category4: "Household" },
  { feedstock: "Corn Starch", technology: "Direct Polycondensation", product: "PLA Coating", application: "Paper Cup Lining", trl: "TRL 7", patents: "16 Patents", category1: "Bio-based primary feedstocks", category2: "Polymerization", category3: "Materials", category4: "Packaging" },
  { feedstock: "Rice Bran", technology: "Homofermentation (Lactobacillus)", product: "Lactic Acid", application: "Noodle Processing Aid", trl: "TRL 8", patents: "8 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Chemicals", category4: "Food & Beverage" },
  { feedstock: "Cassava Starch", technology: "Azeotropic Dehydration", product: "PLA Blend", application: "Compostable Bag", trl: "TRL 6", patents: "9 Patents", category1: "Bio-based primary feedstocks", category2: "Polymerization", category3: "Materials", category4: "Packaging" },
  { feedstock: "Sugarcane Molasses", technology: "Engineered Yeast Fermentation", product: "D-Lactic Acid", application: "Optical Materials", trl: "TRL 3", patents: "5 Patents", category1: "Industrial side-streams", category2: "Fermentation", category3: "Chemicals", category4: "Advanced Manufacturing" },
  { feedstock: "Corn Stover", technology: "Electrodialysis", product: "Lithium Lactate", application: "Battery Electrolyte", trl: "TRL 2", patents: "2 Patents", category1: "Agricultural residues", category2: "Purification", category3: "Chemicals", category4: "Advanced Manufacturing" },
  { feedstock: "Food Waste", technology: "Gas Fermentation (CO₂)", product: "Lactic Acid", application: "Carbon-Capture Polymer", trl: "TRL 1", patents: "1 Patent", category1: "Waste streams", category2: "Fermentation", category3: "Materials", category4: "Environmental" },
  { feedstock: "Wheat Straw", technology: "Cell-Recycled Fermentation", product: "Lactic Acid", application: "Herbicide Adjuvant", trl: "TRL 3", patents: "2 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Chemicals", category4: "Agriculture" },
  { feedstock: "Corn Starch", technology: "Homofermentation (Lactobacillus)", product: "Lactic Acid", application: "Sports Drink Acidulant", trl: "TRL 9", patents: "12 Patents", category1: "Bio-based primary feedstocks", category2: "Fermentation", category3: "Chemicals", category4: "Food & Beverage" },
  { feedstock: "Glucose Syrup", technology: "Ring-Opening Polymerization", product: "PLA Microspheres", application: "Controlled Drug Release", trl: "TRL 4", patents: "20 Patents", category1: "Bio-based primary feedstocks", category2: "Polymerization", category3: "Materials", category4: "Pharma & Healthcare" },
  { feedstock: "Whey Permeate", technology: "Ion Exchange Chromatography", product: "Food-Grade Lactic Acid", application: "Sauerkraut Production", trl: "TRL 9", patents: "14 Patents", category1: "Industrial side-streams", category2: "Purification", category3: "Chemicals", category4: "Food & Beverage" },
  { feedstock: "Barley Straw", technology: "Homofermentation (Lactobacillus)", product: "Lactic Acid", application: "Bio-based Ink", trl: "TRL 4", patents: "3 Patents", category1: "Agricultural residues", category2: "Fermentation", category3: "Chemicals", category4: "Advanced Manufacturing" },
  { feedstock: "Fructose", technology: "Homofermentation (Lactobacillus)", product: "Lactic Acid", application: "PLA Packaging", trl: "TRL 9", patents: "30 Patents", category1: "Intermediates/precursors", category2: "Fermentation", category3: "Chemicals", category4: "Packaging" },
  { feedstock: "Fructose", technology: "Homofermentation (Lactobacillus)", product: "Lactic Acid", application: "Food Acidulant", trl: "TRL 9", patents: "25 Patents", category1: "Intermediates/precursors", category2: "Fermentation", category3: "Chemicals", category4: "Food & Beverage" },
  { feedstock: "Fructose", technology: "Continuous Fermentation (CSTR)", product: "Lactic Acid", application: "Green Solvents", trl: "TRL 7", patents: "12 Patents", category1: "Intermediates/precursors", category2: "Fermentation", category3: "Chemicals", category4: "Chemical Industry" },
  { feedstock: "Fructose", technology: "Engineered Yeast Fermentation", product: "D-Lactic Acid", application: "Stereocomplex PLA", trl: "TRL 5", patents: "8 Patents", category1: "Intermediates/precursors", category2: "Fermentation", category3: "Chemicals", category4: "Advanced Manufacturing" },
  { feedstock: "Fructose", technology: "Membrane Separation", product: "Purified Lactic Acid", application: "Pharmaceutical Excipient", trl: "TRL 8", patents: "18 Patents", category1: "Intermediates/precursors", category2: "Purification", category3: "Chemicals", category4: "Pharma & Healthcare" },
];

const ValueChainPathways = () => {
  const { category, topic } = useParams<{ category: string; topic: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Parse opportunity map filter from URL params
  const urlParams = new URLSearchParams(location.search);
  const opportunityFilterType = urlParams.get('filterType') as 'feedstock' | 'technology' | 'product' | 'application' | null;
  const opportunityFilterValues = urlParams.get('filterValues')?.split('||').filter(Boolean) || [];
  const feedstockFromUrl = urlParams.get('feedstock') || '';
  // Transition state
  const [transitioningPathway, setTransitioningPathway] = useState<number | null>(null);
  const [selectedPathway, setSelectedPathway] = useState<string | null>(null);
  const [savedPathways, setSavedPathways] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('savedPathways');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [favoritedPathways, setFavoritedPathways] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('favoritedPathways');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [pathwayLikeCounts, setPathwayLikeCounts] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem('pathwayLikeCounts');
    return saved ? JSON.parse(saved) : {};
  });
  const [dislikedPathways, setDislikedPathways] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('dislikedPathways');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [activeTab, setActiveTab] = useState<string>('all');
  const [showAllPathways, setShowAllPathways] = useState(false);
  const [timelineValue, setTimelineValue] = useState<number[]>([0]);
  const [technologyFilter, setTechnologyFilter] = useState<string>('all');
  const [feedstockFilter, setFeedstockFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [applicationFilter, setApplicationFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(feedstockFromUrl);
  const [viabilityFilter, setViabilityFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [customPathways, setCustomPathways] = useState<CustomPathway[]>(() => {
    const saved = localStorage.getItem('customPathways');
    return saved ? JSON.parse(saved) : [];
  });

  // Get timeline label based on slider value
  const getTimelineLabel = (value: number) => {
    const labels = ['0 years', '2 years', '4 years', '6 years', '8 years', '10+ years'];
    return labels[value] || '0 years';
  };
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pathwayToDelete, setPathwayToDelete] = useState<number | null>(null);
  const [newPathway, setNewPathway] = useState<CustomPathway>({
    feedstock: '',
    technology: '',
    product: '',
    application: '',
    trl: 'TRL 6',
    category1: '',
    category2: '',
    category3: '',
    category4: ''
  });
  const [newProject, setNewProject] = useState({
    name: '',
    owner: '',
    goal: ''
  });
  
  // State for existing projects
  const [existingProjects, setExistingProjects] = useState<Array<{id: string; name: string; pathways: any[]}>>([]);
  const [isAddingToExisting, setIsAddingToExisting] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  
  // Fetch existing projects
  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from('projects').select('id, name, pathways');
      if (data && !error) {
        setExistingProjects(data.map(p => ({
          id: p.id,
          name: p.name,
          pathways: Array.isArray(p.pathways) ? p.pathways : []
        })));
      }
    };
    fetchProjects();
  }, [isProjectDialogOpen]);

  const isProductRoute = category === 'Product';
  const decodedTopic = decodeURIComponent(topic || "");
  
  // Helper: get TRL number
  const getTRLNumber = (trl: string) => parseInt(trl.replace('TRL ', ''));
  
  // Helper: get viability category
  const getViability = (trl: string) => {
    const n = getTRLNumber(trl);
    if (n >= 8) return 'Commercial';
    if (n >= 6) return 'Pilot';
    if (n >= 4) return 'Lab';
    return 'R&D';
  };

  const getViabilityColor = (viability: string) => {
    switch (viability) {
      case 'Commercial': return { dot: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', bar: 'bg-green-500' };
      case 'Pilot': return { dot: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', bar: 'bg-blue-500' };
      case 'Lab': return { dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-500' };
      case 'R&D': return { dot: 'bg-red-400', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', bar: 'bg-red-400' };
      default: return { dot: 'bg-muted-foreground', text: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border', bar: 'bg-muted-foreground' };
    }
  };
  
  // Helper function to get TRL stage label
  const getTRLStageLabel = (trl: string) => {
    const trlNumber = parseInt(trl.replace('TRL ', ''));
    if (trlNumber >= 8) return 'Commercial';
    if (trlNumber >= 6) return 'Pilot';
    if (trlNumber >= 4) return 'Lab';
    return 'R&D';
  };

  // Feedstock profile data for pathway cards
  const getFeedstockProfile = (feedstockName: string) => {
    const profiles: Record<string, { category: string; price: string; quantity: string; description: string }> = {
      'Corn Starch': { category: 'Bio-based primary', price: '€280–350/t', quantity: '85M t/yr', description: 'Primary starch feedstock for lactic acid fermentation. High glucose yield upon hydrolysis.' },
      'Sugarcane Molasses': { category: 'Industrial side-stream', price: '€80–120/t', quantity: '65M t/yr', description: 'Sugar-rich byproduct of cane processing. Cost-effective carbon source for Lactobacillus fermentation.' },
      'Whey Permeate': { category: 'Industrial side-stream', price: '€50–90/t', quantity: '40M t/yr', description: 'Lactose-rich dairy byproduct, ideal substrate for lactic acid bacteria with minimal pretreatment.' },
      'Corn Stover': { category: 'Agricultural residue', price: '€25–40/t', quantity: '60M t/yr', description: 'Lignocellulosic residue requiring pretreatment before fermentation to lactic acid.' },
      'Cassava Starch': { category: 'Bio-based primary', price: '€200–280/t', quantity: '35M t/yr', description: 'Tropical starch crop with high fermentable sugar content for lactic acid production.' },
      'Glucose Syrup': { category: 'Bio-based primary', price: '€350–450/t', quantity: '30M t/yr', description: 'Refined glucose solution providing consistent, high-purity substrate for fermentation.' },
      'Food Waste': { category: 'Waste stream', price: '€0–15/t', quantity: '88M t/yr', description: 'Mixed organic waste suitable for mixed-culture lactic acid fermentation processes.' },
      'Potato Starch': { category: 'Bio-based primary', price: '€300–380/t', quantity: '12M t/yr', description: 'European starch crop providing clean glucose for food-grade lactic acid production.' },
      'Microalgae Biomass': { category: 'Bio-based primary', price: '€200–500/t', quantity: '0.5M t/yr', description: 'Novel photosynthetic feedstock for CO₂-based lactic acid pathways. Early-stage.' },
    };
    return profiles[feedstockName] || {
      category: 'Biomass Feedstock',
      price: '€15–400/t',
      quantity: 'Variable',
      description: `${feedstockName} is a feedstock suitable for lactic acid production via fermentation.`
    };
  };

  // Generate a mock description for pathways
  const getPathwayDescription = (pathway: CustomPathway, index: number) => {
    const descriptions = [
      `Strongest pathway — established tech meeting massive demand in ${pathway.category4}.`,
      `Well-established conversion route with proven scalability. Multiple commercial references.`,
      `Growing market demand with competitive positioning. Key players already scaling.`,
      `Emerging technology with strong IP position. EU policy tailwinds support adoption.`,
      `Novel approach combining ${pathway.technology.toLowerCase()} with ${pathway.application.toLowerCase()}. Early but promising.`,
      `Circular economy pathway leveraging ${pathway.feedstock.toLowerCase()} waste streams effectively.`,
      `Cost-competitive route with established supply chain for ${pathway.product.toLowerCase()}.`,
      `High-value application in ${pathway.category4.toLowerCase()} with growing green premium.`,
    ];
    return descriptions[index % descriptions.length];
  };
  
  // Handle card click with transition animation
  const handleCardClick = (pathwayIndex: number) => {
    setTransitioningPathway(pathwayIndex);
    setTimeout(() => {
      navigate(`/landscape/${category}/${topic}/value-chain/pathways/${pathwayIndex}`);
    }, 400);
  };
  
  // Combine predefined and custom pathways
  const allPathways = [...PREDEFINED_PATHWAYS, ...customPathways.map(p => ({...p, isCustom: true}))];

  // Viability counts
  const viabilityCounts = useMemo(() => {
    const counts = { Commercial: 0, Pilot: 0, Lab: 0, 'R&D': 0 };
    allPathways.forEach(p => {
      const v = getViability(p.trl);
      counts[v as keyof typeof counts]++;
    });
    return counts;
  }, [allPathways.length]);

  // Filtered pathways
  const filteredPathways = useMemo(() => {
    let filtered = allPathways.map((pathway, index) => ({ pathway, originalIndex: index }));

    // Apply opportunity map pre-filter from URL params
    if (opportunityFilterType && opportunityFilterValues.length > 0) {
      filtered = filtered.filter(({ pathway }) => {
        if (opportunityFilterType === 'feedstock') return opportunityFilterValues.includes(pathway.feedstock);
        if (opportunityFilterType === 'technology') return opportunityFilterValues.includes(pathway.technology);
        if (opportunityFilterType === 'product') return opportunityFilterValues.includes(pathway.product);
        if (opportunityFilterType === 'application') return opportunityFilterValues.includes(pathway.application);
        return true;
      });
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(({ pathway }) =>
        pathway.feedstock.toLowerCase().includes(q) ||
        pathway.technology.toLowerCase().includes(q) ||
        pathway.product.toLowerCase().includes(q) ||
        pathway.application.toLowerCase().includes(q)
      );
    }

    if (viabilityFilter) {
      filtered = filtered.filter(({ pathway }) => getViability(pathway.trl) === viabilityFilter);
    }

    if (feedstockFilter !== 'all') {
      filtered = filtered.filter(({ pathway }) => pathway.category1 === feedstockFilter);
    }

    if (technologyFilter !== 'all') {
      filtered = filtered.filter(({ pathway }) => pathway.category2 === technologyFilter);
    }

    if (applicationFilter !== 'all') {
      filtered = filtered.filter(({ pathway }) => pathway.category4 === applicationFilter);
    }

    if (activeTab === 'saved') {
      filtered = filtered.filter(({ originalIndex }) => savedPathways.has(originalIndex));
    }

    // Sort: disliked at bottom, then by TRL descending
    filtered.sort((a, b) => {
      const aDisliked = dislikedPathways.has(a.originalIndex);
      const bDisliked = dislikedPathways.has(b.originalIndex);
      if (aDisliked && !bDisliked) return 1;
      if (!aDisliked && bDisliked) return -1;
      return getTRLNumber(b.pathway.trl) - getTRLNumber(a.pathway.trl);
    });

    return filtered;
  }, [allPathways.length, searchQuery, viabilityFilter, feedstockFilter, technologyFilter, applicationFilter, activeTab, savedPathways, dislikedPathways, opportunityFilterType, opportunityFilterValues.join(',')]);

  useEffect(() => {
    localStorage.setItem('savedPathways', JSON.stringify(Array.from(savedPathways)));
  }, [savedPathways]);

  useEffect(() => {
    localStorage.setItem('customPathways', JSON.stringify(customPathways));
  }, [customPathways]);

  useEffect(() => {
    localStorage.setItem('favoritedPathways', JSON.stringify(Array.from(favoritedPathways)));
  }, [favoritedPathways]);

  useEffect(() => {
    localStorage.setItem('pathwayLikeCounts', JSON.stringify(pathwayLikeCounts));
  }, [pathwayLikeCounts]);

  useEffect(() => {
    localStorage.setItem('dislikedPathways', JSON.stringify(Array.from(dislikedPathways)));
  }, [dislikedPathways]);

  const toggleSavePathway = (index: number) => {
    setSavedPathways(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleFavorite = (index: number) => {
    setFavoritedPathways(prev => {
      const newSet = new Set(prev);
      const isCurrentlyFavorited = newSet.has(index);
      
      if (isCurrentlyFavorited) {
        newSet.delete(index);
        // Decrease count
        setPathwayLikeCounts(prevCounts => ({
          ...prevCounts,
          [index]: Math.max((prevCounts[index] || 0) - 1, 0)
        }));
      } else {
        newSet.add(index);
        // Increase count
        setPathwayLikeCounts(prevCounts => ({
          ...prevCounts,
          [index]: (prevCounts[index] || 0) + 1
        }));
      }
      return newSet;
    });
  };

  const toggleDislike = (index: number) => {
    setDislikedPathways(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
        toast({
          title: "Removed from disliked",
          description: "Pathway preference updated",
        });
      } else {
        newSet.add(index);
        toast({
          title: "Marked as don't like",
          description: "Pathway moved to bottom of list",
        });
      }
      return newSet;
    });
  };

  const handleDeleteClick = (index: number) => {
    setPathwayToDelete(index);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (pathwayToDelete !== null) {
      // Remove from custom pathways if it's a custom pathway
      const pathway = allPathways[pathwayToDelete];
      if (pathway.isCustom) {
        const customIndex = customPathways.findIndex(p => 
          p.feedstock === pathway.feedstock && 
          p.technology === pathway.technology && 
          p.product === pathway.product
        );
        if (customIndex !== -1) {
          setCustomPathways(prev => prev.filter((_, i) => i !== customIndex));
        }
      }
      
      // Remove from saved pathways
      setSavedPathways(prev => {
        const newSet = new Set(prev);
        newSet.delete(pathwayToDelete);
        return newSet;
      });
      
      // Remove from favorited pathways
      setFavoritedPathways(prev => {
        const newSet = new Set(prev);
        newSet.delete(pathwayToDelete);
        return newSet;
      });
      
      // Remove from like counts
      setPathwayLikeCounts(prev => {
        const newCounts = {...prev};
        delete newCounts[pathwayToDelete];
        return newCounts;
      });
      
      toast({
        title: "Pathway Deleted",
        description: "The pathway has been removed",
      });
    }
    setDeleteDialogOpen(false);
    setPathwayToDelete(null);
  };

  const handleCreatePathway = () => {
    if (!newPathway.feedstock || !newPathway.technology || !newPathway.product || !newPathway.application) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setCustomPathways(prev => [...prev, newPathway]);
    setIsDialogOpen(false);
    setNewPathway({
      feedstock: '',
      technology: '',
      product: '',
      application: '',
      trl: 'TRL 6',
      category1: '',
      category2: '',
      category3: '',
      category4: ''
    });
    
    toast({
      title: "Pathway Created",
      description: "Your custom pathway has been added successfully"
    });
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="h-full bg-background flex flex-col">
        <div className="max-w-[1400px] w-full mx-auto px-6 pt-4 pb-3 flex items-center justify-between flex-shrink-0">
           <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={() => {
             const fromPage = urlParams.get('from');
             if (fromPage === 'patents') {
               navigate(`/landscape/${category}/${topic}/patents`);
             } else {
               navigate(`/landscape/${category}/${topic}/value-chain`);
             }
           }}>
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Button>
        </div>

        <div className="max-w-[1400px] w-full mx-auto px-6 pb-6 flex-1 min-h-0">
        {/* Two-column layout: Page card + Filter sidebar */}
        <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 280px', rowGap: '12px' }}>
          {/* ROW 1: Titles - sticky */}
          <div className="col-span-2 grid gap-5 sticky top-12 z-20 bg-background py-2 -mx-6 px-6" style={{ gridTemplateColumns: '1fr 280px' }}>
            <div>
              <h1 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pathway Explorer</h1>
            </div>
            <div>
              <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Advanced Filters</h2>
            </div>
          </div>

          {/* ROW 2: Cards */}
          {/* LEFT: Main page card */}
          <div className="border border-border rounded-lg bg-card p-5 shadow-sm min-w-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                  Every pathway from <span className="font-bold text-foreground">{decodedTopic}</span> to a market application, scored for viability. Compare, shortlist, and decide which pathways deserve your attention.
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Showing <span className="font-bold text-foreground">{filteredPathways.length}</span> of {allPathways.length} pathways</span>
                </div>
              </div>

              {/* Opportunity Map filter banner */}
              {opportunityFilterType && opportunityFilterValues.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20 mb-2">
                  <span className="text-[10px] text-muted-foreground">Filtered by {opportunityFilterType}:</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {opportunityFilterValues.map((v) => (
                      <span key={v} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                        {v}
                      </span>
                    ))}
                  </div>
                  <button onClick={() => navigate(`/landscape/${category}/${topic}/value-chain/pathways`, { replace: true })} className="ml-auto text-[10px] text-muted-foreground hover:text-foreground underline">
                    Clear filter
                  </button>
                </div>
              )}

            {/* Viability Summary Cards */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {(['Commercial', 'Pilot', 'Lab', 'R&D'] as const).map((level) => {
                const colors = getViabilityColor(level);
                const count = viabilityCounts[level];
                const pct = allPathways.length > 0 ? Math.round((count / allPathways.length) * 100) : 0;
                const isActive = viabilityFilter === level;
                return (
                  <button
                    key={level}
                    onClick={() => setViabilityFilter(viabilityFilter === level ? null : level)}
                    className={`text-left border rounded-lg p-3 transition-all ${
                      isActive ? `${colors.border} ${colors.bg} border-2 shadow-sm` : 'border-border bg-background hover:border-muted-foreground/30'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${colors.text}`}>{level}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-foreground">{count}</span>
                      <span className="text-[10px] text-muted-foreground">pathways ({pct}%)</span>
                    </div>
                    <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${colors.bar} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Search + Sort */}
            <div className="flex items-center gap-3 mb-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pathways..."
                  className="pl-8 h-8 text-xs bg-background"
                />
              </div>
              <Button variant="outline" size="sm" className="ml-auto h-7 text-[10px] text-muted-foreground gap-1 px-2.5">
                <ArrowUpDown className="w-3 h-3" />
                Score: high → low
              </Button>
            </div>

            <div className="space-y-2">
              {filteredPathways.map(({ pathway, originalIndex }) => {
                const trlNum = getTRLNumber(pathway.trl);
                const viability = getViability(pathway.trl);
                const colors = getViabilityColor(viability);
              return (
                <div
                  key={originalIndex}
                  className={`border border-border rounded-lg bg-card px-3 py-2.5 cursor-pointer hover:shadow-md transition-all duration-300 ${
                    transitioningPathway === originalIndex ? 'animate-fade-out scale-95 opacity-50' : ''
                  }`}
                  onClick={() => handleCardClick(originalIndex)}
                >
                  {/* Top row: VCG Scoring + TRL badge + Actions */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const score = Math.max(20, 95 - originalIndex * 3);
                        const scoreColor = score >= 70 ? 'text-primary font-bold' : score >= 40 ? 'text-amber-600 font-bold' : 'text-muted-foreground font-bold';
                        return (
                          <span className="text-[10px] text-muted-foreground border border-border rounded px-2 py-0.5">
                            VCG Scoring: <span className={scoreColor}>{score}</span>
                          </span>
                        );
                      })()}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}>
                        {getTRLStageLabel(pathway.trl)}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="p-1 hover:bg-muted rounded-md transition-colors"
                              onClick={(e) => { e.stopPropagation(); toggleSavePathway(originalIndex); }}
                            >
                              <Bookmark className={`w-3.5 h-3.5 transition-colors ${savedPathways.has(originalIndex) ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-primary'}`} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top"><p>Save pathway</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="p-1 hover:bg-muted rounded-md transition-colors"
                              onClick={(e) => { e.stopPropagation(); toggleDislike(originalIndex); }}
                            >
                              <ThumbsDown className={`w-3.5 h-3.5 transition-colors ${dislikedPathways.has(originalIndex) ? 'fill-destructive text-destructive' : 'text-muted-foreground hover:text-destructive'}`} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top"><p>Dislike pathway</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => { e.stopPropagation(); handleCardClick(originalIndex); }}
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top"><p>View details</p></TooltipContent>
                        </Tooltip>
                    </div>
                  </div>

                  {/* Pathway flow row */}
                  <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-x-2">
                    {([
                      { label: 'Feedstock', value: pathway.feedstock, isAnchor: !isProductRoute && category === 'Feedstock' },
                      { label: 'Process', value: pathway.technology, isAnchor: false },
                      { label: 'Product', value: pathway.product, isAnchor: isProductRoute },
                      { label: 'Application', value: pathway.application, isAnchor: false },
                    ]).map((node, pi) =>
                      <React.Fragment key={pi}>
                        {pi > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 mt-3" />}
                        <div>
                          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider block mb-0.5">{node.label}</span>
                          <div className={`rounded-md border px-2 py-1.5 ${node.isAnchor ? 'border-primary/50 bg-primary/10' : 'border-border bg-muted/30'}`}>
                            <span className={`text-[11px] font-medium ${node.isAnchor ? 'text-primary' : 'text-foreground'}`}>{node.value}</span>
                          </div>
                        </div>
                      </React.Fragment>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredPathways.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No pathways match your current filters.</p>
                <Button variant="link" size="sm" className="text-xs" onClick={() => { setSearchQuery(''); setViabilityFilter(null); setActiveTab('all'); }}>
                  Clear filters
                </Button>
              </div>
            )}
            </div>
          </div>

          {/* RIGHT: Filter Sidebar */}
          <div className="border border-border rounded-lg bg-card px-3 py-3 sticky top-16 self-start shadow-sm">
              <div className="flex flex-col gap-0">

              {/* Pathway */}
              <div className="pb-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pathway</span>
                <div className="mt-1.5 space-y-1">
                  <div>
                    <label className="text-[9px] font-medium text-muted-foreground block mb-0.5">VCG Score</label>
                    <Select><SelectTrigger className="w-full text-[11px] h-7 bg-background"><SelectValue placeholder="Any" /></SelectTrigger><SelectContent><SelectItem value="all">Any</SelectItem><SelectItem value="90">90+</SelectItem><SelectItem value="75">75+</SelectItem><SelectItem value="50">50+</SelectItem><SelectItem value="25">25+</SelectItem></SelectContent></Select>
                  </div>
                </div>
              </div>

              <div className="border-t border-border" />

              {/* Feedstock - hidden when feedstock is the anchor */}
              {category !== 'Feedstock' && (
              <>
              <div className="py-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Feedstock</span>
                <div className="mt-1.5 space-y-1">
                  <div>
                    <label className="text-[9px] font-medium text-muted-foreground block mb-1">Quantity (M tons/yr)</label>
                    <Slider defaultValue={[0]} max={100} step={10} className="w-full" />
                    <div className="flex justify-between mt-0.5">
                      <span className="text-[8px] text-muted-foreground">0</span>
                      <span className="text-[8px] text-muted-foreground">20</span>
                      <span className="text-[8px] text-muted-foreground">40</span>
                      <span className="text-[8px] text-muted-foreground">60</span>
                      <span className="text-[8px] text-muted-foreground">80</span>
                      <span className="text-[8px] text-muted-foreground">100+</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-medium text-muted-foreground block mb-0.5">Category</label>
                    <Select><SelectTrigger className="w-full text-[11px] h-7 bg-background"><SelectValue placeholder="Any" /></SelectTrigger><SelectContent><SelectItem value="all">Any</SelectItem><SelectItem value="sugar">Sugar-based</SelectItem><SelectItem value="lignocellulosic">Lignocellulosic</SelectItem><SelectItem value="starch">Starch-based</SelectItem><SelectItem value="oil">Oil-based</SelectItem><SelectItem value="waste">Waste streams</SelectItem></SelectContent></Select>
                  </div>
                  <div>
                    <label className="text-[9px] font-medium text-muted-foreground block mb-0.5">Seasonal Variation (Availability)</label>
                    <Select><SelectTrigger className="w-full text-[11px] h-7 bg-background"><SelectValue placeholder="Any" /></SelectTrigger><SelectContent><SelectItem value="all">Any</SelectItem><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select>
                  </div>
                </div>
              </div>
              <div className="border-t border-border" />
              </>
              )}

              {/* Process */}
              <div className="py-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Process</span>
                <div className="mt-1.5 space-y-1">
                  <div>
                    <label className="text-[9px] font-medium text-muted-foreground block mb-0.5">Category</label>
                    <Select><SelectTrigger className="w-full text-[11px] h-7 bg-background"><SelectValue placeholder="Any" /></SelectTrigger><SelectContent><SelectItem value="all">Any</SelectItem><SelectItem value="fermentation">Fermentation</SelectItem><SelectItem value="chemical">Chemical conversion</SelectItem><SelectItem value="enzymatic">Enzymatic</SelectItem><SelectItem value="thermochemical">Thermochemical</SelectItem><SelectItem value="hybrid">Hybrid</SelectItem></SelectContent></Select>
                  </div>
                </div>
              </div>

              <div className="border-t border-border" />

              {/* Product - shown when feedstock is the anchor (so products are downstream) */}
              {category === 'Feedstock' && (
              <>
              <div className="py-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Product</span>
                <div className="mt-2 space-y-1.5">
                  <div>
                    <label className="text-[9px] font-medium text-muted-foreground block mb-0.5">Category</label>
                    <Select><SelectTrigger className="w-full text-[11px] h-7 bg-background"><SelectValue placeholder="Any" /></SelectTrigger><SelectContent><SelectItem value="all">Any</SelectItem><SelectItem value="chemicals">Chemicals</SelectItem><SelectItem value="materials">Materials</SelectItem><SelectItem value="fuels">Fuels</SelectItem><SelectItem value="food">Food & Feed</SelectItem></SelectContent></Select>
                  </div>
                </div>
              </div>
              <div className="border-t border-border" />
              </>
              )}

              {/* Application */}
              <div className="py-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Application</span>
                <div className="mt-1.5 space-y-1">
                  <div>
                    <label className="text-[9px] font-medium text-muted-foreground block mb-0.5">Category</label>
                    <Select><SelectTrigger className="w-full text-[11px] h-7 bg-background"><SelectValue placeholder="Any" /></SelectTrigger><SelectContent><SelectItem value="all">Any</SelectItem><SelectItem value="packaging">Packaging</SelectItem><SelectItem value="textiles">Textiles</SelectItem><SelectItem value="automotive">Automotive</SelectItem><SelectItem value="construction">Construction</SelectItem><SelectItem value="food">Food & Beverage</SelectItem></SelectContent></Select>
                  </div>
                  <div>
                    <label className="text-[9px] font-medium text-muted-foreground block mb-0.5">Maturity</label>
                    <Select><SelectTrigger className="w-full text-[11px] h-7 bg-background"><SelectValue placeholder="Any" /></SelectTrigger><SelectContent><SelectItem value="all">Any</SelectItem><SelectItem value="mature">Mature</SelectItem><SelectItem value="growing">Growing</SelectItem><SelectItem value="emerging">Emerging</SelectItem><SelectItem value="nascent">Nascent</SelectItem></SelectContent></Select>
                  </div>
                </div>
              </div>

              <div className="border-t border-border" />

              {/* Footer */}
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px]">
                  <span className="font-bold text-primary">{filteredPathways.length}</span>
                  <span className="text-muted-foreground">pathways match</span>
                </div>
                <button onClick={() => { setFeedstockFilter('all'); setTechnologyFilter('all'); setApplicationFilter('all'); setSearchQuery(''); setViabilityFilter(null); }} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer underline underline-offset-2">Clear</button>
              </div>
              </div>
          </div>
        </div>
        </div>
      </div>

      {/* Dialogs - Create Pathway */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Pathway</DialogTitle>
            <DialogDescription>Define a new pathway by specifying each step in the value chain.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Feedstock *</Label>
              <Input value={newPathway.feedstock} onChange={(e) => setNewPathway({...newPathway, feedstock: e.target.value})} placeholder="e.g., Corn Cobs" />
            </div>
            <div className="space-y-2">
              <Label>Technology *</Label>
              <Input value={newPathway.technology} onChange={(e) => setNewPathway({...newPathway, technology: e.target.value})} placeholder="e.g., Acid Hydrolysis" />
            </div>
            <div className="space-y-2">
              <Label>Product *</Label>
              <Input value={newPathway.product} onChange={(e) => setNewPathway({...newPathway, product: e.target.value})} placeholder="e.g., Xylose" />
            </div>
            <div className="space-y-2">
              <Label>Application *</Label>
              <Input value={newPathway.application} onChange={(e) => setNewPathway({...newPathway, application: e.target.value})} placeholder="e.g., Food Sweetener" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreatePathway}>Create Pathway</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save to Project Dialog */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{isAddingToExisting ? "Add to Project" : "Create New Project"}</DialogTitle>
            <DialogDescription>
              {isAddingToExisting ? "Select a project to add your pathways to." : "Create a new project to organize your pathways."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="flex rounded-lg bg-muted p-1">
              <button
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${isAddingToExisting ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setIsAddingToExisting(true)}
              >
                <FolderKanban className="w-4 h-4 inline-block mr-2" />
                Existing Project
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${!isAddingToExisting ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setIsAddingToExisting(false)}
              >
                <Plus className="w-4 h-4 inline-block mr-2" />
                New Project
              </button>
            </div>

            {isAddingToExisting ? (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Choose a project</Label>
                {existingProjects.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                    <FolderKanban className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">No projects yet</p>
                    <Button size="sm" variant="outline" onClick={() => setIsAddingToExisting(false)}>
                      <Plus className="w-3 h-3 mr-1" />
                      Create your first project
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {existingProjects.map(project => (
                      <div
                        key={project.id}
                        onClick={() => setSelectedProjectId(project.id)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedProjectId === project.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'
                        }`}
                      >
                        <div className="text-sm font-medium text-foreground">{project.name}</div>
                        <div className="text-xs text-muted-foreground">{project.pathways.length} pathways</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Project Name *</Label>
                  <Input value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} placeholder="e.g., Xylose Valorisation Study" />
                </div>
                <div className="space-y-2">
                  <Label>Project Owner *</Label>
                  <Input value={newProject.owner} onChange={(e) => setNewProject({...newProject, owner: e.target.value})} placeholder="e.g., John Smith" />
                </div>
                <div className="space-y-2">
                  <Label>Project Goal *</Label>
                  <textarea
                    value={newProject.goal}
                    onChange={(e) => setNewProject({...newProject, goal: e.target.value})}
                    placeholder="e.g., Explore commercial pathways for xylose conversion..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                </div>
              </div>
            )}

            {savedPathways.size > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Pathways to add</Label>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{savedPathways.size} selected</span>
                </div>
                <div className="bg-muted rounded-lg p-3 text-sm max-h-28 overflow-y-auto">
                  {Array.from(savedPathways).map((idx) => {
                    const pathway = allPathways[idx];
                    return (
                      <div key={idx} className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0">
                        <Bookmark className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="text-xs truncate">{pathway ? `${pathway.feedstock} → ${pathway.product}` : `Pathway ${idx + 1}`}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProjectDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                const pathwayDetails = Array.from(savedPathways).map((idx) => {
                  const pathway = allPathways[idx];
                  return { index: idx, feedstock: pathway?.feedstock || '', technology: pathway?.technology || '', product: pathway?.product || '', application: pathway?.application || '', trl: pathway?.trl || '', topic: decodedTopic };
                });

                if (isAddingToExisting) {
                  if (!selectedProjectId) {
                    toast({ title: "Select a Project", description: "Please select a project.", variant: "destructive" });
                    return;
                  }
                  const project = existingProjects.find(p => p.id === selectedProjectId);
                  if (!project) return;
                  const { error } = await supabase.from('projects').update({ pathways: [...project.pathways, ...pathwayDetails] }).eq('id', selectedProjectId);
                  if (error) { toast({ title: "Error", description: "Failed to add pathways.", variant: "destructive" }); return; }
                  toast({ title: "Pathways Added", description: `${savedPathways.size} pathway(s) added to "${project.name}".` });
                } else {
                  const { error } = await supabase.from('projects').insert({ name: newProject.name, owner: newProject.owner, goal: newProject.goal, pathways: pathwayDetails, topic: decodedTopic, category: category });
                  if (error) { toast({ title: "Error", description: "Failed to create project.", variant: "destructive" }); return; }
                  toast({ title: "Project Created", description: `Project "${newProject.name}" created with ${savedPathways.size} pathway(s).` });
                  setNewProject({ name: '', owner: '', goal: '' });
                }
                setIsProjectDialogOpen(false);
                setSelectedProjectId("");
              }}
              disabled={isAddingToExisting ? !selectedProjectId : (!newProject.name || !newProject.owner || !newProject.goal)}
            >
              {isAddingToExisting ? "Add Pathways" : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pathway</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};

export default ValueChainPathways;