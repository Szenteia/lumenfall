// Original cosmetic palettes; combat indicators retain their shared colors.
const GUARD_PALETTES=Object.freeze({
crystal:Object.freeze({cape:'#33243f',capeLeft:'#805978',capeRight:'#a36d8b',armor:'#546174',armorLight:'#8f9aad',helmet:'#b789a2',helmetShade:'#364257',crest:'#e8a9bc',eyes:'#efa6bb',badge:'#d996b4'}),
mist:Object.freeze({cape:'#193b49',capeLeft:'#397d86',capeRight:'#56a4ac',armor:'#637e92',armorLight:'#b0cbd6',helmet:'#92bec6',helmetShade:'#304b60',crest:'#b6f4e5',eyes:'#a6e8da',badge:'#76cdbd'}),
amber:Object.freeze({cape:'#483124',capeLeft:'#95653d',capeRight:'#bd8751',armor:'#8d7052',armorLight:'#d9b47d',helmet:'#cda16c',helmetShade:'#58402c',crest:'#ffe0a2',eyes:'#ffd084',badge:'#e2b561'}),
});
// Original Crystal Guard: code-native shapes, shared by all existing guards.
// Hit data is transient presentation only; it never changes an enemy or the game.
export function drawGuard(ctx, enemy, hit=null, size=40, stride=0, theme=null, attack=null) {
  const gait=Number.isFinite(stride)?Math.max(-1,Math.min(1,stride)):0;
  const hem=gait*1.5,foot=gait*2;
  const palette=Object.hasOwn(GUARD_PALETTES,theme?.id)?GUARD_PALETTES[theme.id]:GUARD_PALETTES.crystal;
  const strength=hit?.survived&&hit.x===enemy.x&&hit.y===enemy.y?hit.strength:0;
  ctx.save();ctx.translate((enemy.x+.5)*size,(enemy.y+.5)*size);ctx.scale(size/40,size/40);
  const polygon=(color,points)=>{ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();};
  // Shadow and HP stay anchored; combined recoil/lunge is capped at four pixels.
  ctx.fillStyle='#090d1880';ctx.beginPath();ctx.ellipse(0,12,12,3,0,0,Math.PI*2);ctx.fill();
  const lunge=Number.isFinite(attack?.strength)?Math.max(0,Math.min(1,attack.strength)):0;
  const cardinal=Math.abs(attack?.dx)+Math.abs(attack?.dy)===1;
  const offsetX=(hit?.dx||0)*strength*2+(cardinal?attack.dx*lunge*4:0);
  const offsetY=(hit?.dy||0)*strength*2+(cardinal?attack.dy*lunge*4:0);
  const cap=Math.max(1,Math.hypot(offsetX,offsetY)/4);
  ctx.save();ctx.translate(offsetX/cap,offsetY/cap);
  polygon(palette.cape,[[-8,-1],[8,-1],[13+hem,11],[4+hem,10],[hem,12],[-12+hem,10]]);
  polygon(palette.capeLeft,[[-8,0],[-2,4],[hem,11],[-9+hem,9]]);
  polygon(palette.capeRight,[[8,0],[2,4],[hem,11],[10+hem,9]]);
  ctx.fillStyle='#1b2333';ctx.fillRect(-7,9-foot,5,3);ctx.fillRect(3,9+foot,5,3);
  polygon(palette.armor,[[-8,-2],[8,-2],[6,8],[-6,8]]);
  polygon(palette.armorLight,[[-6,-1],[0,2],[6,-1],[4,5],[-4,5]]);
  // Angular helmet, rose crystal crest, visor: a distinct chibi silhouette.
  polygon(palette.helmet,[[-10,-10],[-7,-15],[-3,-13],[0,-16],[3,-13],[7,-15],[10,-10],[9,1],[5,3],[-5,3],[-9,1]]);
  polygon(palette.helmetShade,[[-8,-10],[-5,-13],[0,-11],[5,-13],[8,-10],[7,-1],[0,2],[-7,-1]]);
  polygon(palette.crest,[[-2,-12],[0,-16],[2,-12],[0,-8]]);
  polygon('#172032',[[-7,-6],[0,-4],[7,-6],[6,-1],[-6,-1]]);
  ctx.fillStyle=palette.eyes;ctx.fillRect(-5,-5,3,2);ctx.fillRect(2,-5,3,2);
  polygon(palette.badge,[[0,3],[3,5],[0,8],[-3,5]]);
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
