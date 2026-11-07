import { createSectionsPanel } from './ui/sections-panel.js';
import {
  createInitialState,
  endTurn,
  connectedHullCount,
  shipHullTileCount,
} from './systems/turn-manager.js';
import { createRenderer } from './core/renderer.js';
import { bindInput } from './core/input.js';
import { updateSidebar } from './ui/sidebar.js';
import { renderBuildCatalog } from './ui/build-catalog.js';
import { bindDevPanel } from './ui/dev-panel.js';
import { exportShipLayout as exportShipLayoutFile } from './dev/ship-layout-exporter.js';
const $ = (selector) => document.querySelector(selector);
const menu = $('#main-menu'),
  shell = $('#game-shell'),
  options = $('#options-panel'),
  devIndicator = $('#dev-indicator'),
  canvas = $('#game-canvas'),
  categories = $('#build-categories'),
  buildBtn = $('#build-menu-toggle'),
  materialBtn = $('#material-titanium'),
  titaniumBuilds = $('#titanium-builds'),
  note = $('#construction-note'),
  gridBtn = $('#grid-toggle'),
  pauseMenu = $('#pause-menu'),
  leaveConfirm = $('#leave-confirm'),
  devWrap = $('#dev-tools-wrap'),
  devToolsMenu = $('#dev-tools-menu'),
  astPanel = $('#ast-gen-panel');
let dev = false,
  state = null,
  renderer = null,
  devPanel = null,
  sectionsPanel = null,
  activeCategory = 'core-systems';
const CATALOG_CATEGORIES = [
  ['structure', 'STRUCTURE'],
  ['access', 'ACCESS'],
  ['core-systems', 'CORE SYSTEMS'],
  ['power', 'POWER'],
  ['material-processing', 'MATERIAL PROCESSING'],
  ['crew-medical', 'CREW & MEDICAL'],
  ['furniture', 'FURNITURE'],
];
function noteText(t) {
  note.textContent = t;
}
function refresh() {
  if (!state || !renderer) return;
  renderer.draw();
  updateSidebar(state);
  $('#tile-count').textContent = Object.values(state.map.tiles).filter((t) => t.hull).length;
  $('#planned-count').textContent = Object.keys(state.map.plans).length;
  $('#titanium-count').textContent = state.gameConfig.unlimitedResources
    ? '∞'
    : state.resources.titanium;
  $('#titanium-stock').textContent = state.gameConfig.unlimitedResources
    ? 'Unlimited · Developer Mode'
    : state.resources.titanium + ' units available';
  $('#connected-count').textContent = connectedHullCount(state) + ' tiles';
  $('#ship-hull-count').textContent = shipHullTileCount(state) + ' tiles';
  sectionsPanel?.refresh();
  $('#pawn-ap').textContent = state.pawn.op + ' / ' + state.pawn.maxOP;
  $('#pawn-position').textContent = state.pawn.x + ', ' + state.pawn.y;
  $('#mode-label').textContent = state.activeTool
    ? state.activeTool === 'prefab'
      ? 'PLACE MODULE · ' +
        (getBuildable(state.selectedPrefab)?.legacyId ?? state.selectedPrefab).toUpperCase()
      : 'BUILD MODE · ' + state.activeTool.toUpperCase()
    : 'SELECT / COMMAND MODE';
  $('#next-turn').classList.toggle('turn-ready', state.pawn.op === 0);
  $('#next-turn').classList.toggle('turn-pending', state.pawn.op > 0);
  gridBtn.textContent = state.map.gridVisible ? 'GRID: ON' : 'GRID: OFF';
  gridBtn.setAttribute('aria-pressed', String(state.map.gridVisible));
  renderBuildCatalog(state, activeCategory, (category) => (activeCategory = category), refresh, noteText);
}
function cancelTool() {
  state.activeTool = null;
  document.querySelectorAll('[data-tool]').forEach((b) => b.classList.remove('active'));
  $('#erase-tool').classList.remove('selected');
  refresh();
}
function exportShipLayout() {
  if (!dev || !state) return;
  exportShipLayoutFile(state, noteText);
}

