import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, step, rest, heal } from '../src/game.js';
import { gateDistance } from '../src/gate.js';
import { restoreGame } from '../src/save.js';
import { FORMAT, FORMAT_VERSION, importSave } from '../src/transfer.js';

const size = { width: 21, height: 15 };
const at = (x, y) => y * size.width + x;
function largeState(x = 16, y = 13) {
  return { ...createGame({rulesVersion:2, dayId: '2026-11-04' }), x, y,
    tiles: Array(size.width * size.height).fill(0), enemies: [], chests: [] };
}

test('A player and pursuing guard move beyond the original width and height', () => {
  const s = largeState();
  s.turn = 1;
  s.enemies = [{ x: 19, y: 13, hp: 8 }];
  assert.equal(step(s, 1, 0, size), true);
  assert.deepEqual([s.x, s.y, s.turn], [17, 13, 2]);
  assert.deepEqual(s.enemies, [{ x: 18, y: 13, hp: 8 }]);
});

test('Walls and both grid edges block steps without consuming a turn', () => {
  const s = largeState(20, 14);
  s.tiles[at(19, 14)] = 1;
  for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0]]) {
    assert.equal(step(s, dx, dy, size), false);
    assert.equal(s.turn, 0);
  }
  assert.equal(step(s, 0, -1, size), true);
});

test('Wait and heal use the supplied grid for guard pursuit and walls', () => {
  const s = largeState(17);
  s.turn = 1;
  s.hp = 12;
  s.enemies = [{ x: 20, y: 13, hp: 8 }];
  s.tiles[at(19, 13)] = 1;
  rest(s, size);
  assert.equal(s.enemies[0].x, 20);
  assert.equal(s.turn, 2);
  rest(s, size);
  s.tiles[at(19, 13)] = 0;
  heal(s, size);
  assert.equal(s.enemies[0].x, 19);
  assert.deepEqual([s.turn, s.hp, s.potions], [4, 22, 1]);
});

test('Gate search measures a wall detour on the larger grid and ignores guards', () => {
  const s = largeState(19, 6);
  s.tiles[at(10, 6)] = 1;
  s.enemies = [{ x: 18, y: 6, hp: 8 }];
  assert.equal(gateDistance(s, size), 19);
  s.tiles[at(2, 6)] = 1;
  assert.equal(gateDistance(s, size), null);
});

test('Adjacent flat-array indices on opposite row ends do not form a path', () => {
  const s = largeState(20, 6);
  s.tiles.fill(1);
  for (const [x, y] of [[20, 6], [0, 7], [1, 7], [2, 7], [2, 6]]) s.tiles[at(x, y)] = 0;
  assert.equal(gateDistance(s, size), null);
  assert.equal(step(s, 1, 0, size), false);
});

test('Invalid geometry and missing tiles fail closed without consuming a potion or turn', () => {
  for (const invalid of [null, { width: 21 }, { width: -21, height: -15 },
    { width: 21.5, height: 15 }, { width: 20, height: 15 }, undefined]) {
    const s = largeState();
    s.hp = 10;
    const before = structuredClone(s);
    assert.equal(step(s, 1, 0, invalid), false);
    assert.equal(gateDistance(s, invalid), null);
    rest(s, invalid);
    heal(s, invalid);
    assert.deepEqual(s, before);
  }
  const s = largeState();
  s.tiles.length--;
  assert.equal(step(s, 1, 0, size), false);
  assert.equal(gateDistance(s, size), null);
  const sparse = largeState();
  delete sparse.tiles[at(17, 13)];
  assert.equal(step(sparse, 1, 0, size), false);
});

test('The larger fixture cannot be restored or imported as a live expedition', () => {
  const state = { ...largeState(), ...size };
  assert.equal(gateDistance(state), null);
  assert.equal(step(state, 1, 0), false);
  assert.equal(restoreGame(JSON.stringify(state)), null);
  assert.throws(() => importSave(JSON.stringify({ format: FORMAT, formatVersion: FORMAT_VERSION, state })), /Hibás/);
});
