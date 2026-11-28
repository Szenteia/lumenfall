// Identity lives only across one real action, never in game state or a save.
export function captureGuards(state) {
  return {state, turn:state.turn, active:state.status==='active', positions:new Map(state.enemies.map(enemy=>[enemy,{x:enemy.x,y:enemy.y}]))};
}

export function describeSceneMotion(before, state, playerAction, facing) {
  if(before.state!==state)return null; // Import/new expedition is not movement.
  const guards=[],guardAttacks=[];
  const resolved=before.active&&state.turn===before.turn+1;
  for(const enemy of state.enemies){
    const from=before.positions.get(enemy);
    if(from&&(from.x!==enemy.x||from.y!==enemy.y))guards.push({enemy,from:{...from},to:{x:enemy.x,y:enemy.y}});
    // resolveEnemies attacks before moving: an unchanged survivor adjacent to
    // the final player position attacked. Movers never attack in that same turn.
    else if(from&&resolved&&Math.abs(enemy.x-state.x)+Math.abs(enemy.y-state.y)===1)
      guardAttacks.push({enemy,dx:state.x-enemy.x,dy:state.y-enemy.y});
  }
  if(!playerAction?.kind&&!guards.length&&!guardAttacks.length)return null;
  return {...(playerAction?.kind?playerAction:{kind:'guards',from:{x:state.x,y:state.y},to:{x:state.x,y:state.y},...facing}),guards,guardAttacks};
}

// Translate the existing renderer as a whole, including its HP bar. The callback
// still receives the real enemy, so hit matching and existing art stay intact.
export function drawMovingGuard(ctx, enemy, pose, size, draw) {
  const position=pose?.guards?.find(p=>p.enemy===enemy);
  if(!position){draw();return;}
  ctx.save();
  try{ctx.translate((position.x-enemy.x)*size,(position.y-enemy.y)*size);draw(position.stride);}
  finally{ctx.restore();}
}
