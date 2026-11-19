import test from 'node:test';
import assert from 'node:assert/strict';
import {motionPose} from '../src/character-motion.js';
import {drawMovingGuard} from '../src/guard-motion.js';
import {drawGuard} from '../src/guard.js';
const enemy=Object.freeze({x:4,y:4,hp:8});
function trace(stride,hit=null,size=40){const calls=[];const ctx=new Proxy({},{get:(_,n)=>(...a)=>calls.push([n,...a]),set:(_,n,v)=>{calls.push([n,v]);return true;}});drawGuard(ctx,enemy,hit,size,stride);return calls;}
test('Actual guard steps alternate feet and return exactly to rest in every direction, including longer attacks',()=>{
 for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1],[0,0]]){
  const a=Object.freeze({kind:'attack',from:Object.freeze({x:1,y:1}),to:Object.freeze({x:1,y:1}),guards:Object.freeze([Object.freeze({enemy,from:Object.freeze({x:4-dx,y:4-dy}),to:enemy})])});const before=JSON.stringify(a);
  for(const t of [-1,0,180,200,220])assert.equal(motionPose(a,t).guards[0].stride,0);
  assert.equal(motionPose(a,45).guards[0].stride,dx||dy?1:0);assert.equal(motionPose(a,135).guards[0].stride,dx||dy?-1:0);
  for(let t=0;t<=220;t++)assert.ok(Math.abs(motionPose(a,t).guards[0].stride)<=1);
  assert.equal(JSON.stringify(a),before);
 }
});
test('Only the matching moving guard receives a gait; missing poses stay at rest',()=>{
 const ctx={save(){},restore(){},translate(){}};let received;
 drawMovingGuard(ctx,enemy,{guards:[{enemy,x:3.5,y:4,stride:1}]},40,s=>received=s);assert.equal(received,1);
 for(const pose of [null,{guards:[]},{guards:[{enemy:{...enemy},x:3.5,y:4,stride:1}]}]){drawMovingGuard(ctx,enemy,pose,40,s=>received=s);assert.equal(received,undefined);}
});
test('Gait changes boots and cape but not shadow, HP or recoil; rendering is bounded at both sizes',()=>{
 const hit=Object.freeze({x:4,y:4,survived:true,strength:1,dx:1,dy:0});
 for(const size of [20,40]){
  const still=trace(0,hit,size),left=trace(1,hit,size),right=trace(-1,hit,size);
  const anchored=c=>c.filter(x=>['ellipse','translate','scale'].includes(x[0])||(x[0]==='fillRect'&&x[2]>=14));
  assert.deepEqual(anchored(left),anchored(still));assert.deepEqual(anchored(right),anchored(still));
  assert.ok(left.some(c=>c[0]==='fillRect'&&c[1]===-7&&c[2]===7));assert.ok(right.some(c=>c[0]==='fillRect'&&c[1]===-7&&c[2]===11));
  assert.ok(left.some(c=>c[0]==='lineTo'&&c[1]===14.5&&c[2]===11));
  assert.equal(left.filter(c=>c[0]==='save').length,left.filter(c=>c[0]==='restore').length);
 }
 assert.deepEqual(trace(NaN),trace(0));assert.deepEqual(trace(100),trace(1));assert.deepEqual(trace(-100),trace(-1));
});
