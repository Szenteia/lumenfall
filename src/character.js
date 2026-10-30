// Original Lantern Guild adventurer. All coordinates are local to a 40 px cell.
// No fonts, images, state mutations, or platform-specific glyphs.
export function drawAdventurer(ctx, {x, y, dx = 0, dy = 1, bob = 0, swing = null}, size = 40) {
  ctx.save();
  ctx.translate((x + .5) * size, (y + .5) * size);
  ctx.scale(size / 40, size / 40);
  const shape = (color, points) => {
    ctx.fillStyle = color; ctx.beginPath();
    points.forEach(([a,b],i) => i ? ctx.lineTo(a,b) : ctx.moveTo(a,b));
    ctx.closePath(); ctx.fill();
  };
  const oval = (color, x, y, rx, ry) => {
    ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.fill();
  };
  oval('#0b111c99',0,14,12,3);
  ctx.translate(0,-bob);
  // Split cape and boots leave a readable silhouette at small scale.
  shape('#133e54',[[-8,-1],[8,-1],[12,13],[2,11],[0,14],[-12,12]]);
  shape('#279eaa',[[-7,0],[0,4],[7,0],[9,10],[2,8],[0,11],[-9,10]]);
  ctx.fillStyle='#172336';ctx.fillRect(-6,10,4,5);ctx.fillRect(3,10,4,5);
  shape('#e4e9ef',[[-6,0],[6,0],[5,9],[-5,9]]);
  ctx.fillStyle='#395472';ctx.fillRect(-5,7,10,3);
  oval('#f4bd91',0,-6,8,8);
  // Asymmetric midnight-blue hair with a silver forelock; no borrowed character design.
  shape('#263456',[[-9,-5],[-9,-11],[-5,-15],[1,-16],[8,-12],[10,-4],[5,-6],[3,-11],[-1,-6],[-4,-10],[-7,-4]]);
  shape('#a8cadd',[[0,-14],[4,-13],[1,-8],[-2,-6]]);
  if (dy < 0) oval('#263456',0,-5,7,6);
  else {
    ctx.fillStyle='#183347';ctx.fillRect(-5+(dx>0?1:0),-6,2,3);ctx.fillRect(3+(dx<0?-1:0),-6,2,3);
    ctx.fillStyle='#f7ffff';ctx.fillRect(-5+(dx>0?1:0),-6,1,1);ctx.fillRect(3+(dx<0?-1:0),-6,1,1);
  }
  shape('#f3cf7d',[[-3,1],[0,-1],[3,1],[0,4]]);
  // Compact lantern and sheathed blade stay within this cell when idle.
  ctx.strokeStyle='#e8c16a';ctx.lineWidth=1.5;ctx.strokeRect(-13,2,5,8);
  ctx.fillStyle='#ffe7a1';ctx.fillRect(-12,4,3,4);
  shape('#b8dee6',[[10,-1],[13,-6],[13,8],[11,10]]);
  ctx.fillStyle='#d9ad62';ctx.fillRect(8,7,7,2);
  if (swing !== null) {
    ctx.save();ctx.rotate(Math.atan2(dy,dx));
    const angle=-1.1+swing*2.2;
    ctx.rotate(angle);
    shape('#d5ffff',[[6,-2],[21,-1],[24,0],[21,2],[6,2]]);
    ctx.fillStyle='#e6bc69';ctx.fillRect(6,-4,2,8);
    ctx.strokeStyle='#7fe3cf';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,21,-.6,.6);ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
