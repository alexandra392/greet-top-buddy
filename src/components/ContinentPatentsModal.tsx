import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Search, X, FileText, Calendar, Building2, Globe } from "lucide-react";

interface Patent {
  title: string;
  company: string;
  filingYear: number;
  grantedYear: number | null;
  status: string;
  jurisdiction: number;
  abstract?: string;
  inventors?: string[];
  cpcCodes?: string[];
  country?: string;
}

interface CountryRow {
  name: string;
  granted: number;
  filed: number;
}

interface ContinentPatentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  continent: string;
  granted: number;
  filed: number;
  topic?: string;
}

// Mock country mapping per continent
const continentCountries: Record<string, string[]> = {
  'North America': ['United States', 'Canada', 'Mexico'],
  'South America': ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Uruguay'],
  'Europe': ['Germany', 'France', 'United Kingdom', 'Netherlands', 'Italy', 'Spain', 'Sweden', 'Denmark', 'Belgium', 'Switzerland', 'Finland', 'Austria'],
  'Asia': ['Japan', 'China', 'Korea, Republic of', 'Israel', 'India', 'Taiwan, Province of China', 'Singapore', 'Saudi Arabia', 'Malaysia', 'Turkey', 'Thailand', 'Indonesia'],
  'Oceania': ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea'],
  'Africa': ['South Africa', 'Egypt', 'Morocco', 'Kenya', 'Nigeria'],
};

// Distribute totals across countries with descending weights
const distributeCounts = (total: number, n: number): number[] => {
  if (n === 0 || total === 0) return new Array(n).fill(0);
  const weights = Array.from({ length: n }, (_, i) => 1 / (i + 1));
  const sumW = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map(w => (w / sumW) * total);
  const floored = raw.map(x => Math.floor(x));
  let remainder = total - floored.reduce((a, b) => a + b, 0);
  for (let i = 0; i < floored.length && remainder > 0; i++) {
    floored[i] += 1;
    remainder--;
  }
  return floored;
};

const generatePatentsForCountry = (
  country: string,
  granted: number,
  filed: number,
  topic: string,
): Patent[] => {
  const titles = [
    `Improved ${topic} Production Process Using Novel Catalyst System`,
    `Method for Enhanced ${topic} Yield via Controlled Fermentation`,
    `Continuous ${topic} Purification and Recovery Apparatus`,
    `Bio-based ${topic} Synthesis from Renewable Feedstock`,
    `High-Purity ${topic} Isolation Using Membrane Technology`,
    `Integrated ${topic} Biorefinery Process Design`,
    `Novel Enzyme Complex for ${topic} Conversion Efficiency`,
    `Sustainable ${topic} Manufacturing with Reduced Energy Input`,
    `Advanced Crystallisation Method for ${topic} Products`,
    `${topic} Quality Control System Using In-Line Sensors`,
  ];
  const companies = ['Innov8 BioTech', 'GreenChem AG', 'BioFuture Corp', 'NovaSynth', 'CircularLab', 'Pure Process GmbH'];
  const total = granted + filed;
  const out: Patent[] = [];
  for (let i = 0; i < total; i++) {
    const isGranted = i < granted;
    const filingYear = 2018 + ((i * 7) % 6);
    out.push({
      title: titles[i % titles.length] + (i >= titles.length ? ` (Variant ${Math.floor(i / titles.length) + 1})` : ''),
      company: companies[i % companies.length],
      filingYear,
      grantedYear: isGranted ? filingYear + 1 + (i % 2) : null,
      status: isGranted ? 'Granted' : 'Filed',
      jurisdiction: 3 + ((i * 3) % 12),
      country,
      abstract: `This invention, filed in ${country}, relates to ${titles[i % titles.length].toLowerCase()}, providing significant improvements in efficiency, yield, and sustainability for industrial-scale ${topic.toLowerCase()} production.`,
      inventors: [`${['A.', 'B.', 'C.', 'D.'][i % 4]} ${['Smith', 'Mueller', 'Zhang', 'Patel', 'Tanaka', 'Nielsen'][i % 6]}`],
      cpcCodes: [`C${12 + (i % 4)}P ${(i % 20) + 1}/${(i * 3 + 2) % 30}`],
    });
  }
  return out;
};

const PAGE_SIZE = 10;

