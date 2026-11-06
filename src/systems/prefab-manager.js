import { MODULES, getModule } from "../data/modules/modules.js";

export const PREFABS = MODULES;

export function rotateTool(s,step){s.rotation=(s.rotation+step+4)%4;}
export function prefabSize(p,rotation){return rotation%2?{w:p.h,h:p.w}:{w:p.w,h:p.h};}
export function validatePrefabPlacement(s,id,x,y,rotation=s.rotation){
const p=getModule(id);if(!p)return{valid:false,message:"UNKNOWN MODULE"};
const {w,h}=prefabSize(p,rotation);let hullOverlap=0;
for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
const tx=x+xx,ty=y+yy,k=tx+","+ty;if(tx<0||ty<0||tx>=s.map.width||ty>=s.map.height)return{valid:false,message:"OUT OF MAP"};
const tile=s.map.tiles[k];
if(tile?.wall||Object.values(s.map.objects).some(o=>tx>=o.x&&ty>=o.y&&tx<o.x+o.w&&ty<o.y+o.h))return{valid:false,message:"TILE BLOCKED"};
if(tile?.hull)hullOverlap++;else if(!p.edge)return{valid:false,message:"HULL REQUIRED · MODULE MUST BE PLACED ON HULL"};
}
if(p.edge){if(hullOverlap<1||hullOverlap>=w*h)return{valid:false,message:"DRIVE MUST OVERLAP HULL AND EXTEND OUTSIDE"};}
else if(hullOverlap!==w*h)return{valid:false,message:"HULL REQUIRED · ALL MODULE TILES MUST BE ON HULL"};
return{valid:true,message:p.name+" READY",w,h};
}
export function placePrefab(s,id,x,y){
const p=getModule(id),check=validatePrefabPlacement(s,id,x,y);
if(!check.valid)return{message:check.message};
const idValue="module-"+s.nextObjectId++;
s.map.objects[idValue]={id:idValue,type:p.id,x,y,w:check.w,h:check.h,rotation:s.rotation,built:false};
return{message:p.name+" BLUEPRINT PLACED · 1 TITANIUM · 1 AP",objectId:idValue};
}
