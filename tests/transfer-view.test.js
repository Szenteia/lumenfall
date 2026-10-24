// Lightweight DOM contract tests; these do not claim native browser/file-picker coverage.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mountTransfer } from '../src/transfer-view.js';
import { exportSave } from '../src/transfer.js';
import { createGame } from '../src/game.js';
import { restoreGame } from '../src/save.js';
class Node {
  constructor(tag) { this.tag = tag; this.children = []; this.listeners = {}; this.open = false; }
  append(...nodes) { this.children.push(...nodes); }
  setAttribute() {}
  addEventListener(name, fn) { this.listeners[name] = fn; }
  focus() {}
  showModal() { this.open = true; }
  close() { this.open = false; this.listeners.close?.(); }
}
function setup() {
  const document = { body: new Node('body'), createElement: tag => new Node(tag) };
  const parent = new Node('aside'); let state = createGame({ dayId: '2026-10-24' }); state.bank = 700;
  const storage = { value: JSON.stringify(state), setItem(key, value) { this.value = value; } };
  let writes = 0;
  const api = mountTransfer({ document, parent, getState: () => state, storage: () => storage,
    applyState(loaded) { writes++; state = loaded; } });
  const panel = parent.children[0], dialog = document.body.children[0];
  const [, , label, preview, confirm, cancel] = dialog.children;
  return { api, dialog, preview, confirm, cancel, upload: panel.children[2], input: label.children[0], storage,
    state: () => state, writes: () => writes };
}
const imported = () => { const s = createGame({ dayId: '2026-10-23' }); s.bank = 30; return s; };
function choose(ui, state = imported()) {
  const text = exportSave(state).text;
  ui.input.files = [{ size: text.length, text: async () => text }];
  return ui.input.onchange();
}
test('Selection only previews; explicit confirmation replaces state and persistent bank', async () => {
  const ui = setup(); ui.upload.onclick(); assert.equal(ui.api.isOpen(), true);
  await choose(ui); assert.equal(ui.confirm.disabled, false); assert.match(ui.preview.textContent, /Gyakorló.*30/);
  assert.equal(ui.state().bank, 700); assert.equal(restoreGame(ui.storage.value).bank, 700); assert.equal(ui.writes(), 0);
  ui.confirm.onclick(); assert.equal(ui.state().bank, 30); assert.equal(ui.writes(), 1);
  assert.deepEqual(restoreGame(ui.storage.value), imported()); assert.equal(ui.api.isOpen(), false);
});
test('Cancel and Escape discard candidate without changing state or storage', async () => {
  for (const escape of [false, true]) {
    const ui = setup(), before = ui.storage.value; ui.upload.onclick(); await choose(ui);
    if (escape) { ui.dialog.listeners.cancel(); ui.dialog.close(); } else ui.cancel.onclick();
    ui.confirm.onclick(); assert.equal(ui.writes(), 0); assert.equal(ui.storage.value, before);
    assert.equal(ui.state().bank, 700); assert.equal(ui.api.isOpen(), false);
  }
});
test('Storage failure keeps preview open and original expedition intact; retry works', async () => {
  const ui = setup(), before = ui.storage.value; ui.upload.onclick(); await choose(ui);
  const write = ui.storage.setItem; ui.storage.setItem = () => { throw Error('quota'); };
  ui.confirm.onclick(); assert.match(ui.preview.textContent, /nem írható/);
  assert.equal(ui.writes(), 0); assert.equal(ui.storage.value, before); assert.equal(ui.api.isOpen(), true);
  ui.storage.setItem = write; ui.confirm.onclick(); assert.equal(ui.state().bank, 30);
});
test('Late read after cancel cannot enable confirmation or replace a new preview', async () => {
  const ui = setup(); let resolve; const text = exportSave(imported()).text;
  ui.upload.onclick(); ui.input.files = [{ size: text.length, text: () => new Promise(r => { resolve = r; }) }];
  const pending = ui.input.onchange(); ui.cancel.onclick(); ui.upload.onclick();
  const newer = imported(); newer.bank = 80; await choose(ui, newer);
  resolve(text); await pending; ui.confirm.onclick(); assert.equal(ui.state().bank, 80);
});
test('Invalid or cancelled chooser clears old candidate and never commits it', async () => {
  const ui = setup(); ui.upload.onclick(); await choose(ui);
  ui.input.files = [{ size: 1, text: async () => '{' }]; await ui.input.onchange();
  assert.equal(ui.confirm.disabled, true); ui.confirm.onclick(); assert.equal(ui.writes(), 0);
  ui.input.files = []; await ui.input.onchange(); assert.match(ui.preview.textContent, /Nem választottál/);
  assert.equal(ui.state().bank, 700);
});
