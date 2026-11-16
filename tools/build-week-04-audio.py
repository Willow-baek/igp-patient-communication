"""Rebuild Week 4 dialogue using preserved originals and waveform boundaries.

Requires imageio-ffmpeg; run from any directory. No silence/fades/concatenation.
Run the separately recorded female-volume and practice builders afterwards.
"""
import json
import subprocess
from pathlib import Path
import imageio_ffmpeg

root = Path(__file__).resolve().parents[1]
report = json.loads((root/'tools/week-04-audio-boundaries.json').read_text())
week = json.loads((root/'tools/week-04-script.json').read_text())
for voice, track in report['tracks'].items():
    for clip in track['clips']:
        target = root/'docs'/clip['output']
        target.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-v', 'error', '-y', '-i', str(root/'docs'/track['source']), '-ss', str(clip['start']), '-t', str(round(clip['end']-clip['start'],6)), '-map_metadata', '-1', '-vn', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', str(target)], check=True)
        line = week['lines'][clip['line']-1]
        assert line['en'] == clip['text']
        if voice == 'patient':
            line['audio'] = clip['output']
        else:
            line.setdefault('audioVoices', {})[voice] = clip['output']
    print(voice, len(track['clips']), 'clips', flush=True)
week['physioAudio'] = {v: report['tracks'][v]['source'] for v in ['female','male']}
week['patientAudio'] = report['tracks']['patient']['source']
path = root/'docs/weeks.json'
data = json.loads(path.read_text())
index = next(i for i,w in enumerate(data['weeks']) if w['id']==week['id'])
data['weeks'][index] = week
path.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n')
