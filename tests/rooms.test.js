import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {W,H,RULES_VERSION,generateDungeon,expeditionLabel} from '../src/daily.js';
import {createGame,nextRun,step,rest,heal,extract} from '../src/game.js';
import {restoreGame} from '../src/save.js';
import {exportSave,importSave} from '../src/transfer.js';
import {readStartup} from '../src/recovery.js';
import {previewDirections} from '../src/movement.js';
import {previewWait} from '../src/tactics.js';
import {gateDistance} from '../src/gate.js';
const fixture=name=>JSON.parse(readFileSync(new URL(`./fixtures/${name}`,import.meta.url),'utf8'));
const hash=s=>createHash('sha256').update(JSON.stringify(s)).digest('hex');
function reachable(tiles,start){const todo=[start],seen=new Set(todo);for(let i=0;i<todo.length;i++){const x=todo[i]%W,y=Math.floor(todo[i]/W);for(const [a,b]of[[x-1,y],[x+1,y],[x,y-1],[x,y+1]])if(a>=0&&a<W&&b>=0&&b<H&&tiles[b*W+a]===0&&!seen.has(b*W+a)){seen.add(b*W+a);todo.push(b*W+a);}}return seen;}
function roomCores(tiles){const core=new Set();for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){if([-1,0,1].every(dy=>[-1,0,1].every(dx=>tiles[(y+dy)*W+x+dx]===0)))core.add(y*W+x);}let count=0;while(core.size){count++;const todo=[core.values().next().value];core.delete(todo[0]);for(let i=0;i<todo.length;i++)for(const n of [todo[i]-1,todo[i]+1,todo[i]-W,todo[i]+W])if(core.delete(n))todo.push(n);}return count;}

