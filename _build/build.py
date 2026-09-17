#!/usr/bin/env python3
"""Generate the layered Khooneh site from content/*.json + _templates/*.html.
Run from the khooneh folder:  python3 _build/build.py
Outputs: index.html (landing), all/, story/, brief/, attempts/, sheets/, questions/, concepts/, proposal/, invite/, en/.
Hand-written sources kept as inputs: _src/all.fa.html (Persian all-in-one), _src/all.en.html (English all-in-one)."""
import json, os, re, shutil, sys
from collections import defaultdict
from jinja2 import Environment, FileSystemLoader, select_autoescape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = os.path.join(ROOT, 'content')
env = Environment(loader=FileSystemLoader(os.path.join(ROOT, '_templates')), autoescape=select_autoescape(['html']), trim_blocks=True, lstrip_blocks=True)

def load(name, default):
    p = os.path.join(C, name)
    if not os.path.exists(p): print('  (missing)', name); return default
    return json.load(open(p, encoding='utf-8'))

brief = load('brief.json', []); story = load('story.json', []); attempts = load('attempts.json', [])
questions = load('questions.json', []); concepts = load('concepts.json', []); sheets = load('sheets.json', [])
proposal = load('proposal.json', None); voices = load('voices.json', [])

FA_DIGITS = str.maketrans('0123456789', '۰۱۲۳۴۵۶۷۸۹')
def fa_num(x): return str(x).translate(FA_DIGITS)
def paras(s):
    if not s: return []
    return [p.strip() for p in re.split(r'\n\s*\n', s.strip()) if p.strip()]
def strip_num(s): return re.sub(r'^[\d۰-۹]+[\.\-–—)]\s*', '', s or '')
env.filters['paras'] = paras; env.filters['fa'] = fa_num; env.filters['strip_num'] = strip_num

# ---------- registry of nodes: id -> {kind, title, url}
KIND_FA = {'brief': 'شاخص', 'question': 'پرسش', 'concept': 'مفهوم', 'sheet': 'نقشه', 'attempt': 'طرح', 'event': 'رویداد', 'proposal': 'پیشنهاد', 'voice': 'میان‌پرده'}
KIND_GROUP_FA = {'brief': 'شاخص‌ها', 'question': 'پرسش‌های باز', 'concept': 'مفاهیم', 'sheet': 'نقشه‌ها', 'attempt': 'طرح‌ها', 'event': 'داستان', 'proposal': 'پیشنهاد', 'voice': 'در میانهٔ داستان'}
reg = {}
def add(kind, node, title, url): reg[node['id']] = {'kind': kind, 'title': title, 'url': url, 'node': node}
for b in brief: add('brief', b, f"شاخص {fa_num(b['n'])} — {b.get('short_fa') or b['text_fa'][:40] + '…'}", f"brief/{b['id']}/")
for q in questions: add('question', q, q['title_fa'], f"questions/{q['id']}/")
for c in concepts: add('concept', c, c['term_fa'], f"concepts/{c['id']}/")
for s in sheets: add('sheet', s, s['title_fa'], f"sheets/{s['id']}/")
for a in attempts: add('attempt', a, a['title_fa'], f"attempts/{a['id']}/")
for e in story: add('event', e, e['title_fa'], f"story/#{e['id']}")
if proposal: add('proposal', proposal, proposal['title_fa'], 'proposal/')
for v in voices: add('voice', v, v['name_fa'], f"voices/{v['id']}/")

# backlinks: id -> [ids that reference it]
back = defaultdict(list)
for nid, r in reg.items():
    rel = r['node'].get('related') or {}
    for kind, ids in rel.items():
        for t in ids or []:
            if t in reg and t != nid and nid not in back[t]: back[t].append(nid)

def related_groups(node, exclude_id=None):
    """[(group title, [registry entries])] in a fixed order, only for ids that exist."""
    rel = node.get('related') or {}
    order = ['attempt', 'sheet', 'brief', 'question', 'concept', 'proposal', 'voice']
    out = []
    for kind in order:
        ids = []
        for k, v in rel.items():
            for t in v or []:
                if t in reg and reg[t]['kind'] == kind and t != exclude_id and t not in ids: ids.append(t)
        if ids: out.append((KIND_GROUP_FA[kind], [dict(reg[t], id=t) for t in ids]))
    return out

def backlink_entries(nid):
    return [dict(reg[t], id=t) for t in back.get(nid, [])]

