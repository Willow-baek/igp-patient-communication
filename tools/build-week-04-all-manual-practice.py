"""Apply the user's full Week 4 slash selections, after all earlier builders.

Preserve normal playback, script, voice volume and prior assets. Each chunk and
prefix is a continuous original range with no added silence/gain/fade/splicing.
"""
import hashlib
import json
import subprocess
from pathlib import Path
import imageio_ffmpeg

root=Path(__file__).resolve().parents[1]
plan=json.loads((root/'tools/week-04-all-manual-v7.json').read_text())
path=root/'docs/weeks.json';data=json.loads(path.read_text())
week=next(w for w in data['weeks'] if w['id']==plan['week'])
assert week['scriptRevision']==plan['scriptRevision']
for meta in plan['sources'].values():
    assert hashlib.sha256((root/'docs'/meta['path']).read_bytes()).hexdigest()==meta['sha256']
for unit in plan['units']:
    assert unit['text']==' '.join(week['lines'][i]['en'] for i in unit['lines'])
for track in plan['tracks']:
    unit=plan['units'][track['unit']]
    group=unit if track['group'] is None else unit['sentences'][track['group']]
    count=len(group['chunks']);bounds=[track['start'],*track['cuts'],track['end']]
    assert group['chunks'] and ' '.join(group['chunks'])==group.get('text',unit['text'])
    assert len(bounds)==count+1 and all(a<b for a,b in zip(bounds,bounds[1:]))
    label='single' if track['group'] is None else f"sentence-{track['group']+1}"
    base=f"audio/week-04/{plan['assetVersion']}/{unit['id']}/{label}/{track['voice']}"
    def extract(name,start,end):
        url=f'{base}/{name}.m4a';target=root/'docs'/url;target.parent.mkdir(parents=True,exist_ok=True)
        subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-v','error','-y','-i',str(root/'docs'/track['source']),'-ss',str(start),'-t',str(round(end-start,6)),'-map_metadata','-1','-vn','-c:a','aac','-b:a','128k','-movflags','+faststart',str(target)],check=True)
        return url
    pad=track['tailPadding'];assert len(pad)==count and pad[-1]==0
    full=extract('full',bounds[0],bounds[-1])
    starts=track.get('chunkStarts',bounds[:-1]);assert len(starts)==count and all(starts[i]<bounds[i+1]+pad[i] for i in range(count))
    chunks=[extract(f'chunk-{i+1}',starts[i],bounds[i+1]+pad[i]) for i in range(count)] if count>1 else [full]
    builds=[extract(f'build-{n}',bounds[0],bounds[n]+pad[n-1]) for n in range(2,count)]+([full] if count>1 else [])
    group['audio'][track['voice']]={'chunks':chunks,'buildUp':builds,'full':full}
week['practice']={'scriptRevision':plan['scriptRevision'],'units':plan['units']}
path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
