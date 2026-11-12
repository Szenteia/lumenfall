import test from 'node:test';import assert from 'node:assert/strict';
import {createGame,step,rest,heal,nextRun} from '../src/game.js';
import {generateExpandedDungeon} from '../src/expanded-dungeon.js';
import {expeditionSize} from '../src/expedition-size.js';
import {restoreGame} from '../src/save.js';
import {exportSave,importSave} from '../src/transfer.js';
import {previewDirections} from '../src/movement.js';
import {previewWait} from '../src/tactics.js';
import {gateDistance} from '../src/gate.js';
test('365 new expeditions use unchanged expanded generator and round-trip without diagnostic metadata',()=>{
 for(let i=0;i<365;i++){
  const dayId=new Date(Date.UTC(2026,0,1+i)).toISOString().slice(0,10),s=createGame({dayId}),g=generateExpandedDungeon(dayId);
  assert.equal(s.rulesVersion,3);assert.deepEqual(s.tiles,g.tiles);assert.deepEqual(s.enemies,g.enemies);assert.deepEqual(s.chests,g.chests);
  for(const key of ['rooms','corridors','width','height','generatorVersion'])assert.equal(key in s,false);
  assert.deepEqual(importSave(exportSave(s).text),s);
 }
});
test('Far edge simulation, forecasts, combat, loot, healing and gate path use the same rules-based size',()=>{
 const s=createGame({dayId:'2026-11-12'});s.tiles=Array.from({length:315},(_,i)=>+(i%21===0||i%21===20||i<21||i>=294));s.x=18;s.y=13;s.enemies=[{x:19,y:13,hp:8}];s.chests=[{x:17,y:13}];s.hp=12;
 assert.equal(gateDistance(s),23);
 const saved=JSON.stringify(s),wait=previewWait(s),directions=previewDirections(s);assert.equal(JSON.stringify(s),saved);
 const waited=structuredClone(s);rest(waited);assert.equal(wait.hpAfter,waited.hp);
 for(const d of directions){const c=structuredClone(s);step(c,d.dx,d.dy);assert.equal(c.hp,d.hpAfter);assert.equal(c.x,d.xAfter);assert.equal(c.y,d.yAfter);assert.deepEqual(c.enemies,d.enemiesAfter);}
 const a=structuredClone(s);step(a,-1,0);assert.equal(a.loot,30);assert.equal(a.x,17);
 const b=structuredClone(s);step(b,1,0);assert.equal(b.enemies[0].hp,4);assert.equal(b.hp,9);heal(b);assert.equal(b.hp,16);assert.equal(b.potions,1);
 const restored=restoreGame(JSON.stringify(b));rest(b);rest(restored);assert.deepEqual(restored,b);
});
test('Size selection rejects unknown rules and never uses saved dimensions; old runs preserve maps until nextRun',()=>{
 assert.equal(expeditionSize({rulesVersion:999}),null);
 for(const rulesVersion of [0,1,2])assert.deepEqual(expeditionSize({rulesVersion,width:999,height:999}),{width:17,height:13});
 const old=createGame({dayId:'2026-11-12',rulesVersion:2});old.bank=78;assert.deepEqual(restoreGame(JSON.stringify(old)),old);
 assert.equal(restoreGame(JSON.stringify({...old,rulesVersion:3})),null);
 const newer=nextRun(old,{dayId:old.dayId});assert.equal(newer.bank,78);assert.equal(newer.tiles.length,315);
 for(const rulesVersion of [0,1,2,4])assert.equal(restoreGame(JSON.stringify({...newer,rulesVersion,width:21,height:15})),null);
 assert.deepEqual(restoreGame(JSON.stringify({...newer,width:17,height:13})).tiles,newer.tiles);
});