# ---------- navigation and chapters
NAV = [('', 'خانه'), ('brief/', 'شاخص‌ها'), ('story/', 'داستان'), ('attempts/a1/', 'طرح ۱۳۹۹'), ('attempts/a3/', 'طرح ۱۴۰۳'), ('sheets/', 'نقشه‌ها'),
       ('questions/', 'پرسش‌ها'), ('concepts/', 'مفاهیم'), ('proposal/', 'پیشنهاد'), ('invite/', 'دعوت'), ('all/', 'همه در یک صفحه')]
CHAPTERS = [
    ('brief/', 'شاخص‌ها', 'نوزده چیزی که یک خانواده از خانه‌اش خواست'),
    ('story/', 'داستان تا اینجا', 'هفت سال، دو طرح، و خانه‌ای که ساخته نشد'),
    ('attempts/a1/', 'طرح ۱۳۹۹', 'طرحی که تأیید شد و ساخته نشد'),
    ('attempts/a3/', 'طرح ۱۴۰۳', 'طرحی که می‌شد ساخت'),
    ('sheets/', 'نقشه‌ها', 'دوازده شیت، یکی‌یکی'),
    ('questions/', 'پرسش‌های باز', 'ده چیزی که هیچ طرحی جواب نداد'),
    ('proposal/', 'پیشنهاد', 'جمع‌بندی همهٔ این‌ها در یک برش'),
    ('invite/', 'دعوت', 'برای کسی که بخواهد ادامه بدهد'),
]
def next_chapter(url):
    for i, (u, t, s) in enumerate(CHAPTERS):
        if u == url and i + 1 < len(CHAPTERS): return CHAPTERS[i + 1]
    return None

