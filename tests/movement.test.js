import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { W, H, createGame, step } from '../src/game.js';
import { restoreGame } from '../src/save.js';
import { DIRECTIONS, previewDirections, directionSummary } from '../src/movement.js';
import { mountMovementPreview } from '../src/movement-view.js';
const game = () => ({ ...createGame({ dayId: '2026-10-26' }), x: 5, y: 5, enemies: [], chests: [],
  tiles: Array.from({ length: W * H }, (_, i) => i % W === 0 || i % W === W - 1 || i < W || i >= W * (H - 1) ? 1 : 0) });
const right = s => previewDirections(s).find(p => p.id === 'right');
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };

test('Four independent empty-square moves consume one turn, not a sequence', () => {
  const s = game(), previews = previewDirections(s);
  assert.deepEqual(previews.map(p => [p.xAfter, p.yAfter]), [[5,4],[6,5],[5,6],[4,5]]);
  for(const p of previews) assert.deepEqual([p.kind,p.turns,p.hpAfter,p.damage,p.fatal],['move',1,24,0,false]);
  assert.equal(s.turn,0); assert.equal(s.x,5); assert.equal(s.y,5);
});
test('Wall and map boundary consume no turn and trigger no adjacent enemy attack', () => {
  const s=game(); s.tiles[5*W+6]=1; s.enemies=[{x:5,y:4,hp:6}];
  assert.deepEqual([right(s).kind,right(s).turns,right(s).hpAfter],['blocked',0,24]);
  s.x=0; s.tiles[5*W]=0;
  const left=previewDirections(s).find(p=>p.id==='left');
  assert.deepEqual([left.kind,left.turns,left.hpAfter],['blocked',0,24]);
});
test('Attack damages surviving enemy, leaves player in place and includes retaliation', () => {
  const s=game(); s.enemies=[{x:6,y:5,hp:8}]; const p=right(s);
  assert.deepEqual([p.kind,p.turns,p.hpAfter,p.damage,p.xAfter,p.yAfter],['attack',1,21,3,5,5]);
  assert.deepEqual(p.enemiesAfter,[{x:6,y:5,hp:4}]);
});
test('Killing target prevents its retaliation and does not move onto its square', () => {
  const s=game(); s.enemies=[{x:6,y:5,hp:4}]; const p=right(s);
  assert.deepEqual([p.kind,p.hpAfter,p.damage,p.xAfter,p.yAfter,p.lootAfter],['attack',24,0,5,5,15]);
  assert.deepEqual(p.enemiesAfter,[]);
});
test('Killing one target still permits another adjacent guard to retaliate', () => {
  const s=game(); s.enemies=[{x:6,y:5,hp:4},{x:5,y:4,hp:10}];
  const p=right(s); assert.equal(p.hpAfter,21); assert.equal(p.damage,3); assert.equal(p.enemiesAfter.length,1);
});
test('Moving into danger counts multiple guard attacks and collectible loot', () => {
  const s=game(); s.chests=[{x:6,y:5}]; s.enemies=[{x:6,y:4,hp:6},{x:7,y:5,hp:8}];
  const p=right(s); assert.deepEqual([p.hpAfter,p.damage,p.lootAfter,p.xAfter],[18,6,30,6]);
  assert.match(directionSummary(p),/Jobbra · Lépés · marad 18 HP \(−6\)/);
});
test('Enemy movement follows real odd/even turns without changing initial state', () => {
  const s=game(); s.enemies=[{x:9,y:5,hp:6}];
  assert.equal(right(s).enemiesAfter[0].x,9);
  s.turn=1; assert.equal(right(s).enemiesAfter[0].x,8); assert.equal(s.enemies[0].x,9);
});
test('Fatal action caps actual loss at remaining HP and drops carried loot', () => {
  const s=game(); s.hp=2; s.loot=45; s.enemies=[{x:7,y:5,hp:6}];
  const p=right(s); assert.deepEqual([p.hpAfter,p.damage,p.fatal,p.statusAfter,p.lootAfter],[0,2,true,'defeated',0]);
  assert.match(directionSummary(p),/−2.*VÉGZETES/);
});
test('Repeated previews preserve deeply frozen daily and migrated legacy saves', () => {
  const legacy=restoreGame(readFileSync(new URL('./fixtures/legacy-save.json',import.meta.url),'utf8'));
  for(const s of [createGame({dayId:'2026-10-26'}),legacy]) {
    const before=JSON.stringify(s); freeze(s);
    assert.deepEqual(previewDirections(s),previewDirections(s)); assert.equal(JSON.stringify(s),before);
  }
});
test('Predicted positions, enemies, HP, status, loot and turn match actual actions through a run', () => {
  const s=createGame({dayId:'2026-10-26'});
  for(let turn=0;turn<50 && s.status==='active';turn++) {
    const before=JSON.stringify(s), previews=previewDirections(s);
    for(const p of previews) {
      const actual=JSON.parse(before); step(actual,p.dx,p.dy);
      assert.deepEqual([actual.x,actual.y,actual.hp,actual.status,actual.loot,actual.enemies,actual.turn-s.turn],
        [p.xAfter,p.yAfter,p.hpAfter,p.statusAfter,p.lootAfter,p.enemiesAfter,p.turns]);
    }
    assert.equal(JSON.stringify(s),before);
    const move=previews.filter(p=>p.kind!=='blocked')[turn%previews.filter(p=>p.kind!=='blocked').length];
    if(!move) break; step(s,move.dx,move.dy);
  }
});
test('Completed and defeated expeditions have no previews', () => {
  for(const status of ['extracted','defeated']) assert.equal(previewDirections({...game(),status}),null);
});
function mount() {
  const document={createElement(tag){return {tag,children:[],textContent:'',attributes:{},classes:new Set(),
    append(...children){this.children.push(...children);},setAttribute(k,v){this.attributes[k]=v;},
    get classList(){const classes=this.classes;return {toggle(c,on){if(on)classes.add(c);else classes.delete(c);}};}};}};
  const anchor={ownerDocument:document,before(panel){this.panel=panel;}};
  const render=mountMovementPreview(anchor);return {render,panel:anchor.panel,rows:anchor.panel.children.slice(1,5)};
}
test('Passive display labels four directions, marks fatal and blocked, then refreshes', () => {
  const ui=mount(),s=game();s.hp=2;s.enemies=[{x:7,y:5,hp:6}];s.tiles[4*W+5]=1;
  ui.render(s); assert.equal(ui.panel.hidden,false); assert.equal(ui.rows.length,4);
  DIRECTIONS.forEach((d,i)=>assert.ok(ui.rows[i].textContent.startsWith(d.label)));
  assert.match(ui.rows[0].textContent,/Akadály, nincs kör/);
  assert.match(ui.rows[1].textContent,/VÉGZETES/); assert.equal(ui.rows[1].classes.has('is-fatal'),true);
  assert.ok(ui.rows.every(row=>row.tag==='p')); // Information only, no action controls.
  ui.render(game()); assert.match(ui.rows[1].textContent,/24 HP/);assert.equal(ui.rows[1].classes.has('is-fatal'),false);
  for(const status of ['extracted','defeated']){ui.render({...s,status});assert.equal(ui.panel.hidden,true);assert.ok(ui.rows.every(row=>row.textContent===''));}
  ui.render(game());assert.equal(ui.panel.hidden,false);
});
