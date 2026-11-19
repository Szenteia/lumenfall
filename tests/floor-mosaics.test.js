import test from 'node:test';
import assert from 'node:assert/strict';
import {selectFloorMosaics,drawFloorMosaics} from '../src/floor-mosaics.js';
import {createDungeonBackground} from '../src/environment.js';
const board=(width,height)=>({layout:{width,height},tiles:Array(width*height).fill(1)});
const open=(b,x,y)=>{for(const [a,c] of [[x,y],[x+1,y],[x,y+1],[x+1,y+1]])b.tiles[c*b.layout.width+a]=0;};
test('Mosaic selection handles empty, isolated, boundary, gate and malformed maps',()=>{
 const b=board(17,13);assert.deepEqual(selectFloorMosaics(b.tiles),[]);
 open(b,15,11);assert.deepEqual(selectFloorMosaics(b.tiles),[{x:15,y:11}]);
 open(b,2,5);assert.deepEqual(selectFloorMosaics(b.tiles),[{x:15,y:11}]);
 assert.deepEqual(selectFloorMosaics(b.tiles,{width:21,height:15}),[]);
 assert.deepEqual(selectFloorMosaics(null),[]);
 const corridor=board(17,13);for(let x=0;x<17;x++)corridor.tiles[17*4+x]=0;
 assert.deepEqual(selectFloorMosaics(corridor.tiles),[]);
});
test('Both sizes give stable bounded, separated floor-only positions without mutating input',()=>{
 for(const [width,height] of [[17,13],[21,15]]) {
  const tiles=Object.freeze(Array(width*height).fill(0)),layout=Object.freeze({width,height});
  const points=selectFloorMosaics(tiles,layout);assert.deepEqual(points,[{x:0,y:0},{x:3,y:0},{x:6,y:0}]);
  assert.deepEqual(points,selectFloorMosaics(tiles,layout));
  for(const p of points){assert.ok(p.x+1<width&&p.y+1<height);for(let y=p.y;y<=p.y+1;y++)for(let x=p.x;x<=p.x+1;x++)assert.ok(Math.abs(x-2)+Math.abs(y-6)>1);}
 }
});
test('Three motifs differ, scale and balance canvas state; unknown theme is harmless',()=>{
 const b=board(17,13);open(b,7,7);
 const trace=(id,size)=>{const calls=[];const ctx=new Proxy({},{get:(_,n)=>(...a)=>calls.push([n,...a]),set:(_,n,v)=>{calls.push([n,v]);return true;}});drawFloorMosaics(ctx,b.tiles,{id},size);return calls;};
 const traces=['mist','amber','crystal'].map(id=>trace(id,40));assert.equal(new Set(traces.map(JSON.stringify)).size,3);
 for(const id of ['mist','amber','crystal']) {const t=trace(id,20);assert.deepEqual(t[1],['translate',160,160]);assert.deepEqual(t[2],['scale',.5,.5]);assert.equal(t.filter(x=>x[0]==='save').length,t.filter(x=>x[0]==='restore').length);}
 assert.deepEqual(trace('unknown',40),[]);
});
test('Mosaic background is cached across actors and paint frames, rebuilt on map or theme changes',()=>{
 let builds=0,blits=0;const b=board(17,13);open(b,7,7);
 const ctx=new Proxy({},{get:()=>()=>{},set:()=>true});
 const bg=createDungeonBackground({createCanvas:()=>({getContext:()=>ctx}),render:(...args)=>{builds++;drawFloorMosaics(...args);}});
 const state={tiles:b.tiles,dayId:'2026-11-17'};bg.prepare(state);assert.equal(builds,1);
 for(let i=0;i<20;i++){bg.prepare({...state,x:i});bg.paint({drawImage:()=>blits++});}assert.equal(builds,1);assert.equal(blits,20);
 b.tiles[7*17+7]=1;bg.prepare(state);assert.equal(builds,2);
 for(let d=1;d<=28;d++)bg.prepare({...state,dayId:`2026-11-${String(d).padStart(2,'0')}`});assert.ok(builds>2);
 const large=board(21,15);bg.prepare({...state,tiles:large.tiles},large.layout);assert.ok(builds>3);
});
