// Temporary workbook examples only. Canonical ElevenLabs dialogue is untouched.
export function createBrowserVoice(scope=globalThis){
  const synth=scope.speechSynthesis,Utterance=scope.SpeechSynthesisUtterance;
  let active=null;
  function cancel(){if(active){active.onend=null;active.onerror=null;active=null;}synth?.cancel();}
  return {
    cancel,
    speak(text,{rate=1,onEnd,onError}){
      if(!synth||!Utterance){onError();return;}
      try{
        const english=synth.getVoices().filter(v=>/^en[-_]/i.test(v.lang));
        const voice=english.find(v=>/^en[-_]AU$/i.test(v.lang))||english.find(v=>/^en[-_]GB$/i.test(v.lang))||english.find(v=>/^en[-_]US$/i.test(v.lang))||english[0];
        const utterance=new Utterance(text);
        if(voice)utterance.voice=voice;
        utterance.lang=voice?.lang||'en-US';utterance.rate=rate;
        active=utterance;
        utterance.onend=()=>{if(active!==utterance)return;active=null;onEnd();};utterance.onerror=()=>{if(active!==utterance)return;active=null;onError();};
        synth.speak(utterance);
      }catch{onError();}
    },
  };
}
