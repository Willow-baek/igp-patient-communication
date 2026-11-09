"""Rebuild only the revised Week 3 opening practice unit.

Run after the general practice and female volume builds. Sources, exact cuts,
gain, and destinations are recorded in week-03-opening-practice-v2.json.
"""
import json
import subprocess
from pathlib import Path
import imageio_ffmpeg

root = Path(__file__).resolve().parents[1]
plan = json.loads((root / 'tools/week-03-opening-practice-v2.json').read_text())
path = root / 'docs/weeks.json'
data = json.loads(path.read_text())
week = next(w for w in data['weeks'] if w['id'] == plan['week'])
assert week['scriptRevision'] == plan['scriptRevision']
unit = next(u for u in week['practice']['units'] if u['id'] == plan['unitId'])
assert ' '.join(plan['chunks']) == unit['text']
unit['chunks'] = plan['chunks']
for voice, track in plan['tracks'].items():
    for clip in track['clips']:
        destination = root / 'docs' / clip['audio']
        destination.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run([
            imageio_ffmpeg.get_ffmpeg_exe(), '-v', 'error', '-y',
            '-i', str(root / 'docs' / track['source']),
            '-ss', str(clip['start']), '-t', str(clip['end'] - clip['start']),
            '-af', f"volume={track['gainDb']}dB", '-map_metadata', '-1',
            '-vn', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart',
            str(destination),
        ], check=True)
    clips = track['clips']
    unit['audio'][voice] = {
        'chunks': [c['audio'] for c in clips[:3]],
        'buildUp': [clips[3]['audio'], clips[4]['audio']],
        'full': clips[4]['audio'],
    }
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
