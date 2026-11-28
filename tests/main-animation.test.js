// Executes the real main module with a DOM/canvas model, not a browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,W,H} from '../src/game.js';
import {exportSave} from '../src/transfer.js';

test('Real main animates only successful direction actions; frames never write HUD/save or advance turns; modal and run changes cancel',async()=>{
 let trails=0,domWrites=0,time=0,id=0,storageWrites=0;const frames=new Map(),events={},nodes={},translations=[],rectangles=[],eyes=[];
 class Node{
  constructor(){this.children=[];this.listeners={};this.dataset={};this.open=false;this.classList={toggle(){}};this.ownerDocument=doc;}
  set textContent(v){this.text=v;domWrites++;} get textContent(){return this.text;}
  append(...c){this.children.push(...c);} before(p){this.panel=p;} setAttribute(){} focus(){}
  addEventListener(n,fn){this.listeners[n]=fn;} showModal(){this.open=true;} close(){this.open=false;this.listeners.close?.();}
  getContext(){return new Proxy({},{get:(o,n)=>n in o?o[n]:(...args)=>{if(n==='clearRect')trails=0;if(n==='fill'&&o.fillStyle==='#7fe3cf')trails++;if(n==='clearRect')eyes.length=0;if(n==='fillRect'&&o.fillStyle==='#183347')eyes.push(args);if(n==='translate')translations.push(args);if(n==='fillRect')rectangles.push(args);}});}
 }
 const doc={hidden:false,createElement:()=>new Node(),querySelector:s=>nodes[s],querySelectorAll:()=>touches,addEventListener:(n,f)=>events[n]=f};doc.body=new Node();
 for(const n of ['game','wait','extract','paused','expedition','health','loot','bank','log','next','heal','pause','saveState','resume'])nodes['#'+n]=new Node();nodes.aside=new Node();
 const touches=['0,-1','1,0','0,1','-1,0'].map(dir=>{const n=new Node();n.dataset.dir=dir;return n;});
 const world=()=>{const s=createGame({rulesVersion:2,dayId:'2026-10-29'});s.tiles=Array.from({length:W*H},(_,i)=>+(i%W===0||i%W===W-1||i<W||i>=W*(H-1)));s.enemies=[];s.chests=[];return s;};
 const storage={value:JSON.stringify(world()),getItem(){return this.value;},setItem(k,v){storageWrites++;this.value=v;}};
 let preferenceChanged;const preference={matches:false,addEventListener(n,f){preferenceChanged=f;}};
 const values={document:doc,window:{addEventListener:(n,f)=>events[n]=f},localStorage:storage,
  performance:{now:()=>time},requestAnimationFrame:f=>{frames.set(++id,f);return id;},cancelAnimationFrame:id=>frames.delete(id),matchMedia:()=>preference};
 const old=Object.fromEntries(Object.keys(values).map(k=>[k,globalThis[k]]));Object.assign(globalThis,values);
 const tick=t=>{time=t;const fs=[...frames.values()];frames.clear();fs.forEach(f=>f());};
 try{
  await import('../src/main.js?animation-contract');assert.equal(frames.size,0);
  events.keydown({key:'ArrowRight',preventDefault(){}});assert.equal(JSON.parse(storage.value).x,3);assert.equal(JSON.parse(storage.value).turn,1);assert.equal(frames.size,1);
  const saved=storage.value,writes=storageWrites,hud=domWrites;rectangles.length=0;tick(45);
  assert.ok(rectangles.some(r=>r.join(',')==='-6,12,4,5'));assert.ok(rectangles.some(r=>r.join(',')==='3,8,4,5'));tick(90);
  assert.deepEqual(translations.at(-2),[120,260]); // interpolated x=2.5 cell center, then local bob
  assert.equal(storage.value,saved);assert.equal(storageWrites,writes);assert.equal(domWrites,hud);
  touches[3].onclick();assert.equal(JSON.parse(storage.value).x,2);assert.equal(JSON.parse(storage.value).turn,2);assert.equal(frames.size,1);
  nodes['#pause'].onclick();assert.equal(frames.size,0);const paused=storage.value;touches[1].onclick();assert.equal(storage.value,paused);nodes['#resume'].onclick();
  touches[1].onclick();const transfer=nodes.aside.children[0],dialog=doc.body.children[0];transfer.children[2].onclick();assert.equal(frames.size,0);
  async function load(s){const text=exportSave(s).text,input=dialog.children[2].children[0];input.files=[{size:text.length,text:async()=>text}];await input.onchange();dialog.children[4].onclick();assert.equal(frames.size,0);}
  const attack=world();attack.enemies=[{x:3,y:6,hp:4}];await load(attack);touches[1].onclick();assert.equal(frames.size,1);assert.equal(JSON.parse(storage.value).x,2);assert.equal(JSON.parse(storage.value).enemies.length,0);
  const attackSaved=storage.value,attackWrites=storageWrites,attackHud=domWrites;
  tick(time+121);assert.deepEqual(translations.at(-2),[100,260]);assert.deepEqual(translations.at(-1),[3,0]);assert.equal(storage.value,attackSaved);assert.equal(storageWrites,attackWrites);assert.equal(domWrites,attackHud);
  tick(time+99);assert.equal(frames.size,0);assert.deepEqual(translations.at(-1),[0,0]);
  // Direction stays visible throughout movement/attack and in the settled frame.
  for(const [index,dx,dy,count] of [[0,0,-1,0],[1,1,0,1],[2,0,1,2],[3,-1,0,1]]){
   for(const attacking of [false,true]){
    const s=world();s.x=8;s.y=6;if(attacking)s.enemies=[{x:8+dx,y:6+dy,hp:4}];
    transfer.children[2].onclick();await load(s);assert.equal(eyes.length,2); // import resets facing
    touches[index].onclick();const save=storage.value,sw=storageWrites,dw=domWrites;
    tick(time+60);assert.equal(eyes.length,count);if(dx)assert.equal(Math.sign(eyes[0][0]),dx);
    assert.equal(storage.value,save);assert.equal(storageWrites,sw);assert.equal(domWrites,dw);
    tick(time+220);assert.equal(frames.size,0);assert.equal(eyes.length,count);
   }
  }
  // Real rendering: hits, deaths and all interruption paths clear the transient trail.
  for(const hp of [4,8]){
   const s=world();s.enemies=[{x:3,y:6,hp}];transfer.children[2].onclick();await load(s);
   touches[1].onclick();assert.equal(trails,0);const saved=storage.value,sw=storageWrites,dw=domWrites;
   tick(time+110);assert.equal(trails,1);assert.equal(storage.value,saved);assert.equal(storageWrites,sw);assert.equal(domWrites,dw);
   tick(time+110);assert.equal(trails,0);assert.equal(frames.size,0);
  }
  for(const stop of ['pause','import','next','replace','reduce']){
   const s=world();s.enemies=[{x:3,y:6,hp:8}];transfer.children[2].onclick();await load(s);
   touches[1].onclick();tick(time+80);assert.equal(trails,1);
   if(stop==='pause'){nodes['#pause'].onclick();nodes['#resume'].onclick();}
   if(stop==='import'){transfer.children[2].onclick();await load(world());}
   if(stop==='next')nodes['#next'].onclick();
   if(stop==='replace'){touches[2].onclick();assert.equal(trails,0);tick(time+180);}
   if(stop==='reduce'){preference.matches=true;preferenceChanged();touches[1].onclick();preference.matches=false;}
   assert.equal(trails,0);assert.equal(frames.size,0);
  }
  // Border block and completed run must never call animation.begin with a boolean result.
  const blocked=world();blocked.x=1;transfer.children[2].onclick();await load(blocked);const turn=JSON.parse(storage.value).turn;touches[3].onclick();assert.equal(frames.size,0);assert.equal(JSON.parse(storage.value).turn,turn);
  transfer.children[2].onclick();await load(world());nodes['#extract'].onclick();assert.equal(frames.size,0);touches[1].onclick();assert.equal(frames.size,0);nodes['#next'].onclick();assert.equal(frames.size,0);
  touches[1].onclick();assert.equal(frames.size,1);preference.matches=true;preferenceChanged();assert.equal(frames.size,0);touches[3].onclick();assert.equal(frames.size,0);
  preference.matches=false;touches[1].onclick();assert.equal(frames.size,1);doc.hidden=true;events.visibilitychange();assert.equal(frames.size,0);assert.equal(nodes['#paused'].open,true);
  doc.hidden=false;nodes['#resume'].onclick();touches[3].onclick();nodes['#next'].onclick();assert.equal(frames.size,0);
 }finally{Object.assign(globalThis,old);}
});
