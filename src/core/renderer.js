const COLORS = {
  background: "#0a1119",
  grid: "rgba(117, 145, 163, 0.12)",
  deck: "#182733",
  deckAlt: "#1b2b38",
  hull: "#526b7b",
  pawn: "#e35e68",
  pawnEdge: "#ff9b9e",
  selection: "#d8e9f2"
};

export function createRenderer(canvas, state) {
  const ctx = canvas.getContext("2d");
  const view = { width: 0, height: 0, dpr: 1 };
  function resize() {
    const rect = canvas.getBoundingClientRect();
    view.dpr = Math.min(window.devicePixelRatio || 1, 2);
    view.width = rect.width;
    view.height = rect.height;
    canvas.width = Math.round(rect.width * view.dpr);
    canvas.height = Math.round(rect.height * view.dpr);
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  }
  function worldToScreen(x, y) {
    const size = state.map.tileSize * state.camera.zoom;
    return { x: (x - state.camera.x) * size + view.width / 2, y: (y - state.camera.y) * size + view.height / 2 };
  }
  function draw() {
    const size = state.map.tileSize * state.camera.zoom;
    ctx.clearRect(0, 0, view.width, view.height);
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, view.width, view.height);

    // Subtle distant star points keep the empty space readable without distracting from the ship.
    ctx.fillStyle = "rgba(180, 207, 224, .22)";
    for (let i = 0; i < 90; i++) {
      const x = (i * 197 + 31) % Math.max(1, view.width);
      const y = (i * 113 + 17) % Math.max(1, view.height);
      ctx.fillRect(x, y, 1, 1);
    }

    const left = Math.floor(state.camera.x - view.width / (2 * size)) - 1;
    const right = Math.ceil(state.camera.x + view.width / (2 * size)) + 1;
    const top = Math.floor(state.camera.y - view.height / (2 * size)) - 1;
    const bottom = Math.ceil(state.camera.y + view.height / (2 * size)) + 1;

    // Square logical grid; rendering stays close to top-down, with slight visual depth reserved for later assets.
    for (let y = Math.max(0, top); y < Math.min(state.map.height, bottom); y++) {
      for (let x = Math.max(0, left); x < Math.min(state.map.width, right); x++) {
        const p = worldToScreen(x, y);
        const inShip = x >= 18 && x < 46 && y >= 20 && y < 44;
        if (inShip) {
          ctx.fillStyle = ((x + y) % 2 === 0) ? COLORS.deck : COLORS.deckAlt;
          ctx.fillRect(p.x, p.y, size, size);
          ctx.strokeStyle = COLORS.grid;
          ctx.lineWidth = 1;
          ctx.strokeRect(p.x, p.y, size, size);
        } else {
          ctx.strokeStyle = "rgba(117, 145, 163, 0.07)";
          ctx.lineWidth = 1;
          ctx.strokeRect(p.x, p.y, size, size);
        }
      }
    }

    // Simple ship perimeter placeholder.
    const a = worldToScreen(18, 20);
    const b = worldToScreen(46, 44);
    ctx.strokeStyle = COLORS.hull;
    ctx.lineWidth = Math.max(2, size * .09);
    ctx.strokeRect(a.x + 1, a.y + 1, b.x - a.x - 2, b.y - a.y - 2);

    const pawn = state.pawn;
    const pp = worldToScreen(pawn.x, pawn.y);
    const inset = size * .22;
    if (pawn.selected) {
      ctx.strokeStyle = COLORS.selection;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(pp.x + size * .12, pp.y + size * .12, size * .76, size * .76);
    }
    ctx.fillStyle = COLORS.pawn;
    ctx.fillRect(pp.x + inset, pp.y + inset, size - inset * 2, size - inset * 2);
    ctx.strokeStyle = COLORS.pawnEdge;
    ctx.lineWidth = 1;
    ctx.strokeRect(pp.x + inset, pp.y + inset, size - inset * 2, size - inset * 2);
  }
  resize();
  return { draw, resize, worldToScreen, getView: () => view };
}
