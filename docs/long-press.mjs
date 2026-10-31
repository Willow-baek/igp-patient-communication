export function createLongPress({open,setTimer=setTimeout,clearTimer=clearTimeout,now=Date.now,delay=550}){
  let pending=null,suppressed=null;
  function cancel(){if(pending)clearTimer(pending.timer);pending=null;}
  return {
    start(target,event){
      cancel();
      if(event.button!==0||event.isPrimary===false)return;
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
