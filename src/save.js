import { W, H, SUPPORTED_RULES_VERSIONS, isDayId } from './daily.js';

// Keep the original storage key, so existing players retain their expedition and bank.
export const SAVE_KEY = 'lumenfall-save-v1';

export function restoreGame(json) {
  let state;
  try { state = JSON.parse(json); } catch { return null; }
  if (!state || typeof state !== 'object' || Array.isArray(state) || ![1, 2].includes(state.version)) return null;
  const integer = value => Number.isSafeInteger(value) && value >= 0;
  const floor = (x, y) => Number.isInteger(x) && Number.isInteger(y)
    && x > 0 && x < W - 1 && y > 0 && y < H - 1 && state.tiles[y * W + x] === 0;
  if (!Array.isArray(state.tiles) || state.tiles.length !== W * H
    || !state.tiles.every(tile => tile === 0 || tile === 1)
    || !state.tiles.every((tile, i) => {
      const x = i % W, y = Math.floor(i / W);
      return (x !== 0 && x !== W - 1 && y !== 0 && y !== H - 1) || tile === 1;
    })
    || !floor(state.x, state.y) || state.tiles[6 * W + 2] !== 0
    || !Array.isArray(state.enemies) || !Array.isArray(state.chests)
    || state.enemies.length > 3 || state.chests.length > 3
    || new Set(state.enemies.map(e => e && `${e.x},${e.y}`)).size !== state.enemies.length
    || new Set(state.chests.map(c => c && `${c.x},${c.y}`)).size !== state.chests.length
    || !state.enemies.every(e => e && floor(e.x, e.y) && integer(e.hp) && e.hp > 0 && e.hp <= 10 && (e.x !== state.x || e.y !== state.y))
    || !state.chests.every(c => c && floor(c.x, c.y))
    || !['hp', 'maxHp', 'potions', 'loot', 'bank', 'turn'].every(k => integer(state[k]))
    || state.maxHp !== 24 || state.hp > state.maxHp || state.potions > 2
    || !['active', 'extracted', 'defeated'].includes(state.status)
    || (state.status === 'defeated') !== (state.hp === 0)
    || typeof state.log !== 'string' || state.log.length > 2000) return null;
  if (state.version === 1) return { ...state, version: 2, dayId: null, rulesVersion: 0 };
  if (!(state.dayId === null && state.rulesVersion === 0)
    && !(isDayId(state.dayId) && SUPPORTED_RULES_VERSIONS.includes(state.rulesVersion))) return null;
  return state;
}
