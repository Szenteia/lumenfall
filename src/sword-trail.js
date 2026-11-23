// Local blade coordinates, after its direction/swing rotation. No retained state.
export function swordTrail(swing) {
  if(!Number.isFinite(swing)||swing<=0||swing>=1)return null;
  const strength=Math.sin(Math.PI*swing),length=Math.min(1.2,2.2*swing);
  const outer=[],inner=[];
  for(let i=0;i<=12;i++) {
    const t=i/12,angle=-length*(1-t),width=5*strength*Math.sin(t*Math.PI/2);
    outer.push([24*Math.cos(angle),24*Math.sin(angle)]);
    inner.push([(24-width)*Math.cos(angle),(24-width)*Math.sin(angle)]);
  }
  return {alpha:.75*strength,points:[...outer,...inner.reverse()]};
}

export function drawSwordTrail(ctx,swing) {
  const trail=swordTrail(swing);
  if(!trail)return;
  ctx.save();
  ctx.globalAlpha=trail.alpha;ctx.fillStyle='#7fe3cf';ctx.beginPath();
  trail.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
  ctx.closePath();ctx.fill();ctx.restore();
}
