import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Globe, MapPin, Calendar, UserCheck, Plus, Users, Key, Mail, Phone, User, BarChart3, Activity, ExternalLink, Edit, Settings, ChevronRight, FolderOpen, Clock, Grid3X3, RefreshCw, RotateCcw, ChevronDown, Archive, Check, Shield, Crown, CheckCircle, XCircle, Bell, FileSearch } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const OrganizationManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("analyses");
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [openRoleDropdown, setOpenRoleDropdown] = useState<number | null>(null);
  const [openProjectDropdown, setOpenProjectDropdown] = useState<number | null>(null);
  const [openStatusDropdown, setOpenStatusDropdown] = useState<number | null>(null);
  const [approvalDialog, setApprovalDialog] = useState<{ topicId: number; topicName: string; description: string } | null>(null);
  const [selectedDatabase, setSelectedDatabase] = useState<string>("");
  const { toast } = useToast();
  
  // Sample analysis topics data - using state so we can update it
  const [analysisTopics, setAnalysisTopics] = useState([
    {
      id: 1,
      name: "Bioethanol Production Analysis",
      database: "Bioethanol",
      category: "Materials",
      users: 15,
      lastUpdated: "2 days ago",
      addedDate: "2024-08-26",
      status: "Active",
      approvalStatus: "approved",
      description: "Analysis of bioethanol production pathways, market trends, and optimization strategies for sustainable fuel production."
    },
    {
      id: 2,
      name: "Apple Pomace Valorization",
      database: "Apple_pomace",
      category: "Feedstock",
      users: 8,
      lastUpdated: "1 week ago",
      addedDate: "2024-08-16",
      status: "Active",
      approvalStatus: "approved",
      description: "Comprehensive study on apple pomace utilization for biorefinery applications and waste valorization strategies."
    },
    {
      id: 3,
      name: "Digestate Treatment Technologies",
      database: "Digestate",
      category: "Process",
      users: 12,
      lastUpdated: "3 days ago",
      addedDate: "2024-09-02",
      status: "Active",
      approvalStatus: "approved",
      description: "Advanced treatment technologies for anaerobic digestion digestate and circular economy applications."
    },
    {
      id: 4,
      name: "Chitin Extraction from Marine Waste",
      database: "Marine_waste",
      category: "Feedstock",
      users: 6,
      lastUpdated: "5 days ago",
      addedDate: "2024-03-16",
      status: "Archived",
      approvalStatus: "approved",
      description: "Marine waste-derived chitin and chitosan applications in biorefinery and material science."
    },
    {
      id: 5,
      name: "Advanced Bioreactor Design",
      database: "Bioreactors",
      category: "Process",
      users: 10,
      lastUpdated: "1 day ago",
      addedDate: "2024-07-16",
      status: "Active",
      approvalStatus: "approved",
      description: "Advanced bioreactor technologies for bioprocessing and fermentation applications with efficiency optimization."
    },
    {
      id: 6,
      name: "Algae-Based Biofuels Research",
      database: null,
      category: "Materials",
      users: 18,
      lastUpdated: "6 hours ago",
      addedDate: "2025-09-15",
      status: "Active",
      approvalStatus: "pending",
      description: "Comprehensive research on algae-based biofuel production, including cultivation methods and extraction technologies."
    },
    {
      id: 7,
      name: "Waste-to-Energy Conversion Systems",
      database: null,
      category: "Biochemical",
      users: 14,
      lastUpdated: "2 hours ago",
      addedDate: "2025-09-16",
      status: "Active",
      approvalStatus: "pending",
      description: "Comprehensive analysis of innovative waste-to-energy conversion systems encompassing advanced thermochemical processes including pyrolysis, gasification, and combustion technologies. This study evaluates the efficiency, environmental impact, and economic viability of various waste streams such as municipal solid waste, agricultural residues, and industrial byproducts. The research focuses on optimization strategies for energy recovery, emission reduction, and circular economy integration while examining emerging technologies like plasma gasification and anaerobic digestion for sustainable energy production and comprehensive waste management solutions."
    },
    {
      id: 8,
      name: "Hemp Fiber Processing",
      database: null,
      category: "Feedstock",
      users: 9,
      lastUpdated: "4 hours ago",
      addedDate: "2025-09-14",
      status: "Active",
      approvalStatus: "pending",
      description: "Hemp fiber processing technologies for textile and composite material applications in sustainable manufacturing."
    }
  ]);

  // Function to get category color classes
  const getCategoryColorClasses = (category: string) => {
    switch (category.toLowerCase()) {
      case 'feedstock':
        return 'bg-success/10 text-success border-success/30';
      case 'technology':
        return 'bg-product-blue/10 text-product-blue border-product-blue/30';
      case 'biochemical':
        return 'bg-success/10 text-success border-success/30';
      case 'product':
      case 'materials':
        return 'bg-application-purple/10 text-application-purple border-application-purple/30';
      case 'process':
        return 'bg-muted text-muted-foreground border-border';
      case 'applications':
        return 'bg-market-orange/10 text-market-orange border-market-orange/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  // Function to change analysis status
  const handleChangeAnalysisStatus = (analysisId: number, newStatus: string) => {
    console.log('Status change called:', { analysisId, newStatus });
    setAnalysisTopics(prevTopics => {
      const updated = prevTopics.map(topic => 
        topic.id === analysisId 
          ? { ...topic, status: newStatus }
          : topic
      );
      console.log('Updated topics:', updated);
      return updated;
    });
  };

  // Function to change user role
  const handleChangeUserRole = (userId: number, newRole: string) => {
    console.log('Role change called:', { userId, newRole });
    setUsers(prevUsers => {
      const updated = prevUsers.map(user => 
        user.id === userId 
          ? { ...user, role: newRole }
          : user
      );
      console.log('Updated users:', updated);
      return updated;
    });
  };

  // Function to deactivate user
  const handleDeactivateUser = (userId: number) => {
    console.log('Deactivating user:', userId);
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setUsers(prevUsers => {
      const updated = prevUsers.map(u => 
        u.id === userId 
          ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
          : u
      );
      console.log('Updated users:', updated);
      return updated;
    });

    toast({
      title: user.status === 'Active' ? "User Deactivated" : "User Activated",
      description: `${user.name} has been ${user.status === 'Active' ? 'deactivated' : 'activated'} successfully.`,
    });
  };

  // Function to delete user
  const handleDeleteUser = (userId: number) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      console.log('Deleting user:', userId);
      setUsers(prevUsers => {
        const updated = prevUsers.filter(user => user.id !== userId);
        console.log('Updated users:', updated);
        return updated;
      });
    }
  };

  // Helper function to check if a topic is new (within last 30 days)
  const isNewTopic = (addedDate: string) => {
    const topicDate = new Date(addedDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return topicDate >= thirtyDaysAgo;
  };

  // Available databases
  const availableDatabases = [
    "Apple_pomace",
    "Aquafeed",
    "Bagasse",
    "Beans",
    "Beta_glucan",
    "Biobased_solvents",
    "Bioethanol",
    "Bioreactors",
    "Bread",
    "Calcite",
    "Calcium_silicate",
    "Chitin",
    "Chitosan",
    "Coffee",
    "Concrete",
    "Corn_cob",
    "Cottonseed_meal",
    "Dammar",
    "Dextrose",
    "Digestate",
    "Endosperm_dust",
    "Ethylene_glycol",
    "Ettringite",
    "Feathers",
    "Fire_protection",
    "Flour_dust",
    "Food_waste",
    "Fructose",
    "Germ",
    "Grape_pomace",
    "Humin",
    "Hemp_fiber",
    "Marine_waste",
    "Algae_biomass",
    "Waste_energy"
  ];

  // Function to approve a topic
  const handleApproveTopic = (topicId: number, topicName: string, description: string) => {
    console.log('Opening approval dialog for topic:', topicId);
    setApprovalDialog({ topicId, topicName, description });
    setSelectedDatabase("");
  };

  // Function to confirm approval with selected database
  const confirmApproval = () => {
    if (!approvalDialog || !selectedDatabase) return;
    
    console.log('Approving topic with database:', { topicId: approvalDialog.topicId, database: selectedDatabase });
    
    setAnalysisTopics(prevTopics =>
      prevTopics.map(topic =>
        topic.id === approvalDialog.topicId
          ? { 
              ...topic, 
              approvalStatus: "approved",
              database: selectedDatabase
            }
          : topic
      )
    );
    
    setApprovalDialog(null);
    setSelectedDatabase("");
  };

  // Function to deny a topic
  const handleDenyTopic = (topicId: number) => {
    console.log('Denying topic:', topicId);
    setAnalysisTopics(prevTopics =>
      prevTopics.map(topic =>
        topic.id === topicId
          ? { ...topic, approvalStatus: "denied", status: "Denied" }
          : topic
      )
    );
  };

  // Sort analysis topics by date (newest first)
  const sortedAnalysisTopics = [...analysisTopics].sort((a, b) => {
    return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime();
  });

  // Count pending topics for notification
  const pendingTopicsCount = analysisTopics.filter(topic => topic.approvalStatus === 'pending').length;

  // Sample organization data - in real app, this would come from API/props
  const organizations = [
    {
      id: 1,
      name: "Smart Cities and Communities",
      description: "A collaborative initiative focused on developing sustainable urban solutions through innovative technology and community engagement. We work with local governments, research institutions, and private sector partners to create smart infrastructure that improves quality of life for citizens. Our projects span renewable energy systems, intelligent transportation networks, and data-driven governance solutions. Through cutting-edge IoT sensors and AI-powered analytics, we help cities reduce their environmental footprint while enhancing operational efficiency.",
      website: "https://smartcities-communities.org",
      location: "Berlin, Brandenburg, Germany",
      category: "Public Sector Initiative",
      registrationDate: "29/08/2025",
      numberOfUsers: 156,
      totalAnalyses: 23,
      organizationContact: "Dr. Maria Schmidt",
      organizationContactEmails: ["info@smartcities-communities.org", "partnerships@smartcities-communities.org"],
      organizationPersonalContactEmail: "maria.schmidt@smartcities-communities.org",
      contactEmail: "info@smartcities-communities.org",
      contactPhone: "+49 30 1234 5678",
      personalContactEmail: "maria.schmidt@smartcities-communities.org"
    },
    {
      id: 2,
      name: "Regio Augsburg Wirtschaft GmbH",
      description: "Regional economic development agency promoting business growth and innovation in the Augsburg metropolitan area.",
      website: "https://regio-augsburg.de",
      location: "Augsburg, Bavaria, Germany",
      category: "Economic Development",
      registrationDate: "29/08/2025",
      numberOfUsers: 87,
      totalAnalyses: 15,
      organizationContact: "Hans Mueller",
      organizationContactEmails: ["contact@regio-augsburg.de", "business@regio-augsburg.de"],
      organizationPersonalContactEmail: "hans.mueller@regio-augsburg.de",
      contactEmail: "contact@regio-augsburg.de",
      contactPhone: "+49 821 9876 543",
      personalContactEmail: "hans.mueller@regio-augsburg.de"
    },
    {
      id: 3,
      name: "Invite test 06",
      description: "Test organization for invitation and collaboration features development and quality assurance.",
      website: "https://test.example.com",
      location: "Munich, Bavaria, Germany",
      category: "Technology & Testing",
      registrationDate: "03/09/2025",
      numberOfUsers: 12,
      totalAnalyses: 8,
      organizationContact: "Test Administrator",
      organizationContactEmails: ["test@example.com"],
      organizationPersonalContactEmail: "admin@test.example.com",
      contactEmail: "test@example.com",
      contactPhone: "+49 89 5555 1234",
      personalContactEmail: "admin@test.example.com"
    },
    {
      id: 4,
      name: "Packaging Excellence Region Stuttgart e.V.",
      description: "Leading association for packaging innovation and sustainability in the Stuttgart region, connecting industry leaders and research institutions.",
      website: "https://packaging-stuttgart.org",
      location: "Stuttgart, Baden-Württemberg, Germany",
      category: "Manufacturing & Industry",
      registrationDate: "29/08/2025",
      numberOfUsers: 203,
      totalAnalyses: 31,
      organizationContact: "Prof. Dr. Andreas Weber",
      organizationContactEmails: ["info@packaging-stuttgart.org", "research@packaging-stuttgart.org", "events@packaging-stuttgart.org"],
      organizationPersonalContactEmail: "andreas.weber@packaging-stuttgart.org",
      contactEmail: "info@packaging-stuttgart.org",
      contactPhone: "+49 711 4567 890",
      personalContactEmail: "andreas.weber@packaging-stuttgart.org"
    },
    {
      id: 5,
      name: "BioCampus Straubing GmbH",
      description: "Biotechnology research and development center specializing in renewable resources and bioeconomy solutions.",
      website: "https://biocampus-straubing.de",
      location: "Straubing, Bavaria, Germany",
      category: "Research & Development",
      registrationDate: "29/08/2025",
      numberOfUsers: 298,
      totalAnalyses: 42,
      organizationContact: "Dr. Elena Hoffmann",
      organizationContactEmails: ["info@biocampus-straubing.de", "research@biocampus-straubing.de"],
      organizationPersonalContactEmail: "elena.hoffmann@biocampus-straubing.de",
      contactEmail: "info@biocampus-straubing.de",
      contactPhone: "+49 9421 7890 123",
      personalContactEmail: "elena.hoffmann@biocampus-straubing.de"
    }
  ];

  const baseOrganization = organizations.find(org => org.id === parseInt(id || ""));

  // Editable organisation state
  const [isEditing, setIsEditing] = useState(false);
  const [orgEdits, setOrgEdits] = useState<Record<string, any> | null>(null);
  const [orgDraft, setOrgDraft] = useState<Record<string, any> | null>(null);
  const organization = baseOrganization
    ? { ...baseOrganization, ...(orgEdits || {}) }
    : baseOrganization;

  const handleStartEdit = () => {
    if (!organization) return;
    setOrgDraft({
      name: organization.name,
      description: organization.description,
      website: organization.website,
      location: organization.location,
      category: organization.category,
      contactEmail: organization.contactEmail,
      contactPhone: organization.contactPhone,
      personalContactEmail: organization.personalContactEmail,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!orgDraft) return;
    setOrgEdits(orgDraft);
    setIsEditing(false);
    toast({ title: "Organisation updated", description: "Changes saved successfully." });
  };

  const handleCancelEdit = () => {
    setOrgDraft(null);
    setIsEditing(false);
  };

  // Sample users data
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "filip turk",
      email: "filip.t.turk@gmail.com",
      role: "User",
      lastLogin: "Never",
      status: "Active",
      analyses: 5,
      topics: ["Bioethanol", "Apple Pomace", "Digestate"]
    },
    {
      id: 2,
      name: "Archana A",
      email: "archana+vcg@vcg.ai",
      role: "User",
      lastLogin: "Never",
      status: "Active",
      analyses: 3,
      topics: ["Chitin & Chitosan", "Bioreactors"]
    },
    {
      id: 3,
      name: "John Doe",
      email: "john.doe@example.com",
      role: "Admin",
      lastLogin: "2 hours ago",
      status: "Active",
      analyses: 8,
      topics: ["Bioethanol", "Biobased Solvents", "Cottonseed Meal", "Digestate"]
    },
    {
      id: 4,
      name: "Sarah Wilson",
      email: "sarah.wilson@example.com",
      role: "Super Admin",
      lastLogin: "1 day ago",
      status: "Active",
      analyses: 4,
      topics: ["Apple Pomace", "Bioreactors", "Chitin & Chitosan"]
    },
    {
      id: 5,
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      role: "User",
      lastLogin: "3 days ago",
      status: "Inactive",
      analyses: 3,
      topics: ["Digestate", "Bioethanol"]
    }
  ]);

  // Sample active projects data
  const [activeProjects, setActiveProjects] = useState([
    {
      id: 1,
      name: "EU Green Deal Implementation",
      description: "Strategic analysis for implementing EU Green Deal policies",
      keyTopics: ["Feedstock", "Fructose"],
      owners: ["Filip Turk"],
      dateCreated: "Sep 16, 2025",
      lastModified: "3h ago",
      status: "Active"
    },
    {
      id: 2,
      name: "Circular Economy Assessment", 
      description: "Comprehensive assessment of circular economy opportunities",
      keyTopics: ["Feedstock", "Beans"],
      owners: ["Gregor Gabrovšek", "Jan Mitrovic"],
      dateCreated: "Sep 11, 2025",
      lastModified: "4h ago",
      status: "Active"
    },
    {
      id: 3,
      name: "Biorefinery Feasibility Study",
      description: "Technical and economic feasibility analysis for new biorefinery",
      keyTopics: ["Application", "Bio-based-greens"],
      owners: ["Jan Mitrovic", "Filip Turk", "Gregor Gabrovšek"],
      dateCreated: "Sep 11, 2025",
      lastModified: "6h ago",
      status: "Archived"
     }
  ]);

  // Function to change project status
  const handleChangeProjectStatus = (projectId: number, newStatus: string) => {
    console.log('Project status change called:', { projectId, newStatus });
    setActiveProjects(prevProjects => {
      const updated = prevProjects.map(project => 
        project.id === projectId 
          ? { ...project, status: newStatus }
          : project
      );
      console.log('Updated projects:', updated);
      return updated;
    });
  };

  if (!organization) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate("/analysis-management")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Organizations
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-muted-foreground">Organization not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-4 pb-6 max-w-[1400px] w-full mx-auto space-y-4">
      {/* Header with Back Button and Action Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/analysis-management")}
          className="h-8 px-3 text-xs font-medium gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Button>

        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-7 px-2.5 text-[11px] font-medium text-muted-foreground hover:text-foreground">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEdit} className="h-7 px-2.5 text-[11px] font-medium bg-foreground hover:bg-foreground/90 text-background">
              <Check className="w-3 h-3 mr-1" />
              Save changes
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={handleStartEdit} className="h-7 px-2.5 text-[11px] font-medium border-border/40">
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
        )}
      </div>

      {/* Organisation Header Card */}
      <div className="bg-card border border-border/40 rounded-xl p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left Column - Organization Title and Description */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Organisation</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-success/10 border border-success/30">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-success">Active</span>
              </span>
            </div>
            {isEditing ? (
              <Input
                value={orgDraft?.name || ""}
                onChange={(e) => setOrgDraft({ ...orgDraft, name: e.target.value })}
                className="text-base font-bold h-8 mb-1 px-2 animate-edit-pop transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60 border-primary/30 bg-background" style={{ animationDelay: "0ms" }}
                maxLength={120}
              />
            ) : (
              <h1 className="text-base font-bold text-foreground tracking-tight mb-1">
                {organization.name}
              </h1>
            )}
            <p className="text-[11px] text-muted-foreground mb-3">
              Registered {organization.registrationDate}
            </p>
            {isEditing ? (
              <Textarea
                value={orgDraft?.description || ""}
                onChange={(e) => setOrgDraft({ ...orgDraft, description: e.target.value })}
                className="text-xs leading-relaxed min-h-[120px] animate-edit-pop transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60 border-primary/30 bg-background" style={{ animationDelay: "60ms" }}
                maxLength={1000}
              />
            ) : (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {organization.description}
              </p>
            )}
          </div>

          {/* Right Column - Company and Contact Information */}
          <div className="space-y-3">
            {/* Company Information */}
            <div className="bg-muted/30 border border-border/40 p-3 rounded-lg">
              <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-2.5">Company Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-3">
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">Category</span>
                  {isEditing ? (
                    <Input
                      value={orgDraft?.category || ""}
                      onChange={(e) => setOrgDraft({ ...orgDraft, category: e.target.value })}
                      className="h-6 text-xs px-2 max-w-[200px] text-right animate-edit-pop transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60 border-primary/30 bg-background" style={{ animationDelay: "120ms" }}
                    />
                  ) : (
                    <span className="text-xs text-foreground font-medium">{organization.category}</span>
                  )}
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">Location</span>
                  {isEditing ? (
                    <Input
                      value={orgDraft?.location || ""}
                      onChange={(e) => setOrgDraft({ ...orgDraft, location: e.target.value })}
                      className="h-6 text-xs px-2 max-w-[240px] text-right animate-edit-pop transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60 border-primary/30 bg-background" style={{ animationDelay: "180ms" }}
                    />
                  ) : (
                    <span className="text-xs text-foreground text-right">{organization.location}</span>
                  )}
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">Website</span>
                  {isEditing ? (
                    <Input
                      value={orgDraft?.website || ""}
                      onChange={(e) => setOrgDraft({ ...orgDraft, website: e.target.value })}
                      className="h-6 text-xs px-2 max-w-[240px] text-right animate-edit-pop transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60 border-primary/30 bg-background" style={{ animationDelay: "240ms" }}
                      placeholder="https://"
                    />
                  ) : (
                    <a href={organization.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-foreground hover:text-foreground/70 font-medium">
                      Visit <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-muted/30 border border-border/40 p-3 rounded-lg">
              <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-2.5">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-3">
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">Email</span>
                  {isEditing ? (
                    <Input
                      value={orgDraft?.contactEmail || ""}
                      onChange={(e) => setOrgDraft({ ...orgDraft, contactEmail: e.target.value })}
                      className="h-6 text-xs px-2 max-w-[260px] text-right animate-edit-pop transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60 border-primary/30 bg-background" style={{ animationDelay: "300ms" }}
                      type="email"
                    />
                  ) : (
                    <a href={`mailto:${organization.contactEmail}`} className="text-xs text-foreground hover:text-foreground/70 font-medium truncate">
                      {organization.contactEmail}
                    </a>
                  )}
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">Phone</span>
                  {isEditing ? (
                    <Input
                      value={orgDraft?.contactPhone || ""}
                      onChange={(e) => setOrgDraft({ ...orgDraft, contactPhone: e.target.value })}
                      className="h-6 text-xs px-2 max-w-[200px] text-right font-mono animate-edit-pop transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60 border-primary/30 bg-background" style={{ animationDelay: "360ms" }}
                    />
                  ) : (
                    <a href={`tel:${organization.contactPhone}`} className="text-xs text-foreground hover:text-foreground/70 font-mono">
                      {organization.contactPhone}
                    </a>
                  )}
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">Personal</span>
                  {isEditing ? (
                    <Input
                      value={orgDraft?.personalContactEmail || ""}
                      onChange={(e) => setOrgDraft({ ...orgDraft, personalContactEmail: e.target.value })}
                      className="h-6 text-xs px-2 max-w-[260px] text-right animate-edit-pop transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/60 border-primary/30 bg-background" style={{ animationDelay: "420ms" }}
                      type="email"
                    />
                  ) : (
                    <a href={`mailto:${organization.personalContactEmail}`} className="text-xs text-foreground hover:text-foreground/70 font-medium truncate">
                      {organization.personalContactEmail}
                    </a>
                  )}
                 </div>
               </div>
             </div>

          </div>
         </div>
       </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
          <TabsList className="w-full bg-card border border-border/40 p-0.5 h-auto grid grid-cols-4">
            <TabsTrigger value="analyses" className="flex items-center justify-center gap-1.5 py-1.5 text-[11px] rounded-md data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm transition-all relative">
              <BarChart3 className="w-3 h-3" />
              Analysis Topics
              <span className="ml-1 text-[10px] font-bold opacity-70">{organization.totalAnalyses}</span>
              {pendingTopicsCount > 0 && (
                <span className="ml-1 inline-flex items-center justify-center min-w-[14px] h-[14px] px-1 rounded-full bg-warning text-warning-foreground text-[8px] font-bold leading-none self-center">
                  {pendingTopicsCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center justify-center gap-1.5 py-1.5 text-[11px] rounded-md data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm transition-all">
              <Activity className="w-3 h-3" />
              Analyses
              <span className="ml-1 text-[10px] font-bold opacity-70">{activeProjects.length}</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center justify-center gap-1.5 py-1.5 text-[11px] rounded-md data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm transition-all">
              <Users className="w-3 h-3" />
              User Management
              <span className="ml-1 text-[10px] font-bold opacity-70">{organization.numberOfUsers}</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center justify-center gap-1.5 py-1.5 text-[11px] rounded-md data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm transition-all relative">
              <Crown className="w-3 h-3" />
              Billing & Subscription
              <span className="ml-1 inline-flex items-center justify-center px-1.5 h-[14px] rounded-full bg-warning/15 text-warning text-[8px] font-bold tracking-widest uppercase leading-none self-center border border-warning/30">
                Soon
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Billing & Subscription Tab — Coming Soon */}
          <TabsContent value="billing">
            <Card className="border-border/40 shadow-sm">
              <CardContent className="p-6">
                <div className="relative bg-gradient-to-br from-muted/40 via-card to-success/5 border border-dashed border-border/60 p-6 rounded-lg overflow-hidden">
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="text-[9px] font-bold tracking-widest uppercase bg-warning/10 text-warning border-warning/30">
                      Coming Soon
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Crown className="w-3.5 h-3.5 text-muted-foreground" />
                    <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">VCG Subscription Package</h3>
                  </div>
                  <h2 className="text-base font-bold text-foreground tracking-tight mb-1.5">
                    Manage <span className="text-success">billing & plan</span>
                  </h2>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-5 max-w-[80%]">
                    Track which VCG plan this organisation is subscribed to — tier, seat allowance, included analyses, renewal date, invoices, and payment method.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 opacity-60 mb-5">
                    {[
                      { label: "Plan", value: "—" },
                      { label: "Seats", value: "—" },
                      { label: "Analyses", value: "—" },
                      { label: "Renews", value: "—" },
                    ].map((item) => (
                      <div key={item.label} className="bg-background/60 border border-border/40 rounded-md px-3 py-2.5">
                        <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase truncate">{item.label}</div>
                        <div className="text-sm font-bold text-foreground/40 mt-0.5">{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-60">
                    <div className="bg-background/60 border border-border/40 rounded-md px-3 py-2.5">
                      <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">Payment Method</div>
                      <div className="text-xs text-foreground/50 mt-1">No payment method on file</div>
                    </div>
                    <div className="bg-background/60 border border-border/40 rounded-md px-3 py-2.5">
                      <div className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">Invoice History</div>
                      <div className="text-xs text-foreground/50 mt-1">Invoices will appear here</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users">
            <Card className="border-border/40 shadow-sm">
              <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Organisation Users</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Manage users, roles, and permissions.</p>
                </div>
                <Button size="sm" className="h-7 px-2.5 bg-foreground hover:bg-foreground/90 text-background text-[11px] font-medium flex-shrink-0">
                  <Plus className="w-3 h-3 mr-1" />
                  Add User
                </Button>
              </div>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30 border-b">
                      <tr>
                        <th className="text-left py-2.5 px-4 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">Name</th>
                        <th className="text-left py-2.5 px-4 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">Email</th>
                        <th className="text-left py-2.5 px-4 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">Role</th>
                        <th className="text-left py-2.5 px-4 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">Status</th>
                        <th className="text-left py-2.5 px-4 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">Last Login</th>
                        <th className="text-right py-2.5 px-4 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr 
                          key={user.id} 
                          className={`
                            border-b border-border/20 hover:bg-muted/20 transition-all duration-200
                            ${index === users.length - 1 ? 'border-b-0' : ''}
                            ${user.status === 'Inactive' ? 'opacity-60' : ''}
                          `}
                        >
                          <td className="py-2.5 px-4">
                            <p className="font-medium text-[13px] text-foreground">{user.name}</p>
                          </td>
                          <td className="py-2.5 px-4">
                            <a 
                              href={`mailto:${user.email}`}
                              className="text-[11px] text-foreground hover:text-foreground/70"
                            >
                              {user.email}
                            </a>
                          </td>
                          <td className="py-2.5 px-4 relative">
                            <div className="relative">
                              <Badge 
                                variant="outline"
                                className="text-[10px] font-medium rounded-sm cursor-pointer hover:bg-muted/60 transition-all inline-flex items-center gap-1 px-2 py-0 bg-muted/40 text-foreground border-border/60"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenRoleDropdown(openRoleDropdown === user.id ? null : user.id);
                                }}
                              >
                                {user.role}
                                <ChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${openRoleDropdown === user.id ? 'rotate-180' : ''}`} />
                              </Badge>
                              {openRoleDropdown === user.id && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setOpenRoleDropdown(null)}
                                  />
                                  <div className="absolute top-full left-0 mt-2 w-40 bg-background border border-border rounded-lg shadow-xl z-[9999] py-1 animate-scale-in">
                                    <div className="px-1" onClick={(e) => e.stopPropagation()}>
                                      {[
                                        { role: 'User', icon: User, color: 'text-blue-500' },
                                        { role: 'Admin', icon: Shield, color: 'text-orange-500' },
                                        { role: 'Super Admin', icon: Crown, color: 'text-purple-500' },
                                      ].map(({ role, icon: Icon, color }) => (
                                        <div
                                          key={role}
                                          className={`w-full px-3 py-2 text-left text-xs rounded-md hover:bg-muted/80 transition-all duration-150 flex items-center justify-between cursor-pointer ${
                                            user.role === role ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                                          }`}
                                          onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleChangeUserRole(user.id, role);
                                            setOpenRoleDropdown(null);
                                          }}
                                        >
                                          <span className="flex items-center gap-2">
                                            <Icon className={`w-3 h-3 ${color}`} />
                                            {role}
                                          </span>
                                          {user.role === role && <Check className="w-3.5 h-3.5 text-primary animate-scale-in" />}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 relative">
                            <div className="relative">
                              <Badge 
                                variant="outline"
                                className={`text-[10px] font-medium rounded-sm cursor-pointer hover:bg-muted/60 transition-all inline-flex items-center gap-1 px-2 py-0 w-16 justify-center ${
                                  user.status === 'Active' ? 'bg-success/10 text-success border-success/30' : 'bg-muted/50 text-muted-foreground border-border/60'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenStatusDropdown(openStatusDropdown === user.id ? null : user.id);
                                }}
                              >
                                {user.status}
                                <ChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${openStatusDropdown === user.id ? 'rotate-180' : ''}`} />
                              </Badge>
                              {openStatusDropdown === user.id && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setOpenStatusDropdown(null)}
                                  />
                                  <div className="absolute top-full left-0 mt-2 w-36 bg-background border border-border rounded-lg shadow-xl z-[9999] py-1 animate-scale-in">
                                    <div className="px-1" onClick={(e) => e.stopPropagation()}>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <div
                                            className={`w-full px-3 py-2 text-left text-xs rounded-md hover:bg-muted/80 transition-all duration-150 flex items-center justify-between cursor-pointer ${
                                              user.status === 'Active' ? 'bg-success/10 text-success font-medium' : 'text-foreground'
                                            }`}
                                          >
                                            <span className="flex items-center gap-2">
                                              <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-muted'}`} />
                                              Active
                                            </span>
                                            {user.status === 'Active' && <Check className="w-3.5 h-3.5 text-success animate-scale-in" />}
                                          </div>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>{user.status === 'Active' ? 'Deactivate User' : 'Activate User'}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              {user.status === 'Active' 
                                                ? `Are you sure you want to deactivate ${user.name}? They will lose access to the organization and all associated analyses.`
                                                : `Are you sure you want to activate ${user.name}? They will regain access to the organization.`}
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel onClick={() => setOpenStatusDropdown(null)}>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() => {
                                                handleDeactivateUser(user.id);
                                                setOpenStatusDropdown(null);
                                              }}
                                              className={user.status === 'Active' ? 'bg-destructive hover:bg-destructive/90' : 'bg-foreground hover:bg-foreground/90'}
                                            >
                                              {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <div
                                            className={`w-full px-3 py-2 text-left text-xs rounded-md hover:bg-muted/80 transition-all duration-150 flex items-center justify-between cursor-pointer ${
                                              user.status === 'Inactive' ? 'bg-muted/60 text-muted-foreground font-medium' : 'text-foreground'
                                            }`}
                                          >
                                            <span className="flex items-center gap-2">
                                              <div className={`w-2 h-2 rounded-full ${user.status === 'Inactive' ? 'bg-gray-400' : 'bg-muted'}`} />
                                              Inactive
                                            </span>
                                            {user.status === 'Inactive' && <Check className="w-3.5 h-3.5 text-muted-foreground animate-scale-in" />}
                                          </div>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>{user.status === 'Inactive' ? 'Activate User' : 'Deactivate User'}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              {user.status === 'Inactive' 
                                                ? `Are you sure you want to activate ${user.name}? They will regain access to the organization.`
                                                : `Are you sure you want to deactivate ${user.name}? They will lose access to the organization and all associated analyses.`}
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel onClick={() => setOpenStatusDropdown(null)}>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() => {
                                                handleDeactivateUser(user.id);
                                                setOpenStatusDropdown(null);
                                              }}
                                              className={user.status === 'Inactive' ? 'bg-foreground hover:bg-foreground/90' : 'bg-destructive hover:bg-destructive/90'}
                                            >
                                              {user.status === 'Inactive' ? 'Activate' : 'Deactivate'}
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                user.status === 'Inactive' ? 'bg-muted-foreground/50' :
                                user.lastLogin === 'Never' ? 'bg-muted-foreground/40' : 
                                user.lastLogin.includes('hour') ? 'bg-success' : 
                                user.lastLogin.includes('day') ? 'bg-amber-500' : 
                                'bg-muted-foreground/40'
                              }`} />
                              <span className="text-[11px] text-muted-foreground">
                                {user.status === 'Inactive' ? 'Inactive' : user.lastLogin}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <Button variant="outline" size="sm" className="h-7 px-2 text-[11px] font-medium border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground">
                              <Key className="w-3 h-3 mr-1" />
                              Reset
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Topics Tab */}
          <TabsContent value="analyses">
            <Card className="border-border/40 shadow-sm">
              <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Analysis Topics</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">All analysis topics and research areas being worked on by users in this organisation.</p>
                </div>
                <Button size="sm" className="h-7 px-2.5 bg-foreground hover:bg-foreground/90 text-background text-[11px] font-medium flex-shrink-0">
                  <Plus className="w-3 h-3 mr-1" />
                  New Topic
                </Button>
              </div>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                      <thead className="bg-muted/30 border-b">
                        <tr>
                          <th className="text-left py-3 px-4 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
                            Category
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
                            Topic
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
                            Date Added
                          </th>
                          <th className="text-right py-3 px-4 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">
                            Actions
                          </th>
                        </tr>
                     </thead>
                     <tbody>
                       {sortedAnalysisTopics.map((topic, index) => (
                          <tr 
                            key={topic.id} 
                             className={`
                               border-b border-border/20 hover:bg-muted/20 transition-all duration-200
                               ${index === sortedAnalysisTopics.length - 1 ? 'border-b-0' : ''}
                               ${topic.status === 'Archived' ? 'opacity-60' : ''}
                               ${isNewTopic(topic.addedDate) && topic.approvalStatus === 'pending' ? 'bg-muted/20 border-l-2 border-l-foreground/40' : ''}
                             `}
                          >
                            <td className="py-2.5 px-4">
                              <Badge variant="outline" className={`text-[10px] rounded-sm px-1.5 py-0 font-medium ${getCategoryColorClasses(topic.category)}`}>
                                {topic.category}
                              </Badge>
                            </td>
                            <td className="py-2.5 px-4">
                              <div className="flex items-start gap-3">
                                <div className="min-w-0 flex-1">
                                   <div className="flex items-center gap-2 mb-0.5">
                                     <p className="font-medium text-[13px] text-foreground">{topic.name}</p>
                                      {isNewTopic(topic.addedDate) && topic.approvalStatus === 'pending' && (
                                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-foreground text-background border-0 rounded-sm font-semibold tracking-wide uppercase">
                                          New
                                        </Badge>
                                      )}
                                   </div>
                                   <p className="text-[11px] text-muted-foreground">
                                     {topic.approvalStatus === 'pending' 
                                       ? 'Database: To be assigned upon approval' 
                                       : `Database used: ${topic.database}`
                                     }
                                   </p>
                                </div>
                              </div>
                            </td>
                             <td className="py-2.5 px-4 relative">
                                {topic.approvalStatus === 'pending' ? (
                                  <Badge 
                                    variant="outline"
                                    className="text-[10px] font-medium rounded-sm px-2 py-0 bg-muted/50 text-muted-foreground border-border/60 w-16 justify-center"
                                  >
                                    Pending
                                  </Badge>
                                ) : topic.approvalStatus === 'denied' ? (
                                  <Badge 
                                    variant="outline"
                                    className="text-[10px] font-medium rounded-sm px-2 py-0 bg-destructive/10 text-destructive border-destructive/30 w-16 justify-center"
                                  >
                                    Denied
                                  </Badge>
                                ) : (
                                  <div className="relative">
                                    <Badge 
                                      variant="outline"
                                      className={`text-[10px] font-medium rounded-sm cursor-pointer hover:bg-muted/60 transition-all inline-flex items-center gap-1 px-2 py-0 w-16 justify-center ${topic.status === 'Active' ? 'bg-success/10 text-success border-success/30' : 'bg-muted/50 text-muted-foreground border-border/60'}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenDropdown(openDropdown === topic.id ? null : topic.id);
                                      }}
                                    >
                                      {topic.status}
                                      <ChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${openDropdown === topic.id ? 'rotate-180' : ''}`} />
                                    </Badge>

                                   {openDropdown === topic.id && (
                                     <>
                                       {/* Backdrop */}
                                       <div 
                                         className="fixed inset-0 z-40" 
                                         onClick={() => setOpenDropdown(null)}
                                       />
                                       
                                       {/* Dropdown */}
                                       <div className="absolute top-full left-0 mt-2 w-36 bg-background border border-border rounded-lg shadow-xl z-[9999] py-1 animate-scale-in">
                                         <div className="px-1" onClick={(e) => e.stopPropagation()}>
                                           <div
                                             className={`w-full px-3 py-2 text-left text-xs rounded-md hover:bg-muted/80 transition-all duration-150 flex items-center justify-between group cursor-pointer ${
                                               topic.status === 'Active' ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                                             }`}
                                             onMouseDown={(e) => {
                                               e.preventDefault();
                                               e.stopPropagation();
                                               console.log('Active clicked for topic:', topic.id);
                                               handleChangeAnalysisStatus(topic.id, 'Active');
                                               setOpenDropdown(null);
                                             }}
                                           >
                                             <span className="flex items-center gap-2">
                                               <div className={`w-2 h-2 rounded-full ${topic.status === 'Active' ? 'bg-green-500' : 'bg-muted'}`} />
                                               Active
                                             </span>
                                             {topic.status === 'Active' && (
                                               <Check className="w-3.5 h-3.5 text-primary animate-scale-in" />
                                             )}
                                           </div>
                                           <div
                                             className={`w-full px-3 py-2 text-left text-xs rounded-md hover:bg-muted/80 transition-all duration-150 flex items-center justify-between group cursor-pointer ${
                                               topic.status === 'Archived' ? 'bg-muted/50 text-muted-foreground font-medium' : 'text-foreground'
                                             }`}
                                             onMouseDown={(e) => {
                                               e.preventDefault();
                                               e.stopPropagation();
                                               console.log('Archived clicked for topic:', topic.id);
                                               handleChangeAnalysisStatus(topic.id, 'Archived');
                                               setOpenDropdown(null);
                                             }}
                                           >
                                             <span className="flex items-center gap-2">
                                               <div className={`w-2 h-2 rounded-full ${topic.status === 'Archived' ? 'bg-gray-400' : 'bg-muted'}`} />
                                               Archived
                                             </span>
                                             {topic.status === 'Archived' && (
                                               <Check className="w-3.5 h-3.5 text-muted-foreground animate-scale-in" />
                                             )}
                                           </div>
                                         </div>
                                       </div>
                                     </>
                                   )}
                                 </div>
                               )}
                             </td>
                           <td className="py-2.5 px-4">
                             <span className="text-muted-foreground text-[11px]">{topic.addedDate}</span>
                           </td>
                             <td className="py-2.5 px-4 text-right">
                               {isNewTopic(topic.addedDate) && topic.approvalStatus === 'pending' ? (
                                 <Button 
                                   variant="outline" 
                                   size="sm" 
                                   className="h-6 w-6 p-0 border-border/60 text-muted-foreground hover:bg-muted/50"
                                   onClick={() => handleApproveTopic(topic.id, topic.name, topic.description)}
                                 >
                                   <FileSearch className="w-3 h-3" />
                                 </Button>
                              ) : topic.approvalStatus === 'denied' ? (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-6 w-6 p-0 border-border/60 opacity-50 cursor-not-allowed"
                                  disabled
                                >
                                  <XCircle className="w-3 h-3" />
                                </Button>
                              ) : topic.status === 'Archived' ? (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-6 px-2 text-[10px] font-medium border-success/40 text-success hover:bg-success/10 hover:text-success gap-1"
                                  onClick={() => handleChangeAnalysisStatus(topic.id, 'Active')}
                                  title="Restore to Active"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  Unarchive
                                </Button>
                              ) : topic.status === 'Active' ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-[10px] font-medium border-border/60 text-foreground hover:bg-muted/50 gap-1"
                                  onClick={() => navigate(`/landscape/${encodeURIComponent(topic.category)}/${encodeURIComponent(topic.name)}`)}
                                  title="Open topic"
                                >
                                  Open
                                  <ChevronRight className="w-3 h-3" />
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-[10px] font-medium border-border/60 text-muted-foreground opacity-60 cursor-not-allowed gap-1"
                                  disabled
                                  title="Not available"
                                >
                                  Open
                                  <ChevronRight className="w-3 h-3" />
                                </Button>
                              )}
                            </td>
                         </tr>
                      ))}
                     </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Projects Tab */}
          <TabsContent value="projects">
            <Card className="border-border/40 shadow-sm">
              <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Analyses</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Current analyses with ongoing progress and their status.</p>
                </div>
              </div>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30 border-b">
                      <tr>
                        <th className="text-left py-2.5 px-4 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">Analysis Name</th>
                        <th className="text-left py-2.5 px-4 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">Owner</th>
                        <th className="text-left py-2.5 px-4 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">Date Created</th>
                        <th className="text-left py-2.5 px-4 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">Last Modified</th>
                        <th className="text-left py-2.5 px-4 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">Status</th>
                        <th className="text-right py-2.5 px-4 font-medium text-[10px] text-muted-foreground uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeProjects.map((project, index) => (
                        <tr 
                          key={project.id} 
                          className={`
                            border-b border-border/20 hover:bg-muted/20 transition-all duration-200
                            ${index === activeProjects.length - 1 ? 'border-b-0' : ''}
                            ${project.status === 'Archived' ? 'opacity-60' : ''}
                          `}
                        >
                          <td className="py-2.5 px-4">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-[13px] text-foreground mb-1">{project.name}</p>
                              <div className="flex flex-wrap gap-1">
                                {project.keyTopics.map((topic, idx) => {
                                  const cls =
                                    topic === 'Feedstock' || topic === 'Fructose' || topic === 'Beans'
                                      ? 'bg-success/10 text-success border-success/30'
                                      : topic === 'Application' || topic === 'Bio-based-greens'
                                      ? 'bg-market-orange/10 text-market-orange border-market-orange/30'
                                      : 'bg-application-purple/10 text-application-purple border-application-purple/30';
                                  return (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className={`text-[10px] rounded-sm px-1.5 py-0 font-medium ${cls}`}
                                    >
                                      {topic}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="space-y-0.5">
                              {project.owners.map((owner, idx) => (
                                <div key={idx} className="text-[11px] text-foreground">{owner}</div>
                              ))}
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="text-[11px] text-muted-foreground">{project.dateCreated}</span>
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-success" />
                              <span className="text-[11px] text-muted-foreground">{project.lastModified}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 align-middle">
                            <div className="relative">
                              <Badge 
                                variant="outline"
                                className={`text-[10px] font-medium rounded-sm cursor-pointer hover:bg-muted/60 transition-all inline-flex items-center gap-1 px-2 py-0 w-16 justify-center ${
                                  project.status === 'Active' ? 'bg-success/10 text-success border-success/30' : 'bg-muted/50 text-muted-foreground border-border/60'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenProjectDropdown(openProjectDropdown === project.id ? null : project.id);
                                }}
                              >
                                {project.status}
                                <ChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${openProjectDropdown === project.id ? 'rotate-180' : ''}`} />
                              </Badge>
                              {openProjectDropdown === project.id && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => setOpenProjectDropdown(null)}
                                  />
                                  <div className="absolute top-full left-0 mt-2 w-36 bg-background border border-border rounded-lg shadow-xl z-[9999] py-1 animate-scale-in">
                                    <div className="px-1" onClick={(e) => e.stopPropagation()}>
                                      <div
                                        className={`w-full px-3 py-2 text-left text-xs rounded-md hover:bg-muted/80 transition-all duration-150 flex items-center justify-between cursor-pointer ${
                                          project.status === 'Active' ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                                        }`}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleChangeProjectStatus(project.id, 'Active');
                                          setOpenProjectDropdown(null);
                                        }}
                                      >
                                        <span className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${project.status === 'Active' ? 'bg-green-500' : 'bg-muted'}`} />
                                          Active
                                        </span>
                                        {project.status === 'Active' && <Check className="w-3.5 h-3.5 text-primary animate-scale-in" />}
                                      </div>
                                      <div
                                        className={`w-full px-3 py-2 text-left text-xs rounded-md hover:bg-muted/80 transition-all duration-150 flex items-center justify-between cursor-pointer ${
                                          project.status === 'Archived' ? 'bg-muted/50 text-muted-foreground font-medium' : 'text-foreground'
                                        }`}
                                        onMouseDown={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleChangeProjectStatus(project.id, 'Archived');
                                          setOpenProjectDropdown(null);
                                        }}
                                      >
                                        <span className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${project.status === 'Archived' ? 'bg-gray-400' : 'bg-muted'}`} />
                                          Archived
                                        </span>
                                        {project.status === 'Archived' && <Check className="w-3.5 h-3.5 text-muted-foreground animate-scale-in" />}
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-right align-middle">
                            <Button variant="outline" size="sm" className="h-7 px-2 text-[11px] font-medium border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground">
                              Open
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      
      
      {/* Approval Dialog */}
      <Dialog open={!!approvalDialog} onOpenChange={(open) => !open && setApprovalDialog(null)}>
        <DialogContent className="sm:max-w-xl max-w-3xl w-full">
          <DialogHeader>
            <DialogTitle className="text-lg">Review Technology Request</DialogTitle>
          </DialogHeader>
           <div className="space-y-2">
             {/* Name Section */}
             <div className="bg-muted/60 rounded-lg p-2.5 border">
               <label className="text-xs font-bold text-muted-foreground block mb-1">Name</label>
               <p className="text-xs font-medium text-foreground">{approvalDialog?.topicName}</p>
             </div>
             
             {/* Category Section */}
             <div className="bg-muted/60 rounded-lg p-2.5 border">
               <label className="text-xs font-bold text-muted-foreground block mb-1">Subcategory</label>
               <p className="text-xs font-medium text-foreground">
                 {analysisTopics.find(topic => topic.id === approvalDialog?.topicId)?.category}
               </p>
             </div>
             
             {/* Description Section */}
             <div className="bg-muted/60 rounded-lg p-2.5 border">
               <label className="text-xs font-bold text-muted-foreground block mb-1">Description</label>
               <p className="text-xs text-foreground leading-relaxed min-h-[2.5rem] break-words">{approvalDialog?.description}</p>
             </div>
             
             {/* Database Selection Section */}
             <div className="bg-muted/60 rounded-lg p-2.5 border">
               <label className="text-xs font-bold text-muted-foreground block mb-1">Database Selection</label>
               <p className="text-xs text-muted-foreground mb-2">
                 Please select which database this analysis should use:
               </p>
               <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
                 <SelectTrigger className="bg-muted/40 border-muted-foreground/20 hover:bg-muted/60 focus:bg-muted/60 text-xs">
                   <SelectValue placeholder="Choose a database..." />
                 </SelectTrigger>
                 <SelectContent 
                   position="popper" 
                   side="bottom" 
                   align="start" 
                   sideOffset={4}
                   className="max-h-60 overflow-y-auto bg-background/95 backdrop-blur-sm border border-muted-foreground/20 text-xs"
                   avoidCollisions={false}
                 >
                   {availableDatabases.map((db) => (
                     <SelectItem 
                       key={db} 
                       value={db}
                       className="hover:bg-muted/60 focus:bg-muted/60 text-xs py-1"
                     >
                       {db}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
           </div>
            
              <div className="flex gap-3 justify-end">
                <Button 
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md font-medium"
                  onClick={() => {
                    if (approvalDialog) {
                      handleDenyTopic(approvalDialog.topicId);
                    }
                    setApprovalDialog(null);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Decline
                </Button>
                <Button 
                  onClick={confirmApproval}
                  disabled={!selectedDatabase}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium disabled:bg-green-300"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
               </div>
         </DialogContent>
       </Dialog>
     </div>
   );
 };
 
 export default OrganizationManagement;