// CPC hierarchy mock data + helpers.
// Section (A–Y) → Class (A01) → Subclass (A01N).
// Patents may belong to multiple subclasses (many-to-many).

export interface CPCPatent {
  id: string;
  title: string;
  company: string;
  filingYear: number;
  grantedYear: number | null;
  status: 'Granted' | 'Filed';
  jurisdiction: number;
  cpcCodes: string[];
  abstract?: string;
}

export interface CPCSubclass { code: string; name: string; count: number; patents: CPCPatent[]; }
export interface CPCClass { code: string; name: string; count: number; subclasses: CPCSubclass[]; }
export interface CPCSection { code: string; name: string; count: number; color: string; classes: CPCClass[]; }
export interface CPCHierarchy { sections: CPCSection[]; totalAssignments: number; totalPatents: number; }

const bgColorMap: Record<string, string> = {
  'bg-purple-500': 'hsl(270, 70%, 60%)',
  'bg-orange-500': 'hsl(25, 95%, 53%)',
  'bg-orange-400': 'hsl(28, 95%, 60%)',
  'bg-pink-500': 'hsl(330, 80%, 60%)',
  'bg-pink-400': 'hsl(330, 80%, 70%)',
  'bg-gray-800': 'hsl(220, 15%, 30%)',
  'bg-blue-500': 'hsl(210, 80%, 55%)',
  'bg-blue-600': 'hsl(220, 80%, 50%)',
  'bg-sky-500': 'hsl(200, 90%, 55%)',
  'bg-cyan-500': 'hsl(185, 80%, 50%)',
  'bg-red-500': 'hsl(0, 80%, 55%)',
  'bg-red-700': 'hsl(0, 70%, 40%)',
  'bg-yellow-500': 'hsl(45, 95%, 55%)',
  'bg-yellow-400': 'hsl(48, 95%, 60%)',
};

type ClassDef = { code: string; name: string; subclasses: { suffix: string; name: string }[] };

const sectionDict: Record<string, ClassDef[]> = {
  A: [
    { code: '01', name: 'Agriculture; Forestry; Animal Husbandry', subclasses: [
      { suffix: 'B', name: 'Soil Working' },
      { suffix: 'C', name: 'Planting; Sowing; Fertilising' },
      { suffix: 'N', name: 'Preservation of Bodies' },
    ]},
    { code: '23', name: 'Foods or Foodstuffs; Treatment Thereof', subclasses: [
      { suffix: 'L', name: 'Foods, Foodstuffs; Preparation' },
      { suffix: 'K', name: 'Meat; Fish' },
    ]},
    { code: '61', name: 'Medical or Veterinary Science; Hygiene', subclasses: [
      { suffix: 'K', name: 'Preparations for Medical Purposes' },
      { suffix: 'P', name: 'Therapeutic Activity of Compounds' },
    ]},
  ],
  B: [
    { code: '01', name: 'Physical or Chemical Processes', subclasses: [
      { suffix: 'D', name: 'Separation' },
      { suffix: 'J', name: 'Catalysts' },
    ]},
    { code: '65', name: 'Conveying; Packaging; Storing', subclasses: [
      { suffix: 'D', name: 'Containers' },
      { suffix: 'G', name: 'Conveying Articles' },
    ]},
  ],
  C: [
    { code: '07', name: 'Organic Chemistry', subclasses: [
      { suffix: 'C', name: 'Acyclic / Carbocyclic Compounds' },
      { suffix: 'D', name: 'Heterocyclic Compounds' },
      { suffix: 'H', name: 'Sugars; Derivatives' },
    ]},
    { code: '12', name: 'Biochemistry; Microbiology', subclasses: [
      { suffix: 'N', name: 'Microorganisms or Enzymes' },
      { suffix: 'P', name: 'Fermentation Processes' },
      { suffix: 'M', name: 'Apparatus for Enzymology' },
    ]},
    { code: '08', name: 'Organic Macromolecular Compounds', subclasses: [
      { suffix: 'F', name: 'Macromolecular Compounds' },
      { suffix: 'L', name: 'Compositions of Polymers' },
    ]},
  ],
  D: [
    { code: '21', name: 'Paper Making; Cellulose', subclasses: [
      { suffix: 'C', name: 'Pulp Production' },
      { suffix: 'H', name: 'Paper Sheet Manufacture' },
    ]},
  ],
  E: [
    { code: '04', name: 'Building', subclasses: [{ suffix: 'B', name: 'General Building Constructions' }] },
  ],
  F: [
    { code: '23', name: 'Combustion Apparatus; Processes', subclasses: [
      { suffix: 'B', name: 'Solid Fuel Combustion' },
      { suffix: 'G', name: 'Boilers' },
    ]},
    { code: '26', name: 'Drying', subclasses: [{ suffix: 'B', name: 'Drying Processes' }] },
  ],
  G: [
    { code: '01', name: 'Measuring; Testing', subclasses: [
      { suffix: 'N', name: 'Investigating Materials' },
      { suffix: 'J', name: 'Spectrometric Analysis' },
    ]},
    { code: '06', name: 'Computing; Calculating', subclasses: [{ suffix: 'N', name: 'Computer Systems' }] },
  ],
  H: [
    { code: '01', name: 'Basic Electric Elements', subclasses: [{ suffix: 'M', name: 'Batteries; Fuel Cells' }] },
    { code: '02', name: 'Generation of Electric Power', subclasses: [{ suffix: 'J', name: 'Power Conversion' }] },
  ],
  Y: [
    { code: '02', name: 'Climate Change Mitigation Technologies', subclasses: [
      { suffix: 'E', name: 'Energy Generation' },
      { suffix: 'P', name: 'Production of Goods' },
    ]},
  ],
};