function start(mode = 'normal') {
  dev = mode === 'dev';
  state = createInitialState({ mode });
  state.paused = false;
  renderer = createRenderer(canvas, state);
  bindInput(canvas, state, renderer, refresh, cancelTool, noteText, (panel) =>
    sectionsPanel?.selectPanel(panel.id)
  );
  devPanel = dev ? bindDevPanel(state, refresh, noteText) : null;
  sectionsPanel = createSectionsPanel($('#sections-panel'), state, (message) => {
    noteText(message);
    refresh();
  });
  devWrap.hidden = !dev;
  devIndicator.hidden = !dev;
  devToolsMenu.hidden = true;
  astPanel.hidden = true;
  $('#dev-creator-toggle').textContent = 'DEV CREATOR';
  $('#damage-simulator-toggle').textContent = 'DAMAGE SIMULATOR: OFF';
  pauseMenu.hidden = true;
  leaveConfirm.hidden = true;
  menu.hidden = true;
  shell.hidden = false;
  requestAnimationFrame(() => {
    renderer.resize();
    refresh();
  });
}
function pause() {
  if (!state || shell.hidden) return;
  sectionsPanel?.close();
  state.paused = true;
  pauseMenu.hidden = false;
  devToolsMenu.hidden = true;
  $('#module-drawer').hidden = true;
  astPanel.hidden = true;
}
function resume() {
  state.paused = false;
  pauseMenu.hidden = true;
}
function askLeave() {
  pauseMenu.hidden = true;
  leaveConfirm.hidden = false;
}
function returnToMenu() {
  state.paused = true;
  leaveConfirm.hidden = true;
  shell.hidden = true;
  menu.hidden = false;
  options.hidden = true;
  state = null;
  renderer = null;
  devPanel = null;
  sectionsPanel = null;
}
$('#sections-toggle').onclick = () => {
  if (!state || state.paused) return;
  sectionsPanel?.toggle();
};
$('#modules-tab').onclick = () => {
  const drawer = $('#module-drawer');
  drawer.hidden = !drawer.hidden;
  $('#modules-tab').classList.toggle('selected', !drawer.hidden);
  categories.hidden = true;
  buildBtn.classList.remove('selected');
};
$('#close-module-drawer').onclick = () => {
  $('#module-drawer').hidden = true;
  $('#modules-tab').classList.remove('selected');
};
$('#new-game').onclick = () => start('normal');
$('#dev-new-game').onclick = () => start('dev');
$('#open-options').onclick = () => (options.hidden = false);
$('#options-back').onclick = () => (options.hidden = true);
$('#dev-tools-button').onclick = () => {
  devToolsMenu.hidden = !devToolsMenu.hidden;
  $('#dev-tools-button').setAttribute('aria-expanded', String(!devToolsMenu.hidden));
};
$('#open-ast-gen').onclick = () => {
  devToolsMenu.hidden = true;
  devPanel?.open();
};
$('#close-ast-gen').onclick = () => devPanel?.close();
$('#dev-export-ship-layout').onclick = () => {
  devToolsMenu.hidden = true;
  exportShipLayout();
};
$('#dev-creator-toggle').onclick = () => {
  if (!dev || !state) return;
  state.devCreator = !state.devCreator;
  $('#dev-creator-toggle').textContent = state.devCreator ? 'DEV CREATOR: ON' : 'DEV CREATOR';
  noteText(
    state.devCreator
      ? 'DEV CREATOR ENABLED · ITEMS ARE BUILT IMMEDIATELY'
      : 'DEV CREATOR DISABLED · BLUEPRINT CONSTRUCTION'
  );
  refresh();
};
$('#damage-simulator-toggle').onclick = () => {
  if (!dev || !state) return;
  state.damageSimulator.active = !state.damageSimulator.active;
  $('#damage-simulator-toggle').textContent =
    'DAMAGE SIMULATOR: ' + (state.damageSimulator.active ? 'ON' : 'OFF');
  noteText(
    state.damageSimulator.active
      ? 'DAMAGE SIMULATOR ACTIVE · CLICK A HULL / WALL / DOOR TO APPLY 1–25% DAMAGE'
      : 'DAMAGE SIMULATOR DISABLED'
  );
  refresh();
};

buildBtn.onclick = () => {
  categories.hidden = !categories.hidden;
  state.activeTool = null;
  $('#erase-tool').classList.remove('selected');
  buildBtn.classList.toggle('selected', !categories.hidden);
  noteText(categories.hidden ? 'Material selection closed.' : 'Select the construction material.');
  refresh();
};
materialBtn.onclick = () => {
  materialBtn.classList.add('active');
  noteText('TITANIUM SELECTED · MATERIAL FOR CONSTRUCTION');
};
$('#erase-tool').onclick = () => {
  state.activeTool = 'erase';
  categories.hidden = true;
  buildBtn.classList.remove('selected');
  document.querySelectorAll('[data-tool]').forEach((b) => b.classList.remove('active'));
  $('#erase-tool').classList.add('selected');
  noteText('Remove a module or erase a plan; completed Hull / Wall can be marked for demolition.');
  refresh();
};
$('#pawn-select').onclick = () => {
  state.pawn.selected = true;
  state.selectedObject = null;
  cancelTool();
  noteText('PAWN SELECTED · RIGHT-CLICK A WALKABLE TILE OR CONSTRUCTION PLAN.');
};
gridBtn.onclick = () => {
  state.map.gridVisible = !state.map.gridVisible;
  refresh();
};
$('#next-turn').onclick = () => {
  const result = endTurn(state);
  noteText(result.message);
  refresh();
};
$('#pause-continue').onclick = resume;
$('#pause-main-menu').onclick = askLeave;
$('#confirm-leave-yes').onclick = returnToMenu;
$('#confirm-leave-no').onclick = () => {
  leaveConfirm.hidden = true;
  pauseMenu.hidden = false;
};
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!leaveConfirm.hidden) {
      leaveConfirm.hidden = true;
      pauseMenu.hidden = false;
    } else if (!pauseMenu.hidden) resume();
    else if (state && !shell.hidden) pause();
    else if (!options.hidden) options.hidden = true;
  }
});
window.addEventListener('resize', () => {
  if (renderer) {
    renderer.resize();
    renderer.draw();
  }
});
