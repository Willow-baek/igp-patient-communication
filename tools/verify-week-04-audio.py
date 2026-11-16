"""Verify current Week 4 audio with ASR. This does not claim human listening.

Run with faster-whisper, imageio-ffmpeg and numpy. Optional --retry uses small.en
only on base.en mismatches and preserves both recognition results.
"""
import difflib
import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path
import numpy as np
import imageio_ffmpeg
from faster_whisper import WhisperModel

root=Path(__file__).resolve().parents[1]
week=next(w for w in json.loads((root/'docs/weeks.json').read_text())['weeks'] if w['id']=='week-04')
retry='--retry' in sys.argv
changed='--changed' in sys.argv
model_name='small.en' if retry or changed else 'base.en'
cache=os.environ.get('IGP_WHISPER_MODEL_DIR','/Users/hansol/Documents/Codex/2026-10-27/new-chat/work/audio-alignment/models')
model=WhisperModel(model_name,device='cpu',compute_type='int8',download_root=cache,cpu_threads=4)
report_path=root/'tools/week-04-audio-verification.json'
report=json.loads(report_path.read_text()) if retry or changed else {'week':'week-04','scriptRevision':week['scriptRevision'],'humanListening':False,'method':'Independent ASR on current dialogue and practice files; US/UK hospitalization spelling normalized.','assets':[]}
norm=lambda s:re.findall(r"[a-z0-9']+",s.lower().replace('hospitalisations','hospitalizations'))
targets={}
for i,l in enumerate(week['lines']):
    tracks=l['audioVoices'].values() if l['speaker']=='Physio' else [l['audio']]
    for url in tracks:targets[url]={'kind':'dialogue','line':i+1,'expected':l['en']}
for u in week.get('practice',{}).get('units',[]):
    for v,track in u['audio'].items():
        for url,text in zip(track['chunks'],u['chunks']):targets[url]={'kind':'practice','unit':u['id'],'expected':text}
        for n,url in enumerate(track['buildUp'],2):targets[url]={'kind':'practice','unit':u['id'],'expected':' '.join(u['chunks'][:n])}
        targets[track['full']]={'kind':'practice','unit':u['id'],'expected':u['text']}
previous={a['url']:a for a in report['assets']}
for url,meta in targets.items():
    if retry and previous[url]['exact']:continue
    path=root/'docs'/url
    digest=hashlib.sha256(path.read_bytes()).hexdigest()
    if changed and previous[url]['sha256']==digest:continue
    raw=subprocess.check_output([imageio_ffmpeg.get_ffmpeg_exe(),'-v','error','-i',str(path),'-f','f32le','-ac','1','-ar','16000','-'])
    x=np.frombuffer(raw,dtype=np.float32)
    segments,_=model.transcribe(x,language='en',beam_size=5,vad_filter=False,condition_on_previous_text=False)
    recognized=''.join(s.text for s in segments).strip()
    exact=norm(meta['expected'])==norm(recognized)
    observation={'model':model_name,'recognized':recognized,'exact':exact,'ratio':difflib.SequenceMatcher(None,norm(meta['expected']),norm(recognized)).ratio()}
    if changed:
        item=previous[url]
        item.setdefault('previousVersions',[]).append({'sha256':item['sha256'],'recognitions':item['recognitions']})
        item.update(sha256=digest,duration=len(x)/16000,recognitions=[observation],exact=exact)
    elif retry:
        item=previous[url];item['recognitions'].append(observation);item['exact']=exact
    else:
        item={'url':url,**meta,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'duration':len(x)/16000,'exact':exact,'recognitions':[observation]};report['assets'].append(item)
    if not exact:print('REVIEW',url,meta['expected'],'=>',recognized,flush=True)
    report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
report['summary']={'total':len(report['assets']),'exact':sum(a['exact'] for a in report['assets']),'review':sum(not a['exact'] for a in report['assets'])}
report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(report['summary'],flush=True)
