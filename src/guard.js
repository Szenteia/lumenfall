// Original Crystal Guard: code-native shapes, shared by all existing guards.
// Hit data is transient presentation only; it never changes an enemy or the game.
export function drawGuard(ctx, enemy, hit=null, size=40, stride=0) {
  const gait=Number.isFinite(stride)?Math.max(-1,Math.min(1,stride)):0;
  const hem=gait*1.5,foot=gait*2;
  const strength=hit?.survived&&hit.x===enemy.x&&hit.y===enemy.y?hit.strength:0;
  ctx.save();ctx.translate((enemy.x+.5)*size,(enemy.y+.5)*size);ctx.scale(size/40,size/40);
  const polygon=(color,points)=>{ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();};
  // Shadow and HP stay anchored while the body recoils at most two pixels.
  ctx.fillStyle='#090d1880';ctx.beginPath();ctx.ellipse(0,12,12,3,0,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.translate((hit?.dx||0)*strength*2,(hit?.dy||0)*strength*2);
  polygon('#33243f',[[-8,-1],[8,-1],[13+hem,11],[4+hem,10],[hem,12],[-12+hem,10]]);
  polygon('#805978',[[-8,0],[-2,4],[hem,11],[-9+hem,9]]);
  polygon('#a36d8b',[[8,0],[2,4],[hem,11],[10+hem,9]]);
  ctx.fillStyle='#1b2333';ctx.fillRect(-7,9-foot,5,3);ctx.fillRect(3,9+foot,5,3);
  polygon('#546174',[[-8,-2],[8,-2],[6,8],[-6,8]]);
  polygon('#8f9aad',[[-6,-1],[0,2],[6,-1],[4,5],[-4,5]]);
  // Angular helmet, rose crystal crest, visor: a distinct chibi silhouette.
  polygon('#b789a2',[[-10,-10],[-7,-15],[-3,-13],[0,-16],[3,-13],[7,-15],[10,-10],[9,1],[5,3],[-5,3],[-9,1]]);
  polygon('#364257',[[-8,-10],[-5,-13],[0,-11],[5,-13],[8,-10],[7,-1],[0,2],[-7,-1]]);
  polygon('#e8a9bc',[[-2,-12],[0,-16],[2,-12],[0,-8]]);
  polygon('#172032',[[-7,-6],[0,-4],[7,-6],[6,-1],[-6,-1]]);
  ctx.fillStyle='#efa6bb';ctx.fillRect(-5,-5,3,2);ctx.fillRect(2,-5,3,2);
  polygon('#d996b4',[[0,3],[3,5],[0,8],[-3,5]]);
  if(strength>0){ctx.globalAlpha=.3*strength;polygon('#f4c5d5',[[-9,-11],[0,-16],[9,-11],[9,9],[-9,9]]);}
  ctx.restore();
  ctx.fillStyle='#18202c';ctx.fillRect(-11,14,22,4);
  ctx.fillStyle='#e9a2a9';ctx.fillRect(-10,15,enemy.hp*2,2);
  ctx.restore();
}

export function drawGuardImpact(ctx, hit, size=40) {
  if(!hit||hit.strength<=0)return;
  ctx.save();ctx.translate((hit.x+.5)*size,(hit.y+.5)*size);ctx.scale(size/40,size/40);
  ctx.globalAlpha=hit.strength*.8;ctx.strokeStyle='#efb6cd';ctx.lineWidth=2;
  // Four short rays, not a pickup-shaped diamond or a full-cell warning frame.
  for(const [x,y]of [[-1,0],[1,0],[0,-1],[0,1]]){
    ctx.beginPath();ctx.moveTo(x*10,y*10);ctx.lineTo(x*15,y*15);ctx.stroke();
  }
  ctx.restore();
}
