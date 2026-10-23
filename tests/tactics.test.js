import { test } from 'node:test';
import assert from 'node:assert/strict';
import { W, H, rest, createGame, step } from '../src/game.js';
import { previewWait, waitSummary } from '../src/tactics.js';
import { drawWaitTargets } from '../src/tactics-view.js';

function arena({ enemies = [], turn = 1, hp = 20, status = 'active' } = {}) {
  return { version: 1, x: 8, y: 6, hp, maxHp: 24, potions: 2, loot: 30, bank: 75,
    turn, status, log: 'Teszt', chests: [{ x: 3, y: 3 }], enemies,
    tiles: Array.from({ length: W * H }, (_, i) => Number(i % W === 0 || i % W === W - 1 || i < W || i >= (H - 1) * W)),
  };
}
const enemy = (x, y) => ({ x, y, hp: 8 });

function assertActualWait(state, preview) {
  const actual = JSON.parse(JSON.stringify(state));
  rest(actual);
  assert.equal(actual.hp, preview.hpAfter);
  assert.deepEqual(actual.enemies, preview.enemiesAfter);
  assert.equal(actual.status === 'defeated', preview.fatal);
}

test('No nearby guard means no damage or marked destination', () => {
  const state = arena({ enemies: [enemy(15, 11)] });
  const result = previewWait(state);
  assert.equal(result.damage, 0); assert.equal(result.hpAfter, 20);
  assert.deepEqual(result.moves, []); assert.equal(result.fatal, false);
  assertActualWait(state, result);
});

test('Adjacent guards predict one and two attacks precisely', () => {
  for (const [enemies, expected] of [[[enemy(8,5)],17],[[enemy(8,5),enemy(8,7)],14]]) {
    const state = arena({ enemies }), result = previewWait(state);
    assert.equal(result.hpAfter, expected); assert.equal(result.damage,20-expected);
    assert.deepEqual(result.moves, []); assertActualWait(state, result);
  }
});

test('Movement happens on the next even turn and marks only the destination', () => {
  const state = arena({ enemies: [enemy(10,6)] }), result = previewWait(state);
  assert.equal(result.damage,0);
  assert.deepEqual(result.moves,[{index:0,from:{x:10,y:6},to:{x:9,y:6}}]);
  assertActualWait(state,result);
  state.turn = 0;
  assert.deepEqual(previewWait(state).moves,[]);
  assertActualWait(state,previewWait(state));
});

test('Walls and another guard block the forecast just as they block the real turn', () => {
  const wall = arena({enemies:[enemy(10,6)]}); wall.tiles[6*W+9]=1;
  assert.deepEqual(previewWait(wall).moves,[]); assertActualWait(wall,previewWait(wall));
  const occupied=arena({enemies:[enemy(9,6),enemy(10,6)]});
  assert.deepEqual(previewWait(occupied).moves,[]); assert.equal(previewWait(occupied).damage,3);
  assertActualWait(occupied,previewWait(occupied));
});

test('A blocked primary direction uses the real alternative route', () => {
  const state=arena({enemies:[enemy(10,7)]}); state.tiles[7*W+9]=1;
  const result=previewWait(state);
  assert.deepEqual(result.moves,[{index:0,from:{x:10,y:7},to:{x:10,y:6}}]);
  assertActualWait(state,result);
});

test('Sequential guard moves use vacated cells without colliding', () => {
  const state=arena({enemies:[enemy(10,6),enemy(11,6)]}), result=previewWait(state);
  assert.deepEqual(result.enemiesAfter.map(({x,y})=>[x,y]),[[9,6],[10,6]]);
  assert.equal(result.moves.length,2); assertActualWait(state,result);
});

test('Fatal forecast reports actual HP loss and explicitly warns in text', () => {
  const state=arena({hp:2,enemies:[enemy(8,5),enemy(8,7)]}), result=previewWait(state);
  assert.equal(result.hpAfter,0); assert.equal(result.damage,2); assert.equal(result.fatal,true);
  assert.match(waitSummary(result),/VÉGZETES/); assert.match(waitSummary(result),/−2 HP/);
  assertActualWait(state,result);
});

test('Extracted and defeated runs have no active forecast', () => {
  for(const status of ['extracted','defeated']) assert.equal(previewWait(arena({status})),null);
  assert.equal(waitSummary(null),'');
});

test('Repeated forecasts do not mutate deeply frozen v1 or v2 saved states', () => {
  const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
  for(const version of [1,2]) {
    const state=arena({enemies:[enemy(10,6)]});
    if(version===2) Object.assign(state,{version,dayId:'2026-10-23',rulesVersion:1});
    const before=JSON.stringify(state); freeze(state);
    const a=previewWait(state), b=previewWait(state);
    assert.deepEqual(a,b); assert.equal(JSON.stringify(state),before);
    a.enemiesAfter[0].hp=1; a.moves[0].to.x=1;
    assert.equal(state.enemies[0].hp,8); assert.deepEqual(previewWait(state),b);
    assertActualWait(state,b);
  }
});

test('Real expeditions match the forecast through a sequence of turns', () => {
  const state=createGame();
  for(let i=0;i<16&&state.status==='active';i++) {
    assertActualWait(state,previewWait(state));
    if(i%3===0) step(state,1,0); else rest(state);
  }
});

test('Canvas overlay draws only moved guard destinations and restores its context', () => {
  const calls=[];
  const ctx={save:()=>calls.push('save'),restore:()=>calls.push('restore'),setLineDash:x=>calls.push(x),strokeRect:(...x)=>calls.push(x)};
  drawWaitTargets(ctx,null,40); assert.deepEqual(calls,[]);
  drawWaitTargets(ctx,previewWait(arena()),40); assert.deepEqual(calls,[]);
  drawWaitTargets(ctx,previewWait(arena({enemies:[enemy(10,6)]})),40);
  assert.deepEqual(calls,['save',[4,3],[365,245,30,30],'restore']);
});
