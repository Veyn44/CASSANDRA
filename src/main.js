import{createSectionsPanel}from"./ui/sections-panel.js";
import{createInitialState,endTurn,connectedHullCount,shipHullTileCount}from"./systems/turn-manager.js";
import{createRenderer}from"./core/renderer.js";
import{bindInput}from"./core/input.js";
import{updateSidebar}from"./ui/sidebar.js";
import{PREFABS,getBuildable}from"./systems/prefab-manager.js";
import{bindDevPanel}from"./ui/dev-panel.js";
const $=selector=>document.querySelector(selector);
const menu=$("#main-menu"),shell=$("#game-shell"),options=$("#options-panel"),devIndicator=$("#dev-indicator"),canvas=$("#game-canvas"),categories=$("#build-categories"),buildBtn=$("#build-menu-toggle"),materialBtn=$("#material-titanium"),titaniumBuilds=$("#titanium-builds"),note=$("#construction-note"),gridBtn=$("#grid-toggle"),pauseMenu=$("#pause-menu"),leaveConfirm=$("#leave-confirm"),devWrap=$("#dev-tools-wrap"),devToolsMenu=$("#dev-tools-menu"),astPanel=$("#ast-gen-panel");
let dev=false,state=null,renderer=null,devPanel=null,sectionsPanel=null,activeCategory="core-systems";
const CATALOG_CATEGORIES=[["structure","STRUCTURE"],["access","ACCESS"],["core-systems","CORE SYSTEMS"],["power","POWER"],["material-processing","MATERIAL PROCESSING"],["crew-medical","CREW & MEDICAL"],["furniture","FURNITURE"]];
function noteText(t){note.textContent=t;}
function refresh(){if(!state||!renderer)return;renderer.draw();updateSidebar(state);$("#tile-count").textContent=Object.values(state.map.tiles).filter(t=>t.hull).length;$("#planned-count").textContent=Object.keys(state.map.plans).length;$("#titanium-count").textContent=state.gameConfig.unlimitedResources?"∞":state.resources.titanium;$("#titanium-stock").textContent=state.gameConfig.unlimitedResources?"Unlimited · Developer Mode":state.resources.titanium+" units available";$("#connected-count").textContent=connectedHullCount(state)+" tiles";$("#ship-hull-count").textContent=shipHullTileCount(state)+" tiles";sectionsPanel?.refresh();$("#pawn-ap").textContent=state.pawn.op+" / "+state.pawn.maxOP;$("#pawn-position").textContent=state.pawn.x+", "+state.pawn.y;$("#mode-label").textContent=state.activeTool?(state.activeTool==="prefab"?"PLACE MODULE · "+(getBuildable(state.selectedPrefab)?.legacyId??state.selectedPrefab).toUpperCase():"BUILD MODE · "+state.activeTool.toUpperCase()):"SELECT / COMMAND MODE";$("#next-turn").classList.toggle("turn-ready",state.pawn.op===0);$("#next-turn").classList.toggle("turn-pending",state.pawn.op>0);gridBtn.textContent=state.map.gridVisible?"GRID: ON":"GRID: OFF";gridBtn.setAttribute("aria-pressed",String(state.map.gridVisible));$("#catalog-categories").innerHTML=CATALOG_CATEGORIES.map(([id,label])=>'<button class="catalog-category '+(activeCategory===id?"active":"")+'" data-category="'+id+'">'+label+'</button>').join("");
document.querySelectorAll("[data-category]").forEach(btn=>btn.onclick=()=>{activeCategory=btn.dataset.category;refresh();});
const visibleItems=PREFABS.filter(p=>p.category===activeCategory);
const tileTools=activeCategory==="structure"?'<button class="prefab-option '+(state.activeTool==="hull"?"active":"")+'" data-tool="hull">Hull Floor<small>Tile construction · 1 titanium · 1 AP</small></button><button class="prefab-option '+(state.activeTool==="wall"?"active":"")+'" data-tool="wall">Hull Wall<small>Requires completed Hull · 1 titanium · 1 AP</small></button>'+(state.devMode?'<button class="prefab-option '+(state.activeTool==="aluminiumWall"?"active":"")+'" data-tool="aluminiumWall">Aluminium Wall<small>DEV TEST · place on open Hull tile</small></button>':""):"";
$("#prefab-list").innerHTML=tileTools+visibleItems.map(p=>'<button class="prefab-option '+(state.selectedPrefab===p.id&&state.activeTool==="prefab"?"active":"")+'" data-prefab="'+p.id+'">'+p.name+'<small>'+p.w+" × "+p.h+" · "+p.description+'</small></button>').join("")||(tileTools||'<p class="catalog-empty">NO ITEMS IN THIS SECTION YET</p>');
document.querySelectorAll("#prefab-list [data-tool]").forEach(btn=>btn.onclick=()=>{state.activeTool=btn.dataset.tool;state.selectedObject=null;state.pawn.selected=false;noteText(state.activeTool==="hull"?"Place Hull plans anywhere in the ship sector. Construction requires connection to the existing ship.":"Wall plans require completed Hull.");refresh();});
document.querySelectorAll("[data-prefab]").forEach(btn=>btn.onclick=()=>{state.selectedPrefab=btn.dataset.prefab;state.activeTool="prefab";state.selectedObject=null;state.pawn.selected=false;state.rotation=0;noteText(state.devCreator?"DEV CREATOR · DIRECT PLACEMENT · Q / E TO ROTATE":"BLUEPRINT PREVIEW · MOVE CURSOR · Q / E TO ROTATE · CLICK TO PLACE");refresh();});const details=$("#object-details");if(state.selectedObject&&state.map.objects[state.selectedObject]){const selected=state.map.objects[state.selectedObject],p=getBuildable(selected.type);details.hidden=false;details.className="object-details";details.innerHTML='<h4>'+p.name+'</h4><p>'+p.description+'</p><p class="prefab-footprint">FOOTPRINT · '+selected.w+" × "+selected.h+'</p><p>STATUS · '+p.function+'</p>';}else details.hidden=true;}
function cancelTool(){state.activeTool=null;document.querySelectorAll("[data-tool]").forEach(b=>b.classList.remove("active"));$("#erase-tool").classList.remove("selected");refresh();}
function exportShipLayout(){
 if(!dev||!state)return;
 const sortedTiles=Object.entries(state.map.tiles)
  .map(([position,tile])=>{const[x,y]=position.split(",").map(Number);return{x,y,tile};})
  .filter(({tile})=>tile&&(tile.hull||tile.wall||tile.aluminiumWall))
  .sort((a,b)=>a.y-b.y||a.x-b.x);
 const point=({x,y})=>({x,y});
 const hullFloor=sortedTiles.filter(({tile})=>tile.hull).map(point);
 const hullWalls=sortedTiles.filter(({tile})=>tile.wall).map(point);
 const aluminiumWalls=sortedTiles.filter(({tile})=>tile.aluminiumWall).map(point);
 const objects=Object.values(state.map.objects??{})
  .map(object=>({
   id:object.id,
   type:object.type,
   family:object.family??null,
   x:object.x,
   y:object.y,
   w:object.w,
   h:object.h,
   rotation:object.rotation??0,
   built:object.built!==false,
   materialFamily:object.materialFamily??null
  }))
  .sort((a,b)=>a.y-b.y||a.x-b.x||String(a.type).localeCompare(String(b.type))||String(a.id).localeCompare(String(b.id)));
 const layout={
  format:"cassandra-ship-layout",
  version:2,
  map:{width:state.map.width,height:state.map.height},
  construction:{hullFloor,hullWalls,aluminiumWalls},
  objects
 };
 const blob=new Blob([JSON.stringify(layout,null,2)+"\\n"],{type:"application/json"});
 const url=URL.createObjectURL(blob);
 const link=document.createElement("a");
 link.href=url;
 link.download="cassandra_ship_layout.json";
 document.body.appendChild(link);
 link.click();
 link.remove();
 URL.revokeObjectURL(url);
 noteText("SHIP LAYOUT EXPORTED · "+hullFloor.length+" HULL · "+hullWalls.length+" HULL WALLS · "+aluminiumWalls.length+" ALUMINIUM WALLS · "+objects.length+" OBJECTS");
}
function start(mode="normal"){dev=mode==="dev";state=createInitialState({mode});state.paused=false;renderer=createRenderer(canvas,state);bindInput(canvas,state,renderer,refresh,cancelTool,noteText,(panel)=>sectionsPanel?.selectPanel(panel.id));devPanel=dev?bindDevPanel(state,refresh,noteText):null;sectionsPanel=createSectionsPanel($("#sections-panel"),state,(message)=>{noteText(message);refresh();});devWrap.hidden=!dev;devIndicator.hidden=!dev;devToolsMenu.hidden=true;astPanel.hidden=true;$("#dev-creator-toggle").textContent="DEV CREATOR";$("#damage-simulator-toggle").textContent="DAMAGE SIMULATOR: OFF";pauseMenu.hidden=true;leaveConfirm.hidden=true;menu.hidden=true;shell.hidden=false;requestAnimationFrame(()=>{renderer.resize();refresh();});}
function pause(){if(!state||shell.hidden)return;sectionsPanel?.close();state.paused=true;pauseMenu.hidden=false;devToolsMenu.hidden=true;$("#module-drawer").hidden=true;astPanel.hidden=true;}
function resume(){state.paused=false;pauseMenu.hidden=true;}
function askLeave(){pauseMenu.hidden=true;leaveConfirm.hidden=false;}
function returnToMenu(){state.paused=true;leaveConfirm.hidden=true;shell.hidden=true;menu.hidden=false;options.hidden=true;state=null;renderer=null;devPanel=null;sectionsPanel=null;}
$("#sections-toggle").onclick=()=>{if(!state||state.paused)return;sectionsPanel?.toggle();};
$("#modules-tab").onclick=()=>{const drawer=$("#module-drawer");drawer.hidden=!drawer.hidden;$("#modules-tab").classList.toggle("selected",!drawer.hidden);categories.hidden=true;buildBtn.classList.remove("selected");};
$("#close-module-drawer").onclick=()=>{$("#module-drawer").hidden=true;$("#modules-tab").classList.remove("selected");};
$("#new-game").onclick=()=>start("normal");$("#dev-new-game").onclick=()=>start("dev");$("#open-options").onclick=()=>options.hidden=false;$("#options-back").onclick=()=>options.hidden=true;
$("#dev-tools-button").onclick=()=>{devToolsMenu.hidden=!devToolsMenu.hidden;$("#dev-tools-button").setAttribute("aria-expanded",String(!devToolsMenu.hidden));};
$("#open-ast-gen").onclick=()=>{devToolsMenu.hidden=true;devPanel?.open();};
$("#close-ast-gen").onclick=()=>devPanel?.close();
$("#dev-export-ship-layout").onclick=()=>{devToolsMenu.hidden=true;exportShipLayout();};
$("#dev-creator-toggle").onclick=()=>{if(!dev||!state)return;state.devCreator=!state.devCreator;$("#dev-creator-toggle").textContent=state.devCreator?"DEV CREATOR: ON":"DEV CREATOR";noteText(state.devCreator?"DEV CREATOR ENABLED · ITEMS ARE BUILT IMMEDIATELY":"DEV CREATOR DISABLED · BLUEPRINT CONSTRUCTION");refresh();};
$("#damage-simulator-toggle").onclick=()=>{if(!dev||!state)return;state.damageSimulator.active=!state.damageSimulator.active;$("#damage-simulator-toggle").textContent="DAMAGE SIMULATOR: "+(state.damageSimulator.active?"ON":"OFF");noteText(state.damageSimulator.active?"DAMAGE SIMULATOR ACTIVE · CLICK A HULL / WALL / DOOR TO APPLY 1–25% DAMAGE":"DAMAGE SIMULATOR DISABLED");refresh();};



