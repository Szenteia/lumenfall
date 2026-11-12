// Reproducible structural preview; no game/runtime integration.
import {writeFileSync} from 'node:fs';
import {generateExpandedDungeon} from '../src/expanded-dungeon.js';
const days=['2026-11-08','2026-11-09','2026-11-10'],cell=20;
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="1340" height="410" viewBox="0 0 1340 410"><rect width="1340" height="410" fill="#10131e"/><g font-family="sans-serif" fill="#e9e4d6"><text x="20" y="26" font-size="18">Expanded ring v1 — 21 × 15 · structural preview</text><text x="20" y="392" font-size="14">Blue: rooms · Gold: corridors · G: gate · E: guard · C: chest</text></g>';
for(const [n,day] of days.entries()){
 const m=generateExpandedDungeon(day),ox=20+n*440,oy=70;
 svg+=`<text x="${ox}" y="55" fill="#e9e4d6" font-family="sans-serif">${day}</text>`;
 const corridor=new Set(m.corridors.flatMap(c=>c.cells.map(p=>p.y*21+p.x)));
 m.tiles.forEach((tile,i)=>{svg+=`<rect x="${ox+i%21*cell}" y="${oy+Math.floor(i/21)*cell}" width="19" height="19" fill="${tile?'#25303e':corridor.has(i)?'#95733a':'#3a7084'}"/>`;});
 for(const [items,label,color] of [[m.enemies,'E','#ffbbc0'],[m.chests,'C','#fff4a3'],[[{x:2,y:6}],'G','#a4ffe1']])for(const p of items)svg+=`<text x="${ox+p.x*cell+10}" y="${oy+p.y*cell+15}" fill="${color}" font-family="sans-serif" font-weight="bold" font-size="14" text-anchor="middle">${label}</text>`;
}
writeFileSync(new URL('../docs/EXPANDED_DUNGEON_PREVIEW.svg',import.meta.url),svg+'</svg>');
