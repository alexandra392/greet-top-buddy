import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ClipboardList, Plus, Bell, Search, RefreshCw, FolderOpen, Database, Sparkles, Building2, Mail, Link2, UserPlus, Check, Copy, History, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const AnalysisManagement = () => {
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);
  const [dbDialogOpen, setDbDialogOpen] = useState(false);
  const [dbForm, setDbForm] = useState({
    name: "",
    keywordInput: "",
    keywords: [] as string[],
    suggestKeyword: "",
    suggestCount: "10",
    fieldOfStudy: "",
    yearFrom: "1960",
    yearTo: "2026",
    minCitations: "0",
    maxPapers: "100",
    biolink: false,
  });
  const addKeyword = () => {
    const k = dbForm.keywordInput.trim();
    if (!k) return;
    setDbForm((p) => ({ ...p, keywords: [...p.keywords, k], keywordInput: "" }));
  };
  const removeKeyword = (k: string) => setDbForm((p) => ({ ...p, keywords: p.keywords.filter((x) => x !== k) }));
  const estPapers = Math.round(parseInt(dbForm.maxPapers || "0", 10) * 0.67);
  const estCost = (estPapers * 0.005).toFixed(2);
  const closeDbDialog = () => {
    setDbDialogOpen(false);
    setDbForm({ name: "", keywordInput: "", keywords: [], suggestKeyword: "", suggestCount: "10", fieldOfStudy: "", yearFrom: "1960", yearTo: "2026", minCitations: "0", maxPapers: "100", biolink: false });
  };
  const createDatabase = () => {
    if (!dbForm.name.trim()) {
      toast({ title: "Database name required", description: "Please enter a name for the database.", variant: "destructive" });
      return;
    }
    toast({ title: "Database created", description: `${dbForm.name} has been added to the repertoire.` });
    closeDbDialog();
  };
  const [dialogMode, setDialogMode] = useState<null | "email" | "link" | "manual">(null);
  const [emailValue, setEmailValue] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [inviteOrg, setInviteOrg] = useState("");
  const [inviteTax, setInviteTax] = useState("");
  const defaultMessage = (first: string, org: string) =>
    `Hi ${first || "there"},\n\nYou've been invited to join the VCG platform${org ? ` on behalf of ${org}` : ""}. The platform helps you explore value chains, manage analyses and collaborate with stakeholders across the bioeconomy.\n\nClick the link in this invitation to set up your account and get started.\n\nLooking forward to having you onboard,\nThe VCG Team`;
  const [inviteMessage, setInviteMessage] = useState(defaultMessage("", ""));
  const [messageEdited, setMessageEdited] = useState(false);
  const [orgForm, setOrgForm] = useState({
    name: "",
    category: "",
    street: "",
    city: "",
    region: "",
    country: "",
    postcode: "",
    website: "",
    description: "",
    email: "",
    phone: "",
    personalEmail: "",
  });
  const inviteLink = typeof window !== "undefined" ? `${window.location.origin}/invite/org/${Math.random().toString(36).slice(2, 10)}` : "";
  const [copied, setCopied] = useState(false);

  const openMode = (mode: "email" | "link" | "manual") => {
    setAddOpen(false);
    setDialogMode(mode);
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEmailValue("");
    setInviteFirstName("");
    setInviteLastName("");
    setInviteOrg("");
    setInviteTax("");
    setInviteMessage(defaultMessage("", ""));
    setMessageEdited(false);
    setOrgForm({ name: "", category: "", street: "", city: "", region: "", country: "", postcode: "", website: "", description: "", email: "", phone: "", personalEmail: "" });
    setCopied(false);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({ title: "Link copied", description: "Invite link copied to clipboard." });
  };

  const databaseRepertoire = [
    { id: 1, name: "Wheat Straw Database", category: "Feedstock", records: 1245, lastUpdated: "Mar 13, 2026, 1:02 PM", status: "open", pipelineDone: 12, pipelineTotal: 20, pipelineFailed: 8, biolink: "—", batchStatus: "Completed", timePerPaper: "16s", elapsed: "3m 10s elapsed" },
    { id: 2, name: "Biochar Database", category: "Materials", records: 892, lastUpdated: "Mar 11, 2026, 12:22 PM", status: "open", pipelineDone: 0, pipelineTotal: 0, pipelineFailed: 0, biolink: "—", batchStatus: "—", timePerPaper: "—", elapsed: "—" },
    { id: 3, name: "Lignin Database", category: "Materials", records: 567, lastUpdated: "Mar 9, 2026, 1:54 PM", status: "open", pipelineDone: 0, pipelineTotal: 0, pipelineFailed: 0, biolink: "—", batchStatus: "—", timePerPaper: "—", elapsed: "—" },
    { id: 4, name: "Sugar Beet Database", category: "Feedstock", records: 334, lastUpdated: "Mar 6, 2026, 11:01 AM", status: "open", pipelineDone: 0, pipelineTotal: 0, pipelineFailed: 0, biolink: "—", batchStatus: "—", timePerPaper: "—", elapsed: "—" },
    { id: 5, name: "Cellulose Database", category: "Materials", records: 2156, lastUpdated: "Mar 6, 2026, 7:45 AM", status: "open", pipelineDone: 0, pipelineTotal: 0, pipelineFailed: 0, biolink: "—", batchStatus: "—", timePerPaper: "—", elapsed: "—" },
    { id: 6, name: "Xylose Database", category: "Materials", records: 4521, lastUpdated: "Mar 5, 2026, 4:30 PM", status: "open", pipelineDone: 0, pipelineTotal: 0, pipelineFailed: 0, biolink: "—", batchStatus: "—", timePerPaper: "—", elapsed: "—" },
    { id: 7, name: "Hemicellulose Database", category: "Materials", records: 8934, lastUpdated: "Mar 5, 2026, 3:18 PM", status: "open", pipelineDone: 6, pipelineTotal: 10, pipelineFailed: 4, biolink: "Pending", batchStatus: "Completed", timePerPaper: "14s", elapsed: "1m 25s elapsed" },
    { id: 8, name: "Corn Stover Database", category: "Feedstock", records: 156, lastUpdated: "Mar 5, 2026, 1:49 PM", status: "open", pipelineDone: 18, pipelineTotal: 28, pipelineFailed: 10, biolink: "—", batchStatus: "Completed", timePerPaper: "5s", elapsed: "1m 28s elapsed" },
  ];

  const organizations = [
    { id: 1, name: "Smart Cities and Communities", totalAnalyses: 23, numberOfUsers: 156, location: "Berlin, Germany", hasPendingRequests: true, pendingRequestsCount: 3 },
    { id: 2, name: "Regio Augsburg Wirtschaft GmbH", totalAnalyses: 15, numberOfUsers: 87, location: "Augsburg, Germany" },
    { id: 3, name: "Invite test 06", totalAnalyses: 8, numberOfUsers: 12, location: "Munich, Germany" },
    { id: 4, name: "Packaging Excellence Region Stuttgart e.V.", totalAnalyses: 31, numberOfUsers: 203, location: "Stuttgart, Germany" },
    { id: 5, name: "BioCampus Straubing GmbH", totalAnalyses: 42, numberOfUsers: 298, location: "Straubing, Germany", hasPendingRequests: true, pendingRequestsCount: 2 },
    { id: 6, name: "Invite Test 08", totalAnalyses: 12, numberOfUsers: 24, location: "Frankfurt, Germany" },
    { id: 7, name: "Vegepolys Valley", totalAnalyses: 19, numberOfUsers: 134, location: "Angers, France" },
    { id: 8, name: "Plastics Cluster", totalAnalyses: 27, numberOfUsers: 178, location: "Vienna, Austria" },
    { id: 9, name: "VCG", totalAnalyses: 156, numberOfUsers: 0, location: "—" },
    { id: 10, name: "david6", totalAnalyses: 3, numberOfUsers: 0, location: "—" },
  ];

  const totalOrgs = organizations.length;
  const totalAnalyses = organizations.reduce((s, o) => s + o.totalAnalyses, 0);
  const totalPending = organizations.reduce((s, o) => s + (o.pendingRequestsCount || 0), 0);
  const totalDatabases = databaseRepertoire.length;

  return (
    <div className="px-6 pt-4 pb-6 max-w-[1400px] w-full mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-card via-card to-success/8 border border-border/40 rounded-xl px-5 py-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-4 h-4 rounded-md bg-success/20 flex items-center justify-center">
            <ClipboardList className="w-2.5 h-2.5 text-success" />
          </div>
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">VCG Admin</span>
        </div>
        <h1 className="text-base font-bold text-foreground tracking-tight mb-1">
          Manage your <span className="text-success">organisations & databases</span>
        </h1>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Monitor activity, review pending requests, and oversee the data repertoire powering value chain analyses.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="organisations" className="w-full space-y-3">
        <div>
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Management</h2>
          <TabsList className="w-full bg-card border border-border/40 p-0.5 h-auto">
            <TabsTrigger value="organisations" className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] rounded-md data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm transition-all">
              <Building2 className="w-3 h-3" />
              My Organisations
              <span className="ml-1 text-[10px] font-bold opacity-70">{totalOrgs}</span>
            </TabsTrigger>
            <TabsTrigger value="pathways" className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] rounded-md data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm transition-all">
              <Sparkles className="w-3 h-3" />
              VCG Pathways
              <span className="ml-1 text-[10px] font-bold opacity-70">128</span>
              <span className="ml-1 inline-flex items-center justify-center px-1.5 h-[14px] rounded-full bg-warning/15 text-warning text-[8px] font-bold tracking-widest uppercase leading-none border border-warning/30">
                Soon
              </span>
            </TabsTrigger>
            <TabsTrigger value="repertoire" className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] rounded-md data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm transition-all">
              <Database className="w-3 h-3" />
              Database Repertoire
              <span className="ml-1 text-[10px] font-bold opacity-70">{totalDatabases}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="organisations" className="mt-0">
          <Card className="border-border/40 shadow-sm">
            <div className="px-4 py-3 border-b border-border/30 flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search organisations..."
                  className="h-8 pl-8 text-xs md:text-xs bg-background border-border/40"
                />
              </div>
              <Popover open={addOpen} onOpenChange={setAddOpen}>
                <PopoverTrigger asChild>
                  <Button size="sm" className="ml-auto h-7 px-2.5 bg-foreground hover:bg-foreground/90 text-background text-[11px] font-medium">
                    <Plus className="w-3 h-3 mr-1" />
                    Add Organisation
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64 p-1.5">
                  <button
                    onClick={() => openMode("email")}
                    className="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-md hover:bg-muted/60 transition-colors text-left"
                  >
                    <Mail className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[11px] font-semibold text-foreground">Invite via email</div>
                      <div className="text-[10px] text-muted-foreground">Send an invitation by email</div>
                    </div>
                  </button>
                  <button
                    onClick={() => openMode("manual")}
                    className="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-md hover:bg-muted/60 transition-colors text-left"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[11px] font-semibold text-foreground">Add manually</div>
                      <div className="text-[10px] text-muted-foreground">Create an organisation directly</div>
                    </div>
                  </button>
                </PopoverContent>
              </Popover>

              <Dialog open={dialogMode !== null} onOpenChange={(o) => !o && closeDialog()}>
                <DialogContent className="max-w-2xl">
                  {dialogMode === "email" && (
                    <>
                      <DialogHeader className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-md bg-success/20 flex items-center justify-center">
                            <Mail className="w-2.5 h-2.5 text-success" />
                          </div>
                          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Invite</span>
                        </div>
                        <DialogTitle className="text-sm tracking-tight">Invite via email</DialogTitle>
                        <DialogDescription className="text-[11px] leading-relaxed">Send an invitation to join as an organisation.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 -mr-1">
                        <section className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Recipient</span>
                            <div className="h-px flex-1 bg-border/60" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label htmlFor="invite-first" className="text-[11px] text-muted-foreground">First name <span className="text-destructive">*</span></Label>
                              <Input id="invite-first" placeholder="Jane" className="h-8 text-xs md:text-xs" value={inviteFirstName} onChange={(e) => { setInviteFirstName(e.target.value); if (!messageEdited) setInviteMessage(defaultMessage(e.target.value, inviteOrg)); }} />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="invite-last" className="text-[11px] text-muted-foreground">Surname <span className="text-destructive">*</span></Label>
                              <Input id="invite-last" placeholder="Doe" className="h-8 text-xs md:text-xs" value={inviteLastName} onChange={(e) => setInviteLastName(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="invite-org" className="text-[11px] text-muted-foreground">Organisation name <span className="text-destructive">*</span></Label>
                              <Input id="invite-org" placeholder="Acme Research Institute" className="h-8 text-xs md:text-xs" value={inviteOrg} onChange={(e) => { setInviteOrg(e.target.value); if (!messageEdited) setInviteMessage(defaultMessage(inviteFirstName, e.target.value)); }} />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="invite-tax" className="text-[11px] text-muted-foreground">Tax / VAT ID</Label>
                              <Input id="invite-tax" placeholder="DE123456789" className="h-8 text-xs md:text-xs" value={inviteTax} onChange={(e) => setInviteTax(e.target.value)} />
                            </div>
                            <div className="space-y-1 col-span-2">
                              <Label htmlFor="invite-email" className="text-[11px] text-muted-foreground">Email address <span className="text-destructive">*</span></Label>
                              <Input id="invite-email" type="email" placeholder="name@organisation.com" className="h-8 text-xs md:text-xs" value={emailValue} onChange={(e) => setEmailValue(e.target.value)} />
                            </div>
                          </div>
                        </section>
                        <section className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Message</span>
                            <div className="h-px flex-1 bg-border/60" />
                            <button type="button" className="text-[10px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline" onClick={() => { setInviteMessage(defaultMessage(inviteFirstName, inviteOrg)); setMessageEdited(false); }}>Reset</button>
                          </div>
                          <Textarea
                            id="invite-message"
                            className="text-xs min-h-[140px] resize-none leading-relaxed"
                            value={inviteMessage}
                            onChange={(e) => { setInviteMessage(e.target.value); setMessageEdited(true); }}
                            rows={7}
                          />
                          <p className="text-[10px] text-muted-foreground">You can edit the invitation text before sending.</p>
                        </section>
                      </div>
                      <DialogFooter className="border-t border-border/40 pt-3 -mx-6 px-6 -mb-6 pb-4 bg-muted/20 rounded-b-lg">
                        <Button variant="outline" size="sm" className="h-8 text-xs md:text-xs" onClick={closeDialog}>Cancel</Button>
                        <Button size="sm" className="h-8 text-xs bg-success hover:bg-success/90 text-success-foreground" onClick={() => { toast({ title: "Invitation sent", description: `Invite sent to ${inviteFirstName} ${inviteLastName} at ${inviteOrg}` }); closeDialog(); }} disabled={!emailValue || !inviteFirstName || !inviteLastName || !inviteOrg}>Send invite</Button>
                      </DialogFooter>
                    </>
                  )}
                  {dialogMode === "manual" && (
                    <>
                      <DialogHeader className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-md bg-success/20 flex items-center justify-center">
                            <UserPlus className="w-2.5 h-2.5 text-success" />
                          </div>
                          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">New Organisation</span>
                        </div>
                        <DialogTitle className="text-sm tracking-tight">Add organisation manually</DialogTitle>
                        <DialogDescription className="text-[11px] leading-relaxed">Create a new organisation record with full details.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 -mr-1">
                        <section className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Organisation</span>
                            <div className="h-px flex-1 bg-border/60" />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1 col-span-2">
                              <Label htmlFor="org-name" className="text-[11px] text-muted-foreground">Organisation name</Label>
                              <Input id="org-name" className="h-8 text-xs md:text-xs" value={orgForm.name} onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })} placeholder="Acme Research Institute" />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="org-category" className="text-[11px] text-muted-foreground">Category</Label>
                              <Select value={orgForm.category} onValueChange={(v) => setOrgForm({ ...orgForm, category: v })}>
                                <SelectTrigger id="org-category" className="h-8 text-xs md:text-xs"><SelectValue placeholder="Select category" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Public Sector Initiative" className="text-xs">Public Sector Initiative</SelectItem>
                                  <SelectItem value="Research Institution" className="text-xs">Research Institution</SelectItem>
                                  <SelectItem value="Private Company" className="text-xs">Private Company</SelectItem>
                                  <SelectItem value="Cluster / Association" className="text-xs">Cluster / Association</SelectItem>
                                  <SelectItem value="NGO" className="text-xs">NGO</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="org-description" className="text-[11px] text-muted-foreground">Description</Label>
                            <Textarea id="org-description" className="text-xs min-h-[56px] resize-none" value={orgForm.description} onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })} placeholder="Brief description of the organisation..." rows={2} />
                          </div>
                        </section>
                        <section className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Address</span>
                            <div className="h-px flex-1 bg-border/60" />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1 col-span-2">
                              <Label htmlFor="org-street" className="text-[11px] text-muted-foreground">Street and number</Label>
                              <Input id="org-street" className="h-8 text-xs md:text-xs" value={orgForm.street} onChange={(e) => setOrgForm({ ...orgForm, street: e.target.value })} placeholder="Main Street 12" />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="org-postcode" className="text-[11px] text-muted-foreground">Postcode</Label>
                              <Input id="org-postcode" className="h-8 text-xs md:text-xs" value={orgForm.postcode} onChange={(e) => setOrgForm({ ...orgForm, postcode: e.target.value })} placeholder="10115" />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="org-city" className="text-[11px] text-muted-foreground">City</Label>
                              <Input id="org-city" className="h-8 text-xs md:text-xs" value={orgForm.city} onChange={(e) => setOrgForm({ ...orgForm, city: e.target.value })} placeholder="Berlin" />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="org-region" className="text-[11px] text-muted-foreground">Region</Label>
                              <Input id="org-region" className="h-8 text-xs md:text-xs" value={orgForm.region} onChange={(e) => setOrgForm({ ...orgForm, region: e.target.value })} placeholder="Bavaria" />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="org-country" className="text-[11px] text-muted-foreground">Country</Label>
                              <Input id="org-country" className="h-8 text-xs md:text-xs" value={orgForm.country} onChange={(e) => setOrgForm({ ...orgForm, country: e.target.value })} placeholder="Germany" />
                            </div>
                          </div>
                        </section>
                        <section className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Contact</span>
                            <div className="h-px flex-1 bg-border/60" />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor="org-website" className="text-[11px] text-muted-foreground">Website</Label>
                              <Input id="org-website" className="h-8 text-xs md:text-xs" value={orgForm.website} onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })} placeholder="https://example.org" />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="org-email" className="text-[11px] text-muted-foreground">Email</Label>
                              <Input id="org-email" className="h-8 text-xs md:text-xs" type="email" value={orgForm.email} onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })} placeholder="info@organisation.org" />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="org-phone" className="text-[11px] text-muted-foreground">Phone</Label>
                              <Input id="org-phone" className="h-8 text-xs md:text-xs" value={orgForm.phone} onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })} placeholder="+49 30 1234 5678" />
                            </div>
                            <div className="space-y-1 col-span-3">
                              <Label htmlFor="org-personal" className="text-[11px] text-muted-foreground">Personal contact email</Label>
                              <Input id="org-personal" className="h-8 text-xs md:text-xs" type="email" value={orgForm.personalEmail} onChange={(e) => setOrgForm({ ...orgForm, personalEmail: e.target.value })} placeholder="contact@organisation.org" />
                            </div>
                          </div>
                        </section>
                      </div>
                      <DialogFooter className="border-t border-border/40 pt-3 -mx-6 px-6 -mb-6 pb-4 bg-muted/20 rounded-b-lg">
                        <Button variant="outline" size="sm" className="h-8 text-xs md:text-xs" onClick={closeDialog}>Cancel</Button>
                        <Button size="sm" className="h-8 text-xs bg-success hover:bg-success/90 text-success-foreground" onClick={() => { toast({ title: "Organisation added", description: orgForm.name }); closeDialog(); }} disabled={!orgForm.name}>Create organisation</Button>
                      </DialogFooter>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30 border-b border-border/30">
                    <tr>
                      <th className="text-left py-2 px-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Name</th>
                      <th className="text-left py-2 px-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Location</th>
                      <th className="text-right py-2 px-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Users</th>
                      <th className="text-right py-2 px-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Analyses</th>
                      <th className="text-right py-2 px-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Requests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizations.map((org, index) => (
                      <tr
                        key={org.id}
                        className={`border-b border-border/20 hover:bg-muted/20 transition-colors cursor-pointer ${index === organizations.length - 1 ? 'border-b-0' : ''}`}
                        onClick={() => navigate(`/organization/${org.id}`)}
                      >
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md bg-success/10 border border-success/20 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-3 h-3 text-success" />
                            </div>
                            <span className="font-medium text-foreground text-xs tracking-tight">{org.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="text-[11px] text-muted-foreground">{org.location}</span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="text-xs text-foreground font-medium">{org.numberOfUsers || '—'}</span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="text-xs text-foreground font-medium">{org.totalAnalyses}</span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {org.hasPendingRequests ? (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warning/10 border border-warning/30">
                              <Bell className="w-3 h-3 text-warning" />
                              <span className="text-[10px] text-warning font-bold">{org.pendingRequestsCount} new</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">—</span>
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

        <TabsContent value="repertoire" className="mt-0">
          <Card className="border-border/40 shadow-sm">
            <div className="px-4 py-3 border-b border-border/30 flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search databases..."
                  className="h-8 pl-8 text-xs md:text-xs bg-background border-border/40"
                />
              </div>
              <Button onClick={() => setDbDialogOpen(true)} size="sm" className="ml-auto h-7 px-2.5 bg-foreground hover:bg-foreground/90 text-background text-[11px] font-medium">
                <Plus className="w-3 h-3 mr-1" />
                Add Database
              </Button>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30 border-b border-border/30">
                    <tr>
                      <th className="text-left py-2 px-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Database Name</th>
                      <th className="text-right py-2 px-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Records</th>
                      <th className="text-left py-2 px-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Last Updated</th>
                      <th className="text-left py-2 px-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Status</th>
                      <th className="text-left py-2 px-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Pipeline Progress</th>
                      <th className="text-left py-2 px-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Biolink Analysis</th>
                      <th className="text-left py-2 px-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Batch Status</th>
                      <th className="text-right py-2 px-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Time / Paper</th>
                      <th className="text-right py-2 px-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Elapsed / ETA</th>
                      <th className="text-left py-2 px-3 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {databaseRepertoire.map((db, index) => {
                      const isFeedstock = db.category === "Feedstock";
                      const total = db.pipelineTotal;
                      const donePct = total > 0 ? (db.pipelineDone / total) * 100 : 0;
                      const failedPct = total > 0 ? (db.pipelineFailed / total) * 100 : 0;
                      return (
                        <tr
                          key={db.id}
                          className={`border-b border-border/20 hover:bg-muted/20 transition-colors cursor-pointer ${index === databaseRepertoire.length - 1 ? 'border-b-0' : ''}`}
                        >
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isFeedstock ? 'bg-success/15' : 'bg-application-purple/15'}`}>
                                <Database className={`w-4 h-4 ${isFeedstock ? 'text-success' : 'text-application-purple'}`} strokeWidth={1.75} />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground text-xs tracking-tight">{db.name}</span>
                                <span className="text-[10px] text-muted-foreground">index</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="text-xs text-foreground font-medium">{db.records.toLocaleString()}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-[11px] text-muted-foreground whitespace-nowrap">{db.lastUpdated}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge variant="outline" className="text-[10px] font-bold tracking-wider lowercase bg-success/10 text-success border-success/30">
                              {db.status}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3">
                            {total > 0 ? (
                              <div className="flex flex-col gap-0.5 min-w-[110px]">
                                <div className="flex h-1 rounded-full overflow-hidden bg-muted">
                                  <div className="bg-success" style={{ width: `${donePct}%` }} />
                                  <div className="bg-destructive" style={{ width: `${failedPct}%` }} />
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                  Done ({db.pipelineDone}/{db.pipelineTotal}) · {db.pipelineFailed} failed
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`text-[11px] ${db.biolink === "Pending" ? "text-application-purple font-medium" : "text-muted-foreground"}`}>
                              {db.biolink}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-[11px] text-muted-foreground">{db.batchStatus}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="text-[11px] text-muted-foreground">{db.timePerPaper}</span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-[11px] text-muted-foreground whitespace-nowrap cursor-help">{db.elapsed}</span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs text-left">
                                  <p className="mb-1"><span className="font-bold">Elapsed:</span> Total time the pipeline has run so far (download → verify → convert → upload → index). Biolink analysis not included.</p>
                                  <p><span className="font-bold">ETA:</span> Estimated time remaining until indexing completes.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button title="Copy link" className="w-6 h-6 rounded border border-border/50 flex items-center justify-center hover:bg-muted transition-colors">
                                <Link2 className="w-3 h-3 text-success" />
                              </button>
                              <button title="History" className="w-6 h-6 rounded border border-border/50 flex items-center justify-center hover:bg-muted transition-colors">
                                <History className="w-3 h-3 text-muted-foreground" />
                              </button>
                              <button title="Run" className="w-6 h-6 rounded border border-border/50 flex items-center justify-center hover:bg-muted transition-colors">
                                <Play className="w-3 h-3 text-product-blue" />
                              </button>
                              <button title="Biolink" className="w-6 h-6 rounded border border-border/50 flex items-center justify-center hover:bg-muted transition-colors">
                                <Sparkles className="w-3 h-3 text-application-purple" />
                              </button>
                              <button title="Refresh" className="w-6 h-6 rounded border border-border/50 flex items-center justify-center hover:bg-muted transition-colors">
                                <RefreshCw className="w-3 h-3 text-foreground" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2.5 border-t border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button className="h-7 px-2 rounded border border-border/50 flex items-center gap-1 text-[11px] text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50" disabled>
                    <ChevronLeft className="w-3 h-3" /> Previous
                  </button>
                  {[1, 2, 3, 4].map((p) => (
                    <button key={p} className={`h-7 w-7 rounded border text-[11px] transition-colors ${p === 1 ? "bg-foreground text-background border-foreground" : "border-border/50 text-foreground hover:bg-muted"}`}>
                      {p}
                    </button>
                  ))}
                  <span className="px-1 text-[11px] text-muted-foreground">…</span>
                  <button className="h-7 w-7 rounded border border-border/50 text-[11px] text-foreground hover:bg-muted transition-colors">8</button>
                  <button className="h-7 px-2 rounded border border-border/50 flex items-center gap-1 text-[11px] text-foreground hover:bg-muted transition-colors">
                    Next <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-[11px] text-muted-foreground">Page 1 of 8</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pathways" className="mt-0">
          <Card className="border-border/40 shadow-sm">
            <div className="px-4 py-3 border-b border-border/30 flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search pathways..."
                  className="h-8 pl-8 text-xs md:text-xs bg-background border-border/40"
                />
              </div>
              <Button size="sm" className="ml-auto h-7 px-2.5 bg-foreground hover:bg-foreground/90 text-background text-[11px] font-medium">
                <Plus className="w-3 h-3 mr-1" />
                Add Manual Pathway
              </Button>
            </div>
            <CardContent className="p-10 text-center">
              <div className="w-10 h-10 rounded-md bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-4 h-4 text-success" />
              </div>
              <h3 className="text-sm font-bold text-foreground tracking-tight mb-1">VCG Pathways</h3>
              <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
                Curated value chain pathways across organisations — coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dbDialogOpen} onOpenChange={(o) => !o && closeDbDialog()}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-5">
          <DialogHeader className="space-y-0.5">
            <DialogTitle className="text-sm font-bold tracking-tight">Add New Database</DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground">
              Configure a new research database for analysis.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Database Name</Label>
              <Input
                placeholder="Enter database name"
                value={dbForm.name}
                onChange={(e) => setDbForm({ ...dbForm, name: e.target.value })}
                className="h-8 text-xs md:text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Search Keywords</Label>
              <div className="flex gap-1.5">
                <Input
                  placeholder="Type a keyword"
                  value={dbForm.keywordInput}
                  onChange={(e) => setDbForm({ ...dbForm, keywordInput: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
                  className="h-8 text-xs md:text-xs"
                />
                <Button type="button" variant="outline" size="sm" onClick={addKeyword} className="h-8 px-2.5 text-[11px]">Add</Button>
              </div>
              {dbForm.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {dbForm.keywords.map((k) => (
                    <Badge key={k} variant="secondary" className="cursor-pointer text-[10px] py-0 px-1.5" onClick={() => removeKeyword(k)}>
                      {k} ✕
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-md border border-border bg-muted p-2.5 space-y-2">
              <div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Keyword Suggestions</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Get AI-suggested keywords (abbreviations, synonyms) for your topic.</div>
              </div>
              <div className="grid grid-cols-[1fr_72px_auto] gap-1.5">
                <Input
                  placeholder="e.g. Fumaric acid"
                  disabled={!dbForm.name.trim()}
                  value={dbForm.suggestKeyword}
                  onChange={(e) => setDbForm({ ...dbForm, suggestKeyword: e.target.value })}
                  className="h-7 text-xs md:text-xs bg-background"
                />
                <Select value={dbForm.suggestCount} onValueChange={(v) => setDbForm({ ...dbForm, suggestCount: v })} disabled={!dbForm.name.trim()}>
                  <SelectTrigger className="h-7 text-xs md:text-xs bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["5", "10", "15", "20"].map((n) => <SelectItem key={n} value={n} className="text-xs">{n}</SelectItem>)}
                  </SelectContent>
                </Select>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span tabIndex={0}>
                        <Button type="button" variant="outline" size="sm" disabled={!dbForm.name.trim()} className="h-7 px-2 text-[11px] bg-background pointer-events-auto">
                          <Sparkles className="w-3 h-3 mr-1" /> Get suggestions
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {!dbForm.name.trim() && (
                      <TooltipContent side="top">Enter a database name above to enable keyword suggestions</TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Fields of Study</Label>
              <Select value={dbForm.fieldOfStudy} onValueChange={(v) => setDbForm({ ...dbForm, fieldOfStudy: v })}>
                <SelectTrigger className="h-8 text-xs md:text-xs"><SelectValue placeholder="Select field" /></SelectTrigger>
                <SelectContent>
                  {["Biology", "Chemistry", "Materials Science", "Engineering", "Agricultural Science", "Environmental Science"].map((f) => (
                    <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Date Range (Years)</Label>
              <div className="grid grid-cols-2 gap-1.5">
                <Input value={dbForm.yearFrom} onChange={(e) => setDbForm({ ...dbForm, yearFrom: e.target.value })} className="h-8 text-xs md:text-xs" />
                <Input value={dbForm.yearTo} onChange={(e) => setDbForm({ ...dbForm, yearTo: e.target.value })} className="h-8 text-xs md:text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Minimum Citations</Label>
                <Input value={dbForm.minCitations} onChange={(e) => setDbForm({ ...dbForm, minCitations: e.target.value })} className="h-8 text-xs md:text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Max Papers</Label>
                <Input value={dbForm.maxPapers} onChange={(e) => setDbForm({ ...dbForm, maxPapers: e.target.value })} className="h-8 text-xs md:text-xs" />
              </div>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="h-7 px-2.5 text-[11px] self-start">Test parameters</Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  Sends your current search parameters to Semantic Scholar and shows how many papers match—without creating a database. Useful to experiment with keywords, filters, and dates before committing, so you can tune your query for the best results.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="rounded-md border border-border bg-muted p-2.5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setDbForm({ ...dbForm, biolink: !dbForm.biolink })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full border-2 transition-colors ${dbForm.biolink ? "bg-success border-success" : "bg-background border-foreground/40"}`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full shadow-sm transition-transform ${dbForm.biolink ? "bg-background translate-x-4" : "bg-foreground/70 translate-x-0.5"}`} />
              </button>
              <Label className="cursor-pointer text-xs" onClick={() => setDbForm({ ...dbForm, biolink: !dbForm.biolink })}>
                Also do biolink analysis
              </Label>
            </div>

            <div className="rounded-md border border-border bg-muted p-2.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Estimated Cost</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">~{estPapers} papers at 67% success rate · Pipeline: ${estCost}</div>
              </div>
              <div className="text-base font-bold tracking-tight">${estCost}</div>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={closeDbDialog} className="h-8 px-3 text-[11px]">Cancel</Button>
            <Button size="sm" onClick={createDatabase} className="h-8 px-3 text-[11px] bg-success hover:bg-success/90 text-background">Create Database</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalysisManagement;
