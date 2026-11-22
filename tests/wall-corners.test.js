import test from 'node:test';
import assert from 'node:assert/strict';
import {wallCorners,drawWallCorners} from '../src/wall-corners.js';
import {ENVIRONMENTS,environmentFor,createDungeonBackground} from '../src/environment.js';
function recorder(){
 const paths=[],calls=[];let path=[];
 const ctx=new Proxy({}, {get:(o,k)=>k in o?o[k]:(...a)=>{
  calls.push(k);
  if(k==='beginPath')path=[];
  if(k==='moveTo'||k==='lineTo')path.push(a);
  if(k==='fill')paths.push({color:o.fillStyle,points:path});
 }});return {ctx,paths,calls};
}
const layout={width:3,height:3};
test('Exact four corner choices require two cardinal floors, never just a diagonal or one side',()=>{
 const directions=[[-1,-1],[1,-1],[1,1],[-1,1]];
 for(const [dx,dy] of directions){
  const tiles=Array(9).fill(1);tiles[(1+dy)*3+1+dx]=0;
  assert.deepEqual(wallCorners(tiles,layout),[]);
  tiles.fill(1);tiles[4+dx]=0;assert.deepEqual(wallCorners(tiles,layout),[]);
  tiles[4+dy*3]=0;
  assert.deepEqual(wallCorners(tiles,layout).filter(p=>p.x===1&&p.y===1),[{x:1,y:1,dx,dy}]);
 }
 const cross=[1,0,1,0,1,0,1,0,1];
 assert.deepEqual(wallCorners(cross,layout).filter(p=>p.x===1&&p.y===1),directions.map(([dx,dy])=>({x:1,y:1,dx,dy})));
 assert.deepEqual(wallCorners([1,0,0,0],{width:2,height:2}),[{x:0,y:0,dx:1,dy:1}]);
 assert.deepEqual(wallCorners([1,1,0,1,1,0],{width:3,height:2}),[]); // no row wrapping
});
test('Explicit sizes, frozen maps and invalid geometry are deterministic and safe',()=>{
 const random=Math.random;Math.random=()=>{throw Error('No RNG');};
 try{
  for(const [width,height] of [[17,13],[21,15],[15,21]]){
   const tiles=Array(width*height).fill(1),x=width-2,y=height-2;
   tiles[y*width+x+1]=0;tiles[(y+1)*width+x]=0;Object.freeze(tiles);
   const expected=[{x,y,dx:1,dy:1},{x:x+1,y:y+1,dx:-1,dy:-1}];
   assert.deepEqual(wallCorners(tiles,{width,height}),expected);
   assert.deepEqual(wallCorners(tiles,{width,height}),expected);
  }
  for(const [tiles,size] of [[null,layout],[Array(8).fill(1),layout],[Array(9),layout],[Array(9).fill(2),layout],[Array(9).fill(1),{width:1.5,height:6}],[[],{width:0,height:0}]])assert.deepEqual(wallCorners(tiles,size),[]);
 }finally{Math.random=random;}
});
test('Three motifs scale inside wall corners without entering lights or floors and balance Canvas state',()=>{
 const tiles=Object.freeze([0,0,0,0,1,0,0,0,0]);
 for(const size of [20,40,80]){
  const traces=[];
  for(const theme of ENVIRONMENTS){
   const r=recorder();drawWallCorners(r.ctx,tiles,theme,size,layout);traces.push(JSON.stringify(r.paths));
   assert.equal(r.calls.filter(v=>v==='save').length,r.calls.filter(v=>v==='restore').length);
   for(const {points} of r.paths){
    const p=points.map(([x,y])=>[(x-size)*40/size,(y-size)*40/size]);
    assert.ok(p.every(([x,y])=>x>=1&&x<=39&&y>=1&&y<=39));
    // Each filled polygon lies wholly in an edge strip OR its bounding box
    // misses the protected square (the L shape is checked by segment sampling).
    for(let i=0;i<p.length;i++)for(let t=0;t<=1;t+=.05){
     const a=p[i],b=p[(i+1)%p.length],x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;
     assert.ok(x<8||x>32||y<8||y>32);
    }
    assert.ok(p.every(([x,y])=>Math.min(x,40-x)<=5||Math.min(y,40-y)<=5));
   }
  }
  assert.equal(new Set(traces).size,3);
 }
 for(const size of [0,-1,NaN,Infinity]){const r=recorder();drawWallCorners(r.ctx,tiles,ENVIRONMENTS[0],size,layout);assert.equal(r.calls.length,0);}
});
test('Actual cached background draws corners once, reuses during frames, and rebuilds for geometry/theme',()=>{
 const r=recorder(),surface={getContext:()=>r.ctx};const bg=createDungeonBackground({createCanvas:()=>surface});
 const s={tiles:[0,0,0,0,1,0,0,0,0],dayId:'2026-11-22'};
 bg.prepare(s,layout);const first=r.paths.length;assert.ok(first>0);
 let blits=0;const target={drawImage(){blits++;}};
 for(let i=0;i<20;i++){bg.prepare({...s,turn:i},layout);bg.paint(target);}
 assert.equal(r.paths.length,first);assert.equal(blits,20);
 const layoutCalls=r.calls.length;bg.prepare(s,{width:1,height:9});assert.ok(r.calls.length>layoutCalls); // no false corners in a narrow map
 bg.prepare(s,layout);assert.ok(r.paths.length>first);
 const before=r.calls.length;s.tiles=[...s.tiles];s.tiles[4]=0;bg.prepare(s,layout);assert.ok(r.calls.length>before);
 const n=r.calls.length;s.dayId=Array.from({length:28},(_,i)=>`2026-11-${String(i+1).padStart(2,'0')}`).find(d=>environmentFor(d)!==environmentFor(s.dayId));bg.prepare(s,layout);
 assert.ok(r.calls.length>n);
});
