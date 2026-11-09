"""Build reviewed breath/meaning practice from preserved, currently balanced clips.

Usage: python tools/build-breath-practice.py
Review practice-breath-review-2026-11-09.json before running. No silence,
concatenation, voice gain changes, or fixed word-count splitting is applied.
"""
import json
import subprocess
from pathlib import Path
import imageio_ffmpeg

root = Path(__file__).resolve().parents[1]
plan_path = root / 'tools/practice-breath-review-2026-11-09.json'
plan = json.loads(plan_path.read_text())
path = root / 'docs/weeks.json'
data = json.loads(path.read_text())
for review in plan['weeks']:
    week = next(w for w in data['weeks'] if w['id'] == review['id'])
    assert week['scriptRevision'] == review['scriptRevision']
    units = []
    for entry in review['units']:
        if 'preservedUnit' in entry:
            units.append(entry['preservedUnit'])
            continue
        line = week['lines'][entry['line'] - 1]
        text = line['en']
        if 'range' in entry:
            text = text[entry['range']['start']:entry['range']['end']]
        assert text == entry['text'] == ' '.join(entry['chunks'])
        unit = {
            'id': entry['id'], 'lines': [entry['line'] - 1],
            'speaker': line['speaker'], 'text': text,
            'chunks': entry['chunks'], 'audio': {},
        }
        if 'range' in entry:
            unit['range'] = entry['range']
        for voice, track in entry['tracks'].items():
            bounds = [track['start']] + track['cuts'] + [track['end']]
            assert len(bounds) == len(unit['chunks']) + 1
            assert all(a < b for a, b in zip(bounds, bounds[1:]))
            track['outputs'] = []
            def extract(name, start, end, expected):
                url = f"audio/{week['id']}/practice-breath-2026-11-09-v3/{unit['id']}/{voice}/{name}.m4a"
                target = root / 'docs' / url
                target.parent.mkdir(parents=True, exist_ok=True)
                assert 0 <= start < end <= track['duration'] + .001
                subprocess.run([
                    imageio_ffmpeg.get_ffmpeg_exe(), '-v', 'error', '-y',
                    '-i', str(root / 'docs' / track['source']),
                    '-ss', str(start), '-t', str(round(end - start, 6)),
                    '-map_metadata', '-1', '-vn', '-c:a', 'aac', '-b:a', '128k',
                    '-movflags', '+faststart', str(target),
                ], check=True)
                track['outputs'].append({'audio': url, 'start': start, 'end': end, 'expected': expected})
                return url
            chunks = [extract(f'chunk-{i+1}', bounds[i], bounds[i+1] + track['tailPadding'][i], text)
                      for i, text in enumerate(unit['chunks'])]
            full = extract('full', bounds[0], bounds[-1], unit['text']) if 'range' in entry else track['source']
            build = [extract(f'build-{i}', bounds[0], bounds[i] + track['tailPadding'][i-1], ' '.join(unit['chunks'][:i]))
                     for i in range(2, len(unit['chunks']))] + [full]
            unit['audio'][voice] = {'chunks': chunks, 'buildUp': build, 'full': full}
        units.append(unit)
    week['practice'] = {'scriptRevision': week['scriptRevision'], 'units': units}
    print(week['id'], len(units), 'practice units', flush=True)
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
plan_path.write_text(json.dumps(plan, ensure_ascii=False, indent=2) + '\n')
