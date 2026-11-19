import test from 'node:test';
import assert from 'node:assert/strict';
import {wallLights,drawWallLight} from '../src/wall-lights.js';
import {drawDungeon,ENVIRONMENTS,createDungeonBackground} from '../src/environment.js';
const map=({width,height})=>Array.from({length:width*height},(_,i)=>{
 const x=i%width,y=Math.floor(i/width);return +(x===0||y===0||x===width-1||y===height-1||x%4===0&&y%3!==0);
});
const record=()=>{const calls=[];return {calls,ctx:new Proxy({},{get:(_,k)=>(...args)=>calls.push([k,...args]),set:(_,k,v)=>{calls.push([k,v]);return true;}})};};
test('Wall lights are sparse, deterministic, bounded and adjacent to floor at both sizes',()=>{
 for(const layout of [{width:17,height:13},{width:21,height:15}]){
  const tiles=Object.freeze(map(layout)),before=JSON.stringify(tiles);
  const selected=wallLights(tiles,layout);
  assert.ok(selected.length>0&&selected.length<=8);
  assert.deepEqual(wallLights(tiles,layout),selected);
  for(const {x,y} of selected){
   assert.ok(x>=0&&y>=0&&x<layout.width&&y<layout.height);
   assert.equal(tiles[y*layout.width+x],1);
   assert.ok([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>x+dx>=0&&x+dx<layout.width&&y+dy>=0&&y+dy<layout.height&&tiles[(y+dy)*layout.width+x+dx]===0));
   for(const p of selected)if(p.x!==x||p.y!==y)assert.ok(Math.abs(p.x-x)+Math.abs(p.y-y)>=4);
  }
  assert.equal(JSON.stringify(tiles),before);
 }
 assert.deepEqual(wallLights([],null),[]);
 assert.deepEqual(wallLights(Array(221).fill(1)),[]);
 assert.deepEqual(wallLights(Array(221).fill(0)),[]);
});
test('Three distinct original motifs stay inside a wall tile and restore canvas state',()=>{
 const traces=[];
 for(const theme of ENVIRONMENTS){
  const {ctx,calls}=record();drawWallLight(ctx,theme.id);traces.push(JSON.stringify(calls));
  assert.equal(calls[0][0],'save');assert.equal(calls.at(-1)[0],'restore');
  for(const [name,x,y,w,h] of calls){
   if(['moveTo','lineTo','fillRect'].includes(name)){assert.ok(x>=1&&y>=1&&x<=39&&y<=39);if(name==='fillRect')assert.ok(x+w<=39&&y+h<=39);}
  }
 }
 assert.equal(new Set(traces).size,3);
});
test('Dungeon integrates one motif per selected wall; actual cached drawing survives actions',()=>{
 for(const layout of [{width:17,height:13},{width:21,height:15}])for(const theme of ENVIRONMENTS){
  const tiles=map(layout),{ctx,calls}=record();drawDungeon(ctx,tiles,theme,40,layout);
  assert.equal(calls.filter(c=>c[0]==='fillRect'&&c.slice(1).join(',')==='8,8,24,24').length,wallLights(tiles,layout).length);
 }
 const {ctx,calls}=record(),surface={getContext:()=>ctx};
 const cache=createDungeonBackground({createCanvas:()=>surface});
 const state={dayId:'2026-11-13',tiles:map({width:17,height:13})};
 cache.prepare(state);const count=calls.length;
 state.turn=99;state.player={x:2,y:6};cache.prepare(state);
 cache.paint({drawImage(){}});assert.equal(calls.length,count);
 cache.prepare({...state,tiles:map({width:21,height:15})},{width:21,height:15});assert.ok(calls.length>count);
});
