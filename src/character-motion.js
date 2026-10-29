export const MOVE_MS = 180, ATTACK_MS = 220;

// Capture the target BEFORE step() can remove a killed enemy. No game mutation.
export function describeDirection(state, dx, dy) {
  return { kind: state.enemies.some(e => e.x === state.x + dx && e.y === state.y + dy) ? 'attack' : 'move',
    from: {x:state.x,y:state.y}, dx, dy };
}

export function motionPose(action, elapsed) {
  const duration = action.kind === 'attack' ? ATTACK_MS : MOVE_MS;
  const t = Math.max(0,Math.min(1,elapsed / duration));
  const eased = t*t*(3-2*t);
  return { x:action.from.x+(action.to.x-action.from.x)*eased,
    y:action.from.y+(action.to.y-action.from.y)*eased,dx:action.dx,dy:action.dy,
    bob:action.kind==='move'?Math.sin(t*Math.PI)*2:0,
    swing:action.kind==='attack'&&t<1?t:null };
}

export function createCharacterMotion({render, requestFrame, cancelFrame, now, reducedMotion=()=>false}) {
  let pending=null, generation=0;
  function cancel(repaint=true) {
    generation++;
    if(pending!==null){cancelFrame(pending);pending=null;}
    if(repaint)render(null);
  }
  function begin(action) {
    cancel(false);
    if(reducedMotion()||typeof requestFrame!=='function'||typeof cancelFrame!=='function') {render(null);return;}
    // Copy primitives: the subsequently mutated game state is never an animation source.
    action={...action,from:{...action.from},to:{...action.to}};
    const token=generation,start=now(),duration=action.kind==='attack'?ATTACK_MS:MOVE_MS;
    render(motionPose(action,0));
    const tick=()=>{
      if(token!==generation)return;
      pending=null;
      if(reducedMotion()||now()-start>=duration){render(null);return;}
      render(motionPose(action,now()-start));
      pending=requestFrame(tick);
    };
    pending=requestFrame(tick);
  }
  return {begin,cancel};
}
