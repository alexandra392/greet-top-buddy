// Mock LCA data — EF 3.0 methodology
// All values are illustrative for prototype purposes.

export type LcaStatus = "not_started" | "in_progress" | "completed";

export interface LcaProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string; // emoji placeholder — no asset deps
  functionalUnit: string;
  systemBoundary: "Cradle-to-Gate" | "Cradle-to-Grave" | "Gate-to-Gate";
  status: LcaStatus;
  mass_kg: number;
}

export interface LciFlow {
  stage: "Raw Materials" | "Manufacturing" | "Transport" | "Use" | "End-of-Life";
  flow: string;
  amount: number;
  unit: string;
  source: string;
}

export interface EfImpact {
  category: string;
  unit: string;
  value: number;
  esrs: string; // mapped ESRS E1–E5 indicator
  // contribution by life-cycle stage (sums to ~value)
  byStage: { stage: string; value: number }[];
}

export interface LcaResult {
  productId: string;
  inventory: LciFlow[];
  impacts: EfImpact[];
  dataSources: string[];
}

export const LCA_PRODUCTS: LcaProduct[] = [
  {
    id: "bio-pet-bottle",
    name: "Bio-based PET Bottle (500ml)",
    category: "Packaging",
    description:
      "Single-use beverage bottle produced from 30% bio-based PET resin, blow-moulded in EU plant.",
    image: "🧴",
    functionalUnit: "1 filled & delivered 500 ml bottle",
    systemBoundary: "Cradle-to-Grave",
    status: "completed",
    mass_kg: 0.028,
  },
  {
    id: "recycled-alu-can",
    name: "Recycled Aluminium Can (330ml)",
    category: "Packaging",
    description:
      "Beverage can produced from 75% post-consumer recycled aluminium.",
    image: "🥫",
    functionalUnit: "1 filled 330 ml aluminium can",
    systemBoundary: "Cradle-to-Gate",
    status: "in_progress",
    mass_kg: 0.013,
  },
  {
    id: "biodegradable-cutlery",
    name: "PLA Biodegradable Cutlery Set",
    category: "Foodservice",
    description: "Compostable PLA spoon-fork-knife set, injection moulded.",
    image: "🍴",
    functionalUnit: "1 cutlery set (3 pcs, ~15 g)",
    systemBoundary: "Cradle-to-Grave",
    status: "not_started",
    mass_kg: 0.015,
  },
  {
    id: "ev-battery-cell",
    name: "NMC811 Li-ion Battery Cell",
    category: "Energy Storage",
    description:
      "Pouch cell, 60 Ah, nickel-manganese-cobalt cathode, assembled in EU gigafactory.",
    image: "🔋",
    functionalUnit: "1 kWh of usable cell capacity",
    systemBoundary: "Cradle-to-Gate",
    status: "completed",
    mass_kg: 5.6,
  },
  {
    id: "wind-turbine-blade",
    name: "Glass-Fibre Wind Turbine Blade",
    category: "Renewables",
    description: "65 m onshore wind turbine blade, GFRP and balsa core.",
    image: "🌬️",
    functionalUnit: "1 MWh of electricity delivered",
    systemBoundary: "Cradle-to-Grave",
    status: "in_progress",
    mass_kg: 14000,
  },
  {
    id: "green-hydrogen-kg",
    name: "Green Hydrogen (PEM)",
    category: "Chemicals",
    description: "Hydrogen produced via PEM electrolysis using EU wind power.",
    image: "💨",
    functionalUnit: "1 kg of compressed H₂ at 350 bar",
    systemBoundary: "Cradle-to-Gate",
    status: "not_started",
    mass_kg: 1,
  },
  {
    id: "concrete-low-carbon",
    name: "Low-Carbon CEM III Concrete",
    category: "Construction",
    description: "Ready-mix concrete with 60% GGBS slag substitution.",
    image: "🧱",
    functionalUnit: "1 m³ of cured C30/37 concrete",
    systemBoundary: "Cradle-to-Gate",
    status: "completed",
    mass_kg: 2350,
  },
  {
    id: "cotton-tshirt",
    name: "Organic Cotton T-Shirt",
    category: "Textiles",
    description: "180 g organic cotton t-shirt, dyed and finished in Portugal.",
    image: "👕",
    functionalUnit: "1 garment worn for 50 wash cycles",
    systemBoundary: "Cradle-to-Grave",
    status: "not_started",
    mass_kg: 0.18,
  },
];

