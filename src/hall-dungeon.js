import {isDayId} from './daily.js';

// Prototype identity, not a supported runtime/save rulesVersion.
export const HALL_GENERATOR_VERSION='hall-v1';
export const HALL_SIZE=Object.freeze({width:25,height:19});
export function generateHallDungeon(dayId){
  if(!isDayId(dayId))throw new RangeError('Invalid dungeon dayId');
  let seed=2166136261;
  for(const c of `lumenfall:${HALL_GENERATOR_VERSION}:${dayId}`)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;
  const pick=(lo,hi)=>{
    seed=(seed+0x6D2B79F5)>>>0;
    let n=Math.imul(seed^(seed>>>15),seed|1);
    n^=n+Math.imul(n^(n>>>7),n|61);
    return lo+Math.floor((((n^(n>>>14))>>>0)/4294967296)*(hi-lo+1));
  };
  const {width,height}=HALL_SIZE,tiles=Array(width*height).fill(1);
  // Disjoint bands reserve an outer ring and two independent hall entrances.
  const rooms=[
    {x:1,y:4,w:pick(4,5),h:pick(4,5)},
    {x:pick(10,11),y:1,w:pick(4,5),h:3},
    {x:20,y:pick(5,6),w:4,h:pick(3,4)},
    {x:pick(10,11),y:14,w:pick(4,5),h:4},
    {x:pick(10,11),y:pick(7,8),w:pick(4,5),h:4},
  ];
  const inside=(r,x,y)=>x>=r.x&&x<r.x+r.w&&y>=r.y&&y<r.y+r.h;
  const carve=(x,y)=>{tiles[y*width+x]=0;};
  for(const r of rooms)for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)carve(x,y);
  const corridors=[];
  function connect(from,to,points){
    const cells=[],seen=new Set();
    for(let i=1;i<points.length;i++){
      let [x,y]=points[i-1];const [ex,ey]=points[i],dx=Math.sign(ex-x),dy=Math.sign(ey-y);
      const distance=Math.abs(ex-x)+Math.abs(ey-y);
      for(let j=0;j<=distance;j++,x+=dx,y+=dy){
        carve(x,y);const key=y*width+x;
        if(!rooms.some(r=>inside(r,x,y))&&!seen.has(key)){seen.add(key);cells.push({x,y});}
      }
    }
    corridors.push({from,to,cells});
  }
  const top=pick(1,3),bottom=pick(14,17),left=pick(1,3),right=pick(21,23);
  connect(0,1,[[left,4],[left,top],[rooms[1].x,top]]);
  connect(1,2,[[rooms[1].x+rooms[1].w-1,top],[right,top],[right,rooms[2].y]]);
  connect(2,3,[[right,rooms[2].y+rooms[2].h-1],[right,bottom],[rooms[3].x+rooms[3].w-1,bottom]]);
  connect(3,0,[[rooms[3].x,bottom],[left,bottom],[left,rooms[0].y+rooms[0].h-1]]);
  const north=pick(11,13),south=pick(11,13);
  connect(1,4,[[north,3],[north,rooms[4].y]]);
  connect(4,3,[[south,rooms[4].y+rooms[4].h-1],[south,14]]);
  const positions=tiles.flatMap((t,i)=>{
    const x=i%width,y=Math.floor(i/width);
    return t===0&&Math.abs(x-2)+Math.abs(y-6)>=4?[{x,y}]:[];
  });
  for(let i=positions.length-1;i>0;i--){const j=pick(0,i);[positions[i],positions[j]]=[positions[j],positions[i]];}
  const far=positions.findIndex(p=>p.x>=21||p.y>=15),[farChest]=positions.splice(far,1);
  return {width,height,generatorVersion:HALL_GENERATOR_VERSION,rooms,corridors,tiles,
    enemies:positions.slice(0,3).map((p,i)=>({...p,hp:[6,8,10][i]})),chests:[farChest,...positions.slice(3,5)]};
}
