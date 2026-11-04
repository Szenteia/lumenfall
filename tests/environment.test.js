import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ENVIRONMENTS,environmentFor,drawDungeon,createDungeonBackground} from '../src/environment.js';
import {createGame,nextRun,step} from '../src/game.js';
import {restoreGame} from '../src/save.js';
import {exportSave,importSave} from '../src/transfer.js';
const daily=()=>createGame({dayId:'2026-10-30'});
const legacy=()=>restoreGame(readFileSync(new URL('./fixtures/legacy-save.json',import.meta.url),'utf8'));
const freeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
function recording(){const calls=[];return {calls,ctx:new Proxy({},{get:(_,n)=>(...a)=>calls.push([n,...a]),set:(_,n,v)=>{calls.push([n,v]);return true;}})};}

test('Visual day selection is stable, reaches all three themes and does not use ambient random/time',()=>{
 const random=Math.random;Math.random=()=>{throw Error('Ambient randomness forbidden');};
 try{
  const seen=new Set();for(let i=0;i<365;i++){const date=new Date(Date.UTC(2026,0,1+i)).toISOString().slice(0,10);const a=environmentFor(date);assert.equal(environmentFor(date),a);seen.add(a.id);}
  assert.deepEqual([...seen].sort(),['amber','crystal','mist']);
  assert.equal(environmentFor(null),ENVIRONMENTS[0]);assert.equal(environmentFor(undefined),ENVIRONMENTS[0]);assert.equal(environmentFor('2026-02-30'),ENVIRONMENTS[0]);
  assert.equal(Object.isFrozen(ENVIRONMENTS),true);assert.ok(ENVIRONMENTS.every(Object.isFrozen));
 }finally{Math.random=random;}
});
test('All palettes draw different motifs on the same frozen map without changing daily or legacy saves',()=>{
 for(const s of [daily(),legacy()]){
  const before=JSON.stringify(s);freeze(s);const traces=[];
  for(const theme of ENVIRONMENTS){const {ctx,calls}=recording();drawDungeon(ctx,s.tiles,theme);assert.equal(calls.filter(c=>c[0]==='save').length,calls.filter(c=>c[0]==='restore').length);traces.push(JSON.stringify(calls));}
  assert.equal(new Set(traces).size,3);assert.equal(JSON.stringify(s),before);
 }
});
test('Saved day determines theme through export/import and midnight; a new run alone selects its new day',()=>{
 const s=daily();s.bank=98;const t=environmentFor(s.dayId);const loaded=importSave(exportSave(s).text);assert.deepEqual(loaded,s);assert.equal(environmentFor(loaded.dayId),t);
 const other=Array.from({length:28},(_,i)=>`2026-11-${String(i+1).padStart(2,'0')}`).find(d=>environmentFor(d)!==t);
 const n=nextRun(loaded,{dayId:other});assert.equal(n.bank,98);assert.notEqual(environmentFor(n.dayId),t);assert.equal(loaded.dayId,'2026-10-30');
 const old=legacy(),imported=importSave(exportSave(old).text);assert.deepEqual(imported,old);assert.equal(environmentFor(imported.dayId),ENVIRONMENTS[0]);
});
test('Background cache survives game actions and repeated paints; changed tiles and changed environment invalidate it',()=>{
 let renders=0,canvases=0;const surface={getContext:()=>({})};const cache=createDungeonBackground({createCanvas:()=>{canvases++;return surface;},render(){renders++;}}),s=daily();
 assert.equal(cache.prepare(null),null);assert.equal(canvases,0);cache.paint({drawImage(){throw Error('No null-state image');}});
 cache.prepare(s);assert.equal(renders,1);assert.equal(surface.width,680);assert.equal(surface.height,520);
 step(s,1,0);cache.prepare(s);cache.prepare(structuredClone(s));assert.equal(renders,1);
 let blits=0;for(let i=0;i<30;i++)cache.paint({drawImage(image){assert.equal(image,surface);blits++;}});assert.equal(blits,30);assert.equal(renders,1);
 s.tiles[18]=1-s.tiles[18];cache.prepare(s);assert.equal(renders,2);
 const day=Array.from({length:28},(_,i)=>`2026-11-${String(i+1).padStart(2,'0')}`).find(d=>environmentFor(d)!==environmentFor(s.dayId));s.dayId=day;cache.prepare(s);assert.equal(renders,3);assert.equal(canvases,1);
});
test('Visual rendering does not alter the versioned generator or subsequent gameplay outcome',()=>{
 const a=daily(),b=daily();for(const theme of ENVIRONMENTS)drawDungeon(recording().ctx,a.tiles,theme);
 for(const dir of [[1,0],[1,0],[0,-1],[-1,0],[0,1]]){assert.equal(step(a,...dir),step(b,...dir));assert.deepEqual(a,b);}
});
