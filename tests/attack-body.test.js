import test from 'node:test';import assert from 'node:assert/strict';
import {attackBodyPose,drawAdventurer} from '../src/character.js';
const trace=(swing,dx=1,dy=0,size=40)=>{const calls=[];const ctx=new Proxy({},{get:(_,n)=>(...a)=>calls.push([n,...a]),set:(_,n,v)=>{calls.push([n,v]);return true;}});drawAdventurer(ctx,Object.freeze({x:2,y:6,dx,dy,swing}),size);return calls;};
test('Attack anticipation, lunge and recovery are continuous, bounded and neutral at endpoints',()=>{
 assert.equal(Math.abs(attackBodyPose(0).body),0);assert.equal(Math.abs(attackBodyPose(1).body),0);
 assert.equal(attackBodyPose(.25).body,-1);assert.equal(attackBodyPose(.55).body,3);
 for(let i=0;i<=1000;i++){const {body,cape}=attackBodyPose(i/1000);assert.ok(body>=-1&&body<=3);assert.ok(Math.abs(cape)<=1.5);}
 for(const t of [.25,.55])assert.ok(Math.abs(attackBodyPose(t-1e-6).body-attackBodyPose(t+1e-6).body)<.0001);
});
test('Four directions move body and cape after anchored shadow, with proportional canvas scale',()=>{
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])for(const size of [20,40]){
  const calls=trace(.55,dx,dy,size),translations=calls.filter(c=>c[0]==='translate');
  assert.deepEqual(translations[0],['translate',2.5*size,6.5*size]);assert.deepEqual(translations[1],['translate',dx*3,dy*3]);assert.ok(calls.some(c=>c[0]==='moveTo'&&c[1]===-8-dx*1.5&&c[2]===-1-dy*1.5));
  assert.ok(calls.findIndex(c=>c[0]==='ellipse')<calls.indexOf(translations[1]));
  assert.ok(calls.some(c=>c[0]==='scale'&&c[1]===size/40&&c[2]===size/40));
  assert.equal(calls.filter(c=>c[0]==='save').length,calls.filter(c=>c[0]==='restore').length);
 }
});
test('Invalid swing is identical to idle and never sends non-finite numbers to Canvas',()=>{
 for(const value of [undefined,null,NaN,Infinity,-Infinity,-1,2,'0.5']){
  assert.deepEqual(trace(value),trace(null));
  for(const call of trace(value))for(const v of call)if(typeof v==='number')assert.ok(Number.isFinite(v));
 }
});
