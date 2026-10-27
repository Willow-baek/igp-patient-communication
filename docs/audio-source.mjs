// A patient's source never depends on the selected physiotherapist voice.
export function resolveAudio(line, week, voice) {
  const isPhysio = line.speaker === 'Physio';
  const selected = isPhysio ? line.audioVoices?.[voice] : line.audio;
  if (typeof selected === 'string' && selected) return {url:selected,start:0,end:null};
  if (selected?.url) {
    const start = selected.start ?? 0;
    const end = selected.end ?? null;
    if (Number.isFinite(start) && start >= 0 && (end === null || (Number.isFinite(end) && end > start)))
      return {url:selected.url,start,end};
  }
  // Versioned full recordings can have different sentence boundaries.
  const segment = isPhysio ? line.segments?.[voice] : line;
  const track = isPhysio ? week.physioAudio?.[voice] : week.patientAudio;
  if (track && Number.isFinite(segment?.start) && segment.start >= 0 && Number.isFinite(segment?.end) && segment.end > segment.start)
    return {url:track,start:segment.start,end:segment.end};
  // Legacy non-versioned recordings remain usable only without voice variants.
  if (!isPhysio || (!line.audioVoices && !week.physioAudio)) {
    if (line.audio) return {url:line.audio,start:0,end:null};
    if (week.audio && Number.isFinite(line.start) && Number.isFinite(line.end) && line.end > line.start)
      return {url:week.audio,start:line.start,end:line.end};
  }
  return null;
}
