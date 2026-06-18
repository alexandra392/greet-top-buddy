import React from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Hash, Calendar, Building2, ArrowLeft, ExternalLink, ChevronRight, Globe } from "lucide-react";

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
  subcategory?: string;
  patentId?: string;
}

interface PatentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patent: Patent | null;
  topic?: string;
  onBack?: () => void;
}

const mockPatentId = (title: string) => {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) | 0;
  const n = Math.abs(h) % 90000000 + 10000000;
  const letters = ['A1', 'B1', 'B2', 'A2'];
  return `CN-${n}-${letters[Math.abs(h) % letters.length]}`;
};

const CPC_HIERARCHY: Record<string, { name: string; classes: Record<string, { name: string; subs: Record<string, string> }> }> = {
  C: {
    name: 'Chemistry; Metallurgy',
    classes: {
      C12: {
        name: 'Biochemistry; Microbiology; Enzymology',
        subs: {
          C12P: 'Fermentation or enzymatic processes for chemical synthesis',
          C12N: 'Microorganisms or enzymes; compositions thereof',
        },
      },
      C08: {
        name: 'Organic Macromolecular Compounds',
        subs: {
          C08L: 'Compositions of macromolecular compounds',
          C08J: 'Working-up of macromolecular substances',
        },
      },
      C07: {
        name: 'Organic chemistry',
        subs: { C07C: 'Acyclic or carbocyclic compounds', C07K: 'Peptides' },
      },
    },
  },
  A: {
    name: 'Human Necessities',
    classes: { A23: { name: 'Foods or foodstuffs', subs: { A23L: 'Foods, foodstuffs or non-alcoholic beverages' } } },
  },
  B: {
    name: 'Performing Operations; Transporting',
    classes: { B01: { name: 'Physical or chemical processes or apparatus', subs: { B01J: 'Chemical or physical processes' } } },
  },
};

const COUNTRY_POOL = ['CHL','ZAF','SWE','FIN','TUR','USA','RUS','ITA','AUT','NLD','ARG','COL','NOR','KOR','POL','CHN','JPN','DEU','FRA','GBR','BRA','IND','CAN','AUS','MEX','ESP','BEL','PRT','DNK','IRL'];

const parseCpc = (code: string) => {
  const m = code.match(/^([A-Z])(\d{2})?([A-Z])?/);
  if (!m) return null;
  const section = m[1];
  const klass = m[2] ? section + m[2] : '';
  const sub = m[3] ? klass + m[3] : '';
  return { section, klass, sub };
};

const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

