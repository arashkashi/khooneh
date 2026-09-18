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
/* next: the family's idea for the next design (content/plans-next.json), NOT a measured drawing — every slab is hatched and
   a watermark says so. Section x runs from the yard end (0) to the street (20.14): x = 20.14 − y of the plan files.
   Plan y 0.3–14.0 → x 6.14–19.84 (GF/basement body); the console adds 1.20 toward the yard from the first floor (x 4.94). */
window.KHOONEH.next = {
  idea: true,
  plot: { width: 10.5, depth: 20.14 },
  yardDepth: 4.94,       // upper floors' yard face: plan y 15.2
  bodyDepth: 14.0,       // GF/basement body from the street line
  console: 1.2, consoleSide: 'yard',
  basementFrom: 6.14,    // the basement stops at the body's yard face; nothing under the yard
  courtyard: [1.54, 5.54],   // sunken garden, plan y 14.6–18.6, with its own retaining wall outside the mat
  treeX: 3.0,
  stairHouse: { span: [14.84, 19.84], height: 2.65 },   // over the stair, plan y 0.3–5.3 (the lift's overrun is not drawn)
  shaft: { span: [11.14, 14.14], skylight: 1.0 },       // the void on the west wall, plan y 6–9, from the basement floor to a skylight
  risers: [[9.14, 10.74]],                              // R2, plan y 9.4–11: where it pierces each slab
  hozAt: 6.7, carX: 4.9,
  levels: [
    { id: 'm1', name: 'Basement', name_fa: 'زیرزمین', elev: -3.2, clear: 2.9,
      note: 'Caretaker at the street end; hoz, sauna and a movement room facing the sunken garden; the foot of the void is a small garden.',
      note_fa: 'سرایدار در شمال؛ حوض، سونا و اتاق حرکت رو به گودال‌باغچه؛ پای حفره باغچهٔ کوچکی است.' },
    { id: 'gf', name: 'Ground', name_fa: 'همکف', elev: 0, clear: 2.7,
      note: 'Five cars on the west and east strips; the void’s floor is opaque glass and passes light to the garden below.',
      note_fa: 'پنج خودرو در نوار غربی و شرقی؛ کف حفره شیشهٔ مات است و نور را به باغچهٔ زیر می‌رساند.' },
    { id: 'f1', name: 'First floor', name_fa: 'طبقهٔ اول', elev: 3.0, clear: 2.9,
      note: 'The parents, on one level: living toward the yard under the console, two bedrooms toward the street.',
      note_fa: 'پدر و مادر، با کف مسطح: نشیمن رو به حیاط زیر کنسول، دو خواب رو به کوچه.' },
    { id: 'f2', name: 'Second floor', name_fa: 'طبقهٔ دوم', elev: 6.2, clear: 2.9,
      note: 'The second household to the south and middle; the student unit to the north with its own entrance.',
      note_fa: 'خانوار دوم در جنوب و میانه؛ واحد دانشجویی در شمال با ورودی خودش.' },
    { id: 'f3', name: 'Third floor', name_fa: 'طبقهٔ سوم', elev: 9.4, clear: 2.9, double: true, voidClear: 6.1, voidSpan: [4.94, 10.74], default: true,
      note: 'The large family, lower floor: the living room toward the tree, about six metres tall, because the fourth-floor slab is left out over it.',
      note_fa: 'خانوادهٔ بزرگ، پایین: نشیمن رو به درخت، حدود شش متر بلند، چون سقف طبقهٔ چهارم روی آن برداشته شده.' },
    { id: 'f4', name: 'Fourth floor', name_fa: 'طبقهٔ چهارم', elev: 12.6, clear: 2.9, loft: true, span: [10.74, 20.14],
      note: 'The large family, upper floor: three bedrooms toward the street and a gallery over the living; no floor over the living.',
      note_fa: 'خانوادهٔ بزرگ، بالا: سه خواب رو به کوچه و گالری مشرف به نشیمن؛ روی نشیمن کف ندارد.' },
    { id: 'r', name: 'Roof', name_fa: 'بام', elev: 15.8, clear: 2.65,
      note: 'A roof for everyone: beds, a pergola, the void’s skylight; the stair house rises 2.65 m.',
      note_fa: 'بام برای همه: باغچه‌ها، پرگولا، نورگیر حفره؛ خرپشته ۲٫۶۵ متر بالا می‌رود.' }
  ],
  tags: { yard: 'yard', yard_fa: 'حیاط', street: 'street', street_fa: 'کوچه', shabak: 'shabak', shabak_fa: 'مشبک', hoz: 'hoz', hoz_fa: 'حوض',
          plot: 'plot', plot_fa: 'زمین', clear: 'm clear', clear_fa: 'متر مفید',
          shaft: 'void', shaft_fa: 'حفره', skylight: 'skylight', skylight_fa: 'نورگیر', glass: 'glass floor', glass_fa: 'کف شیشه‌ای',
          riser: 'riser', riser_fa: 'رایزر', garden: 'sunken garden', garden_fa: 'گودال‌باغچه', stairHouse: 'stair house', stairHouse_fa: 'خرپشته',
          idea: 'the family’s idea — not a drawing', idea_fa: 'ایدهٔ خانواده — نه نقشه' },
  aria: 'The family’s idea in section: the void from the sunken garden to the roof skylight', aria_fa: 'برش ایدهٔ خانواده: حفره از گودال‌باغچه تا نورگیر بام'
};
