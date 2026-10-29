import{drawAdventurer}from'./character.js';
import{createCharacterMotion,describeDirection}from'./character-motion.js';
import{readStartup}from'./recovery.js';
import{mountRecovery}from'./recovery-view.js';
import{mountTransfer}from'./transfer-view.js';
import{previewWait}from'./tactics.js';
import{mountWaitPreview,drawWaitTargets}from'./tactics-view.js';
import{W,H,createGame,step,heal,rest,extract,nextRun}from'./game.js';
import{expeditionLabel}from'./daily.js';
import{SAVE_KEY}from'./save.js';
import{mountGateDistance}from'./gate-view.js';
import{mountMovementPreview}from'./movement-view.js';
const $=s=>document.querySelector(s),key=SAVE_KEY;
const startup=readStartup(()=>localStorage);
let state=startup.kind==='valid'?startup.state:startup.kind==='missing'?createGame():null,saveError=false;
const canvas=$('#game'),ctx=canvas.getContext('2d'),size=40;canvas.width=W*size;canvas.height=H*size;
const renderWaitPreview=mountWaitPreview($('#wait'));
const renderGateDistance=mountGateDistance($('#extract'));
const renderMovementPreview=mountMovementPreview($('#heal'));
function save(){if(!state)return;try{localStorage.setItem(key,JSON.stringify(state));saveError=false;}catch{saveError=true;}}
let forecast=null,facing={dx:0,dy:1};
const motionPreference=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
const motion=createCharacterMotion({render:drawScene,
 requestFrame:globalThis.requestAnimationFrame?.bind(globalThis),
 cancelFrame:globalThis.cancelAnimationFrame?.bind(globalThis),
 now:()=>performance.now(),reducedMotion:()=>document.hidden||!!motionPreference?.matches});
motionPreference?.addEventListener?.('change',()=>motion.cancel());
function drawScene(pose=null){
 ctx.clearRect(0,0,canvas.width,canvas.height);
 if(!state)return;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const wall=state.tiles[y*W+x];ctx.fillStyle=wall?'#293746':(x+y)%2?'#161f2c':'#1a2532';ctx.fillRect(x*size+1,y*size+1,size-2,size-2);if(wall){ctx.fillStyle='#3b4a59';ctx.fillRect(x*size+1,y*size+1,size-2,4);}}
 drawWaitTargets(ctx,forecast,size);
 const glyph=(x,y,text,color)=>{ctx.fillStyle=color;ctx.font='25px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,x*size+size/2,y*size+size/2);};
 glyph(2,6,'◎','#7fe3cf');for(const c of state.chests)glyph(c.x,c.y,'◆','#edc473');for(const e of state.enemies){glyph(e.x,e.y,'♟','#dd7c87');ctx.fillStyle='#e9a2a9';ctx.fillRect(e.x*size+9,e.y*size+34,e.hp*2,3);}drawAdventurer(ctx,pose||{x:state.x,y:state.y,...facing},size);
}
function draw(){
 motion.cancel(false);
 if(!state){drawScene();$('#log').textContent='A játék a korábbi mentés védelme miatt vár.';return;}
 renderGateDistance(state);renderMovementPreview(state);
 $('#expedition').textContent=expeditionLabel(state);
 forecast=previewWait(state);renderWaitPreview(forecast);
 drawScene();
 $('#health').textContent=`♥ ${state.hp}/${state.maxHp} · Ital: ${state.potions}`;$('#loot').textContent=`◆ Zsákmány: ${state.loot}`;$('#bank').textContent=`✦ Céhkincstár: ${state.bank}`;$('#log').textContent=saveError?'A mentés nem sikerült. Engedélyezd a böngésző helyi tárolóját.':state.log;
 $('#next').hidden=state.status==='active';$('#extract').disabled=state.status!=='active'||state.x!==2||state.y!==6;$('#heal').disabled=state.status!=='active'||state.potions===0||state.hp===state.maxHp;$('#wait').disabled=state.status!=='active';
}
let transfer={isOpen:()=>false},transferMounted=false;
function ensureTransfer(){if(transferMounted)return;transfer=mountTransfer({getState:()=>state,applyState:loaded=>{state=loaded;facing={dx:0,dy:1};saveError=false;draw();},storage:()=>localStorage,onOpen:()=>motion.cancel(),parent:$('aside')});transferMounted=true;}
if(state)ensureTransfer();
function act(fn){if(!state||$('#paused').open||transfer.isOpen())return;motion.cancel(false);const animation=fn();save();draw();if(animation?.kind)motion.begin(animation);}
function move(dx,dy){act(()=>{const animation=describeDirection(state,dx,dy);if(!step(state,dx,dy))return;facing={dx,dy};return {...animation,to:{x:state.x,y:state.y}};});}
const dirs={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
window.addEventListener('keydown',e=>{if(!state||transfer.isOpen()||$('#paused').open)return;if(e.repeat||e.altKey||e.ctrlKey||e.metaKey)return;const dir=dirs[e.key]||dirs[e.key.toLowerCase()];if(dir){e.preventDefault();move(...dir);}});
document.querySelectorAll('[data-dir]').forEach(b=>b.onclick=()=>move(...b.dataset.dir.split(',').map(Number)));
$('#heal').onclick=()=>act(()=>heal(state));$('#wait').onclick=()=>act(()=>rest(state));$('#extract').onclick=()=>act(()=>extract(state));$('#next').onclick=()=>act(()=>{state=nextRun(state);facing={dx:0,dy:1};});
$('#pause').onclick=()=>{if(!state)return;save();draw();$('#saveState').textContent=saveError?'A mentés nem sikerült; ne zárd be ezt a lapot.':'Elmentve. Ezen az eszközön és böngészőben innen folytathatod.';$('#paused').showModal();};$('#resume').onclick=()=>{$('#paused').close();draw();};document.addEventListener('visibilitychange',()=>{if(!state)return;if(document.hidden){motion.cancel();save();if(!$('#paused').open&&!transfer.isOpen())$('#paused').showModal();}else draw();});
if(state){save();draw();}else{draw();mountRecovery({initial:startup,getStorage:()=>localStorage,applyState:loaded=>{state=loaded;saveError=false;ensureTransfer();draw();}});}



