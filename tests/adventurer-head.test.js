import test from 'node:test';
import assert from 'node:assert/strict';
import {headView,drawAdventurerHead} from '../src/adventurer-head.js';
import {drawAdventurer} from '../src/character.js';
function canvas(){
 const calls=[];const ctx=new Proxy({}, {get:(o,k)=>k in o?o[k]:(...args)=>calls.push({kind:k,color:o.fillStyle,args})});
 return {ctx,calls};
}
const directions=[[0,1,'front',2],[0,-1,'back',0],[-1,0,'left',1],[1,0,'right',1]];
test('Cardinal views have distinct silhouettes, correct eye side/count and no rear face',()=>{
 const paths=[];
 for(const [dx,dy,view,count] of directions){
  assert.equal(headView(dx,dy),view);const {ctx,calls}=canvas();drawAdventurerHead(ctx,dx,dy);
  const eyes=calls.filter(c=>c.kind==='fillRect'&&c.color==='#183347');assert.equal(eyes.length,count);
  if(view==='left')assert.ok(eyes[0].args[0]<0);
  if(view==='right')assert.ok(eyes[0].args[0]>0);
  if(view==='back')assert.equal(calls.some(c=>c.color==='#f4bd91'),false);
  const hair=calls.filter(c=>['moveTo','lineTo'].includes(c.kind)&&c.color==='#263456');paths.push(JSON.stringify(hair));
  assert.ok(calls.some(c=>c.kind==='fill'&&c.color==='#a8cadd'));
  for(const c of calls){
   if(['moveTo','lineTo'].includes(c.kind)){assert.ok(c.args[0]>=-10&&c.args[0]<=10);assert.ok(c.args[1]>=-16&&c.args[1]<=2);}
  }
  assert.equal(calls.some(c=>['translate','scale','rotate'].includes(c.kind)),false);
 }
 assert.equal(new Set(paths).size,4);
});
test('Unsupported directions render the exact front fallback',()=>{
 const front=canvas();drawAdventurerHead(front.ctx,0,1);
 for(const [dx,dy] of [[undefined,undefined],[0,0],[1,1],[NaN,0],[Infinity,0],['1',0],[2,0],[null,-1]]){
  assert.equal(headView(dx,dy),'front');const c=canvas();drawAdventurerHead(c.ctx,dx,dy);assert.deepEqual(c.calls,front.calls);
 }
});
test('Head uses existing bob/scale, leaves equipment fixed, and preserves frozen poses and context',()=>{
 for(const size of [20,40,80])for(const swing of [null,.5]){
  let equipment;
  for(const [dx,dy] of directions){
   const pose=Object.freeze({x:2,y:3,dx,dy,bob:2,swing}),before=JSON.stringify(pose),c=canvas();drawAdventurer(c.ctx,pose,size);
   assert.equal(JSON.stringify(pose),before);
   assert.deepEqual(c.calls.find(c=>c.kind==='scale').args,[size/40,size/40]);
   assert.equal(c.calls.filter(c=>c.kind==='save').length,c.calls.filter(c=>c.kind==='restore').length);
   const fixed=c.calls.filter(c=>['#0b111c99','#172336','#ffe7a1','#b8dee6'].includes(c.color)&&['fillRect','ellipse','moveTo','lineTo'].includes(c.kind));
   if(equipment)assert.deepEqual(fixed,equipment);equipment=fixed;
   const head=c.calls.findIndex(c=>c.kind==='beginPath'&&c.color==='#263456'||c.kind==='beginPath'&&c.color==='#f4bd91');
   const transforms=c.calls.slice(0,head).filter(c=>c.kind==='translate');
   assert.equal(transforms.length,2);
   if(swing===null)assert.equal(transforms[1].args[1],-2);
  }
 }
});
