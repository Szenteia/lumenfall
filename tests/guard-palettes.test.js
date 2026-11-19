import test from 'node:test';import assert from 'node:assert/strict';
import {drawGuard} from '../src/guard.js';
const enemy=Object.freeze({x:4,y:5,hp:6});
const trace=(theme,hit=null,stride=0)=>{const calls=[];const ctx=new Proxy({},{get:(_,n)=>(...a)=>calls.push([n,...a]),set:(_,n,v)=>{calls.push([n,v]);return true;}});drawGuard(ctx,enemy,hit,40,stride,theme);return calls;};
test('Guard themes change only colors, preserve indicators and accept legacy calls',()=>{
 for(const hit of [null,Object.freeze({x:4,y:5,dx:1,dy:0,strength:.75,survived:true})])for(const stride of [0,1,-1]){
  const traces=['mist','amber','crystal'].map(id=>trace(Object.freeze({id}),hit,stride));
  assert.equal(new Set(traces.map(JSON.stringify)).size,3);
  const geometry=c=>c.filter(x=>x[0]!=='fillStyle');
  for(const calls of traces){assert.deepEqual(geometry(calls),geometry(traces[0]));assert.equal(calls.length,traces[0].length);
   for(const color of ['#090d1880','#18202c','#e9a2a9',...(hit?['#f4c5d5']:[])])assert.ok(calls.some(c=>c[0]==='fillStyle'&&c[1]===color));
   assert.equal(calls.filter(c=>c[0]==='save').length,calls.filter(c=>c[0]==='restore').length);
  }
  for(const fallback of [undefined,null,{id:'unknown'},{id:'toString'}])assert.deepEqual(trace(fallback,hit,stride),traces[2]);
 }
});
