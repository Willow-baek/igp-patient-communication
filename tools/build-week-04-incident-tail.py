"""Restore the incident ending from preserved audio after shorter-practice v4.

Run after v4, before the user-selected v6 builder. Extract continuous original
ranges without silence, gain, fade or
concatenation. Old assets and boundary manifests remain unchanged.
"""
import hashlib
import json
import subprocess
from pathlib import Path
import imageio_ffmpeg

root = Path(__file__).resolve().parents[1]
manifest_path = root/'tools/week-04-incident-tail-v5.json'
plan = json.loads(manifest_path.read_text())
path = root/'docs/weeks.json'
data = json.loads(path.read_text())
week = next(w for w in data['weeks'] if w['id'] == plan['week'])
assert week['scriptRevision'] == plan['scriptRevision']
unit = next(u for u in week['practice']['units'] if u['id'] == plan['unit'])
group = unit['sentences'][plan['sentence']]
source = root/'docs'/plan['source']
assert hashlib.sha256(source.read_bytes()).hexdigest() == plan['sourceSha256']
for item in plan['assets']:
    target = root/'docs'/item['url']
    target.parent.mkdir(parents=True,exist_ok=True)
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-v','error','-y','-i',str(source),'-ss',str(item['start']),'-t',str(round(item['end']-item['start'],6)),'-map_metadata','-1','-vn','-c:a','aac','-b:a','128k','-movflags','+faststart',str(target)],check=True)
    group['audio']['patient'][item['collection']][item['index']] = item['url']
path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
