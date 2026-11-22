export function shuffledExamples(patterns,random=Math.random,previousId=null){
  const items=patterns.flatMap((p,patternIndex)=>p.exercises.map(q=>({...q,en:q.before+q.answer+q.after,pattern:p,patternIndex})));
  for(let i=items.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}
  if(items.length>1&&items[0].id===previousId)[items[0],items[1]]=[items[1],items[0]];
  return items;
}
export function createShadowSession({patterns,speak,cancel,onChange=()=>{},getRate=()=>1,random=Math.random,now=()=>Date.now(),setTimer=setTimeout,clearTimer=clearTimeout}){
  let items=shuffledExamples(patterns,random),index=0,phase='idle',generation=0,timer=null,deadline=0,started=0,error='';
  const state=()=>({item:items[index],index,total:items.length,phase,error,remaining:phase==='repeat'?Math.max(0,Math.ceil((deadline-now())/1000)):0});
  const emit=()=>onChange(state());
  function clear(){generation++;if(timer!==null)clearTimer(timer);timer=null;cancel();}
  function stop(){clear();if(phase!=='complete')phase='idle';deadline=0;emit();}
  function tick(token){
    if(token!==generation||phase!=='repeat')return;
    if(now()>=deadline){advance();return;}
    emit();timer=setTimer(()=>tick(token),250);
  }
  function play(){
    if(!items.length||phase==='complete')return;
    clear();const token=generation;phase='listen';error='';started=now();emit();
    speak(items[index].en,{rate:getRate(),onEnd(){if(token!==generation||phase!=='listen')return;const seconds=Math.max(3,(now()-started)/1000*1.35+1,items[index].en.split(/\s+/).length/2.7/getRate()*1.35+1);phase='repeat';deadline=now()+seconds*1000;tick(token);},onError(){if(token!==generation)return;clear();phase='idle';error='음성을 재생하지 못했어요. 다시 눌러 주세요.';emit();}});
  }
  function advance(){clear();if(index+1===items.length){phase='complete';emit();return;}index++;play();}
  return {get state(){return state();},play,stop,next:advance,
    toggle(){if(phase==='listen'||phase==='repeat')stop();else if(phase==='complete')this.restart();else play();},
    replay(){if(phase==='complete')return;play();},
    restart(){const last=items[index]?.id;clear();items=shuffledExamples(patterns,random,last);index=0;phase='idle';error='';play();},
  };
}
