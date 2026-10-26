import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { W, H, createGame, step, extract, nextRun } from '../src/game.js';
import { restoreGame } from '../src/save.js';
import { gateDistance, gateSummary } from '../src/gate.js';
import { mountGateDistance } from '../src/gate-view.js';
const blank = (x = 2, y = 6) => ({ x, y, status: 'active', tiles: Array(W * H).fill(1), enemies: [], chests: [] });
const open = (s, x, y) => { s.tiles[y * W + x] = 0; return s; };
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };

test('Gate and neighboring square have distances zero and one', () => {
  const s = open(blank(), 2, 6); assert.equal(gateDistance(s), 0);
  s.x = 3; open(s, 3, 6); assert.equal(gateDistance(s), 1);
});
test('Wall detour measures six steps rather than Manhattan distance two', () => {
  const s = blank(4, 6);
  for (const [x, y] of [[4,6],[4,5],[4,4],[3,4],[2,4],[2,5],[2,6]]) open(s,x,y);
  assert.equal(gateDistance(s), 6);
});
test('Equal shortest alternatives and interior border route are counted correctly', () => {
  const s = blank(4, 6);
  for(let x=2;x<=4;x++) for(let y=5;y<=7;y++) if(x!==3||y!==6) open(s,x,y);
  assert.equal(gateDistance(s), 4);
  const border = blank(1, 1);
  for(let y=1;y<=6;y++) open(border,1,y); open(border,2,6);
  assert.equal(gateDistance(border), 6);
});
test('Disconnected and malformed maps terminate with no route; rows do not wrap', () => {
  const s = open(open(blank(16, 5), 16, 5), 2, 6);
  open(s,0,6); open(s,1,6); assert.equal(gateDistance(s), null);
  assert.equal(gateDistance({...s, tiles: []}), null);
  assert.equal(gateDistance({...s, x: -1}), null);
});
test('Guards and relics do not change geometric minimum', () => {
  const s = blank(4,6); for(let x=2;x<=4;x++) open(s,x,6);
  s.enemies=[{x:3,y:6,hp:10}]; s.chests=[{x:2,y:6}];
  assert.equal(gateDistance(s), 2);
});
test('Frozen daily and migrated legacy saves remain identical through repeated searches', () => {
  const legacy = restoreGame(readFileSync(new URL('./fixtures/legacy-save.json',import.meta.url),'utf8'));
  for (const s of [createGame({dayId:'2026-10-25'}), legacy]) {
    const before = JSON.stringify(s); freeze(s);
    const distance = gateDistance(s); assert.equal(gateDistance(s), distance);
    assert.equal(typeof distance,'number'); assert.equal(JSON.stringify(s), before);
  }
});
function mount() {
  const nodes=[];
  const document={createElement(tag){const n={tag,children:[],append(...items){this.children.push(...items);},setAttribute(){}};nodes.push(n);return n;}};
  const button={ownerDocument:document,before(panel){this.panel=panel;}};
  return { render:mountGateDistance(button), panel:button.panel, nodes };
}
test('Display refreshes for movement, restore, next run and completed/dead status', () => {
  const ui=mount(); let s=createGame({dayId:'2026-10-25'});
  ui.render(s); assert.match(ui.nodes[1].textContent,/kapunál/); assert.equal(ui.panel.hidden,false);
  step(s,1,0); ui.render(s); assert.equal(ui.nodes[1].textContent,'Kapu: legalább 1 mező');
  const saved=restoreGame(JSON.stringify(s)); ui.render(saved); assert.match(ui.nodes[1].textContent,/1 mező/);
  s=nextRun(saved,{dayId:'2026-10-26'}); ui.render(s); assert.match(ui.nodes[1].textContent,/kapunál/);
  extract(s); ui.render(s); assert.equal(ui.panel.hidden,true); assert.equal(ui.nodes[1].textContent,'');
  s.status='defeated'; ui.render(s); assert.equal(ui.panel.hidden,true);
  ui.render(open(blank(5,5),5,5)); assert.equal(ui.nodes[1].textContent,'Nincs járható út a kapuig.');
  assert.match(ui.nodes[2].textContent,/harc további köröket/);
});
test('Summaries explicitly distinguish distance, arrival and no path', () => {
  assert.equal(gateSummary(8),'Kapu: legalább 8 mező');
  assert.equal(gateSummary(0),'A kapunál vagy — kijuthatsz.');
  assert.equal(gateSummary(null),'Nincs járható út a kapuig.');
});
