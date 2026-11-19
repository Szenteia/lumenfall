// Integration contract with the actual main.js; deliberately not a browser test.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/game.js';
import { exportSave } from '../src/transfer.js';
import { SAVE_KEY } from '../src/save.js';

test('Real main zoom/scroll never write saves; viewport keys do not move player, normal controls and imports still work', async () => {
  class Node {
    constructor(tag, document) { this.style={};this.clientWidth=340;this.clientHeight=260;this.scrollLeft=0;this.scrollTop=0;this.tag=tag;this.ownerDocument=document;this.children=[];this.listeners={};this.dataset={};this.open=false;this.textContent='';this.classList={toggle(){}}; }
    append(...children){this.children.push(...children);}
    before(panel){this.panel=panel;}
    setAttribute(){}
    addEventListener(name,fn){this.listeners[name]=fn;}
    focus(){}
    showModal(){this.open=true;}
    close(){this.open=false;this.listeners.close?.();}
    contains(t){return this.children.includes(t)||this.children.some(c=>c.contains?.(t));}
    getBoundingClientRect(){return {width:340*parseFloat(this.style.width||'100%')/100};}
    getContext(){return new Proxy({},{get:()=>()=>{}});}
  }
  const nodes={},events={};let touches=[];
  const document={hidden:false,body:null,createElement(tag){return new Node(tag,this);},querySelector:s=>nodes[s],querySelectorAll:()=>touches,addEventListener(){}};
  document.body=new Node('body',document);
  for(const name of ['game','wait','extract','paused','expedition','health','loot','bank','log','next','heal','pause','saveState','resume','mapViewport','mapControls','mapMinus','mapPlus','mapFit','mapZoom'])nodes['#'+name]=new Node(name,document);
  nodes['#mapViewport'].append(nodes['#game']);nodes['#mapControls'].append(nodes['#mapMinus'],nodes['#mapPlus'],nodes['#mapFit']);
  nodes.aside=new Node('aside',document);
  touches=['0,-1','1,0','0,1','-1,0'].map(dir=>{const n=new Node('button',document);n.dataset.dir=dir;return n;});
  const initial=createGame({rulesVersion:2,dayId:'2026-10-26'});initial.enemies=[];initial.chests=[];initial.tiles=initial.tiles.map((v,i)=>+(i%17===0||i%17===16||i<17||i>=204));let writes=0;const storage={value:JSON.stringify(initial),getItem(){return this.value;},setItem(key,value){assert.equal(key,SAVE_KEY);writes++;this.value=value;}};
  const old={document:globalThis.document,window:globalThis.window,localStorage:globalThis.localStorage};
  globalThis.document=document;globalThis.window={addEventListener(name,fn){events[name]=fn;}};globalThis.localStorage=storage;
  try {
    await import('../src/main.js?map-contract');
    const viewport=nodes['#mapViewport'],plus=nodes['#mapPlus'],fit=nodes['#mapFit'];
    const original=storage.value,startWrites=writes;plus.onclick();plus.onclick();assert.equal(nodes['#game'].style.width,'200%');assert.equal(nodes['#mapZoom'].textContent,'Térkép: 200%');
    viewport.scrollLeft=300;viewport.scrollTop=200;assert.equal(storage.value,original);assert.equal(writes,startWrites);
    let prevented=false;events.keydown({key:'ArrowRight',target:viewport,preventDefault(){prevented=true;}});events.keydown({key:'w',target:plus,preventDefault(){prevented=true;}});assert.equal(storage.value,original);assert.equal(prevented,false);
    events.keydown({key:'ArrowRight',target:{},preventDefault(){prevented=true;}});assert.equal(JSON.parse(storage.value).x,3);assert.equal(writes,startWrites+1);assert.equal(prevented,true);
    const afterMove=storage.value,afterWrites=writes;viewport.scrollLeft=300;nodes['#resume'].onclick();assert.equal(viewport.scrollLeft,300);assert.equal(writes,afterWrites);
    fit.onclick();assert.equal(viewport.scrollLeft,0);assert.equal(viewport.scrollTop,0);assert.equal(storage.value,afterMove);
    plus.onclick();plus.onclick();const transfer=nodes.aside.children[0],dialog=document.body.children[0];
    transfer.children[2].onclick();const beforeImport=storage.value;touches[1].onclick();assert.equal(storage.value,beforeImport);
    const imported=structuredClone(initial);imported.x=15;imported.y=11;imported.bank=99;const text=exportSave(imported).text,input=dialog.children[2].children[0];input.files=[{size:text.length,text:async()=>text}];await input.onchange();dialog.children[4].onclick();assert.deepEqual(JSON.parse(storage.value),imported);assert.ok(viewport.scrollLeft>0);assert.ok(viewport.scrollTop>0);
    nodes['#pause'].onclick();const paused=storage.value;touches[1].onclick();assert.equal(storage.value,paused);nodes['#resume'].onclick();touches[3].onclick();assert.equal(JSON.parse(storage.value).x,14);
    nodes['#next'].onclick();assert.equal(JSON.parse(storage.value).bank,99);assert.equal(JSON.parse(storage.value).x,2);assert.equal(viewport.scrollLeft,0);
    assert.equal(JSON.parse(storage.value).rulesVersion,3);assert.equal(nodes['#game'].width,840);assert.equal(nodes['#game'].height,600);
    // Import an expanded run at the far corner, then the exact old map again.
    async function load(state){transfer.children[2].onclick();const text=exportSave(state).text;input.files=[{size:text.length,text:async()=>text}];await input.onchange();dialog.children[4].onclick();assert.deepEqual(JSON.parse(storage.value),state);}
    const large=createGame({dayId:'2026-11-12'});large.tiles=Array.from({length:315},(_,i)=>+(i%21===0||i%21===20||i<21||i>=294));large.enemies=[];large.chests=[];large.x=19;large.y=13;large.bank=99;
    await load(large);assert.equal(nodes['#game'].width,840);assert.ok(viewport.scrollLeft>0);assert.ok(viewport.scrollTop>0);
    nodes['#pause'].onclick();nodes['#resume'].onclick();assert.deepEqual(JSON.parse(storage.value),large);
    touches[3].onclick();assert.equal(JSON.parse(storage.value).x,18);
    await load(imported);assert.equal(nodes['#game'].width,680);assert.equal(nodes['#game'].height,520);
    const saved=storage.value,writeCount=writes;events.resize();assert.equal(storage.value,saved);assert.equal(writes,writeCount);
    // Real new markup plus a protected invalid startup, not just a missing-markup fallback.
    storage.value='broken-save';await import('../src/main.js?map-protected-contract');const protectedWrites=writes;
    assert.equal(plus.disabled,true);plus.onclick();events.keydown({key:'ArrowRight',target:{},preventDefault(){}});assert.equal(writes,protectedWrites);assert.equal(storage.value,'broken-save');
  } finally {Object.assign(globalThis,old);}
});