const CpcRow = ({ code, index }: { code: string; index: number }) => {
  const parsed = parseCpc(code);
  if (!parsed) return null;
  const sectionInfo = CPC_HIERARCHY[parsed.section];
  const classInfo = sectionInfo && parsed.klass ? sectionInfo.classes[parsed.klass] : null;
  const subName = classInfo && parsed.sub ? classInfo.subs[parsed.sub] : null;

  return (
    <HoverCard openDelay={80} closeDelay={80}>
      <HoverCardTrigger asChild>
        <div className="flex items-center gap-1.5 flex-wrap text-left hover:bg-background/60 rounded px-1 py-1 -mx-1 transition-colors cursor-default">
          <span className="text-[10px] font-mono font-semibold text-primary">{parsed.section}</span>
          <ChevronRight className="w-2.5 h-2.5 text-muted-foreground/60" />
          <span className="text-[10px] font-mono font-semibold text-primary">{parsed.klass}</span>
          <ChevronRight className="w-2.5 h-2.5 text-muted-foreground/60" />
          <span className="text-[10px] font-mono font-semibold text-primary">{parsed.sub}</span>
          <span className="text-muted-foreground/40 mx-0.5">·</span>
          <span className="text-[10px] text-muted-foreground">{truncate(sectionInfo?.name ?? '', 12)}</span>
          <span className="text-muted-foreground/40 mx-0.5">·</span>
          <span className="text-[10px] text-muted-foreground">{truncate(classInfo?.name ?? '', 22)}</span>
          <span className="text-muted-foreground/40 mx-0.5">·</span>
          <span className="text-[10px] text-foreground font-medium flex-1 min-w-0 truncate">{truncate(subName ?? '', 38)}</span>
          <span className="text-[9px] text-muted-foreground ml-auto flex-shrink-0">#{index + 1}</span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent side="bottom" align="start" className="w-[380px] p-3 z-[100]">
        <div className="space-y-2">
          {sectionInfo && (
            <div className="flex items-start gap-3">
              <span className="text-[10px] font-mono font-semibold text-primary w-12 flex-shrink-0">{parsed.section}</span>
              <span className="text-[11px] text-foreground">{sectionInfo.name}</span>
            </div>
          )}
          {classInfo && (
            <div className="flex items-start gap-3">
              <span className="text-[10px] font-mono font-semibold text-primary w-12 flex-shrink-0">{parsed.klass}</span>
              <span className="text-[11px] text-foreground">{classInfo.name}</span>
            </div>
          )}
          {subName && (
            <div className="flex items-start gap-3">
              <span className="text-[10px] font-mono font-semibold text-primary w-12 flex-shrink-0">{parsed.sub}</span>
              <span className="text-[11px] text-foreground">{subName}</span>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const PatentDetailModal = ({ open, onOpenChange, patent, topic = 'Lactic Acid', onBack }: PatentDetailModalProps) => {
  if (!patent) return null;

  const patentId = patent.patentId || mockPatentId(patent.title);

  // Build 2 CPC codes (one provided + one derived)
  const baseCodes = patent.cpcCodes && patent.cpcCodes.length > 0 ? patent.cpcCodes : ['C12P 1/2'];
  const codes = [baseCodes[0], baseCodes[1] || 'C08L 67/04'];

  // Deterministic jurisdiction selection
  let h = 0;
  for (let i = 0; i < patent.title.length; i++) h = (h * 31 + patent.title.charCodeAt(i)) | 0;
  const offset = Math.abs(h) % COUNTRY_POOL.length;
  const jCount = Math.min(patent.jurisdiction, COUNTRY_POOL.length);
  const countries = Array.from({ length: jCount }, (_, i) => COUNTRY_POOL[(offset + i) % COUNTRY_POOL.length]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-start gap-2">
            {onBack && (
              <button
                onClick={onBack}
                aria-label="Back"
                className="mt-0.5 text-primary hover:text-primary/80 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <DialogTitle className="text-sm font-semibold text-foreground leading-snug flex-1 pr-6">
              {patent.title}
            </DialogTitle>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2.5">
          {/* Row 1: Patent ID + Applicant */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-1">Patent ID</p>
              <p className="text-[12px] font-semibold text-foreground flex items-center gap-1.5 font-mono">
                <Hash className="w-3 h-3 text-muted-foreground" />
                {patentId}
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-1">Applicant</p>
              <p className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-muted-foreground" />
                {patent.company}
              </p>
            </div>
          </div>

          {/* Row 2: Status + Filing + Granted */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-1">Status</p>
              {patent.status === 'Granted' ? (
                <p className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Granted
                </p>
              ) : (
                <p className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                  Filed
                </p>
              )}
            </div>
            <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-1">Filing Year</p>
              <p className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                {patent.filingYear}
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-1">Granted Year</p>
              <p className="text-[12px] font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                {patent.grantedYear || '—'}
              </p>
            </div>
          </div>

          {/* CPC Classification */}
          <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider">CPC Classification</p>
              <p className="text-[8px] text-muted-foreground">Section › Class › Subclass</p>
            </div>
            <div className="space-y-0.5">
              {codes.map((code, i) => <CpcRow key={i} code={code} index={i} />)}
            </div>
          </div>

          {/* Jurisdictions */}
          <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider">Jurisdictions ({patent.jurisdiction})</p>
              <Globe className="w-3 h-3 text-muted-foreground" />
            </div>
            <p className="text-[11px] font-mono text-foreground leading-relaxed">{countries.join(', ')}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 py-3 border-t border-border flex-shrink-0">
          <button
            type="button"
            onClick={() => window.open(`https://patents.google.com/?q=${encodeURIComponent(patent.title)}`, '_blank', 'noopener')}
            className="w-full h-10 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            View Patent Paper
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatentDetailModal;
