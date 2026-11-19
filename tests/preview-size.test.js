import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, step, rest } from '../src/game.js';
import { previewDirections } from '../src/movement.js';
import { previewWait } from '../src/tactics.js';

const size = Object.freeze({ width: 21, height: 15 });
const game = () => ({ ...createGame({rulesVersion:2, dayId: '2026-11-05' }), x: 18, y: 13,
  tiles: Array(21 * 15).fill(0), enemies: [], chests: [] });
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
function compareDirections(s) {
  const previews = previewDirections(s, size);
  assert.equal(previews.length, 4);
  for (const p of previews) {
    const actual = structuredClone(s), target = s.enemies.some(e => e.x === s.x + p.dx && e.y === s.y + p.dy);
    const acted = step(actual, p.dx, p.dy, size);
    assert.deepEqual([p.kind, p.turns, p.xAfter, p.yAfter, p.hpAfter, p.damage, p.fatal, p.statusAfter, p.lootAfter, p.enemiesAfter],
      [!acted ? 'blocked' : target ? 'attack' : 'move', actual.turn - s.turn, actual.x, actual.y, actual.hp,
        Math.max(0, s.hp - actual.hp), actual.status === 'defeated', actual.status, actual.loot, actual.enemies]);
  }
  return previews;
}
function compareWait(s) {
  const actual = structuredClone(s); rest(actual, size);
  const p = previewWait(s, size);
  assert.deepEqual([p.hpAfter, p.damage, p.fatal, p.enemiesAfter],
    [actual.hp, Math.max(0, s.hp - actual.hp), actual.status === 'defeated', actual.enemies]);
  assert.deepEqual(p.moves, actual.enemies.flatMap((e, index) => {
    const old = s.enemies[index];
    return e.x === old.x && e.y === old.y ? [] : [{ index, from: { x: old.x, y: old.y }, to: { x: e.x, y: e.y } }];
  }));
  return p;
}

test('Larger direction previews match independent real steps, attacks, pickups and fatal turns', () => {
  const empty = game();
  assert.deepEqual(compareDirections(empty).map(p => [p.xAfter,p.yAfter]), [[18,12],[19,13],[18,14],[17,13]]);
  const chase = game(); chase.turn = 1; chase.enemies = [{x:20,y:13,hp:8}]; compareDirections(chase);
  const odd = structuredClone(chase); odd.turn = 0; compareDirections(odd);
  for (const hp of [4,8]) {
    const attack = game(); attack.enemies = [{x:19,y:13,hp},{x:18,y:12,hp:10}];
    const right = compareDirections(attack).find(p => p.id === 'right');
    assert.equal(right.kind,'attack'); assert.equal(right.xAfter,18);
    assert.equal(right.lootAfter,hp === 4 ? 15 : 0);
  }
  const loot = game(); loot.chests = [{x:19,y:13}]; loot.enemies = [{x:20,y:13,hp:8}];
  assert.equal(compareDirections(loot).find(p=>p.id==='right').lootAfter,30);
  const fatal = structuredClone(loot); fatal.hp = 2; fatal.loot = 45;
  const right = compareDirections(fatal).find(p=>p.id==='right');
  assert.deepEqual([right.hpAfter,right.damage,right.fatal,right.lootAfter],[0,2,true,0]);
  const wall = game(); wall.tiles[13*21+19] = 1;
  assert.equal(compareDirections(wall).find(p=>p.id==='right').kind,'blocked');
  const edge = game(); edge.x=20; edge.y=14;
  assert.equal(compareDirections(edge).filter(p=>p.kind==='blocked').length,2);
});

test('Larger wait previews match real pursuit, blocked routes, odd turns and lethal attacks', () => {
  assert.equal(compareWait(game()).moves.length,0);
  const chase = game(); chase.turn=1; chase.enemies=[{x:20,y:13,hp:8}];
  assert.deepEqual(compareWait(chase).moves,[{index:0,from:{x:20,y:13},to:{x:19,y:13}}]);
  const odd = structuredClone(chase); odd.turn=0; assert.equal(compareWait(odd).moves.length,0);
  const wall = structuredClone(chase); wall.tiles[13*21+19]=1; assert.equal(compareWait(wall).moves.length,0);
  const blocked = game(); blocked.turn=1; blocked.enemies=[{x:20,y:13,hp:8},{x:19,y:13,hp:8}];
  assert.equal(compareWait(blocked).moves.length,0);
  const attack = game(); attack.enemies=[{x:19,y:13,hp:8},{x:18,y:12,hp:8}];
  assert.equal(compareWait(attack).damage,6);
  attack.enemies.pop(); assert.equal(compareWait(attack).damage,3);
  attack.hp=2; assert.equal(compareWait(attack).fatal,true);
});

test('Invalid or mismatched dimensions hide both forecasts; absent size remains legacy sized', () => {
  const s = game();
  for (const invalid of [undefined,null,{}, {width:21}, {width:21,height:14}, {width:21.5,height:15}, {width:-21,height:-15}]) {
    assert.equal(previewDirections(s,invalid),null);
    assert.equal(previewWait(s,invalid),null);
  }
  s.tiles.pop(); assert.equal(previewDirections(s,size),null); assert.equal(previewWait(s,size),null);
  for (const status of ['extracted','defeated']) {
    const inactive={...game(),status};
    assert.equal(previewDirections(inactive,size),null); assert.equal(previewWait(inactive,size),null);
  }
});

test('State width and height never override the trusted explicit or default layout', () => {
  const normal=createGame({rulesVersion:2,dayId:'2026-11-05'}), spoofed={...normal,width:21,height:15};
  assert.deepEqual(previewDirections(spoofed),previewDirections(normal));
  assert.deepEqual(previewWait(spoofed),previewWait(normal));
  const large={...game(),width:17,height:13};
  assert.equal(previewDirections(large),null); assert.equal(previewWait(large),null);
  compareDirections(large); compareWait(large);
});

test('Repeated forecasts preserve deeply frozen state and size and return detached results', () => {
  const s=game(); s.turn=1; s.enemies=[{x:20,y:13,hp:8}]; freeze(s);
  const before=JSON.stringify(s),a=compareDirections(s),b=compareWait(s);
  assert.deepEqual(previewDirections(s,size),a); assert.deepEqual(previewWait(s,size),b);
  a[0].enemiesAfter[0].hp=1; b.enemiesAfter[0].x=0; b.moves[0].from.x=0;
  assert.equal(JSON.stringify(s),before); assert.equal(previewWait(s,size).moves[0].from.x,20);
  assert.equal(previewDirections(s,size)[0].enemiesAfter[0].hp,8);
});
