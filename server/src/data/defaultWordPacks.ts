import { WordPair, WordPack } from '../types/game.types.js';

export const CATEGORIES = [
  'Semua Kategori',
  'Makanan & Minuman',
  'Hewan',
  'Benda & Gadget',
  'Tempat & Hiburan',
  'Profesi',
] as const;

export type WordCategory = (typeof CATEGORIES)[number];

export const DEFAULT_WORD_PAIRS: WordPair[] = [
  // 1. Makanan & Minuman (14 pairs)
  { id: 'mkn-01', category: 'Makanan & Minuman', civilianWord: 'Kopi', undercoverWord: 'Teh' },
  { id: 'mkn-02', category: 'Makanan & Minuman', civilianWord: 'Bakso', undercoverWord: 'Mie Ayam' },
  { id: 'mkn-03', category: 'Makanan & Minuman', civilianWord: 'Rendang', undercoverWord: 'Gulai' },
  { id: 'mkn-04', category: 'Makanan & Minuman', civilianWord: 'Martabak Manis', undercoverWord: 'Terang Bulan' },
  { id: 'mkn-05', category: 'Makanan & Minuman', civilianWord: 'Nasi Padang', undercoverWord: 'Nasi Uduk' },
  { id: 'mkn-06', category: 'Makanan & Minuman', civilianWord: 'Nasi Goreng', undercoverWord: 'Mie Goreng' },
  { id: 'mkn-07', category: 'Makanan & Minuman', civilianWord: 'Es Kelapa', undercoverWord: 'Es Cendol' },
  { id: 'mkn-08', category: 'Makanan & Minuman', civilianWord: 'Sate Ayam', undercoverWord: 'Sate Kambing' },
  { id: 'mkn-09', category: 'Makanan & Minuman', civilianWord: 'Pempek', undercoverWord: 'Siomay' },
  { id: 'mkn-10', category: 'Makanan & Minuman', civilianWord: 'Roti Bakar', undercoverWord: 'Pisang Bakar' },
  { id: 'mkn-11', category: 'Makanan & Minuman', civilianWord: 'Soto Ayam', undercoverWord: 'Rawon' },
  { id: 'mkn-12', category: 'Makanan & Minuman', civilianWord: 'Jus Alpukat', undercoverWord: 'Jus Mangga' },
  { id: 'mkn-13', category: 'Makanan & Minuman', civilianWord: 'Kerupuk', undercoverWord: 'Keripik' },
  { id: 'mkn-14', category: 'Makanan & Minuman', civilianWord: 'Sambal Terasi', undercoverWord: 'Sambal Matah' },

  // 2. Hewan (13 pairs)
  { id: 'hwn-01', category: 'Hewan', civilianWord: 'Kucing', undercoverWord: 'Harimau' },
  { id: 'hwn-02', category: 'Hewan', civilianWord: 'Bebek', undercoverWord: 'Ayam' },
  { id: 'hwn-03', category: 'Hewan', civilianWord: 'Paus', undercoverWord: 'Lumba-lumba' },
  { id: 'hwn-04', category: 'Hewan', civilianWord: 'Elang', undercoverWord: 'Burung Hantu' },
  { id: 'hwn-05', category: 'Hewan', civilianWord: 'Kelinci', undercoverWord: 'Hamster' },
  { id: 'hwn-06', category: 'Hewan', civilianWord: 'Singa', undercoverWord: 'Macan Tutul' },
  { id: 'hwn-07', category: 'Hewan', civilianWord: 'Gajah', undercoverWord: 'Badak' },
  { id: 'hwn-08', category: 'Hewan', civilianWord: 'Buaya', undercoverWord: 'Alligator' },
  { id: 'hwn-09', category: 'Hewan', civilianWord: 'Kuda', undercoverWord: 'Keledai' },
  { id: 'hwn-10', category: 'Hewan', civilianWord: 'Kupu-kupu', undercoverWord: 'Capung' },
  { id: 'hwn-11', category: 'Hewan', civilianWord: 'Lebah', undercoverWord: 'Tawon' },
  { id: 'hwn-12', category: 'Hewan', civilianWord: 'Hiu', undercoverWord: 'Ikan Pari' },
  { id: 'hwn-13', category: 'Hewan', civilianWord: 'Beruang', undercoverWord: 'Panda' },

  // 3. Benda & Gadget (13 pairs)
  { id: 'bnd-01', category: 'Benda & Gadget', civilianWord: 'Laptop', undercoverWord: 'Komputer' },
  { id: 'bnd-02', category: 'Benda & Gadget', civilianWord: 'Smartphone', undercoverWord: 'Tablet' },
  { id: 'bnd-03', category: 'Benda & Gadget', civilianWord: 'Headphone', undercoverWord: 'Earphone' },
  { id: 'bnd-04', category: 'Benda & Gadget', civilianWord: 'Kipas Angin', undercoverWord: 'AC' },
  { id: 'bnd-05', category: 'Benda & Gadget', civilianWord: 'Jam Tangan', undercoverWord: 'Jam Dinding' },
  { id: 'bnd-06', category: 'Benda & Gadget', civilianWord: 'Televisi', undercoverWord: 'Proyektor' },
  { id: 'bnd-07', category: 'Benda & Gadget', civilianWord: 'Sepeda', undercoverWord: 'Motor' },
  { id: 'bnd-08', category: 'Benda & Gadget', civilianWord: 'Kacamata', undercoverWord: 'Lensa Kontak' },
  { id: 'bnd-09', category: 'Benda & Gadget', civilianWord: 'Dompet', undercoverWord: 'Tas' },
  { id: 'bnd-10', category: 'Benda & Gadget', civilianWord: 'Pulpen', undercoverWord: 'Pensil' },
  { id: 'bnd-11', category: 'Benda & Gadget', civilianWord: 'Payung', undercoverWord: 'Jas Hujan' },
  { id: 'bnd-12', category: 'Benda & Gadget', civilianWord: 'Senter', undercoverWord: 'Lilin' },
  { id: 'bnd-13', category: 'Benda & Gadget', civilianWord: 'Pintu', undercoverWord: 'Jendela' },

  // 4. Tempat & Hiburan (12 pairs)
  { id: 'tmp-01', category: 'Tempat & Hiburan', civilianWord: 'Bioskop', undercoverWord: 'Teater' },
  { id: 'tmp-02', category: 'Tempat & Hiburan', civilianWord: 'Pantai', undercoverWord: 'Danau' },
  { id: 'tmp-03', category: 'Tempat & Hiburan', civilianWord: 'Supermarket', undercoverWord: 'Pasar Tradisional' },
  { id: 'tmp-04', category: 'Tempat & Hiburan', civilianWord: 'Museum', undercoverWord: 'Perpustakaan' },
  { id: 'tmp-05', category: 'Tempat & Hiburan', civilianWord: 'Hotel', undercoverWord: 'Villa' },
  { id: 'tmp-06', category: 'Tempat & Hiburan', civilianWord: 'Taman Hiburan', undercoverWord: 'Kebun Binatang' },
  { id: 'tmp-07', category: 'Tempat & Hiburan', civilianWord: 'Restoran', undercoverWord: 'Kafe' },
  { id: 'tmp-08', category: 'Tempat & Hiburan', civilianWord: 'Rumah Sakit', undercoverWord: 'Puskesmas' },
  { id: 'tmp-09', category: 'Tempat & Hiburan', civilianWord: 'Bandara', undercoverWord: 'Stasiun Kereta' },
  { id: 'tmp-10', category: 'Tempat & Hiburan', civilianWord: 'Kolam Renang', undercoverWord: 'Waterpark' },
  { id: 'tmp-11', category: 'Tempat & Hiburan', civilianWord: 'Gunung', undercoverWord: 'Bukit' },
  { id: 'tmp-12', category: 'Tempat & Hiburan', civilianWord: 'Mall', undercoverWord: 'Pasar Malam' },

  // 5. Profesi (12 pairs)
  { id: 'prf-01', category: 'Profesi', civilianWord: 'Dokter', undercoverWord: 'Perawat' },
  { id: 'prf-02', category: 'Profesi', civilianWord: 'Pilot', undercoverWord: 'Masinis' },
  { id: 'prf-03', category: 'Profesi', civilianWord: 'Polisi', undercoverWord: 'Tentara' },
  { id: 'prf-04', category: 'Profesi', civilianWord: 'Koki', undercoverWord: 'Barista' },
  { id: 'prf-05', category: 'Profesi', civilianWord: 'Guru', undercoverWord: 'Dosen' },
  { id: 'prf-06', category: 'Profesi', civilianWord: 'Pemadam Kebakaran', undercoverWord: 'Tim SAR' },
  { id: 'prf-07', category: 'Profesi', civilianWord: 'Arsitek', undercoverWord: 'Insinyur' },
  { id: 'prf-08', category: 'Profesi', civilianWord: 'Hakim', undercoverWord: 'Pengacara' },
  { id: 'prf-09', category: 'Profesi', civilianWord: 'Wartawan', undercoverWord: 'Fotografer' },
  { id: 'prf-10', category: 'Profesi', civilianWord: 'Pramugari', undercoverWord: 'Resepsionis' },
  { id: 'prf-11', category: 'Profesi', civilianWord: 'Sopir Bus', undercoverWord: 'Supir Taksi' },
  { id: 'prf-12', category: 'Profesi', civilianWord: 'Aktor', undercoverWord: 'Penyanyi' },
];

