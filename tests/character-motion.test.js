import test from 'node:test';
import assert from 'node:assert/strict';
import {createCharacterMotion, motionPose, describeDirection, MOVE_MS, ATTACK_MS} from '../src/character-motion.js';
import {drawAdventurer} from '../src/character.js';
import {createGame, step} from '../src/game.js';

const action={kind:'move',from:{x:2,y:6},to:{x:3,y:6},dx:1,dy:0};
function clock(){
 let time=0,id=0,reduced=false;const queue=new Map(),renders=[];
 const api=createCharacterMotion({render:p=>renders.push(p),requestFrame:fn=>{queue.set(++id,fn);return id;},cancelFrame:id=>queue.delete(id),now:()=>time,reducedMotion:()=>reduced});
 return {api,queue,renders,tick(t){time=t;const fns=[...queue.values()];queue.clear();fns.forEach(fn=>fn());},reduce(){reduced=true;}};
}
test('A step interpolates for 180ms, then stops with no idle frames',()=>{
 const c=clock();c.api.begin(action);assert.equal(c.renders[0].x,2);assert.equal(c.queue.size,1);
 c.tick(MOVE_MS/2);assert.equal(c.renders.at(-1).x,2.5);assert.equal(c.renders.at(-1).bob,2);
 c.tick(MOVE_MS);assert.equal(c.renders.at(-1),null);assert.equal(c.queue.size,0);
});
test('Replacement copies its action, cancels old frames and ignores a late cancelled callback',()=>{
 const c=clock();c.api.begin(action);const old=[...c.queue.values()][0];
 const next={...action,from:{x:3,y:6},to:{x:3,y:7},dx:0,dy:1};c.api.begin(next);next.to.y=99;
 const n=c.renders.length;old();assert.equal(c.renders.length,n);assert.equal(c.queue.size,1);
 c.tick(90);assert.equal(c.renders.at(-1).y,6.5);c.api.cancel();assert.equal(c.queue.size,0);assert.equal(c.renders.at(-1),null);
});
test('Reduced motion, missing frame APIs and a preference change snap immediately',()=>{
 const c=clock();c.reduce();c.api.begin(action);assert.deepEqual(c.renders,[null]);assert.equal(c.queue.size,0);
 const d=clock();d.api.begin(action);d.reduce();d.tick(20);assert.equal(d.renders.at(-1),null);assert.equal(d.queue.size,0);
 const renders=[];createCharacterMotion({render:p=>renders.push(p)}).begin(action);assert.deepEqual(renders,[null]);
});
test('Killing and surviving attacks are captured before simulation and stay on the original square',()=>{
 for(const hp of [4,8])for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]]){
  const s=createGame({dayId:'2026-10-29'});s.x=8;s.y=6;s.tiles.fill(0);s.enemies=[{x:8+dx,y:6+dy,hp}];s.chests=[];
  const before=JSON.stringify(s),a=describeDirection(s,dx,dy);assert.equal(JSON.stringify(s),before);assert.equal(a.kind,'attack');
  assert.equal(step(s,dx,dy),true);assert.equal(s.enemies.length,hp===4?0:1);
  const frozen=Object.freeze({...a,from:Object.freeze(a.from),to:Object.freeze({x:s.x,y:s.y})});
  const pose=motionPose(frozen,ATTACK_MS/2);assert.equal(pose.x,8);assert.equal(pose.y,6);assert.equal(pose.swing,.5);assert.equal(pose.dx,dx);assert.equal(pose.dy,dy);
  assert.equal(motionPose(frozen,ATTACK_MS).swing,null);
 }
});
test('Original character renderer preserves frozen pose and balances context without font glyphs',()=>{
 const calls=[];const ctx=new Proxy({},{get:(_,name)=>(...args)=>calls.push([name,...args])});
 const pose=Object.freeze({...motionPose({...action,kind:'attack'},100)}),before=JSON.stringify(pose);
 drawAdventurer(ctx,pose);assert.equal(JSON.stringify(pose),before);
 assert.equal(calls.filter(c=>c[0]==='save').length,calls.filter(c=>c[0]==='restore').length);
 assert.equal(calls.some(c=>c[0]==='fillText'),false);assert.ok(calls.some(c=>c[0]==='arc'));
});
