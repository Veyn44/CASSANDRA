export const MODULES = [
  { id: "MOD0002", legacyId: "resonance-core", name: "Resonance Core (RC)", category: "core", w: 2, h: 2, description: "Central resonance propulsion and energy interface. Exposed to vacuum.", function: "Resonance propulsion · energy interface", asset: "assets/modules/power/MOD0002.png" }
];

export const MODULE_BY_ID = Object.freeze(Object.fromEntries(MODULES.map(module => [module.id, module])));
export const MODULE_BY_LEGACY_ID = Object.freeze(Object.fromEntries(MODULES.map(module => [module.legacyId, module])));

export function getModule(id) {
  return MODULE_BY_ID[id] ?? MODULE_BY_LEGACY_ID[id] ?? null;
}
