export const W=17,H=13;
export function createGame(){
 const tiles=Array.from({length:W*H},(_,i)=>{let x=i%W,y=Math.floor(i/W);return x===0||y===0||x===W-1||y===H-1||((x===6||x===11)&&y>2&&y<10&&y!==6)?1:0;});
 return {version:1,x:2,y:6,hp:24,maxHp:24,potions:2,loot:0,bank:0,turn:0,status:'active',tiles,enemies:[{x:4,y:4,hp:6},{x:9,y:7,hp:8},{x:14,y:5,hp:10}],chests:[{x:4,y:2},{x:9,y:3},{x:14,y:9}],log:'A Lámpáscéh rád bízza az első expedíciót.'};
}
export function step(s,dx,dy){
 if(s.status!=='active'||Math.abs(dx)+Math.abs(dy)!==1)return false;
 const x=s.x+dx,y=s.y+dy;if(x<0||y<0||x>=W||y>=H||s.tiles[y*W+x])return false;
 const enemy=s.enemies.find(e=>e.x===x&&e.y===y);
 if(enemy){enemy.hp-=4;s.log='Kardcsapás: 4 sebzés.';if(enemy.hp<=0){s.enemies=s.enemies.filter(e=>e!==enemy);s.loot+=15;s.log='Őrző legyőzve! +15 kristály.';}}else{s.x=x;s.y=y;}
 const chest=s.chests.find(c=>c.x===s.x&&c.y===s.y);if(chest){s.chests=s.chests.filter(c=>c!==chest);s.loot+=30;s.log='Ősi ereklye: +30 kristály. Kijutsz vele?';}
 resolveEnemies(s);return true;
}
function resolveEnemies(s){
 s.turn++;
 for(const e of s.enemies){const distance=Math.abs(e.x-s.x)+Math.abs(e.y-s.y);
  if(distance===1){s.hp-=3;s.log='Az őrző visszavág: −3 HP.';}
  else if(distance<=5&&s.turn%2===0){const dx=Math.sign(s.x-e.x),dy=Math.sign(s.y-e.y);const options=Math.abs(s.x-e.x)>Math.abs(s.y-e.y)?[[dx,0],[0,dy]]:[[0,dy],[dx,0]];
   for(const [a,b] of options){if(!a&&!b)continue;const x=e.x+a,y=e.y+b;if(!s.tiles[y*W+x]&&!(x===s.x&&y===s.y)&&!s.enemies.some(o=>o!==e&&o.x===x&&o.y===y)){e.x=x;e.y=y;break;}}
  }
 }
 if(s.hp<=0){s.hp=0;s.loot=0;s.status='defeated';s.log='Elestél. A korábban hazavitt kristályok megmaradnak.';}
}
export function rest(s){if(s.status!=='active')return;resolveEnemies(s);}
export function heal(s){if(s.status!=='active'||!s.potions||s.hp===s.maxHp)return;s.potions--;s.hp=Math.min(s.maxHp,s.hp+10);resolveEnemies(s);}
export function extract(s){if(s.status!=='active'||s.x!==2||s.y!==6)return false;s.bank+=s.loot;s.loot=0;s.status='extracted';s.log='Sikeres kijutás! A céh megőrizte a kristályaidat.';return true;}
export function nextRun(s){const n=createGame();n.bank=s.bank;return n;}
