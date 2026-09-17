#!/usr/bin/env python3
"""Generate the layered Khooneh site from content/*.json + _templates/*.html.
Run from the khooneh folder:  python3 _build/build.py
Outputs: index.html (landing), all/, story/, brief/, attempts/, sheets/, questions/, concepts/, proposal/, invite/, en/.
Hand-written sources kept as inputs: _src/all.fa.html (Persian all-in-one), _src/all.en.html (English all-in-one)."""
import json, os, re, shutil, sys
from collections import defaultdict
from jinja2 import Environment, FileSystemLoader, select_autoescape
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from views import render_views

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = os.path.join(ROOT, 'content')
env = Environment(loader=FileSystemLoader(os.path.join(ROOT, '_templates')), autoescape=select_autoescape(['html']), trim_blocks=True, lstrip_blocks=True)

def load(name, default):
    p = os.path.join(C, name)
    if not os.path.exists(p): print('  (missing)', name); return default
    return json.load(open(p, encoding='utf-8'))

brief = load('brief.json', []); story = load('story.json', []); attempts = load('attempts.json', [])
questions = load('questions.json', []); concepts = load('concepts.json', []); sheets = load('sheets.json', [])
proposal = load('proposal.json', None); voices = load('voices.json', []); views_src = load('views.json', []); plans = load('plans-a1.json', []) + load('plans-a3.json', [])

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
_HREF = re.compile(r'href="([^"]*)"')
def fix_links(html):
    """Relative links that end in a folder get an explicit index.html, so pages work from file:// as well as on a server."""
    def fix(m):
        h = m.group(1)
        if h.startswith(('http://', 'https://', 'mailto:', 'data:', '#', '//')): return m.group(0)
        path, frag = (h.split('#', 1) + [''])[:2]
        if path == '' or path.endswith('/'):
            path += 'index.html'
        return f'href="{path}{"#" + frag if frag else ""}"'
    return _HREF.sub(fix, html)
