// Original Lantern Guild exit. Static geometry, local to one 40 px tile.
const PALETTES=Object.freeze({
 mist:Object.freeze({stone:'#526a75',edge:'#172b39',rune:'#a4f0da'}),
 amber:Object.freeze({stone:'#897252',edge:'#3b2c23',rune:'#ffe0a0'}),
 crystal:Object.freeze({stone:'#706181',edge:'#29213d',rune:'#b9eaff'}),
});
export function drawRuneGate(ctx,theme,size=40) {
 const p=PALETTES[theme?.id]||PALETTES.mist;
 ctx.save();ctx.translate(2*size,6*size);ctx.scale(size/40,size/40);
 ctx.fillStyle=p.edge;ctx.beginPath();ctx.ellipse(20,25,16,11,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle=p.stone;ctx.lineWidth=4;ctx.beginPath();ctx.arc(20,20,13,Math.PI,Math.PI*2);ctx.stroke();
 ctx.fillStyle=p.stone;ctx.fillRect(5,19,6,14);ctx.fillRect(29,19,6,14);
 ctx.fillStyle=p.edge;ctx.fillRect(6,24,4,2);ctx.fillRect(30,24,4,2);
 ctx.strokeStyle=p.rune;ctx.lineWidth=1.5;ctx.beginPath();
 ctx.moveTo(20,15);ctx.lineTo(20,29);ctx.moveTo(14,19);ctx.lineTo(20,23);ctx.lineTo(26,19);
 ctx.moveTo(15,30);ctx.lineTo(20,27);ctx.lineTo(25,30);ctx.stroke();
 ctx.fillStyle=p.rune;ctx.fillRect(7,20,2,3);ctx.fillRect(31,20,2,3);
 ctx.restore();
}
