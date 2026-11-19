import test from 'node:test';import assert from 'node:assert/strict';
import {drawChest} from '../src/chest.js';
function context(){
 const calls=[],stack=[],state={fillStyle:'old',strokeStyle:'old',lineWidth:7,globalAlpha:.7,transform:[0,0,1,1]};
 const methods={save(){stack.push(structuredClone(state));},restore(){Object.assign(state,stack.pop());},translate(x,y){state.transform[0]+=x;state.transform[1]+=y;},scale(x,y){state.transform[2]*=x;state.transform[3]*=y;}};
 const ctx=new Proxy({}, {get:(_,n)=>(...a)=>{calls.push([n,...a]);methods[n]?.(...a);},set:(_,n,v)=>{calls.push([n,v]);state[n]=v;return true;}});
 return {ctx,calls,state,stack};
}
test('Original coffer renders all themes and sizes without mutating input or leaking Canvas state',()=>{
 const colors=new Set();
 for(const id of ['mist','amber','crystal'])for(const size of [20,40,80])for(const [x,y] of [[3,6],[19,13]]){
  const {ctx,calls,state,stack}=context(),before=structuredClone(state),chest=Object.freeze({x,y}),theme=Object.freeze({id});
  drawChest(ctx,chest,theme,size);assert.deepEqual(state,before);assert.equal(stack.length,0);
  assert.ok(calls.some(c=>c[0]==='translate'&&c[1]===(x+.5)*size&&c[2]===(y+.5)*size));
  assert.ok(calls.some(c=>c[0]==='scale'&&c[1]===size/40));assert.ok(!calls.some(c=>c[0]==='fillText'));
  colors.add(calls.filter(c=>c[0]==='fillStyle').map(c=>c[1]).join(','));
  // All geometry fits inside the local 40px cell, independent of map bounds.
  for(const c of calls){if(['moveTo','lineTo'].includes(c[0]))assert.ok(Math.abs(c[1])<=15&&Math.abs(c[2])<=15);
   if(c[0]==='fillRect')assert.ok(c[1]>=-15&&c[2]>=-15&&c[1]+c[3]<=15&&c[2]+c[4]<=15);
   if(c[0]==='ellipse')assert.ok(Math.abs(c[1])+c[3]<=15&&Math.abs(c[2])+c[4]<=15);}
 }
 assert.equal(colors.size,3);
});
test('Missing and unknown environment use the same legacy coffer',()=>{
 const render=theme=>{const c=context();drawChest(c.ctx,{x:2,y:6},theme);return c.calls;};
 assert.deepEqual(render(null),render({id:'mist'}));assert.deepEqual(render({id:'unknown'}),render({id:'mist'}));
});
