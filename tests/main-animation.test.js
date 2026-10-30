// Executes the real main module with a DOM/canvas model, not a browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,W,H} from '../src/game.js';
import {exportSave} from '../src/transfer.js';

test('Real main animates only successful direction actions; frames never write HUD/save or advance turns; modal and run changes cancel',async()=>{
 let domWrites=0,time=0,id=0,storageWrites=0;const frames=new Map(),events={},nodes={},translations=[];
 class Node{
  constructor(){this.children=[];this.listeners={};this.dataset={};this.open=false;this.classList={toggle(){}};this.ownerDocument=doc;}
  set textContent(v){this.text=v;domWrites++;} get textContent(){return this.text;}
  append(...c){this.children.push(...c);} before(p){this.panel=p;} setAttribute(){} focus(){}
  addEventListener(n,fn){this.listeners[n]=fn;} showModal(){this.open=true;} close(){this.open=false;this.listeners.close?.();}
  getContext(){return new Proxy({},{get:(_,n)=>(...args)=>{if(n==='translate')translations.push(args);}});}
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
  await import('../src/main.js?animation-contract');assert.equal(frames.size,0);
  events.keydown({key:'ArrowRight',preventDefault(){}});assert.equal(JSON.parse(storage.value).x,3);assert.equal(JSON.parse(storage.value).turn,1);assert.equal(frames.size,1);
  const saved=storage.value,writes=storageWrites,hud=domWrites;tick(90);
  assert.deepEqual(translations.at(-2),[120,260]); // interpolated x=2.5 cell center, then local bob
  assert.equal(storage.value,saved);assert.equal(storageWrites,writes);assert.equal(domWrites,hud);
  touches[3].onclick();assert.equal(JSON.parse(storage.value).x,2);assert.equal(JSON.parse(storage.value).turn,2);assert.equal(frames.size,1);
  nodes['#pause'].onclick();assert.equal(frames.size,0);const paused=storage.value;touches[1].onclick();assert.equal(storage.value,paused);nodes['#resume'].onclick();
  touches[1].onclick();const transfer=nodes.aside.children[0],dialog=doc.body.children[0];transfer.children[2].onclick();assert.equal(frames.size,0);
  async function load(s){const text=exportSave(s).text,input=dialog.children[2].children[0];input.files=[{size:text.length,text:async()=>text}];await input.onchange();dialog.children[4].onclick();assert.equal(frames.size,0);}
  const attack=world();attack.enemies=[{x:3,y:6,hp:4}];await load(attack);touches[1].onclick();assert.equal(frames.size,1);assert.equal(JSON.parse(storage.value).x,2);assert.equal(JSON.parse(storage.value).enemies.length,0);
  tick(time+110);assert.deepEqual(translations.at(-2),[100,260]);tick(time+110);assert.equal(frames.size,0);
  // Border block and completed run must never call animation.begin with a boolean result.
  const blocked=world();blocked.x=1;transfer.children[2].onclick();await load(blocked);const turn=JSON.parse(storage.value).turn;touches[3].onclick();assert.equal(frames.size,0);assert.equal(JSON.parse(storage.value).turn,turn);
  transfer.children[2].onclick();await load(world());nodes['#extract'].onclick();assert.equal(frames.size,0);touches[1].onclick();assert.equal(frames.size,0);nodes['#next'].onclick();assert.equal(frames.size,0);
  touches[1].onclick();assert.equal(frames.size,1);preference.matches=true;preferenceChanged();assert.equal(frames.size,0);touches[3].onclick();assert.equal(frames.size,0);
  preference.matches=false;touches[1].onclick();assert.equal(frames.size,1);doc.hidden=true;events.visibilitychange();assert.equal(frames.size,0);assert.equal(nodes['#paused'].open,true);
  doc.hidden=false;nodes['#resume'].onclick();touches[3].onclick();nodes['#next'].onclick();assert.equal(frames.size,0);
 }finally{Object.assign(globalThis,old);}
});
