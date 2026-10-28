import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createGame } from '../src/game.js';
import { SAVE_KEY } from '../src/save.js';
import { readStartup, replaceWithNewGame, downloadOriginal } from '../src/recovery.js';
import { mountRecovery } from '../src/recovery-view.js';
const game = () => createGame({ dayId: '2026-10-28' });
function storage(raw) {
  return { raw, writes: [], failRead: false, failWrite: false,
    getItem(key) { assert.equal(key,SAVE_KEY);if(this.failRead)throw Error('read');return this.raw; },
    setItem(key,value) { assert.equal(key,SAVE_KEY);if(this.failWrite)throw Error('quota');this.writes.push(value);this.raw=value; },
    removeItem() { throw Error('must never remove'); } };
}
function dom() {
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
  const document={hidden:false,body:null,createElement(tag){return new Node(tag,this);},querySelector:s=>nodes[s],querySelectorAll:()=>touches,addEventListener(name,fn){events[name]=fn;}};
  document.body=new Node('body',document);
  for(const name of ['game','wait','extract','paused','expedition','health','loot','bank','log','next','heal','pause','saveState','resume'])nodes['#'+name]=new Node(name,document);
  nodes.aside=new Node('aside',document);
  touches=['0,-1','1,0','0,1','-1,0'].map(dir=>{const n=new Node('button',document);n.dataset.dir=dir;return n;});
  return {document,nodes,events,touches,window:{addEventListener(name,fn){events[name]=fn;}}};
}
function view(store, initial=readStartup(()=>store)) {
  const ui=dom();const applied=[];
  const api=mountRecovery({initial,getStorage:()=>store,applyState:s=>applied.push(s),document:ui.document});
  const dialog=ui.document.body.children[0];
  const [,message,,download,retry,choose,confirmation]=dialog.children;
  return {...ui,api,applied,dialog,message,download,retry,choose,confirmation,confirm:confirmation.children[1],cancel:confirmation.children[2]};
}
test('Missing key alone starts fresh; reads never write or delete', () => {
  const s=storage(null);assert.deepEqual(readStartup(()=>s),{kind:'missing',raw:null});assert.deepEqual(s.writes,[]);
});
test('Valid daily and legacy saves restore/migrate without changing stored raw text', () => {
  const legacy=readFileSync(new URL('./fixtures/legacy-save.json',import.meta.url),'utf8');
  for(const raw of [JSON.stringify(game()),legacy]) {
    const s=storage(raw),r=readStartup(()=>s);assert.equal(r.kind,'valid');assert.equal(r.state.version,2);assert.equal(s.raw,raw);assert.equal(s.writes.length,0);
  }
});
test('Empty, malformed, unsupported and incomplete saves retain exact original text', () => {
  for(const raw of ['', ' \r\n', '{bad ékezet\r\n', 'null', '{"version":99}', '{"version":2}', JSON.stringify({...game(),enemies:[{x:{toString:null},y:3,hp:6}]})]) {
    const s=storage(raw);assert.deepEqual(readStartup(()=>s),{kind:'invalid',raw});assert.equal(s.raw,raw);assert.equal(s.writes.length,0);
  }
});
test('Storage getter or read exception is unavailable rather than missing', () => {
  const s=storage('old');s.failRead=true;assert.deepEqual(readStartup(()=>s),{kind:'unavailable',raw:null});
  assert.equal(readStartup(()=>{throw Error('security');}).kind,'unavailable');assert.equal(s.raw,'old');assert.equal(s.writes.length,0);
});
test('Replacement writes first; quota failure preserves old data and cannot return a new state', () => {
  const s=storage('old');s.failWrite=true;let current=null;
  assert.throws(()=>{current=replaceWithNewGame(()=>s,game);});assert.equal(current,null);assert.equal(s.raw,'old');
  s.failWrite=false;current=replaceWithNewGame(()=>s,game);assert.deepEqual(current,game());assert.deepEqual(JSON.parse(s.raw),current);
});
test('Raw backup preserves invalid and empty text, dates filename and releases URL on success or click failure', async () => {
  for(const raw of ['', '{broken\r\nékezet']) for(const fail of [false,true]) {
    let blob,release;const calls=[];const link={download:'',click(){calls.push('click');if(fail)throw Error();},remove(){calls.push('remove');}};
    const env={document:{createElement:()=>link,body:{append(){}}},Blob,
      URL:{createObjectURL(b){blob=b;return 'blob:raw';},revokeObjectURL(url){assert.equal(url,'blob:raw');calls.push('revoke');}},later(fn){release=fn;}};
    if(fail)assert.throws(()=>downloadOriginal(raw,env));else downloadOriginal(raw,env,new Date('2026-10-28T12:00:00Z'));
    assert.equal(await blob.text(),raw);assert.match(link.download,/lumenfall-eredeti-mentes-.*\.txt$/);
    assert.deepEqual(calls,['click','remove']);release();assert.equal(calls.at(-1),'revoke');
  }
});
test('Recovery confirmation and Escape/Mégse never bypass protection; write error can be retried', () => {
  const s=storage('old'),ui=view(s);assert.equal(ui.dialog.open,true);assert.equal(ui.download.disabled,false);
  ui.confirm.onclick();assert.equal(s.writes.length,0);ui.choose.onclick();ui.cancel.onclick();ui.confirm.onclick();assert.equal(s.raw,'old');
  ui.choose.onclick();let prevented=false;ui.dialog.listeners.cancel({preventDefault(){prevented=true;}});assert.equal(prevented,true);assert.equal(ui.confirmation.hidden,true);
  ui.dialog.close();assert.equal(ui.dialog.open,true);assert.equal(ui.api.isLocked(),true);
  ui.choose.onclick();s.failWrite=true;ui.confirm.onclick();assert.equal(s.raw,'old');assert.equal(ui.applied.length,0);assert.match(ui.message.textContent,/nem írható/);
  s.failWrite=false;ui.confirm.onclick();assert.equal(ui.applied.length,1);assert.equal(ui.api.isLocked(),false);assert.equal(ui.dialog.open,false);assert.equal(ui.applied[0].bank,0);
});
test('Retry freshly reads: invalid/unavailable stay locked, valid/absent can resume', () => {
  const s=storage('bad'),ui=view(s);s.failRead=true;ui.retry.onclick();assert.equal(ui.api.isLocked(),true);assert.equal(ui.download.disabled,true);assert.equal(s.writes.length,0);
  s.failRead=false;s.raw=JSON.stringify({...game(),bank:75});ui.retry.onclick();assert.equal(ui.api.isLocked(),false);assert.equal(ui.applied[0].bank,75);assert.equal(s.writes.length,0);
  const missing=storage('bad'),ui2=view(missing);missing.raw=null;ui2.retry.onclick();assert.equal(ui2.api.isLocked(),false);assert.equal(missing.writes.length,1);
});
test('Actual main startup, actions and visibility events preserve invalid/unreadable saves until resolution', async () => {
  const old={document:globalThis.document,window:globalThis.window,localStorage:globalThis.localStorage};
  try {
    for(const mode of ['invalid','unavailable','empty']) {
      const ui=dom(),s=storage(mode==='empty'?'':'broken-original');s.failRead=mode==='unavailable';
      Object.assign(globalThis,{document:ui.document,window:ui.window,localStorage:s});
      await import(`../src/main.js?recovery=${mode}`);
      const dialog=ui.document.body.children[0];assert.equal(dialog.open,true);assert.equal(s.writes.length,0);
      ui.touches[1].onclick();ui.events.keydown({key:'ArrowRight',preventDefault(){}});
      ui.nodes['#wait'].onclick();ui.nodes['#pause'].onclick();ui.document.hidden=true;ui.events.visibilitychange();
      assert.equal(s.writes.length,0);assert.equal(s.raw,mode==='empty'?'':'broken-original');
      // Restoring a valid state externally is picked up by Retry without an overwrite.
      s.failRead=false;s.raw=JSON.stringify({...game(),bank:88});dialog.children[4].onclick();assert.equal(dialog.open,false);assert.equal(s.writes.length,0);
      assert.match(ui.nodes['#bank'].textContent,/88/);ui.document.hidden=false;
      ui.touches[1].onclick();assert.equal(s.writes.length,1);assert.equal(JSON.parse(s.raw).x,3);
      ui.nodes['#pause'].onclick();const writes=s.writes.length;ui.touches[1].onclick();assert.equal(s.writes.length,writes);ui.nodes['#resume'].onclick();
    }
  } finally {Object.assign(globalThis,old);}
});
