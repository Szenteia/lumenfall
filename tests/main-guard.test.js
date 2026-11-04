// Executes the real main module with a DOM/canvas model, not a browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,W,H} from '../src/game.js';
import {exportSave} from '../src/transfer.js';

test('Real main draws original guards and scopes hit feedback across actions, deaths and all interruption paths',async()=>{
 let domWrites=0,time=0,id=0,storageWrites=0;const frames=new Map(),events={},nodes={},translations=[],drawing=[];
 class Node{
  constructor(){this.children=[];this.listeners={};this.dataset={};this.open=false;this.classList={toggle(){}};this.ownerDocument=doc;}
  set textContent(v){this.text=v;domWrites++;} get textContent(){return this.text;}
  append(...c){this.children.push(...c);} before(p){this.panel=p;} setAttribute(){} focus(){}
  addEventListener(n,fn){this.listeners[n]=fn;} showModal(){this.open=true;} close(){this.open=false;this.listeners.close?.();}
  getContext(){return new Proxy({},{get:(_,n)=>(...args)=>{if(n==='clearRect')drawing.length=0;if(n==='translate')translations.push(args);drawing.push([n,...args]);}});}
 }
 const doc={hidden:false,createElement:()=>new Node(),querySelector:s=>nodes[s],querySelectorAll:()=>touches,addEventListener:(n,f)=>events[n]=f};doc.body=new Node();
 for(const n of ['game','wait','extract','paused','expedition','health','loot','bank','log','next','heal','pause','saveState','resume'])nodes['#'+n]=new Node();nodes.aside=new Node();
 const touches=['0,-1','1,0','0,1','-1,0'].map(dir=>{const n=new Node();n.dataset.dir=dir;return n;});
 const world=()=>{const s=createGame({dayId:'2026-10-29'});s.tiles=Array.from({length:W*H},(_,i)=>+(i%W===0||i%W===W-1||i<W||i>=W*(H-1)));s.enemies=[];s.chests=[];return s;};
 const storage={value:JSON.stringify(world()),getItem(){return this.value;},setItem(k,v){storageWrites++;this.value=v;}};
 let preferenceChanged;const preference={matches:false,addEventListener(n,f){preferenceChanged=f;}};
 const values={document:doc,window:{addEventListener:(n,f)=>events[n]=f},localStorage:storage,
  performance:{now:()=>time},requestAnimationFrame:f=>{frames.set(++id,f);return id;},cancelAnimationFrame:id=>frames.delete(id),matchMedia:()=>preference};
 const old=Object.fromEntries(Object.keys(values).map(k=>[k,globalThis[k]]));Object.assign(globalThis,values);
 const tick=t=>{time=t;const fs=[...frames.values()];frames.clear();fs.forEach(f=>f());};
 try{
  await import('../src/main.js?guard-contract');
  const transfer=nodes.aside.children[0],dialog=doc.body.children[0];
  async function load(s){transfer.children[2].onclick();const text=exportSave(s).text,input=dialog.children[2].children[0];input.files=[{size:text.length,text:async()=>text}];await input.onchange();dialog.children[4].onclick();assert.equal(frames.size,0);}
  const recoil=()=>drawing.some(c=>c[0]==='translate'&&Math.abs(c[1])+Math.abs(c[2])===2);
  const impact=()=>drawing.filter(c=>c[0]==='lineTo'&&((Math.abs(c[1])===15&&c[2]===0)||(Math.abs(c[2])===15&&c[1]===0))).length;
  for(const [index,[dx,dy]]of [[0,-1],[1,0],[0,1],[-1,0]].entries())for(const hp of [4,8]){
   const s=world();s.x=8;s.y=6;s.enemies=[{x:8+dx,y:6+dy,hp}];await load(s);assert.equal(impact(),0);
   touches[index].onclick();const final=JSON.parse(storage.value),saved=storage.value,writeCount=storageWrites,hud=domWrites;
   assert.equal(final.enemies.length,hp===4?0:1);assert.equal(final.turn,1);assert.equal(final.x,8);assert.equal(final.y,6);assert.equal(frames.size,1);
   tick(time+110);assert.equal(impact(),4);assert.equal(recoil(),hp===8);assert.equal(drawing.filter(c=>c[0]==='ellipse'&&c[2]===12).length,final.enemies.length);assert.ok(!drawing.some(c=>c[0]==='fillText'&&c[1]==='♟'));
   assert.equal(storage.value,saved);assert.equal(storageWrites,writeCount);assert.equal(domWrites,hud);tick(time+110);assert.equal(frames.size,0);assert.equal(impact(),0);
  }
  // The second guard may enter the killed target's square on an even turn.
  const occupied=world();occupied.turn=1;occupied.enemies=[{x:3,y:6,hp:4},{x:4,y:6,hp:8}];await load(occupied);touches[1].onclick();tick(time+110);assert.equal(JSON.parse(storage.value).enemies[0].x,3);assert.equal(impact(),4);assert.equal(recoil(),false);
  async function start(){const s=world();s.enemies=[{x:3,y:6,hp:8}];await load(s);touches[1].onclick();tick(time+110);assert.equal(impact(),4);}
  await start();touches[3].onclick();assert.equal(impact(),0); // fast replacement by movement
  await start();nodes['#pause'].onclick();assert.equal(frames.size,0);assert.equal(impact(),0);nodes['#resume'].onclick();
  await start();transfer.children[2].onclick();assert.equal(frames.size,0);assert.equal(impact(),0);dialog.children[5].onclick();
  await start();doc.hidden=true;events.visibilitychange();assert.equal(frames.size,0);assert.equal(impact(),0);doc.hidden=false;nodes['#resume'].onclick();
  await start();preference.matches=true;preferenceChanged();assert.equal(frames.size,0);assert.equal(impact(),0);touches[1].onclick();assert.equal(frames.size,0);preference.matches=false;
  await start();nodes['#next'].onclick();assert.equal(frames.size,0);assert.equal(impact(),0);
  await load(world());touches[1].onclick();nodes['#wait'].onclick();assert.equal(frames.size,0);assert.equal(impact(),0);nodes['#heal'].onclick();assert.equal(impact(),0);
  const blocked=world();blocked.x=1;await load(blocked);touches[3].onclick();assert.equal(frames.size,0);assert.equal(impact(),0);
  const inactive=world();inactive.status='defeated';inactive.hp=0;inactive.enemies=[{x:3,y:6,hp:8}];await load(inactive);touches[1].onclick();assert.equal(frames.size,0);assert.equal(impact(),0);
 }finally{Object.assign(globalThis,old);}
});