buildBtn.onclick=()=>{categories.hidden=!categories.hidden;state.activeTool=null;$("#erase-tool").classList.remove("selected");buildBtn.classList.toggle("selected",!categories.hidden);noteText(categories.hidden?"Material selection closed.":"Select the construction material.");refresh();};
materialBtn.onclick=()=>{materialBtn.classList.add("active");noteText("TITANIUM SELECTED · MATERIAL FOR CONSTRUCTION");};
$("#erase-tool").onclick=()=>{state.activeTool="erase";categories.hidden=true;buildBtn.classList.remove("selected");document.querySelectorAll("[data-tool]").forEach(b=>b.classList.remove("active"));$("#erase-tool").classList.add("selected");noteText("Remove a module or erase a plan; completed Hull / Wall can be marked for demolition.");refresh();};
$("#pawn-select").onclick=()=>{state.pawn.selected=true;state.selectedObject=null;cancelTool();noteText("PAWN SELECTED · RIGHT-CLICK A WALKABLE TILE OR CONSTRUCTION PLAN.");};
gridBtn.onclick=()=>{state.map.gridVisible=!state.map.gridVisible;refresh();};
$("#next-turn").onclick=()=>{const result=endTurn(state);noteText(result.message);refresh();};
$("#pause-continue").onclick=resume;$("#pause-main-menu").onclick=askLeave;$("#confirm-leave-yes").onclick=returnToMenu;$("#confirm-leave-no").onclick=()=>{leaveConfirm.hidden=true;pauseMenu.hidden=false;};
window.addEventListener("keydown",e=>{if(e.key==="Escape"){if(!leaveConfirm.hidden){leaveConfirm.hidden=true;pauseMenu.hidden=false;}else if(!pauseMenu.hidden)resume();else if(state&&!shell.hidden)pause();else if(!options.hidden)options.hidden=true;}});
window.addEventListener("resize",()=>{if(renderer){renderer.resize();renderer.draw();}});
