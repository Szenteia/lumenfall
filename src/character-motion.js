export const MOVE_MS = 180, ATTACK_MS = 220;

// Capture the target BEFORE step() can remove a killed enemy. No game mutation.
export function describeDirection(state, dx, dy) {
  const target=state.enemies.find(e => e.x === state.x + dx && e.y === state.y + dy);
  return { kind: target ? 'attack' : 'move', target:target?{x:target.x,y:target.y}:null,
    from: {x:state.x,y:state.y}, dx, dy };
}

export function motionPose(action, elapsed) {
  const duration = action.kind === 'attack' ? ATTACK_MS : MOVE_MS;
  const t = Math.max(0,Math.min(1,elapsed / duration));
  const eased = t*t*(3-2*t);
  return { x:action.from.x+(action.to.x-action.from.x)*eased,
    y:action.from.y+(action.to.y-action.from.y)*eased,dx:action.dx,dy:action.dy,
    bob:action.kind==='move'?Math.sin(t*Math.PI)*2:0,
    stride:action.kind==='move'&&(action.from.x!==action.to.x||action.from.y!==action.to.y)&&t>0&&t<1?Math.sin(t*Math.PI*2):0,
    swing:action.kind==='attack'&&t<1?t:null,
    guards:(action.guards||[]).map(({enemy,from,to})=>{
      const progress=Math.max(0,Math.min(1,elapsed/MOVE_MS)),ease=progress*progress*(3-2*progress);
      return {enemy,x:from.x+(to.x-from.x)*ease,y:from.y+(to.y-from.y)*ease};
    }),
    hit:action.kind==='attack'&&action.hit&&t<1?{...action.hit,dx:action.dx,dy:action.dy,strength:Math.sin(t*Math.PI)}:null };
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
    action={...action,from:{...action.from},to:{...action.to},hit:action.hit?{...action.hit}:null};
    action.guards=(action.guards||[]).map(g=>({...g,from:{...g.from},to:{...g.to}}));
    if(action.kind==='guards'&&!action.guards.length){render(null);return;}
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
