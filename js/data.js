/* Dimensions measured from the drawing sheets (metres). Mirror of private/geometry.json — keep in sync.
   Text fields carry both languages; T() picks by <html lang>. */
window.KHOONEH = {
  lang: (document.documentElement.lang || 'en').slice(0, 2),
  T(o, k) { return this.lang === 'fa' && o[k + '_fa'] != null ? o[k + '_fa'] : o[k]; },
  attempt1: {
    plot: { width: 10.55, depth: 19.0 },
    yardDepth: 6.4,      // south yard, ground level
    bodyDepth: 11.4,     // GF/basement body
    console: 1.2,        // upper floors project north over the street
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
      { id: 'f1', name: 'First floor', name_fa: 'طبقهٔ اول', elev: 2.96, clear: 5.52, double: true,
        note: 'Open kitchen–dining–living under a 5.52 m ceiling, two bedrooms, a study box, a balcony with a sliding floor, and a stair up to the loft.',
        note_fa: 'آشپزخانه، ناهارخوری و نشیمن یکپارچه زیر سقفی ۵٫۵۲ متری، دو خواب، اتاقک کار، بالکنی با کف کشویی، و پله‌ای به نیم‌طبقه.' },
      { id: 'l1', name: 'Loft', name_fa: 'نیم‌طبقه', elev: 6.08, clear: 2.56, loft: true,
        note: 'Library, bedroom, bath and a “smoking-free room” with its own exhaust, hung over the north half of the first floor.',
        note_fa: 'کتابخانه، خواب، حمام و «اتاق سیگار» با اگزاست مستقل، آویخته روی نیمهٔ شمالی طبقهٔ اول.' },
      { id: 'f2', name: 'Second floor', name_fa: 'طبقهٔ دوم', elev: 8.88, clear: 3.3,
        note: 'Family room, library, laundry, two bedrooms, a north balcony — and its own loft above.',
        note_fa: 'اتاق خانواده، کتابخانه، لباسشویی، دو خواب، بالکن شمالی — و نیم‌طبقه‌ای از آنِ خودش در بالا.' },
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
      { name: 'Third floor', name_fa: 'طبقهٔ سوم', segs: [['b', 0.72, 'two bedrooms + private living', 'دو خواب و نشیمن خصوصی'], ['s', 0.28, 'student bedroom', 'خواب واحد دانشجویی']] },
      { name: 'Second floor', name_fa: 'طبقهٔ دوم', segs: [['a', 0.52, 'three bedrooms', 'سه خواب'], ['s', 0.48, 'student living, spiral stair', 'نشیمن دانشجویی، پلهٔ گرد']] },
      { name: 'First floor', name_fa: 'طبقهٔ اول', segs: [['o', 0.48, '62 m² flat', 'واحد ۶۲ متری'], ['a', 0.52, 'living, iwan, kitchen', 'نشیمن، ایوان، آشپزخانه']] },
      { name: 'Ground', name_fa: 'همکف', segs: [['p', 0.82, '5 cars standard, 8 at most', '۵ ماشین استاندارد، حداکثر ۸'], ['c', 0.18, 'sunken garden void', 'حفرهٔ گودال‌باغچه']] },
      { name: 'Basement', name_fa: 'زیرزمین', segs: [['j', 0.5, '52 m² caretaker unit', 'واحد سرایدار ۵۲ متری'], ['c', 0.5, 'pool → hoz, stores, plant', 'استخر ← حوض، انباری، موتورخانه']] }
    ],
    caption: 'Hover or tap a plate. Three of the four units span two floors; the second floor needs no lift access, so the same plans work whether the street is zoned for three floors or four.',
    caption_fa: 'روی هر صفحه بروید یا لمس کنید. سه واحد از چهار واحد دو طبقه را می‌گیرند؛ طبقهٔ دوم به آسانسور نیاز ندارد، پس همین نقشه‌ها در تراکم سه‌طبقه و چهارطبقه هر دو کار می‌کند.'
  }
};