const baseImpactDefs: Omit<EfImpact, "value" | "byStage">[] = [
  { category: "Climate Change", unit: "kg CO₂ eq", esrs: "ESRS E1 — Climate change" },
  { category: "Acidification", unit: "mol H⁺ eq", esrs: "ESRS E2 — Pollution (air)" },
  { category: "Eutrophication, freshwater", unit: "kg P eq", esrs: "ESRS E2 — Pollution (water)" },
  { category: "Water Use", unit: "m³ depriv.", esrs: "ESRS E3 — Water & marine resources" },
  { category: "Resource Use, fossils", unit: "MJ", esrs: "ESRS E5 — Resource use & circular economy" },
  { category: "Resource Use, minerals & metals", unit: "kg Sb eq", esrs: "ESRS E5 — Resource use & circular economy" },
  { category: "Ozone Depletion", unit: "kg CFC-11 eq", esrs: "ESRS E2 — Pollution" },
  { category: "Land Use", unit: "Pt", esrs: "ESRS E4 — Biodiversity & ecosystems" },
];

// deterministic pseudo-results per product
function buildImpacts(seed: number): EfImpact[] {
  const stages = ["Raw Materials", "Manufacturing", "Transport", "Use", "End-of-Life"];
  return baseImpactDefs.map((d, i) => {
    const base = ((seed * (i + 3)) % 97) + 5;
    const factor = [10, 0.4, 0.002, 0.6, 80, 0.0008, 0.00000002, 0.5][i];
    const value = +(base * factor).toPrecision(3);
    // distribute across stages with varying weights
    const weights = [0.35, 0.28, 0.12, 0.18, 0.07].map(
      (w, j) => w * (0.8 + ((seed * (j + 1) * (i + 1)) % 40) / 100)
    );
    const total = weights.reduce((a, b) => a + b, 0);
    const byStage = stages.map((s, j) => ({
      stage: s,
      value: +((value * weights[j]) / total).toPrecision(3),
    }));
    return { ...d, value, byStage };
  });
}

function buildInventory(p: LcaProduct): LciFlow[] {
  return [
    { stage: "Raw Materials", flow: "Primary resin / feedstock", amount: p.mass_kg * 1.05, unit: "kg", source: "ecoinvent 3.10" },
    { stage: "Raw Materials", flow: "Process water", amount: +(p.mass_kg * 12).toFixed(2), unit: "L", source: "Supplier EPD" },
    { stage: "Manufacturing", flow: "Electricity (EU grid)", amount: +(p.mass_kg * 8.2).toFixed(2), unit: "kWh", source: "ecoinvent 3.10" },
    { stage: "Manufacturing", flow: "Natural gas", amount: +(p.mass_kg * 0.6).toFixed(2), unit: "MJ", source: "ecoinvent 3.10" },
    { stage: "Transport", flow: "Truck >32t, EURO 6", amount: +(p.mass_kg * 350).toFixed(0), unit: "tkm", source: "ELCD" },
    { stage: "Use", flow: "Energy in use phase", amount: +(p.mass_kg * 1.4).toFixed(2), unit: "kWh", source: "Primary data" },
    { stage: "End-of-Life", flow: "Recycling credit", amount: +(p.mass_kg * 0.6).toFixed(2), unit: "kg", source: "CFF EF 3.0" },
    { stage: "End-of-Life", flow: "Landfill residual", amount: +(p.mass_kg * 0.2).toFixed(2), unit: "kg", source: "ecoinvent 3.10" },
  ];
}

export function getLcaResult(productId: string): LcaResult {
  const p = LCA_PRODUCTS.find((x) => x.id === productId) ?? LCA_PRODUCTS[0];
  const seed = Array.from(productId).reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    productId: p.id,
    inventory: buildInventory(p),
    impacts: buildImpacts(seed),
    dataSources: ["ecoinvent 3.10", "ELCD", "Supplier EPDs", "Primary plant data (2024)"],
  };
}

export function getProduct(id: string): LcaProduct | undefined {
  return LCA_PRODUCTS.find((p) => p.id === id);
}

export const QUESTIONNAIRE_STEPS = [
  "Product identification",
  "Functional unit",
  "System boundary",
  "Bill of materials",
  "Manufacturing energy",
  "Transport",
  "Use phase",
  "End-of-life",
  "Data quality",
  "Review & submit",
] as const;
