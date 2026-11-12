import test from 'node:test';
import assert from 'node:assert/strict';
import {mountMapView} from '../src/map-view.js';

// Geometry model, not a browser: CSS aspectRatio supplies the viewport height;
// the caller's bitmap aspect supplies the Canvas height independently.
function setup({state={x:8,y:6},observer=true,columns=17,rows=13}={}){
 let live=state,resize,writes=0,observers=0;
 const viewport={clientWidth:360,scrollLeft:0,scrollTop:0,contains:()=>false,
   style:new Proxy({}, {set(o,k,v){writes++;o[k]=v;return true;}}),
   get clientHeight(){const [w,h]=this.style.aspectRatio.split(' / ').map(Number);return this.clientWidth*h/w;}};
 const canvas={width:680,height:520,style:{},getBoundingClientRect(){const width=viewport.clientWidth*parseFloat(this.style.width)/100;return {width,height:width*this.height/this.width};}};
 const controls={contains:()=>false},minus={},plus={},fit={},status={};
 class Observer{constructor(fn){observers++;resize=fn;}observe(node){assert.equal(node,viewport);}}
 const window={addEventListener(event,fn){assert.equal(event,'resize');resize=fn;}};
 const api=mountMapView({canvas,viewport,controls,minus,plus,fit,status,getState:()=>live,columns,rows,window,ResizeObserver:observer?Observer:null});
 api.update(live);
 return {api,canvas,viewport,plus,fit,status,resize:()=>resize(),writes:()=>writes,observers:()=>observers,
   state(s){live=s;api.update(s);},layout(w,h){canvas.width=w*40;canvas.height=h*40;return api.setLayout({width:w,height:h});}};
}
function visible(ui,state,w,h){
 const rect=ui.canvas.getBoundingClientRect(),vp=ui.viewport,cell=rect.width/w,eps=1e-8;
 assert.ok(vp.scrollLeft>=0&&vp.scrollLeft<=Math.max(0,rect.width-vp.clientWidth)+eps);
 assert.ok(vp.scrollTop>=0&&vp.scrollTop<=Math.max(0,rect.height-vp.clientHeight)+eps);
 assert.ok(state.x*cell>=vp.scrollLeft-eps);assert.ok((state.x+1)*cell<=vp.scrollLeft+vp.clientWidth+eps);
 assert.ok(state.y*cell>=vp.scrollTop-eps);assert.ok((state.y+1)*cell<=vp.scrollTop+vp.clientHeight+eps);
 assert.ok(Math.abs(rect.height/h-cell)<eps,'square rendered cells');
}
test('Changing layout supports all corners at every zoom, with matching bitmap and viewport ratios',()=>{
 const ui=setup();
 for(const [w,h] of [[17,13],[21,15],[15,21],[17,13]]){
  ui.layout(w,h);assert.equal(ui.viewport.style.aspectRatio,`${w} / ${h}`);
  ui.fit.onclick();
  for(let zoom=0;zoom<3;zoom++){
   if(zoom)ui.plus.onclick();
   for(const [x,y] of [[0,0],[w-1,0],[0,h-1],[w-1,h-1]]){
    const state=Object.freeze({x,y,width:999,height:999});ui.state(state);visible(ui,state,w,h);
   }
   if(!zoom){assert.equal(ui.viewport.scrollLeft,0);assert.ok(Math.abs(ui.viewport.scrollTop)<1e-8);}
  }
  assert.equal(ui.canvas.width,w*40);assert.equal(ui.canvas.height,h*40);
 }
});
test('Layout changes keep zoom and recenter, repeated layout preserves panning without style writes',()=>{
 const state={x:14,y:12},ui=setup({state});ui.plus.onclick();ui.plus.onclick();
 ui.layout(21,15);visible(ui,state,21,15);assert.equal(ui.canvas.style.width,'200%');
 ui.viewport.scrollLeft=0;ui.viewport.scrollTop=0;const writes=ui.writes();
 for(let i=0;i<10;i++){assert.equal(ui.api.setLayout({width:21,height:15}),true);ui.api.update(state);}
 assert.equal(ui.writes(),writes);assert.equal(ui.viewport.scrollLeft,0);assert.equal(ui.viewport.scrollTop,0);assert.equal(ui.observers(),1);
 ui.layout(15,21);visible(ui,state,15,21);assert.equal(ui.status.textContent,'Térkép: 200%');
 ui.fit.onclick();assert.equal(ui.canvas.style.width,'100%');assert.equal(ui.viewport.scrollLeft,0);assert.equal(ui.viewport.scrollTop,0);
});
test('Resize observer and fallback keep larger-map edge cells visible at mobile and desktop widths',()=>{
 for(const observer of [true,false]){
  const ui=setup({observer});ui.layout(21,15);ui.plus.onclick();ui.plus.onclick();
  const state=Object.freeze({x:20,y:14});ui.state(state);
  for(const width of [360,1024,240,800]){ui.viewport.clientWidth=width;ui.resize();visible(ui,state,21,15);}
 }
});
test('Invalid dimensions leave layout, bitmap, zoom and scroll unchanged',()=>{
 const ui=setup();ui.plus.onclick();ui.layout(21,15);
 const before=JSON.stringify([ui.viewport.style,ui.canvas,ui.viewport.scrollLeft,ui.viewport.scrollTop]),writes=ui.writes();
 for(const layout of [undefined,null,{}, {width:21}, ...[0,-1,1.5,NaN,Infinity,'21',Number.MAX_SAFE_INTEGER+1].flatMap(n=>[{width:n,height:15},{width:21,height:n}])]){
  assert.equal(ui.api.setLayout(layout),false);
  assert.equal(JSON.stringify([ui.viewport.style,ui.canvas,ui.viewport.scrollLeft,ui.viewport.scrollTop]),before);
 }
 assert.equal(ui.writes(),writes);
 assert.equal(setup({columns:NaN,rows:13}).viewport.style.aspectRatio,'17 / 13');
 const fallback=mountMapView({});assert.equal(fallback.setLayout({width:21,height:15}),false);fallback.update(null);
});
test('Null state and hidden viewport can change layout and recover without changing game data',()=>{
 const ui=setup({state:null});ui.layout(15,21);assert.equal(ui.plus.disabled,true);assert.equal(ui.viewport.scrollTop,0);
 ui.viewport.clientWidth=0;const state=Object.freeze({x:14,y:20});ui.state(state);ui.plus.onclick();
 assert.equal(ui.viewport.scrollLeft,0);assert.equal(ui.viewport.scrollTop,0);
 ui.viewport.clientWidth=360;ui.resize();visible(ui,state,15,21);
 assert.deepEqual(state,{x:14,y:20});assert.equal(ui.canvas.width,600);assert.equal(ui.canvas.height,840);
});
