import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,step,rest,heal,extract,nextRun} from '../src/game.js';
import {captureGuards,describeSceneMotion} from '../src/guard-motion.js';
import {motionPose,createCharacterMotion} from '../src/character-motion.js';
import {drawGuard} from '../src/guard.js';
import {expeditionSize} from '../src/expedition-size.js';
import {exportSave,importSave} from '../src/transfer.js';
const facing={dx:0,dy:1};
function world(rulesVersion=4){const s=createGame({dayId:'2026-11-27',rulesVersion}),{width:w,height:h}=expeditionSize(s);s.tiles=Array.from({length:w*h},(_,i)=>+(i%w===0||i%w===w-1||i<w||i>=w*(h-1)));s.x=8;s.y=6;s.enemies=[];s.chests=[];return s;}
function action(s,fn){const before=captureGuards(s);fn(s);return describeSceneMotion(before,s,null,facing);}
test('Real attacks survive heal net gain and lethal HP clamp, at all supported rules',()=>{
 for(const rules of [1,2,3,4])for(const fn of [rest,heal])for(const hp of [2,10]){
  const s=world(rules);s.hp=hp;s.enemies=[{x:7,y:6,hp:8},{x:8,y:5,hp:8}];
  const expected=structuredClone(s);fn(expected);const a=action(s,fn);assert.deepEqual(s,expected);
  assert.equal(a.guardAttacks.length,2);assert.deepEqual(a.guardAttacks.map(({dx,dy})=>[dx,dy]),[[1,0],[0,1]]);
  assert.equal(a.guards.length,0);assert.deepEqual(importSave(exportSave(s).text),s);
  const json=JSON.stringify(s);motionPose(a,90);assert.equal(JSON.stringify(s),json);
 }
});
test('Killed targets and advancing guards never attack; final player position defines adjacency',()=>{
 const s=world();s.turn=1;s.enemies=[{x:9,y:6,hp:4},{x:10,y:6,hp:8}];
 const a=action(s,s=>step(s,1,0));assert.equal(a.guardAttacks.length,0);assert.equal(a.guards.length,1);
 const moved=world();moved.enemies=[{x:10,y:6,hp:8}];const b=action(moved,s=>step(s,1,0));assert.equal(b.guardAttacks.length,1);assert.equal(b.guardAttacks[0].dx,-1);
 const survived=world();survived.enemies=[{x:9,y:6,hp:8}];assert.equal(action(survived,s=>step(s,1,0)).guardAttacks.length,1);
});
test('No turn means no attack; replacement, extraction and failed healing are quiet',()=>{
 for(const fn of [s=>step(s,0,0),heal,s=>{s.potions=0;s.hp=10;heal(s);},s=>{s.tiles[6*25+7]=1;step(s,-1,0);},s=>{s.x=2;s.y=6;extract(s);}]){
  const s=world();s.enemies=[{x:9,y:6,hp:8}];assert.equal(action(s,fn),null);
 }
 const s=world(),before=captureGuards(s);assert.equal(describeSceneMotion(before,nextRun(s),null,facing),null);
 s.status='defeated';assert.equal(action(s,rest),null);
});
function record(enemy,attack,hit=null,size=40){const calls=[];const ctx=new Proxy({},{get:(_,key)=>(...args)=>calls.push([key,...args]),set:()=>true});drawGuard(ctx,enemy,hit,size,0,{id:'mist'},attack);return calls;}
test('Four directions return to exact resting art; only body shifts, with bounded hit composition and anchored HP',()=>{
 const e=Object.freeze({x:9,y:6,hp:8});
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])for(const size of [20,40,80]){
  const a={kind:'guards',from:{x:8,y:6},to:{x:8,y:6},guardAttacks:[{enemy:e,dx,dy}]};
  const normal=record(e,null,null,size);
  for(const t of [0,180,220])assert.deepEqual(record(e,motionPose(a,t).guardAttacks[0],null,size),normal);
  const peak=record(e,motionPose(a,90).guardAttacks[0],null,size);
  assert.deepEqual(peak.filter(c=>c[0]==='translate')[1],['translate',dx*4,dy*4]);
  const bodyRestore=peak.findIndex(c=>c[0]==='restore');assert.ok(bodyRestore<peak.findIndex(c=>c[0]==='fillRect'&&c[1]===-11&&c[2]===14));
  const combined=record(e,{dx,dy,strength:1},{x:9,y:6,dx,dy,strength:1,survived:true},size).filter(c=>c[0]==='translate')[1];assert.ok(Math.hypot(combined[1],combined[2])<=4);
  assert.equal(peak.filter(c=>c[0]==='save').length,peak.filter(c=>c[0]==='restore').length);
 }
});
test('Attack-only animation copies data, cancels stale frames, finishes and respects reduced motion',()=>{
 let now=0,id=0,reduced=false;const queue=new Map(),poses=[];
 const api=createCharacterMotion({render:p=>poses.push(p),requestFrame:f=>{queue.set(++id,f);return id;},cancelFrame:id=>queue.delete(id),now:()=>now,reducedMotion:()=>reduced});
 const s=world();s.enemies=[{x:9,y:6,hp:8}];const a=action(s,rest);api.begin(a);assert.equal(queue.size,1);
 const tick=[...queue.values()][0];a.guardAttacks[0].dx=99;now=90;queue.clear();tick();assert.equal(poses.at(-1).guardAttacks[0].dx,-1);assert.equal(poses.at(-1).guardAttacks[0].strength,1);
 api.cancel();const count=poses.length;tick();assert.equal(poses.length,count);assert.equal(queue.size,0);
 api.begin(a);now+=180;const end=[...queue.values()][0];queue.clear();end();assert.equal(poses.at(-1),null);assert.equal(queue.size,0);
 reduced=true;api.begin(a);assert.equal(queue.size,0);assert.equal(poses.at(-1),null);
});
