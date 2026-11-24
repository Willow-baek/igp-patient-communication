"""Build reviewed practice chunks and continuous prefixes from original recordings.
Usage: python tools/build-practice-audio.py tools/week-02-practice-boundaries.json
Requires imageio-ffmpeg. Sources are preserved; no concatenation, fades or silence.
"""
import json
import subprocess
import sys
from pathlib import Path
import imageio_ffmpeg

root=Path(__file__).resolve().parents[1]
manifestPath=Path(sys.argv[1]);manifest=json.loads(manifestPath.read_text())
weekPath=root/'docs/weeks.json';data=json.loads(weekPath.read_text());week=next(w for w in data['weeks'] if w['id']==manifest['week'])
assert week['scriptRevision']==manifest['scriptRevision']
units=manifest['units']
# Keep verified tracks for unchanged units; supplied tracks replace only their voice.
for unit in units:
    for sentence in unit.get('sentences', [unit]):
        sentence['audio']=dict(sentence.get('audio',{}))
for voice,tracks in manifest['tracks'].items():
    for track in tracks:
        unit=units[track['unit']]
        sentence_index=track.get('sentence')
        sentence=unit if sentence_index is None else unit['sentences'][sentence_index]
        count=len(sentence['chunks']);bounds=[track['start']]+track['cuts']+[track['end']]
        assert len(bounds)==count+1 and all(a<b for a,b in zip(bounds,bounds[1:]))
        version=manifest.get("assetVersion","practice-v1")
        unit_path=unit['id'] if sentence_index is None else f"{unit['id']}/sentence-{sentence_index+1}"
        destination=f"audio/{week['id']}/{version}/{unit_path}/{voice}"
        filters=['-af', f"volume={track['gainDb']}dB"] if 'gainDb' in track else []
        def extract(name,start,end):
            url=f'{destination}/{name}.m4a';target=root/'docs'/url;target.parent.mkdir(parents=True,exist_ok=True)
            subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-v','error','-y','-i',str(root/'docs'/track['source']),'-ss',str(start),'-t',str(round(end-start,6)),*filters,'-map_metadata','-1','-vn','-c:a','aac','-b:a','128k','-movflags','+faststart',str(target)],check=True)
            return url
        padding=track.get("tailPadding",[0]*count)
        assert len(padding)==count and padding[-1]==0 and all(0<=p<=.3 for p in padding)
        full=extract('full',bounds[0],bounds[-1])
        chunks=[full] if count==1 else [extract(f'chunk-{i+1}',bounds[i],bounds[i+1]+padding[i]) for i in range(count)]
        build=[] if count==1 else [extract(f'build-{i}',bounds[0],bounds[i]+padding[i-1]) for i in range(2,count)]+[full]
        sentence['audio'][voice]={'chunks':chunks,'buildUp':build,'full':full}
        print(unit_path,voice,count,'chunks',flush=True)
week['practice']={'scriptRevision':manifest['scriptRevision'],'units':units}
weekPath.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
