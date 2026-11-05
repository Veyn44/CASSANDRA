export function createInitialState() {
  return {
    turn: 1,
    day: 1,
    devMode: false,
    resources: {},
    map: { width: 64, height: 64, tileSize: 32 },
    pawn: { id: "researcher-01", name: "Researcher", x: 32, y: 32, level: 1, maxOP: 15, op: 15, selected: true },
    camera: { x: 0, y: 0, zoom: 1 },
    selection: "researcher-01"
  };
}
export function endTurn(state) {
  state.turn += 1;
  if ((state.turn - 1) % 3 === 0) state.day += 1;
  state.pawn.op = state.pawn.maxOP;
}