def write(url, template, **ctx):
    out = os.path.join(ROOT, url, 'index.html') if url else os.path.join(ROOT, 'index.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    tpl = env.get_template(template)
    html = tpl.render(root=depth_root(url), url=url, nav=NAV, lang='fa', dir='rtl', next_chapter=next_chapter(url), kind_fa=KIND_FA, **ctx)
    open(out, 'w', encoding='utf-8').write(fix_links(html))
    print('  wrote', url or 'index.html')

sheet_by_id = {s['id']: s for s in sheets}
svg_index = load('../drawings/svg/index.json', {}) if os.path.exists(os.path.join(ROOT, 'drawings', 'svg', 'index.json')) else {}
if not svg_index and os.path.exists(os.path.join(ROOT, 'drawings', 'svg', 'index.json')): svg_index = json.load(open(os.path.join(ROOT, 'drawings', 'svg', 'index.json')))
views = render_views(ROOT, views_src, sheet_by_id) if views_src else []
views_by_node = defaultdict(list)
for v in views:
    for nid in v.get('for', []): views_by_node[nid].append(v)
# schematic plans → js/plans-data.js, and which plans illustrate which node (by room/element tags)
plans_by_id = {p['id']: p for p in plans}
plans_by_sheet = defaultdict(list)
for p in plans: plans_by_sheet[p['sheet']].append(p['id'])
plan_focus = defaultdict(lambda: defaultdict(int))
for p in plans:
    for r in p.get('rooms', []) + p.get('elements', []):
        for t in r.get('tags', []): plan_focus[t][p['id']] += 1
def focus_plans(nid, limit=3):
    return [pid for pid, n in sorted(plan_focus.get(nid, {}).items(), key=lambda kv: -kv[1])[:limit]]
if plans:
    os.makedirs(os.path.join(ROOT, 'js'), exist_ok=True)
    with open(os.path.join(ROOT, 'js', 'plans-data.js'), 'w', encoding='utf-8') as f:
        f.write('/* generated by _build/build.py from content/plans.json — schematic plans in metres, north up */\n')
        f.write('window.KHOONEH = window.KHOONEH || {}; window.KHOONEH.plans = ' + json.dumps(plans_by_id, ensure_ascii=False) + ';\n')
    print('  wrote js/plans-data.js')
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
    write(f"brief/{b['id']}/", 'brief_item.html', b=b, groups=related_groups(b, b['id']), backs=backlink_entries(b['id']), views=views_by_node.get(b['id'], []), plans=[plans_by_id[i] for i in focus_plans(b['id'])],
          prev=brief[i - 1] if i > 0 else None, nxt=brief[i + 1] if i + 1 < len(brief) else None)
# 3D model specs per attempt (elevations from the sheets where drawn; 1403 floor-to-floor assumed 3.20 m)
MODEL = {
 'a1': dict(plans=['a1-basement', 'a1-ground', 'a1-first', 'a1-loft1', 'a1-second', 'a1-third'],
            elev={'a1-basement': -3.12, 'a1-ground': 0.0, 'a1-first': 2.96, 'a1-loft1': 6.08, 'a1-second': 8.88, 'a1-third': 12.58},
            clear={'a1-basement': 2.72, 'a1-ground': 2.56, 'a1-first': 2.8, 'a1-loft1': 2.5, 'a1-second': 3.3, 'a1-third': 3.3}),
 'a3': dict(plans=['a3-basement', 'a3-ground', 'a3-first', 'a3-second', 'a3-third', 'a3-fourth'],
            elev={'a3-basement': -3.5, 'a3-ground': 0.0, 'a3-first': 3.0, 'a3-second': 6.2, 'a3-third': 9.4, 'a3-fourth': 12.6},
            clear={'a3-basement': 3.0, 'a3-ground': 2.7, 'a3-first': 2.9, 'a3-second': 2.9, 'a3-third': 2.9, 'a3-fourth': 2.9}),
}
# attempts
for a in attempts:
    write(f"attempts/{a['id']}/", 'attempt.html', a=a, sheets=[s for s in sheets if s['attempt'] == a['id']], groups=related_groups(a, a['id']), backs=backlink_entries(a['id']), plan_ids=[p['id'] for p in plans if p['attempt'] == a['id']], model_json=json.dumps(MODEL.get(a['id'], {}), ensure_ascii=False) if plans else '')
# sheets
write('sheets/', 'sheets_index.html', a1=a1_sheets, a3=a3_sheets)
for i, s in enumerate(sheets):
    write(f"sheets/{s['id']}/", 'sheet.html', s=s, groups=related_groups(s, s['id']), backs=backlink_entries(s['id']), plan_ids=plans_by_sheet.get(s['id'], []),
          svg=svg_index.get(s['id']), floor_models=[json.dumps(dict(mode='floor', plans=[pid], clear={pid: (MODEL['a1']['clear'].get(pid) or MODEL['a3']['clear'].get(pid) or 3.0)}), ensure_ascii=False) for pid in plans_by_sheet.get(s['id'], [])],
          prev=sheets[i - 1] if i > 0 else None, nxt=sheets[i + 1] if i + 1 < len(sheets) else None)
# questions
write('questions/', 'questions_index.html', items=questions)
for i, q in enumerate(questions):
    write(f"questions/{q['id']}/", 'question.html', q=q, groups=related_groups(q, q['id']), backs=backlink_entries(q['id']), views=views_by_node.get(q['id'], []), plans=[plans_by_id[i] for i in focus_plans(q['id'])],
          prev=questions[i - 1] if i > 0 else None, nxt=questions[i + 1] if i + 1 < len(questions) else None)
# concepts
write('concepts/', 'concepts_index.html', items=concepts)
for c in concepts:
    write(f"concepts/{c['id']}/", 'concept.html', c=c, groups=related_groups(c, c['id']), backs=backlink_entries(c['id']), views=views_by_node.get(c['id'], []), plans=[plans_by_id[i] for i in focus_plans(c['id'])])
# proposal
if proposal:
    # dataset for the diagrams
    lv = []
    for L in proposal['levels']:
        d = dict(id=L['id'], name_fa=L['name_fa'], name=L['name_fa'], elev=L['elev'], clear=L['clear'], note_fa=L.get('program_fa', ''), note=L.get('program_fa', ''))
        if L['id'] == 'm2': d['ghost'] = True; d['short_fa'] = '۲−'; d['label_fa'] = 'طبقهٔ ۲− — مشروط'
        if L['id'].startswith('l'): d['loft'] = True; d['span'] = [12.5, 20.14]
        if L['clear'] >= 5: d['double'] = True; d['voidSpan'] = [6.07, 12.5]; d['default'] = True
        lv.append(d)
    lv.sort(key=lambda x: x['elev'])
    section_ds = dict(plot={'width': 10.5, 'depth': 20.14}, yardDepth=6.07, bodyDepth=14.01, console=1.2, levels=lv,
                      tags={'yard_fa': 'حیاط', 'street_fa': 'کوچه', 'shabak_fa': 'مشبک', 'hoz_fa': 'حوض', 'plot_fa': 'زمین', 'clear_fa': 'متر مفید', 'ghost_fa': 'مشروط',
                            'yard': 'yard', 'street': 'street', 'shabak': 'shabak', 'hoz': 'hoz', 'plot': 'plot', 'clear': 'm clear', 'ghost': 'conditional'},
                      aria_fa='برش پیشنهادی: حیاط عمودی از گودال‌باغچه تا بام')
    units_ds = dict(units={k: dict(name_fa=v['name_fa'], name=v['name_fa'], color=v['color'], area=v.get('area')) for k, v in proposal['units'].items()},
                    floors=[dict(name_fa=f['name_fa'], name=f['name_fa'], segs=[[s[0], s[1], s[2], s[2]] for s in f['segs']]) for f in proposal['floors']],
                    axis={'north_fa': 'کوچه (شمال)', 'south_fa': 'حیاط (جنوب)', 'north': 'street (north)', 'south': 'yard (south)'},
                    caption_fa='هر صفحه توضیح خودش را دارد؛ رنگ‌ها واحدها را دنبال می‌کنند.')
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
    open(out, 'w', encoding='utf-8').write(fix_links(html)); print('  wrote', url)
all_page('_src/all.fa.html', 'all/', 'fa')
all_page('_src/all.en.html', 'en/all/', 'en')
# English landing
write_en = env.get_template('landing_en.html').render(root='../', url='en/', chapters=CHAPTERS, proposal=proposal)
os.makedirs(os.path.join(ROOT, 'en'), exist_ok=True); open(os.path.join(ROOT, 'en', 'index.html'), 'w', encoding='utf-8').write(fix_links(write_en)); print('  wrote en/')
print('done.')
