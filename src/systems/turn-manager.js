export function createInitialState() {
  return {
    turn: 1,
    day: 1,
    devMode: false,
    resources: {},
    activeTool: "floor",
    map: { width: 128, height: 128, tileSize: 32, gridVisible: true, tiles: {} },
    pawn: { id: "researcher-01", name: "Researcher", x: 64, y: 64, level: 1, maxOP: 15, op: 15, selected: true },
    camera: { x: 64, y: 64, zoom: 1 },
    selection: "researcher-01"
  };
}
export function endTurn(state) {
  state.turn += 1;
  if ((state.turn - 1) % 3 === 0) state.day += 1;
  state.pawn.op = state.pawn.maxOP;
}