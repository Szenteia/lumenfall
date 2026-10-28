import { SAVE_KEY, restoreGame } from './save.js';
import { createGame } from './game.js';

// Reading is deliberately separate from saving. Only null means no previous save.
export function readStartup(getStorage) {
  let raw;
  try { raw = getStorage().getItem(SAVE_KEY); }
  catch { return { kind: 'unavailable', raw: null }; }
  if (raw === null) return { kind: 'missing', raw: null };
  let state;
  try { state = restoreGame(raw); } catch { return { kind: 'invalid', raw }; }
  return state ? { kind: 'valid', raw, state } : { kind: 'invalid', raw };
}

// Atomic setItem succeeds before the caller is allowed to replace memory/unlock.
export function replaceWithNewGame(getStorage, makeGame = createGame) {
  const state = makeGame();
  getStorage().setItem(SAVE_KEY, JSON.stringify(state));
  return state;
}

export function downloadOriginal(raw, { document, URL, Blob, later = setTimeout }, now = new Date()) {
  if (typeof raw !== 'string') throw new Error('Az eredeti adat nem olvasható.');
  const url = URL.createObjectURL(new Blob([raw], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  try {
    if (!('download' in link)) throw new Error('A letöltés nem támogatott.');
    link.href = url; link.download = `lumenfall-eredeti-mentes-${now.toISOString().slice(0, 10)}.txt`;
    document.body.append(link); link.click();
  } finally { link.remove(); later(() => URL.revokeObjectURL(url), 1000); }
}