test('Both generator versions retain distinct stable fingerprints; unsupported versions fail explicitly',()=>{
 assert.equal(RULES_VERSION,2);
 assert.equal(hash(generateDungeon('2026-10-22',1)),'124e8f7a26515afbed452840cd3527d287c0504f0d946f31c9183100fcf71c02');
 assert.equal(hash(generateDungeon('2026-10-22',2)),'41aea1bd1ad50f4ccc83e2900d24d967d82b10f90aa543eb34ca43034f7b3f93');
 assert.deepEqual(generateDungeon('2026-10-22'),generateDungeon('2026-10-22',2));
 for(const version of [0,3,999,'2',null])assert.throws(()=>generateDungeon('2026-10-22',version),RangeError);
});
test('365 room maps have three separate chamber cores, real narrow passages, connected loot and safe arrival',()=>{
 const layouts=new Set(),original=Math.random;Math.random=()=>{throw Error('No ambient random');};
 try{for(let day=0;day<365;day++){
  const id=new Date(Date.UTC(2026,0,day+1)).toISOString().slice(0,10),a=generateDungeon(id,2),b=generateDungeon(id,2),{tiles,enemies,chests}=a;
  assert.deepEqual(a,b,id);layouts.add(tiles.join(''));assert.equal(tiles.length,W*H);
  for(let i=0;i<tiles.length;i++){const x=i%W,y=Math.floor(i/W);if(x===0||x===W-1||y===0||y===H-1)assert.equal(tiles[i],1,id);}
  const seen=reachable(tiles,6*W+2);assert.equal(seen.size,tiles.filter(t=>t===0).length,id);assert.equal(roomCores(tiles),3,id);
  const isFloor=(x,y)=>tiles[y*W+x]===0;
  assert.ok([...seen].some(i=>{const x=i%W,y=Math.floor(i/W);return (isFloor(x-1,y)&&isFloor(x+1,y)&&!isFloor(x,y-1)&&!isFloor(x,y+1))||(isFloor(x,y-1)&&isFloor(x,y+1)&&!isFloor(x-1,y)&&!isFloor(x+1,y));}),id);
  for(let y=5;y<=7;y++)for(let x=1;x<=3;x++)assert.equal(isFloor(x,y),true,id);
  assert.deepEqual(enemies.map(e=>e.hp),[6,8,10]);assert.equal(chests.length,3);const occupied=new Set([6*W+2]);
  for(const p of [...enemies,...chests]){const n=p.y*W+p.x;assert.ok(seen.has(n),id);assert.ok(!occupied.has(n),id);occupied.add(n);assert.ok(Math.abs(p.x-2)+Math.abs(p.y-6)>=4,id);}
 }}finally{Math.random=original;}assert.ok(layouts.size>250,`${layouts.size} varied layouts`);
});
test('A real pre-upgrade rules1 save and legacy v1 survive restore/export/import with exact maps, progress and subsequent actions',()=>{
 for(const raw of [fixture('rules1-save.json'),fixture('legacy-save.json'),createGame({dayId:'2026-10-31'})]){
  const expected=raw.version===1?{...raw,version:2,dayId:null,rulesVersion:0}:raw;
  const before=JSON.stringify(raw),a=restoreGame(before);assert.deepEqual(a,expected);assert.equal(JSON.stringify(raw),before);
  const b=importSave(exportSave(a).text);assert.deepEqual(a,b);
  for(const fn of [s=>step(s,1,0),s=>step(s,0,-1),rest,heal,s=>step(s,-1,0),extract]){fn(a);fn(b);assert.deepEqual(a,b);}
 }
 const old=fixture('rules1-save.json');assert.equal(old.rulesVersion,1);assert.notDeepEqual(old.tiles,generateDungeon(old.dayId,2).tiles);
});
test('Old rules stay practice even on the same day; only a new run adopts rules2 and the new day',()=>{
 const old=fixture('rules1-save.json'),sameDay=new Date('2026-10-22T12:00:00Z'),tomorrow=new Date('2026-10-22T22:00:00Z');
 assert.equal(expeditionLabel(old,sameDay),'Gyakorló · 2026-10-22 · korábbi pályaszabály');assert.match(expeditionLabel(old,tomorrow),/^Gyakorló/);
 const restored=restoreGame(JSON.stringify(old));assert.deepEqual(restored,old);const n=nextRun(restored,{now:tomorrow});assert.equal(n.rulesVersion,2);assert.equal(n.dayId,'2026-10-23');assert.equal(n.bank,old.bank);assert.equal(expeditionLabel(n,tomorrow),'Napi pálya · 2026-10-23');
 assert.equal(expeditionLabel(n,new Date('2026-10-24T12:00:00Z')),'Gyakorló · 2026-10-23');assert.equal(expeditionLabel(restoreGame(JSON.stringify(fixture('legacy-save.json')))),'Gyakorló · korábbi mentés');
});
test('Unknown saved rules remain protected rather than being reinterpreted or overwritten',()=>{
 const raw=JSON.stringify({...fixture('rules1-save.json'),rulesVersion:3});let writes=0;const startup=readStartup(()=>({getItem:()=>raw,setItem(){writes++;}}));assert.equal(startup.kind,'invalid');assert.equal(startup.raw,raw);assert.equal(writes,0);assert.throws(()=>importSave(JSON.stringify({format:'lumenfall-expedition',formatVersion:1,state:JSON.parse(raw)})));
});
test('Actual room geometry works with gate distance and both tactical previews without changing state',()=>{
 for(const dayId of ['2026-10-31','2026-11-01','2026-11-02']){
  const s=createGame({dayId});s.enemies=[];s.chests=[];step(s,1,0);assert.equal(gateDistance(s),1);
  const before=JSON.stringify(s),wait=previewWait(s),directions=previewDirections(s);assert.equal(JSON.stringify(s),before);
  const actual=structuredClone(s);rest(actual);assert.equal(wait.hpAfter,actual.hp);
  for(const d of directions){const copy=structuredClone(s);step(copy,d.dx,d.dy);assert.equal(d.xAfter,copy.x);assert.equal(d.yAfter,copy.y);assert.equal(d.hpAfter,copy.hp);}
 }
});
