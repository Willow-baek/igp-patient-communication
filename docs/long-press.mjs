export function createLongPress({open,setTimer=setTimeout,clearTimer=clearTimeout,now=Date.now,delay=550}){
  let pending=null,suppressed=null;
  function cancel(){if(pending)clearTimer(pending.timer);pending=null;}
  return {
    start(target,event){
      cancel();
      if(!['touch','pen'].includes(event.pointerType)||event.button!==0||event.isPrimary===false)return;
      const press={target,id:event.pointerId,x:event.clientX,y:event.clientY,timer:null};
      press.timer=setTimer(()=>{if(pending!==press)return;pending=null;suppressed={target,until:now()+1000};open(target);},delay);
      pending=press;
    },
    move(event){if(pending&&pending.id===event.pointerId&&Math.hypot(event.clientX-pending.x,event.clientY-pending.y)>10)cancel();},
    end(event){
      if(pending?.id===event.pointerId)cancel();
      // A long touch can last several seconds: suppress its release click too.
      if(suppressed)suppressed.until=now()+1000;
    },
    cancel,
    consume(target){if(suppressed?.target===target&&now()<=suppressed.until){suppressed=null;return true;}return false;},
  };
}

// Delay mouse language changes until a possible double click is resolved.
// Restore the original language if the OS recognises a slower double click.
export function createMouseClicks({setTimer=setTimeout,clearTimer=clearTimeout,delay=300}={}){
  let pending=null;
  function cancel(){if(pending)clearTimer(pending.timer);pending=null;}
  return {
    cancel,
    click(target,detail,toggle,capture){
      if(detail>1){if(pending?.target===target)clearTimer(pending.timer);return;}
      if(pending){clearTimer(pending.timer);if(!pending.fired)pending.toggle();}
      const state={target,toggle,restore:capture(),fired:false,timer:null};
      state.timer=setTimer(()=>{if(pending===state){state.fired=true;state.toggle();}},delay);
      pending=state;
    },
    doubleClick(target){
      if(pending?.target===target){clearTimer(pending.timer);if(pending.fired)pending.restore();}
      pending=null;
    },
  };
}