export const DEFAULT_WORD_PACKS: WordPack[] = [
  {
    id: 'pack-makanan',
    name: 'Makanan & Minuman Indonesia',
    category: 'Makanan & Minuman',
    description: 'Kuliner populer, jajanan pasar, dan minuman khas Indonesia',
    isOfficial: true,
    wordPairs: DEFAULT_WORD_PAIRS.filter((wp) => wp.category === 'Makanan & Minuman'),
  },
  {
    id: 'pack-hewan',
    name: 'Dunia Hewan',
    category: 'Hewan',
    description: 'Fauna darat, air, udara, dan hewan peliharaan',
    isOfficial: true,
    wordPairs: DEFAULT_WORD_PAIRS.filter((wp) => wp.category === 'Hewan'),
  },
  {
    id: 'pack-gadget',
    name: 'Benda & Gadget',
    category: 'Benda & Gadget',
    description: 'Peralatan elektronik, perabotan rumah tangga, dan teknologi',
    isOfficial: true,
    wordPairs: DEFAULT_WORD_PAIRS.filter((wp) => wp.category === 'Benda & Gadget'),
  },
  {
    id: 'pack-tempat',
    name: 'Tempat & Hiburan',
    category: 'Tempat & Hiburan',
    description: 'Destinasi wisata, fasilitas publik, dan tempat rekreasi',
    isOfficial: true,
    wordPairs: DEFAULT_WORD_PAIRS.filter((wp) => wp.category === 'Tempat & Hiburan'),
  },
  {
    id: 'pack-profesi',
    name: 'Profesi & Pekerjaan',
    category: 'Profesi',
    description: 'Karier, pekerjaan umum, dan tenaga profesional',
    isOfficial: true,
    wordPairs: DEFAULT_WORD_PAIRS.filter((wp) => wp.category === 'Profesi'),
  },
];

export function getWordPairsByCategory(category?: string): WordPair[] {
  if (!category || category === 'Semua Kategori') {
    return DEFAULT_WORD_PAIRS;
  }
  const filtered = DEFAULT_WORD_PAIRS.filter((wp) => wp.category.toLowerCase() === category.toLowerCase());
  return filtered.length > 0 ? filtered : DEFAULT_WORD_PAIRS;
}

export function getRandomWordPair(category?: string): WordPair {
  const pool = getWordPairsByCategory(category);
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
