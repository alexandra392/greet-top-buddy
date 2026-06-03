import { useEffect, useMemo, useState } from "react";
import { Sparkles, Sparkle, Bug, Wrench, X, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RELEASE_NOTES, CURRENT_VERSION, type MediaItem, type ReleaseNote } from "@/data/releaseNotes";

const STORAGE_KEY = "vcg.releaseNotes.lastSeenVersion";

function compareVersions(a: string, b: string) {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d !== 0) return d;
  }
  return 0;
}

export function useHasUnseenRelease() {
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  useEffect(() => {
    try {
      setLastSeen(localStorage.getItem(STORAGE_KEY));
    } catch {}
  }, []);
  const hasUnseen = !lastSeen || compareVersions(CURRENT_VERSION, lastSeen) > 0;
  const markSeen = () => {
    try {
      localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
    } catch {}
    setLastSeen(CURRENT_VERSION);
  };
  return { hasUnseen, markSeen };
}

function getYouTubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

function getLoomEmbed(url: string): string | null {
  const m = url.match(/loom\.com\/(?:share|embed)\/([\w-]+)/);
  return m ? `https://www.loom.com/embed/${m[1]}` : null;
}

function MediaBlock({ item, onExpand }: { item: MediaItem; onExpand: (src: string) => void }) {
  if (item.type === "image") {
    return (
      <figure className="rounded-md overflow-hidden border border-border/60 bg-muted/30">
        <button
          type="button"
          onClick={() => onExpand(item.src)}
          className="block w-full hover:opacity-90 transition-opacity"
        >
          <img src={item.src} alt={item.alt ?? ""} className="w-full h-auto object-cover" />
        </button>
        {item.caption && (
          <figcaption className="px-3 py-1.5 text-[11px] text-muted-foreground">{item.caption}</figcaption>
        )}
      </figure>
    );
  }

  const yt = getYouTubeEmbed(item.src);
  const loom = getLoomEmbed(item.src);
  const embed = yt || loom;

  return (
    <figure className="rounded-md overflow-hidden border border-border/60 bg-muted/30">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        {embed ? (
          <iframe
            src={embed}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={item.caption ?? "Release video"}
          />
        ) : (
          <video src={item.src} controls className="absolute inset-0 h-full w-full bg-black" />
        )}
      </div>
      {item.caption && (
        <figcaption className="px-2 py-1.5 text-[11px] text-muted-foreground">{item.caption}</figcaption>
      )}
    </figure>
  );
}

function ChangeGroup({
  icon: Icon,
  label,
  items,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  items: string[];
  tone: "primary" | "amber" | "blue";
}) {
  if (!items?.length) return null;
  const toneClass = {
    primary: "text-primary",
    amber: "text-amber-600",
    blue: "text-blue-600",
  }[tone];
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className={cn("w-3.5 h-3.5", toneClass)} />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      </div>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="text-[13px] text-foreground/90 flex gap-2.5 leading-relaxed">
            <span className={cn("mt-1.5 h-1 w-1 rounded-full shrink-0", {
              "bg-primary": tone === "primary",
              "bg-blue-500": tone === "blue",
              "bg-amber-500": tone === "amber",
            })} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReleaseEntry({ note, isCurrent, onExpand }: { note: ReleaseNote; isCurrent: boolean; onExpand: (src: string) => void }) {
  const hero = note.media?.[0];
  const restMedia = (note.media ?? []).slice(1);
  return (
    <article className="rounded-xl bg-card overflow-hidden">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/85 px-5 pt-6 pb-5 text-primary-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, hsl(0 0% 100%) 0, transparent 40%), radial-gradient(circle at 80% 80%, hsl(0 0% 100%) 0, transparent 45%)",
          }}
        />
        <div className="relative">
          <div className="flex items-center justify-center gap-1.5 mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/80">
            <Sparkles className="w-3 h-3" />
            <span>Release Highlight</span>
          </div>
          <h2 className="text-center text-base sm:text-lg font-semibold leading-snug max-w-md mx-auto">
            {note.title ?? `Release v${note.version}`}
          </h2>
          {hero && hero.type === "image" && (
            <div className="mt-5">
              <button
                type="button"
                onClick={() => onExpand(hero.src)}
                className="block w-full rounded-lg overflow-hidden ring-1 ring-primary-foreground/20 shadow-lg bg-card hover:opacity-95 transition-opacity"
              >
                <img src={hero.src} alt={hero.alt ?? ""} className="w-full h-44 sm:h-52 object-cover" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pt-5 pb-1 space-y-4">
        {note.title && !hero && (
          <h3 className="text-sm font-semibold leading-snug">{note.title}</h3>
        )}
        <div className="space-y-3 divide-y divide-border/60 [&>*+*]:pt-3">
          <ChangeGroup icon={Sparkle} label="New Features" items={note.features ?? []} tone="primary" />
          <ChangeGroup icon={Wrench} label="Improvements" items={note.improvements ?? []} tone="blue" />
          <ChangeGroup icon={Bug} label="Bug Fixes" items={note.fixes ?? []} tone="amber" />
        </div>
        {(restMedia.length > 0 || (hero && hero.type !== "image")) && (
          <div className="space-y-2 pt-2">
            {hero && hero.type !== "image" && <MediaBlock item={hero} onExpand={onExpand} />}
            {restMedia.map((m, i) => (
              <MediaBlock key={i} item={m} onExpand={onExpand} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export function ReleaseNotesModal({
  open,
  onOpenChange,
  version,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  version?: string | null;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const notes = version
    ? RELEASE_NOTES.filter((n) => n.version === version)
    : RELEASE_NOTES;
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-xl p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60 bg-card/60">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <DialogTitle className="text-base">What's New</DialogTitle>
            </div>
            {version && notes[0] ? (
              <div className="flex items-center gap-2 mt-1.5">
                {notes[0].version === CURRENT_VERSION && (
                  <Badge
                    variant="outline"
                    className="rounded-full border-primary/30 bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5"
                  >
                    Latest
                  </Badge>
                )}
                <DialogDescription className="text-xs m-0">
                  {new Date(notes[0].date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })} · v{notes[0].version}
                </DialogDescription>
              </div>
            ) : (
              <DialogDescription className="text-xs mt-1">
                Recent updates, improvements, and fixes to the platform.
              </DialogDescription>
            )}
          </div>
          <div className="max-h-[70vh] overflow-y-auto px-5 py-5 space-y-5 bg-background">
            {notes.map((note) => (
              <ReleaseEntry
                key={note.version}
                note={note}
                isCurrent={note.version === CURRENT_VERSION}
                onExpand={setExpanded}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!expanded} onOpenChange={(v) => !v && setExpanded(null)}>
        <DialogContent className="max-w-4xl p-2 bg-transparent border-0 shadow-none">
          <DialogTitle className="sr-only">Image preview</DialogTitle>
          {expanded && (
            <img src={expanded} alt="" className="w-full h-auto rounded-md" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
