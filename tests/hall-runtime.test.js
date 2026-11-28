import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,step,rest,heal,nextRun,extract} from '../src/game.js';
import {generateHallDungeon} from '../src/hall-dungeon.js';
import {expeditionLabel} from '../src/daily.js';
import {expeditionSize} from '../src/expedition-size.js';
import {restoreGame} from '../src/save.js';
import {exportSave,importSave} from '../src/transfer.js';
import {previewDirections} from '../src/movement.js';
import {previewWait} from '../src/tactics.js';
import {gateDistance} from '../src/gate.js';

test('365 default hall expeditions match hall-v1 exactly and round-trip without diagnostics',()=>{
 for(let i=0;i<365;i++){
  const dayId=new Date(Date.UTC(2026,0,1+i)).toISOString().slice(0,10),s=createGame({dayId}),g=generateHallDungeon(dayId);
  assert.equal(s.rulesVersion,4);assert.deepEqual(expeditionSize(s),{width:25,height:19});
  for(const key of ['tiles','enemies','chests'])assert.deepEqual(s[key],g[key]);
  for(const key of ['rooms','corridors','width','height','generatorVersion'])assert.equal(key in s,false);
  assert.deepEqual(importSave(exportSave(s).text),s);
 }
});
test('Rules1/2/3 maps remain unchanged practice runs across midnight; nextRun alone adopts hall and retains bank',()=>{
 for(const rulesVersion of [1,2,3]){
  const old=createGame({dayId:'2026-11-26',rulesVersion});old.bank=79;step(old,1,0);
  const saved=JSON.stringify(old),restored=restoreGame(saved);
  assert.equal(JSON.stringify(restored),saved);
  for(const now of ['2026-11-26T12:00:00Z','2026-11-26T23:01:00Z'])assert.match(expeditionLabel(restored,new Date(now)),/^Gyakorló/);
  assert.equal(JSON.stringify(restored),saved);
  const newer=nextRun(restored,{dayId:'2026-11-27'});assert.equal(newer.bank,79);assert.equal(newer.rulesVersion,4);assert.equal(newer.tiles.length,475);
 }
});
test('Hall restore rejects wrong shape, border, entity coordinates and rule; supplied dimensions cannot override rules',()=>{
 const s=createGame({dayId:'2026-11-26'}),valid=exportSave(s).text;
 const border=structuredClone(s);border.tiles[0]=0;
 for(const bad of [{...s,tiles:s.tiles.slice(0,315)},border,{...s,x:25},{...s,enemies:[{x:25,y:6,hp:6}]},{...s,chests:[{x:2,y:19}]},{...s,rulesVersion:999},...[1,2,3].map(rulesVersion=>({...s,rulesVersion,width:25,height:19}))]){
  assert.equal(restoreGame(JSON.stringify(bad)),null);
  const wrapper=JSON.parse(valid);wrapper.state=bad;assert.throws(()=>importSave(JSON.stringify(wrapper)));
  assert.deepEqual(importSave(valid),s);
 }
 assert.deepEqual(restoreGame(JSON.stringify({...s,width:17,height:13})).tiles,s.tiles);
});
test('Hall far edge actions agree with previews, resume exactly and return loot through the gate',()=>{
 const s=createGame({dayId:'2026-11-26'});
 s.tiles=Array.from({length:475},(_,i)=>+(i%25===0||i%25===24||i<25||i>=450));s.x=22;s.y=17;s.enemies=[{x:23,y:17,hp:8}];s.chests=[{x:21,y:17}];s.hp=12;s.bank=10;
 assert.equal(gateDistance(s),31);
 const before=JSON.stringify(s),wait=previewWait(s),directions=previewDirections(s);assert.equal(JSON.stringify(s),before);
 const waited=structuredClone(s);rest(waited);assert.equal(wait.hpAfter,waited.hp);
 for(const d of directions){const copy=structuredClone(s);step(copy,d.dx,d.dy);assert.equal(copy.hp,d.hpAfter);assert.equal(copy.x,d.xAfter);assert.equal(copy.y,d.yAfter);assert.deepEqual(copy.enemies,d.enemiesAfter);}
 const fought=structuredClone(s);step(fought,1,0);assert.equal(fought.enemies[0].hp,4);assert.equal(fought.hp,9);heal(fought);assert.equal(fought.hp,16);
 const resumed=importSave(exportSave(fought).text);rest(fought);rest(resumed);assert.deepEqual(resumed,fought);
 s.enemies=[];step(s,-1,0);assert.equal(s.loot,30);assert.equal(s.x,21);
 while(s.x>2)step(s,-1,0);while(s.y>6)step(s,0,-1);
 assert.equal(gateDistance(s),0);extract(s);assert.equal(s.status,'extracted');assert.equal(s.bank,40);assert.deepEqual(importSave(exportSave(s).text),s);
 assert.equal(nextRun(s,{dayId:'2026-11-27'}).bank,40);
});
