"""Render plan views: a crop of a sheet with the relevant zone kept at full contrast and outlined in turquoise,
everything else dimmed. Labels are NOT drawn into the image (Persian shaping) — the template overlays them as HTML."""
import os, json
from PIL import Image, ImageDraw

TURQ = (29, 143, 138)

def render_views(root, views, sheets_by_id, out_dir='drawings/views', max_w=1400):
    os.makedirs(os.path.join(root, out_dir), exist_ok=True)
    cache = {}
    results = []
    for v in views:
        sh = sheets_by_id.get(v['sheet'])
        if not sh: print('  view: unknown sheet', v['id'], v['sheet']); continue
        src = os.path.join(root, sh['src'])
        if src not in cache: cache[src] = Image.open(src).convert('RGB')
        im = cache[src]; W, H = im.size
        x0, y0, x1, y1 = v['crop']
        box = (int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H))
        crop = im.crop(box)
        cw, ch = crop.size
        # dim layer with holes at the highlights
        dim = Image.new('RGBA', crop.size, (247, 247, 244, 150))
        dd = ImageDraw.Draw(dim)
        rects = []
        for h in v.get('highlights', []):
            hx0, hy0, hx1, hy1 = h[:4]
            r = (int((hx0 * W) - box[0]), int((hy0 * H) - box[1]), int((hx1 * W) - box[0]), int((hy1 * H) - box[1]))
            rects.append(r)
            dd.rectangle(r, fill=(0, 0, 0, 0))
        out = crop.convert('RGBA'); out.alpha_composite(dim)
        od = ImageDraw.Draw(out, 'RGBA')
        for r in rects:
            od.rectangle(r, fill=TURQ + (34,), outline=TURQ + (255,), width=max(3, cw // 300))
        out = out.convert('RGB')
        if out.width > max_w: out = out.resize((max_w, int(out.height * max_w / out.width)), Image.LANCZOS)
        name = f"{v['id']}.webp"
        out.save(os.path.join(root, out_dir, name), 'WEBP', quality=82, method=6)
        # label positions in percent of the crop, for HTML overlays
        labels = []
        for h in v.get('highlights', []):
            hx0, hy0, hx1, hy1 = h[:4]
            labels.append({'left': round((hx0 - x0) / (x1 - x0) * 100, 2), 'top': round((hy0 - y0) / (y1 - y0) * 100, 2),
                           'width': round((hx1 - hx0) / (x1 - x0) * 100, 2), 'height': round((hy1 - hy0) / (y1 - y0) * 100, 2),
                           'label': h[4] if len(h) > 4 else ''})
        results.append(dict(v, img=f'{out_dir}/{name}', w=out.width, h=out.height, labels=labels,
                            locator={'left': round(x0 * 100, 2), 'top': round(y0 * 100, 2), 'width': round((x1 - x0) * 100, 2), 'height': round((y1 - y0) * 100, 2)},
                            sheet_title=sh['title_fa'], sheet_thumb=sh['thumb'], sheet_w=sh['w'], sheet_h=sh['h']))
    print(f'  rendered {len(results)} views')
    return results
