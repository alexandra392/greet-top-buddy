import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronRight, ArrowLeft, Search, X, FileText, Building2, Calendar, Globe, Layers, Award } from 'lucide-react';
import {
  buildCPCHierarchy,
  patentsForSection,
  patentsForClass,
  shadeHsl,
  CPCPatent,
} from '@/lib/cpcMock';
import CPCSunburst from './CPCSunburst';

interface CPCExplorerProps {
  cpcData: Array<{ code: string; name: string; count: number; color: string }>;
  topic: string;
  title: string;
  description: string;
}

const CPCExplorer: React.FC<CPCExplorerProps> = ({ cpcData, topic, title, description }) => {
  const hierarchy = useMemo(() => buildCPCHierarchy(cpcData, topic), [cpcData, topic]);

  // Browse modal navigation state
  const [sectionCode, setSectionCode] = useState<string | undefined>();
  const [classCode, setClassCode] = useState<string | undefined>();
  const [browseTab, setBrowseTab] = useState<'list' | 'patents'>('list');

  // Patent modal state
  const [patentModal, setPatentModal] = useState<{ patents: CPCPatent[]; label: string; sublabel: string } | null>(null);
  const [selectedPatent, setSelectedPatent] = useState<CPCPatent | null>(null);
  const [patentTab, setPatentTab] = useState<'all' | 'granted' | 'filed'>('all');
  const [patentSearch, setPatentSearch] = useState('');

  const currentSection = useMemo(
    () => hierarchy.sections.find(s => s.code === sectionCode),
    [hierarchy, sectionCode],
  );
  const currentClass = useMemo(
    () => currentSection?.classes.find(c => c.code === classCode),
    [currentSection, classCode],
  );

  // Top-level (page) items: always sections
  const sectionItems = useMemo(() => {
    const total = hierarchy.totalAssignments || 1;
    return hierarchy.sections.map(sec => ({
      code: sec.code,
      name: sec.name,
      count: sec.count,
      share: (sec.count / total) * 100,
      color: sec.color,
    }));
  }, [hierarchy]);

  // Items inside browse modal (children of current level)
  const browseItems = useMemo(() => {
    if (currentClass) {
      const total = currentClass.count || 1;
      return currentClass.subclasses.map(sub => ({
        code: sub.code,
        name: sub.name,
        count: sub.count,
        share: (sub.count / total) * 100,
        canDrill: false,
        color: shadeHsl(currentSection!.color, 18, -20),
        onDrill: () => openPatents(sub.patents, sub.code, sub.name),
      }));
    }
    if (currentSection) {
      const total = currentSection.count || 1;
      return currentSection.classes.map(cls => ({
        code: cls.code,
        name: cls.name,
        count: cls.count,
        share: (cls.count / total) * 100,
        canDrill: cls.subclasses.length > 0,
        color: shadeHsl(currentSection.color, 8, -10),
        onDrill: () => { setClassCode(cls.code); setBrowseTab('list'); },
      }));
    }
    return [];
  }, [currentSection, currentClass]);

  const openSection = (code: string) => {
    setSectionCode(code);
    setClassCode(undefined);
    setBrowseTab('list');
  };

  const closeBrowse = () => {
    setSectionCode(undefined);
    setClassCode(undefined);
  };

  const goBackBrowse = () => {
    if (currentClass) { setClassCode(undefined); setBrowseTab('list'); }
    else closeBrowse();
  };

  const openPatents = (patents: CPCPatent[], code: string, name: string) => {
    setPatentModal({ patents, label: code, sublabel: name });
    setSelectedPatent(null);
    setPatentTab('all');
    setPatentSearch('');
  };

  const closePatents = () => {
    setPatentModal(null);
    setSelectedPatent(null);
  };

  // Patents at current browse level (for "All patents" tab)
  const currentLevelPatents = useMemo(() => {
    if (currentClass) return patentsForClass(currentClass);
    if (currentSection) return patentsForSection(currentSection);
    return [];
  }, [currentSection, currentClass]);

  // Filtered patents in patent modal
  const filteredPatents = useMemo(() => {
    if (!patentModal) return [];
    let f = patentModal.patents;
    if (patentTab === 'granted') f = f.filter(p => p.status === 'Granted');
    if (patentTab === 'filed') f = f.filter(p => p.status === 'Filed');
    if (patentSearch) {
      const lo = patentSearch.toLowerCase();
      f = f.filter(p => p.title.toLowerCase().includes(lo) || p.company.toLowerCase().includes(lo));
    }
    return f;
  }, [patentModal, patentTab, patentSearch]);

  const grantedCount = patentModal ? patentModal.patents.filter(p => p.status === 'Granted').length : 0;
  const filedCount = patentModal ? patentModal.patents.filter(p => p.status === 'Filed').length : 0;

  // Browse-level patents stats for tab labels
  const browseAllCount = currentLevelPatents.length;
  const browseGrantedCount = currentLevelPatents.filter(p => p.status === 'Granted').length;
  const browseFiledCount = currentLevelPatents.filter(p => p.status === 'Filed').length;

  // Inline patent search/filter inside browse modal "All patents" tab
  const [browsePatentTab, setBrowsePatentTab] = useState<'all' | 'granted' | 'filed'>('all');
  const [browsePatentSearch, setBrowsePatentSearch] = useState('');
  const browseFilteredPatents = useMemo(() => {
    let f = currentLevelPatents;
    if (browsePatentTab === 'granted') f = f.filter(p => p.status === 'Granted');
    if (browsePatentTab === 'filed') f = f.filter(p => p.status === 'Filed');
    if (browsePatentSearch) {
      const lo = browsePatentSearch.toLowerCase();
      f = f.filter(p => p.title.toLowerCase().includes(lo) || p.company.toLowerCase().includes(lo));
    }
    return f;
  }, [currentLevelPatents, browsePatentTab, browsePatentSearch]);

  return (
    <div className="bg-muted/30 border border-border/40 rounded-xl p-4">
      <div className="mb-4">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{title}</h3>
        <p className="text-[10px] text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 300px' }}>
        {/* Sections list */}
        <div>
          <div className="text-[10px] font-semibold text-foreground mb-2">All sections</div>
          <div className="space-y-0">
            {sectionItems.map((it) => {
              const maxCount = Math.max(...sectionItems.map(x => x.count), 1);
              const barWidth = Math.max(4, (it.count / maxCount) * 100);
              return (
                <div
                  key={it.code}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/20 last:border-b-0 group"
                  onClick={() => openSection(it.code)}
                >
                  <span className="text-[10px] font-mono font-bold text-muted-foreground w-[42px] shrink-0">{it.code}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <span className="text-[11px] text-foreground group-hover:text-primary transition-colors truncate">{it.name}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] font-semibold text-foreground tabular-nums">{it.count}</span>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: it.color }} />
                      </div>
                    </div>
                    <div className="w-full h-1 bg-muted/60 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${barWidth}%`, backgroundColor: it.color, opacity: 0.75 }} />
                    </div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                </div>
              );
            })}
          </div>

          <p className="text-[9px] text-muted-foreground mt-3 italic">
            Patents may belong to multiple CPC branches; counts show assignments, not unique patents.
          </p>
        </div>

        {/* Sunburst */}
        <div className="flex items-center justify-center">
          <CPCSunburst
            hierarchy={hierarchy}
            size={280}
            onOpenSlice={(level, code) => {
              if (level === 'section') {
                const sec = hierarchy.sections.find(s => s.code === code);
                if (sec) openPatents(patentsForSection(sec), sec.code, sec.name);
              } else if (level === 'class') {
                const sec = hierarchy.sections.find(s => s.classes.some(c => c.code === code));
                const cls = sec?.classes.find(c => c.code === code);
                if (cls) openPatents(patentsForClass(cls), cls.code, cls.name);
              } else {
                const sec = hierarchy.sections.find(s => s.classes.some(c => c.subclasses.some(su => su.code === code)));
                const cls = sec?.classes.find(c => c.subclasses.some(su => su.code === code));
                const sub = cls?.subclasses.find(su => su.code === code);
                if (sub) openPatents(sub.patents, sub.code, sub.name);
              }
            }}
          />
        </div>
      </div>

      {/* Browse (section / class) modal */}
      <Dialog open={!!currentSection} onOpenChange={(o) => { if (!o) closeBrowse(); }}>
        <DialogContent className="max-w-[680px] p-0 gap-0 max-h-[80vh] overflow-hidden flex flex-col">
          {currentSection && (
            <>
              <div className="px-4 py-3 border-b border-border flex-shrink-0">
                {currentClass && (
                  <button
                    onClick={goBackBrowse}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors mb-2"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back to {currentSection.code} classes
                  </button>
                )}
                <DialogTitle className="text-[9px] font-bold uppercase tracking-wider text-primary mb-0.5">
                  CPC {currentClass ? 'Class' : 'Section'}
                </DialogTitle>
                <h4 className="text-sm font-semibold text-foreground">
                  <span className="font-mono mr-1.5">{(currentClass || currentSection).code}</span>
                  {(currentClass || currentSection).name}
                </h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {browseItems.length} {currentClass ? 'subclasses' : 'classes'} · {browseAllCount} patents · {browseGrantedCount} granted · {browseFiledCount} filed
                </p>
              </div>

              {/* Tabs */}
              <div className="px-4 py-2 border-b border-border flex-shrink-0">
                <div className="flex gap-1">
                  <button
                    onClick={() => setBrowseTab('list')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                      browseTab === 'list' ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Layers className="w-2.5 h-2.5" />
                    {currentClass ? 'Subclasses' : 'Classes'}
                    <span className="opacity-70">{browseItems.length}</span>
                  </button>
                  <button
                    onClick={() => setBrowseTab('patents')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                      browseTab === 'patents' ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Award className="w-2.5 h-2.5" />
                    All patents
                    <span className="opacity-70">{browseAllCount}</span>
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto flex-1">
                {browseTab === 'list' ? (
                  <div className="p-2">
                    {browseItems.map((it) => {
                      const maxCount = Math.max(...browseItems.map(x => x.count), 1);
                      const barWidth = Math.max(4, (it.count / maxCount) * 100);
                      return (
                        <div
                          key={it.code}
                          className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/20 last:border-b-0 group rounded-md"
                          onClick={it.onDrill}
                        >
                          <span className="text-[10px] font-mono font-bold text-muted-foreground w-[52px] shrink-0">{it.code}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1 gap-2">
                              <span className="text-[11px] text-foreground group-hover:text-primary transition-colors truncate">{it.name}</span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[11px] font-semibold text-foreground tabular-nums">{it.count}</span>
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: it.color }} />
                              </div>
                            </div>
                            <div className="w-full h-1 bg-muted/60 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${barWidth}%`, backgroundColor: it.color, opacity: 0.75 }} />
                            </div>
                          </div>
                          {it.canDrill ? (
                            <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                          ) : (
                            <span className="text-[9px] text-muted-foreground px-1.5 py-0.5 rounded border border-border/60 bg-background shrink-0">Patents</span>
                          )}
                        </div>
                      );
                    })}
                    {browseItems.length === 0 && (
                      <div className="text-center py-6 text-[10px] text-muted-foreground">No items.</div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="px-4 py-2 border-b border-border flex items-center justify-between gap-3 sticky top-0 bg-card z-10">
                      <div className="flex gap-1">
                        {([
                          { key: 'all' as const, label: 'All', count: browseAllCount },
                          { key: 'granted' as const, label: 'Granted', count: browseGrantedCount },
                          { key: 'filed' as const, label: 'Filed', count: browseFiledCount },
                        ]).map(tab => (
                          <button
                            key={tab.key}
                            onClick={() => setBrowsePatentTab(tab.key)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                              browsePatentTab === tab.key ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                          >
                            {tab.key === 'granted' && <span className="text-primary">✓</span>}
                            {tab.key === 'filed' && <FileText className="w-2.5 h-2.5" />}
                            {tab.label}
                            <span className="opacity-70">{tab.count}</span>
                          </button>
                        ))}
                      </div>
                      <div className="relative w-44">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-muted-foreground" />
                        <Input
                          placeholder="Search patents..."
                          value={browsePatentSearch}
                          onChange={e => setBrowsePatentSearch(e.target.value)}
                          className="pl-6 pr-6 h-6 !text-[9px] border-border w-full"
                        />
                        {browsePatentSearch && (
                          <Button variant="ghost" size="sm" onClick={() => setBrowsePatentSearch('')} className="absolute right-0.5 top-1/2 -translate-y-1/2 h-4 w-4 p-0 hover:bg-muted">
                            <X className="h-2 w-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <table className="w-full text-xs">
                      <thead className="sticky top-[42px] bg-card z-10">
                        <tr className="border-b border-border">
                          <th className="text-left py-1.5 px-4 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground" style={{ width: '50%' }}>Patent</th>
                          <th className="text-center py-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Filing</th>
                          <th className="text-center py-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Granted</th>
                          <th className="text-center py-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                          <th className="text-center py-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">CPCs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {browseFilteredPatents.map((p, i) => (
                          <tr
                            key={p.id + i}
                            className="border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => { setPatentModal({ patents: currentLevelPatents, label: (currentClass || currentSection).code, sublabel: (currentClass || currentSection).name }); setSelectedPatent(p); setPatentTab('all'); setPatentSearch(''); }}
                          >
                            <td className="py-1.5 px-4">
                              <div className="font-medium text-[10px] text-foreground line-clamp-2 hover:text-primary transition-colors">{p.title}</div>
                              <div className="text-[9px] text-muted-foreground mt-0.5">Applicant: {p.company}</div>
                            </td>
                            <td className="text-center py-1.5 text-[11px] text-muted-foreground">{p.filingYear}</td>
                            <td className="text-center py-1.5 text-[11px] text-muted-foreground">{p.grantedYear || ''}</td>
                            <td className="text-center py-1.5">
                              {p.status === 'Granted' ? (
                                <div className="inline-flex items-center gap-0.5 text-primary text-[10px] font-medium"><span>✓</span><span>Granted</span></div>
                              ) : (
                                <div className="text-muted-foreground text-[10px]">Filed</div>
                              )}
                            </td>
                            <td className="text-center py-1.5"><span className="text-[10px] text-muted-foreground tabular-nums">{p.cpcCodes.length}</span></td>
                          </tr>
                        ))}
                        {browseFilteredPatents.length === 0 && (
                          <tr><td colSpan={5} className="text-center py-6 text-[10px] text-muted-foreground">No patents found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Patents modal (from sunburst clicks / patent detail) */}
      <Dialog open={!!patentModal} onOpenChange={(o) => { if (!o) closePatents(); }}>
        <DialogContent className="max-w-[640px] p-0 gap-0 max-h-[80vh] overflow-hidden flex flex-col">
          {selectedPatent ? (
            <>
              <div className="px-4 py-3 border-b border-border flex-shrink-0">
                <button
                  onClick={() => setSelectedPatent(null)}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors mb-2"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to patents
                </button>
                <DialogTitle className="text-sm font-semibold text-foreground leading-snug">
                  {selectedPatent.title}
                </DialogTitle>
              </div>
              <div className="overflow-y-auto flex-1 px-4 py-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
                    <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-0.5">Status</p>
                    {selectedPatent.status === 'Granted' ? (
                      <span className="text-primary text-[11px] font-semibold">✓ Granted</span>
                    ) : (
                      <span className="text-muted-foreground text-[11px] font-semibold flex items-center gap-1"><FileText className="w-3 h-3" /> Filed</span>
                    )}
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
                    <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-0.5">Jurisdictions</p>
                    <p className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                      <Globe className="w-3 h-3 text-muted-foreground" />{selectedPatent.jurisdiction}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
                    <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-0.5">Filing Year</p>
                    <p className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />{selectedPatent.filingYear}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
                    <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-0.5">Granted Year</p>
                    <p className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-muted-foreground" />{selectedPatent.grantedYear || '—'}
                    </p>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
                  <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-0.5">Applicant</p>
                  <p className="text-[11px] font-medium text-foreground flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-muted-foreground" />{selectedPatent.company}
                  </p>
                </div>
                {selectedPatent.cpcCodes.length > 0 && (
                  <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
                    <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-1">CPC Classifications ({selectedPatent.cpcCodes.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedPatent.cpcCodes.map((c, i) => (
                        <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 font-mono">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedPatent.abstract && (
                  <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
                    <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-1">Abstract</p>
                    <p className="text-[10px] text-foreground leading-relaxed">{selectedPatent.abstract}</p>
                  </div>
                )}
              </div>
            </>
          ) : patentModal ? (
            <>
              <div className="px-4 py-3 border-b border-border flex-shrink-0">
                <DialogTitle className="text-[9px] font-bold uppercase tracking-wider text-primary mb-0.5">CPC Classification</DialogTitle>
                <h4 className="text-sm font-semibold text-foreground"><span className="font-mono mr-1.5">{patentModal.label}</span>{patentModal.sublabel}</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">{patentModal.patents.length} unique patents · {grantedCount} granted · {filedCount} filed</p>
              </div>

              <div className="px-4 py-2 border-b border-border flex-shrink-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex gap-1">
                    {([
                      { key: 'all' as const, label: 'All', count: patentModal.patents.length },
                      { key: 'granted' as const, label: 'Granted', count: grantedCount },
                      { key: 'filed' as const, label: 'Filed', count: filedCount },
                    ]).map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setPatentTab(tab.key)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                          patentTab === tab.key ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {tab.key === 'granted' && <span className="text-primary">✓</span>}
                        {tab.key === 'filed' && <FileText className="w-2.5 h-2.5" />}
                        {tab.label}
                        <span className="opacity-70">{tab.count}</span>
                      </button>
                    ))}
                  </div>
                  <div className="relative w-44">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-2.5 w-2.5 text-muted-foreground" />
                    <Input
                      placeholder="Search patents..."
                      value={patentSearch}
                      onChange={e => setPatentSearch(e.target.value)}
                      className="pl-6 pr-6 h-6 !text-[9px] border-border w-full"
                    />
                    {patentSearch && (
                      <Button variant="ghost" size="sm" onClick={() => setPatentSearch('')} className="absolute right-0.5 top-1/2 -translate-y-1/2 h-4 w-4 p-0 hover:bg-muted">
                        <X className="h-2 w-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="overflow-y-auto flex-1">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr className="border-b border-border">
                      <th className="text-left py-1.5 px-4 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground" style={{ width: '50%' }}>Patent</th>
                      <th className="text-center py-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Filing</th>
                      <th className="text-center py-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Granted</th>
                      <th className="text-center py-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                      <th className="text-center py-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">CPCs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatents.map((p, i) => (
                      <tr
                        key={p.id + i}
                        className="border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedPatent(p)}
                      >
                        <td className="py-1.5 px-4">
                          <div className="font-medium text-[10px] text-foreground line-clamp-2 hover:text-primary transition-colors">{p.title}</div>
                          <div className="text-[9px] text-muted-foreground mt-0.5">Applicant: {p.company}</div>
                        </td>
                        <td className="text-center py-1.5 text-[11px] text-muted-foreground">{p.filingYear}</td>
                        <td className="text-center py-1.5 text-[11px] text-muted-foreground">{p.grantedYear || ''}</td>
                        <td className="text-center py-1.5">
                          {p.status === 'Granted' ? (
                            <div className="inline-flex items-center gap-0.5 text-primary text-[10px] font-medium"><span>✓</span><span>Granted</span></div>
                          ) : (
                            <div className="text-muted-foreground text-[10px]">Filed</div>
                          )}
                        </td>
                        <td className="text-center py-1.5"><span className="text-[10px] text-muted-foreground tabular-nums">{p.cpcCodes.length}</span></td>
                      </tr>
                    ))}
                    {filteredPatents.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-6 text-[10px] text-muted-foreground">No patents found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CPCExplorer;
