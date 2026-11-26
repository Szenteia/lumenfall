import {writeFileSync} from 'node:fs';
import {generateHallDungeon} from '../src/hall-dungeon.js';
const days=['2026-11-25','2026-11-26','2026-11-27'],cell=16;
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="420" viewBox="0 0 1280 420"><rect width="1280" height="420" fill="#10131e"/><g font-family="sans-serif" fill="#e9e4d6"><text x="20" y="26" font-size="18">Hall v1 — 25 × 19 · structural prototype (not live gameplay)</text><text x="20" y="400" font-size="14">Blue: outer rooms · Teal: central hall · Gold: corridors · G: gate · E: guard · C: chest</text></g>';
for(const [n,day] of days.entries()){
 const m=generateHallDungeon(day),ox=20+n*420,oy=70;
 svg+=`<text x="${ox}" y="55" fill="#e9e4d6" font-family="sans-serif">${day}</text>`;
 const corridors=new Set(m.corridors.flatMap(c=>c.cells.map(p=>p.y*m.width+p.x))),hall=m.rooms[4];
 m.tiles.forEach((tile,i)=>{const x=i%m.width,y=Math.floor(i/m.width),central=x>=hall.x&&x<hall.x+hall.w&&y>=hall.y&&y<hall.y+hall.h;svg+=`<rect x="${ox+x*cell}" y="${oy+y*cell}" width="15" height="15" fill="${tile?'#25303e':corridors.has(i)?'#95733a':central?'#258f82':'#3a7084'}"/>`;});
 for(const [items,label,color] of [[m.enemies,'E','#ffbbc0'],[m.chests,'C','#fff4a3'],[[{x:2,y:6}],'G','#a4ffe1']])for(const p of items)svg+=`<text x="${ox+p.x*cell+8}" y="${oy+p.y*cell+12}" fill="${color}" font-family="sans-serif" font-weight="bold" font-size="12" text-anchor="middle">${label}</text>`;
}
writeFileSync(new URL('../docs/HALL_DUNGEON_PREVIEW.svg',import.meta.url),svg+'</svg>');
