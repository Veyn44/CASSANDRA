const COLORS = { background:"#0a1119", grid:"rgba(117,145,163,.22)", floor:"#737d84", floorEdge:"#10171d", wall:"#7e878d", wallDark:"#171e24", pawn:"#e35e68", pawnEdge:"#ff9b9e", selection:"#d8e9f2" };
export function createRenderer(canvas, state) {
  const ctx = canvas.getContext("2d");
  const view = { width:0, height:0, dpr:1 };
  function resize() {
    const rect = canvas.getBoundingClientRect();
    view.dpr = Math.min(window.devicePixelRatio || 1, 2);
    view.width = rect.width; view.height = rect.height;
    canvas.width = Math.round(rect.width * view.dpr);
    canvas.height = Math.round(rect.height * view.dpr);
    ctx.setTransform(view.dpr,0,0,view.dpr,0,0);
  }
  function worldToScreen(x,y) {
    const size=state.map.tileSize*state.camera.zoom;
    return {x:(x-state.camera.x)*size+view.width/2,y:(y-state.camera.y)*size+view.height/2};
  }
  function drawSpeckles(x,y,p,size) {
    // Deterministic, very restrained blue metallic flecks; no random shimmer between frames.
    for(let i=0;i<5;i++) {
      const sx=((x*17+y*31+i*13)%23)/23;
      const sy=((x*29+y*11+i*7)%23)/23;
      ctx.fillStyle=i%2===0?"rgba(119,165,194,.34)":"rgba(170,198,215,.2)";
      const dot=Math.max(.7,size*.035);
      ctx.fillRect(p.x+size*(.16+sx*.68),p.y+size*(.16+sy*.68),dot,dot);
    }
  }
  function drawTile(x,y,type,p,size) {
    if(type==="floor") {
      ctx.fillStyle=COLORS.floor; ctx.fillRect(p.x,p.y,size,size);
      drawSpeckles(x,y,p,size);
      ctx.strokeStyle=COLORS.floorEdge; ctx.lineWidth=Math.max(1,size*.045);
      ctx.strokeRect(p.x+ctx.lineWidth/2,p.y+ctx.lineWidth/2,size-ctx.lineWidth,size-ctx.lineWidth);
    } else if(type==="wall") {
      ctx.fillStyle=COLORS.wallDark; ctx.fillRect(p.x,p.y,size,size);
      ctx.fillStyle=COLORS.wall; ctx.fillRect(p.x+size*.09,p.y+size*.09,size*.82,size*.82);
      ctx.fillStyle="rgba(220,231,237,.16)"; ctx.fillRect(p.x+size*.12,p.y+size*.12,size*.76,size*.055);
      ctx.fillStyle="rgba(0,0,0,.22)"; ctx.fillRect(p.x+size*.12,p.y+size*.82,size*.76,size*.055);
      drawSpeckles(x,y,p,size*.7);
      ctx.strokeStyle="#090e13"; ctx.lineWidth=Math.max(1.4,size*.07);
      ctx.strokeRect(p.x+ctx.lineWidth/2,p.y+ctx.lineWidth/2,size-ctx.lineWidth,size-ctx.lineWidth);
    }
  }
  function draw() {
    const size=state.map.tileSize*state.camera.zoom;
    ctx.clearRect(0,0,view.width,view.height); ctx.fillStyle=COLORS.background; ctx.fillRect(0,0,view.width,view.height);
    ctx.fillStyle="rgba(180,207,224,.18)";
    for(let i=0;i<90;i++){const x=(i*197+31)%Math.max(1,view.width),y=(i*113+17)%Math.max(1,view.height);ctx.fillRect(x,y,1,1);}
    const left=Math.max(0,Math.floor(state.camera.x-view.width/(2*size))-1);
    const right=Math.min(state.map.width,Math.ceil(state.camera.x+view.width/(2*size))+1);
    const top=Math.max(0,Math.floor(state.camera.y-view.height/(2*size))-1);
    const bottom=Math.min(state.map.height,Math.ceil(state.camera.y+view.height/(2*size))+1);
    for(let y=top;y<bottom;y++) for(let x=left;x<right;x++) {
      const p=worldToScreen(x,y);
      const type=state.map.tiles[`${x},${y}`];
      if(type) drawTile(x,y,type,p,size);
      if(state.map.gridVisible) {
        ctx.strokeStyle=type?"rgba(8,14,19,.23)":COLORS.grid;
        ctx.lineWidth=1; ctx.strokeRect(p.x+.5,p.y+.5,size,size);
      }
    }
    // Keep the researcher marker as a temporary placeholder until character sprites exist.
    const pawn=state.pawn, pp=worldToScreen(pawn.x,pawn.y), inset=size*.31;
    if(pawn.selected) {ctx.strokeStyle=COLORS.selection;ctx.lineWidth=1.5;ctx.strokeRect(pp.x+size*.16,pp.y+size*.16,size*.68,size*.68);}
    ctx.fillStyle=COLORS.pawn;ctx.fillRect(pp.x+inset,pp.y+inset,size-inset*2,size-inset*2);
    ctx.strokeStyle=COLORS.pawnEdge;ctx.lineWidth=1;ctx.strokeRect(pp.x+inset,pp.y+inset,size-inset*2,size-inset*2);
  }
  resize();
  return {draw,resize,worldToScreen,getView:()=>view};
}