"""Restore complete sentence order after Week 4's existing audio builders.

Run last, after the additional female +2dB manifest. Previously verified chunks
are reused unchanged; only missing sentence files are extracted from the source.
"""
import hashlib
import json
import subprocess
from pathlib import Path
import imageio_ffmpeg

root=Path(__file__).resolve().parents[1]
plan=json.loads((root/'tools/week-04-practice-first-sentence-v3.json').read_text())
source=root/'docs'/plan['source']
assert hashlib.sha256(source.read_bytes()).hexdigest()==plan['sourceSha256']
path=root/'docs/weeks.json';data=json.loads(path.read_text())
week=next(w for w in data['weeks'] if w['id']==plan['week'])
assert week['scriptRevision']==plan['scriptRevision']
for unit in plan['units']:
    if unit.get('sentences'):assert unit['text']==week['lines'][unit['lines'][0]]['en']
for asset in plan['newAssets']:
    target=root/'docs'/asset['url'];target.parent.mkdir(parents=True,exist_ok=True)
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-v','error','-y','-i',str(source),'-ss',str(asset['start']),'-t',str(round(asset['end']-asset['start'],6)),'-map_metadata','-1','-vn','-c:a','aac','-b:a','128k','-movflags','+faststart',str(target)],check=True)
week['practice']={'scriptRevision':plan['scriptRevision'],'units':plan['units']}
path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(len(plan['newAssets']),'missing sentence assets; existing chunks reused unchanged.')
