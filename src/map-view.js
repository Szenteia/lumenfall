export const ZOOM_LEVELS=Object.freeze([1,1.5,2]);
const clamp=(n,max)=>Math.max(0,Math.min(Math.max(0,max),n));
export function axisScroll(position,cellSize,viewportSize,mapSize,scroll,center=false){
  const start=position*cellSize,end=start+cellSize;
  const next=center?(start+end-viewportSize)/2:start<scroll?start:end>scroll+viewportSize?end-viewportSize:scroll;
  return clamp(next,mapSize-viewportSize);
}

export function mountMapView({canvas,viewport,controls,minus,plus,fit,status,getState,columns,rows,window=globalThis.window,ResizeObserver=globalThis.ResizeObserver}){
  // Progressive fallback for cached older markup; the original full map still works.
  const noop={update(){},ownsTarget:()=>false};
  if(!viewport||!controls||!minus||!plus||!fit||!status)return noop;
  let level=0,previous=null,previousX=null,previousY=null;
  function position(state,center=false){
    if(!state)return;
    const width=viewport.clientWidth,height=viewport.clientHeight;
    if(!(width>0&&height>0))return;
    const mapWidth=canvas.getBoundingClientRect().width,mapHeight=mapWidth*rows/columns;
    if(!(mapWidth>0))return;
    viewport.scrollLeft=axisScroll(state.x,mapWidth/columns,width,mapWidth,viewport.scrollLeft,center);
    viewport.scrollTop=axisScroll(state.y,mapHeight/rows,height,mapHeight,viewport.scrollTop,center);
  }
  function labels(state){
    minus.disabled=!state||level===0;plus.disabled=!state||level===ZOOM_LEVELS.length-1;fit.disabled=!state;
    const label=`Térkép: ${ZOOM_LEVELS[level]*100}%`;if(status.textContent!==label)status.textContent=label;
  }
  function zoom(next){
    const state=getState();if(!state)return;
    level=clamp(next,ZOOM_LEVELS.length-1);canvas.style.width=`${ZOOM_LEVELS[level]*100}%`;
    labels(state);
    if(level===0){viewport.scrollLeft=0;viewport.scrollTop=0;}else position(state,true);
  }
  minus.onclick=()=>zoom(level-1);plus.onclick=()=>zoom(level+1);fit.onclick=()=>zoom(0);
  canvas.style.width='100%';labels(getState());
  const resize=()=>position(getState());
  if(typeof ResizeObserver==='function')new ResizeObserver(resize).observe(viewport);
  else window?.addEventListener('resize',resize);
  return {
    update(state){
      labels(state);
      if(state!==previous)position(state,true);
      else if(state&&(state.x!==previousX||state.y!==previousY))position(state);
      previous=state;previousX=state?.x;previousY=state?.y;
    },
    ownsTarget(target){return !!target&&(target===viewport||viewport.contains(target)||controls.contains(target));},
  };
}
