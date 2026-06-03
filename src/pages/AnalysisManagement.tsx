import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ClipboardList, Plus, Bell, Search, RefreshCw, FolderOpen, Database, Sparkles, Building2, Mail, Link2, UserPlus, Check, Copy, History, Play, ChevronLeft, ChevronRight, FileText, ExternalLink, ChevronDown, ChevronRight as ChevronRightSm, Megaphone, Sparkle, Wrench, Bug, Image as ImageIcon, Video, Trash2, Eye, Send, X, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, Fragment } from "react";
import { toast } from "@/hooks/use-toast";
import { RELEASE_NOTES, CURRENT_VERSION, type MediaItem } from "@/data/releaseNotes";
import { ReleaseNotesModal } from "@/components/ReleaseNotesModal";

const AnalysisManagement = () => {
  const navigate = useNavigate();
  const todayIso = new Date().toISOString().slice(0, 10);
  const bumpPatch = (v: string) => {
    const p = v.split(".").map((n) => parseInt(n, 10) || 0);
    while (p.length < 3) p.push(0);
    p[2] = (p[2] || 0) + 1;
    return p.join(".");
  };
  const [releaseForm, setReleaseForm] = useState({
    version: bumpPatch(CURRENT_VERSION),
    date: todayIso,
    title: "",
    features: [""] as string[],
    improvements: [""] as string[],
    fixes: [""] as string[],
    media: [] as MediaItem[],
    notify: true,
  });
  const [mediaDraft, setMediaDraft] = useState<{ type: "image" | "video"; src: string; caption: string }>({ type: "image", src: "", caption: "" });
  const [previewVersion, setPreviewVersion] = useState<string | null>(null);
  const updateListItem = (key: "features" | "improvements" | "fixes", idx: number, val: string) => {
    setReleaseForm((p) => ({ ...p, [key]: p[key].map((s, i) => (i === idx ? val : s)) }));
  };
  const addListItem = (key: "features" | "improvements" | "fixes") => {
    setReleaseForm((p) => ({ ...p, [key]: [...p[key], ""] }));
  };
  const removeListItem = (key: "features" | "improvements" | "fixes", idx: number) => {
    setReleaseForm((p) => ({ ...p, [key]: p[key].filter((_, i) => i !== idx) }));
  };
  const addMedia = () => {
    if (!mediaDraft.src.trim()) {
      toast({ title: "Media URL required", description: "Paste a URL or upload a file.", variant: "destructive" });
      return;
    }
    setReleaseForm((p) => ({
      ...p,
      media: [...p.media, mediaDraft.type === "image"
        ? { type: "image", src: mediaDraft.src.trim(), caption: mediaDraft.caption.trim() || undefined }
        : { type: "video", src: mediaDraft.src.trim(), caption: mediaDraft.caption.trim() || undefined }],
    }));
    setMediaDraft({ type: "image", src: "", caption: "" });
  };
  const handleMediaUpload = (file: File | null) => {
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      toast({ title: "Unsupported file", description: "Upload an image or video file.", variant: "destructive" });
      return;
    }
    const maxMb = isVideo ? 50 : 10;
    if (file.size > maxMb * 1024 * 1024) {
      toast({ title: "File too large", description: `Max ${maxMb}MB for ${isVideo ? "videos" : "images"}.`, variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setReleaseForm((p) => ({
        ...p,
        media: [...p.media, isImage
          ? { type: "image", src: dataUrl, caption: file.name }
          : { type: "video", src: dataUrl, caption: file.name }],
      }));
      toast({ title: "Media uploaded", description: file.name });
    };
    reader.readAsDataURL(file);
  };
  const removeMedia = (idx: number) => {
    setReleaseForm((p) => ({ ...p, media: p.media.filter((_, i) => i !== idx) }));
  };
  const resetReleaseForm = () => {
    setReleaseForm({ version: bumpPatch(CURRENT_VERSION), date: todayIso, title: "", features: [""], improvements: [""], fixes: [""], media: [], notify: true });
    setMediaDraft({ type: "image", src: "", caption: "" });
  };
  const cleanList = (arr: string[]) => arr.map((s) => s.trim()).filter(Boolean);
  const publishRelease = () => {
    if (!releaseForm.version.trim() || !releaseForm.title.trim()) {
      toast({ title: "Missing fields", description: "Version and title are required.", variant: "destructive" });
      return;
    }
    const counts = cleanList(releaseForm.features).length + cleanList(releaseForm.improvements).length + cleanList(releaseForm.fixes).length;
    if (counts === 0) {
      toast({ title: "Add at least one change", description: "Add a feature, improvement, or fix.", variant: "destructive" });
      return;
    }
    toast({
      title: `Release v${releaseForm.version} published`,
      description: releaseForm.notify
        ? "Notification will be shown to all users in the What's New panel."
        : "Saved as draft — no notification sent.",
    });
    resetReleaseForm();
  };
  const [addOpen, setAddOpen] = useState(false);
  const [dbDialogOpen, setDbDialogOpen] = useState(false);
  const [docsDb, setDocsDb] = useState<any>(null);
  const [docsSearch, setDocsSearch] = useState("");
  const [docsPage, setDocsPage] = useState(1);
  const [expandedDoc, setExpandedDoc] = useState<number | null>(null);
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
            <TabsTrigger value="whatsnew" className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px] rounded-md data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-sm transition-all">
              <Megaphone className="w-3 h-3" />
              What's New
              <span className="ml-1 text-[10px] font-bold opacity-70">{RELEASE_NOTES.length}</span>
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
                          onClick={() => { setDocsDb(db); setDocsSearch(""); setDocsPage(1); }}
                          className={`border-b border-border/20 hover:bg-muted/20 transition-colors cursor-pointer ${index === databaseRepertoire.length - 1 ? 'border-b-0' : ''}`}
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <Database className="w-3.5 h-3.5 text-muted-foreground/70 flex-shrink-0" strokeWidth={1.75} />
                              <div className="flex flex-col leading-tight">
                                <span className="font-medium text-foreground text-xs tracking-tight">{db.name}</span>
                                <span className="text-[10px] text-muted-foreground/70">index</span>
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
                                <TooltipContent side="top" align="end" collisionPadding={16} className="max-w-[260px] bg-foreground text-background border-foreground text-[11px] leading-snug px-2.5 py-2">
                                  <p className="mb-1"><span className="font-bold">Elapsed:</span> Total time the pipeline has run so far (download → verify → convert → upload → index). Biolink analysis not included.</p>
                                  <p><span className="font-bold">ETA:</span> Estimated time remaining until indexing completes.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button title="Copy link" className="w-7 h-7 rounded-md border border-border/50 flex items-center justify-center text-success hover:bg-success/10 hover:border-success/40 transition-colors">
                                <Link2 className="w-3 h-3" />
                              </button>
                              <button title="History" className="w-7 h-7 rounded-md border border-border/50 flex items-center justify-center text-foreground hover:bg-muted transition-colors">
                                <History className="w-3 h-3" />
                              </button>
                              <button title="Run" className="w-7 h-7 rounded-md border border-border/50 flex items-center justify-center text-product-blue hover:bg-product-blue/10 hover:border-product-blue/40 transition-colors">
                                <Play className="w-3 h-3" />
                              </button>
                              <button title="Biolink" className="w-7 h-7 rounded-md border border-border/50 flex items-center justify-center text-application-purple hover:bg-application-purple/10 hover:border-application-purple/40 transition-colors">
                                <Sparkles className="w-3 h-3" />
                              </button>
                              <button title="Refresh" className="w-7 h-7 rounded-md border border-border/50 flex items-center justify-center text-foreground hover:bg-muted transition-colors">
                                <RefreshCw className="w-3 h-3" />
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

        <TabsContent value="whatsnew" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
            {/* Composer */}
            <Card className="border-border/40 shadow-sm">
              <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-success/15 flex items-center justify-center">
                  <Megaphone className="w-3 h-3 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-foreground tracking-tight">Compose Release Note</h3>
                  <p className="text-[10px] text-muted-foreground">Draft a What's New entry that will appear in the in-app panel.</p>
                </div>
                <Button size="sm" variant="outline" className="h-7 px-2.5 text-[11px]" onClick={resetReleaseForm}>
                  Reset
                </Button>
              </div>
              <CardContent className="p-4 space-y-4">
                {/* Meta */}
                <section className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Release</span>
                    <div className="h-px flex-1 bg-border/60" />
                  </div>
                  <div className="grid grid-cols-[120px_140px_1fr] gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Version <span className="text-destructive">*</span></Label>
                      <Input value={releaseForm.version} onChange={(e) => setReleaseForm({ ...releaseForm, version: e.target.value })} placeholder="1.4.1" className="h-8 text-xs md:text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Date</Label>
                      <Input type="date" value={releaseForm.date} onChange={(e) => setReleaseForm({ ...releaseForm, date: e.target.value })} className="h-8 text-xs md:text-xs" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Title <span className="text-destructive">*</span></Label>
                      <Input value={releaseForm.title} onChange={(e) => setReleaseForm({ ...releaseForm, title: e.target.value })} placeholder="Short headline shown in the hero" className="h-8 text-xs md:text-xs" />
                    </div>
                  </div>
                </section>

                {/* Change groups */}
                {([
                  { key: "features", label: "New Features", Icon: Sparkle, tone: "text-success", placeholder: "Added a What's New panel..." },
                  { key: "improvements", label: "Improvements", Icon: Wrench, tone: "text-blue-600", placeholder: "Refined the header spacing..." },
                  { key: "fixes", label: "Bug Fixes", Icon: Bug, tone: "text-amber-600", placeholder: "Fixed sorting on the Pathways table..." },
                ] as const).map(({ key, label, Icon, tone, placeholder }) => (
                  <section key={key} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${tone}`} />
                      <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">{label}</span>
                      <div className="h-px flex-1 bg-border/60" />
                      <button type="button" onClick={() => addListItem(key)} className="text-[10px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {releaseForm[key].map((val, i) => (
                        <div key={i} className="flex gap-1.5">
                          <Textarea
                            value={val}
                            onChange={(e) => updateListItem(key, i, e.target.value)}
                            placeholder={placeholder}
                            className="min-h-[36px] text-xs leading-relaxed py-1.5"
                            rows={1}
                          />
                          {releaseForm[key].length > 1 && (
                            <Button type="button" variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeListItem(key, i)}>
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ))}

                {/* Media */}
                <section className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5 text-foreground/70" />
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Media</span>
                    <div className="h-px flex-1 bg-border/60" />
                  </div>
                  <p className="text-[10.5px] text-muted-foreground leading-relaxed">
                    Upload an image or video file, or paste a URL (YouTube, Loom, or direct file). First image becomes the hero banner.
                  </p>
                  <div className="rounded-md border border-border/60 bg-muted/30 p-2.5 space-y-2">
                    <label className="flex items-center justify-center gap-2 h-16 rounded-md border border-dashed border-border bg-background hover:bg-muted/40 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">
                        <span className="text-foreground font-medium">Click to upload</span> image or video
                      </span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                          handleMediaUpload(e.target.files?.[0] ?? null);
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-border/60" />
                      <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground">or paste URL</span>
                      <div className="h-px flex-1 bg-border/60" />
                    </div>
                    <div className="grid grid-cols-[110px_1fr] gap-1.5">
                      <Select value={mediaDraft.type} onValueChange={(v: "image" | "video") => setMediaDraft({ ...mediaDraft, type: v })}>
                        <SelectTrigger className="h-7 text-xs md:text-xs bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image" className="text-xs">
                            <span className="inline-flex items-center gap-1.5"><ImageIcon className="w-3 h-3" /> Image</span>
                          </SelectItem>
                          <SelectItem value="video" className="text-xs">
                            <span className="inline-flex items-center gap-1.5"><Video className="w-3 h-3" /> Video</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Input value={mediaDraft.src} onChange={(e) => setMediaDraft({ ...mediaDraft, src: e.target.value })} placeholder="https://..." className="h-7 text-xs md:text-xs bg-background" />
                    </div>
                    <div className="flex gap-1.5">
                      <Input value={mediaDraft.caption} onChange={(e) => setMediaDraft({ ...mediaDraft, caption: e.target.value })} placeholder="Caption (optional)" className="h-7 text-xs md:text-xs bg-background" />
                      <Button type="button" variant="outline" size="sm" onClick={addMedia} className="h-7 px-2.5 text-[11px] bg-background">Add URL</Button>
                    </div>
                  </div>
                  {releaseForm.media.length > 0 && (
                    <ul className="space-y-1.5">
                      {releaseForm.media.map((m, i) => (
                        <li key={i} className="flex items-center gap-2 rounded-md border border-border/40 bg-card px-2 py-1.5">
                          {m.type === "image" ? <ImageIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <Video className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] text-foreground truncate">{m.src}</div>
                            {m.caption && <div className="text-[10px] text-muted-foreground truncate">{m.caption}</div>}
                          </div>
                          {i === 0 && (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-success/30 bg-success/10 text-success uppercase tracking-wider">Hero</Badge>
                          )}
                          <button type="button" onClick={() => removeMedia(i)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                {/* Notify toggle */}
                <div className="rounded-md border border-border bg-muted p-2.5 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setReleaseForm({ ...releaseForm, notify: !releaseForm.notify })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full border-2 transition-colors ${releaseForm.notify ? "bg-success border-success" : "bg-background border-foreground/40"}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full shadow-sm transition-transform ${releaseForm.notify ? "bg-background translate-x-4" : "bg-foreground/70 translate-x-0.5"}`} />
                  </button>
                  <Label className="cursor-pointer text-xs flex-1" onClick={() => setReleaseForm({ ...releaseForm, notify: !releaseForm.notify })}>
                    Notify all users (show dot on the What's New button)
                  </Label>
                </div>
              </CardContent>
              <div className="px-4 py-3 border-t border-border/30 flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" className="h-8 px-3 text-[11px]" onClick={() => setPreviewVersion(CURRENT_VERSION)}>
                  <Eye className="w-3 h-3 mr-1" /> Preview latest
                </Button>
                <Button size="sm" onClick={publishRelease} className="h-8 px-3 text-[11px] bg-success hover:bg-success/90 text-background">
                  <Send className="w-3 h-3 mr-1" /> Publish release
                </Button>
              </div>
            </Card>

            {/* History */}
            <Card className="border-border/40 shadow-sm">
              <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-muted flex items-center justify-center">
                  <History className="w-3 h-3 text-foreground/70" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-foreground tracking-tight">Published Releases</h3>
                  <p className="text-[10px] text-muted-foreground">Latest is shown to users as "Latest" in the What's New panel.</p>
                </div>
              </div>
              <CardContent className="p-3 space-y-2">
                {RELEASE_NOTES.map((n) => {
                  const isLatest = n.version === CURRENT_VERSION;
                  const counts = (n.features?.length ?? 0) + (n.improvements?.length ?? 0) + (n.fixes?.length ?? 0);
                  return (
                    <div key={n.version} className="rounded-md border border-border/40 bg-card px-3 py-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-foreground tracking-tight">v{n.version}</span>
                        {isLatest && (
                          <Badge variant="outline" className="rounded-full border-success/30 bg-success/10 text-success text-[9px] font-semibold uppercase tracking-wider px-2 py-0">Latest</Badge>
                        )}
                        <span className="ml-auto text-[10px] text-muted-foreground">
                          {new Date(n.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                        </span>
                      </div>
                      {n.title && <p className="text-[11px] text-foreground/90 leading-snug mb-1.5 line-clamp-2">{n.title}</p>}
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        {n.features?.length ? <span className="inline-flex items-center gap-1"><Sparkle className="w-2.5 h-2.5 text-success" /> {n.features.length}</span> : null}
                        {n.improvements?.length ? <span className="inline-flex items-center gap-1"><Wrench className="w-2.5 h-2.5 text-blue-600" /> {n.improvements.length}</span> : null}
                        {n.fixes?.length ? <span className="inline-flex items-center gap-1"><Bug className="w-2.5 h-2.5 text-amber-600" /> {n.fixes.length}</span> : null}
                        {n.media?.length ? <span className="inline-flex items-center gap-1"><ImageIcon className="w-2.5 h-2.5" /> {n.media.length}</span> : null}
                        <button onClick={() => setPreviewVersion(n.version)} className="ml-auto inline-flex items-center gap-1 text-foreground/80 hover:text-foreground">
                          <Eye className="w-3 h-3" /> Preview
                        </button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <ReleaseNotesModal
            open={previewVersion !== null}
            onOpenChange={(o) => !o && setPreviewVersion(null)}
            version={previewVersion}
          />
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
                      <TooltipContent side="top" align="end" collisionPadding={16} avoidCollisions className="max-w-[280px] whitespace-normal break-words bg-foreground text-background border-foreground text-[11px] leading-snug px-2.5 py-1.5">Enter a database name above to enable keyword suggestions</TooltipContent>
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
                <TooltipContent side="top" align="start" collisionPadding={16} className="max-w-[260px] bg-foreground text-background border-foreground text-[11px] leading-snug px-2.5 py-2">
                  Sends your current search parameters to Semantic Scholar and shows how many papers match—without creating a database. Useful to tune keywords, filters, and dates before committing.
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

      <Dialog open={!!docsDb} onOpenChange={(o) => !o && setDocsDb(null)}>
        <DialogContent className="max-w-6xl max-h-[88vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/30">
            <DialogTitle className="text-sm font-bold tracking-tight">
              Documents: <span className="font-mono text-xs">{docsDb?.name?.toLowerCase().replace(/\s+/g, "-")}-test-{docsDb?.id}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="px-5 py-3 border-b border-border/30">
            <div className="relative max-w-sm">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search documents..."
                value={docsSearch}
                onChange={(e) => setDocsSearch(e.target.value)}
                className="h-8 pl-8 text-xs md:text-xs bg-background border-border/40"
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="bg-muted/20 border-b border-border/30 sticky top-0 backdrop-blur">
                <tr>
                  <th className="text-left py-2 px-3 text-[9px] font-semibold tracking-[0.12em] text-muted-foreground/70 uppercase w-[180px]">ID</th>
                  <th className="text-left py-2 px-3 text-[9px] font-semibold tracking-[0.12em] text-muted-foreground/70 uppercase">Title</th>
                  <th className="text-left py-2 px-3 text-[9px] font-semibold tracking-[0.12em] text-muted-foreground/70 uppercase">Content</th>
                  <th className="text-left py-2 px-3 text-[9px] font-semibold tracking-[0.12em] text-muted-foreground/70 uppercase w-[80px]">URL</th>
                  <th className="text-left py-2 px-3 text-[9px] font-semibold tracking-[0.12em] text-muted-foreground/70 uppercase w-[260px]">Metadata</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }).map((_, i) => {
                  const ids = ["7bf5cb045351e01e1dde67", "e0074fa7de79168e1530c6d", "a57f0ae76e811a2006badc", "ba911867049a0087bcdc1a", "201fc2f1767edba5df3f6ba", "89153adc4a904cf4f38cd8", "339659d925ba4db31fb4a1", "0fe128d241735d4891caad", "8cc8bb308afc4c6dbfa55c", "4059af94deed3a6b371767"];
                  const contents = [
                    "Introduction Nowadays the pollution of the environment with dangerous metals is one of the major pro...",
                    "Materials and methods",
                    "Acid treatment of maize stalk The sieved maize stalk was inserted into glass column with inside diam...",
                    "Reagents In our experiments HCl 37% (density 1.16 g/mL) purchased from Merck, without traces of meta...",
                    "Methodology for sorption experiments (metallic cation-maize stalk) in synthetic solution All sorptio...",
                    "Methodology for desorption study For desorption study, the batch procedure was applied to verify the...",
                    "Material characterization In order to detect organic groups involved in retention of the metallic ca...",
                    "Calculation of Cu(II) and Fe(III) sorption The quantity of each metallic cation removed from synthet...",
                    "X100% ( The amount of metallic cations removed at time t (Qt), was calculated by the next equation: ...",
                    "Results and discussions",
                  ];
                  return (
                    <Fragment key={`doc-${i}`}>
                      <tr
                        onClick={() => setExpandedDoc(expandedDoc === i ? null : i)}
                        className={`border-b border-border/15 hover:bg-muted/15 transition-colors cursor-pointer ${expandedDoc === i ? "bg-product-blue/5" : ""}`}
                      >
                        <td className="py-1.5 px-3 align-middle">
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3 h-3 text-muted-foreground/60 flex-shrink-0" strokeWidth={1.5} />
                            <span className="text-[10.5px] font-mono text-muted-foreground truncate">{ids[i]}…</span>
                          </div>
                        </td>
                        <td className="py-1.5 px-3 max-w-[280px] align-middle">
                          <span className="text-[10.5px] text-foreground truncate block">Experimental Model for Cu(II) and Fe(III) Sorption from Synthetic Solutions Base…</span>
                        </td>
                        <td className="py-1.5 px-3 max-w-[320px] align-middle">
                          <span className="text-[10.5px] text-muted-foreground truncate block">{contents[i]}</span>
                        </td>
                        <td className="py-1.5 px-3 align-middle" onClick={(e) => e.stopPropagation()}>
                          <button className="h-5 px-1.5 rounded border border-border/40 inline-flex items-center gap-1 text-[10px] text-foreground hover:bg-muted hover:border-border transition-colors">
                            <ExternalLink className="w-2.5 h-2.5" /> Open
                          </button>
                        </td>
                        <td className="py-1.5 px-3 align-middle">
                          <div className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/80 max-w-[260px]">
                            {expandedDoc === i ? <ChevronDown className="w-3 h-3 flex-shrink-0" /> : <ChevronRightSm className="w-3 h-3 flex-shrink-0" />}
                            <span className="truncate">Nicoleta Mirela Marin · 2020</span>
                          </div>
                        </td>
                      </tr>
                      {expandedDoc === i && (
                        <tr className="border-b border-border/20 bg-muted/20">
                          <td colSpan={5} className="px-5 py-2.5">
                            <div className="text-[9px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/70 mb-1.5">All Metadata</div>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-[10.5px]">
                              <div className="flex gap-2"><span className="text-muted-foreground min-w-[90px]">references:</span><span className="text-foreground">[]</span></div>
                              <div className="flex gap-2"><span className="text-muted-foreground min-w-[90px]">title:</span><span className="text-foreground">Experimental Model for Cu(II) and Fe(III) Sorption from Synthetic Solutions Based on Maize Stalk</span></div>
                              <div className="flex gap-2"><span className="text-muted-foreground min-w-[90px]">authors:</span><span className="text-foreground">N. M. Marin, G. Batrinescu, I. Stanculescu, L. Constantin, N. Cristea, A. Ionescu, G. Traistaru</span></div>
                              <div className="flex gap-2"><span className="text-muted-foreground min-w-[90px]">year:</span><span className="text-foreground">2020</span></div>
                              <div className="flex gap-2"><span className="text-muted-foreground min-w-[90px]">doi:</span><span className="text-foreground"></span></div>
                              <div className="flex gap-2"><span className="text-muted-foreground min-w-[90px]">abstract:</span><span className="text-foreground"></span></div>
                              <div className="flex gap-2"><span className="text-muted-foreground min-w-[90px]">venue:</span><span className="text-foreground"></span></div>
                              <div className="flex gap-2"><span className="text-muted-foreground min-w-[90px]">citation_count:</span><span className="text-foreground">4</span></div>
                              <div className="flex gap-2"><span className="text-muted-foreground min-w-[90px]">paper_id:</span><span className="text-foreground font-mono break-all">03f2d175c8d8bbc7d0c5885814d65c7222039584</span></div>
                              <div className="flex gap-2"><span className="text-muted-foreground min-w-[90px]">database_name:</span><span className="text-foreground font-mono">hydrochloric-nb-test-6</span></div>
                              <div className="flex gap-2"><span className="text-muted-foreground min-w-[90px]">pdf_url:</span><span className="text-foreground break-all">https://revistadechimie.ro/pdf/39 MARIN N.pdf</span></div>
                              <div className="flex gap-2"><span className="text-muted-foreground min-w-[90px]">pdf_s3_key:</span><span className="text-foreground font-mono break-all">pdfs/hydrochloric-nb-test-6/2020/03f2d175c8d8bbc7d0c5885814d65c7222039584.pdf</span></div>
                              <div className="flex gap-2"><span className="text-muted-foreground min-w-[90px]">chunk_id:</span><span className="text-foreground">0</span></div>
                              <div className="flex gap-2"><span className="text-muted-foreground min-w-[90px]">source_xml:</span><span className="text-foreground font-mono break-all">xml/hydrochloric-nb-test-6/2020/03f2d175c8d8bbc7d0c5885814d65c7222039584.xml</span></div>
                              <div className="flex gap-2 col-span-2"><span className="text-muted-foreground min-w-[90px]">doc_id:</span><span className="text-foreground font-mono break-all">{ids[i]}99b73d084f7ca82326fcfd30f76230faeddbc2f851</span></div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button className="h-7 px-2 rounded border border-border/50 flex items-center gap-1 text-[11px] text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50" disabled={docsPage === 1} onClick={() => setDocsPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="w-3 h-3" /> Previous
              </button>
              {[1, 2, 3, 4].map((p) => (
                <button key={p} onClick={() => setDocsPage(p)} className={`h-7 w-7 rounded border text-[11px] transition-colors ${p === docsPage ? "bg-foreground text-background border-foreground" : "border-border/50 text-foreground hover:bg-muted"}`}>
                  {p}
                </button>
              ))}
              <span className="px-1 text-[11px] text-muted-foreground">…</span>
              <button onClick={() => setDocsPage(37)} className="h-7 w-7 rounded border border-border/50 text-[11px] text-foreground hover:bg-muted transition-colors">37</button>
              <button onClick={() => setDocsPage((p) => p + 1)} className="h-7 px-2 rounded border border-border/50 flex items-center gap-1 text-[11px] text-foreground hover:bg-muted transition-colors">
                Next <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <span className="text-[11px] text-muted-foreground">Page {docsPage} of 37</span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalysisManagement;
