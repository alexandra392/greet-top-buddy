import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ClipboardList, Plus, Bell, Search, RefreshCw, FolderOpen, Database, Sparkles, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AnalysisManagement = () => {
  const navigate = useNavigate();

  const databaseRepertoire = [
    { id: 1, name: "Wheat Straw Database", category: "Feedstock", records: 1245, lastUpdated: "2 days ago", status: "active" },
    { id: 2, name: "Biochar Database", category: "Product", records: 892, lastUpdated: "1 week ago", status: "active" },
    { id: 3, name: "Lignin Database", category: "Product", records: 567, lastUpdated: "3 days ago", status: "active" },
    { id: 4, name: "Sugar Beet Database", category: "Feedstock", records: 334, lastUpdated: "5 days ago", status: "active" },
    { id: 5, name: "Cellulose Database", category: "Product", records: 2156, lastUpdated: "1 day ago", status: "active" },
    { id: 6, name: "Xylose Database", category: "Product", records: 4521, lastUpdated: "4 hours ago", status: "syncing" },
    { id: 7, name: "Hemicellulose Database", category: "Product", records: 8934, lastUpdated: "6 hours ago", status: "active" },
    { id: 8, name: "Corn Stover Database", category: "Feedstock", records: 156, lastUpdated: "2 weeks ago", status: "active" },
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

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Organisations", value: totalOrgs, icon: FolderOpen, color: "text-success", bg: "bg-success/10", border: "border-success/20" },
          { label: "Total Analyses", value: totalAnalyses, icon: Sparkles, color: "text-product-blue", bg: "bg-product-blue/10", border: "border-product-blue/20" },
          { label: "Pending Requests", value: totalPending, icon: Bell, color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
          { label: "Databases", value: totalDatabases, icon: Database, color: "text-application-purple", bg: "bg-application-purple/10", border: "border-application-purple/20" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border/40 rounded-xl px-3 py-2.5 flex items-center gap-2.5">
            <div className={`w-6 h-6 rounded-md ${stat.bg} border ${stat.border} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-3 h-3 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase truncate">{stat.label}</div>
              <div className="text-sm font-bold text-foreground tracking-tight leading-tight">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="organisations" className="w-full space-y-3">
        <div>
          <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Management</h2>
          <TabsList className="w-full bg-card border border-border/40 p-0.5 h-auto">
            <TabsTrigger value="organisations" className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px]">
              <FolderOpen className="w-3 h-3" />
              My Organisations
            </TabsTrigger>
            <TabsTrigger value="repertoire" className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[11px]">
              <Database className="w-3 h-3" />
              Database Repertoire
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
                  className="h-8 pl-8 text-xs bg-background border-border/40"
                />
              </div>
              <Button size="sm" className="h-8 bg-success hover:bg-success/90 text-success-foreground text-xs">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Organisation
              </Button>
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
                  className="h-8 pl-8 text-xs bg-background border-border/40"
                />
              </div>
              <Button size="sm" variant="outline" className="h-8 text-xs border-border/40">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Sync All
              </Button>
              <Button size="sm" className="h-8 bg-success hover:bg-success/90 text-success-foreground text-xs">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Database
              </Button>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30 border-b border-border/30">
                    <tr>
                      <th className="text-left py-2 px-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Database</th>
                      <th className="text-left py-2 px-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Category</th>
                      <th className="text-right py-2 px-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Records</th>
                      <th className="text-right py-2 px-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Last Updated</th>
                      <th className="text-right py-2 px-4 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {databaseRepertoire.map((db, index) => {
                      const isFeedstock = db.category === "Feedstock";
                      return (
                        <tr
                          key={db.id}
                          className={`border-b border-border/20 hover:bg-muted/20 transition-colors cursor-pointer ${index === databaseRepertoire.length - 1 ? 'border-b-0' : ''}`}
                        >
                          <td className="py-2.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${isFeedstock ? 'bg-success/10 border border-success/20' : 'bg-application-purple/10 border border-application-purple/20'}`}>
                                <Database className={`w-3 h-3 ${isFeedstock ? 'text-success' : 'text-application-purple'}`} />
                              </div>
                              <span className="font-medium text-foreground text-xs tracking-tight">{db.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className={`text-[10px] font-bold tracking-widest uppercase ${isFeedstock ? 'text-success' : 'text-application-purple'}`}>
                              {db.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <span className="text-xs text-foreground font-medium">{db.records.toLocaleString()}</span>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <span className="text-[11px] text-muted-foreground">{db.lastUpdated}</span>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-bold tracking-wider uppercase ${
                                db.status === 'syncing'
                                  ? 'bg-product-blue/10 text-product-blue border-product-blue/30'
                                  : 'bg-success/10 text-success border-success/30'
                              }`}
                            >
                              {db.status === 'syncing' ? 'Syncing' : 'Active'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalysisManagement;
