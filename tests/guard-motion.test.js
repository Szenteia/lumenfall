import test from 'node:test';
import assert from 'node:assert/strict';
import {captureGuards,describeSceneMotion,drawMovingGuard} from '../src/guard-motion.js';
import {motionPose,createCharacterMotion,describeDirection} from '../src/character-motion.js';
import {createGame,step,rest,heal,W,H} from '../src/game.js';
import {restoreGame} from '../src/save.js';
import {readFileSync} from 'node:fs';

const facing={dx:0,dy:1};
function world(){const s=createGame({rulesVersion:2,dayId:'2026-11-03'});s.x=8;s.y=6;s.turn=1;s.chests=[];s.enemies=[];s.tiles=Array.from({length:W*H},(_,i)=>+(i%W===0||i%W===W-1||i<W||i>=W*(H-1)));return s;}
function act(s,fn){const before=captureGuards(s),player=fn();return describeSceneMotion(before,s,player,facing);}

test('Guard-only motion follows real wait and heal in four directions without changing simulation or saves',()=>{
 for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]])for(const fn of [rest,heal]){
  const s=world();s.hp=10;s.enemies=[{x:8+dx*3,y:6+dy*3,hp:8}];
  const expected=structuredClone(s);fn(expected);const a=act(s,()=>fn(s));assert.deepEqual(s,expected);assert.equal(a.kind,'guards');
  const saved=JSON.stringify(s);assert.deepEqual(restoreGame(saved),s);
  for(const [time,fraction]of [[0,0],[90,.5],[180,1],[220,1]]){
   const p=motionPose(a,time);assert.equal(p.guards[0].x,8+dx*(3-fraction));assert.equal(p.guards[0].y,6+dy*(3-fraction));
   assert.equal(p.x,8);assert.equal(p.y,6);assert.equal(p.swing,null);assert.equal(p.bob,0);
  }
  assert.equal(JSON.stringify(s),saved);
 }
});

test('Actual identities survive removal, index shifts, vacated cells and longer player attacks',()=>{
 const s=world();s.enemies=[{x:9,y:6,hp:4},{x:10,y:6,hp:8},{x:11,y:6,hp:6}];const survivor=s.enemies[1],last=s.enemies[2];
 const a=act(s,()=>{const p=describeDirection(s,1,0);step(s,1,0);return {...p,to:{x:s.x,y:s.y}};});
 assert.deepEqual(s.enemies,[{x:9,y:6,hp:8},{x:10,y:6,hp:6}]);assert.deepEqual(a.guards.map(g=>g.enemy),[survivor,last]);
 assert.deepEqual(a.guards.map(g=>g.from.x),[10,11]);assert.deepEqual(a.guards.map(g=>g.to.x),[9,10]);
 const halfway=motionPose(a,90);assert.equal(halfway.guards[0].x,9.5);assert.equal(halfway.guards[1].x,10.5);
 const after=motionPose(a,200);assert.equal(after.guards[0].x,9);assert.equal(after.guards[1].x,10);assert.notEqual(after.swing,null);
});

test('Blocked, odd, inactive, failed heal and replaced states never invent guard moves',()=>{
 const s=world();s.enemies=[{x:11,y:6,hp:8}];s.tiles[6*W+10]=1;
 assert.equal(act(s,()=>rest(s)),null); // straight route blocked, no y alternative
 s.tiles[6*W+10]=0;s.turn=0;assert.equal(act(s,()=>rest(s)),null);
 assert.equal(act(s,()=>heal(s)),null); // already full HP
 s.hp=10;s.potions=0;assert.equal(act(s,()=>heal(s)),null);
 s.x=1;assert.equal(act(s,()=>step(s,-1,0)),null);
 s.status='defeated';s.hp=0;assert.equal(act(s,()=>rest(s)),null);
 assert.equal(describeSceneMotion(captureGuards(s),world(),null,facing),null);
 const occupied=world();occupied.enemies=[{x:10,y:6,hp:8},{x:9,y:6,hp:8}];const a=act(occupied,()=>rest(occupied));assert.equal(a,null);
 // A wall-blocked primary direction takes the actual alternative, not a prediction.
 const alternative=world();alternative.enemies=[{x:10,y:7,hp:8}];alternative.tiles[7*W+9]=1;
 const b=act(alternative,()=>rest(alternative));assert.deepEqual(b.guards[0].to,{x:10,y:6});
});

test('Guard frame data is copied, finite, cancelable and ignores stale callbacks',()=>{
 let time=0,id=0,reduced=false;const queue=new Map(),poses=[];
 const api=createCharacterMotion({render:p=>poses.push(p),requestFrame:f=>{queue.set(++id,f);return id;},cancelFrame:i=>queue.delete(i),now:()=>time,reducedMotion:()=>reduced});
 const s=world();s.enemies=[{x:11,y:6,hp:8}];const a=act(s,()=>rest(s));api.begin(a);const late=[...queue.values()][0];
 a.guards[0].to.x=90;a.guards[0].from.x=90;s.enemies[0].x=80;
 time=90;queue.clear();late();assert.equal(poses.at(-1).guards[0].x,10.5);
 api.cancel();const count=poses.length;late();assert.equal(poses.length,count);assert.equal(queue.size,0);
 api.begin({...a,guards:[]});assert.equal(queue.size,0);assert.equal(poses.at(-1),null);
 const b=act(world(),()=>undefined);assert.equal(b,null);
 const fresh=world();fresh.enemies=[{x:11,y:6,hp:8}];const c=act(fresh,()=>rest(fresh));api.begin(c);time+=180;const f=[...queue.values()][0];queue.clear();f();assert.equal(queue.size,0);assert.equal(poses.at(-1),null);
 api.begin(c);reduced=true;const g=[...queue.values()][0];queue.clear();g();assert.equal(queue.size,0);assert.equal(poses.at(-1),null);
 api.begin(c);assert.equal(queue.size,0);
});

test('Whole guard renderer and HP share the offset, balance context and preserve the real enemy',()=>{
 const enemy=Object.freeze({x:10,y:6,hp:8}),calls=[];const ctx={save:()=>calls.push('save'),restore:()=>calls.push('restore'),translate:(...p)=>calls.push(p)};
 const pose={guards:[{enemy,x:10.5,y:6}]};let received;
 drawMovingGuard(ctx,enemy,pose,40,()=>{received=enemy;calls.push('art+HP');});
 assert.equal(received,enemy);assert.deepEqual(calls,['save',[20,0],'art+HP','restore']);
 calls.length=0;drawMovingGuard(ctx,enemy,null,40,()=>calls.push('static'));assert.deepEqual(calls,['static']);
 assert.throws(()=>drawMovingGuard(ctx,enemy,pose,40,()=>{throw Error('draw');}));assert.equal(calls.at(-1),'restore');
});

test('Legacy imported states animate without adding any persistent presentation fields',()=>{
 const s=restoreGame(readFileSync(new URL('./fixtures/legacy-save.json',import.meta.url),'utf8'));
 s.turn=1;s.tiles=world().tiles;s.x=8;s.y=6;s.enemies=[{x:11,y:6,hp:8}];const keys=Object.keys(s),enemyKeys=Object.keys(s.enemies[0]);
 const a=act(s,()=>rest(s));assert.equal(a.guards.length,1);const saved=JSON.stringify(s);motionPose(a,90);
 assert.equal(JSON.stringify(s),saved);assert.deepEqual(Object.keys(s),keys);assert.deepEqual(Object.keys(s.enemies[0]),enemyKeys);assert.deepEqual(restoreGame(saved),s);
});
