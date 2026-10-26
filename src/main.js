import{mountTransfer}from'./transfer-view.js';
import{previewWait}from'./tactics.js';
import{mountWaitPreview,drawWaitTargets}from'./tactics-view.js';
import{W,H,createGame,step,heal,rest,extract,nextRun}from'./game.js';
import{expeditionLabel}from'./daily.js';
import{SAVE_KEY,restoreGame}from'./save.js';
const $=s=>document.querySelector(s),key=SAVE_KEY;let state=null,saveError=false;
try{state=restoreGame(localStorage.getItem(key));}catch{}
state ??= createGame();
const canvas=$('#game'),ctx=canvas.getContext('2d'),size=40;canvas.width=W*size;canvas.height=H*size;
const renderWaitPreview=mountWaitPreview($('#wait'));
function save(){try{localStorage.setItem(key,JSON.stringify(state));saveError=false;}catch{saveError=true;}}
function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);
 $('#expedition').textContent=expeditionLabel(state);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const wall=state.tiles[y*W+x];ctx.fillStyle=wall?'#293746':(x+y)%2?'#161f2c':'#1a2532';ctx.fillRect(x*size+1,y*size+1,size-2,size-2);if(wall){ctx.fillStyle='#3b4a59';ctx.fillRect(x*size+1,y*size+1,size-2,4);}}
 const forecast=previewWait(state);renderWaitPreview(forecast);drawWaitTargets(ctx,forecast,size);
 const glyph=(x,y,text,color)=>{ctx.fillStyle=color;ctx.font='25px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,x*size+size/2,y*size+size/2);};
 glyph(2,6,'◎','#7fe3cf');for(const c of state.chests)glyph(c.x,c.y,'◆','#edc473');for(const e of state.enemies){glyph(e.x,e.y,'♟','#dd7c87');ctx.fillStyle='#e9a2a9';ctx.fillRect(e.x*size+9,e.y*size+34,e.hp*2,3);}glyph(state.x,state.y,'♜','#d5ecef');
 $('#health').textContent=`♥ ${state.hp}/${state.maxHp} · Ital: ${state.potions}`;$('#loot').textContent=`◆ Zsákmány: ${state.loot}`;$('#bank').textContent=`✦ Céhkincstár: ${state.bank}`;$('#log').textContent=saveError?'A mentés nem sikerült. Engedélyezd a böngésző helyi tárolóját.':state.log;
 $('#next').hidden=state.status==='active';$('#extract').disabled=state.status!=='active'||state.x!==2||state.y!==6;$('#heal').disabled=state.status!=='active'||state.potions===0||state.hp===state.maxHp;$('#wait').disabled=state.status!=='active';
}
const transfer=mountTransfer({getState:()=>state,applyState:loaded=>{state=loaded;saveError=false;draw();},storage:()=>localStorage,parent:$('aside')});
function act(fn){if($('#paused').open||transfer.isOpen())return;fn();save();draw();}
const dirs={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
window.addEventListener('keydown',e=>{if(transfer.isOpen()||$('#paused').open)return;if(e.repeat||e.altKey||e.ctrlKey||e.metaKey)return;const dir=dirs[e.key]||dirs[e.key.toLowerCase()];if(dir){e.preventDefault();act(()=>step(state,...dir));}});
document.querySelectorAll('[data-dir]').forEach(b=>b.onclick=()=>act(()=>step(state,...b.dataset.dir.split(',').map(Number))));
$('#heal').onclick=()=>act(()=>heal(state));$('#wait').onclick=()=>act(()=>rest(state));$('#extract').onclick=()=>act(()=>extract(state));$('#next').onclick=()=>act(()=>{state=nextRun(state);});
$('#pause').onclick=()=>{save();draw();$('#saveState').textContent=saveError?'A mentés nem sikerült; ne zárd be ezt a lapot.':'Elmentve. Ezen az eszközön és böngészőben innen folytathatod.';$('#paused').showModal();};$('#resume').onclick=()=>{$('#paused').close();draw();};document.addEventListener('visibilitychange',()=>{if(document.hidden){save();if(!$('#paused').open&&!transfer.isOpen())$('#paused').showModal();}else draw();});save();draw();



