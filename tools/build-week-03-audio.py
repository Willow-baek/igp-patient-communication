"""Rebuild Week 3 clips from preserved sources and reviewed boundaries.
Run from the repository root with imageio-ffmpeg installed.
No synthetic silence, fades, or concatenation is applied.
"""
import json
import subprocess
from pathlib import Path
import imageio_ffmpeg

root = Path(__file__).resolve().parents[1]
report = json.loads((root / 'tools/week-03-audio-boundaries.json').read_text())
week = json.loads((root / 'tools/week-03-script.json').read_text())
for voice, track in report['tracks'].items():
    for clip in track['clips']:
        target = root / 'docs' / clip['output']
        target.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run([
            imageio_ffmpeg.get_ffmpeg_exe(), '-v', 'error', '-y',
            '-i', str(root / 'docs' / clip.get('source', track['source'])),
            '-ss', str(clip['start']), '-t', str(round(clip['end'] - clip['start'], 6)),
            '-map_metadata', '-1', '-vn', '-c:a', 'aac', '-b:a', '128k',
            '-movflags', '+faststart', str(target),
        ], check=True)
        line = week['lines'][clip['line'] - 1]
        assert line['en'] == clip['text']
        if voice == 'patient':
            line['audio'] = clip['output']
        else:
            line.setdefault('audioVoices', {})[voice] = clip['output']
        print(voice, clip['line'], flush=True)
week['physioAudio'] = {v: report['tracks'][v]['source'] for v in ['female', 'male']}
week['patientAudio'] = report['tracks']['patient']['source']
path = root / 'docs/weeks.json'
data = json.loads(path.read_text())
existing = next((i for i, w in enumerate(data['weeks']) if w['id'] == week['id']), None)
if existing is None:
    data['weeks'].append(week)
else:
    # Rebuilding audio preserves any separately generated practice metadata.
    if 'practice' in data['weeks'][existing]:
        week['practice'] = data['weeks'][existing]['practice']
    data['weeks'][existing] = week
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
