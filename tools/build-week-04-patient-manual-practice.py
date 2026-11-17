"""Apply the user's nine exact phrases to Week 4's first patient bubble.

Run after incident-tail v5. Keep the source script, ordinary playback, other
practice units and all previous assets. Audio is cut continuously from the
preserved recording without added silence, gain, fades or concatenation.
"""
import hashlib
import json
import subprocess
from pathlib import Path
import imageio_ffmpeg

root = Path(__file__).resolve().parents[1]
plan = json.loads((root/'tools/week-04-patient-manual-v6.json').read_text())
path = root/'docs/weeks.json'
data = json.loads(path.read_text())
week = next(w for w in data['weeks'] if w['id'] == plan['week'])
assert week['scriptRevision'] == plan['scriptRevision']
unit = next(u for u in week['practice']['units'] if u['id'] == plan['unit'])
source = root/'docs'/plan['source']
assert hashlib.sha256(source.read_bytes()).hexdigest() == plan['sourceSha256']
assert len(unit['sentences']) == len(plan['sentences'])
for index, track in enumerate(plan['sentences']):
    group = unit['sentences'][index]
    assert group['text'] == ' '.join(track['chunks'])
    bounds = [track['start'], *track['cuts'], track['end']]
    count = len(track['chunks'])
    assert len(bounds) == count+1 and all(a < b for a,b in zip(bounds,bounds[1:]))
    padding = track['tailPadding']
    assert len(padding) == count and padding[-1] == 0
    base = f"audio/week-04/{plan['assetVersion']}/{unit['id']}/sentence-{index+1}/patient"
    def extract(name,start,end):
        url = f'{base}/{name}.m4a'
        target = root/'docs'/url
        target.parent.mkdir(parents=True,exist_ok=True)
        subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-v','error','-y','-i',str(source),'-ss',str(start),'-t',str(round(end-start,6)),'-map_metadata','-1','-vn','-c:a','aac','-b:a','128k','-movflags','+faststart',str(target)],check=True)
        return url
    chunks = [extract(f'chunk-{n+1}',bounds[n],bounds[n+1]+padding[n]) for n in range(count)]
    full = extract('full',bounds[0],bounds[-1])
    builds = [extract(f'build-{n}',bounds[0],bounds[n]+padding[n-1]) for n in range(2,count)]+[full]
    group['chunks'] = track['chunks']
    group['audio']['patient'] = {'chunks':chunks,'buildUp':builds,'full':full}
path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
