import { endTurn } from './systems/turn-manager.js';
import { renderBuildCatalog } from './ui/build-catalog.js';
import { renderHud } from './ui/hud.js';
import { bindMenuControls } from './ui/menu-controls.js';
import { startGameSession } from './app/session.js';
import { createSessionLifecycle } from './app/session-lifecycle.js';
import { exportShipLayout as exportShipLayoutFile } from './dev/ship-layout-exporter.js';
import { bindDevControls } from './dev/dev-controls.js';
const $ = (selector) => document.querySelector(selector);
const shell = $('#game-shell'),
  options = $('#options-panel'),
  canvas = $('#game-canvas'),
  categories = $('#build-categories'),
  buildBtn = $('#build-menu-toggle'),
  materialBtn = $('#material-titanium'),
  note = $('#construction-note'),
  gridBtn = $('#grid-toggle'),
  pauseMenu = $('#pause-menu'),
  leaveConfirm = $('#leave-confirm'),
  devToolsMenu = $('#dev-tools-menu');
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
bindDevControls({
  $,
  isDev: () => dev,
  getState: () => state,
  getDevPanel: () => devPanel,
  noteText,
  refresh,
  exportShipLayout,
});

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
