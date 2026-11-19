// Identity lives only across one real action, never in game state or a save.
export function captureGuards(state) {
  return {state, positions:new Map(state.enemies.map(enemy=>[enemy,{x:enemy.x,y:enemy.y}]))};
}

export function describeSceneMotion(before, state, playerAction, facing) {
  if(before.state!==state)return null; // Import/new expedition is not movement.
  const guards=[];
  for(const enemy of state.enemies){
    const from=before.positions.get(enemy);
    if(from&&(from.x!==enemy.x||from.y!==enemy.y))guards.push({enemy,from:{...from},to:{x:enemy.x,y:enemy.y}});
  }
  if(!playerAction?.kind&&!guards.length)return null;
  return {...(playerAction?.kind?playerAction:{kind:'guards',from:{x:state.x,y:state.y},to:{x:state.x,y:state.y},...facing}),guards};
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
