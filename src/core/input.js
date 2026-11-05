import{placePrefab,validatePrefabPlacement}from"../systems/prefab-manager.js";
import{performPlanAction,isBlocked}from"../systems/turn-manager.js";
const dirs=[[1,0],[-1,0],[0,1],[0,-1]],key=(x,y)=>x+","+y;
export function bindInput(canvas,s,r,refresh,cancel,note){
let pan=false,last=null;
function tile(cx,cy){const a=canvas.getBoundingClientRect(),v=r.getView(),z=s.map.tileSize*s.camera.zoom;return{x:Math.floor(s.camera.x+(cx-a.left-v.width/2)/z),y:Math.floor(s.camera.y+(cy-a.top-v.height/2)/z)};}
function inside(p){return p.x>=0&&p.y>=0&&p.x<128&&p.y<128;}
function objectAt(p){return Object.values(s.map.objects).find(o=>p.x>=o.x&&p.y>=o.y&&p.x<o.x+o.w&&p.y<o.y+o.h);}
function place(p){if(!inside(p))return;const k=key(p.x,p.y),t=s.map.tiles[k],existing=s.map.plans[k];
if(s.activeTool==="hull"){if(t?.hull){note("HULL ALREADY EXISTS");return;}s.map.plans[k]={type:"hull"};note("HULL PLAN PLACED · 1 TITANIUM · 2 AP");}
else if(s.activeTool==="wall"){if(!t?.hull){note("HULL REQUIRED · WALLS MUST BE PLACED ON COMPLETED HULL");return;}if(t.wall){note("WALL ALREADY EXISTS");return;}s.map.plans[k]={type:"wall"};note("WALL PLAN PLACED · 1 TITANIUM · 2 AP");}
else if(s.activeTool==="erase"){if(existing){delete s.map.plans[k];note("CONSTRUCTION PLAN REMOVED");}else{const obj=objectAt(p);if(obj){delete s.map.objects[obj.id];if(s.selectedObject===obj.id)s.selectedObject=null;note("MODULE REMOVED");}else if(t?.wall){s.map.plans[k]={type:"demolishWall"};note("WALL DECONSTRUCTION PLANNED · 2 AP");}else if(t?.hull){s.map.plans[k]={type:"demolishHull"};note("HULL DECONSTRUCTION PLANNED · 2 AP");}else note("NOTHING TO ERASE");}}
else if(s.activeTool==="prefab"){const result=placePrefab(s,s.selectedPrefab,p.x,p.y);note(result.message);if(result.objectId){s.selectedObject=result.objectId;s.activeTool=null;}}
refresh();}
function command(p){if(!inside(p))return;const k=key(p.x,p.y),plan=s.map.plans[k];if(plan){const result=performPlanAction(s,p.x,p.y);note(result.message);refresh();return;}
if(isBlocked(s,p.x,p.y)){note("UNREACHABLE · TARGET IS NOT WALKABLE");return;}const q=[{x:s.pawn.x,y:s.pawn.y}],seen=new Set([key(s.pawn.x,s.pawn.y)]);let found=null;for(let i=0;i<q.length;i++){const a=q[i];if(a.x===p.x&&a.y===p.y){found=a;break;}for(const[dx,dy]of dirs){const x=a.x+dx,y=a.y+dy,k2=key(x,y);if(x<0||y<0||x>=128||y>=128||seen.has(k2)||isBlocked(s,x,y))continue;seen.add(k2);q.push({x,y});}}if(!found){note("NO PATH TO DESTINATION");return;}s.pawn.x=p.x;s.pawn.y=p.y;note("RESEARCHER MOVED · NO AP COST");refresh();}
canvas.addEventListener("pointerdown",e=>{
if(e.button===1){pan=true;last={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);e.preventDefault();return;}
if(e.button===2){e.preventDefault();if(s.activeTool){cancel();note("BUILD MODE CANCELLED");}else command(tile(e.clientX,e.clientY));return;}
if(e.button===0){const p=tile(e.clientX,e.clientY);if(!inside(p))return;if(s.activeTool){place(p);return;}
if(p.x===s.pawn.x&&p.y===s.pawn.y){s.pawn.selected=true;s.selectedObject=null;refresh();return;}
const obj=objectAt(p);if(obj){s.selectedObject=obj.id;s.pawn.selected=false;refresh();return;}
s.selectedObject=null;s.pawn.selected=false;refresh();}
});
canvas.addEventListener("pointermove",e=>{const p=tile(e.clientX,e.clientY);s.hoverTile=inside(p)?p:null;if(pan&&last){const z=s.map.tileSize*s.camera.zoom;s.camera.x-=(e.clientX-last.x)/z;s.camera.y-=(e.clientY-last.y)/z;last={x:e.clientX,y:e.clientY};}r.draw();});
function stop(){pan=false;last=null;}canvas.addEventListener("pointerup",stop);canvas.addEventListener("pointercancel",stop);canvas.addEventListener("contextmenu",e=>e.preventDefault());
canvas.addEventListener("wheel",e=>{e.preventDefault();s.camera.zoom=Math.max(.35,Math.min(2.4,s.camera.zoom*(e.deltaY<0?1.1:.9)));r.draw();},{passive:false});
window.addEventListener("keydown",e=>{const k=e.key.toLowerCase();if((k==="q"||k==="e")&&s.activeTool==="prefab"){e.preventDefault();s.rotation=(s.rotation+(k==="q"?3:1))%4;r.draw();return;}if(!"wasd".includes(k)||e.target instanceof HTMLInputElement)return;e.preventDefault();const d=12/Math.max(.55,s.camera.zoom);if(k==="w")s.camera.y-=d;if(k==="s")s.camera.y+=d;if(k==="a")s.camera.x-=d;if(k==="d")s.camera.x+=d;s.camera.x=Math.max(0,Math.min(127,s.camera.x));s.camera.y=Math.max(0,Math.min(127,s.camera.y));r.draw();});
}