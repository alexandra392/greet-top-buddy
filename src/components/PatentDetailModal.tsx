import React from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Hash, Calendar, Building2, ArrowLeft, ExternalLink, ChevronRight } from "lucide-react";

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

// Deterministic mock patent ID from title
const mockPatentId = (title: string) => {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) | 0;
  const n = Math.abs(h) % 90000000 + 10000000;
  const letters = ['A1', 'B1', 'B2', 'A2'];
  return `CN-${n}-${letters[Math.abs(h) % letters.length]}`;
};

// CPC hierarchy lookup (minimal)
const CPC_HIERARCHY: Record<string, { name: string; classes: Record<string, { name: string; subs: Record<string, string> }> }> = {
  C: {
    name: 'Chemistry; Metallurgy',
    classes: {
      C12: {
        name: 'Biochemistry; Microbiology; Enzymology',
        subs: { C12P: 'Fermentation or enzymatic processes for chemical synthesis', C12N: 'Microorganisms or enzymes; compositions thereof' },
      },
      C08: {
        name: 'Organic macromolecular compounds',
        subs: { C08L: 'Compositions of macromolecular compounds', C08J: 'Working-up of macromolecular substances' },
      },
      C07: {
        name: 'Organic chemistry',
        subs: { C07C: 'Acyclic or carbocyclic compounds', C07K: 'Peptides' },
      },
    },
  },
  A: {
    name: 'Human Necessities',
    classes: {
      A23: { name: 'Foods or foodstuffs', subs: { A23L: 'Foods, foodstuffs or non-alcoholic beverages' } },
    },
  },
  B: {
    name: 'Performing Operations; Transporting',
    classes: {
      B01: { name: 'Physical or chemical processes or apparatus', subs: { B01J: 'Chemical or physical processes' } },
    },
  },
};

const parseCpc = (code: string) => {
  // e.g. "C12P 1/2" → section C, class C12, subclass C12P
  const m = code.match(/^([A-Z])(\d{2})?([A-Z])?/);
  if (!m) return null;
  const section = m[1];
  const klass = m[2] ? section + m[2] : '';
  const sub = m[3] ? klass + m[3] : '';
  return { section, klass, sub, full: code };
};

const PatentDetailModal = ({ open, onOpenChange, patent, topic = 'Lactic Acid', onBack }: PatentDetailModalProps) => {
  if (!patent) return null;

  const patentId = patent.patentId || mockPatentId(patent.title);
  const cpcCode = (patent.cpcCodes && patent.cpcCodes[0]) || 'C12P 1/2';
  const parsed = parseCpc(cpcCode);

  const sectionInfo = parsed ? CPC_HIERARCHY[parsed.section] : null;
  const classInfo = sectionInfo && parsed?.klass ? sectionInfo.classes[parsed.klass] : null;
  const subName = classInfo && parsed?.sub ? classInfo.subs[parsed.sub] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px] p-0 gap-0 max-h-[85vh] overflow-hidden flex flex-col">
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
            <DialogTitle className="text-sm font-semibold text-foreground leading-snug flex-1">
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
              <p className="text-[11px] font-semibold text-foreground flex items-center gap-1 font-mono">
                <Hash className="w-3 h-3 text-muted-foreground" />
                {patentId}
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-1">Applicant</p>
              <p className="text-[11px] font-semibold text-foreground flex items-center gap-1">
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
                <p className="text-[11px] font-semibold text-primary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Granted
                </p>
              ) : (
                <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                  Filed
                </p>
              )}
            </div>
            <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-1">Filing Year</p>
              <p className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                {patent.filingYear}
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider mb-1">Granted Year</p>
              <p className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                {patent.grantedYear || '—'}
              </p>
            </div>
          </div>

          {/* CPC Classification */}
          {parsed && (
            <div className="bg-muted/30 rounded-lg p-2.5 border border-border/40">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[8px] text-muted-foreground uppercase tracking-wider">CPC Classification</p>
                <p className="text-[8px] text-muted-foreground">Section › Class › Subclass</p>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 flex-wrap text-left hover:bg-background/60 rounded px-1 py-0.5 -mx-1 transition-colors">
                    <span className="text-[10px] font-mono font-semibold text-foreground">{parsed.section}</span>
                    {parsed.klass && (
                      <>
                        <ChevronRight className="w-2.5 h-2.5 text-muted-foreground" />
                        <span className="text-[10px] font-mono font-semibold text-foreground">{parsed.klass}</span>
                      </>
                    )}
                    {parsed.sub && (
                      <>
                        <ChevronRight className="w-2.5 h-2.5 text-muted-foreground" />
                        <span className="text-[10px] font-mono font-semibold text-primary">{parsed.sub}</span>
                      </>
                    )}
                    {sectionInfo && (
                      <>
                        <span className="text-muted-foreground/40 mx-0.5">·</span>
                        <span className="text-[10px] text-muted-foreground truncate">{subName || classInfo?.name || sectionInfo.name}</span>
                      </>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[360px] p-3 z-[100]" align="start">
                  <div className="space-y-2">
                    {sectionInfo && (
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-mono font-semibold text-foreground w-10 flex-shrink-0">{parsed.section}</span>
                        <span className="text-[10px] text-foreground">{sectionInfo.name}</span>
                      </div>
                    )}
                    {classInfo && (
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-mono font-semibold text-foreground w-10 flex-shrink-0">{parsed.klass}</span>
                        <span className="text-[10px] text-foreground">{classInfo.name}</span>
                      </div>
                    )}
                    {subName && (
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-mono font-semibold text-primary w-10 flex-shrink-0">{parsed.sub}</span>
                        <span className="text-[10px] text-foreground">{subName}</span>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="px-4 py-3 border-t border-border flex-shrink-0">
          <button
            type="button"
            onClick={() => window.open(`https://patents.google.com/?q=${encodeURIComponent(patent.title)}`, '_blank', 'noopener')}
            className="w-full h-9 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            View Patent Paper
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatentDetailModal;
