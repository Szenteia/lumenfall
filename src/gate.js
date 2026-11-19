import { expeditionSize } from './expedition-size.js';
import { dungeonGrid } from './dungeon-grid.js';

// Geometric minimum only: enemies can delay movement but are not permanent walls.
export function gateDistance(state, size = expeditionSize(state)) {
  const { tiles, x, y } = state;
  const grid = dungeonGrid(tiles, size);
  if (!grid) return null;
  const { width, floorIndex } = grid;
  const start = floorIndex(x, y), goal = floorIndex(2, 6);
  if (start < 0 || goal < 0) return null;
  const distances = new Uint32Array(tiles.length);
  const queue = [start]; distances[start] = 1;
  for (let head = 0; head < queue.length; head++) {
    const current = queue[head];
    if (current === goal) return distances[current] - 1;
    const cx = current % width, cy = Math.floor(current / width);
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const next = floorIndex(cx + dx, cy + dy);
      if (next >= 0 && distances[next] === 0) {
        distances[next] = distances[current] + 1; queue.push(next);
      }
    }
  }
  return null;
}

export function gateSummary(distance) {
  if (distance === null) return 'Nincs járható út a kapuig.';
  if (distance === 0) return 'A kapunál vagy — kijuthatsz.';
  return `Kapu: legalább ${distance} mező`;
}
