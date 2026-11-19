import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {generateExpandedDungeon as generate} from '../src/expanded-dungeon.js';
import {createGame} from '../src/game.js';
import {restoreGame} from '../src/save.js';
import {RULES_VERSION,SUPPORTED_RULES_VERSIONS} from '../src/daily.js';
const hash=m=>createHash('sha256').update(JSON.stringify(m)).digest('hex');
const inside=(r,p)=>p.x>=r.x&&p.x<r.x+r.w&&p.y>=r.y&&p.y<r.y+r.h;
function reachable(m,blocked=new Set()){
 const key=(x,y)=>y*m.width+x,start=key(2,6),seen=new Set([start]),queue=[{x:2,y:6}];
 for(let i=0;i<queue.length;i++)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const x=queue[i].x+dx,y=queue[i].y+dy,k=key(x,y);
  if(x>=0&&x<m.width&&y>=0&&y<m.height&&m.tiles[k]===0&&!seen.has(k)&&!blocked.has(k)){seen.add(k);queue.push({x,y});}
 }
 return seen;
}
test('365 daily rings have four separate rooms, connected floor and independent corridor alternatives',()=>{
 const layouts=new Set(),routes=new Set();
 for(let day=0;day<365;day++){
  const id=new Date(Date.UTC(2026,0,1+day)).toISOString().slice(0,10),m=generate(id);
  assert.deepEqual(m,generate(id));assert.equal(m.width,21);assert.equal(m.height,15);assert.equal(m.tiles.length,315);
  const floors=m.tiles.flatMap((v,i)=>v===0?[i]:[]),seen=reachable(m);
  assert.equal(seen.size,floors.length);
  for(let y=0;y<15;y++)for(let x=0;x<21;x++)if(x===0||x===20||y===0||y===14)assert.equal(m.tiles[y*21+x],1);
  for(let y=5;y<=7;y++)for(let x=1;x<=3;x++)assert.equal(m.tiles[y*21+x],0);
  assert.ok(floors.some(i=>i%21>=17));assert.ok(floors.some(i=>Math.floor(i/21)>=13));
  assert.equal(m.rooms.length,4);const roomCells=new Set();
  for(const r of m.rooms){
   assert.ok(r.w>=3&&r.h>=3);
   for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++){
    const k=y*21+x;assert.ok(!roomCells.has(k));roomCells.add(k);assert.equal(m.tiles[k],0);
   }
  }
  assert.equal(m.corridors.length,4);const allCorridorCells=new Set();
  for(const c of m.corridors){
   assert.ok(c.cells.length>0);const blocked=new Set(),touches=new Set();
   for(const p of c.cells){
    const k=p.y*21+p.x;assert.equal(m.tiles[k],0);assert.ok(!roomCells.has(k));assert.ok(!allCorridorCells.has(k));
    allCorridorCells.add(k);blocked.add(k);
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])m.rooms.forEach((r,i)=>{if(inside(r,{x:p.x+dx,y:p.y+dy}))touches.add(i);});
   }
   assert.deepEqual([...touches].sort(),[c.from,c.to].sort());
   // Remove the ENTIRE connector, then prove all four rooms remain reachable.
   const alternate=reachable(m,blocked);
   for(const r of m.rooms)assert.ok(alternate.has(r.y*21+r.x));
  }
  assert.equal(roomCells.size+allCorridorCells.size,floors.length);
  assert.equal(m.enemies.length,3);assert.equal(m.chests.length,3);assert.deepEqual(m.enemies.map(e=>e.hp),[6,8,10]);
  const entities=[...m.enemies,...m.chests];assert.equal(new Set(entities.map(p=>`${p.x},${p.y}`)).size,6);
  for(const p of entities){assert.ok(seen.has(p.y*21+p.x));assert.ok(Math.abs(p.x-2)+Math.abs(p.y-6)>=4);}
  assert.ok(m.chests.some(p=>p.x>=17||p.y>=13));
  layouts.add(JSON.stringify(m.rooms));routes.add(JSON.stringify(m.corridors));
 }
 assert.ok(layouts.size>100);assert.ok(routes.size>100);
});
test('Stable snapshot and independent output, valid leap day, invalid dates rejected',()=>{
 const m=generate('2026-11-08');assert.equal(hash(m),'7c6c8db760e6999b3acb93563fea73d347556d057c87bc99fdf7304b93f7344e');
 m.tiles.fill(1);m.rooms[0].x=99;m.corridors[0].cells[0].x=99;m.chests[0].x=99;
 assert.equal(hash(generate('2026-11-08')),'7c6c8db760e6999b3acb93563fea73d347556d057c87bc99fdf7304b93f7344e');
 assert.equal(generate('2028-02-29').tiles.length,315);
 for(const id of [undefined,null,42,'2026-02-29','2026-13-01','2026-11-8',''])assert.throws(()=>generate(id),RangeError);
});
test('Expanded geometry requires rules3; older saved rules remain 17x13',()=>{
 const s=createGame({rulesVersion:2,dayId:'2026-11-08'});assert.equal(RULES_VERSION,3);assert.deepEqual(SUPPORTED_RULES_VERSIONS,[1,2,3]);
 assert.equal(s.tiles.length,221);assert.deepEqual(restoreGame(JSON.stringify(s)),s);
 assert.equal(restoreGame(JSON.stringify({...s,...generate('2026-11-08')})),null);
});
