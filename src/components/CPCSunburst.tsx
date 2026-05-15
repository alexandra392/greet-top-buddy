import React, { useMemo, useState } from 'react';
import { Award } from 'lucide-react';
import { CPCHierarchy, shadeHsl } from '@/lib/cpcMock';

interface CPCSunburstProps {
  hierarchy: CPCHierarchy;
  onOpenSlice?: (level: 'section' | 'class' | 'subclass', code: string) => void;
  size?: number;
}

interface ArcSpec {
  level: 'section' | 'class' | 'subclass';
  code: string;
  name: string;
  count: number;
  start: number;
  end: number;
  color: string;
  parentSection: string;
  parentClass?: string;
}

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
};

const arcPath = (cx: number, cy: number, rIn: number, rOut: number, a0: number, a1: number) => {
  const sweep = a1 - a0;
  if (sweep <= 0.0001) return '';
  const large = sweep > 180 ? 1 : 0;
  if (sweep >= 359.999) {
    const [x1, y1] = polar(cx, cy, rOut, 0);
    const [x2, y2] = polar(cx, cy, rOut, 180);
    const [x3, y3] = polar(cx, cy, rIn, 180);
    const [x4, y4] = polar(cx, cy, rIn, 0);
    return `M ${x1} ${y1} A ${rOut} ${rOut} 0 1 1 ${x2} ${y2} A ${rOut} ${rOut} 0 1 1 ${x1} ${y1} M ${x4} ${y4} A ${rIn} ${rIn} 0 1 0 ${x3} ${y3} A ${rIn} ${rIn} 0 1 0 ${x4} ${y4} Z`;
  }
  const [x1, y1] = polar(cx, cy, rOut, a0);
  const [x2, y2] = polar(cx, cy, rOut, a1);
  const [x3, y3] = polar(cx, cy, rIn, a1);
  const [x4, y4] = polar(cx, cy, rIn, a0);
  return `M ${x1} ${y1} A ${rOut} ${rOut} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 ${large} 0 ${x4} ${y4} Z`;
};

const CPCSunburst: React.FC<CPCSunburstProps> = ({ hierarchy, onOpenSlice, size = 280 }) => {
  const cx = size / 2;
  const cy = size / 2;
  const innerR = 22;
  const r1 = 64;
  const r2 = 100;
  const r3 = 134;

  const [hovered, setHovered] = useState<ArcSpec | null>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const arcs = useMemo<ArcSpec[]>(() => {
    const total = hierarchy.totalAssignments || 1;
    const out: ArcSpec[] = [];
    let cursor = 0;
    for (const sec of hierarchy.sections) {
      const secStart = cursor;
      const secSpan = (sec.count / total) * 360;
      const secEnd = secStart + secSpan;
      out.push({
        level: 'section', code: sec.code, name: sec.name, count: sec.count,
        start: secStart, end: secEnd, color: sec.color, parentSection: sec.code,
      });
      let classCursor = secStart;
      for (const cls of sec.classes) {
        const clsSpan = sec.count > 0 ? (cls.count / sec.count) * secSpan : 0;
        const clsStart = classCursor;
        const clsEnd = clsStart + clsSpan;
        out.push({
          level: 'class', code: cls.code, name: cls.name, count: cls.count,
          start: clsStart, end: clsEnd, color: shadeHsl(sec.color, 8, -10),
          parentSection: sec.code, parentClass: cls.code,
        });
        let subCursor = clsStart;
        for (const sub of cls.subclasses) {
          const subSpan = cls.count > 0 ? (sub.count / cls.count) * clsSpan : 0;
          out.push({
            level: 'subclass', code: sub.code, name: sub.name, count: sub.count,
            start: subCursor, end: subCursor + subSpan,
            color: shadeHsl(sec.color, 18, -20),
            parentSection: sec.code, parentClass: cls.code,
          });
          subCursor += subSpan;
        }
        classCursor = clsEnd;
      }
      cursor = secEnd;
    }
    return out;
  }, [hierarchy]);

  const isDimmed = (a: ArcSpec) => {
    if (!hovered) return false;
    return !(a.level === hovered.level && a.code === hovered.code);
  };

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseMove={(e) => {
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseLeave={() => setHovered(null)}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((a, i) => {
          const radii = a.level === 'section'
            ? [innerR, r1]
            : a.level === 'class'
            ? [r1 + 1, r2]
            : [r2 + 1, r3];
          const path = arcPath(cx, cy, radii[0], radii[1], a.start, a.end);
          if (!path) return null;
          const dim = isDimmed(a);
          return (
            <path
              key={`${a.level}-${a.code}-${i}`}
              d={path}
              fill={a.color}
              stroke="hsl(var(--background))"
              strokeWidth={1}
              opacity={dim ? 0.18 : 0.92}
              className="cursor-pointer transition-opacity"
              onMouseEnter={() => setHovered(a)}
              onClick={() => onOpenSlice?.(a.level, a.code)}
            />
          );
        })}
        
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute z-20 rounded-lg bg-foreground text-background px-3 py-2 shadow-xl min-w-[180px] max-w-[240px]"
          style={{
            left: Math.min(mouse.x + 14, size - 200),
            top: Math.max(mouse.y - 60, 0),
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: hovered.color }} />
            <span className="text-[11px] font-mono font-bold">{hovered.code}</span>
            <span className="text-[8px] uppercase tracking-wider opacity-60 ml-auto">{hovered.level}</span>
          </div>
          <div className="text-[10px] uppercase tracking-wider opacity-90 leading-tight mb-1.5 line-clamp-2">{hovered.name}</div>
          <div className="flex items-center gap-1.5 mb-1">
            <Award className="w-3 h-3 opacity-70" />
            <span className="text-[12px] font-semibold tabular-nums">{hovered.count.toLocaleString()}</span>
            <span className="text-[9px] opacity-60">patents</span>
          </div>
          <div className="text-[9px] opacity-60 mt-1">Click to view patents</div>
        </div>
      )}
    </div>
  );
};

export default CPCSunburst;
