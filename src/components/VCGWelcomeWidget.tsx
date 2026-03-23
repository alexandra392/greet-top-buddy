import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Target, Package, Settings2, FolderOpen, Beaker, Plus, CheckCircle, Play, ChevronDown, MapPin, Users, TrendingUp, GitBranch, Recycle, Sprout, Trash2, Sparkles, Eye, Clock } from "lucide-react";
import RequestItemModal from "@/components/RequestItemModal";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

const VCGWelcomeWidget = () => {
  const navigate = useNavigate();
  const [showAllFeedstock, setShowAllFeedstock] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);

  // State for portfolio items from localStorage
  const [feedstockItems, setFeedstockItems] = useState<string[]>([]);
  const [productItems, setProductItems] = useState<string[]>([]);

  // Load items from localStorage on mount
  useEffect(() => {
    const loadPortfolioItems = () => {
      const feedstock = JSON.parse(localStorage.getItem('portfolio_feedstock') || '["Fructose"]');
      setFeedstockItems(feedstock.filter((item: string) => item !== 'K'));
      setProductItems(JSON.parse(localStorage.getItem('portfolio_product') || '["Lactic Acid"]'));
    };

    loadPortfolioItems();

    // Listen for portfolio updates
    const handlePortfolioUpdate = () => {
      loadPortfolioItems();
    };

    window.addEventListener('portfolioUpdated', handlePortfolioUpdate);

    return () => {
      window.removeEventListener('portfolioUpdated', handlePortfolioUpdate);
    };
  }, []);

  // State for action popup
  const [actionPopup, setActionPopup] = useState<{
    isOpen: boolean;
    itemName: string;
    category: string;
  }>({
    isOpen: false,
    itemName: "",
    category: ""
  });

  // State for analysis form
  const [analysisName, setAnalysisName] = useState("");
  const [analysisOwner, setAnalysisOwner] = useState("");

  // State for goal/context dialog
  const [showPathSelection, setShowPathSelection] = useState(false);
  const [showCategorySelection, setShowCategorySelection] = useState(false);
  const [selectedPath, setSelectedPath] = useState<"know" | "ai" | "browse" | null>(null);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showItemSelection, setShowItemSelection] = useState(false);
  const [showBrowseTypeSelection, setShowBrowseTypeSelection] = useState(false);
  const [showBrowseCategories, setShowBrowseCategories] = useState(false);
  const [selectedBrowseType, setSelectedBrowseType] = useState<"feedstock" | "product" | null>(null);
  const [selectedCategoryInBrowse, setSelectedCategoryInBrowse] = useState<string | null>(null);
  const [selectedBrowseCategory, setSelectedBrowseCategory] = useState<{type: "feedstock" | "product";category: string;} | null>(null);
  const [userGoal, setUserGoal] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [showCustomItemDialog, setShowCustomItemDialog] = useState(false);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemCategory, setCustomItemCategory] = useState<"Feedstock" | "Product">("Feedstock");
  const [customItemSubcategory, setCustomItemSubcategory] = useState("");
  const [customItemDescription, setCustomItemDescription] = useState("");

  // State for dynamic suggestions
  const [currentSuggestions, setCurrentSuggestions] = useState<{
    feedstocks: string[];
    products: string[];
  }>({ feedstocks: [], products: [] });

  // Grouped library data for browse
  const browseLibrary = {
    feedstocks: {
      "Agricultural Residues": ['Corn Stover', 'Wheat Straw', 'Rice Husk', 'Sugarcane Bagasse'],
      "Forestry & Plant-Based": ['Wood Biomass', 'Cotton', 'Hemp', 'Bamboo'],
      "Food & Organic Waste": ['Food Waste', 'Agricultural Waste', 'Algae'],
      "Municipal Solid Waste": ['Mixed MSW', 'Paper Waste', 'Cardboard'],
      "Industrial By-products": ['Steel Slag', 'Fly Ash', 'Chemical Residues'],
      "Marine Resources": ['Seaweed', 'Kelp', 'Fish Waste', 'Shellfish Waste'],
      "Animal By-products": ['Manure', 'Bone Meal', 'Blood Meal', 'Feather Meal'],
      "Oil & Fat Sources": ['Used Cooking Oil', 'Tallow', 'Animal Fats'],
      "Aquatic Plants": ['Water Hyacinth', 'Duckweed', 'Azolla'],
      "Energy Crops": ['Miscanthus', 'Switchgrass', 'Willow', 'Poplar']
    },
    products: {
      "Chemicals": ['Organic Acids', 'Enzymes', 'Bio-surfactants', 'Bio-solvents', 'Amino Acids'],
      "Materials & Polymers": ['Bioplastics', 'Bio-polymers', 'Bio-oils'],
      "Energy & Fuels": ['Bio-ethanol', 'Bio-fuels'],
      "Nutrition & Health": ['Vitamins'],
      "Pharmaceuticals": ['Antibiotics', 'Vaccines', 'Therapeutic Proteins'],
      "Food Ingredients": ['Sweeteners', 'Preservatives', 'Flavor Compounds'],
      "Cosmetics & Personal Care": ['Bio-actives', 'Emulsifiers', 'Moisturizers'],
      "Agricultural Products": ['Bio-fertilizers', 'Bio-pesticides', 'Growth Promoters'],
      "Construction Materials": ['Bio-composites', 'Insulation Materials', 'Adhesives'],
      "Textiles": ['Bio-fibers', 'Bio-dyes', 'Textile Coatings']
    }
  };

  // Generate mock AI suggestions based on user goal
  const generateSuggestions = (goal: string) => {
    // In a real implementation, this would call an AI service
    // For now, return mock suggestions based on keywords
    const lowerGoal = goal.toLowerCase();

    const suggestions = {
      feedstocks: [] as string[],
      products: [] as string[]
    };

    if (lowerGoal.includes('drone') || lowerGoal.includes('metal') || lowerGoal.includes('sustainable')) {
      suggestions.feedstocks = ['Recycled Aluminum', 'Bio-based Carbon Fiber', 'Recycled Steel', 'Hemp Fiber', 'Bamboo Fiber', 'Flax', 'Jute', 'Kenaf'];
      suggestions.products = ['Lightweight Alloys', 'Composite Materials', 'Bio-plastics', 'Carbon Neutral Metals', 'Structural Composites', 'Advanced Ceramics'];
    } else if (lowerGoal.includes('packaging')) {
      suggestions.feedstocks = ['Recycled Paper', 'Bamboo', 'Corn Starch', 'Seaweed', 'Sugarcane Bagasse', 'Mushroom Mycelium'];
      suggestions.products = ['Biodegradable Film', 'Compostable Containers', 'Paper-based Solutions', 'Molded Fiber', 'Bio-coatings'];
    } else {
      suggestions.feedstocks = ['Corn Stover', 'Wheat Straw', 'Wood Biomass', 'Algae', 'Agricultural Waste', 'Food Waste'];
      suggestions.products = ['Lactic Acid', 'Bioplastics', 'Organic Acids', 'Enzymes', 'Bio-surfactants', 'Bio-solvents'];
    }

    return suggestions;
  };

  const handleAddSuggestion = (item: string, category: string) => {
    const storageKey = `portfolio_${category.toLowerCase()}`;
    const currentItems = JSON.parse(localStorage.getItem(storageKey) || '[]');

    if (!currentItems.includes(item)) {
      currentItems.push(item);
      localStorage.setItem(storageKey, JSON.stringify(currentItems));
      window.dispatchEvent(new Event('portfolioUpdated'));

      setSelectedItem(item);
      setShowItemSelection(false);

      // Show toast with icon inline and better text distribution
      toast("Analysis in Progress", {
        description:
        <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
            <span>
              We are looking through all relevant documentation for your selection. 
              VCG will notify when the analysis for <span className="font-semibold text-success">{item}</span> will be 
              available in your portfolio for review.
            </span>
          </div>,

        duration: 6000
      });
    }
  };

  // Mock saved analyses
  const savedAnalyses = [
  { id: 1, name: "Q4 2024 Market Analysis", owner: "John Doe", date: "Dec 15, 2024" },
  { id: 2, name: "Competitive Landscape Study", owner: "Jane Smith", date: "Nov 28, 2024" }];


  const handleTopicClick = (itemName: string, category: string) => {
    navigate(`/landscape/${encodeURIComponent(category)}/${encodeURIComponent(itemName)}/value-chain`);
  };

  // Handler for closing action popup
  const closeActionPopup = () => {
    setActionPopup({
      isOpen: false,
      itemName: "",
      category: ""
    });
  };

  // Handle starting a new analysis
  const handleStartAnalysis = () => {
    console.log(`Starting analysis: ${analysisName} for ${actionPopup.itemName} (Owner: ${analysisOwner})`);
    navigate(`/landscape/${encodeURIComponent(actionPopup.category)}/${encodeURIComponent(actionPopup.itemName)}/value-chain`);
    closeActionPopup();
  };

  // Handle selecting a saved analysis
  const handleSelectSavedAnalysis = (analysisId: number) => {
    console.log(`Loading saved analysis: ${analysisId}`);
    navigate(`/landscape/${encodeURIComponent(actionPopup.category)}/${encodeURIComponent(actionPopup.itemName)}/value-chain`);
    closeActionPopup();
  };

  // Get category-specific colors
  const getCategoryColors = (category: string) => {
    switch (category) {
      case "Feedstock":
        return {
          borderColor: "border-success/30",
          backgroundColor: "bg-success/5",
          hoverBackgroundColor: "hover:bg-success/10",
          hoverBorderColor: "hover:border-success/50",
          iconBackgroundColor: "bg-success/20",
          hoverIconBackgroundColor: "group-hover:bg-success/30",
          iconColor: "text-success",
          gradientColor: "from-success/5"
        };
      case "Process":
        return {
          borderColor: "border-product-blue/30",
          backgroundColor: "bg-product-blue/5",
          hoverBackgroundColor: "hover:bg-product-blue/10",
          hoverBorderColor: "hover:border-product-blue/50",
          iconBackgroundColor: "bg-product-blue/20",
          hoverIconBackgroundColor: "group-hover:bg-product-blue/30",
          iconColor: "text-product-blue",
          gradientColor: "from-product-blue/5"
        };
      case "Product":
        return {
          borderColor: "border-application-purple/30",
          backgroundColor: "bg-application-purple/5",
          hoverBackgroundColor: "hover:bg-application-purple/10",
          hoverBorderColor: "hover:border-application-purple/50",
          iconBackgroundColor: "bg-application-purple/20",
          hoverIconBackgroundColor: "group-hover:bg-application-purple/30",
          iconColor: "text-application-purple",
          gradientColor: "from-application-purple/5"
        };
      case "Market Application":
      case "Application":
        return {
          borderColor: "border-application-orange/30",
          backgroundColor: "bg-application-orange/5",
          hoverBackgroundColor: "hover:bg-application-orange/10",
          hoverBorderColor: "hover:border-application-orange/50",
          iconBackgroundColor: "bg-application-orange/20",
          hoverIconBackgroundColor: "group-hover:bg-application-orange/30",
          iconColor: "text-application-orange",
          gradientColor: "from-application-orange/5"
        };
      default:
        return {
          borderColor: "border-muted-foreground/30",
          backgroundColor: "bg-muted/5",
          hoverBackgroundColor: "hover:bg-muted/10",
          hoverBorderColor: "hover:border-muted-foreground/50",
          iconBackgroundColor: "bg-muted-foreground/20",
          hoverIconBackgroundColor: "group-hover:bg-muted-foreground/30",
          iconColor: "text-muted-foreground",
          gradientColor: "from-muted/5"
        };
    }
  };

  // Function to get custom dialog title based on subcategory
  const getCustomDialogTitle = () => {
    if (customItemSubcategory === "Valorise a side stream") {
      return "Add Custom Side Stream";
    } else if (customItemSubcategory === "Valorise an intermediate") {
      return "Add Custom Intermediate";
    } else if (customItemSubcategory === "Produce circular biobase material") {
      return "Add Custom Circular Biobase Material";
    } else if (customItemSubcategory === "Source circular biobase raw material") {
      return "Add Custom Circular Biobase Raw Material";
    }
    return `Add Custom ${customItemCategory}`;
  };

  const ITEMS_PER_PAGE = 5;
  interface CategoryItem {
    name: string;
    count: number | string;
    isApproved?: boolean;
    approvedAt?: string;
  }

  // Check if an item is new (added in the last 24 hours)
  const isNewItem = (category: string, itemName: string) => {
    const timestampKey = `portfolio_${category.toLowerCase()}_timestamps`;
    const timestamps = JSON.parse(localStorage.getItem(timestampKey) || '{}');
    const timestamp = timestamps[itemName];
    if (!timestamp) return false;
    const hoursSinceAdded = (Date.now() - timestamp) / (1000 * 60 * 60);
    return hoursSinceAdded < 24; // New if added within 24 hours
  };

  // Function to categorize feedstock items
  const categorizeFeedstock = (name: string): string => {
    // You can customize this logic based on your needs
    const biomassKeywords = ['biomass', 'algae', 'wood', 'bamboo'];
    const primaryKeywords = ['sugar', 'fructose', 'glucose'];
    const secondaryKeywords = ['digestate', 'spent grain', 'husk'];

    const lowerName = name.toLowerCase();

    if (biomassKeywords.some((keyword) => lowerName.includes(keyword))) {
      return 'Biomass';
    } else if (primaryKeywords.some((keyword) => lowerName.includes(keyword))) {
      return 'Primary Feedstock';
    } else if (secondaryKeywords.some((keyword) => lowerName.includes(keyword))) {
      return 'Secondary Feedstock';
    }
    return 'Tertiary Feedstock';
  };

  // Generate dynamic data from localStorage state
  const feedstockData: CategoryItem[] = feedstockItems.map((name) => ({
    name,
    count: Math.floor(Math.random() * 50) // Random count for demo
  }));

  // Group feedstock by category
  const groupedFeedstock = feedstockData.reduce((acc, item) => {
    const category = categorizeFeedstock(item.name);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, CategoryItem[]>);

  const feedstockCategories = ['Biomass', 'Primary Feedstock', 'Secondary Feedstock', 'Tertiary Feedstock'];

  const productsData: CategoryItem[] = productItems.map((name) => ({
    name,
    count: Math.floor(Math.random() * 10)
  }));

  // Build unified topic cards data
  const topicCards = [
  ...feedstockItems.map((name) => ({
    name,
    category: "FEEDSTOCK" as const,
    description: `Analysis tracking for ${name}. Monitor supply chain dynamics, pricing trends, and market developments.`,
    status: Math.random() > 0.5 ? "new-updates" : "tracking" as const,
    insights: Math.floor(Math.random() * 8) + 1,
    lastUpdated: ["2 hours ago", "Yesterday", "3 days ago", "1 day ago", "5 days ago", "4 hours ago"][Math.floor(Math.random() * 6)],
    hasNotification: Math.random() > 0.7
  })),
  ...productItems.map((name) => ({
    name,
    category: "PRODUCT" as const,
    description: `Product intelligence for ${name}. Track applications, regulatory changes, and competitive landscape.`,
    status: Math.random() > 0.6 ? "recently-viewed" : "new-updates" as const,
    insights: Math.floor(Math.random() * 8) + 1,
    lastUpdated: ["2 hours ago", "Yesterday", "3 days ago", "1 day ago", "5 days ago", "4 hours ago"][Math.floor(Math.random() * 6)],
    hasNotification: Math.random() > 0.7
  }))];


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new-updates":
        return (
          <div className="flex items-center gap-1 text-xs text-primary font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            New updates
          </div>);

      case "tracking":
        return (
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <Eye className="w-3.5 h-3.5" />
            Tracking
          </div>);

      case "recently-viewed":
        return (
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <Clock className="w-3.5 h-3.5" />
            Recently viewed
          </div>);

      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-4 animate-fade-in">
      {/* My Portfolio Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">My Portfolio</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Feedstocks and products you're tracking. Start anywhere — each topic tells a story.</p>
        </div>
        <Button variant="ghost" size="sm" className="text-[11px] text-muted-foreground hover:text-foreground h-6 px-2"
        onClick={() => setShowPathSelection(true)}>
          View all →
        </Button>
      </div>

      {/* Dialogs */}
      <Dialog open={showPathSelection} onOpenChange={setShowPathSelection}>
        <DialogTrigger asChild>
          <span className="hidden" />
        </DialogTrigger>
              <DialogContent className="sm:max-w-2xl p-8 bg-gradient-to-br from-card to-card/95 border border-border/40 shadow-xl">
                 <DialogHeader className="space-y-3 mb-6">
                   <DialogTitle className="text-2xl font-semibold text-foreground">
                     Request New Topics
                   </DialogTitle>
                   <p className="text-sm text-muted-foreground leading-relaxed">
                     Choose how you'd like to add new feedstocks or products topics to your analysis portfolio.
                   </p>
                 </DialogHeader>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Option 1: I know what I want */}
                  <button
              onClick={() => {
                setSelectedPath("know");
                setShowPathSelection(false);
                setShowCategorySelection(true);
              }}
              className="group flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 border-border/40 hover:border-primary/50 bg-background hover:bg-primary/5 transition-all duration-200 text-center shadow-sm hover:shadow-md h-64">
              
                    <div className="flex-shrink-0 p-3 rounded-xl bg-success/10 border border-success/20 group-hover:bg-success/20 transition-colors">
                      <CheckCircle className="w-6 h-6 text-success" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-semibold text-base text-foreground">I know what I want</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight px-1">
                        Choose your use case and add the specific feedstocks or products you want to analyze.
                      </p>
                    </div>
                  </button>
                  
                  {/* Option 3: Browse Library */}
                  <button
              onClick={() => {
                setSelectedPath("browse");
                setShowPathSelection(false);
                setShowBrowseTypeSelection(true);
              }}
              className="group flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 border-border/40 hover:border-primary/50 bg-background hover:bg-primary/5 transition-all duration-200 text-center shadow-sm hover:shadow-md h-64">
              
                    <div className="flex-shrink-0 p-3 rounded-xl bg-success/10 border border-success/20 group-hover:bg-success/20 transition-colors">
                      <FolderOpen className="w-6 h-6 text-success" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-semibold text-base text-foreground">Browse our library</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight px-1">
                        Explore our complete database of available feedstocks and products.
                      </p>
                    </div>
                  </button>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Category Selection Dialog - For "I know what I want" path */}
            <Dialog open={showCategorySelection} onOpenChange={setShowCategorySelection}>
              <DialogContent className="sm:max-w-2xl p-8 bg-gradient-to-br from-card to-card/95 border border-border/40 shadow-xl">
                <DialogHeader className="space-y-3 mb-6">
                  <DialogTitle className="text-2xl font-semibold text-foreground">
                    What would you like to add?
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Choose the type of item you want to add to your portfolio.
                  </p>
                </DialogHeader>
                
                <div className="grid grid-cols-1 gap-3">
                  {/* Option 1: Valorise a side stream */}
                  <button
              onClick={() => {
                setCustomItemCategory("Feedstock");
                setCustomItemSubcategory("Valorise a side stream");
                setShowCategorySelection(false);
                setShowCustomItemDialog(true);
              }}
              className="group flex items-center gap-4 py-2.5 px-3 rounded-xl border-2 border-border/40 hover:border-primary/50 bg-background hover:bg-primary/5 transition-all duration-200 shadow-sm hover:shadow-md">
              
                    <div className="flex-shrink-0 p-3 rounded-xl bg-success/10 border border-success/20 group-hover:bg-success/20 transition-colors">
                      <Trash2 className="w-4 h-4 text-success" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-sm text-foreground">Valorise a side stream</h3>
                    </div>
                  </button>
                  
                  {/* Option 2: Valorise an intermediate */}
                  <button
              onClick={() => {
                setCustomItemCategory("Feedstock");
                setCustomItemSubcategory("Valorise an intermediate");
                setShowCategorySelection(false);
                setShowCustomItemDialog(true);
              }}
              className="group flex items-center gap-4 py-2.5 px-3 rounded-xl border-2 border-border/40 hover:border-primary/50 bg-background hover:bg-primary/5 transition-all duration-200 shadow-sm hover:shadow-md">
              
                    <div className="flex-shrink-0 p-3 rounded-xl bg-success/10 border border-success/20 group-hover:bg-success/20 transition-colors">
                      <GitBranch className="w-4 h-4 text-success" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-sm text-foreground">Valorise an intermediate</h3>
                    </div>
                  </button>
                  
                  {/* Option 3: Produce circular biobase material */}
                  <button
              onClick={() => {
                setCustomItemCategory("Product");
                setCustomItemSubcategory("Produce circular biobase material");
                setShowCategorySelection(false);
                setShowCustomItemDialog(true);
              }}
              className="group flex items-center gap-4 py-2.5 px-3 rounded-xl border-2 border-border/40 hover:border-primary/50 bg-background hover:bg-primary/5 transition-all duration-200 shadow-sm hover:shadow-md">
              
                    <div className="flex-shrink-0 p-3 rounded-xl bg-application-purple/10 border border-application-purple/20 group-hover:bg-application-purple/20 transition-colors">
                      <Recycle className="w-4 h-4 text-application-purple" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-sm text-foreground">Produce circular biobase material</h3>
                    </div>
                  </button>
                  
                  {/* Option 4: Source circular biobase raw material */}
                  <button
              onClick={() => {
                setCustomItemCategory("Product");
                setCustomItemSubcategory("Source circular biobase raw material");
                setShowCategorySelection(false);
                setShowCustomItemDialog(true);
              }}
              className="group flex items-center gap-4 py-2.5 px-3 rounded-xl border-2 border-border/40 hover:border-primary/50 bg-background hover:bg-primary/5 transition-all duration-200 shadow-sm hover:shadow-md">
              
                    <div className="flex-shrink-0 p-3 rounded-xl bg-application-purple/10 border border-application-purple/20 group-hover:bg-application-purple/20 transition-colors">
                      <Sprout className="w-4 h-4 text-application-purple" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-semibold text-sm text-foreground">Source circular biobase raw material</h3>
                    </div>
                  </button>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Goal/Context Dialog */}
            <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
              <DialogContent className="sm:max-w-2xl p-8 bg-gradient-to-br from-card to-card/95 border border-border/40 shadow-xl">
                <DialogHeader className="space-y-3 mb-4">
                  <DialogTitle className="text-2xl font-semibold">
                    Tell us about Your Project
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Help us understand what you're working on and what you're trying to achieve. This will help you get more relevant results.
                  </p>
                </DialogHeader>
                <div className="space-y-5">
                  <div className="space-y-2.5">
                    <Label htmlFor="user-goal" className="text-sm font-semibold">
                      What are you working on?
                    </Label>
                    <Textarea
                id="user-goal"
                placeholder="Example: I am working on looking for sustainable supply for drone manufacturing. I am especially interested in feedstocks or inputs to produce sustainable metals. What products and feedstocks should I run?"
                value={userGoal}
                onChange={(e) => setUserGoal(e.target.value)}
                className="h-32 resize-none border-2 border-success/20 focus:border-success/40 bg-background rounded-xl" />
              
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                variant="outline"
                onClick={() => {
                  setShowGoalDialog(false);
                  setUserGoal("");
                }}
                className="px-8 border-2">
                
                      Cancel
                    </Button>
                    <Button
                onClick={() => {
                  // Generate suggestions before opening the selection dialog
                  const suggestions = generateSuggestions(userGoal);
                  setCurrentSuggestions(suggestions);
                  setShowGoalDialog(false);
                  setShowItemSelection(true);
                }}
                disabled={!userGoal.trim()}
                className="bg-success hover:bg-success/90 px-8">
                
                      Continue
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* AI Suggestions Dialog */}
            <Dialog
        open={showItemSelection}
        onOpenChange={(open) => {
          if (open && !currentSuggestions.feedstocks.length && !currentSuggestions.products.length) {
            // Initialize suggestions when dialog opens
            const suggestions = generateSuggestions(userGoal);
            setCurrentSuggestions(suggestions);
          }
          setShowItemSelection(open);
        }}>
        
              <DialogContent className="sm:max-w-2xl p-8 bg-gradient-to-br from-card to-card/95 border border-border/40 shadow-xl">
                <DialogHeader className="pb-4 space-y-3 -mb-2">
                  <DialogTitle className="text-2xl font-semibold">
                    {selectedPath === "ai" ? "Your Tailored Suggestions" :
              selectedPath === "browse" && selectedBrowseCategory ? selectedBrowseCategory.category :
              "Select Items"}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedPath === "ai" ?
              "Based on your goal, we've identified these relevant topics. Click on any suggestion to add it to your portfolio." :
              selectedPath === "browse" && selectedBrowseCategory ?
              `Browse ${selectedBrowseCategory.type === "feedstock" ? "feedstocks" : "products"} in this category. Click on any item to add it to your portfolio.` :
              "Click on any item to add it to your portfolio."}
                  </p>
                  {selectedPath === "browse" && selectedBrowseCategory &&
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowItemSelection(false);
                setSelectedBrowseCategory(null);
                setShowBrowseCategories(true);
              }}
              className="text-xs text-muted-foreground hover:text-foreground">
              
                      ← Back to categories
                    </Button>
            }
                </DialogHeader>
                
                <div className={selectedPath === "browse" ? "" : "grid grid-cols-2 gap-6"}>
                  {/* Feedstock Suggestions - Left Column or Full Width for Browse Feedstock */}
                  {(selectedPath === "ai" || selectedPath === "browse" && selectedBrowseCategory?.type === "feedstock") &&
            <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-success/10 border border-success/20 shadow-sm">
                        <Settings2 className="w-4 h-4 text-success" />
                      </div>
                      <h3 className="font-semibold text-base text-foreground">
                        {selectedPath === "ai" ? "Recommended Feedstocks" : selectedBrowseCategory?.category}
                      </h3>
                      <Badge variant="secondary" className="text-xs bg-success/10 text-success border-success/20">
                        {selectedPath === "browse" && selectedBrowseCategory?.type === "feedstock" ?
                  browseLibrary.feedstocks[selectedBrowseCategory.category]?.length || 0 :
                  currentSuggestions.feedstocks.length}
                      </Badge>
                    </div>
                    
                    {selectedPath === "browse" && selectedBrowseCategory && selectedBrowseCategory.type === "feedstock" ?
              // Show only selected category for browse
              <div className="space-y-1">
                        {browseLibrary.feedstocks[selectedBrowseCategory.category]?.map((feedstock, index) =>
                <button
                  key={index}
                  onClick={() => {
                    handleAddSuggestion(feedstock, 'Feedstock');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-success/5 hover:bg-success/10 transition-colors cursor-pointer text-left text-xs">
                  
                             <span className="text-xs text-foreground">{feedstock}</span>
                             <Plus className="w-3.5 h-3.5 text-success" />
                           </button>
                )}
                      </div> :
              selectedPath === "ai" ?
              // Flat list for AI suggestions
              <div className="space-y-1">
                        {currentSuggestions.feedstocks.map((feedstock, index) =>
                <button
                  key={index}
                  onClick={() => {
                    handleAddSuggestion(feedstock, 'Feedstock');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-success/5 hover:bg-success/10 transition-colors cursor-pointer text-left text-xs">
                  
                             <span className="text-xs text-foreground">{feedstock}</span>
                             <Plus className="w-3.5 h-3.5 text-success" />
                           </button>
                )}
                      </div> :
              null}
                  </div>
            }

                  {/* Product Suggestions - Right Column or Full Width for Browse Product */}
                  {(selectedPath === "ai" || selectedPath === "browse" && selectedBrowseCategory?.type === "product") &&
            <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-application-purple/10 border border-application-purple/20 shadow-sm">
                        <Package className="w-4 h-4 text-application-purple" />
                      </div>
                      <h3 className="font-semibold text-base text-foreground">
                        {selectedPath === "ai" ? "Recommended Products" : selectedBrowseCategory?.category}
                      </h3>
                      <Badge variant="secondary" className="text-xs bg-application-purple/10 text-application-purple border-application-purple/20">
                        {selectedPath === "browse" && selectedBrowseCategory && selectedBrowseCategory.type === "product" ?
                  browseLibrary.products[selectedBrowseCategory.category]?.length || 0 :
                  selectedPath === "ai" ?
                  currentSuggestions.products.length :
                  0}
                      </Badge>
                    </div>
                    
                    {selectedPath === "browse" && selectedBrowseCategory && selectedBrowseCategory.type === "product" ?
              // Show only selected category for browse
              <div className="space-y-1">
                        {browseLibrary.products[selectedBrowseCategory.category]?.map((product, index) =>
                <button
                  key={index}
                  onClick={() => {
                    handleAddSuggestion(product, 'Product');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-application-purple/5 hover:bg-application-purple/10 transition-colors cursor-pointer text-left text-xs">
                  
                             <span className="text-xs text-foreground">{product}</span>
                             <Plus className="w-3.5 h-3.5 text-application-purple" />
                           </button>
                )}
                      </div> :
              selectedPath === "ai" ?
              // Flat list for AI suggestions
              <div className="space-y-1">
                        {currentSuggestions.products.map((product, index) =>
                <button
                  key={index}
                  onClick={() => {
                    handleAddSuggestion(product, 'Product');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-application-purple/5 hover:bg-application-purple/10 transition-colors cursor-pointer text-left text-xs">
                  
                             <span className="text-xs text-foreground">{product}</span>
                             <Plus className="w-3.5 h-3.5 text-application-purple" />
                           </button>
                )}
                      </div> :
              null}
                  </div>
            }
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Step 3: Confirmation - Now handled by toast notification */}
            
            {/* Browse Type Selection Dialog - For "Browse library" path */}
            <Dialog open={showBrowseTypeSelection} onOpenChange={setShowBrowseTypeSelection}>
              <DialogContent className="sm:max-w-2xl p-8 bg-gradient-to-br from-card to-card/95 border border-border/40 shadow-xl">
                <DialogHeader className="space-y-3 mb-6">
                  <DialogTitle className="text-2xl font-semibold text-foreground">
                    What would you like to browse?
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Choose the type of items you want to explore.
                  </p>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Feedstock Option */}
                  <button
              onClick={() => {
                setSelectedBrowseType("feedstock");
                setSelectedCategoryInBrowse(null);
                setShowBrowseTypeSelection(false);
                setShowBrowseCategories(true);
              }}
              className="group flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 border-border/40 hover:border-primary/50 bg-background hover:bg-primary/5 transition-all duration-200 text-center shadow-sm hover:shadow-md h-64">
              
                    <div className="flex-shrink-0 p-3 rounded-xl bg-success/10 border border-success/20 group-hover:bg-success/20 transition-colors">
                      <Settings2 className="w-6 h-6 text-success" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-semibold text-base text-foreground">Browse Feedstocks</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight px-1">
                        Explore available feedstock categories and items.
                      </p>
                    </div>
                  </button>
                  
                  {/* Product Option */}
                  <button
              onClick={() => {
                setSelectedBrowseType("product");
                setSelectedCategoryInBrowse(null);
                setShowBrowseTypeSelection(false);
                setShowBrowseCategories(true);
              }}
              className="group flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 border-border/40 hover:border-primary/50 bg-background hover:bg-primary/5 transition-all duration-200 text-center shadow-sm hover:shadow-md h-64">
              
                    <div className="flex-shrink-0 p-3 rounded-xl bg-application-purple/10 border border-application-purple/20 group-hover:bg-application-purple/20 transition-colors">
                      <Package className="w-6 h-6 text-application-purple" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="font-semibold text-base text-foreground">Browse Products</h3>
                      <p className="text-[11px] text-muted-foreground leading-tight px-1">
                        Explore available product categories and items.
                      </p>
                    </div>
                  </button>
                </div>
              </DialogContent>
            </Dialog>
            
            {/* Browse Categories Dialog - Step 2: Show Categories */}
            <Dialog open={showBrowseCategories} onOpenChange={(open) => {
        setShowBrowseCategories(open);
        if (!open) setSelectedCategoryInBrowse(null);
      }}>
              <DialogContent className="sm:max-w-3xl p-6 bg-gradient-to-br from-card to-card/95 border border-border/40 shadow-xl">
                <DialogHeader className="space-y-2 mb-3">
                  <div className="flex items-center gap-3">
                    <DialogTitle className="text-2xl font-semibold">
                      {selectedBrowseType === "feedstock" ? "Feedstock Categories" : "Product Categories"}
                    </DialogTitle>
                    <Badge variant="secondary" className={`text-sm rounded-sm ${selectedBrowseType === "feedstock" ? "bg-success/10 text-success border-success/20" : "bg-application-purple/10 text-application-purple border-application-purple/20"}`}>
                      {selectedBrowseType === "feedstock" ?
                Object.keys(browseLibrary.feedstocks).length :
                Object.keys(browseLibrary.products).length}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Click on any category to browse topics within it.
                  </p>
                </DialogHeader>
                
                {/* Search Bar */}
                <div className="mb-3">
                  <Input
              placeholder="Search categories..."
              className="w-full h-9" />
            
                </div>
                
                {/* Two Column Layout: Categories Left, Items Right */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Categories Column */}
                  <div className="space-y-3">
                  <div className="divide-y divide-border max-h-[220px] overflow-y-auto">
                    {selectedBrowseType === "feedstock" ?
                Object.entries(browseLibrary.feedstocks).map(([category, items]) =>
                <button
                  key={category}
                  onClick={() => setSelectedCategoryInBrowse(category)}
                  className={`w-full flex items-center justify-between px-3 py-3 transition-colors cursor-pointer text-left ${
                  selectedCategoryInBrowse === category ? 'bg-success/10' : 'hover:bg-muted/30'}`
                  }>
                  
                          <span className="text-sm text-foreground font-medium">{category}</span>
                          <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90" />
                        </button>
                ) :
                Object.entries(browseLibrary.products).map(([category, items]) =>
                <button
                  key={category}
                  onClick={() => setSelectedCategoryInBrowse(category)}
                  className={`w-full flex items-center justify-between px-3 py-3 transition-colors cursor-pointer text-left ${
                  selectedCategoryInBrowse === category ? 'bg-application-purple/10' : 'hover:bg-muted/30'}`
                  }>
                  
                          <span className="text-sm text-foreground font-medium">{category}</span>
                          <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90" />
                        </button>
                )}
                  </div>
                </div>
                
                {/* Items Column */}
                <div className="space-y-2">
                  {selectedCategoryInBrowse ?
              <div className="space-y-1 max-h-[220px] overflow-y-auto">
                        {selectedBrowseType === "feedstock" ?
                browseLibrary.feedstocks[selectedCategoryInBrowse]?.map((item, index) =>
                <button
                  key={index}
                  onClick={() => {
                    handleAddSuggestion(item, 'Feedstock');
                    setShowBrowseCategories(false);
                    setSelectedCategoryInBrowse(null);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-success/5 hover:bg-success/10 transition-colors cursor-pointer text-left">
                  
                              <span className="text-sm text-foreground">{item}</span>
                              <Plus className="w-4 h-4 text-success" />
                            </button>
                ) :
                browseLibrary.products[selectedCategoryInBrowse]?.map((item, index) =>
                <button
                  key={index}
                  onClick={() => {
                    handleAddSuggestion(item, 'Product');
                    setShowBrowseCategories(false);
                    setSelectedCategoryInBrowse(null);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-application-purple/5 hover:bg-application-purple/10 transition-colors cursor-pointer text-left">
                  
                              <span className="text-sm text-foreground">{item}</span>
                              <Plus className="w-4 h-4 text-application-purple" />
                            </button>
                )}
                      </div> :

              <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
                      Select a category to view items
                    </div>
              }
                </div>
              </div>
              </DialogContent>
            </Dialog>
            
            {/* Custom Item Dialog */}
            <Dialog open={showCustomItemDialog} onOpenChange={setShowCustomItemDialog}>
              <DialogContent className="sm:max-w-2xl p-8 bg-gradient-to-br from-card to-card/95 border border-border/40 shadow-xl">
                <DialogHeader className="space-y-3 -mb-2">
                  <DialogTitle className="text-2xl font-semibold text-foreground">{getCustomDialogTitle()}</DialogTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Request a new topic for analysis in your portfolio.
                  </p>
                </DialogHeader>
                <div className="space-y-1">
                  <div className="space-y-1">
                    <Label htmlFor="custom-name" className="text-sm font-semibold">
                      Name *
                    </Label>
                    <Input
                id="custom-name"
                placeholder="Enter name..."
                value={customItemName}
                onChange={(e) => setCustomItemName(e.target.value)}
                className="border-2 border-success/20 focus:border-success/40 rounded-md h-9" />
              
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="custom-subcategory" className="text-sm font-semibold">
                      Category *
                    </Label>
                    <Select
                value={customItemSubcategory}
                onValueChange={(value) => setCustomItemSubcategory(value)}>
                
                      <SelectTrigger id="custom-subcategory" className="border-2 border-success/20 focus:border-success/40 rounded-md h-9 bg-background">
                        <SelectValue placeholder={`Select ${customItemCategory.toLowerCase()} category...`} />
                      </SelectTrigger>
                      <SelectContent className="bg-background z-50">
                        {customItemCategory === "Feedstock" ?
                  <>
                            <SelectItem value="Primary">Primary</SelectItem>
                            <SelectItem value="Secondary">Secondary</SelectItem>
                            <SelectItem value="Tertiary">Tertiary</SelectItem>
                          </> :

                  <>
                            <SelectItem value="Primary">Primary Product</SelectItem>
                            <SelectItem value="Intermediate">Intermediate Product</SelectItem>
                            <SelectItem value="Final">Final Product</SelectItem>
                          </>
                  }
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1 -mt-4">
                    <Label htmlFor="custom-description" className="text-sm font-semibold">
                      Description
                    </Label>
                    <Textarea
                id="custom-description"
                placeholder="Briefly describe this item..."
                value={customItemDescription}
                onChange={(e) => setCustomItemDescription(e.target.value)}
                className="min-h-[50px] border-2 border-success/20 focus:border-success/40 rounded-md bg-background resize-none" />
              
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                variant="outline"
                onClick={() => {
                  setShowCustomItemDialog(false);
                  setCustomItemName("");
                  setCustomItemSubcategory("");
                  setCustomItemDescription("");
                }}
                className="flex-1 h-9 border-2 rounded-md">
                
                      Cancel
                    </Button>
                    <Button
                onClick={() => {
                  if (customItemName.trim() && customItemSubcategory) {
                    if (selectedPath === "know") {
                      // For "I know what I want" path: add directly to portfolio
                      handleAddSuggestion(customItemName.trim(), customItemCategory);
                    } else {
                      // For AI and browse paths: add to suggestions list
                      setCurrentSuggestions((prev) => ({
                        ...prev,
                        [customItemCategory.toLowerCase() === 'feedstock' ? 'feedstocks' : 'products']: [
                        ...prev[customItemCategory.toLowerCase() === 'feedstock' ? 'feedstocks' : 'products'],
                        customItemName.trim()]

                      }));
                      // Keep item selection dialog open to show the new item
                      setShowItemSelection(true);
                    }
                    setShowCustomItemDialog(false);
                    setCustomItemName("");
                    setCustomItemSubcategory("");
                    setCustomItemDescription("");
                  }
                }}
                disabled={!customItemName.trim() || !customItemSubcategory}
                className="flex-1 h-9 bg-success hover:bg-success/90 rounded-md">
                
                      Request Topic
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Action Popup Dialog */}
            <Dialog open={actionPopup.isOpen} onOpenChange={(open) => {
        if (!open) {
          setActionPopup({ isOpen: false, itemName: "", category: "" });
          setAnalysisName("");
          setAnalysisOwner("");
        }
      }}>
              <DialogContent className="sm:max-w-3xl p-8 bg-gradient-to-br from-card to-card/95 border border-border/40 shadow-xl">
                <DialogHeader className="space-y-3 mb-6">
                  <DialogTitle className="text-2xl font-semibold">What would you like to do?</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Choose an action for <span className="font-semibold text-foreground">{actionPopup.itemName}</span>
                  </p>
                </DialogHeader>
                
                <div className="space-y-3">
                  <button
              onClick={() => {
                setActionPopup({ ...actionPopup, isOpen: false });
                handleStartAnalysis();
              }}
              className="w-full flex items-center gap-4 p-5 rounded-xl border-2 border-border/40 hover:border-success/50 bg-background hover:bg-success/5 transition-all duration-200 text-left shadow-sm hover:shadow-md">
              
                    <div className="p-3 rounded-xl bg-success/10 shadow-sm">
                      <Play className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-foreground mb-0.5">Start New Analysis</h3>
                      <p className="text-sm text-muted-foreground">Begin a fresh value chain analysis</p>
                    </div>
                  </button>

                  {savedAnalyses.length > 0 &&
            <div className="space-y-2 pt-2">
                      <p className="text-sm text-muted-foreground font-medium">Or select a saved analysis:</p>
                      {savedAnalyses.map((analysis) =>
              <button
                key={analysis.id}
                onClick={() => {
                  setActionPopup({ ...actionPopup, isOpen: false });
                  handleSelectSavedAnalysis(analysis.id);
                }}
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-border/40 hover:border-success/50 bg-background hover:bg-success/5 transition-all duration-200 text-left shadow-sm hover:shadow-md">
                
                          <div>
                            <h4 className="text-base font-medium text-foreground">{analysis.name}</h4>
                            <p className="text-sm text-muted-foreground">{analysis.owner} • {analysis.date}</p>
                          </div>
                        </button>
              )}
                    </div>
            }
                </div>
              </DialogContent>
            </Dialog>

          {/* Topic Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {topicCards.map((topic, index) =>
        <Card
          key={index}
          className="bg-card border border-border/60 hover:border-border hover:shadow-md transition-all duration-200 cursor-pointer relative"
          onClick={() => handleTopicClick(topic.name, topic.category === "FEEDSTOCK" ? "Feedstock" : "Product")}>
          
                {topic.hasNotification &&
          <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary" />
          }
                <div className="p-4">
                  <p className={`text-[10px] font-semibold tracking-wider mb-1.5 ${
            topic.category === "FEEDSTOCK" ? "text-success" : "text-application-purple"}`
            }>
                    {topic.category}
                  </p>
                  <h3 className="text-sm font-bold text-foreground mb-1.5">{topic.name}</h3>

            
                  <div className="flex items-center gap-2.5 mb-2.5">
                    {getStatusBadge(topic.status)}
                    <span className="text-[11px] text-muted-foreground">88 pathways</span>
                  </div>
                  <div className="border-t border-border/40 pt-2.5">
                    <span className="text-[11px] text-muted-foreground/60">Last updated {topic.lastUpdated}</span>
                  </div>
                </div>
              </Card>
        )}
          </div>

      {/* Action Popup Dialog */}
      <Dialog open={actionPopup.isOpen} onOpenChange={closeActionPopup}>
        <DialogContent className="sm:max-w-lg p-6 bg-gradient-to-br from-card to-card/95 border border-border/40 shadow-xl">
          <DialogHeader className="space-y-2 mb-4">
            <DialogTitle className="text-base font-semibold text-foreground tracking-tight">
              Let's Get Started
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground mb-4">
            Create a new value chain analysis for <span className="font-semibold text-foreground">{actionPopup.itemName}</span>
          </p>
          <div className="space-y-3">
            <div className="space-y-1.5">
                <Label htmlFor="analysis-name" className="text-xs font-semibold text-foreground">
                  Name Your Analysis
                </Label>
                <Input
                id="analysis-name"
                placeholder="Enter analysis name"
                value={analysisName}
                onChange={(e) => setAnalysisName(e.target.value)}
                className="h-9 text-xs border border-border/40 rounded-lg focus-visible:border-primary/50" />
              
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="analysis-owner" className="text-xs font-semibold text-foreground">
                  Analysis Owner
                </Label>
                <Select value={analysisOwner} onValueChange={setAnalysisOwner}>
                  <SelectTrigger id="analysis-owner" className="h-9 text-xs border border-border/40 rounded-lg">
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john-doe">John Doe</SelectItem>
                    <SelectItem value="jane-smith">Jane Smith</SelectItem>
                    <SelectItem value="bob-johnson">Bob Johnson</SelectItem>
                    <SelectItem value="alice-williams">Alice Williams</SelectItem>
                  </SelectContent>
                </Select>
            </div>

            {/* OR Divider */}
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-gradient-to-r from-card via-card to-card px-3 text-muted-foreground font-medium tracking-wider">OR</span>
              </div>
            </div>

            {/* Saved Analyses */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-foreground">
                Start from a Saved Value Chain Analysis
              </Label>
              <div className="space-y-2">
                {savedAnalyses.map((analysis) =>
                <div
                  key={analysis.id}
                  onClick={() => handleSelectSavedAnalysis(analysis.id)}
                  className="p-3 rounded-lg bg-background/50 border border-border/30 hover:bg-muted/10 hover:border-border/50 cursor-pointer transition-all duration-200">
                  
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-foreground">{analysis.name}</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {analysis.owner} • {analysis.date}
                        </p>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground -rotate-90 flex-shrink-0" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Start Button */}
            <Button
              onClick={handleStartAnalysis}
              className="w-full mt-4 h-9 text-xs font-medium rounded-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200"
              disabled={!analysisName || !analysisOwner}>
              
              <Play className="w-3.5 h-3.5 mr-1.5" />
              Start analysis
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>);

};

export default VCGWelcomeWidget;