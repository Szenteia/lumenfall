import test from 'node:test';
import assert from 'node:assert/strict';
import {wallShadowRects,drawWallShadows} from '../src/wall-shadows.js';
import {ENVIRONMENTS,environmentFor,drawDungeon,createDungeonBackground} from '../src/environment.js';
const layout={width:3,height:3};
const center=walls=>{const t=Array(9).fill(1);t[4]=0;for(const i of [1,3,5,7])t[i]=walls.includes(i)?1:0;return t;};
test('Only cardinal wall boundaries cast strips, without row wrapping or diagonal shadows',()=>{
 const edges=[[1,[40,40,40,3]],[7,[40,77,40,3]],[3,[40,40,3,40]],[5,[77,40,3,40]]];
 for(const [i,expected] of edges){
  const rects=wallShadowRects(center([i]),40,layout).filter(([x,y])=>x>=40&&x<80&&y>=40&&y<80);
  assert.deepEqual(rects,[expected]);
 }
 assert.deepEqual(wallShadowRects(center([]),40,layout).filter(([x,y])=>x>=40&&x<80&&y>=40&&y<80),[]);
 assert.deepEqual(wallShadowRects([1,0,0,0,0,1],40,{width:3,height:2}),[[40,0,3,40],[80,37,40,3],[0,40,40,3],[77,40,3,40]]);
 assert.deepEqual(wallShadowRects(Array(9).fill(0),40,layout),[]);
});
test('Corners and narrow corridors preserve the center and never overlap at any scale or palette',()=>{
 const tiles=Object.freeze([1,1,1,1,0,1,1,1,1]);
 for(const size of [20,40,80]){
  const rects=wallShadowRects(tiles,size,layout),d=size*3/40;
  assert.equal(rects.length,4);
  for(const [x,y,w,h] of rects){
   assert.ok(x>=size&&y>=size&&x+w<=size*2&&y+h<=size*2);
   assert.equal(Math.min(w,h),d);
   assert.ok(!(x<=size*1.5&&size*1.5<x+w&&y<=size*1.5&&size*1.5<y+h));
  }
  for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){
   const [x,y,w,h]=rects[i],[a,b,c,d]=rects[j];
   assert.ok(Math.min(x+w,a+c)<=Math.max(x,a)||Math.min(y+h,b+d)<=Math.max(y,b));
  }
  for(const theme of ENVIRONMENTS){
   let color='original';const stack=[],calls=[];
   const ctx={save(){stack.push(color)},restore(){color=stack.pop()},set fillStyle(v){color=v},fillRect(...r){calls.push([color,...r])}};
   drawWallShadows(ctx,tiles,theme,size,layout);
   assert.deepEqual(calls,rects.map(r=>[theme.edge,...r]));assert.equal(color,'original');assert.equal(stack.length,0);
  }
 }
});
test('Explicit sizes, frozen input, deterministic output and invalid geometry',()=>{
 for(const [width,height] of [[17,13],[21,15],[15,21]]){
  const tiles=Array(width*height).fill(0);tiles[width*height-1]=1;Object.freeze(tiles);
  const expected=[[ (width-2)*40+37,(height-1)*40,3,40],[(width-1)*40,(height-2)*40+37,40,3]];
  assert.deepEqual(wallShadowRects(tiles,40,{width,height}).sort(),expected.sort());
  assert.deepEqual(wallShadowRects(tiles,40,{width,height}),wallShadowRects(tiles,40,{width,height}));
 }
 for(const [tiles,size,l] of [[[],40,layout],[Array(9),40,layout],[Array(9).fill(2),40,layout],[null,40,layout],[Array(9).fill(0),0,layout],[Array(9).fill(0),NaN,layout],[Array(9).fill(0),40,{width:1.5,height:6}]]){
  assert.deepEqual(wallShadowRects(tiles,size,l),[]);
  drawWallShadows(new Proxy({},{get(){throw Error('Invalid input must not draw')}}),tiles,ENVIRONMENTS[0],size,l);
 }
});
test('Actual background caches shadows across actions and frames, rebuilding only for visual changes',()=>{
 let rects=[],builds=0;const ctx=new Proxy({},{get:(_,n)=>(...a)=>{if(n==='fillRect')rects.push(a)},set:()=>true});
 const surface={getContext:()=>ctx},cache=createDungeonBackground({createCanvas:()=>surface,render(...a){builds++;drawDungeon(...a)}});
 const s={dayId:null,tiles:[1,1,1,1,0,1,1,1,1]},before=JSON.stringify(s);
 cache.prepare(s,layout);assert.ok(rects.some(r=>r.join(',')==='40,40,40,3'));assert.equal(JSON.stringify(s),before);
 const count=rects.length;s.turn=1;cache.prepare(s,layout);
 for(let i=0;i<10;i++)cache.paint({drawImage(c){assert.equal(c,surface)}});
 assert.equal(builds,1);assert.equal(rects.length,count);
 s.tiles[1]=0;cache.prepare(s,layout);assert.equal(builds,2);
 s.dayId=Array.from({length:28},(_,i)=>'2026-11-'+String(i+1).padStart(2,'0')).find(day=>environmentFor(day)!==ENVIRONMENTS[0]);cache.prepare(s,layout);
 const afterTheme=builds;assert.equal(afterTheme,3);
 cache.prepare(s,{width:1,height:9});assert.equal(builds,afterTheme+1);
});
