// Real main module with modeled DOM/canvas; not a native browser test.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,W,H} from '../src/game.js';
import {environmentFor} from '../src/environment.js';
import {exportSave} from '../src/transfer.js';
import {getDayId} from '../src/daily.js';
import {readFileSync} from 'node:fs';
import {restoreGame} from '../src/save.js';

test('Real main refreshes theme and cached map for all three imports, legacy and new run; animation frames only blit',async()=>{
 let builds=0,writes=0,id=0,now=0;const frames=new Map(),nodes={};
 class Node{
  constructor(){this.children=[];this.listeners={};this.dataset={};this.open=false;this.classList={toggle(){}};this.ownerDocument=doc;}
  append(...n){this.children.push(...n);}before(n){this.panel=n;}setAttribute(){}focus(){}
  addEventListener(n,f){this.listeners[n]=f;}showModal(){this.open=true;}close(){this.open=false;this.listeners.close?.();}
  getContext(){return new Proxy({},{get:(_,name)=>(...a)=>{if(name==='fillRect'&&a[2]===680&&a[3]===520)builds++;}});}
 }
 const doc={hidden:false,createElement:()=>new Node(),querySelector:s=>nodes[s],querySelectorAll:()=>touches,addEventListener(){}};doc.body=new Node();
 for(const n of ['game','wait','extract','paused','expedition','health','loot','bank','log','next','heal','pause','saveState','resume'])nodes['#'+n]=new Node();nodes.aside=new Node();
 const touches=['0,-1','1,0','0,1','-1,0'].map(dir=>{const n=new Node();n.dataset.dir=dir;return n;});
 const game=day=>{const s=createGame({dayId:day});s.enemies=[];s.chests=[];s.tiles=Array.from({length:W*H},(_,i)=>+(i%W===0||i%W===W-1||i<W||i>=W*(H-1)));return s;};
 const storage={value:JSON.stringify(game('2026-10-30')),getItem(){return this.value;},setItem(k,v){writes++;this.value=v;}};
 const values={document:doc,window:{addEventListener(){}},localStorage:storage,performance:{now:()=>now},requestAnimationFrame:f=>{frames.set(++id,f);return id;},cancelAnimationFrame:id=>frames.delete(id)};
 const old=Object.fromEntries(Object.keys(values).map(k=>[k,globalThis[k]]));Object.assign(globalThis,values);
 try{
  await import('../src/main.js?environment-contract');assert.equal(builds,1);
  const panel=nodes.aside.children[0],dialog=doc.body.children[0];
  async function load(s){panel.children[2].onclick();const text=exportSave(s).text,input=dialog.children[2].children[0];input.files=[{size:text.length,text:async()=>text}];await input.onchange();dialog.children[4].onclick();assert.equal(frames.size,0);assert.deepEqual(JSON.parse(storage.value),s);assert.ok(nodes['#expedition'].textContent.endsWith(environmentFor(s.dayId).name));}
  const days=new Map();for(let i=1;i<=28;i++){const d=`2026-11-${String(i).padStart(2,'0')}`;days.set(environmentFor(d).id,d);}assert.equal(days.size,3);
  for(const day of days.values()){
   const s=game(day);await load(s);assert.match(nodes['#expedition'].textContent,new RegExp(day));
   touches[1].onclick();const before=builds,saved=storage.value,writeCount=writes,label=nodes['#expedition'].textContent;assert.equal(frames.size,1);
   now+=90;let fs=[...frames.values()];frames.clear();fs.forEach(f=>f());assert.equal(builds,before);assert.equal(writes,writeCount);assert.equal(storage.value,saved);assert.equal(nodes['#expedition'].textContent,label);
   now+=90;fs=[...frames.values()];frames.clear();fs.forEach(f=>f());assert.equal(frames.size,0);assert.equal(builds,before);
   const changed=game(day);changed.tiles[18]=1;await load(changed);assert.equal(builds,before+1);
  }
  const legacy=restoreGame(readFileSync(new URL('./fixtures/legacy-save.json',import.meta.url),'utf8'));await load(legacy);assert.match(nodes['#expedition'].textContent,/Gyakorló · korábbi mentés · Ködkő-romok/);
  const completed=game('2026-11-01');completed.status='extracted';await load(completed);nodes['#next'].onclick();const fresh=JSON.parse(storage.value);assert.equal(fresh.dayId,getDayId());assert.ok(nodes['#expedition'].textContent.endsWith(environmentFor(fresh.dayId).name));assert.equal(frames.size,0);
 }finally{Object.assign(globalThis,old);}
});
