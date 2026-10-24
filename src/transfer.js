import { restoreGame, SAVE_KEY } from './save.js';
import { expeditionLabel } from './daily.js';

export const MAX_SAVE_BYTES = 64 * 1024;
export const FORMAT = 'lumenfall-expedition';
export const FORMAT_VERSION = 1;
const bytes = text => new TextEncoder().encode(text).length;

export function importSave(text) {
  if (typeof text !== 'string' || !text.trim() || bytes(text) > MAX_SAVE_BYTES)
    throw new Error('Üres vagy túl nagy mentés. A határ 64 KiB.');
  let file;
  try { file = JSON.parse(text); } catch { throw new Error('A fájl nem érvényes JSON mentés.'); }
  if (file?.format !== FORMAT || file?.formatVersion !== FORMAT_VERSION)
    throw new Error('Idegen vagy nem támogatott mentésformátum.');
  const state = restoreGame(JSON.stringify(file.state));
  if (!state) throw new Error('Hibás vagy nem támogatott expedíciómentés.');
  return state;
}

export function exportSave(state, now = new Date()) {
  const text = JSON.stringify({ format: FORMAT, formatVersion: FORMAT_VERSION, state }, null, 2);
  importSave(text); // The download must itself be importable; never mutate the live state.
  return { text, filename: `lumenfall-${state.dayId ?? 'gyakorlo'}-${now.toISOString().slice(0, 10)}.json` };
}

export async function readSaveFile(file) {
  if (!file || !Number.isFinite(file.size) || file.size <= 0 || file.size > MAX_SAVE_BYTES)
    throw new Error('Válassz egy legfeljebb 64 KiB-os mentésfájlt.');
  let text;
  try { text = await file.text(); } catch { throw new Error('A fájlt nem sikerült beolvasni.'); }
  return importSave(text);
}

// setItem is atomic: a failed write never replaces the in-memory expedition.
export function commitImport(candidate, storage) {
  const restored = restoreGame(JSON.stringify(candidate));
  if (!restored) throw new Error('A mentés már nem érvényes.');
  storage.setItem(SAVE_KEY, JSON.stringify(restored));
  return restored;
}

export function importSummary(state, now = new Date()) {
  const status = { active: 'Folyamatban', extracted: 'Kijutott', defeated: 'Elbukott' }[state.status];
  return `${expeditionLabel(state, now)} · HP: ${state.hp}/${state.maxHp} · Céhkincstár: ${state.bank} · ${status}`;
}

export function downloadSave(state, { document, URL, Blob, later = setTimeout }, now) {
  const { text, filename } = exportSave(state, now);
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  try {
    if (!('download' in link)) throw new Error('A böngésző nem támogatja a fájlletöltést.');
    link.href = url; link.download = filename;
    document.body.append(link); link.click();
  } finally {
    link.remove();
    // Let the browser consume the URL before revoking it (including mobile Safari).
    later(() => URL.revokeObjectURL(url), 1000);
  }
}
