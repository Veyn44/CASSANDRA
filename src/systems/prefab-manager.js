import { MODULES, getModule } from "../data/modules/modules.js";
import { STRUCTURES, getStructure } from "../data/structures/structures.js";
import { FURNITURE, getFurniture } from "../data/furniture/furniture.js";

export const PREFABS = [...MODULES, ...STRUCTURES, ...FURNITURE];
export const getBuildable = id => getModule(id) ?? getStructure(id) ?? getFurniture(id);
export function rotateTool(s, step) { s.rotation = (s.rotation + step + 4) % 4; }
export function prefabSize(item, rotation) { return rotation % 2 ? { w: item.h, h: item.w } : { w: item.w, h: item.h }; }

export function validatePrefabPlacement(s, id, x, y, rotation = s.rotation) {
  const item = getBuildable(id);
  if (!item) return { valid: false, message: "UNKNOWN BUILD ITEM" };
  const { w, h } = prefabSize(item, rotation);
  let wallOverlap = 0;
  const objects = Object.values(s.map.objects);
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
    const tx = x + xx, ty = y + yy, k = tx + "," + ty;
    if (tx < 0 || ty < 0 || tx >= 128 || ty >= s.map.height) return { valid: false, message: tx >= 128 ? "SHIP CONSTRUCTION IS LIMITED TO THE LEFT SECTOR" : "OUT OF MAP" };
    const tile = s.map.tiles[k];
    if (objects.some(o => tx >= o.x && ty >= o.y && tx < o.x + o.w && ty < o.y + o.h)) return { valid: false, message: "TILE BLOCKED" };
    if (tile?.wall) wallOverlap++;
    if (item.placement === "wall-opening") {
      if (!tile?.hull || !tile?.wall) return { valid: false, message: "DOORS MUST REPLACE AN EXISTING WALL" };
    } else if (item.placement === "external-frame" || item.placement === "external") {
      if (tile?.hull || tile?.wall) return { valid: false, message: "EXTERNAL EQUIPMENT MUST BE OUTSIDE THE HULL" };
      const adjacentHull = [[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy]) => s.map.tiles[(tx+dx)+","+(ty+dy)]?.hull);
      if (item.placement === "external-frame" && !adjacentHull) return { valid: false, message: "EXTERNAL FRAME MUST TOUCH THE HULL" };
    } else if (!tile?.hull || tile?.wall) return { valid: false, message: "HULL REQUIRED · PLACE ON AN OPEN HULL TILE" };
  }
  if (item.placement === "wall-opening" && wallOverlap !== w * h) return { valid: false, message: "DOORS MUST REPLACE AN EXISTING WALL" };
  if (item.placement === "external" && !objects.some(o => o.type === "STR0001" && x >= o.x && y >= o.y && x + w <= o.x + o.w && y + h <= o.y + o.h)) return { valid: false, message: "SOLAR PANEL REQUIRES AN EXTERNAL FRAME" };
  return { valid: true, message: item.name + " READY", w, h };
}

export function placePrefab(s, id, x, y) {
  const item = getBuildable(id), check = validatePrefabPlacement(s, id, x, y);
  if (!check.valid) return { message: check.message };
  const idValue = "build-" + s.nextObjectId++;
  s.map.objects[idValue] = { id: idValue, type: item.id, family: item.id.slice(0, 3), x, y, w: check.w, h: check.h, rotation: s.rotation, built: false };
  return { message: item.name + " BLUEPRINT PLACED · 1 TITANIUM · 1 AP", objectId: idValue };
}
