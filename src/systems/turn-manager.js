const key=(x,y)=>x+","+y;
const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
export function createInitialState(){const tiles={};for(let y=62;y<=66;y++)for(let x=62;x<=66;x++)tiles[key(x,y)]={hull:true,wall:false,hp:100};return{turn:1,day:1,devMode:false,resources:{titanium:100,water:20,ice:0,oxygen:100,hydrogen:20},activeTool:null,selectedPrefab:null,selectedObject:null,rotation:0,nextObjectId:1,hoverTile:null,map:{width:128,height:128,tileSize:28,gridVisible:true,tiles,plans:{},objects:{},core:{x:64,y:64}},pawn:{id:"researcher-01",name:"Researcher",x:64,y:64,level:1,maxOP:10,op:10,selected:true,health:100},camera:{x:64,y:64,zoom:1},selection:"researcher-01"};}
export function connectedHullSet(s){const seen=new Set(),q=[s.map.core];seen.add(key(q[0].x,q[0].y));for(let i=0;i<q.length;i++){const p=q[i];for(const[dx,dy]of dirs){const x=p.x+dx,y=p.y+dy,k=key(x,y),t=s.map.tiles[k];if(t?.hull&&!seen.has(k)){seen.add(k);q.push({x,y});}}}return seen;}
export function connectedHullCount(s){return connectedHullSet(s).size;}
export function isBlocked(s,x,y){const t=s.map.tiles[key(x,y)];if(!t?.hull||t.wall)return true;return Object.values(s.map.objects).some(o=>x>=o.x&&y>=o.y&&x<o.x+o.w&&y<o.y+o.h);}
function findPath(s,target){const start={x:s.pawn.x,y:s.pawn.y},q=[start],came=new Map([[key(start.x,start.y),null]]);for(let i=0;i<q.length;i++){const p=q[i],pk=key(p.x,p.y);if(p.x===target.x&&p.y===target.y){const path=[];let k=pk;while(k!==null){const[a,b]=k.split(",").map(Number);path.push({x:a,y:b});k=came.get(k);}return path.reverse();}for(const[dx,dy]of dirs){const x=p.x+dx,y=p.y+dy,k=key(x,y);if(x<0||y<0||x>=128||y>=128||came.has(k)||isBlocked(s,x,y))continue;came.set(k,pk);q.push({x,y});}}return null;}
function workPositions(s,x,y,type){const result=[];if(type==="hull"){const connected=connectedHullSet(s);for(const[dx,dy]of dirs){const k=key(x+dx,y+dy);if(connected.has(k)&&!isBlocked(s,x+dx,y+dy))result.push({x:x+dx,y:y+dy});}}else{for(const[dx,dy]of dirs){const xx=x+dx,yy=y+dy;if(!isBlocked(s,xx,yy))result.push({x:xx,y:yy});}}return result;}
export function performPlanAction(s,x,y){
const k=key(x,y),plan=s.map.plans[k],tile=s.map.tiles[k];if(!plan)return{ok:false,message:"NO CONSTRUCTION PLAN HERE"};
if(s.pawn.op<2)return{ok:false,message:"NOT ENOUGH AP · 2 AP REQUIRED"};
if(plan.type==="hull"){if(tile?.hull||!dirs.some(([dx,dy])=>connectedHullSet(s).has(key(x+dx,y+dy))))return{ok:false,message:"HULL PLAN NOT CONNECTED TO SHIP"};}
else if(plan.type==="wall"&&(!tile?.hull||tile.wall))return{ok:false,message:"WALL REQUIRES COMPLETED HULL"};
else if(plan.type==="demolishWall"&&(!tile?.hull||!tile.wall))return{ok:false,message:"NO WALL TO DEMOLISH"};
else if(plan.type==="demolishHull"&&(!tile?.hull||tile.wall))return{ok:false,message:"REMOVE WALL BEFORE HULL"};
const cost=plan.type==="hull"||plan.type==="wall";if(cost&&!s.devMode&&s.resources.titanium<1)return{ok:false,message:"INSUFFICIENT TITANIUM"};
const spots=workPositions(s,x,y,plan.type);let chosen=null,path=null;for(const spot of spots){const candidate=findPath(s,spot);if(candidate&&(!path||candidate.length<path.length)){chosen=spot;path=candidate;}}
if(!chosen)return{ok:false,message:"NO ACCESSIBLE WORKING POSITION"};
// Movement is free and resolves immediately; only the single work action consumes AP.
s.pawn.x=chosen.x;s.pawn.y=chosen.y;
if(cost&&!s.devMode)s.resources.titanium--;
if(plan.type==="hull")s.map.tiles[k]={hull:true,wall:false,hp:100};
else if(plan.type==="wall")tile.wall=true;
else if(plan.type==="demolishWall")tile.wall=false;
else if(plan.type==="demolishHull")delete s.map.tiles[k];
s.pawn.op-=2;delete s.map.plans[k];return{ok:true,message:"ACTION COMPLETE · "+plan.type.toUpperCase()+" · 2 AP SPENT"};
}
export function endTurn(s){s.turn++;if((s.turn-1)%2===0)s.day++;s.pawn.op=s.pawn.maxOP;return{message:"TURN ADVANCED · SHIP MAINTENANCE UPDATED · OPERATIONAL POINTS RESTORED"};}
