import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { W, H, RULES_VERSION, getDayId, generateDungeon, expeditionLabel } from '../src/daily.js';
import { createGame, nextRun, step, rest, heal } from '../src/game.js';
import { restoreGame, SAVE_KEY } from '../src/save.js';

const dayId = '2026-10-22';
test('Budapest date changes at local midnight in winter and summer', () => {
  for (const [instant, day] of [
    ['2026-01-01T22:59:59Z', '2026-01-01'], ['2026-01-01T23:00:00Z', '2026-01-02'],
    ['2026-07-01T21:59:59Z', '2026-07-01'], ['2026-07-01T22:00:00Z', '2026-07-02'],
    ['2026-03-29T00:59:59Z', '2026-03-29'], ['2026-03-29T01:00:00Z', '2026-03-29'],
    ['2026-03-29T21:59:59Z', '2026-03-29'], ['2026-03-29T22:00:00Z', '2026-03-30'],
    ['2026-10-25T00:59:59Z', '2026-10-25'], ['2026-10-25T01:00:00Z', '2026-10-25'],
    ['2026-10-25T22:59:59Z', '2026-10-25'], ['2026-10-25T23:00:00Z', '2026-10-26'],
  ]) assert.equal(getDayId(new Date(instant)), day, instant);
});

test('Same day produces independent identical worlds without Math.random', () => {
  const original = Math.random;
  try {
    Math.random = () => { throw new Error('Ambient randomness'); };
    const a = createGame({ now: new Date('2026-10-22T00:00:00Z') });
    const b = createGame({ now: new Date('2026-10-22T20:00:00Z') });
    assert.deepEqual(a, b);
    a.tiles[0] = 0; a.enemies[0].hp = 1;
    assert.equal(b.tiles[0], 1); assert.equal(b.enemies[0].hp, 6);
  } finally { Math.random = original; }
});

test('Versioned generator has a stable world fingerprint', () => {
  assert.equal(RULES_VERSION, 1);
  const hash = createHash('sha256').update(JSON.stringify(generateDungeon(dayId))).digest('hex');
  assert.equal(hash, '124e8f7a26515afbed452840cd3527d287c0504f0d946f31c9183100fcf71c02');
});

test('A full year has connected floors, reachable loot, safe arrival and distinct daily maps', () => {
  const layouts = new Set();
  for (let day = 0; day < 365; day++) {
    const id = new Date(Date.UTC(2026, 0, day + 1)).toISOString().slice(0, 10);
    const { tiles, enemies, chests } = generateDungeon(id);
    assert.equal(tiles.length, W * H);
    layouts.add(tiles.join(''));
    for (let x = 0; x < W; x++) { assert.equal(tiles[x], 1); assert.equal(tiles[(H - 1) * W + x], 1); }
    for (let y = 0; y < H; y++) { assert.equal(tiles[y * W], 1); assert.equal(tiles[y * W + W - 1], 1); }
    const queue = [6 * W + 2], seen = new Set(queue);
    for (let i = 0; i < queue.length; i++) {
      const index = queue[i], x = index % W, y = Math.floor(index / W);
      for (const [a, b] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]) {
        const next = b * W + a;
        if (a >= 0 && a < W && b >= 0 && b < H && tiles[next] === 0 && !seen.has(next)) {
          seen.add(next); queue.push(next);
        }
      }
    }
    assert.equal(seen.size, tiles.filter(t => t === 0).length, id);
    assert.equal(enemies.length, 3); assert.equal(chests.length, 3);
    assert.deepEqual(enemies.map(e => e.hp), [6, 8, 10]);
    const occupied = new Set([6 * W + 2]);
    for (const entity of [...enemies, ...chests]) {
      const index = entity.y * W + entity.x;
      assert.ok(seen.has(index), id); assert.ok(!occupied.has(index), id); occupied.add(index);
    }
    for (const e of enemies) assert.ok(Math.abs(e.x - 2) + Math.abs(e.y - 6) >= 4, id);
    for (const [x,y] of [[2,6],[1,6],[3,6],[2,5],[2,7]]) assert.equal(tiles[y*W+x],0,id);
  }
  assert.equal(layouts.size, 365);
});

test('Invalid day identifiers cannot silently seed another world', () => {
  for (const value of ['', null, '2026-02-30', '2026-13-01', '22/10/2026']) {
    assert.throws(() => generateDungeon(value), RangeError);
  }
});

test('JSON restore preserves a played daily expedition and subsequent actions', () => {
  const a = createGame({ dayId }); a.bank = 77;
  step(a, 1, 0); rest(a);
  const b = restoreGame(JSON.stringify(a));
  assert.deepEqual(b, a);
  for (const state of [a,b]) { step(state,0,1); heal(state); rest(state); }
  assert.deepEqual(b, a);
});

test('Midnight preserves the old run; only a new expedition adopts the new day', () => {
  const s = createGame({ now: new Date('2026-10-22T21:59:59Z') });
  s.bank = 99; step(s,1,0);
  const saved = JSON.stringify(s), restored = restoreGame(saved);
  const tomorrow = new Date('2026-10-22T22:00:00Z');
  assert.equal(JSON.stringify(restored), saved);
  assert.equal(expeditionLabel(restored,tomorrow), 'Gyakorló · 2026-10-22');
  const next = nextRun(restored,{now:tomorrow});
  assert.equal(next.dayId,'2026-10-23'); assert.equal(next.bank,99); assert.equal(next.turn,0);
  assert.equal(expeditionLabel(next,tomorrow),'Napi pálya · 2026-10-23');
});

test('Existing v1 save migrates without replacing its map, progress or bank', () => {
  const legacy = JSON.parse(readFileSync(new URL('./fixtures/legacy-save.json',import.meta.url),'utf8'));
  const restored = restoreGame(JSON.stringify(legacy));
  assert.equal(SAVE_KEY,'lumenfall-save-v1');
  assert.deepEqual(restored,{...legacy,version:2,dayId:null,rulesVersion:0});
  assert.equal(expeditionLabel(restored),'Gyakorló · korábbi mentés');
  assert.deepEqual(restoreGame(JSON.stringify(restored)),restored);
  const next = nextRun(restored,{dayId});
  assert.equal(next.bank,legacy.bank); assert.equal(next.dayId,dayId);
});

test('Broken or unsupported saves are rejected without changing the input', () => {
  assert.equal(restoreGame('{'),null); assert.equal(restoreGame(null),null);
  const s=createGame({dayId});
  for(const invalid of [{...s,rulesVersion:999},{...s,dayId:'2026-02-30'},{...s,tiles:[]},{...s,hp:-1}]) {
    assert.equal(restoreGame(JSON.stringify(invalid)),null);
  }
});
