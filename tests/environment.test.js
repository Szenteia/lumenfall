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

test('Larger backgrounds paint the last row and column with the supplied stride',()=>{
 const layout=Object.freeze({width:21,height:15}),tiles=Array(315).fill(0);
 tiles[14*21+20]=1;
 Object.freeze(tiles);
 for(const theme of ENVIRONMENTS){
  const {ctx,calls}=recording();
  drawDungeon(ctx,tiles,theme,40,layout);
  assert.deepEqual(calls.find(c=>c[0]==='fillRect'),['fillRect',0,0,840,600]);
  const painted=calls.flatMap((c,i)=>c[0]==='translate'?[{x:c[1],y:c[2],color:calls[i+2][1]}]:[]);
  assert.equal(painted.length,315);
  assert.deepEqual(painted.at(-2),{x:760,y:560,color:theme.floor});
  assert.deepEqual(painted.at(-1),{x:800,y:560,color:theme.wall});
  assert.equal(painted.filter(p=>p.color===theme.wall).length,1);
 }
});

test('Identical tiles with a different layout refresh the same canvas once',()=>{
 const state={dayId:null,tiles:Array(315).fill(0)},wide={width:21,height:15},tall={width:15,height:21};
 const surface={getContext:()=>({})},renders=[];
 let canvases=0;
 const cache=createDungeonBackground({
  createCanvas:()=>{canvases++;return surface;},
  render(ctx,tiles,theme,size,layout){renders.push([surface.width,surface.height,theme.id,layout]);},
 });
 cache.prepare(state,wide);cache.prepare(state,{...wide});
 cache.prepare(state,tall);cache.prepare(state,{...tall});
 let blits=0;for(let i=0;i<3;i++)cache.paint({drawImage(canvas){assert.equal(canvas,surface);blits++;}});
 assert.equal(canvases,1);assert.equal(blits,3);
 assert.deepEqual(renders,[[840,600,'mist',wide],[600,840,'mist',tall]]);
 cache.prepare(state,wide);
 assert.deepEqual(renders.at(-1),[840,600,'mist',wide]);assert.equal(renders.length,3);
});

test('Invalid geometry does not resize, draw or display a stale cached background',()=>{
 const layout={width:21,height:15},state={dayId:null,tiles:Array(315).fill(0),...layout};
 const surface={getContext:()=>({})};
 let resizes=0,renders=0,blits=0;
 for(const key of ['width','height'])Object.defineProperty(surface,key,{set(){resizes++;}});
 const cache=createDungeonBackground({createCanvas:()=>surface,render(){renders++;}});
 const target={drawImage(){blits++;}};
 assert.equal(cache.prepare(state),null); // Untrusted state dimensions are ignored.
 cache.prepare(state,layout);cache.paint(target);
 for(const [s,size] of [[state,null],[state,{width:21,height:14}],[state,{width:21.5,height:15}],
   [{...state,tiles:state.tiles.slice(1)},layout],[null,layout]]){
  assert.equal(cache.prepare(s,size),null);
  cache.paint(target);
 }
 const {ctx,calls}=recording();
 drawDungeon(ctx,state.tiles,ENVIRONMENTS[0],40,{width:21,height:14});
 assert.equal(calls.length,0);
 assert.deepEqual([resizes,renders,blits],[2,1,1]);
 assert.equal(cache.prepare(state,layout),ENVIRONMENTS[0]);cache.paint(target);
 assert.deepEqual([resizes,renders,blits],[2,1,2]);
});
