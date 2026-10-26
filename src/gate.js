import { W, H } from './daily.js';

// Geometric minimum only: enemies can delay movement but are not permanent walls.
export function gateDistance(state) {
  const { tiles, x, y } = state;
  const floor = (a, b) => Number.isInteger(a) && Number.isInteger(b)
    && a >= 0 && a < W && b >= 0 && b < H && tiles[b * W + a] === 0;
  if (!Array.isArray(tiles) || tiles.length !== W * H || !floor(x, y) || !floor(2, 6)) return null;
  const start = y * W + x, goal = 6 * W + 2;
  const distances = new Int16Array(W * H).fill(-1);
  const queue = [start]; distances[start] = 0;
  for (let head = 0; head < queue.length; head++) {
    const current = queue[head];
    if (current === goal) return distances[current];
    const cx = current % W, cy = Math.floor(current / W);
    for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
      const nx = cx + dx, ny = cy + dy, next = ny * W + nx;
      if (floor(nx, ny) && distances[next] === -1) {
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
