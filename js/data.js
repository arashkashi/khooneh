/* Dimensions measured from the drawing sheets (metres). Mirror of private/geometry.json — keep in sync.
   Text fields carry both languages; T() picks by <html lang>. */
window.KHOONEH = {
  lang: (document.documentElement.lang || 'en').slice(0, 2),
  T(o, k) { return this.lang === 'fa' && o[k + '_fa'] != null ? o[k + '_fa'] : o[k]; },
  attempt1: {
    plot: { width: 10.55, depth: 19.0 },
    yardDepth: 6.4,      // south yard, ground level
    bodyDepth: 11.4,     // GF/basement body
    console: 1.2,        // upper floors project 1.20 toward the yard (south); a 0.50 flower box sits on the street edge
    consoleSide: 'yard', // section: GF/basement body is set back 1.20 from the yard; street face flush (default 'street' = body flush to the yard, console over the street)
    flowerBox: 0.5,      // section: planter strip cantilevered over the street edge at the first floor
    levels: [
      { id: 'm2', name: 'Level −2', name_fa: 'طبقهٔ ۲−', elev: -6.2, clear: 2.8, ghost: true,
        note: 'Never drawn. The brief asks for a second basement as a shared recreational and cultural room. This is where the story is open.',
        note_fa: 'هرگز ترسیم نشد. شاخص‌ها زیرزمین دومی می‌خواهند: اتاقی مشترک برای ورزش، آب و دور هم بودن. داستان همین‌جا باز است.' },
      { id: 'b',  name: 'Basement', name_fa: 'زیرزمین', elev: -3.12, clear: 2.72,
        note: 'Caretaker unit, powerhouse, stores, a jacuzzi with shower and locker room, and a sunken courtyard open to the sky with a tree.',
        note_fa: 'واحد سرایدار، موتورخانه، انباری‌ها، جکوزی با دوش و رختکن، و گودال‌باغچه‌ای رو به آسمان با یک درخت.' },
      { id: 'gf', name: 'Ground', name_fa: 'همکف', elev: 0, clear: 2.56,
        note: 'Three cars inside, one in the yard. A shabak screen and a green wall separate cars from the courtyard void; opaque glass flooring lets light down to the basement.',
        note_fa: 'سه ماشین داخل، یکی در حیاط. مشبک و دیوار سبز ماشین‌ها را از حفرهٔ حیاط جدا می‌کند؛ کف شیشه‌ای مات نور را به زیرزمین می‌رساند.' },
      { id: 'f1', name: 'First floor', name_fa: 'طبقهٔ اول', elev: 2.96, clear: 5.52, double: true, voidSpan: [13.2, 19.0],
        note: 'Open kitchen–dining–living under a 5.52 m ceiling, two bedrooms, a study box, a balcony with a sliding floor, and a stair up to the loft.',
        note_fa: 'آشپزخانه، ناهارخوری و نشیمن یکپارچه زیر سقفی ۵٫۵۲ متری، دو خواب، اتاقک کار، بالکنی با کف کشویی، و پله‌ای به نیم‌طبقه.' },
      { id: 'l1', name: 'Loft', name_fa: 'نیم‌طبقه', elev: 6.08, clear: 2.56, loft: true, span: [6.4, 13.2],
        note: 'Library, bedroom, bath and a “smoking-free room” with its own exhaust, hung over the south rooms of the first floor; the living room at the street side stays double-height.',
        note_fa: 'کتابخانه، خواب، حمام و «اتاق سیگار» با اگزاست مستقل، آویخته روی اتاق‌های جنوبی طبقهٔ اول؛ نشیمن سمت کوچه دوارتفاعه می‌ماند.' },
      { id: 'f2', name: 'Second floor', name_fa: 'طبقهٔ دوم', elev: 8.88, clear: 3.3,
        note: 'Family room, library, laundry, two bedrooms, a north balcony. The sheet also shows a loft for this floor that the 3.30 m section cannot hold — an open inconsistency in the 2020 set.',
        note_fa: 'اتاق خانواده، کتابخانه، لباسشویی، دو خواب، بالکن شمالی. شیت یک نیم‌طبقه هم برای این طبقه نشان می‌دهد که در برش ۳٫۳۰ متری جا نمی‌گیرد — ناسازگاری باز مجموعهٔ ۱۳۹۹.' },
      { id: 'f3', name: 'Third floor', name_fa: 'طبقهٔ سوم', elev: 12.58, clear: 3.3,
        note: 'A two-bedroom flat with an open living room, a master bedroom and a study: the parents’ unit.',
        note_fa: 'واحدی دوخوابه با نشیمن باز، خواب اصلی و اتاق کار: واحد پدر و مادر.' },
      { id: 'r',  name: 'Roof', name_fa: 'بام', elev: 16.28, clear: 1.6,
        note: 'Roof garden with vegetable beds, meant to be reachable from every floor. The stair box rises to +17.88.',
        note_fa: 'بام سبز با باغچهٔ سبزی، که قرار بود از همهٔ طبقات در دسترس باشد. باکس پله تا ۱۷٫۸۸+ بالا می‌رود.' }
    ],
    tags: { yard: 'yard', yard_fa: 'حیاط', street: 'street', street_fa: 'کوچه', shabak: 'shabak', shabak_fa: 'مشبک', hoz: 'hoz', hoz_fa: 'حوض',
            ghost: 'level −2 — never drawn', ghost_fa: 'طبقهٔ ۲− — هرگز ترسیم نشد', plot: 'plot', plot_fa: 'زمین', clear: 'm clear', clear_fa: 'متر مفید' }
  },
  attempt3: {
    plot: { width: 10.5, depth: 20.14 },
    units: {
      p:  { name: 'Parking',          name_fa: 'پارکینگ',        color: '#c9cdc9' },
      j:  { name: 'Caretaker unit',   name_fa: 'واحد سرایدار',   color: '#d8c3a5', area: 52 },
      o:  { name: 'One-bedroom flat', name_fa: 'واحد یک‌خوابه',  color: '#a9c9c6', area: 62 },
      a:  { name: 'Duplex A',         name_fa: 'دوبلکس الف',     color: '#7fb3af', area: 165 },
      s:  { name: 'Student duplex',   name_fa: 'دوبلکس دانشجویی', color: '#e0b56a', area: 76 },
      b:  { name: 'Main duplex',      name_fa: 'دوبلکس اصلی',    color: '#3f9b96', area: 241 },
      c:  { name: 'Commons',          name_fa: 'فضای مشترک',     color: '#bfd6b3' }
    },
    axis: { north: 'street (north)', north_fa: 'کوچه (شمال)', south: 'yard (south)', south_fa: 'حیاط (جنوب)' },
    /* each floor: segments from north (street) to south, as share of the plate */
    floors: [
      { name: 'Roof', name_fa: 'بام', segs: [['b', 1, 'roof garden, private to the main duplex', 'بام سبز، اختصاصی دوبلکس اصلی']] },
      { name: 'Fourth floor', name_fa: 'طبقهٔ چهارم', segs: [['b', 1, 'master suite, living, kitchen, terrace', 'مستر، نشیمن، آشپزخانه، تراس']] },
      { name: 'Third floor', name_fa: 'طبقهٔ سوم', segs: [['b', 0.72, 'two bedrooms + private living', 'دو خواب و نشیمن خصوصی'], ['s', 0.28, 'student living + kitchen (38.82 m²)', 'نشیمن و آشپزخانهٔ دانشجویی (۳۸٫۸۲ متر)']] },
      { name: 'Second floor', name_fa: 'طبقهٔ دوم', segs: [['a', 0.52, 'bedrooms (two on the sheet, three after the last review)', 'خواب‌ها (دو روی شیت، سه پس از بازنگری آخر)'], ['s', 0.48, 'student bedrooms, spiral stair (66.16 m²)', 'خواب‌های دانشجویی، پلهٔ گرد (۶۶٫۱۶ متر)']] },
      { name: 'First floor', name_fa: 'طبقهٔ اول', segs: [['o', 0.48, '62 m² flat', 'واحد ۶۲ متری'], ['a', 0.52, 'living, iwan, kitchen', 'نشیمن، ایوان، آشپزخانه']] },
      { name: 'Ground', name_fa: 'همکف', segs: [['p', 0.82, '5 cars standard, 8 at most', '۵ ماشین استاندارد، حداکثر ۸'], ['c', 0.18, 'sunken garden void', 'حفرهٔ گودال‌باغچه']] },
      { name: 'Basement', name_fa: 'زیرزمین', segs: [['j', 0.5, '52 m² caretaker unit', 'واحد سرایدار ۵۲ متری'], ['c', 0.5, 'pool → hoz, stores, plant', 'استخر ← حوض، انباری، موتورخانه']] }
    ],
    caption: 'Hover or tap a plate. Three of the four units span two floors; the second floor needs no lift access, so the same plans work whether the street is zoned for three floors or four.',
    caption_fa: 'با رفتن روی هر صفحه یا لمس آن، توضیحش دیده می‌شود. سه واحد از چهار واحد دو طبقه را می‌گیرند؛ طبقهٔ دوم به آسانسور نیاز ندارد، پس همین نقشه‌ها در تراکم سه‌طبقه و چهارطبقه هر دو کار می‌کند.'
  }
};
/* attempt1plus: the 2020 section with the family's idea of a fourth floor on top (allowed since 2024 if four floors are granted).
   A deep copy of attempt1 — the original is not touched. The idea floor and the moved roof are ghost levels (dashed, hatched). */
