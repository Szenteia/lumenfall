import test from 'node:test';import assert from 'node:assert/strict';
import {axisScroll,mountMapView,ZOOM_LEVELS} from '../src/map-view.js';

function setup({observer=true,state={x:8,y:6}}={}){
 const canvas={style:{},getBoundingClientRect:()=>({width:viewport.clientWidth*parseFloat(canvas.style.width)/100})};
 const viewport={clientWidth:340,clientHeight:260,scrollLeft:0,scrollTop:0,contains:t=>t===child},child={};const controls={contains:t=>t===plus||t===minus||t===fit};
 const plus={},minus={},fit={},status={};let resize;const env={addEventListener(n,f){assert.equal(n,'resize');resize=f;}};
 class Observer{constructor(f){resize=f;}observe(node){assert.equal(node,viewport);}}
 let live=state;const api=mountMapView({canvas,viewport,controls,plus,minus,fit,status,getState:()=>live,columns:17,rows:13,window:env,ResizeObserver:observer?Observer:undefined});
 return {api,canvas,viewport,plus,minus,fit,status,child,resize:()=>resize(),state:s=>{live=s;api.update(live);}};
}
test('Axis geometry clamps centers and moves only enough to show the full cell',()=>{
 assert.equal(axisScroll(8,40,340,680,0),20);assert.equal(axisScroll(8,40,340,680,20),20);assert.equal(axisScroll(0,40,340,680,200),0);
 assert.equal(axisScroll(16,40,340,680,0),340);assert.equal(axisScroll(16,40,340,680,0,true),340);assert.equal(axisScroll(0,40,340,680,0,true),0);
 assert.equal(axisScroll(8,20,340,340,99),0);assert.equal(axisScroll(8,40,340,680,0,true),170);
});
test('Three zoom levels, boundary buttons and Fit are presentation only; bitmap resolution is untouched',()=>{
 const state=Object.freeze({x:8,y:6}),ui=setup({state});ui.api.update(state);assert.deepEqual(ZOOM_LEVELS,[1,1.5,2]);assert.equal(ui.minus.disabled,true);assert.equal(ui.status.textContent,'Térkép: 100%');
 ui.plus.onclick();assert.equal(ui.canvas.style.width,'150%');assert.equal(ui.viewport.scrollLeft,85);ui.plus.onclick();assert.equal(ui.canvas.style.width,'200%');assert.equal(ui.plus.disabled,true);ui.plus.onclick();assert.equal(ui.canvas.style.width,'200%');
 ui.fit.onclick();assert.equal(ui.canvas.style.width,'100%');assert.equal(ui.viewport.scrollLeft,0);assert.equal(ui.viewport.scrollTop,0);assert.equal(ui.canvas.width,undefined);assert.deepEqual(state,{x:8,y:6});
});
test('Manual panning survives unrelated refresh; movement follows minimally and import centers the new position',()=>{
 const state={x:8,y:6},ui=setup({state});ui.api.update(state);ui.plus.onclick();ui.plus.onclick();ui.viewport.scrollLeft=0;ui.viewport.scrollTop=0;
 ui.api.update(state);assert.equal(ui.viewport.scrollLeft,0);state.x=9;ui.api.update(state);assert.equal(ui.viewport.scrollLeft,60);
 ui.state({x:16,y:12});assert.equal(ui.viewport.scrollLeft,340);assert.equal(ui.viewport.scrollTop,260);
 ui.state({x:0,y:0});assert.equal(ui.viewport.scrollLeft,0);assert.equal(ui.viewport.scrollTop,0);
});
test('Resize observer and resize fallback keep edge positions reachable after orientation changes',()=>{
 for(const observer of [true,false]){const ui=setup({observer,state:{x:16,y:12}});ui.plus.onclick();ui.plus.onclick();ui.viewport.clientWidth=200;ui.viewport.clientHeight=130;ui.resize();assert.equal(ui.viewport.scrollLeft,200);assert.ok(ui.viewport.scrollTop<=400*13/17-130);assert.ok(ui.viewport.scrollTop>=0);}
});
test('Focus ownership separates native viewport/control keys; null/zero-size states remain safe',()=>{
 const ui=setup({state:null});assert.equal(ui.plus.disabled,true);ui.plus.onclick();assert.equal(ui.canvas.style.width,'100%');ui.api.update(null);
 assert.equal(ui.api.ownsTarget(ui.viewport),true);assert.equal(ui.api.ownsTarget(ui.child),true);assert.equal(ui.api.ownsTarget(ui.plus),true);assert.equal(ui.api.ownsTarget({}),false);assert.equal(ui.api.ownsTarget(null),false);
 ui.viewport.clientWidth=0;ui.state({x:2,y:6});ui.plus.onclick();assert.equal(ui.viewport.scrollLeft,0);assert.equal(ui.plus.disabled,false);
 const fallback=mountMapView({});assert.equal(fallback.ownsTarget({}),false);fallback.update(null);
});
