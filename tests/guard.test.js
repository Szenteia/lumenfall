import test from 'node:test';import assert from 'node:assert/strict';
import {drawGuard,drawGuardImpact} from '../src/guard.js';
import {describeDirection,motionPose,createCharacterMotion,ATTACK_MS} from '../src/character-motion.js';
import {createGame,step} from '../src/game.js';
function context(){const calls=[];return {calls,ctx:new Proxy({},{get:(_,n)=>(...a)=>calls.push([n,...a]),set:(_,n,v)=>{calls.push([n,v]);return true;}})};}
const enemy=Object.freeze({x:3,y:6,hp:2});
const hit=Object.freeze({x:3,y:6,survived:true,dx:1,dy:0,strength:1});

test('Original guard and impact preserve frozen input, balance context and draw without font glyphs',()=>{
 const {ctx,calls}=context(),before=JSON.stringify({enemy,hit});drawGuard(ctx,enemy,hit);drawGuardImpact(ctx,hit);
 assert.equal(JSON.stringify({enemy,hit}),before);assert.equal(calls.filter(c=>c[0]==='save').length,calls.filter(c=>c[0]==='restore').length);assert.equal(calls.some(c=>c[0]==='fillText'),false);
 assert.ok(calls.some(c=>c[0]==='fillRect'&&c[1]===-10&&c[2]===15&&c[3]===4&&c[4]===2));
});
test('HP bar uses current HP and recoil belongs only to a surviving target, never a new occupant or different guard',()=>{
 for(const hp of [1,2,6,8,10]){const {ctx,calls}=context();drawGuard(ctx,{...enemy,hp});assert.ok(calls.some(c=>c[0]==='fillRect'&&c[1]===-10&&c[2]===15&&c[3]===hp*2&&c[4]===2));}
 for(const [guard,effect,expected]of [[enemy,hit,true],[{...enemy,x:4},hit,false],[enemy,{...hit,survived:false},false]]){const {ctx,calls}=context();drawGuard(ctx,guard,effect);assert.equal(calls.some(c=>c[0]==='translate'&&c[1]===2&&c[2]===0),expected);}
});
test('Target is captured before four-direction surviving/killing hits; source state is unchanged by description',()=>{
 for(const [dx,dy]of [[0,-1],[1,0],[0,1],[-1,0]])for(const hp of [4,8]){
  const s=createGame({rulesVersion:2,dayId:'2026-11-01'});s.x=8;s.y=6;s.tiles.fill(0);s.chests=[];s.enemies=[{x:8+dx,y:6+dy,hp}];
  const target=s.enemies[0],before=JSON.stringify(s),a=describeDirection(s,dx,dy);assert.equal(JSON.stringify(s),before);assert.deepEqual(a.target,{x:8+dx,y:6+dy});assert.equal(step(s,dx,dy),true);
  const effect={...a.target,survived:s.enemies.includes(target)},pose=motionPose({...a,hit:effect,to:{x:s.x,y:s.y}},110);
  assert.equal(pose.hit.survived,hp===8);assert.equal(pose.hit.x,8+dx);assert.equal(pose.hit.y,6+dy);assert.equal(pose.hit.strength,1);
 }
});
test('Hit strength ends with the sword window; plain movement, missing hit and completed frames never create impact',()=>{
 const attack=Object.freeze({kind:'attack',from:Object.freeze({x:2,y:6}),to:Object.freeze({x:2,y:6}),dx:1,dy:0,hit});const before=JSON.stringify(attack);
 assert.equal(motionPose(attack,0).hit.strength,0);assert.equal(motionPose(attack,110).hit.strength,1);assert.equal(motionPose(attack,ATTACK_MS).hit,null);assert.equal(motionPose({...attack,kind:'move'},90).hit,null);assert.equal(motionPose({...attack,hit:null},90).hit,null);assert.equal(JSON.stringify(attack),before);
 const {ctx,calls}=context();drawGuardImpact(ctx,null);drawGuardImpact(ctx,{...hit,strength:0});assert.equal(calls.length,0);
});
test('Shared scheduler copies transient hit data and clears it on replacement, cancel and reduced motion',()=>{
 let time=0,id=0,reduced=false;const queue=new Map(),rendered=[];const motion=createCharacterMotion({render:p=>rendered.push(p),requestFrame:f=>{queue.set(++id,f);return id;},cancelFrame:i=>queue.delete(i),now:()=>time,reducedMotion:()=>reduced});
 const action={kind:'attack',from:{x:2,y:6},to:{x:2,y:6},dx:1,dy:0,hit:{...hit}};motion.begin(action);action.hit.x=99;const stale=[...queue.values()][0];time=110;queue.clear();stale();assert.equal(rendered.at(-1).hit.x,3);
 motion.cancel();assert.equal(rendered.at(-1),null);assert.equal(queue.size,0);const n=rendered.length;stale();assert.equal(rendered.length,n);
 reduced=true;motion.begin(action);assert.equal(rendered.at(-1),null);assert.equal(queue.size,0);
});
