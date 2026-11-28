import {dungeonGrid} from './dungeon-grid.js';

// Cosmetic placement only: no gameplay RNG or persisted state.
export function wallLights(tiles, layout) {
  const grid=dungeonGrid(tiles,layout);
  if(!grid)return [];
  const candidates=[];
  for(let y=0;y<grid.height;y++)for(let x=0;x<grid.width;x++) {
    if(tiles[y*grid.width+x]!==1)continue;
    if(![[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>grid.floorIndex(x+dx,y+dy)>=0))continue;
    const rank=(Math.imul(x+1,73856093)^Math.imul(y+1,19349663))>>>0;
    candidates.push({x,y,rank});
  }
  candidates.sort((a,b)=>a.rank-b.rank||a.y-b.y||a.x-b.x);
  const selected=[];
  for(const {x,y} of candidates) {
    if(selected.every(p=>Math.abs(p.x-x)+Math.abs(p.y-y)>=4))selected.push({x,y});
    if(selected.length===8)break;
  }
  return selected;
}

// All geometry stays within the 40×40 wall tile; no shadows spill onto floors.
export function drawWallLight(ctx,id) {
  const color=id==='amber'?'#ffc76b':id==='crystal'?'#a2eced':'#b7e9df';
  const polygon=(points,fill)=>{
    ctx.fillStyle=fill;ctx.beginPath();
    points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
    ctx.closePath();ctx.fill();
  };
  ctx.save();
  ctx.fillStyle=id==='amber'?'#806039':id==='crystal'?'#466072':'#466969';
  ctx.fillRect(8,8,24,24);
  ctx.fillStyle='#18242d';ctx.fillRect(17,7,6,27);
  if(id==='amber') {
    polygon([[12,25],[15,32],[25,32],[28,25]],'#312329');
    polygon([[13,24],[16,16],[20,20],[23,10],[27,24]],color);
    polygon([[18,24],[21,18],[24,24]],'#fff0b9');
    ctx.fillStyle='#c38b4c';ctx.fillRect(12,25,16,3);
  } else if(id==='crystal') {
    polygon([[11,26],[10,17],[15,14],[19,27]],'#69a8bb');
    polygon([[18,29],[17,14],[22,7],[26,16],[24,29]],color);
    polygon([[24,29],[26,20],[30,16],[31,26]],'#7697ca');
    polygon([[19,15],[22,10],[22,26]],'#e2ffff');
    ctx.fillStyle='#283242';ctx.fillRect(13,30,16,3);
  } else {
    ctx.fillStyle='#a4bcb9';ctx.fillRect(19,6,2,7);
    polygon([[13,15],[16,11],[24,11],[27,15]],'#223b45');
    ctx.fillStyle=color;ctx.fillRect(14,16,12,12);
    ctx.fillStyle='#f0ffe9';ctx.fillRect(18,18,4,8);
    ctx.fillStyle='#223b45';ctx.fillRect(12,14,16,3);ctx.fillRect(12,28,16,3);
    ctx.fillRect(13,16,2,12);ctx.fillRect(25,16,2,12);
  }
  ctx.restore();
}
