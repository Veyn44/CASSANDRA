import { createInitialState, endTurn } from "./systems/turn-manager.js";
import { createRenderer } from "./core/renderer.js";
import { bindInput } from "./core/input.js";
import { updateSidebar } from "./ui/sidebar.js";

const canvas = document.querySelector("#game-canvas");
const state = createInitialState();
const renderer = createRenderer(canvas, state);

function refresh() {
  renderer.draw();
  updateSidebar(state);
}

bindInput(canvas, state, renderer, refresh);
document.querySelector("#next-turn").addEventListener("click", () => {
  endTurn(state);
  refresh();
});

window.addEventListener("resize", () => {
  renderer.resize();
  renderer.draw();
});

refresh();
