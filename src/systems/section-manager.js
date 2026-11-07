const key=(x,y)=>x+","+y;
const DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
const PRESSURE_STATES=["VACUUM","LOW","OPTIMAL","HIGH","EXTREME"];

function isFloor(tile){return Boolean(tile?.hull&&!tile.wall&&!tile.aluminiumWall);}
function wallAt(s,x,y){const t=s.map.tiles[key(x,y)];return Boolean(t?.wall||t?.aluminiumWall);}
function doorAt(s,x,y){return Object.values(s.map.objects).some(o=>o.family==="STR"&&o.type!=="STR0001"&&o.x===x&&o.y===y&&o.built!==false);}
function separates(s,a,b){
  // Walls and doors occupy their own boundary tile. A door always preserves
  // section identity, regardless of its open/closed state.
  if(doorAt(s,a.x,a.y)||doorAt(s,b.x,b.y))return true;
  return Boolean(s.map.tiles[key(a.x,a.y)]?.aluminiumWall||s.map.tiles[key(b.x,b.y)]?.aluminiumWall);
}
function panelObjects(s){return Object.values(s.map.objects).filter(o=>o.type==="MOD0014"&&o.built!==false);}
function sectionForPanel(s,panel,sections){
  const adjacent=[sections.tileToSection[key(panel.x,panel.y)],...[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>sections.tileToSection[key(panel.x+dx,panel.y+dy)])].filter(Boolean);
  return adjacent.length?sections.byId[adjacent[0]]??null:null;
}

export function detectSections(s){
  const tileToSection={},byId={},sections=[],seen=new Set();
  const floors=Object.entries(s.map.tiles).filter(([,t])=>isFloor(t));
  for(const [tileKey] of floors){
    if(seen.has(tileKey))continue;
    const [sx,sy]=tileKey.split(",").map(Number),queue=[{x:sx,y:sy}],tiles=[];
    seen.add(tileKey);
    for(let i=0;i<queue.length;i++){
      const p=queue[i];tiles.push(p);
      for(const [dx,dy] of DIRS){
        const n={x:p.x+dx,y:p.y+dy},nk=key(n.x,n.y);
        if(seen.has(nk)||!isFloor(s.map.tiles[nk])||separates(s,p,n))continue;
        seen.add(nk);queue.push(n);
      }
    }
    const id="SECTION-"+String(sections.length+1).padStart(2,"0");
    const section={id,name:"SECTION "+String(sections.length+1).padStart(2,"0"),tiles,tileCount:tiles.length,panels:[],airtight:true,atmosphere:"PRESENT",pressure:"OPTIMAL",temperature:24,environment:"HABITABLE"};
    for(const p of tiles)tileToSection[key(p.x,p.y)]=id;
    sections.push(section);byId[id]=section;
  }
  // A section is airtight only when every exposed edge is protected by a
  // Hull Wall or a closed airtight door. Interior partitions are not seals.
  for(const section of sections){
    outer: for(const p of section.tiles)for(const [dx,dy] of DIRS){
      const nx=p.x+dx,ny=p.y+dy,nt=s.map.tiles[key(nx,ny)];
      if(section.tiles.some(t=>t.x===nx&&t.y===ny))continue;
      const boundaryTile=s.map.tiles[key(p.x,p.y)];
      const hasHullWall=Boolean(boundaryTile?.wall||nt?.wall);
      const door=Object.values(s.map.objects).find(o=>o.family==="STR"&&["STR0002","STR0003"].includes(o.type)&&o.built!==false&&nx>=o.x&&ny>=o.y&&nx<o.x+o.w&&ny<o.y+o.h);
      const sealedBoundary=door?door.closed!==false:hasHullWall;
      if(!sealedBoundary){section.airtight=false;break outer;}
    }
    if(!section.airtight){section.atmosphere="NONE";section.pressure="VACUUM";section.temperature=-270;section.environment="VACUUM";}
  }
  const result={sections,byId,tileToSection,panels:[]};
  for(const panel of panelObjects(s)){
    const section=sectionForPanel(s,panel,result);
    const record={id:panel.id,name:panel.sectionName??section?.name??"UNASSIGNED",x:panel.x,y:panel.y,rotation:panel.rotation??0,sectionId:section?.id??null};
    if(section){section.panels.push(record);if(panel.sectionName)section.name=panel.sectionName;}
    result.panels.push(record);
  }
  for(const section of sections){
    if(section.panels.length){section.atmosphere=section.airtight?"PRESENT":"NONE";section.pressure=section.airtight?"OPTIMAL":"VACUUM";section.temperature=section.airtight?24:-270;section.environment=section.airtight?"HABITABLE":"VACUUM";}
    else{section.atmosphere="NONE";section.pressure="VACUUM";section.temperature=-270;section.environment="UNMANAGED";}
  }
  return result;
}

export function getVacuumInfo(){return{type:"VACUUM",name:"VACUUM SECTION",weight:1000000,atmosphere:"NONE",pressure:"VACUUM",temperature:-270,environment:"VACUUM",boundary:"EXTERNAL"};}

export function getSectionInfo(section){
  if(!section)return null;
  return{type:"SECTION",id:section.id,name:section.name,weight:1000000,atmosphere:section.atmosphere,pressure:section.pressure,temperature:section.temperature,environment:section.environment,airtightness:section.airtight?"SEALED":"UNSEALED",activeTiles:section.tileCount};
}

export function completeSectionScan(s,section){
  if(!section)return{ok:false,message:"NO SECTION SELECTED"};
  if(s.pawn.op<2)return{ok:false,message:"NOT ENOUGH AP · 2 AP REQUIRED"};
  const tiles=section.tiles.map(p=>{const t=s.map.tiles[key(p.x,p.y)];return{type:"HULL FLOOR",x:p.x,y:p.y,integrity:t.integrity??100};});
  const adjacent=new Map();
  for(const p of section.tiles){const own=s.map.tiles[key(p.x,p.y)];if(own?.wall||own?.aluminiumWall)adjacent.set(key(p.x,p.y),{type:own.aluminiumWall?"ALUMINIUM WALL":"HULL WALL",x:p.x,y:p.y,integrity:own.aluminiumWall?(own.aluminiumWallIntegrity??100):(own.wallIntegrity??100)});}
  const scanDirs=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
  for(const p of section.tiles)for(const [dx,dy] of scanDirs){
    const x=p.x+dx,y=p.y+dy,t=s.map.tiles[key(x,y)];
    if(!t||!t.wall&&!t.aluminiumWall)continue;
    const k=key(x,y);if(adjacent.has(k))continue;
    adjacent.set(k,{type:t.aluminiumWall?"ALUMINIUM WALL":"HULL WALL",x,y,integrity:t.aluminiumWall?(t.aluminiumWallIntegrity??100):(t.wallIntegrity??100)});
  }
  s.pawn.op-=2;
  return{ok:true,apSpent:2,sectionId:section.id,floors:tiles,walls:[...adjacent.values()],message:"COMPLETE SCAN FINISHED · 2 AP SPENT"};
}

export function pressureStates(){return [...PRESSURE_STATES];}
