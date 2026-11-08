import {isDayId} from './daily.js';

// Experimental generator identity, not a supported game/save rulesVersion.
export const EXPANDED_GENERATOR_VERSION='expanded-ring-v1';
export const EXPANDED_SIZE=Object.freeze({width:21,height:15});

export function generateExpandedDungeon(dayId){
  if(!isDayId(dayId))throw new RangeError('Invalid dungeon dayId');
  let seed=2166136261;
  for(const c of `lumenfall:${EXPANDED_GENERATOR_VERSION}:${dayId}`)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;
  const random=()=>{
    seed=(seed+0x6D2B79F5)>>>0;
    let n=Math.imul(seed^(seed>>>15),seed|1);
    n^=n+Math.imul(n^(n>>>7),n|61);
    return ((n^(n>>>14))>>>0)/4294967296;
  };
  const pick=(lo,hi)=>lo+Math.floor(random()*(hi-lo+1));
  const {width,height}=EXPANDED_SIZE,tiles=Array(width*height).fill(1);
  // Four disjoint bands leave room for four independent one-cell connectors.
  const rooms=[
    {x:1,y:4,w:pick(4,5),h:pick(4,5)},
    {x:pick(8,10),y:1,w:pick(4,5),h:3},
    {x:16,y:pick(5,6),w:4,h:pick(3,4)},
    {x:pick(8,10),y:11,w:pick(4,5),h:3},
  ];
  const inside=(r,x,y)=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h;
  const carve=(x,y)=>{tiles[y*width+x]=0;};
  for(const r of rooms)for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)carve(x,y);
  const upper=pick(1,3),lower=pick(11,13),left=pick(1,3),right=pick(17,19);
  const corridors=[];
  function connect(from,to,points){
    const cells=[],seen=new Set();
    for(let i=1;i<points.length;i++){
      let [x,y]=points[i-1];const [endX,endY]=points[i],dx=Math.sign(endX-x),dy=Math.sign(endY-y);
      const length=Math.abs(endX-x)+Math.abs(endY-y);
      for(let step=0;step<=length;step++,x+=dx,y+=dy){
        carve(x,y);
        const index=y*width+x;
        if(!rooms.some(r=>inside(r,x,y))&&!seen.has(index)){seen.add(index);cells.push({x,y});}
      }
    }
    corridors.push({from,to,cells});
  }
  connect(0,1,[[left,rooms[0].y],[left,upper],[rooms[1].x,upper]]);
  connect(1,2,[[rooms[1].x+rooms[1].w-1,upper],[right,upper],[right,rooms[2].y]]);
  connect(2,3,[[right,rooms[2].y+rooms[2].h-1],[right,lower],[rooms[3].x+rooms[3].w-1,lower]]);
  connect(3,0,[[rooms[3].x,lower],[left,lower],[left,rooms[0].y+rooms[0].h-1]]);
  const positions=tiles.flatMap((tile,i)=>{
    const x=i%width,y=Math.floor(i/width);
    return tile===0&&Math.abs(x-2)+Math.abs(y-6)>=4?[{x,y}]:[];
  });
  for(let i=positions.length-1;i>0;i--){const j=pick(0,i);[positions[i],positions[j]]=[positions[j],positions[i]];}
  // Reserve a distant chest before assigning guards: all six positions are unique.
  const far=positions.findIndex(p=>p.x>=17||p.y>=13),[farChest]=positions.splice(far,1);
  return {width,height,generatorVersion:EXPANDED_GENERATOR_VERSION,rooms,corridors,tiles,
    enemies:positions.slice(0,3).map((p,i)=>({...p,hp:[6,8,10][i]})),chests:[farChest,...positions.slice(3,5)]};
}
