// Executes the real main module with a DOM/canvas model, not a browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,step,rest,heal,W,H} from '../src/game.js';
import {exportSave} from '../src/transfer.js';

test('Real main animates actual guard moves after direction, wait and heal with atomic saves and safe interruption',async()=>{
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
  const initial=world();initial.x=8;initial.y=6;initial.turn=1;initial.enemies=[{x:11,y:6,hp:8},{x:8,y:3,hp:6}];storage.value=JSON.stringify(initial);
  await import('../src/main.js?guardstep-contract');assert.equal(frames.size,0);
  const transfer=nodes.aside.children[0],dialog=doc.body.children[0];
  async function load(s){transfer.children[2].onclick();const text=exportSave(s).text,input=dialog.children[2].children[0];input.files=[{size:text.length,text:async()=>text}];await input.onchange();dialog.children[4].onclick();assert.equal(frames.size,0);}
  const guardOffsets=()=>drawing.filter(c=>c[0]==='translate'&&((c[1]===40&&c[2]===0)||(c[1]===0&&c[2]===-40)));
  // Wait changes the real state/save immediately, while guards start at old cells.
  nodes['#wait'].onclick();const expected=structuredClone(initial);rest(expected);assert.deepEqual(JSON.parse(storage.value),expected);
  assert.equal(frames.size,1);assert.equal(guardOffsets().length,2);
  const saved=storage.value,writes=storageWrites,hud=domWrites,start=time;
  tick(start+90);assert.ok(drawing.some(c=>c[0]==='translate'&&c[1]===20&&c[2]===0));assert.ok(drawing.some(c=>c[0]==='translate'&&c[1]===0&&c[2]===-20));
  assert.equal(storage.value,saved);assert.equal(storageWrites,writes);assert.equal(domWrites,hud);
  // Rest must keep the player still: its only translations are cell center and zero bob.
  assert.deepEqual(translations.at(-2),[340,260]);assert.ok(translations.at(-1).every(n=>n===0));
  tick(start+180);assert.equal(frames.size,0);assert.equal(guardOffsets().length,0);
  nodes['#wait'].onclick();assert.equal(frames.size,0); // odd turn, no guard motion
  const healthy=structuredClone(initial);healthy.hp=12;await load(healthy);nodes['#heal'].onclick();const healed=structuredClone(healthy);heal(healed);assert.deepEqual(JSON.parse(storage.value),healed);assert.equal(frames.size,1);tick(time+180);assert.equal(frames.size,0);
  for(const s of [initial,{...initial,hp:10,potions:0}]){await load(s);nodes['#heal'].onclick();assert.equal(frames.size,0);assert.deepEqual(JSON.parse(storage.value),s);}
  const blocked=structuredClone(initial);blocked.x=1;await load(blocked);touches[3].onclick();assert.equal(frames.size,0);assert.deepEqual(JSON.parse(storage.value),blocked);
  // Keyboard and touch both use the same real simulation once per action.
  await load(initial);events.keydown({key:'ArrowLeft',preventDefault(){}});const moved=structuredClone(initial);step(moved,-1,0);assert.deepEqual(JSON.parse(storage.value),moved);assert.equal(frames.size,1);
  const late=[...frames.values()][0];touches[1].onclick();const after=storage.value;const count=drawing.length;late();assert.equal(drawing.length,count);assert.equal(storage.value,after);
  // First enemy dies; the survivor enters its old cell but starts at its OWN cell.
  const killed=structuredClone(initial);killed.enemies=[{x:9,y:6,hp:4},{x:10,y:6,hp:8}];await load(killed);touches[1].onclick();assert.deepEqual(JSON.parse(storage.value).enemies,[{x:9,y:6,hp:8}]);assert.equal(guardOffsets().length,1);
  tick(time+180);assert.equal(frames.size,1);assert.ok(!drawing.some(c=>c[0]==='translate'&&c[1]>0&&c[1]<=40&&c[2]===0));tick(time+40);assert.equal(frames.size,0);
  async function startMotion(){await load(initial);nodes['#wait'].onclick();assert.equal(frames.size,1);}
  await startMotion();nodes['#pause'].onclick();assert.equal(frames.size,0);const paused=storage.value;touches[1].onclick();assert.equal(storage.value,paused);nodes['#resume'].onclick();
  await startMotion();transfer.children[2].onclick();assert.equal(frames.size,0);dialog.children[5].onclick();
  await startMotion();doc.hidden=true;events.visibilitychange();assert.equal(frames.size,0);assert.equal(nodes['#paused'].open,true);doc.hidden=false;nodes['#resume'].onclick();
  await startMotion();preference.matches=true;preferenceChanged();assert.equal(frames.size,0);nodes['#wait'].onclick();nodes['#wait'].onclick();assert.equal(frames.size,0);preference.matches=false;
  await startMotion();nodes['#next'].onclick();assert.equal(frames.size,0);
  const inactive={...initial,status:'defeated',hp:0};await load(inactive);nodes['#wait'].onclick();nodes['#heal'].onclick();touches[1].onclick();assert.equal(frames.size,0);assert.deepEqual(JSON.parse(storage.value),inactive);
 }finally{Object.assign(globalThis,old);}
});
