import test from 'node:test';
import assert from 'node:assert/strict';
import {drawRuneGate} from '../src/rune-gate.js';
import {ENVIRONMENTS} from '../src/environment.js';
import {createGame,step,extract} from '../src/game.js';
const trace=(theme,size)=>{const calls=[];const ctx=new Proxy({},{get:(_,n)=>(...a)=>calls.push([n,...a]),set:(_,n,v)=>{calls.push([n,v]);return true;}});drawRuneGate(ctx,theme,size);return calls;};
test('Rune gate has three palettes, stays in its tile and scales at the real exit',()=>{
 const traces=[];
 for(const theme of ENVIRONMENTS)for(const size of [20,40,80]){
  const before=JSON.stringify(theme),calls=trace(theme,size);
  assert.deepEqual(calls[1],['translate',2*size,6*size]);assert.deepEqual(calls[2],['scale',size/40,size/40]);
  assert.equal(calls[0][0],'save');assert.equal(calls.at(-1)[0],'restore');assert.equal(JSON.stringify(theme),before);
  assert.ok(!calls.some(c=>c[0]==='fillText'||c[0]==='drawImage'));
  for(const [name,x,y,w,h] of calls){
   if(['fillRect','moveTo','lineTo'].includes(name)){assert.ok(x>=0&&y>=0&&x<=40&&y<=40);if(name==='fillRect')assert.ok(x+w<=40&&y+h<=40);}
   if(name==='arc')assert.ok(x-w-2>=0&&y-w-2>=0&&x+w+2<=40&&y+w+2<=40);
   if(name==='ellipse')assert.ok(x-w>=0&&x+w<=40&&y-h>=0&&y+h<=40);
  }
  if(size===40)traces.push(JSON.stringify(calls));
 }
 assert.equal(new Set(traces).size,3);assert.deepEqual(trace(null,40),trace(ENVIRONMENTS[0],40));
});
test('Rendering leaves expedition and extraction reward unchanged',()=>{
 const s=createGame({dayId:'2026-11-15'});s.enemies=[];s.loot=60;s.bank=10;
 const before=JSON.stringify(s);for(const theme of ENVIRONMENTS)trace(theme,40);assert.equal(JSON.stringify(s),before);
 s.tiles[6*17+3]=0;step(s,1,0);assert.equal(extract(s),false);step(s,-1,0);assert.equal(extract(s),true);assert.equal(s.bank,70);assert.equal(s.loot,0);
});
