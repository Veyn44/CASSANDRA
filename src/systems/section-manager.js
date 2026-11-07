const key=(x,y)=>x+","+y;
const DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
const SCAN_DIRS=[[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
const PRESSURE_STATES=["VACUUM","LOW","OPTIMAL","HIGH","EXTREME"];
const DOOR_TYPES=new Set(["STR0002","STR0003","STR0004","STR0005"]);

function doorAt(s,x,y){
  return Object.values(s.map.objects).find(o=>DOOR_TYPES.has(o.type)&&o.built!==false&&
    x>=o.x&&y>=o.y&&x<o.x+o.w&&y<o.y+o.h)??null;
}
function isAirtightDoor(door){
  return Boolean(door&&["STR0002","STR0003"].includes(door.type)&&door.closed!==false);
}
function isFloor(s,x,y,tile=s.map.tiles[key(x,y)]){
  return Boolean(tile?.hull&&!tile.wall&&!tile.aluminiumWall&&!doorAt(s,x,y));
}
function isSealedBoundary(s,x,y){
  const tile=s.map.tiles[key(x,y)];
  if(tile?.wall)return true;
  return isAirtightDoor(doorAt(s,x,y));
}
function panelObjects(s){
  return Object.values(s.map.objects).filter(o=>o.type==="MOD0014"&&o.built!==false);
}
function vacuumArea(s){
  const hullCoords=Object.entries(s.map.tiles).filter(([,tile])=>tile?.hull)
    .map(([tileKey])=>tileKey.split(",").map(Number));
  if(!hullCoords.length)return new Set();
  const minX=Math.max(0,Math.min(...hullCoords.map(p=>p[0]))-2);
  const maxX=Math.min(s.map.width-1,Math.max(...hullCoords.map(p=>p[0]))+2);
  const minY=Math.max(0,Math.min(...hullCoords.map(p=>p[1]))-2);
  const maxY=Math.min(s.map.height-1,Math.max(...hullCoords.map(p=>p[1]))+2);
  const vacuumSet=new Set(),queue=[];
  for(let x=minX;x<=maxX;x++){queue.push({x,y:minY},{x,y:maxY});}
  for(let y=minY+1;y<maxY;y++){queue.push({x:minX,y},{x:maxX,y});}
  for(let i=0;i<queue.length;i++){
    const p=queue[i],k=key(p.x,p.y);
    if(vacuumSet.has(k)||s.map.tiles[k]?.hull)continue;
    vacuumSet.add(k);
    for(const [dx,dy] of DIRS){
      const nx=p.x+dx,ny=p.y+dy,nk=key(nx,ny);
      if(nx<minX||nx>maxX||ny<minY||ny>maxY||vacuumSet.has(nk)||s.map.tiles[nk]?.hull)continue;
      queue.push({x:nx,y:ny});
    }
  }
  return vacuumSet;
}

export function detectSections(s){
  const tileToSection={},byId={},sections=[],seen=new Set();
  const floors=Object.entries(s.map.tiles).filter(([tileKey,tile])=>{
    const [x,y]=tileKey.split(",").map(Number);
    return isFloor(s,x,y,tile);
  });
  for(const [tileKey] of floors){
    if(seen.has(tileKey))continue;
    const [sx,sy]=tileKey.split(",").map(Number),queue=[{x:sx,y:sy}],tiles=[];
    seen.add(tileKey);
    for(let i=0;i<queue.length;i++){
      const p=queue[i];tiles.push(p);
      for(const [dx,dy] of DIRS){
        const nx=p.x+dx,ny=p.y+dy,nk=key(nx,ny);
        if(seen.has(nk)||!isFloor(s,nx,ny))continue;
        seen.add(nk);queue.push({x:nx,y:ny});
      }
    }
    const id="SECTION-"+String(sections.length+1).padStart(2,"0");
    const section={id,name:"SECTION "+String(sections.length+1).padStart(2,"0"),tiles,
      tileCount:tiles.length,panels:[],airtight:true,atmosphere:"NONE",
      pressure:"VACUUM",temperature:null,environment:"UNMANAGED"};
    for(const p of tiles)tileToSection[key(p.x,p.y)]=id;
    sections.push(section);byId[id]=section;
  }

  for(const section of sections){
    const ownTiles=new Set(section.tiles.map(p=>key(p.x,p.y)));
    let airtight=true;
    outer: for(const p of section.tiles)for(const [dx,dy] of DIRS){
      const nx=p.x+dx,ny=p.y+dy,nk=key(nx,ny);
      if(ownTiles.has(nk))continue;
      if(!isSealedBoundary(s,nx,ny)){airtight=false;break outer;}
    }
    section.airtight=airtight;
  }

  const result={sections,byId,tileToSection,panels:[],vacuumSet:vacuumArea(s)};
  for(const panel of panelObjects(s)){
    const sectionId=tileToSection[key(panel.x,panel.y)]??null;
    const section=sectionId?byId[sectionId]:null;
    const record={id:panel.id,name:panel.sectionName??section?.name??"UNASSIGNED",
      x:panel.x,y:panel.y,rotation:panel.rotation??0,sectionId};
    if(section){
      section.panels.push(record);
      if(panel.sectionName)section.name=panel.sectionName;
    }
    result.panels.push(record);
  }

  for(const section of sections){
    if(!section.airtight){
      section.atmosphere="NONE";section.pressure="VACUUM";
      section.temperature=null;section.environment="UNSEALED";
    }else if(section.panels.length){
      section.atmosphere="PRESENT";section.pressure="OPTIMAL";
      section.temperature=24;section.environment="HABITABLE";
    }else{
      section.atmosphere="NONE";section.pressure="VACUUM";
      section.temperature=null;section.environment="UNMANAGED";
    }
  }
  return result;
}

export function getVacuumInfo(){
  return{type:"VACUUM",name:"VACUUM SECTION",weight:1000000,
    atmosphere:"NONE",pressure:"VACUUM",temperature:-270,
    environment:"VACUUM",boundary:"EXTERNAL"};
}

export function getSectionInfo(section){
  if(!section)return null;
  return{type:"SECTION",id:section.id,name:section.name,weight:null,
    atmosphere:section.atmosphere,pressure:section.pressure,
    temperature:section.temperature,environment:section.environment,
    airtightness:section.airtight?"SEALED":"UNSEALED",
    activeTiles:section.tileCount};
}

export function completeSectionScan(s,section){
  if(!section)return{ok:false,message:"NO SECTION SELECTED"};
  if(s.pawn.op<2)return{ok:false,message:"NOT ENOUGH AP · 2 AP REQUIRED"};
  const floors=section.tiles.map(p=>{
    const tile=s.map.tiles[key(p.x,p.y)];
    return{type:"HULL FLOOR",x:p.x,y:p.y,integrity:tile.integrity??100};
  });
  const walls=new Map();
  for(const p of section.tiles)for(const [dx,dy] of SCAN_DIRS){
    const x=p.x+dx,y=p.y+dy,tile=s.map.tiles[key(x,y)];
    if(!tile||(!tile.wall&&!tile.aluminiumWall))continue;
    const tileKey=key(x,y);
    if(!walls.has(tileKey))walls.set(tileKey,{
      type:tile.aluminiumWall?"ALUMINIUM WALL":"HULL WALL",x,y,
      integrity:tile.aluminiumWall?(tile.aluminiumWallIntegrity??100):(tile.wallIntegrity??100)
    });
  }
  s.pawn.op-=2;
  return{ok:true,apSpent:2,sectionId:section.id,floors,walls:[...walls.values()],
    message:"COMPLETE SCAN FINISHED · 2 AP SPENT"};
}

export function pressureStates(){return [...PRESSURE_STATES];}
