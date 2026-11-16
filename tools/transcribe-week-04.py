"""ASR assistance for Week 4; this is not direct human listening review."""
import json
import subprocess
import sys
from pathlib import Path
import numpy as np
import imageio_ffmpeg
from faster_whisper import WhisperModel

root = Path(__file__).resolve().parents[1]
work = root / 'work/week-04'
work.mkdir(parents=True, exist_ok=True)
model_dir = Path('/Users/hansol/Documents/Codex/2026-10-27/new-chat/work/audio-alignment/models')
model = WhisperModel('base.en', device='cpu', compute_type='int8', download_root=str(model_dir), cpu_threads=4)
for voice in sys.argv[1:] or ['female', 'male', 'patient']:
    filename = f'W4_PT_{voice}.mp3' if voice != 'patient' else 'W4_pt.mp3'
    source = root / 'docs/audio/week-04/original' / filename
    raw = subprocess.check_output([imageio_ffmpeg.get_ffmpeg_exe(), '-v', 'error', '-i', str(source), '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'])
    samples = np.frombuffer(raw, dtype=np.float32)
    segments, info = model.transcribe(samples, language='en', beam_size=5, word_timestamps=True, vad_filter=False)
    result = {'source': str(source.relative_to(root)), 'model': 'base.en', 'duration': len(samples)/16000, 'segments': []}
    for segment in segments:
        result['segments'].append({'start': segment.start, 'end': segment.end, 'text': segment.text, 'words': [{'word': w.word, 'start': w.start, 'end': w.end, 'probability': w.probability} for w in segment.words]})
    (work / f'{voice}-asr.json').write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n')
    print(voice, result['duration'], ''.join(s['text'] for s in result['segments']), flush=True)
