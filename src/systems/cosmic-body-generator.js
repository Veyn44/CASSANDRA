const key = (x, y) => x + "," + y;

function createRandom(seed) {
  let state = (Number(seed) >>> 0) || 1;
  return () => {
    state += 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14) >>> 0) >>> 0) / 4294967296;
  };
}

function smoothNoise(random, width, height, scale = 5) {
  const cols = Math.max(2, Math.ceil(width / scale) + 1);
  const rows = Math.max(2, Math.ceil(height / scale) + 1);
  const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, random));
  return (x, y) => {
    const gx = x / scale, gy = y / scale;
    const ix = Math.floor(gx), iy = Math.floor(gy);
    const fx = gx - ix, fy = gy - iy;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = grid[iy][ix] * (1 - sx) + grid[iy][ix + 1] * sx;
    const b = grid[iy + 1][ix] * (1 - sx) + grid[iy + 1][ix + 1] * sx;
    return a * (1 - sy) + b * sy;
  };
}

// Deterministic: identical seed and parameters produce identical cells and interior.
export function generateCosmicBody({
  seed = 1, x = 0, y = 0, width = 70, height = 28,
  roundness = 0.82, irregularity = 0.18, interior = "mixed",
  cavityDensity = 0.035
} = {}) {
  const w = Math.max(3, Math.floor(width));
  const h = Math.max(3, Math.floor(height));
  const random = createRandom(seed);
  const noise = smoothNoise(random, w, h, Math.max(3, Math.min(9, Math.min(w, h) / 3)));
  const cells = [];
  const cellLookup = {};
  const cx = (w - 1) / 2, cy = (h - 1) / 2;
  const rx = Math.max(1, w * 0.5), ry = Math.max(1, h * 0.5);
  const elongation = Math.max(0.45, Math.min(1.8, (w / h) / 2.5 + 0.6));
  const threshold = Math.max(0.35, Math.min(0.98, roundness));
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
    const nx = (xx - cx) / rx, ny = (yy - cy) / ry;
    const radial = Math.sqrt(nx * nx * elongation + ny * ny / elongation);
    const edgeNoise = (noise(xx, yy) - 0.5) * 2 * irregularity;
    if (radial <= threshold + edgeNoise) {
      const cell = { x: x + xx, y: y + yy, materialId: "MAT0001", kind: "solid" };
      cells.push(cell);
      cellLookup[key(cell.x, cell.y)] = cell;
    }
  }

  const body = { id: "AST" + String(seed >>> 0).padStart(4, "0"), seed: Number(seed) >>> 0, x, y, width: w, height: h, cells, outerLookup: { ...cellLookup }, cellLookup, cavities: [] };
  if (interior !== "solid" && cells.length) {
    const target = Math.floor(cells.length * Math.max(0, Math.min(0.2, cavityDensity)));
    const candidates = cells.filter(cell => {
      const dx = cell.x - (x + cx), dy = cell.y - (y + cy);
      return Math.abs(dx) < rx * 0.7 && Math.abs(dy) < ry * 0.7;
    });
    const candidateLookup = Object.fromEntries(candidates.map(cell => [key(cell.x, cell.y), cell]));
    let carved = 0;
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    while (carved < target && candidates.some(cell => cell.kind === "solid")) {
      const start = candidates[Math.floor(random() * candidates.length)];
      if (start.kind === "cavity") continue;
      const frontier = [start];
      while (frontier.length && carved < target) {
        const cell = frontier.shift();
        if (!cell || cell.kind === "cavity") continue;
        cell.kind = "cavity";
        cell.materialId = null;
        body.cavities.push({ x: cell.x, y: cell.y, type: "void" });
        carved++;
        for (const [dx, dy] of directions) {
          const next = candidateLookup[key(cell.x + dx, cell.y + dy)];
          if (next && next.kind === "solid" && random() < 0.72) frontier.push(next);
        }
      }
      if (carved === 0 && candidates.every(cell => cell.kind === "cavity")) break;
    }
  }
  body.cellLookup = Object.fromEntries(cells.filter(cell => cell.kind === "solid").map(cell => [key(cell.x, cell.y), cell]));
  body.solidCells = cells.filter(cell => cell.kind === "solid");
  body.occupiedTileCount = body.solidCells.length;
  body.cavityTileCount = body.cavities.length;
  return body;
}
