import { endTurn } from './systems/turn-manager.js';
import { renderBuildCatalog } from './ui/build-catalog.js';
import { renderHud } from './ui/hud.js';
import { bindMenuControls } from './ui/menu-controls.js';
import { startGameSession } from './app/session.js';
import { createSessionLifecycle } from './app/session-lifecycle.js';
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
const { pause, resume, askLeave, returnToMenu } = createSessionLifecycle({
  $,
  getState: () => state,
  setState: (value) => (state = value),
  setRenderer: (value) => (renderer = value),
  setDevPanel: (value) => (devPanel = value),
  setSectionsPanel: (value) => (sectionsPanel = value),
  getSectionsPanel: () => sectionsPanel,
});
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
  renderHud(state, renderer, sectionsPanel, gridBtn);
  renderBuildCatalog(
    state,
    activeCategory,
    (category) => (activeCategory = category),
    refresh,
    noteText
  );
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

bindMenuControls({ $, startGame: (mode) => start(mode) });

function start(mode = 'normal') {
  const session = startGameSession(mode, { $, canvas, refresh, noteText });
  ({ dev, state, renderer, devPanel, sectionsPanel } = session);
}
$('#sections-toggle').onclick = () => {
  if (!state || state.paused) return;
  sectionsPanel?.toggle();
};
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
