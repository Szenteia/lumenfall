import {dungeonGrid} from './dungeon-grid.js';

// Stable row-major selection, with a one-cell gap between decorations.
// Only geometry is consulted: actors and collected treasure cannot move a mosaic.
export function selectFloorMosaics(tiles,layout) {
  const grid=dungeonGrid(tiles,layout),selected=[];
  if(!grid)return selected;
  for(let y=0;y<grid.height-1;y++)for(let x=0;x<grid.width-1;x++) {
    const cells=[[x,y],[x+1,y],[x,y+1],[x+1,y+1]];
    if(cells.some(([cx,cy])=>grid.floorIndex(cx,cy)<0||Math.abs(cx-2)+Math.abs(cy-6)<=1))continue;
    if(selected.some(p=>Math.abs(p.x-x)<3&&Math.abs(p.y-y)<3))continue;
    selected.push({x,y});
    if(selected.length===3)return selected;
  }
  return selected;
}

export function drawFloorMosaics(ctx,tiles,theme,size=40,layout) {
  const colors={mist:'#38505a',amber:'#665239',crystal:'#524566'};
  if(!Object.hasOwn(colors,theme?.id))return;
  for(const [variant,{x,y}] of selectFloorMosaics(tiles,layout).entries()) {
    ctx.save();ctx.translate((x+1)*size,(y+1)*size);ctx.scale(size/40,size/40);
    ctx.strokeStyle=colors[theme.id];ctx.lineWidth=1;
    const line=points=>{ctx.beginPath();points.forEach(([a,b],i)=>i?ctx.lineTo(a,b):ctx.moveTo(a,b));ctx.stroke();};
    if(variant===1) {
      if(theme.id==='mist') {
        // Etched guild lantern, not a filled pickup silhouette.
        line([[-12,-17],[12,-17],[9,16],[-9,16],[-12,-17]]);
        line([[-7,-21],[0,-27],[7,-21]]);
        line([[0,-9],[-5,4],[0,10],[5,4],[0,-9]]);
        line([[-17,22],[17,22]]);
      } else if(theme.id==='amber') {
        for(let i=0;i<8;i++) {
          const a=i*Math.PI/4,c=Math.cos(a),s=Math.sin(a);
          line([[c*9,s*9],[c*20-s*5,s*20+c*5],[c*29,s*29],[c*20+s*5,s*20-c*5],[c*9,s*9]]);
        }
      } else {
        for(let i=0;i<3;i++) {
          const a=i*Math.PI*2/3-Math.PI/2,c=Math.cos(a),s=Math.sin(a);
          line([[c*6,s*6],[c*17-s*7,s*17+c*7],[c*30,s*30],[c*17+s*7,s*17-c*7],[c*6,s*6]]);
        }
      }
    } else if(variant===2) {
      if(theme.id==='mist') {
        for(const sign of [-1,1]) {
          line([[sign*5,-28],[sign*18,-20],[sign*25,-7],[sign*25,7],[sign*18,20],[sign*5,28]]);
          line([[sign*7,-16],[sign*14,-9],[sign*14,9],[sign*7,16]]);
        }
      } else if(theme.id==='amber') {
        for(const sign of [-1,1]) {
          line([[-20,sign*5],[-20,sign*15],[-10,sign*15],[-10,sign*23],[10,sign*23],[10,sign*15],[20,sign*15],[20,sign*5]]);
        }
        line([[-8,0],[0,-8],[8,0],[0,8],[-8,0]]);
      } else {
        for(let i=0;i<5;i++) {
          const a=i*Math.PI*2/5,c=Math.cos(a),s=Math.sin(a);
          line([[c*19-s*4,s*19+c*4],[c*30,s*30],[c*24+s*8,s*24-c*8],[c*19-s*4,s*19+c*4]]);
        }
      }
    } else if(theme.id==='mist') {
      for(const [start,end] of [[.15,1.2],[1.4,2.8],[3.1,4.4],[4.7,6]]) {
        ctx.beginPath();ctx.arc(0,0,28,start,end);ctx.stroke();
      }
      line([[-17,-10],[-10,-17],[8,-18],[17,-9]]);
      line([[17,10],[9,17],[-8,18],[-17,9]]);
    } else if(theme.id==='amber') {
      line([[0,-23],[23,0],[0,23],[-23,0],[0,-23]]);
      line([[-11,-11],[11,-11],[11,11],[-11,11],[-11,-11]]);
      for(const [a,b] of [[0,-1],[1,0],[0,1],[-1,0]])line([[a*27,b*27],[a*32,b*32]]);
    } else {
      for(let i=0;i<6;i++) {
        const a=i*Math.PI/3,c=Math.cos(a),s=Math.sin(a);
        line([[c*10,s*10],[c*23-s*6,s*23+c*6],[c*31,s*31],[c*23+s*6,s*23-c*6],[c*10,s*10]]);
      }
    }
    ctx.restore();
  }
}
