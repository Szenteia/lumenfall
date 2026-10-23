import { rest } from './game.js';

// Simulate the real wait action on a detached copy of the persisted game state.
export function previewWait(state) {
  if (state.status !== 'active') return null;
  const after = JSON.parse(JSON.stringify(state));
  rest(after);
  return {
    hpAfter: after.hp,
    damage: Math.max(0, state.hp - after.hp),
    fatal: after.status === 'defeated',
    enemiesAfter: after.enemies.map(enemy => ({ ...enemy })),
    moves: after.enemies.flatMap((enemy, index) => {
      const before = state.enemies[index];
      return enemy.x === before.x && enemy.y === before.y ? [] : [{
        index, from: { x: before.x, y: before.y }, to: { x: enemy.x, y: enemy.y },
      }];
    }),
  };
}

export function waitSummary(preview) {
  if (!preview) return '';
  return `Ha vársz: −${preview.damage} HP · ${preview.moves.length} őrző mozdul.`
    + (preview.fatal ? ' VÉGZETES: elfogy az életerőd!' : ` Marad: ${preview.hpAfter} HP.`);
}