# ---------- writing
def depth_root(url): return '../' * url.count('/')
def write(url, template, **ctx):
    out = os.path.join(ROOT, url, 'index.html') if url else os.path.join(ROOT, 'index.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    tpl = env.get_template(template)
    html = tpl.render(root=depth_root(url), url=url, nav=NAV, lang='fa', dir='rtl', next_chapter=next_chapter(url), kind_fa=KIND_FA, **ctx)
    open(out, 'w', encoding='utf-8').write(html)
    print('  wrote', url or 'index.html')

sheet_by_id = {s['id']: s for s in sheets}
a1_sheets = [s for s in sheets if s['attempt'] == 'a1']; a3_sheets = [s for s in sheets if s['attempt'] == 'a3']

print('building…')
# landing
write('', 'landing.html', chapters=CHAPTERS, brief_count=len(brief), sheets_count=len(sheets), questions_count=len(questions))
# story
write('story/', 'story.html', events=[dict(e, groups=related_groups(e)) for e in story], voices=voices)
for v in voices:
    write(f"voices/{v['id']}/", 'voice.html', v=v, groups=related_groups(v, v['id']), backs=backlink_entries(v['id']))
# brief
write('brief/', 'brief_index.html', items=brief)
for i, b in enumerate(brief):
    write(f"brief/{b['id']}/", 'brief_item.html', b=b, groups=related_groups(b, b['id']), backs=backlink_entries(b['id']),
          prev=brief[i - 1] if i > 0 else None, nxt=brief[i + 1] if i + 1 < len(brief) else None)
# attempts
for a in attempts:
    write(f"attempts/{a['id']}/", 'attempt.html', a=a, sheets=[s for s in sheets if s['attempt'] == a['id']], groups=related_groups(a, a['id']), backs=backlink_entries(a['id']))
# sheets
write('sheets/', 'sheets_index.html', a1=a1_sheets, a3=a3_sheets)
for i, s in enumerate(sheets):
    write(f"sheets/{s['id']}/", 'sheet.html', s=s, groups=related_groups(s, s['id']), backs=backlink_entries(s['id']),
          prev=sheets[i - 1] if i > 0 else None, nxt=sheets[i + 1] if i + 1 < len(sheets) else None)
# questions
write('questions/', 'questions_index.html', items=questions)
for i, q in enumerate(questions):
    write(f"questions/{q['id']}/", 'question.html', q=q, groups=related_groups(q, q['id']), backs=backlink_entries(q['id']),
          prev=questions[i - 1] if i > 0 else None, nxt=questions[i + 1] if i + 1 < len(questions) else None)
# concepts
write('concepts/', 'concepts_index.html', items=concepts)
for c in concepts:
    write(f"concepts/{c['id']}/", 'concept.html', c=c, groups=related_groups(c, c['id']), backs=backlink_entries(c['id']))
# proposal
if proposal:
    # dataset for the diagrams
    lv = []
    for L in proposal['levels']:
        d = dict(id=L['id'], name_fa=L['name_fa'], name=L['name_fa'], elev=L['elev'], clear=L['clear'], note_fa=L.get('program_fa', ''), note=L.get('program_fa', ''))
        if L['id'] == 'm2': d['ghost'] = True; d['short_fa'] = '۲−'; d['label_fa'] = 'طبقهٔ ۲− — مشروط'
        if L['id'].startswith('l'): d['loft'] = True; d['from'] = 12.5
        if L['clear'] >= 5: d['double'] = True; d['voidTo'] = 12.5; d['default'] = True
        lv.append(d)
    lv.sort(key=lambda x: x['elev'])
    section_ds = dict(plot={'width': 10.5, 'depth': 20.14}, yardDepth=6.07, bodyDepth=14.01, console=1.2, levels=lv,
                      tags={'yard_fa': 'حیاط', 'street_fa': 'کوچه', 'shabak_fa': 'مشبک', 'hoz_fa': 'حوض', 'plot_fa': 'زمین', 'clear_fa': 'متر مفید', 'ghost_fa': 'مشروط',
                            'yard': 'yard', 'street': 'street', 'shabak': 'shabak', 'hoz': 'hoz', 'plot': 'plot', 'clear': 'm clear', 'ghost': 'conditional'},
                      aria_fa='برش پیشنهادی: حیاط عمودی از گودال‌باغچه تا بام')
    units_ds = dict(units={k: dict(name_fa=v['name_fa'], name=v['name_fa'], color=v['color'], area=v.get('area')) for k, v in proposal['units'].items()},
                    floors=[dict(name_fa=f['name_fa'], name=f['name_fa'], segs=[[s[0], s[1], s[2], s[2]] for s in f['segs']]) for f in proposal['floors']],
                    axis={'north_fa': 'کوچه (شمال)', 'south_fa': 'حیاط (جنوب)', 'north': 'street (north)', 'south': 'yard (south)'},
                    caption_fa='روی هر صفحه بروید یا لمس کنید. رنگ‌ها واحدها را دنبال می‌کنند.')
    write('proposal/', 'proposal.html', p=proposal, groups=related_groups(proposal, 'p1'), backs=backlink_entries('p1'),
          section_json=json.dumps(section_ds, ensure_ascii=False), units_json=json.dumps(units_ds, ensure_ascii=False))
# invite
write('invite/', 'invite.html', sheets=sheets)

# all-in-one pages: post-process the hand-written single pages
def nav_html(root, lang):
    if lang == 'fa':
        items = ''.join(f'<a href="{root}{u}">{t}</a>' for u, t in NAV)
        return f'<nav aria-label="بخش‌ها">{items}<a class="lang" href="{root}en/" hreflang="en" lang="en">English</a></nav>'
    items = ''.join(f'<a href="{root}en/">Home</a><a href="{root}en/all/">Everything on one page</a>' for _ in [0])
    return f'<nav aria-label="Sections">{items}<a class="lang" href="{root}" hreflang="fa" lang="fa">فارسی</a></nav>'
def relocate(html, root):
    html = re.sub(r'(href|src|content)="(css/|js/|drawings/)', lambda m: f'{m.group(1)}="{root}{m.group(2)}', html)
    return html
def all_page(src, url, lang):
    p = os.path.join(ROOT, src)
    if not os.path.exists(p): print('  (missing)', src); return
    html = open(p, encoding='utf-8').read()
    root = depth_root(url)
    html = re.sub(r'<nav aria-label="[^"]*">.*?</nav>', nav_html(root, lang), html, count=1, flags=re.S)
    html = relocate(html, root)
    html = html.replace('href="#top"', f'href="{root}"')
    out = os.path.join(ROOT, url, 'index.html'); os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w', encoding='utf-8').write(html); print('  wrote', url)
all_page('_src/all.fa.html', 'all/', 'fa')
all_page('_src/all.en.html', 'en/all/', 'en')
# English landing
write_en = env.get_template('landing_en.html').render(root='../', url='en/', chapters=CHAPTERS, proposal=proposal)
os.makedirs(os.path.join(ROOT, 'en'), exist_ok=True); open(os.path.join(ROOT, 'en', 'index.html'), 'w', encoding='utf-8').write(write_en); print('  wrote en/')
print('done.')
