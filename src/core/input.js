export function bindInput(canvas,state,renderer,refresh) {
  let panning=false,painting=false,last=null;
  function screenToGrid(clientX,clientY) {
    const rect=canvas.getBoundingClientRect(),view=renderer.getView(),size=state.map.tileSize*state.camera.zoom;
    return {x:Math.floor(state.camera.x+(clientX-rect.left-view.width/2)/size),y:Math.floor(state.camera.y+(clientY-rect.top-view.height/2)/size)};
  }
  function paintAt(clientX,clientY) {
    const tile=screenToGrid(clientX,clientY);
    if(tile.x<0||tile.y<0||tile.x>=state.map.width||tile.y>=state.map.height)return;
    const key=`${tile.x},${tile.y}`;
    if(state.activeTool==="erase") delete state.map.tiles[key];
    else state.map.tiles[key]=state.activeTool;
    renderer.draw();
    refresh();
  }
  canvas.addEventListener("pointerdown",event=>{
    if(event.button===1||event.button===2){panning=true;last={x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);event.preventDefault();return;}
    if(event.button===0){painting=true;canvas.setPointerCapture(event.pointerId);paintAt(event.clientX,event.clientY);}
  });
  canvas.addEventListener("pointermove",event=>{
    if(panning&&last){const size=state.map.tileSize*state.camera.zoom;state.camera.x-=(event.clientX-last.x)/size;state.camera.y-=(event.clientY-last.y)/size;last={x:event.clientX,y:event.clientY};renderer.draw();}
    else if(painting) paintAt(event.clientX,event.clientY);
  });
  function stop(){panning=false;painting=false;last=null;}
  canvas.addEventListener("pointerup",stop);canvas.addEventListener("pointercancel",stop);
  canvas.addEventListener("contextmenu",event=>event.preventDefault());
  canvas.addEventListener("wheel",event=>{event.preventDefault();state.camera.zoom=Math.max(.35,Math.min(2.4,state.camera.zoom*(event.deltaY<0?1.1:.9)));renderer.draw();},{passive:false});
}