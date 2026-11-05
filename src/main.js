import { createInitialState, endTurn } from "./systems/turn-manager.js";
import { createRenderer } from "./core/renderer.js";
import { bindInput } from "./core/input.js";
import { updateSidebar } from "./ui/sidebar.js";

const menu = document.querySelector("#main-menu");
const gameShell = document.querySelector("#game-shell");
const optionsPanel = document.querySelector("#options-panel");
const devToggle = document.querySelector("#dev-mode-toggle");
const devLabel = document.querySelector("#dev-mode-label");
const devIndicator = document.querySelector("#dev-indicator");
const canvas = document.querySelector("#game-canvas");

let devMode = localStorage.getItem("cassandra-dev-mode") === "true";
let state;
let renderer;

function updateDevModeUI() {
  devToggle.setAttribute("aria-pressed", String(devMode));
  devLabel.textContent = devMode ? "ON" : "OFF";
  devIndicator.hidden = !devMode;
  if (state) state.devMode = devMode;
}

function refresh() {
  renderer.draw();
  updateSidebar(state);
  updateDevModeUI();
}

function startNewGame() {
  state = createInitialState();
  state.devMode = devMode;
  renderer = createRenderer(canvas, state);
  bindInput(canvas, state, renderer, refresh);
  menu.hidden = true;
  gameShell.hidden = false;
  refresh();
}

document.querySelector("#new-game").addEventListener("click", startNewGame);
document.querySelector("#open-options").addEventListener("click", () => { optionsPanel.hidden = false; });
document.querySelector("#options-back").addEventListener("click", () => { optionsPanel.hidden = true; });
devToggle.addEventListener("click", () => {
  devMode = !devMode;
  localStorage.setItem("cassandra-dev-mode", String(devMode));
  updateDevModeUI();
});
document.querySelector("#next-turn").addEventListener("click", () => { endTurn(state); refresh(); });
window.addEventListener("resize", () => { if (renderer) { renderer.resize(); renderer.draw(); } });
updateDevModeUI();
