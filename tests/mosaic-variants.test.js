import test from 'node:test';
import assert from 'node:assert/strict';
import {drawFloorMosaics,selectFloorMosaics} from '../src/floor-mosaics.js';
import {createGame} from '../src/game.js';
import {expeditionSize} from '../src/expedition-size.js';
import {exportSave,importSave} from '../src/transfer.js';
import {createDungeonBackground} from '../src/environment.js';
function trace(tiles,layout,id,size=40){const parts=[];let part;const ctx=new Proxy({},{get:(_,key)=>(...a)=>{if(key==='save'){part=[];parts.push(part);}part?.push([key,...a]);},set:(_,key,value)=>{part?.push([key,value]);return true;}});drawFloorMosaics(ctx,tiles,{id},size,layout);return parts;}
test('Three stable, geometrically distinct variants per theme with bounded coordinates at every size',()=>{
 for(const [width,height] of [[17,13],[21,15],[25,19]])for(const size of [20,40,80])for(const id of ['mist','amber','crystal']){
  const tiles=Object.freeze(Array(width*height).fill(0)),layout=Object.freeze({width,height});const parts=trace(tiles,layout,id,size);
  assert.equal(parts.length,3);assert.deepEqual(parts,trace(tiles,layout,id,size));
  const geometry=parts.map(p=>p.filter(c=>['moveTo','lineTo','arc'].includes(c[0])));
  assert.equal(new Set(geometry.map(JSON.stringify)).size,3);
  for(const p of parts){assert.equal(p[0][0],'save');assert.equal(p.at(-1)[0],'restore');assert.deepEqual(p[2],['scale',size/40,size/40]);
   for(const [op,x,y,r] of p){if(op==='moveTo'||op==='lineTo')assert.ok(Math.hypot(x,y)<=32+1e-9);if(op==='arc')assert.ok(Math.hypot(x,y)+r<=32);}
  }
 }
});
test('Zero to three selected sites keep prefix order; malformed and unknown inputs draw nothing',()=>{
 const layout={width:25,height:19},tiles=Array(475).fill(1);
 for(let count=0;count<=3;count++){
  for(const id of ['mist','amber','crystal'])assert.equal(trace(tiles,layout,id).length,count);
  if(count<3)for(let y=2;y<4;y++)for(let x=2+count*5;x<4+count*5;x++)tiles[y*25+x]=0;
 }
 assert.deepEqual(selectFloorMosaics(tiles,layout),[{x:2,y:2},{x:7,y:2},{x:12,y:2}]);
 assert.deepEqual(trace(tiles,layout,'unknown'),[]);assert.deepEqual(trace(tiles,{width:17,height:13},'mist'),[]);assert.deepEqual(trace(null,layout,'mist'),[]);
});
test('Real expeditions retain motifs through transfer and actor/loot changes without rebuilding cache',()=>{
 for(const rulesVersion of [1,2,3,4]){
  const state=createGame({dayId:'2026-11-28',rulesVersion}),layout=expeditionSize(state),restored=importSave(exportSave(state).text);
  for(const id of ['mist','amber','crystal'])assert.deepEqual(trace(state.tiles,layout,id),trace(restored.tiles,layout,id));
  const saved=JSON.stringify(state);let builds=0,blits=0;
  const ctx=new Proxy({},{get:()=>()=>{},set:()=>true});
  const bg=createDungeonBackground({createCanvas:()=>({getContext:()=>ctx}),render:(...a)=>{builds++;drawFloorMosaics(...a);}});
  bg.prepare(state,layout);assert.equal(builds,1);
  bg.prepare({...state,x:state.x+1,chests:[],enemies:[]},layout);bg.prepare(restored,layout);
  for(let i=0;i<20;i++)bg.paint({drawImage:()=>blits++});assert.equal(builds,1);assert.equal(blits,20);assert.equal(JSON.stringify(state),saved);
 }
});
