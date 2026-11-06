import { W, H } from './daily.js';

const DEFAULT_SIZE = Object.freeze({ width: W, height: H });

// Layout is supplied by the caller, never read from the expedition JSON.
export function dungeonGrid(tiles, size = DEFAULT_SIZE) {
  const { width, height } = size ?? {};
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1
    || !Array.isArray(tiles) || tiles.length !== width * height) return null;

  function floorIndex(x, y) {
    if (!Number.isInteger(x) || !Number.isInteger(y)
      || x < 0 || x >= width || y < 0 || y >= height) return -1;
    const index = y * width + x;
    return tiles[index] === 0 ? index : -1;
  }

  return { width, height, floorIndex };
}