const distribute = (total: number, n: number): number[] => {
  if (n === 0) return [];
  if (total === 0) return new Array(n).fill(0);
  const w = Array.from({ length: n }, (_, i) => 1 / (i + 1));
  const sw = w.reduce((a, b) => a + b, 0);
  const raw = w.map(x => (x / sw) * total);
  const f = raw.map(x => Math.max(1, Math.floor(x)));
  let r = total - f.reduce((a, b) => a + b, 0);
  for (let i = 0; i < f.length && r > 0; i++) { f[i] += 1; r--; }
  for (let i = 0; i < f.length && r < 0; i++) { if (f[i] > 1) { f[i] -= 1; r++; } }
  return f;
};

export function buildCPCHierarchy(
  cpcData: Array<{ code: string; name: string; count: number; color: string }>,
  topic: string,
): CPCHierarchy {
  const sections: CPCSection[] = cpcData.map(s => {
    const color = bgColorMap[s.color] || 'hsl(var(--primary))';
    const defs = sectionDict[s.code] || [{ code: '00', name: s.name, subclasses: [{ suffix: 'A', name: 'General' }] }];
    const classCounts = distribute(s.count, defs.length);
    const classes: CPCClass[] = defs.map((d, i) => {
      const subCounts = distribute(classCounts[i], d.subclasses.length);
      const subclasses: CPCSubclass[] = d.subclasses.map((sd, j) => ({
        code: `${s.code}${d.code}${sd.suffix}`,
        name: sd.name,
        count: subCounts[j],
        patents: [],
      }));
      return { code: `${s.code}${d.code}`, name: d.name, count: classCounts[i], subclasses };
    });
    return { code: s.code, name: s.name, count: s.count, color, classes };
  });

  const allSubs = sections.flatMap(s => s.classes.flatMap(c => c.subclasses));
  const totalAssignments = allSubs.reduce((a, b) => a + b.count, 0);
  const uniquePatentCount = Math.max(allSubs.length, Math.round(totalAssignments * 0.7));

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
    `Waste Valorisation Process for ${topic} By-Products`,
    `Scalable ${topic} Production from Lignocellulosic Biomass`,
  ];
  const companies = ['Innov8 BioTech', 'GreenChem AG', 'BioFuture Corp', 'NovaSynth', 'CircularLab', 'Pure Process GmbH', 'Novozymes A/S', 'BASF SE'];

  const pool: CPCPatent[] = Array.from({ length: uniquePatentCount }, (_, i) => {
    const isGranted = i % 3 !== 0;
    const filingYear = 2018 + (i % 6);
    return {
      id: `P-${(i + 1).toString().padStart(4, '0')}`,
      title: titles[i % titles.length] + (i >= titles.length ? ` (Variant ${Math.floor(i / titles.length) + 1})` : ''),
      company: companies[i % companies.length],
      filingYear,
      grantedYear: isGranted ? filingYear + 1 + (i % 2) : null,
      status: isGranted ? 'Granted' : 'Filed',
      jurisdiction: 3 + ((i * 3) % 12),
      cpcCodes: [],
      abstract: `This invention relates to ${titles[i % titles.length].toLowerCase()}, providing improvements in efficiency and sustainability for ${topic.toLowerCase()} production.`,
    };
  });

  let cursor = 0;
  for (const sub of allSubs) {
    let attempts = 0;
    while (sub.patents.length < sub.count && attempts < pool.length * 2) {
      const p = pool[cursor % pool.length];
      cursor++;
      attempts++;
      if (!sub.patents.includes(p)) {
        sub.patents.push(p);
        if (!p.cpcCodes.includes(sub.code)) p.cpcCodes.push(sub.code);
      }
    }
  }

  return { sections, totalAssignments, totalPatents: pool.length };
}

export function patentsForClass(c: CPCClass): CPCPatent[] {
  const set = new Set<CPCPatent>();
  c.subclasses.forEach(sub => sub.patents.forEach(p => set.add(p)));
  return Array.from(set);
}

export function patentsForSection(s: CPCSection): CPCPatent[] {
  const set = new Set<CPCPatent>();
  s.classes.forEach(c => c.subclasses.forEach(sub => sub.patents.forEach(p => set.add(p))));
  return Array.from(set);
}

// HSL helpers for shading classes/subclasses from a section's base color
export function shadeHsl(hsl: string, lightnessDelta: number, saturationDelta = 0): string {
  const m = hsl.match(/hsl\((-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)%,\s*(-?\d+(?:\.\d+)?)%\)/);
  if (!m) return hsl;
  const h = parseFloat(m[1]);
  const s = Math.min(100, Math.max(0, parseFloat(m[2]) + saturationDelta));
  const l = Math.min(92, Math.max(15, parseFloat(m[3]) + lightnessDelta));
  return `hsl(${h}, ${s}%, ${l}%)`;
}
