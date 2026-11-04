// Integration contract with the actual main.js; deliberately not a browser test.
import test from 'node:test';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import { createGame } from '../src/game.js';
import { exportSave } from '../src/transfer.js';
import { SAVE_KEY } from '../src/save.js';

test('Actual main wiring refreshes previews after keyboard, touch, healing, import and new run; dialogs block actions', async () => {
  class Node {
    constructor(tag, document) { this.tag=tag;this.ownerDocument=document;this.children=[];this.listeners={};this.dataset={};this.open=false;this.textContent='';this.classList={toggle(){}}; }
    append(...children){this.children.push(...children);}
    before(panel){this.panel=panel;}
    setAttribute(){}
    addEventListener(name,fn){this.listeners[name]=fn;}
    focus(){}
    showModal(){this.open=true;}
    close(){this.open=false;this.listeners.close?.();}
    getContext(){return new Proxy({},{get:()=>()=>{}});}
  }
  const nodes={},events={};let touches=[];
  const document={hidden:false,body:null,createElement(tag){return new Node(tag,this);},querySelector:s=>nodes[s],querySelectorAll:()=>touches,addEventListener(){}};
  document.body=new Node('body',document);
  for(const name of ['game','wait','extract','paused','expedition','health','loot','bank','log','next','heal','pause','saveState','resume'])nodes['#'+name]=new Node(name,document);
  nodes.aside=new Node('aside',document);
  touches=['0,-1','1,0','0,1','-1,0'].map(dir=>{const n=new Node('button',document);n.dataset.dir=dir;return n;});
  const initial=createGame({dayId:'2026-10-26'}),storage={value:JSON.stringify(initial),getItem(){return this.value;},setItem(key,value){assert.equal(key,SAVE_KEY);this.value=value;}};
  const old={document:globalThis.document,window:globalThis.window,localStorage:globalThis.localStorage};
  globalThis.document=document;globalThis.window={addEventListener(name,fn){events[name]=fn;}};globalThis.localStorage=storage;
  try {
    await import('../src/main.js');
    const panel=nodes['#heal'].panel,rows=panel.children.slice(1,5);
    assert.equal(rows.length,4);assert.match(rows[1].textContent,/Jobbra/);
    events.keydown({key:'ArrowRight',preventDefault(){}});assert.equal(JSON.parse(storage.value).x,3);
    touches[3].onclick();assert.equal(JSON.parse(storage.value).x,2);
    nodes['#pause'].onclick();const before=storage.value;touches[1].onclick();assert.equal(storage.value,before);nodes['#resume'].onclick();
    const transfer=nodes.aside.children[0],dialog=document.body.children[0];
    transfer.children[2].onclick();touches[1].onclick();assert.equal(storage.value,before);
    const oldRules=JSON.parse(readFileSync(new URL('./fixtures/rules1-save.json',import.meta.url),'utf8'));
    const oldFile=exportSave(oldRules).text,oldInput=dialog.children[2].children[0];
    oldInput.files=[{size:oldFile.length,text:async()=>oldFile}];await oldInput.onchange();dialog.children[4].onclick();
    assert.deepEqual(JSON.parse(storage.value),oldRules);assert.match(nodes['#expedition'].textContent,/korábbi pályaszabály/);
    transfer.children[2].onclick();
    const imported=createGame({dayId:'2026-10-25'});imported.x=3;imported.hp=10;imported.bank=85;imported.enemies=[];
    const file=exportSave(imported).text,input=dialog.children[2].children[0];input.files=[{size:file.length,text:async()=>file}];await input.onchange();
    assert.deepEqual(JSON.parse(storage.value),oldRules);dialog.children[4].onclick();
    assert.match(rows[1].textContent,/10 HP/);assert.match(nodes['#bank'].textContent,/85/);assert.match(nodes['#expedition'].textContent,/Gyakorló/);
    assert.deepEqual(JSON.parse(storage.value),imported);
    nodes['#heal'].onclick();assert.match(rows[1].textContent,/20 HP/);assert.equal(JSON.parse(storage.value).potions,1);
    nodes['#wait'].onclick();assert.equal(JSON.parse(storage.value).turn,2);
    touches[3].onclick();nodes['#extract'].onclick();assert.equal(panel.hidden,true);
    nodes['#next'].onclick();assert.equal(panel.hidden,false);assert.match(rows[1].textContent,/24 HP/);
    assert.equal(JSON.parse(storage.value).bank,85);
  } finally {Object.assign(globalThis,old);}
});
