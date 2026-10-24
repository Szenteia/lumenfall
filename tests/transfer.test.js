import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createGame, rest, extract } from '../src/game.js';
import { restoreGame, SAVE_KEY } from '../src/save.js';
import { FORMAT, FORMAT_VERSION, MAX_SAVE_BYTES, exportSave, importSave, readSaveFile, commitImport, importSummary, downloadSave } from '../src/transfer.js';
const game = () => createGame({ dayId: '2026-10-24' });
const wrap = state => JSON.stringify({ format: FORMAT, formatVersion: FORMAT_VERSION, state });

test('Export is immutable and v2 roundtrips the full played state', () => {
  const s = game(); rest(s); s.bank = 73;
  const before = structuredClone(s), file = exportSave(s, new Date('2026-10-24T12:00:00Z'));
  assert.deepEqual(importSave(file.text), before); assert.deepEqual(s, before);
  assert.equal(file.filename, 'lumenfall-2026-10-24-2026-10-24.json');
});
test('Legacy v1 migrates without losing map, bank or progress', () => {
  const legacy = JSON.parse(readFileSync(new URL('./fixtures/legacy-save.json', import.meta.url)));
  const loaded = importSave(wrap(legacy));
  assert.deepEqual(loaded, { ...legacy, version: 2, dayId: null, rulesVersion: 0 });
  assert.deepEqual(importSave(exportSave(loaded).text), loaded);
});
test('Previous-day import stays practice with its old map and bank', () => {
  const s = game(); s.bank = 90;
  const loaded = importSave(exportSave(s).text);
  assert.match(importSummary(loaded, new Date('2026-10-24T22:00:00Z')), /Gyakorló.*2026-10-24/);
  assert.deepEqual(loaded, s);
});
test('Extracted and defeated expeditions roundtrip and remain inactive', () => {
  const s = game(); s.loot = 30; extract(s);
  assert.deepEqual(importSave(exportSave(s).text), s);
  s.status = 'defeated'; s.hp = 0;
  const loaded = importSave(exportSave(s).text); rest(loaded); assert.deepEqual(loaded, s);
});
test('Empty, oversized, broken, foreign and future envelopes are rejected', () => {
  for (const text of ['', ' ', '{', 'null', '[]', 'x'.repeat(MAX_SAVE_BYTES + 1),
    JSON.stringify({ format: 'other', formatVersion: 1, state: game() }),
    JSON.stringify({ format: FORMAT, formatVersion: 2, state: game() }), wrap(null), wrap({})])
    assert.throws(() => importSave(text));
  assert.throws(() => importSave('é'.repeat(MAX_SAVE_BYTES / 2 + 1)));
});
test('Untrusted maps, bounds, numeric fields, entities and versions cannot bypass shared validator', () => {
  const mutations = [s => s.version = 3, s => s.rulesVersion = 9, s => s.dayId = '2026-02-30',
    s => delete s.tiles, s => s.tiles.pop(), s => s.tiles[0] = 0, s => s.tiles[17] = 0,
    s => s.x = -1, s => s.y = 13, s => s.bank = -1, s => s.hp = '24', s => s.maxHp = 0,
    s => s.potions = 3, s => s.turn = Number.MAX_SAFE_INTEGER + 1, s => s.status = 'won',
    s => s.hp = 0, s => s.status = 'defeated', s => delete s.log,
    s => s.enemies = [null], s => s.chests = [{}], s => s.enemies[0].hp = 100,
    s => s.enemies.push(s.enemies[0]), s => s.chests.push(s.chests[0]),
    s => { s.enemies[0].x = s.x; s.enemies[0].y = s.y; }];
  for (const mutate of mutations) {
    const s = game(); mutate(s); const before = JSON.stringify(s);
    assert.equal(restoreGame(before), null); assert.throws(() => importSave(wrap(s)));
    assert.equal(JSON.stringify(s), before);
  }
});
test('File size checked before reading; extension is irrelevant; read failures reject', async () => {
  let read = false;
  await assert.rejects(readSaveFile({ size: MAX_SAVE_BYTES + 1, text() { read = true; } }));
  assert.equal(read, false);
  const text = exportSave(game()).text;
  assert.deepEqual(await readSaveFile({ name: 'backup.txt', size: text.length, text: async () => text }), game());
  await assert.rejects(readSaveFile({ size: 20, text: async () => { throw Error(); } }), /beolvasni/);
});
test('Atomic import replaces bank and persists exact state; failure preserves old state', () => {
  let current = game(); current.bank = 700; const original = structuredClone(current);
  const imported = game(); imported.bank = 30;
  const storage = { value: JSON.stringify(current), setItem(key, text) { assert.equal(key, SAVE_KEY); this.value = text; } };
  const fail = { setItem() { throw Error('quota'); } };
  assert.throws(() => { current = commitImport(imported, fail); }); assert.deepEqual(current, original);
  current = commitImport(imported, storage); assert.equal(current.bank, 30);
  assert.deepEqual(restoreGame(storage.value), current); assert.deepEqual(imported, current);
  const previous = storage.value;
  assert.throws(() => commitImport({}, storage)); assert.equal(storage.value, previous);
});
test('Download creates JSON and releases URL after click, including failed click', () => {
  for (const fail of [false, true]) {
    const events = []; let callback;
    const anchor = { download: '', click() { events.push('click'); if (fail) throw Error(); }, remove() { events.push('remove'); } };
    const env = { document: { createElement: () => anchor, body: { append() { events.push('append'); } } },
      Blob, URL: { createObjectURL(blob) { assert.equal(blob.type, 'application/json'); events.push('url'); return 'blob:save'; }, revokeObjectURL(url) { assert.equal(url, 'blob:save'); events.push('revoke'); } },
      later(fn) { callback = fn; } };
    if (fail) assert.throws(() => downloadSave(game(), env)); else downloadSave(game(), env);
    assert.deepEqual(events, ['url', 'append', 'click', 'remove']); callback(); assert.equal(events.at(-1), 'revoke');
  }
});
