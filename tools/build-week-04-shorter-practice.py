"""Build shorter Week 4 phrases after the first-sentence restoration builder.

Extract independent chunks and continuous sentence prefixes from preserved
recordings. No voice gain, synthetic silence, fades or concatenation is added.
"""
import json
import subprocess
from pathlib import Path
import imageio_ffmpeg

root=Path(__file__).resolve().parents[1]
plan=json.loads((root/'tools/week-04-practice-shorter-v4.json').read_text())
path=root/'docs/weeks.json';data=json.loads(path.read_text())
week=next(w for w in data['weeks'] if w['id']==plan['week'])
assert week['scriptRevision']==plan['scriptRevision']
for track in plan['tracks']:
    unit=plan['units'][track['unit']]
    group=unit if track['sentence'] is None else unit['sentences'][track['sentence']]
    count=len(group['chunks']);bounds=[track['start'],*track['cuts'],track['end']]
    assert len(bounds)==count+1 and all(a<b for a,b in zip(bounds,bounds[1:]))
    label='single' if track['sentence'] is None else f"sentence-{track['sentence']+1}"
    base=f"audio/week-04/{plan['assetVersion']}/{unit['id']}/{label}/{track['voice']}"
    def extract(name,start,end):
        url=f'{base}/{name}.m4a';target=root/'docs'/url;target.parent.mkdir(parents=True,exist_ok=True)
        subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-v','error','-y','-i',str(root/'docs'/track['source']),'-ss',str(start),'-t',str(round(end-start,6)),'-map_metadata','-1','-vn','-c:a','aac','-b:a','128k','-movflags','+faststart',str(target)],check=True)
        return url
    padding=track['tailPadding'];assert len(padding)==count and padding[-1]==0
    chunks=[extract(f'chunk-{i+1}',bounds[i],bounds[i+1]+padding[i]) for i in range(count)]
    full=extract('full',bounds[0],bounds[-1])
    build=[extract(f'build-{n}',bounds[0],bounds[n]+padding[n-1]) for n in range(2,count)]+[full]
    group['audio'][track['voice']]={'chunks':chunks,'buildUp':build,'full':full}
    print(unit['id'],label,track['voice'],count,'chunks',flush=True)
week['practice']={'scriptRevision':plan['scriptRevision'],'units':plan['units']}
path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
