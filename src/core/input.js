export function bindInput(canvas, state, renderer, refresh) {
  let dragging = false;
  let last = null;
  function screenToGrid(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const view = renderer.getView();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    const size = state.map.tileSize * state.camera.zoom;
    return {
      x: Math.floor(state.camera.x + (sx - view.width / 2) / size),
      y: Math.floor(state.camera.y + (sy - view.height / 2) / size)
    };
  }
  canvas.addEventListener("pointerdown", event => {
    if (event.button === 1 || event.button === 2) {
      dragging = true;
      last = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
      event.preventDefault();
    }
  });
  canvas.addEventListener("pointermove", event => {
    if (!dragging || !last) return;
    const size = state.map.tileSize * state.camera.zoom;
    state.camera.x -= (event.clientX - last.x) / size;
    state.camera.y -= (event.clientY - last.y) / size;
    last = { x: event.clientX, y: event.clientY };
    renderer.draw();
  });
  canvas.addEventListener("pointerup", () => { dragging = false; last = null; });
  canvas.addEventListener("contextmenu", event => event.preventDefault());
  canvas.addEventListener("click", event => {
    if (event.button !== 0) return;
    const tile = screenToGrid(event.clientX, event.clientY);
    if (tile.x < 0 || tile.y < 0 || tile.x >= state.map.width || tile.y >= state.map.height) return;
    const dx = tile.x - state.pawn.x;
    const dy = tile.y - state.pawn.y;
    if (Math.abs(dx) + Math.abs(dy) === 0) {
      state.pawn.selected = true;
    } else {
      // First prototype: direct one-tile movement only, preserving the grid-based movement model.
      if (Math.abs(dx) + Math.abs(dy) === 1 && tile.x >= 18 && tile.x < 46 && tile.y >= 20 && tile.y < 44) {
        state.pawn.x = tile.x;
        state.pawn.y = tile.y;
      }
    }
    refresh();
  });
  canvas.addEventListener("wheel", event => {
    event.preventDefault();
    state.camera.zoom = Math.max(.55, Math.min(1.8, state.camera.zoom * (event.deltaY < 0 ? 1.1 : .9)));
    renderer.draw();
  }, { passive: false });
  window.addEventListener("keydown", event => {
    const keys = { ArrowUp: [0,-1], w: [0,-1], ArrowDown: [0,1], s: [0,1], ArrowLeft: [-1,0], a: [-1,0], ArrowRight: [1,0], d: [1,0] };
    const move = keys[event.key];
    if (!move || event.target instanceof HTMLInputElement) return;
    event.preventDefault();
    const x = state.pawn.x + move[0], y = state.pawn.y + move[1];
    if (x >= 18 && x < 46 && y >= 20 && y < 44) {
      state.pawn.x = x;
      state.pawn.y = y;
      refresh();
    }
  });
}
