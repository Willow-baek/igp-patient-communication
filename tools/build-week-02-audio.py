"""Rebuild Week 2 clips from preserved source audio and reviewed boundaries.
Requires imageio-ffmpeg. Does not overwrite sources or alter scripts.
Run from repository root after reviewing tools/week-02-audio-boundaries.json.
"""
import json
import subprocess
from pathlib import Path
import imageio_ffmpeg

root = Path(__file__).resolve().parents[1]
report = json.loads((root / 'tools/week-02-audio-boundaries.json').read_text())
for voice, track in report['tracks'].items():
    for clip in track['clips']:
        target = root / 'docs' / clip['output']
        target.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run([
            imageio_ffmpeg.get_ffmpeg_exe(), '-v', 'error', '-y',
            '-i', str(root / 'docs' / track['source']),
            '-ss', str(clip['start']), '-t', str(round(clip['end'] - clip['start'], 6)),
            '-map_metadata', '-1', '-vn', '-c:a', 'aac', '-b:a', '128k',
            '-movflags', '+faststart', str(target),
        ], check=True)
        print(f"{voice}: {clip['line']:02d} [{clip['start']:.3f}, {clip['end']:.3f}]", flush=True)
