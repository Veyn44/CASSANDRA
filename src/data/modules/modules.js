export const MODULES = [
  { id: "MOD0001", legacyId: "command", name: "Command & Navigation Unit", category: "core", w: 2, h: 1, description: "Navigation, current star system, ship status and mission overview.", function: "Command interface · future system", asset: "assets/modules/core/MOD0001.png" },
  { id: "MOD0002", legacyId: "reactor", name: "Resonance Fusion Core", category: "power", w: 2, h: 2, description: "Energy generation and artificial gravity.", function: "Power and artificial gravity", asset: "assets/modules/power/MOD0002.png" },
  { id: "MOD0003", legacyId: "engine", name: "Resonance Drive", category: "propulsion", w: 3, h: 1, description: "External propulsion module. At least one tile must overlap the connected hull; remaining section extends beyond the ship and can be damaged.", function: "Interstellar propulsion · exposed to external damage", edge: true, asset: "assets/modules/propulsion/MOD0003.png" },
  { id: "MOD0004", legacyId: "hydroponics", name: "Hydroponics", category: "food", w: 3, h: 1, description: "Compact food production module.", function: "Food production", asset: "assets/modules/food/MOD0004.png" },
  { id: "MOD0005", legacyId: "water-tank", name: "Water Tank", category: "storage", w: 1, h: 1, description: "Stores recovered water and ice. Water and ice are routed here before electrolysis.", function: "Water storage", asset: "assets/modules/storage/MOD0005.png" },
  { id: "MOD0006", legacyId: "hydrogen-tank", name: "Hydrogen Tank", category: "storage", w: 1, h: 1, description: "Stores hydrogen produced by electrolysis. Hydrogen is consumed for interstellar jumps and may have a small passive standby drain.", function: "Hydrogen fuel storage", asset: "assets/modules/storage/MOD0006.png" },
  { id: "MOD0007", legacyId: "electrolyzer", name: "Electrolyzer", category: "production", w: 1, h: 1, description: "Splits water into oxygen for life support and hydrogen for the drive.", function: "Water processing", asset: "assets/modules/production/MOD0007.png" },
  { id: "MOD0008", legacyId: "research", name: "Research Workbench", category: "research", w: 2, h: 1, description: "Sample analysis, materials research and experiments.", function: "Research and analysis", asset: "assets/modules/research/MOD0008.png" },
  { id: "MOD0009", legacyId: "bunk", name: "Personal Bunk", category: "crew", w: 2, h: 1, description: "Crew sleeping and recovery space.", function: "Rest and recovery", asset: "assets/modules/crew/MOD0009.png" },
  { id: "MOD0010", legacyId: "suit-rack", name: "Powered Suit Dock", category: "crew", w: 1, h: 1, description: "The researcher docks into the powered suit. It attaches around the pawn; it is not a changing room.", function: "Suit-up / suit removal", asset: "assets/modules/crew/MOD0010.png" },
  { id: "MOD0011", legacyId: "storage", name: "Material Storage", category: "storage", w: 2, h: 1, description: "Shared material storage. Each unit has 100 capacity for non-water materials.", function: "Shared material inventory · capacity 100", asset: "assets/modules/storage/MOD0011.png" },
  { id: "MOD0012", legacyId: "door-wide", name: "Wide Bulkhead Door", category: "doors", w: 2, h: 1, description: "Two-tile sliding door for ship compartments and the airlock.", function: "Passage / pressure boundary", asset: "assets/modules/doors/MOD0012.png" },
  { id: "MOD0013", legacyId: "door-single", name: "Single Bulkhead Door", category: "doors", w: 1, h: 1, description: "Compact single-tile sliding door.", function: "Passage / pressure boundary", asset: "assets/modules/doors/MOD0013.png" }
];

export const MODULE_BY_ID = Object.freeze(Object.fromEntries(MODULES.map(module => [module.id, module])));
export const MODULE_BY_LEGACY_ID = Object.freeze(Object.fromEntries(MODULES.map(module => [module.legacyId, module])));

export function getModule(id) {
  return MODULE_BY_ID[id] ?? MODULE_BY_LEGACY_ID[id] ?? null;
}