const ContinentPatentsModal = ({
  open,
  onOpenChange,
  continent,
  granted,
  filed,
  topic = 'Lactic Acid',
}: ContinentPatentsModalProps) => {
  const [view, setView] = useState<'countries' | 'patents'>('countries');
  const [selectedCountry, setSelectedCountry] = useState<CountryRow | null>(null);
  const [selectedPatent, setSelectedPatent] = useState<Patent | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [patentTab, setPatentTab] = useState<'all' | 'granted' | 'filed'>('all');
  

  const countries = useMemo<CountryRow[]>(() => {
    const names = continentCountries[continent] || ['Country A', 'Country B', 'Country C'];
    const grantedSplit = distributeCounts(granted, names.length);
    const filedSplit = distributeCounts(filed, names.length);
    const rows = names.map((name, i) => ({
      name,
      granted: grantedSplit[i],
      filed: filedSplit[i],
    }));
    // sort by total desc
    return rows.sort((a, b) => (b.granted + b.filed) - (a.granted + a.filed));
  }, [continent, granted, filed]);

  const maxGranted = useMemo(() => Math.max(1, ...countries.map(c => c.granted)), [countries]);
  const maxFiled = useMemo(() => Math.max(1, ...countries.map(c => c.filed)), [countries]);

  const totalPages = Math.max(1, Math.ceil(countries.length / PAGE_SIZE));
  const pageRows = countries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const countryPatents = useMemo(() => {
    if (!selectedCountry) return [];
    return generatePatentsForCountry(selectedCountry.name, selectedCountry.granted, selectedCountry.filed, topic);
  }, [selectedCountry, topic]);

  const filteredPatents = useMemo(() => {
    let f = countryPatents;
    if (patentTab === 'granted') f = f.filter(p => p.status === 'Granted');
    if (patentTab === 'filed') f = f.filter(p => p.status === 'Filed');
    if (searchTerm) {
      const lo = searchTerm.toLowerCase();
      f = f.filter(p => p.title.toLowerCase().includes(lo) || p.company.toLowerCase().includes(lo));
    }
    return f;
  }, [countryPatents, patentTab, searchTerm]);

  const handleClose = () => {
    setView('countries');
    setSelectedCountry(null);
    setSelectedPatent(null);
    setPage(1);
    setSearchTerm('');
    setPatentTab('all');
    onOpenChange(false);
  };

  const openCountry = (c: CountryRow) => {
    setSelectedCountry(c);
    setView('patents');
    setSelectedPatent(null);
    setSearchTerm('');
    setPatentTab('all');
  };




  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[600px] p-0 gap-0 max-h-[80vh] overflow-hidden flex flex-col">
        {/* ===== Patent detail sub-view ===== */}
        {view === 'patents' && selectedPatent ? (
          <>
            <div className="px-4 py-3 border-b border-border flex-shrink-0">
              <button
                onClick={() => setSelectedPatent(null)}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors mb-2"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to {selectedCountry?.name} patents
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
                  <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-0.5">Country</p>
                  <p className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                    <Globe className="w-3 h-3 text-muted-foreground" />
                    {selectedPatent.country}
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
                  <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-0.5">Filing Year</p>
                  <p className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    {selectedPatent.filingYear}
                  </p>
                </div>
                <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
                  <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-0.5">Granted Year</p>
                  <p className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    {selectedPatent.grantedYear || '—'}
                  </p>
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
                <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-0.5">Applicant</p>
                <p className="text-[11px] font-medium text-foreground flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-muted-foreground" />
                  {selectedPatent.company}
                </p>
              </div>
              {selectedPatent.cpcCodes && selectedPatent.cpcCodes.length > 0 && (
                <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
                  <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-1">CPC Classification</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedPatent.cpcCodes.map((code, i) => (
                      <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 font-mono">{code}</span>
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
        ) : view === 'patents' && selectedCountry ? (
          <>
            {/* ===== Country patent list ===== */}
            <div className="px-4 py-3 border-b border-border flex-shrink-0">
              <button
                onClick={() => { setView('countries'); setSelectedCountry(null); }}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors mb-2"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to {continent} countries
              </button>
              <DialogTitle className="text-sm font-semibold text-foreground">{selectedCountry.name}</DialogTitle>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {selectedCountry.granted + selectedCountry.filed} patents · {selectedCountry.granted} granted · {selectedCountry.filed} filed
              </p>
            </div>

            <div className="px-4 py-2 border-b border-border flex-shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-1">
                  {([
                    { key: 'all' as const, label: 'All', count: selectedCountry.granted + selectedCountry.filed },
                    { key: 'granted' as const, label: 'Granted', count: selectedCountry.granted },
                    { key: 'filed' as const, label: 'Filed', count: selectedCountry.filed },
                  ]).map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setPatentTab(tab.key)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                        patentTab === tab.key
                          ? 'bg-foreground text-background shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-6 pr-6 h-6 !text-[9px] border-border w-full"
                  />
                  {searchTerm && (
                    <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')} className="absolute right-0.5 top-1/2 -translate-y-1/2 h-4 w-4 p-0 hover:bg-muted">
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
                    <th className="text-left py-1.5 px-4 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground" style={{ width: '55%' }}>Patent</th>
                    <th className="text-center py-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Filing</th>
                    <th className="text-center py-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Granted</th>
                    <th className="text-center py-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                    <th className="text-center py-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Jurisd.</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatents.map((p, i) => (
                    <tr
                      key={i}
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
                      <td className="text-center py-1.5"><span className="text-[10px] text-muted-foreground">{p.jurisdiction}</span></td>
                    </tr>
                  ))}
                  {filteredPatents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-[10px] text-muted-foreground">No patents found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            {/* ===== Country list (default) ===== */}
            <div className="px-4 py-3 border-b border-border flex-shrink-0">
              <DialogTitle className="text-[9px] font-bold uppercase tracking-wider text-primary mb-0.5">Continent</DialogTitle>
              <h4 className="text-sm font-semibold text-foreground">{continent}</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {granted + filed} patents · {granted} granted · {filed} filed
              </p>
            </div>

            {/* Granted vs Filed proportional summary */}
            <div className="px-4 py-3 border-b border-border flex-shrink-0">
              <div className="flex items-center justify-between text-[10px] mb-1.5">
                <div className="flex items-center gap-1.5 text-foreground">
                  <span className="text-primary">✓</span>
                  <span className="font-semibold tabular-nums">{granted}</span>
                  <span className="text-muted-foreground uppercase tracking-wider text-[9px]">Granted</span>
                </div>
                <div className="flex items-center gap-1.5 text-foreground">
                  <span className="text-muted-foreground uppercase tracking-wider text-[9px]">Filed</span>
                  <span className="font-semibold tabular-nums">{filed}</span>
                  <FileText className="w-2.5 h-2.5 text-info" />
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden flex">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${(granted / Math.max(1, granted + filed)) * 100}%` }}
                />
                <div
                  className="h-full bg-info"
                  style={{ width: `${(filed / Math.max(1, granted + filed)) * 100}%` }}
                />
              </div>
            </div>

            {/* Country table */}
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-xs table-fixed">
                <colgroup>
                  <col />
                  <col style={{ width: 70 }} />
                  <col style={{ width: 80 }} />
                  <col style={{ width: 80 }} />
                  <col style={{ width: 32 }} />
                </colgroup>
                <thead className="sticky top-0 bg-card z-10">
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-4 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Country</th>
                    <th className="text-center py-2 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Total</th>
                    <th className="text-center py-2 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Granted</th>
                    <th className="text-center py-2 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Filed</th>
                    <th className="py-2 px-2" />
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((c) => {
                    const total = c.granted + c.filed;
                    const continentTotal = granted + filed || 1;
                    const sharePct = (total / continentTotal) * 100;
                    return (
                      <tr
                        key={c.name}
                        className="border-b border-border/30 hover:bg-muted/20 transition-colors cursor-pointer group relative"
                        onClick={() => openCountry(c)}
                      >
                        <td className="py-2 px-4 relative">
                          <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[11px] text-foreground group-hover:text-primary transition-colors truncate">{c.name}</span>
                            <span className="text-[9px] text-muted-foreground tabular-nums">{sharePct.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="py-2 text-center">
                          <span className="text-[11px] font-semibold text-foreground tabular-nums">{total}</span>
                        </td>
                        <td className="py-2 text-center">
                          <span className="text-[11px] text-muted-foreground tabular-nums">{c.granted > 0 ? c.granted : '–'}</span>
                        </td>
                        <td className="py-2 text-center">
                          <span className="text-[11px] text-muted-foreground tabular-nums">{c.filed > 0 ? c.filed : '–'}</span>
                        </td>
                        <td className="py-2 px-2 text-right">
                          <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity inline-block" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-2 border-t border-border flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`h-6 w-6 rounded-md text-[10px] font-medium transition-colors ${
                        n === page ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">Page {page} of {totalPages}</p>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ContinentPatentsModal;
