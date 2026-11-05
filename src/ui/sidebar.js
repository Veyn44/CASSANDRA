export function updateSidebar(state) {
  document.querySelector("#turn-label").textContent = `DAY ${String(state.day).padStart(2,"0")} · TURN ${String(state.turn).padStart(2,"0")}`;
  document.querySelector("#op-value").textContent = `${state.pawn.op} / ${state.pawn.maxOP}`;
  document.querySelector("#op-bar").style.width = `${(state.pawn.op / state.pawn.maxOP) * 100}%`;
  document.querySelector("#selection-name").textContent = state.pawn.name;
  document.querySelector("#selection-coords").textContent = `POSITION · X ${state.pawn.x} / Y ${state.pawn.y}`;
}