window.KHOONEH.attempt1plus = (function (A) {
  const P = JSON.parse(JSON.stringify(A));
  const r = P.levels.find(l => l.id === 'r');
  P.levels.splice(P.levels.indexOf(r), 0, {
    id: 'f4', name: 'Fourth floor (idea)', name_fa: 'طبقهٔ چهارم (ایده)', elev: 16.28, clear: 3.30, ghost: true, upper: true, default: true,
    label: 'fourth floor — the family’s idea, not drawn', label_fa: 'طبقهٔ چهارم — ایدهٔ خانواده، ترسیم‌نشده',
    base: 'roof 2020', base_fa: 'بام ۱۳۹۹',
    note: 'The family’s idea, not drawn: one more floor on the 2020 section, allowed since 2024 if four floors are granted. Roof would rise to about +19.9.',
    note_fa: 'ایدهٔ خانواده، ترسیم‌نشده: یک طبقه روی برش ۱۳۹۹، اگر تراکم چهار طبقه داده شود. بام به حدود ۱۹٫۹+ می‌رسد.' });
  Object.assign(r, { name: 'Roof (idea)', name_fa: 'بام (ایده)', elev: 19.98, ghost: true, upper: true, roof: true,
    note: 'With a fourth floor the roof garden and the stair box move up one storey: roof at about +19.98, stair box to about +21.6. The 2020 roof at +16.28 becomes the floor of the new storey.',
    note_fa: 'با طبقهٔ چهارم، بام سبز و باکس پله یک طبقه بالا می‌روند: بام در حدود ۱۹٫۹۸+، باکس پله تا حدود ۲۱٫۶+. بام ۱۳۹۹ در ۱۶٫۲۸+ کفِ طبقهٔ تازه می‌شود.' });
  return P;
})(window.KHOONEH.attempt1);
