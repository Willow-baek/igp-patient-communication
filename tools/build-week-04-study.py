"""Build the main-app-only Week 4 sentence/practice variant; preserve weeks.json.
Run after the legacy v7 builder. Existing sentence cuts are reused. The sole new
sentence boundary is within the source pause at 19.495s (weeks./Initially).
"""
import copy, hashlib, json, subprocess
from pathlib import Path
import imageio_ffmpeg
root=Path(__file__).resolve().parents[1]
base=next(w for w in json.loads((root/'docs/weeks.json').read_text())['weeks'] if w['id']=='week-04')
plan=json.loads((root/'tools/week-04-all-manual-v7.json').read_text())
revision=base['scriptRevision']+'-sentence-study-2026-11-22-v1'
variant={'weekId':'week-04','baseScriptRevision':base['scriptRevision'],'baseLines':base['lines'],'scriptRevision':revision,'lines':[],'practice':{'scriptRevision':revision,'units':[]}}
manifest={'workbookCorrection':'Exercise 1-2: knee pain, approved by user 2026-11-22; original key said neck pain.','sourcePlan':'tools/week-04-all-manual-v7.json','sourceSha256':hashlib.sha256((root/'docs/audio/week-04/original/W4_pt.mp3').read_bytes()).hexdigest(),'humanListening':False,'newBoundary':{'time':19.495,'precedingWordEnd':18.975,'nextWordStart':20.015},'files':[]}
source='audio/week-04/original/W4_pt.mp3'
def extract(name,start,end):
 url=f'audio/week-04/sentence-study-2026-11-22-v1/{name}.m4a'
 target=root/'docs'/url;target.parent.mkdir(parents=True,exist_ok=True)
 subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-v','error','-y','-i',str(root/'docs'/source),'-ss',str(start),'-t',str(round(end-start,6)),'-map_metadata','-1','-vn','-c:a','aac','-b:a','128k','-movflags','+faststart',str(target)],check=True)
 manifest['files'].append({'path':url,'start':start,'end':end,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
 return url
for i,line in enumerate(base['lines']):
 original=copy.deepcopy(base['practice']['units'][i])
 groups=original.get('sentences',[original]) if line['speaker']=='Patient' else [original]
 if i==5:
  track=original['audio']['patient']
  firstFull=extract('line-06-sentence-1',16.555,19.495)
  secondFull=extract('line-06-sentence-2',19.495,23.9075)
  groups=[{'text':"It's become more noticeable over the last few weeks.",'chunks':["It's become more noticeable",'over the last few weeks.'],'audio':{'patient':{'chunks':[track['chunks'][0],extract('line-06-sentence-1-chunk-2',17.8125,19.495)],'buildUp':[firstFull],'full':firstFull}}},
   {'text':'Initially, I only felt it occasionally, but now I experience it almost every day.','chunks':['Initially, I only felt it occasionally,','but now I experience it','almost every day.'],'audio':{'patient':{'chunks':[extract('line-06-sentence-2-chunk-1',19.495,21.5825),*track['chunks'][2:]],'buildUp':[extract('line-06-sentence-2-build-2',19.495,22.8175),secondFull],'full':secondFull}}}]
 kor=line['ko'].split('. ') if len(groups)>1 else [line['ko']]
 assert len(kor)==len(groups),(i,kor)
 for j,group in enumerate(groups):
  n=len(variant['lines']);new=copy.deepcopy(line)
  if len(groups)>1:
   new['en']=group['text'];new['ko']=kor[j]+('.' if j<len(kor)-1 else '');new['audio']=group['audio']['patient']['full']
  new['sourceLine']=i
  variant['lines'].append(new)
  u=copy.deepcopy(group);u.pop('range',None);u.update(id=f'study-line-{n+1:02}',speaker=line['speaker'],lines=[n],text=new['en'],userSelected=True)
  if 'sentences' in u or len(u.get('chunks',[]))>=2:variant['practice']['units'].append(u)
 assert ' '.join(l['en'] for l in variant['lines'] if l['sourceLine']==i)==line['en']
 assert ' '.join(l['ko'] for l in variant['lines'] if l['sourceLine']==i)==line['ko']
# Exact ranges: emphasize the grammatical frame, never rewrite a dialogue.
frames={0:['how','first started'],2:['Did','come on suddenly','or did it develop gradually'],4:['How has','changed over'],6:['Have you experienced','in the past'],8:['Have you seen','about'],16:['Are you currently taking any']}
for line in variant['lines']:
 spans=[];cursor=0
 for phrase in frames.get(line['sourceLine'],[]):
  start=line['en'].index(phrase,cursor);spans.append({'start':start,'end':start+len(phrase)});cursor=start+len(phrase)
 if spans:line['patternRanges']=spans
assert len(variant['lines'])==27
variant['patterns']=json.loads((root/'tools/week-04-workbook-patterns.json').read_text())
(root/'docs/week-04-study.json').write_text(json.dumps(variant,ensure_ascii=False,indent=2)+'\n')
(root/'tools/week-04-sentence-study-audio.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(f"27 bubbles, {len(variant['practice']['units'])} practice units, {len(manifest['files'])} new audio files; canonical data unchanged")
