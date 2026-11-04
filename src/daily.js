export const W = 17, H = 13;
export const RULES_VERSION = 2;
export const SUPPORTED_RULES_VERSIONS = Object.freeze([1, 2]);
const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Budapest', year: 'numeric', month: '2-digit', day: '2-digit',
});

export function getDayId(now = new Date()) {
  const parts = Object.fromEntries(dateFormatter.formatToParts(now).map(p => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function isDayId(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Integer seed and PRNG are part of the versioned map format. No ambient randomness.
function randomFor(dayId, rulesVersion) {
  let seed = 2166136261;
  for (const character of `lumenfall:${rulesVersion}:${dayId}`) {
    seed = Math.imul(seed ^ character.charCodeAt(0), 16777619) >>> 0;
  }
  return () => {
    seed = (seed + 0x6D2B79F5) >>> 0;
    let value = Math.imul(seed ^ (seed >>> 15), seed | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(values, random) {
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

function connectedFloorCount(tiles) {
  const start = 6 * W + 2, queue = [start], seen = new Set(queue);
  for (let i = 0; i < queue.length; i++) {
    const index = queue[i];
    for (const next of [index - W, index + W, index - 1, index + 1]) {
      if (next >= 0 && next < tiles.length && tiles[next] === 0 && !seen.has(next)) {
        seen.add(next); queue.push(next);
      }
    }
  }
  return seen.size;
}

function generateLegacyDungeon(dayId) {
  if (!isDayId(dayId)) throw new RangeError('Invalid dungeon dayId');
  const random = randomFor(dayId, 1);
  const tiles = Array.from({ length: W * H }, (_, i) => {
    const x = i % W, y = Math.floor(i / W);
    return Number(x === 0 || y === 0 || x === W - 1 || y === H - 1);
  });
  const candidates = [];
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    // Keep a small walkable arrival area around the fixed extraction gate.
    if (!(x <= 3 && y >= 5 && y <= 7)) candidates.push(y * W + x);
  }
  let floorCount = (W - 2) * (H - 2), walls = 0;
  for (const index of shuffle(candidates, random)) {
    if (walls === 38) break;
    tiles[index] = 1;
    if (connectedFloorCount(tiles) === floorCount - 1) { floorCount--; walls++; }
    else tiles[index] = 0;
  }
  const positions = shuffle(tiles.flatMap((tile, i) => {
    const x = i % W, y = Math.floor(i / W);
    return tile === 0 && Math.abs(x - 2) + Math.abs(y - 6) >= 4 ? [{ x, y }] : [];
  }), random);
  return {
    tiles,
    enemies: positions.slice(0, 3).map((p, i) => ({ ...p, hp: [6, 8, 10][i] })),
    chests: positions.slice(3, 6),
  };
}

// Three chambers separated by wall bands, with a branching one-cell corridor.
// The arrival chamber always contains the original safe (1..3,5..7) area.
function generateRoomDungeon(dayId) {
  const random=randomFor(dayId,2),pick=(lo,hi)=>lo+Math.floor(random()*(hi-lo+1));
  const tiles=Array(W*H).fill(1);
  const arrival={x:1,y:pick(4,5),w:4,h:5};
  const top={w:pick(3,5),h:pick(3,4)};
  top.x=pick(9,W-1-top.w);top.y=pick(1,2);
  const bottom={w:pick(3,5),h:pick(3,4)};
  bottom.x=pick(9,W-1-bottom.w);bottom.y=H-1-bottom.h-pick(0,1);
  const carve=(x,y)=>{tiles[y*W+x]=0;};
  for(const r of [arrival,top,bottom])for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)carve(x,y);
  const trunk=pick(6,8),door=pick(5,7);
  const upper=pick(top.y,top.y+top.h-1),lower=pick(bottom.y,bottom.y+bottom.h-1);
  for(let x=arrival.x+arrival.w;x<=trunk;x++)carve(x,door);
  for(let y=upper;y<=lower;y++)carve(trunk,y);
  for(const [r,row] of [[top,upper],[bottom,lower]])for(let x=trunk;x<r.x;x++)carve(x,row);
  const positions=shuffle(tiles.flatMap((tile,i)=>{
    const x=i%W,y=Math.floor(i/W);
    return tile===0&&Math.abs(x-2)+Math.abs(y-6)>=4?[{x,y}]:[];
  }),random);
  return {tiles,enemies:positions.slice(0,3).map((p,i)=>({...p,hp:[6,8,10][i]})),chests:positions.slice(3,6)};
}

export function generateDungeon(dayId, rulesVersion=RULES_VERSION) {
  if(!isDayId(dayId))throw new RangeError('Invalid dungeon dayId');
  if(!SUPPORTED_RULES_VERSIONS.includes(rulesVersion))throw new RangeError('Unsupported dungeon rulesVersion');
  return rulesVersion===1?generateLegacyDungeon(dayId):generateRoomDungeon(dayId);
}

export function expeditionLabel(state, now = new Date()) {
  if (!state.dayId) return 'Gyakorló · korábbi mentés';
  if (state.rulesVersion !== RULES_VERSION) return `Gyakorló · ${state.dayId} · korábbi pályaszabály`;
  return `${state.dayId === getDayId(now) ? 'Napi pálya' : 'Gyakorló'} · ${state.dayId}`;
}
