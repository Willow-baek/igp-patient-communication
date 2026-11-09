"""Apply reviewed, constant female voice gain without changing preserved sources.

Usage: python tools/balance-female-audio.py tools/female-volume-balance-2026-11-09.json
Requires imageio-ffmpeg. Run after rebuilding dialogue/practice audio.
The manifest records exact input/output paths; reruns always read original assets.
"""
import json
import subprocess
import sys
from pathlib import Path
import imageio_ffmpeg

root = Path(__file__).resolve().parents[1]
manifest_path = root / sys.argv[1]
manifest = json.loads(manifest_path.read_text())
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

def measure(path):
    result = subprocess.run([
        ffmpeg, '-hide_banner', '-i', str(path),
        '-af', 'loudnorm=I=-23:TP=-1.5:LRA=11:print_format=json',
        '-f', 'null', '-',
    ], check=True, capture_output=True, text=True)
    text = result.stderr
    return json.loads(text[text.rfind('{'):text.rfind('}') + 1])

replacements = {}
for week in manifest['weeks']:
    for asset in week['assets']:
        source, target = (root / 'docs' / asset[k] for k in ['source', 'output'])
        assert source != target
        target.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run([
            ffmpeg, '-v', 'error', '-y', '-i', str(source),
            '-af', f"volume={week['gainDb']}dB", '-map_metadata', '-1',
            '-vn', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', str(target),
        ], check=True)
        asset['after'] = measure(target)
        assert float(asset['after']['input_tp']) <= -1.5, asset['output']
        replacements[asset['source']] = asset['output']
    print(week['id'], week['gainDb'], 'dB;', len(week['assets']), 'assets', flush=True)

def replace(value):
    if isinstance(value, str):
        return replacements.get(value, value)
    if isinstance(value, list):
        return [replace(v) for v in value]
    if isinstance(value, dict):
        return {k: replace(v) for k, v in value.items()}
    return value

path = root / 'docs/weeks.json'
data = replace(json.loads(path.read_text()))
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
