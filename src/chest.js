// Original relic coffer, shared silhouette with environment-specific enamel.
const PALETTES=Object.freeze({
  mist:Object.freeze({body:'#355968',lid:'#588392',metal:'#d7bb7f',rune:'#b9f4ed'}),
  amber:Object.freeze({body:'#624329',lid:'#92643b',metal:'#efd08c',rune:'#fff1bd'}),
  crystal:Object.freeze({body:'#4d3b68',lid:'#786096',metal:'#d6b7df',rune:'#c9f4ff'}),
});
export function drawChest(ctx,chest,theme,size=40){
  const p=PALETTES[theme?.id]||PALETTES.mist;
  ctx.save();ctx.translate((chest.x+.5)*size,(chest.y+.5)*size);ctx.scale(size/40,size/40);
  const polygon=(color,points)=>{ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();};
  ctx.fillStyle='#090d1880';ctx.beginPath();ctx.ellipse(0,11,13,3,0,0,Math.PI*2);ctx.fill();
  // Compact outline leaves the outer five pixels free for tactical markers.
  polygon('#111622',[[-13,-7],[-9,-12],[9,-12],[13,-7],[13,10],[-13,10]]);
  ctx.fillStyle=p.body;ctx.fillRect(-11,-3,22,11);
  polygon(p.lid,[[-11,-6],[-8,-10],[8,-10],[11,-6],[11,-2],[-11,-2]]);
  ctx.fillStyle=p.metal;ctx.fillRect(-9,-9,2,16);ctx.fillRect(7,-9,2,16);
  ctx.fillStyle='#111622';ctx.fillRect(-11,-2,22,2);ctx.fillRect(-4,-3,8,9);
  ctx.fillStyle=p.metal;ctx.fillRect(-3,-2,6,7);
  ctx.fillStyle='#111622';ctx.fillRect(-1,0,2,3);
  // A forked rune (not a diamond pickup glyph) on the lid.
  ctx.strokeStyle=p.rune;ctx.lineWidth=1.5;ctx.beginPath();
  ctx.moveTo(0,-4);ctx.lineTo(0,-9);ctx.moveTo(-3,-8);ctx.lineTo(0,-6);ctx.lineTo(3,-8);ctx.stroke();
  ctx.restore();
}
