import { dungeonGrid } from './dungeon-grid.js';

// Trusted caller supplies layout; untrusted save fields must never select it.
// This validates geometry only, not entities, rules or a whole expedition.
export function validateDungeonGeometry(tiles, size) {
  if (!size) return null;
  const { width, height } = size;
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height)
    || width < 4 || height < 8 || !Number.isSafeInteger(width * height)) return null;
  const grid = dungeonGrid(tiles, { width, height });
  if (!grid) return null;
  // Indexed traversal also rejects sparse arrays (Array.every skips holes).
  for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i], x = i % width, y = Math.floor(i / width);
    if (tile !== 0 && tile !== 1) return null;
    if ((x === 0 || x === width - 1 || y === 0 || y === height - 1) && tile !== 1) return null;
  }
  const floor = (x, y) => x > 0 && x < width - 1 && y > 0 && y < height - 1
    && grid.floorIndex(x, y) >= 0;
  if (!floor(2, 6)) return null;
  return { width, height, floor };
}
