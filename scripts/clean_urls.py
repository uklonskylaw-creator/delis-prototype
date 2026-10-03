#!/usr/bin/env python3
"""Generate GitHub Pages directory routes from the editable HTML pages."""
import json
import posixpath
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MARKER = '<!-- generated clean URL route -->'

def route(path):
    return '/' + (path[:-10] if path.endswith('index.html') else path[:-5] + '/')

def rewrite(text, directory):
    # Include URL prefixes inside template literals; preserve queries and hashes.
    def replace(match):
        path = match.group(0)
        return route(posixpath.normpath(posixpath.join(directory, path)).lstrip('/'))
    return re.sub(r'(?<=[\s\x22\x27`=])(?:\.{1,2}/)*(?:[\w-]+/)*[\w-]+\.html', replace, text)

sources = [p for p in ROOT.rglob('*.html')
           if '.git' not in p.parts and MARKER not in p.read_text()]
for path in sources:
    relative = path.relative_to(ROOT).as_posix()
    clean = route(relative)
    directory = posixpath.dirname(relative)
    text = rewrite(path.read_text(), directory)
    # A base keeps existing image, CSS, fetch and script paths working after moving.
    base = '/' + directory + '/' if directory else '/'
    if '<base ' not in text:
        head = ('\n<base href=' + json.dumps(base) + '>\n'
                '<link rel="canonical" href="https://delis-agent.ru' + clean + '">\n'
                '<script>if (/\\.html$/.test(location.pathname)) '
                'location.replace(' + json.dumps(clean) + ' + location.search + location.hash);</script>\n')
        text = text.replace('<head>', '<head>' + head, 1)
    text = re.sub(r'(href=[\x22\x27])#', lambda m: m[1] + clean + '#', text)
    path.write_text(text)
    if not relative.endswith('index.html'):
        target = ROOT / clean.lstrip('/') / 'index.html'
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(MARKER + '\n' + text)

for path in ROOT.rglob('*.js'):
    if '.git' in path.parts or 'vendor' in path.parts:
        continue
    relative = path.relative_to(ROOT).as_posix()
    text = path.read_text()
    if relative == 'js/main.js':
        text = text.replace('index.html', '').replace('.html', '/')
        text = re.sub(r'function rootPrefix\(\) \{.*?\n\}', "function rootPrefix() {\n  return '/';\n}", text, count=1, flags=re.S)
        text = text.replace('`pages/${page}', '`/pages/${page}')
    else:
        directory = 'pages' if relative == 'js/object.js' else posixpath.dirname(relative)
        text = rewrite(text, directory)
    path.write_text(text)

print(f'Updated {len(sources)} source pages and their directory routes.')
