import {dungeonGrid} from './dungeon-grid.js';

// Static floor-edge strips. Explicit bounds prevent row wrapping; no gameplay RNG.
export function wallShadowRects(tiles, size=40, layout) {
  const grid=dungeonGrid(tiles,layout);
  if(!grid||!Number.isFinite(size)||size<=0)return [];
  for(const tile of tiles)if(tile!==0&&tile!==1)return [];
  const {width,height}=grid,depth=size*3/40,rects=[];
  const wall=(x,y)=>x>=0&&x<width&&y>=0&&y<height&&tiles[y*width+x]===1;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++) {
    if(tiles[y*width+x]!==0)continue;
    const left=x*size,top=y*size,north=wall(x,y-1),south=wall(x,y+1);
    if(north)rects.push([left,top,size,depth]);
    if(south)rects.push([left,top+size-depth,size,depth]);
    // Side strips exclude the horizontal strips: even translucent callers
    // never darken a corner twice.
    const inset=north?depth:0,span=size-inset-(south?depth:0);
    if(wall(x-1,y))rects.push([left,top+inset,depth,span]);
    if(wall(x+1,y))rects.push([left+size-depth,top+inset,depth,span]);
  }
  return rects;
}

export function drawWallShadows(ctx,tiles,theme,size=40,layout) {
  const rects=wallShadowRects(tiles,size,layout);
  if(!rects.length)return;
  ctx.save();
  ctx.fillStyle=theme.edge;
  for(const rect of rects)ctx.fillRect(...rect);
  ctx.restore();
}
