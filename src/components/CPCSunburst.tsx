import React, { useMemo } from 'react';
import { CPCHierarchy, shadeHsl } from '@/lib/cpcMock';

interface CPCSunburstProps {
  hierarchy: CPCHierarchy;
  selectedSection?: string;
  selectedClass?: string;
  onSelectSection?: (code: string) => void;
  onSelectClass?: (code: string) => void;
  onSelectSubclass?: (code: string) => void;
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
  // Full circle workaround
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

const CPCSunburst: React.FC<CPCSunburstProps> = ({
  hierarchy,
  selectedSection,
  selectedClass,
  onSelectSection,
  onSelectClass,
  onSelectSubclass,
  size = 280,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const innerR = 30;
  const r1 = 64;  // sections
  const r2 = 100; // classes
  const r3 = 134; // subclasses

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
    if (!selectedSection && !selectedClass) return false;
    if (selectedClass) return a.parentClass !== selectedClass && a.code !== selectedClass && !(a.level === 'section' && a.code === selectedSection);
    if (selectedSection) return a.parentSection !== selectedSection;
    return false;
  };

  const handleClick = (a: ArcSpec) => {
    if (a.level === 'section') onSelectSection?.(a.code);
    else if (a.level === 'class') onSelectClass?.(a.code);
    else onSelectSubclass?.(a.code);
  };

  const centerLabel = selectedClass
    ? selectedClass
    : selectedSection
    ? selectedSection
    : hierarchy.totalPatents.toString();
  const centerSub = selectedClass || selectedSection ? 'CPC' : 'patents';

  return (
    <div className="flex items-center justify-center">
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
              className="cursor-pointer transition-opacity hover:opacity-100"
              onClick={() => handleClick(a)}
            >
              <title>{`${a.code} – ${a.name} (${a.count})`}</title>
            </path>
          );
        })}
        {/* Center disc */}
        <circle cx={cx} cy={cy} r={innerR} fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth={1} />
        <text x={cx} y={cy - 2} textAnchor="middle" className="fill-foreground" style={{ fontSize: 14, fontWeight: 700 }}>
          {centerLabel}
        </text>
        <text x={cx} y={cy + 11} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {centerSub}
        </text>
      </svg>
    </div>
  );
};

export default CPCSunburst;
