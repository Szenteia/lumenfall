import test from 'node:test';
import assert from 'node:assert/strict';
import {swordTrail,drawSwordTrail} from '../src/sword-trail.js';
import {drawAdventurer} from '../src/character.js';
function canvas(){
 const calls=[],stack=[];const state={fillStyle:'initial',globalAlpha:.4};
 const ctx=new Proxy(state,{get:(o,k)=>k in o?o[k]:(...args)=>{
  calls.push({kind:k,args,color:o.fillStyle,alpha:o.globalAlpha});
  if(k==='save')stack.push({...o});if(k==='restore')Object.assign(o,stack.pop());
 }});return {ctx,calls,stack};
}
test('Trail fades at endpoints, tapers to zero behind the blade and stays within its reach',()=>{
 for(const v of [null,undefined,NaN,Infinity,-1,0,1,2,'0.5'])assert.equal(swordTrail(v),null);
 for(let i=1;i<100;i++){
  const p=i/100,t=swordTrail(p);assert.deepEqual(t,swordTrail(p));assert.ok(t.alpha>0&&t.alpha<=.75);
  const a=t.points.slice(0,13),b=t.points.slice(13).reverse();
  assert.deepEqual(a[0],b[0]);
  for(let j=0;j<a.length;j++){
   const r=Math.hypot(...a[j]),ri=Math.hypot(...b[j]);assert.ok(r<=24+1e-12&&ri>=19-1e-12&&r-ri<=5+1e-12);
   const angle=Math.atan2(a[j][1],a[j][0]);assert.ok(angle>=-1.2-1e-12&&angle<=0);
   if(j)assert.ok(r-ri>=Math.hypot(...a[j-1])-Math.hypot(...b[j-1])-1e-12);
  }
 }
 assert.ok(swordTrail(.25).alpha<swordTrail(.5).alpha);
 assert.ok(swordTrail(.75).alpha<swordTrail(.5).alpha);
 assert.ok(swordTrail(.00001).alpha<.0001&&swordTrail(.99999).alpha<.0001);
});
test('Drawing restores alpha/style and never changes transforms; invalid input draws nothing',()=>{
 const c=canvas();drawSwordTrail(c.ctx,.5);assert.equal(c.ctx.globalAlpha,.4);assert.equal(c.ctx.fillStyle,'initial');assert.equal(c.stack.length,0);
 assert.equal(c.calls.some(v=>['translate','rotate','scale'].includes(v.kind)),false);
 assert.equal(c.calls.filter(v=>v.kind==='fill').length,1);
 for(const v of [null,NaN,0,1,-1,Infinity]){const c=canvas();drawSwordTrail(c.ctx,v);assert.equal(c.calls.length,0);}
});
test('Four directions and three sizes keep the blade geometry and place the trail underneath it',()=>{
 for(const size of [20,40,80])for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const c=canvas(),pose=Object.freeze({x:2,y:3,dx,dy,swing:.5});drawAdventurer(c.ctx,pose,size);
  const trail=c.calls.findIndex(v=>v.kind==='fill'&&v.color==='#7fe3cf'),blade=c.calls.findIndex(v=>v.kind==='fill'&&v.color==='#d5ffff');
  assert.ok(trail>=0&&blade>trail);assert.equal(c.calls[blade].alpha,.4);
  assert.deepEqual(c.calls.find(v=>v.kind==='scale').args,[size/40,size/40]);
  assert.deepEqual(c.calls.filter(v=>v.kind==='rotate').map(v=>v.args[0]),[Math.atan2(dy,dx),0]);
  assert.deepEqual(c.calls.filter(v=>v.color==='#d5ffff'&&['moveTo','lineTo'].includes(v.kind)).map(v=>v.args),[[6,-2],[21,-1],[24,0],[21,2],[6,2]]);
  assert.equal(c.stack.length,0);
 }
});
