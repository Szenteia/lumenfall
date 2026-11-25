import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {generateHallDungeon} from '../src/hall-dungeon.js';
const key=p=>p.y*25+p.x;
const cells=r=>Array.from({length:r.w*r.h},(_,i)=>(r.y+Math.floor(i/r.w))*25+r.x+i%r.w);
function reachable(tiles,start){
 const seen=new Set([start]),queue=[start];
 for(const i of queue)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const x=i%25+dx,y=Math.floor(i/25)+dy,n=y*25+x;
  if(x>=0&&x<25&&y>=0&&y<19&&tiles[n]===0&&!seen.has(n)){seen.add(n);queue.push(n);}
 }
 return seen;
}
test('365 hall maps have five separate rooms, real alternative routes, reachable loot and exact metadata',()=>{
 const shapes=new Set(),paths=new Set();
 for(let day=0;day<365;day++){
  const id=new Date(Date.UTC(2026,0,1+day)).toISOString().slice(0,10),m=generateHallDungeon(id);
  assert.equal(m.width,25);assert.equal(m.height,19);assert.equal(m.generatorVersion,'hall-v1');assert.equal(m.tiles.length,475);
  assert.equal(m.rooms.length,5);assert.equal(m.corridors.length,6);
  const all=new Set();for(const r of m.rooms){assert.ok(r.w>=3&&r.h>=3);for(const i of cells(r)){assert.ok(!all.has(i));all.add(i);assert.equal(m.tiles[i],0);}}
  for(const c of m.corridors){assert.ok(c.cells.length);const local=new Set(c.cells.map(key));assert.equal(local.size,c.cells.length);for(const i of local){assert.ok(!all.has(i));assert.equal(m.tiles[i],0);}
   // Only these two rooms plus this connector must form a complete path.
   const isolated=Array(475).fill(1);for(const i of [...cells(m.rooms[c.from]),...cells(m.rooms[c.to]),...local])isolated[i]=0;
   const reach=reachable(isolated,cells(m.rooms[c.from])[0]);assert.equal(reach.size,isolated.filter(t=>t===0).length);
   // Removing the whole corridor still leaves all five rooms connected via a different route.
   const cut=m.tiles.slice();for(const i of local)cut[i]=1;
   const alternate=reachable(cut,152);for(const r of m.rooms)assert.ok(alternate.has(cells(r)[0]));
  }
  const documented=new Set([...all,...m.corridors.flatMap(c=>c.cells.map(key))]);
  for(let i=0;i<475;i++){assert.ok(m.tiles[i]===0||m.tiles[i]===1);assert.equal(m.tiles[i]===0,documented.has(i));if(i<25||i>=450||i%25===0||i%25===24)assert.equal(m.tiles[i],1);}
  const reach=reachable(m.tiles,152);assert.equal(m.tiles[152],0);assert.equal(reach.size,documented.size);
  const hall=new Set(cells(m.rooms[4])),doors=new Set();for(const i of hall)for(const n of [i-25,i+25,i-1,i+1])if(!hall.has(n)&&m.tiles[n]===0)doors.add(n);
  assert.equal(doors.size,2);
  const entities=[...m.enemies,...m.chests];assert.equal(m.enemies.length,3);assert.equal(m.chests.length,3);assert.equal(new Set(entities.map(key)).size,6);
  for(const p of entities){assert.ok(reach.has(key(p)));assert.ok(Math.abs(p.x-2)+Math.abs(p.y-6)>=4);}
  assert.ok(m.chests.some(p=>p.x>=21||p.y>=15));assert.deepEqual(m.enemies.map(e=>e.hp),[6,8,10]);
  shapes.add(JSON.stringify(m.rooms));paths.add(JSON.stringify(m.corridors));
 }
 assert.ok(shapes.size>100);assert.ok(paths.size>100);
});
test('Deterministic, isolated outputs, valid leap dates and rejected invalid dates',()=>{
 const old=Math.random;Math.random=()=>{throw Error('Ambient randomness');};
 try{
 const a=generateHallDungeon('2026-11-25'),b=generateHallDungeon('2026-11-25');assert.deepEqual(a,b);
 a.tiles[0]=0;a.rooms[0].x=99;a.corridors[0].cells[0].x=99;a.enemies[0].hp=0;a.chests[0].x=99;
 assert.deepEqual(b,generateHallDungeon('2026-11-25'));
 assert.equal(generateHallDungeon('2028-02-29').tiles.length,475);
 for(const id of [null,undefined,1,'','2026-02-29','2026-13-01','2026-11-31','2026-1-01'])assert.throws(()=>generateHallDungeon(id),RangeError);
 }finally{Math.random=old;}
});
test('hall-v1 snapshot pins geometry, metadata and entities',()=>{
 assert.equal(createHash('sha256').update(JSON.stringify(generateHallDungeon('2026-11-25'))).digest('hex'),'7da7639725521a3a0ad0342d812be8f67d7998e5fac2ab266aab924ace86d55d');
});
