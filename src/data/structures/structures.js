const base = { stats: {}, attributes: {}, requirements: {}, systems: {}, defaultMaterialFamily: "titanium" };

export const ALUMINIUM_WALL = { id: "STR0006", legacyId: "aluminium-wall", name: "Aluminium Wall", category: "structure", subcategory: "internal-wall", type: "structure", w: 1, h: 1, description: "Thick structural aluminium wall. Integrity is tracked independently from the Hull.", function: "Internal structural wall", placement: "hull", integrityRange: [0, 100], defaultMaterialFamily: "aluminium" };

export const STRUCTURES = [
  { ...base, id: "STR0001", legacyId: "external-frame", name: "External Frame", category: "structure", subcategory: "external-support", type: "structure", w: 1, h: 1, description: "Lightweight external mounting structure. Not a floor or wall.", function: "External equipment support", placement: "external-frame" },
  { ...base, id: "STR0002", legacyId: "airtight-door-1x1", name: "Airtight Door 1×1", category: "access", subcategory: "airtight", type: "door", w: 1, h: 1, description: "Pressure-sealing passage integrated into a wall.", function: "Airtight passage", placement: "wall-opening", airtight: true },
  { ...base, id: "STR0003", legacyId: "airtight-door-2x1", name: "Airtight Door 2×1", category: "access", subcategory: "airtight", type: "door", w: 2, h: 1, description: "Wide pressure-sealing passage integrated into a wall.", function: "Airtight passage", placement: "wall-opening", airtight: true },
  { ...base, id: "STR0004", legacyId: "basic-door-1x1", name: "Basic Door 1×1", category: "access", subcategory: "basic", type: "door", w: 1, h: 1, description: "Basic internal passage integrated into a wall.", function: "Internal passage", placement: "wall-opening", airtight: false },
  { ...base, id: "STR0005", legacyId: "basic-door-2x1", name: "Basic Door 2×1", category: "access", subcategory: "basic", type: "door", w: 2, h: 1, description: "Wide basic internal passage integrated into a wall.", function: "Internal passage", placement: "wall-opening", airtight: false }
];

export const STRUCTURE_BY_ID = Object.freeze(Object.fromEntries(STRUCTURES.map(item => [item.id, item])));
export const STRUCTURE_BY_LEGACY_ID = Object.freeze(Object.fromEntries(STRUCTURES.map(item => [item.legacyId, item])));
export function getStructure(id) { return STRUCTURE_BY_ID[id] ?? STRUCTURE_BY_LEGACY_ID[id] ?? null; }
