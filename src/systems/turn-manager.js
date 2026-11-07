const key=(x,y)=>x+","+y;const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
import { createGameConfig } from "../core/game-config.js";
import { getBuildable } from "./prefab-manager.js";
import { generateCosmicBody } from "./cosmic-body-generator.js";
import { createVisibility } from "./visibility-manager.js";
import { advanceEnvironment } from "./section-manager.js";
export function createInitialState({mode="normal"}={}){
 const tiles={};
 const hullRows={59:[75,76,77,78,79],60:[66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81],61:[66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83],62:[63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83],63:[63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83],64:[63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83],65:[63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83],66:[66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83],67:[66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81],68:[75,76,77,78,79]};
 const hullWallRows={59:[75,76,77,78,79],60:[66,67,68,69,70,71,72,73,74,75,79,80,81],61:[66,81,82,83],62:[63,64,66,68,83],63:[83],64:[83],65:[63,64,66,67,68,83],66:[66,75,76,79,81,82,83],67:[66,67,68,69,70,71,72,73,74,75,79,80,81],68:[75,76,78,79]};
 const aluminiumWallRows={60:[76,77,78],61:[67,68,69,70,71,72,73,74,75,76,78,79,80],62:[74,80,81,82],65:[74],66:[74,78]};
 const positions=rows=>new Set(Object.entries(rows).flatMap(([y,xs])=>xs.map(x=>key(x,Number(y)))));
 const hullSet=positions(hullRows),hullWallSet=positions(hullWallRows),aluminiumWallSet=positions(aluminiumWallRows);
 for(const k of hullSet){
  const isHullWall=hullWallSet.has(k),isAluminiumWall=aluminiumWallSet.has(k);
  tiles[k]={hull:true,integrity:100,wall:isHullWall,wallIntegrity:isHullWall?100:null,aluminiumWall:isAluminiumWall,aluminiumWallIntegrity:isAluminiumWall?100:null};
 }
 const gameConfig=createGameConfig(mode);
 const objects={
  "build-16":{id:"build-16",type:"MOD0014",family:"MOD",x:67,y:62,w:1,h:1,rotation:0,built:true,materialFamily:"aluminium",sectionName:"SECTION"},
  "build-19":{id:"build-19",type:"MOD0014",family:"MOD",x:73,y:62,w:1,h:1,rotation:0,built:true,materialFamily:"aluminium",sectionName:"SECTION"},
  "build-20":{id:"build-20",type:"MOD0014",family:"MOD",x:75,y:62,w:1,h:1,rotation:0,built:true,materialFamily:"aluminium",sectionName:"SECTION"},
  "build-2":{id:"build-2",type:"MOD0002",family:"MOD",x:63,y:63,w:2,h:2,rotation:0,built:true,materialFamily:"titanium"},
  "build-3":{id:"build-3",type:"STR0003",family:"STR",x:66,y:63,w:1,h:2,rotation:3,built:true,materialFamily:"titanium"},
  "build-14":{id:"build-14",type:"STR0003",family:"STR",x:68,y:63,w:1,h:2,rotation:3,built:true,materialFamily:"titanium"},
  "build-9":{id:"build-9",type:"STR0005",family:"STR",x:74,y:63,w:1,h:2,rotation:3,built:true,materialFamily:"aluminium",integrity:100},
  "build-7":{id:"build-7",type:"MOD0005",family:"MOD",x:81,y:63,w:2,h:2,rotation:0,built:true,materialFamily:"titanium"},
  "build-15":{id:"build-15",type:"MOD0011",family:"MOD",x:81,y:65,w:2,h:1,rotation:0,built:true,materialFamily:"titanium"},
  "build-11":{id:"build-11",type:"STR0002",family:"STR",x:77,y:66,w:1,h:1,rotation:0,built:true,materialFamily:"titanium"},
  "build-13":{id:"build-13",type:"MOD0008",family:"MOD",x:76,y:67,w:1,h:1,rotation:0,built:true,materialFamily:"titanium"},
  "build-12":{id:"build-12",type:"MOD0014",family:"MOD",x:78,y:67,w:1,h:1,rotation:0,built:true,materialFamily:"aluminium",sectionName:"SECTION"},
  "build-10":{id:"build-10",type:"STR0002",family:"STR",x:77,y:68,w:1,h:1,rotation:0,built:true,materialFamily:"titanium"}
 };
 for(const object of Object.values(objects))object.integrity=100;
 const state={turn:1,day:1,gameConfig,controlNetwork:{central:{role:"BRIDGE_CONSOLE",scope:"ALL_SECTIONS",remoteAccessRequiresIntactIntegrityPath:true,integrityPathSimulation:"NOT_IMPLEMENTED"},local:{scope:"ONE_SECTION",worksIndependently:true}},devMode:gameConfig.unlimitedResources,resources:{titanium:100,water:20,ice:0,oxygen:100,hydrogen:20},activeTool:null,selectedPrefab:null,selectedObject:null,selectedMaterial:"titanium",devCreator:false,damageSimulator:{active:false},rotation:0,nextObjectId:21,hoverTile:null,map:{width:256,height:128,tileSize:28,gridVisible:true,tiles,plans:{},objects,core:{x:64,y:64},anchor:{x:192,y:64},asteroid:null,asteroidVisibility:null},pawn:{id:"researcher-01",name:"Researcher",x:70,y:64,level:1,maxOP:12,op:12,selected:true,health:100,moving:false},camera:{x:73,y:64,zoom:1},selection:"researcher-01"};
 advanceEnvironment(state,{initial:true});
 return state;
}
export function connectedHullSet(s){const seen=new Set(),q=[],core=s.map.core,rx=core.x-1,ry=core.y-1;for(let x=rx-1;x<=rx+2;x++)for(const y of [ry-1,ry+2]){const k=key(x,y);if(s.map.tiles[k]?.hull&&!seen.has(k)){seen.add(k);q.push({x,y});}}for(let y=ry;y<ry+2;y++)for(const x of [rx-1,rx+2]){const k=key(x,y);if(s.map.tiles[k]?.hull&&!seen.has(k)){seen.add(k);q.push({x,y});}}for(let i=0;i<q.length;i++){const p=q[i];for(const[dx,dy]of dirs){const x=p.x+dx,y=p.y+dy,k=key(x,y),t=s.map.tiles[k];if(t?.hull&&!seen.has(k)){seen.add(k);q.push({x,y});}}}return seen;}
export function connectedHullCount(s){return connectedHullSet(s).size;}
export function shipHullTileCount(s){return Object.values(s.map.tiles).filter(tile=>tile?.hull).length;}
export function isBlocked(s,x,y){const asteroid=s.map.asteroid,rock=asteroid?.cellLookup?.[key(x,y)],ground=asteroid?.groundLookup?.[key(x,y)];if(rock)return true;if(ground?.walkable)return false;const objects=Object.values(s.map.objects),door=objects.some(o=>o.family==="STR"&&o.type!=="STR0001"&&o.built&&x>=o.x&&y>=o.y&&x<o.x+o.w&&y<o.y+o.h),furniture=objects.some(o=>o.family==="FUR"&&x>=o.x&&y>=o.y&&x<o.x+o.w&&y<o.y+o.h);const t=s.map.tiles[key(x,y)];if(!t?.hull||t.wall&&!door||t.aluminiumWall)return true;if(furniture)return false;return objects.some(o=>x>=o.x&&y>=o.y&&x<o.x+o.w&&y<o.y+o.h&&o.family!=="FUR"&&!(o.family==="STR"&&o.type!=="STR0001"&&o.built));}
export function findPath(s,target){const start={x:s.pawn.x,y:s.pawn.y},q=[start],came=new Map([[key(start.x,start.y),null]]);for(let i=0;i<q.length;i++){const p=q[i],pk=key(p.x,p.y);if(p.x===target.x&&p.y===target.y){const path=[];let k=pk;while(k!==null){const[a,b]=k.split(",").map(Number);path.push({x:a,y:b});k=came.get(k);}return path.reverse();}for(const[dx,dy]of dirs){const x=p.x+dx,y=p.y+dy,k=key(x,y);if(x<0||y<0||x>=s.map.width||y>=s.map.height||came.has(k)||isBlocked(s,x,y))continue;came.set(k,pk);q.push({x,y});}}return null;}
export function findWorkPath(s,x,y,w=1,h=1){let best=null;const candidates=new Set();for(let xx=x-1;xx<=x+w;xx++){candidates.add(key(xx,y-1));candidates.add(key(xx,y+h));}for(let yy=y;yy<y+h;yy++){candidates.add(key(x-1,yy));candidates.add(key(x+w,yy));}for(const candidate of candidates){const[xx,yy]=candidate.split(",").map(Number);if(xx<0||yy<0||xx>=s.map.width||yy>=s.map.height||isBlocked(s,xx,yy))continue;const path=findPath(s,{x:xx,y:yy});if(path&&(!best||path.length<best.length))best=path;}return best;}
export function completePlanAction(s,x,y){const k=key(x,y),plan=s.map.plans[k],tile=s.map.tiles[k];if(!plan)return{ok:false,message:"NO CONSTRUCTION PLAN HERE"};if(s.pawn.op<1)return{ok:false,message:"NOT ENOUGH AP · 1 AP REQUIRED"};if(plan.type==="demolishAluminiumWall"){if(!tile?.aluminiumWall)return{ok:false,message:"NO ALUMINIUM WALL TO DEMOLISH"};tile.aluminiumWall=false;tile.aluminiumWallIntegrity=null;s.pawn.op--;delete s.map.plans[k];return{ok:true,message:"ALUMINIUM WALL REMOVED · 1 AP SPENT"};}if(plan.type==="demolishModule"){const obj=s.map.objects[plan.objectId];if(!obj||s.pawn.op<1)return{ok:false,message:"MODULE DECONSTRUCTION UNAVAILABLE"};delete s.map.objects[obj.id];delete s.map.plans[k];s.pawn.op--;return{ok:true,message:"MODULE DISMANTLED · 1 AP SPENT"};}if(plan.type==="hull"&&(tile?.hull||!dirs.some(([dx,dy])=>connectedHullSet(s).has(key(x+dx,y+dy)))))return{ok:false,message:"HULL PLAN NOT CONNECTED TO SHIP"};if(plan.type==="wall"&&(!tile?.hull||tile.wall))return{ok:false,message:"WALL REQUIRES COMPLETED HULL"};if(plan.type==="aluminiumWall"&&(!tile?.hull||tile.aluminiumWall))return{ok:false,message:"ALUMINIUM WALL REQUIRES AN OPEN HULL TILE"};if(plan.type==="demolishWall"&&(!tile?.hull||!tile.wall))return{ok:false,message:"NO WALL TO DEMOLISH"};if(plan.type==="demolishHull"&&(!tile?.hull||tile.wall||Object.values(s.map.objects).some(o=>x>=o.x&&y>=o.y&&x<o.x+o.w&&y<o.y+o.h)))return{ok:false,message:"REMOVE WALL OR MODULE BEFORE HULL"};const cost=["hull","wall"].includes(plan.type);if(cost&&!s.gameConfig.freeConstruction&&s.resources.titanium<1)return{ok:false,message:"INSUFFICIENT TITANIUM"};if(cost&&!s.gameConfig.freeConstruction)s.resources.titanium--;if(plan.type==="hull")s.map.tiles[k]={hull:true,integrity:100,wall:false,wallIntegrity:null,aluminiumWall:false,aluminiumWallIntegrity:null};else if(plan.type==="wall"){tile.wall=true;tile.wallIntegrity=100;}else if(plan.type==="aluminiumWall"){tile.aluminiumWall=true;tile.aluminiumWallIntegrity=100;}else if(plan.type==="demolishWall"){tile.wall=false;tile.wallIntegrity=null;}else if(plan.type==="demolishHull")delete s.map.tiles[k];s.pawn.op--;delete s.map.plans[k];return{ok:true,message:"CONSTRUCTION COMPLETE · "+plan.type.toUpperCase()+" · 1 AP SPENT"};}
export function completeModuleAction(s,id){const o=s.map.objects[id];if(!o||o.built)return{ok:false,message:"NO MODULE BLUEPRINT HERE"};if(s.pawn.op<1)return{ok:false,message:"NOT ENOUGH AP · 1 AP REQUIRED"};if(!s.gameConfig.freeConstruction&&s.resources.titanium<1)return{ok:false,message:"INSUFFICIENT TITANIUM"};if(!s.gameConfig.freeConstruction)s.resources.titanium--;o.built=true;s.pawn.op--;return{ok:true,message:"BUILD ITEM CONSTRUCTED · "+(getBuildable(o.type)?.legacyId??o.type).toUpperCase()+" · 1 AP SPENT"};}
export function applyDamageAt(s,x,y){const k=key(x,y),tile=s.map.tiles[k];const door=Object.values(s.map.objects).find(o=>o.family==="STR"&&o.built!==false&&["STR0002","STR0003","STR0004","STR0005"].includes(o.type)&&x>=o.x&&y>=o.y&&x<o.x+o.w&&y<o.y+o.h);let target=null,label="",field="integrity";if(door){target=door;label=door.type==="STR0002"||door.type==="STR0003"?"TITANIUM DOOR":"ALUMINIUM DOOR";}else if(tile?.aluminiumWall){target=tile;field="aluminiumWallIntegrity";label="ALUMINIUM WALL";}else if(tile?.wall){target=tile;field="wallIntegrity";label="HULL WALL";}else if(tile?.hull){target=tile;label="HULL FLOOR";}if(!target)return{ok:false,message:"NO DAMAGEABLE CONSTRUCTION ON THIS TILE"};const damage=1+Math.floor(Math.random()*25),before=target[field]??100,after=Math.max(25,before-damage);target[field]=after;return{ok:true,damage,before,after,label,message:label+" DAMAGED · -"+damage+"% · "+after+"% INTEGRITY"};}
export function endTurn(s){s.turn++;if((s.turn-1)%2===0)s.day++;advanceEnvironment(s);s.pawn.op=s.pawn.maxOP;return{message:"TURN ADVANCED · ENVIRONMENT UPDATED · OPERATIONAL POINTS RESTORED"};}
 
