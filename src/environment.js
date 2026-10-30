import {W,H,isDayId} from './daily.js';

// Visual version 1: deliberately independent of the versioned gameplay PRNG.
// Keep order/selection stable so an old expedition retains its surroundings.
export const ENVIRONMENTS = Object.freeze([
  Object.freeze({id:'mist',name:'Ködkő-romok',floor:'#17232b',floorAlt:'#1a2932',wall:'#344956',cap:'#526a75',edge:'#101a22',detail:'#293e49',vein:'#253a45'}),
  Object.freeze({id:'amber',name:'Borostyáncsarnok',floor:'#29231e',floorAlt:'#302920',wall:'#62503b',cap:'#897252',edge:'#1c1916',detail:'#463a29',vein:'#8b744a'}),
  Object.freeze({id:'crystal',name:'Kristálykripta',floor:'#211c30',floorAlt:'#282138',wall:'#493e60',cap:'#706181',edge:'#161322',detail:'#34304a',vein:'#41616c'}),
]);

export function environmentFor(dayId) {
  if (!isDayId(dayId)) return ENVIRONMENTS[0];
  let hash=2166136261;
  for(const c of `lumenfall-visual-v1:${dayId}`) hash=Math.imul(hash^c.charCodeAt(0),16777619)>>>0;
  return ENVIRONMENTS[hash%ENVIRONMENTS.length];
}

export function drawDungeon(ctx, tiles, theme, size=40) {
  ctx.save();
  ctx.fillStyle=theme.edge;ctx.fillRect(0,0,W*size,H*size);
  ctx.lineWidth=Math.max(1,size/40);
  const line=(color,points)=>{ctx.strokeStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++) {
    const wall=tiles[y*W+x]===1,left=x*size,top=y*size,unit=size/40;
    ctx.save();ctx.translate(left,top);ctx.scale(unit,unit);
    ctx.fillStyle=wall?theme.wall:((x+y)%2?theme.floor:theme.floorAlt);ctx.fillRect(1,1,38,38);
    if(wall) {
      ctx.fillStyle=theme.cap;ctx.fillRect(1,1,38,4);
      ctx.fillStyle=theme.edge;ctx.fillRect(1,35,38,4);
      line(theme.edge,[[2,21],[38,21]]);
      line(theme.edge,[[x%2?12:26,5],[x%2?12:26,21]]);
      if(theme.id==='mist') line(theme.vein,[[7,6],[11,11],[9,16],[14,20]]);
      if(theme.id==='amber') {line(theme.vein,[[4,9],[36,9]]);line(theme.vein,[[4,29],[36,29]]);}
      if(theme.id==='crystal') {line(theme.vein,[[7,32],[16,26],[21,16],[32,8]]);line(theme.vein,[[16,26],[29,28]]);}
    } else {
      // Details stay near slab edges, away from tactical markers and pickups.
      const variant=(x*17+y*31)%5;
      if(theme.id==='mist'&&variant<2) {
        line(theme.detail,[[3,8],[9,10],[12,7],[17,9]]);
        if(variant===0)line(theme.detail,[[9,10],[10,15]]);
      }
      if(theme.id==='amber') {
        line(theme.detail,[[4,12],[4,4],[12,4]]);
        line(theme.detail,[[28,36],[36,36],[36,28]]);
      }
      if(theme.id==='crystal'&&variant<3) {
        line(theme.detail,[[4,11],[11,4]]);line(theme.detail,[[5,16],[16,5]]);
      }
    }
    ctx.restore();
  }
  ctx.restore();
}

// One offscreen background (~1.35 MiB at 680×520), rebuilt only on visual/map change.
// prepare runs on state/UI refresh, never on an animation frame; paint is just a blit.
export function createDungeonBackground({createCanvas=()=>document.createElement('canvas'),render=drawDungeon,size=40}={}) {
  let canvas=null,key=null,theme=null;
  return {
    prepare(state) {
      if(!state)return null;
      const nextTheme=environmentFor(state.dayId),nextKey=`${nextTheme.id}:${state.tiles.join('')}`;
      if(nextKey!==key) {
        if(!canvas)canvas=createCanvas();
        canvas.width=W*size;canvas.height=H*size;
        render(canvas.getContext('2d'),state.tiles,nextTheme,size);
        key=nextKey;theme=nextTheme;
      }
      return theme;
    },
    paint(ctx){if(canvas)ctx.drawImage(canvas,0,0);},
  };
}
