// Hipparcos bright-star catalog — top ~80 naked-eye stars visible from mid-northern latitudes.
// ra  = right ascension in degrees (hours × 15)
// dec = declination in degrees
// mag = apparent magnitude
// Sources: Hipparcos catalog (ESA 1997), IAU Working Group on Star Names

export type CatalogStar = { name: string; ra: number; dec: number; mag: number };

export const STAR_CATALOG: CatalogStar[] = [
  // mag < 1
  { name: 'Sirius',       ra: 101.29, dec: -16.72, mag: -1.46 },
  { name: 'Arcturus',     ra: 213.92, dec:  19.18, mag: -0.04 },
  { name: 'Vega',         ra: 279.23, dec:  38.78, mag:  0.03 },
  { name: 'Capella',      ra:  79.17, dec:  46.00, mag:  0.08 },
  { name: 'Rigel',        ra:  78.63, dec:  -8.20, mag:  0.13 },
  { name: 'Procyon',      ra: 114.83, dec:   5.23, mag:  0.34 },
  { name: 'Betelgeuse',   ra:  88.79, dec:   7.41, mag:  0.50 },
  { name: 'Altair',       ra: 297.70, dec:   8.87, mag:  0.76 },
  { name: 'Aldebaran',    ra:  68.98, dec:  16.51, mag:  0.87 },
  { name: 'Antares',      ra: 247.35, dec: -26.43, mag:  0.91 },
  { name: 'Spica',        ra: 201.30, dec: -11.16, mag:  0.98 },
  // mag 1.0–1.5
  { name: 'Pollux',       ra: 116.33, dec:  28.03, mag:  1.16 },
  { name: 'Fomalhaut',    ra: 344.41, dec: -29.62, mag:  1.16 },
  { name: 'Deneb',        ra: 310.36, dec:  45.28, mag:  1.25 },
  { name: 'Regulus',      ra: 152.09, dec:  11.97, mag:  1.36 },
  // mag 1.5–2.0
  { name: 'Castor',       ra: 113.65, dec:  31.89, mag:  1.58 },
  { name: 'Bellatrix',    ra:  81.28, dec:   6.35, mag:  1.64 },
  { name: 'Elnath',       ra:  81.57, dec:  28.61, mag:  1.65 },
  { name: 'Alnilam',      ra:  84.05, dec:  -1.20, mag:  1.70 },
  { name: 'Alnitak',      ra:  85.19, dec:  -1.94, mag:  1.77 },
  { name: 'Alioth',       ra: 193.51, dec:  55.96, mag:  1.77 },
  { name: 'Mirfak',       ra:  51.08, dec:  49.86, mag:  1.79 },
  { name: 'Dubhe',        ra: 165.93, dec:  61.75, mag:  1.79 },
  { name: 'Kaus Australis', ra: 276.04, dec: -34.38, mag: 1.85 },
  { name: 'Alkaid',       ra: 206.89, dec:  49.31, mag:  1.86 },
  { name: 'Menkalinan',   ra:  89.88, dec:  44.95, mag:  1.90 },
  { name: 'Alhena',       ra:  99.43, dec:  16.40, mag:  1.93 },
  { name: 'Mirzam',       ra:  95.68, dec: -17.96, mag:  1.98 },
  { name: 'Alphard',      ra: 141.90, dec:  -8.66, mag:  1.99 },
  { name: 'Polaris',      ra:  37.95, dec:  89.26, mag:  1.99 },
  // mag 2.0–2.5
  { name: 'Hamal',        ra:  31.79, dec:  23.46, mag:  2.00 },
  { name: 'Algieba',      ra: 154.99, dec:  19.84, mag:  2.01 },
  { name: 'Nunki',        ra: 283.82, dec: -26.30, mag:  2.05 },
  { name: 'Diphda',       ra:  10.90, dec: -17.99, mag:  2.04 },
  { name: 'Alpheratz',    ra:   2.10, dec:  29.09, mag:  2.06 },
  { name: 'Saiph',        ra:  86.94, dec:  -9.67, mag:  2.07 },
  { name: 'Mirach',       ra:  17.43, dec:  35.62, mag:  2.07 },
  { name: 'Kochab',       ra: 222.68, dec:  74.16, mag:  2.08 },
  { name: 'Rasalhague',   ra: 263.73, dec:  12.56, mag:  2.08 },
  { name: 'Algol',        ra:  47.04, dec:  40.96, mag:  2.09 },
  { name: 'Almach',       ra:  30.97, dec:  42.33, mag:  2.10 },
  { name: 'Denebola',     ra: 177.26, dec:  14.57, mag:  2.14 },
  { name: 'Sadr',         ra: 305.56, dec:  40.26, mag:  2.20 },
  { name: 'Alphecca',     ra: 233.67, dec:  26.71, mag:  2.23 },
  { name: 'Mizar',        ra: 200.98, dec:  54.93, mag:  2.23 },
  { name: 'Etamin',       ra: 269.15, dec:  51.49, mag:  2.24 },
  { name: 'Schedar',      ra:  10.13, dec:  56.54, mag:  2.24 },
  { name: 'Mintaka',      ra:  83.00, dec:  -0.30, mag:  2.25 },
  { name: 'Caph',         ra:   2.29, dec:  59.15, mag:  2.28 },
  { name: 'Dschubba',     ra: 240.08, dec: -22.62, mag:  2.32 },
  { name: 'Merak',        ra: 165.46, dec:  56.38, mag:  2.34 },
  { name: 'Izar',         ra: 221.25, dec:  27.07, mag:  2.35 },
  { name: 'Enif',         ra: 326.05, dec:   9.88, mag:  2.38 },
  { name: 'Sabik',        ra: 257.59, dec: -15.72, mag:  2.43 },
  { name: 'Phecda',       ra: 178.46, dec:  53.69, mag:  2.44 },
  { name: 'Scheat',       ra: 345.94, dec:  28.08, mag:  2.44 },
  { name: 'Alderamin',    ra: 319.64, dec:  62.59, mag:  2.45 },
  { name: 'Markab',       ra: 346.19, dec:  15.21, mag:  2.49 },
  { name: 'Menkar',       ra:  45.57, dec:   4.09, mag:  2.54 },
  { name: 'Gienah',       ra: 183.95, dec: -17.54, mag:  2.58 },
  // mag 2.5–3.0
  { name: 'Unukalhai',    ra: 236.07, dec:   6.43, mag:  2.63 },
  { name: 'Lesath',       ra: 262.69, dec: -37.29, mag:  2.69 },
  { name: 'Gamma Cas',    ra:  14.18, dec:  60.72, mag:  2.47 },
  { name: 'Ruchbah',      ra:  21.45, dec:  60.24, mag:  2.68 },
  { name: 'Theta Aur',    ra:  89.93, dec:  37.21, mag:  2.65 },
  { name: 'Rasalgethi',   ra: 258.66, dec:  14.39, mag:  2.78 },
  { name: 'Kaus Borealis', ra: 276.99, dec: -25.42, mag: 2.81 },
  { name: 'Alcyone',      ra:  56.87, dec:  24.11, mag:  2.87 },
  { name: 'Delta Cyg',    ra: 296.24, dec:  45.13, mag:  2.87 },
  { name: 'Albireo',      ra: 292.68, dec:  27.97, mag:  3.08 },
  { name: 'Pherkad',      ra: 230.18, dec:  71.83, mag:  3.05 },
  // mag 3.0–3.5
  { name: 'Megrez',       ra: 183.86, dec:  57.03, mag:  3.31 },
  { name: 'Epsilon Cyg',  ra: 311.55, dec:  33.97, mag:  2.48 },
  { name: '',             ra:  51.08, dec:  49.86, mag:  3.15 }, // δ Per
  { name: '',             ra: 218.88, dec:  18.40, mag:  3.50 }, // ν Boo
  { name: '',             ra: 329.04, dec:   9.87, mag:  3.49 }, // ε Peg area filler
  { name: '',             ra: 103.20, dec: -17.57, mag:  3.02 }, // ε CMa area
  { name: '',             ra: 152.09, dec:  26.01, mag:  3.44 }, // ζ Leo
  { name: '',             ra: 117.32, dec:  28.03, mag:  3.53 }, // δ Gem
];
