import { step } from './game.js';

export const DIRECTIONS = Object.freeze([
  Object.freeze({ id: 'up', label: 'Fel', dx: 0, dy: -1 }),
  Object.freeze({ id: 'right', label: 'Jobbra', dx: 1, dy: 0 }),
  Object.freeze({ id: 'down', label: 'Le', dx: 0, dy: 1 }),
  Object.freeze({ id: 'left', label: 'Balra', dx: -1, dy: 0 }),
]);

// Each direction is an alternative single action, starting from the same live state.
export function previewDirections(state) {
  if (state.status !== 'active') return null;
  return DIRECTIONS.map(direction => {
    const after = JSON.parse(JSON.stringify(state));
    const targetX = state.x + direction.dx, targetY = state.y + direction.dy;
    const enemy = state.enemies.some(e => e.x === targetX && e.y === targetY);
    const acted = step(after, direction.dx, direction.dy);
    return {
      ...direction,
      kind: !acted ? 'blocked' : enemy ? 'attack' : 'move',
      turns: after.turn - state.turn,
      hpAfter: after.hp,
      damage: Math.max(0, state.hp - after.hp),
      fatal: after.status === 'defeated',
      statusAfter: after.status,
      xAfter: after.x, yAfter: after.y,
      lootAfter: after.loot,
      enemiesAfter: after.enemies.map(e => ({ ...e })),
    };
  });
}

export function directionSummary(preview) {
  if (preview.kind === 'blocked') return `${preview.label} · Akadály, nincs kör`;
  const action = preview.kind === 'attack' ? 'Kardcsapás' : 'Lépés';
  return `${preview.label} · ${action} · marad ${preview.hpAfter} HP (−${preview.damage})`
    + (preview.fatal ? ' · VÉGZETES' : '');
}
