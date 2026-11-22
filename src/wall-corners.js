import {dungeonGrid} from './dungeon-grid.js';

// Cosmetic geometry only. Outside the map is never considered floor.
export function wallCorners(tiles, layout) {
  const grid=dungeonGrid(tiles,layout);
  if(!grid)return [];
  for(let i=0;i<tiles.length;i++)if(tiles[i]!==0&&tiles[i]!==1)return [];
  const corners=[];
  for(let y=0;y<grid.height;y++)for(let x=0;x<grid.width;x++) {
    if(tiles[y*grid.width+x]!==1)continue;
    for(const [dx,dy] of [[-1,-1],[1,-1],[1,1],[-1,1]]) {
      if(grid.floorIndex(x+dx,y)>=0&&grid.floorIndex(x,y+dy)>=0)corners.push({x,y,dx,dy});
    }
  }
  return corners;
}

// Filled shapes avoid stroke spill. Each arm is <=10px long and <=4px thick.
// The central [8,32] square is untouched, leaving room for wall lights.
export function drawWallCorners(ctx, tiles, theme, size=40, layout) {
  if(!Number.isFinite(size)||size<=0)return;
  const corners=wallCorners(tiles,layout);
  if(!corners.length)return;
  const u=size/40;
  ctx.save();
  for(const {x,y,dx,dy} of corners) {
    const shape=(color,points)=>{
      ctx.fillStyle=color;ctx.beginPath();
      points.forEach(([a,b],i)=>{
        const px=x*size+(dx<0?a:40-a)*u,py=y*size+(dy<0?b:40-b)*u;
        if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);
      });
      ctx.closePath();ctx.fill();
    };
    if(theme.id==='amber') {
      shape(theme.cap,[[1,1],[11,1],[11,4],[4,4],[4,11],[1,11]]);
      shape(theme.vein,[[2,2],[9,2],[9,3],[3,3],[3,9],[2,9]]);
      shape(theme.edge,[[6,1],[7,1],[7,4],[6,4]]);
      shape(theme.edge,[[1,6],[4,6],[4,7],[1,7]]);
    } else if(theme.id==='crystal') {
      shape(theme.cap,[[3,1],[11,1],[9,4],[4,4],[4,9],[1,11],[1,3]]);
      shape(theme.vein,[[3,2],[8,2],[5,3],[3,5],[2,8],[2,3]]);
    } else {
      shape(theme.cap,[[1,1],[10,1],[11,3],[8,5],[5,4],[4,8],[5,10],[1,11]]);
      shape(theme.edge,[[6,1],[7,1],[6,4],[5,4]]);
      shape(theme.edge,[[1,6],[4,5],[4,6],[1,7]]);
    }
  }
  ctx.restore();
}
