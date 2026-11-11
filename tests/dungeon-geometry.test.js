import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateDungeonGeometry } from '../src/dungeon-geometry.js';
import { restoreGame } from '../src/save.js';
import { createGame } from '../src/game.js';
import { exportSave, importSave, commitImport, FORMAT, FORMAT_VERSION } from '../src/transfer.js';
import { readStartup } from '../src/recovery.js';
const tilesFor = (w,h) => Array.from({length:w*h},(_,i)=>+(i%w===0||i%w===w-1||i<w||i>=w*(h-1)));
test('Geometry validates frozen rectangular layouts and bounded interior coordinates without mutation',()=>{
 for(const [width,height] of [[17,13],[21,15],[15,21]]){
  const tiles=tilesFor(width,height);tiles[width+3]=1;Object.freeze(tiles);const before=JSON.stringify(tiles);
  const g=validateDungeonGeometry(tiles,Object.freeze({width,height}));assert.ok(g);
  for(const [x,y] of [[1,1],[width-2,height-2],[2,6]])assert.equal(g.floor(x,y),true);
  for(const [x,y] of [[0,1],[width-1,1],[1,0],[1,height-1],[width,2],[-1,2],[3,1],[1.5,2],['2',6],[NaN,2]])assert.equal(g.floor(x,y),false);
  assert.equal(JSON.stringify(tiles),before);
 }
});
test('Bad dimensions, tile values, holes, every broken border and blocked gate are rejected',()=>{
 const tiles=tilesFor(17,13);
 for(const size of [undefined,null,{}, {width:17,height:12},{width:3,height:13},{width:17,height:7},{width:17.5,height:13},{width:Infinity,height:13},{width:Number.MAX_SAFE_INTEGER,height:13}])assert.equal(validateDungeonGeometry(tiles,size),null);
 for(const [w,h]of [[17,13],[21,15],[15,21]]){
  const size={width:w,height:h},base=tilesFor(w,h);
  for(let i=0;i<base.length;i++)if(base[i]===1){const t=[...base];t[i]=0;assert.equal(validateDungeonGeometry(t,size),null);}
  for(const bad of [null,2,-1,'0',false,NaN,undefined]){const t=[...base];t[w+1]=bad;assert.equal(validateDungeonGeometry(t,size),null);}
  const hole=[...base];delete hole[w+1];assert.equal(validateDungeonGeometry(hole,size),null);
  const gate=[...base];gate[6*w+2]=1;assert.equal(validateDungeonGeometry(gate,size),null);
  for(const t of [null,{},base.slice(1),[...base,1]])assert.equal(validateDungeonGeometry(t,size),null);
 }
});
test('Legacy and rules 1/2 saves retain exact maps and bank through export/import',()=>{
 const saves=['legacy-save.json','rules1-save.json'].map(f=>JSON.parse(readFileSync(new URL('./fixtures/'+f,import.meta.url),'utf8')));
 saves.push(createGame({dayId:'2026-11-11'}));
 for(const s of saves){s.bank=123;const restored=restoreGame(JSON.stringify(s));assert.ok(restored);assert.deepEqual(restored.tiles,s.tiles);assert.equal(restored.bank,123);assert.deepEqual(importSave(exportSave(restored).text),restored);}
});
test('Untrusted size cannot enable larger saves in restore, startup or atomic import',()=>{
 for(const [w,h]of [[21,15],[15,21]]){
  const s={...createGame({dayId:'2026-11-11'}),width:w,height:h,tiles:tilesFor(w,h),enemies:[],chests:[]};
  for(const rulesVersion of [0,1,2,3,'expanded-ring-v1']){
   s.rulesVersion=rulesVersion;const raw=JSON.stringify(s);assert.equal(restoreGame(raw),null);
   let writes=0;const storage={getItem:()=>raw,setItem:()=>writes++};assert.equal(readStartup(()=>storage).kind,'invalid');
   assert.throws(()=>commitImport(s,storage));assert.equal(writes,0);
   assert.throws(()=>importSave(JSON.stringify({format:FORMAT,formatVersion:FORMAT_VERSION,state:s})));
  }
 }
 const normal=createGame({dayId:'2026-11-11'});assert.ok(restoreGame(JSON.stringify({...normal,width:21,height:15}))); // extras never select geometry
 for(const mutate of [s=>s.x=0,s=>s.enemies=[{x:0,y:1,hp:8}],s=>s.chests=[{x:0,y:1}],s=>s.enemies=[s.enemies[0],s.enemies[0]],s=>s.chests=[s.chests[0],s.chests[0]],s=>s.hp=25,s=>s.status='defeated',s=>s.rulesVersion=3]){const s=structuredClone(normal);mutate(s);assert.equal(restoreGame(JSON.stringify(s)),null);}
});