function seededRandom(seed){let state=(Number(seed)>>>0)||1;return()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};}
function bodyCellsFitCircle(cells,dx,dy,cx,cy,radius){return cells.every(cell=>Math.hypot(cell.x+dx-cx,cell.y+dy-cy)<=radius);}
function bodyCellsSeparated(cells,placed){const occupied=new Set();for(const body of placed)for(const cell of body.cells)occupied.add(key(cell.x,cell.y));for(const cell of cells){for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++)if(occupied.has(key(cell.x+ox,cell.y+oy)))return false;}return true;}
export function generateAsteroidForState(s,params={}){
 const total=Math.max(1,Math.min(8,Math.floor(Number(params.bodyCount)||1))),seed=Number(params.seed)>>>0,anchor=s.map.anchor??{x:192,y:64},majorW=Math.max(3,Math.floor(params.width||70)),majorH=Math.max(3,Math.floor(params.height||28)),rng=seededRandom(seed^0x71A57),cavityTotal=Math.max(0,Math.min(20,Math.floor(params.cavityCount||0))),percent=Math.max(0,Math.min(30,Number(params.cavitySizePercent)||0));
 const major=generateCosmicBody({seed,x:0,y:0,width:majorW,height:majorH,bodyCount:1,cavitySizePercent:percent,cavityCount:Math.floor(cavityTotal/total)+(cavityTotal%total>0?1:0),interior:"mixed",roundness:.82,irregularity:.12});
 const majorSolid=major.solidCells.length;if(!majorSolid)throw new Error("MAJOR BODY GENERATION FAILED");
 const radius=Math.min(62,Math.ceil(Math.max(majorW,majorH)*.5*1.25));
 const bodies=[{id:"MAJOR-01",role:"major",width:majorW,height:majorH,cells:major.cells,solidCells:major.solidCells,cavityTileCount:major.cavityTileCount,cavityGroupCount:major.cavityGroupCount,seed}];
 const placed=[{cells:major.cells.map(c=>({...c,x:c.x+anchor.x-Math.floor(majorW/2),y:c.y+anchor.y-Math.floor(majorH/2)}))}];
 const majorDX=anchor.x-Math.floor(majorW/2),majorDY=anchor.y-Math.floor(majorH/2);
 for(let i=0;i<major.cells.length;i++){major.cells[i].x+=majorDX;major.cells[i].y+=majorDY;major.cells[i].bodyId="MAJOR-01";major.cells[i].bodyRole="major";}
 const minorCount=total-1,minorBaseScale=minorCount?Math.min(.34,.34/Math.sqrt(minorCount)):0;
 for(let i=0;i<minorCount;i++){
   const scale=minorBaseScale*(.55+rng()*.25),mw=Math.max(3,Math.floor(majorW*scale)),mh=Math.max(3,Math.floor(majorH*scale));
   const cavitiesForBody=Math.floor(cavityTotal/total)+(i+1<cavityTotal%total?1:0);
   const generated=generateCosmicBody({seed:(seed+(i+1)*7919)>>>0,x:0,y:0,width:mw,height:mh,bodyCount:1,cavitySizePercent:percent,cavityCount:cavitiesForBody,interior:"mixed",roundness:.82,irregularity:.12});
   const candidates=[];
   for(let attempt=0;attempt<900;attempt++){
     const angle=rng()*Math.PI*2,radial=Math.sqrt(rng())*Math.max(1,radius-Math.max(mw,mh)*.5-1);
     const dx=Math.round(anchor.x+Math.cos(angle)*radial-Math.floor(mw/2)),dy=Math.round(anchor.y+Math.sin(angle)*radial-Math.floor(mh/2));
     if(!bodyCellsFitCircle(generated.cells,dx,dy,anchor.x,anchor.y,radius))continue;
     const candidate=generated.cells.map(c=>({...c,x:c.x+dx,y:c.y+dy}));
     if(!bodyCellsSeparated(candidate,placed))continue;
     candidates.push({dx,dy,candidate});break;
   }
   if(!candidates.length)throw new Error("NOT ENOUGH ROOM INSIDE GENERATION RADIUS FOR "+(minorCount)+" MINOR BODIES. REDUCE BODY COUNT OR SIZE.");
   const placement=candidates[0],id="MINOR-"+String(i+1).padStart(2,"0");
   for(const cell of generated.cells){cell.x+=placement.dx;cell.y+=placement.dy;cell.bodyId=id;cell.bodyRole="minor";}
   bodies.push({id,role:"minor",width:mw,height:mh,cells:generated.cells,solidCells:generated.solidCells,cavityTileCount:generated.cavityTileCount,cavityGroupCount:generated.cavityGroupCount,seed:generated.seed});
   placed.push({cells:placement.candidate});
 }
 const allCells=bodies.flatMap(body=>body.cells),solidCells=allCells.filter(c=>c.kind==="solid"),cavityCells=allCells.filter(c=>c.kind==="cavity");
 if(solidCells.filter(c=>c.bodyRole==="major").length/solidCells.length<.5)throw new Error("MAJOR BODY MUST CONTAIN AT LEAST 50% OF ALL ROCK TILES.");
 const body={id:"CLUSTER-"+String(seed).padStart(4,"0"),seed,x:anchor.x,y:anchor.y,width:majorW,height:majorH,bodies,cells:allCells,solidCells,occupiedTileCount:solidCells.length,cavityTileCount:cavityCells.length,cavityGroupCount:new Set(cavityCells.map(c=>c.cavityGroup)).size,bodyCount:total,majorBody:bodies[0],generationArea:{x:anchor.x,y:anchor.y,radius},outerLookup:Object.fromEntries(allCells.map(c=>[key(c.x,c.y),true])),cellLookup:Object.fromEntries(solidCells.map(c=>[key(c.x,c.y),c])),groundLookup:Object.fromEntries(cavityCells.map(c=>[key(c.x,c.y),c])),cavities:cavityCells.map(c=>({x:c.x,y:c.y,type:"ground",group:c.cavityGroup,bodyId:c.bodyId,walkable:true,fogExempt:true}))};
 s.map.asteroid=body;s.map.asteroidVisibility=createVisibility(body,{revealAll:s.gameConfig.devToolsEnabled});return body;
}
