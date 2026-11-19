import test from 'node:test';
import assert from 'node:assert/strict';
import {motionPose,MOVE_MS} from '../src/character-motion.js';
import {drawAdventurer} from '../src/character.js';
const trace=pose=>{const calls=[];const ctx=new Proxy({},{get:(_,k)=>(...a)=>calls.push([k,...a]),set:(_,k,v)=>{calls.push([k,v]);return true;}});drawAdventurer(ctx,pose);return calls;};
test('Adventurer stride completes one cycle only during actual movement in every direction',()=>{
 for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
  const action=Object.freeze({kind:'move',from:Object.freeze({x:2,y:6}),to:Object.freeze({x:2+dx,y:6+dy}),dx,dy});
  for(const t of [-1,0,MOVE_MS,MOVE_MS+1])assert.equal(motionPose(action,t).stride,0);
  assert.equal(motionPose(action,45).stride,1);assert.equal(motionPose(action,135).stride,-1);
  for(const kind of ['attack','guards'])assert.equal(motionPose({...action,kind},45).stride,0);
  assert.equal(motionPose({...action,to:action.from},45).stride,0);
 }
});
test('Stride changes boots and cape only, preserving head, lantern, shadow and idle compatibility',()=>{
 const base=Object.freeze({x:2,y:6,dx:0,dy:1});const idle=trace(base);
 assert.deepEqual(trace({...base,stride:0}),idle);
 for(const invalid of [NaN,Infinity,-Infinity,'1',null])assert.deepEqual(trace({...base,stride:invalid}),idle);
 assert.deepEqual(trace({...base,stride:9}),trace({...base,stride:1}));
 assert.deepEqual(trace({...base,stride:-9}),trace({...base,stride:-1}));
 for(const stride of [-1,1]){
  const calls=trace({...base,stride});
  assert.ok(calls.some(c=>JSON.stringify(c)===JSON.stringify(['fillRect',-6,10+stride*2,4,5])));
  assert.ok(calls.some(c=>JSON.stringify(c)===JSON.stringify(['fillRect',3,10-stride*2,4,5])));
  const changes=calls.filter((c,i)=>JSON.stringify(c)!==JSON.stringify(idle[i]));
  assert.equal(changes.length,8); // six cape vertices and two boots
  assert.ok(changes.every(c=>c[0]==='lineTo'||c[0]==='fillRect'));
  assert.equal(calls.filter(c=>c[0]==='save').length,calls.filter(c=>c[0]==='restore').length);
 }
 assert.deepEqual(trace({...base,swing:.5,stride:1}),trace({...base,swing:.5}));
});
