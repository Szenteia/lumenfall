// Original Lantern Guild head, in the existing 40px character coordinate space.
// Only exact cardinal directions select a view; unsupported input faces forward.
export function headView(dx, dy) {
  if (dx === 0 && dy === -1) return 'back';
  if (dy === 0 && dx === -1) return 'left';
  if (dy === 0 && dx === 1) return 'right';
  return 'front';
}

export function drawAdventurerHead(ctx, dx, dy) {
  const view = headView(dx, dy);
  const shape = (color, points) => {
    ctx.fillStyle = color; ctx.beginPath();
    points.forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
    ctx.closePath(); ctx.fill();
  };
  const eye = x => {
    ctx.fillStyle='#183347'; ctx.fillRect(x,-6,2,3);
    ctx.fillStyle='#f7ffff'; ctx.fillRect(x,-6,1,1);
  };
  if (view === 'back') {
    shape('#263456',[[-9,-5],[-9,-11],[-5,-15],[1,-16],[8,-12],[10,-4],[6,-1],[3,1],[0,-1],[-3,1],[-7,-1]]);
    shape('#395472',[[-6,-9],[-3,-3],[-4,0],[-7,-3]]);
    shape('#a8cadd',[[1,-15],[5,-13],[4,-10],[2,-11]]);
  } else if (view === 'left' || view === 'right') {
    // Mirror only local profile coordinates. Body, equipment and transforms stay intact.
    const side=view === 'right' ? 1 : -1;
    const profile=(color,points)=>shape(color,points.map(([x,y])=>[x*side,y]));
    profile('#f4bd91',[[-5,-11],[4,-12],[7,-8],[7,-6],[9,-3],[6,-2],[5,1],[0,2],[-5,-2]]);
    profile('#263456',[[-9,-5],[-9,-11],[-5,-15],[1,-16],[7,-12],[8,-7],[4,-9],[2,-6],[0,-10],[-2,-3],[-6,0],[-8,-2]]);
    profile('#a8cadd',[[0,-14],[4,-12],[2,-9],[-1,-6],[-1,-10]]);
    eye(view === 'right' ? 4 : -6);
  } else {
    ctx.fillStyle='#f4bd91';ctx.beginPath();ctx.ellipse(0,-6,8,8,0,0,Math.PI*2);ctx.fill();
    shape('#263456',[[-9,-5],[-9,-11],[-5,-15],[1,-16],[8,-12],[10,-4],[5,-6],[3,-11],[-1,-6],[-4,-10],[-7,-4]]);
    shape('#a8cadd',[[0,-14],[4,-13],[1,-8],[-2,-6]]);
    eye(-5);eye(3);
  }
}
