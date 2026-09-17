/* Dimensions measured from the drawing sheets (metres). Mirror of private/geometry.json — keep in sync. */
window.KHOONEH = {
  attempt1: {
    plot: { width: 10.55, depth: 19.0 },
    yardDepth: 6.4,      // south yard, ground level
    bodyDepth: 11.4,     // GF/basement body
    console: 1.2,        // upper floors project north over the street
    levels: [
      { id: 'm2', name: 'Level −2', elev: -6.2, clear: 2.8, ghost: true,
        note: 'Never drawn. The brief asks for a second basement as a shared recreational and cultural room. This is where the story is open.' },
      { id: 'b',  name: 'Basement', elev: -3.12, clear: 2.72,
        note: 'Caretaker unit, powerhouse, stores, a jacuzzi with shower and locker room, and a sunken courtyard open to the sky with a tree.' },
      { id: 'gf', name: 'Ground', elev: 0, clear: 2.56,
        note: 'Three cars inside, one in the yard. A shabak screen and a green wall separate cars from the courtyard void; opaque glass flooring lets light down to the basement.' },
      { id: 'f1', name: 'First floor', elev: 2.96, clear: 5.52, double: true,
        note: 'Open kitchen–dining–living under a 5.52 m ceiling, two bedrooms, a study box, a balcony with a sliding floor, and a stair up to the loft.' },
      { id: 'l1', name: 'Loft', elev: 6.08, clear: 2.56, loft: true,
        note: 'Library, bedroom, bath and a “smoking-free room” with its own exhaust, hung over the north half of the first floor.' },
      { id: 'f2', name: 'Second floor', elev: 8.88, clear: 3.3,
        note: 'Family room, library, laundry, two bedrooms, a north balcony — and its own loft above.' },
      { id: 'f3', name: 'Third floor', elev: 12.58, clear: 3.3,
        note: 'A two-bedroom flat with an open living room, a master bedroom and a study: the parents’ unit.' },
      { id: 'r',  name: 'Roof', elev: 16.28, clear: 1.6,
        note: 'Roof garden with vegetable beds, meant to be reachable from every floor. The stair box rises to +17.88.' }
    ]
  },
  attempt3: {
    plot: { width: 10.5, depth: 20.14 },
    units: {
      p:  { name: 'Parking',          color: '#c9cdc9' },
      j:  { name: 'Caretaker unit',   color: '#d8c3a5', area: 52 },
      o:  { name: 'One-bedroom flat', color: '#a9c9c6', area: 62 },
      a:  { name: 'Duplex A',         color: '#7fb3af', area: 165 },
      s:  { name: 'Student duplex',   color: '#e0b56a', area: 76 },
      b:  { name: 'Main duplex',      color: '#3f9b96', area: 241 },
      c:  { name: 'Commons',          color: '#bfd6b3' }
    },
    /* each floor: segments from north (street) to south, as share of the plate */
    floors: [
      { name: 'Roof',         segs: [['b', 1, 'roof garden, private to the main duplex']] },
      { name: 'Fourth floor', segs: [['b', 1, 'master suite, living, kitchen, terrace']] },
      { name: 'Third floor',  segs: [['b', 0.72, 'two bedrooms + private living'], ['s', 0.28, 'student bedroom']] },
      { name: 'Second floor', segs: [['a', 0.52, 'three bedrooms'], ['s', 0.48, 'student living, spiral stair']] },
      { name: 'First floor',  segs: [['o', 0.48, '62 m² flat'], ['a', 0.52, 'living, iwan, kitchen']] },
      { name: 'Ground',       segs: [['p', 0.82, '5 cars standard, 8 at most'], ['c', 0.18, 'sunken garden void']] },
      { name: 'Basement',     segs: [['j', 0.5, '52 m² caretaker unit'], ['c', 0.5, 'pool → hoz, stores, plant']] }
    ]
  }
};
