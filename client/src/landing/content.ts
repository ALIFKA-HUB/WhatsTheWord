import { DEFAULT_WORD_PAIRS, CATEGORIES } from '../data/defaultWordPacks';

export const HERO = {
  title: 'Satu kata beda. Siapa penyamarnya?',
  sentence: 'Game tebak penyamar untuk 3 sampai 20 teman, cukup satu HP.',
  primary: 'Main di satu HP',
  secondary: 'Buat room online',
};

export const MARQUEE_ITEMS = [
  'Pass & Play 1 HP',
  'Room Online 4 Huruf',
  '3 sampai 20 Pemain',
  'Peran Mr. White',
  'Paket Kata Indonesia',
  'Buat Paket Sendiri',
];

export interface RoleGuideItem {
  id: 'civilian' | 'undercover' | 'mrwhite';
  label: string;
  goal: string;
  clueTip: string;
  accent: 'mint' | 'stamp' | 'sun';
}

export const ROLE_GUIDES: RoleGuideItem[] = [
  {
    id: 'civilian',
    label: 'Warga Sipil',
    goal: 'Mayoritas pemain memegang kata yang sama dan harus menemukan semua penyamar lewat voting.',
    clueTip: 'Beri petunjuk yang cukup jelas untuk sesama warga, tapi jangan terlalu mudah ditebak Mr. White.',
    accent: 'mint',
  },
  {
    id: 'undercover',
    label: 'Penyamar',
    goal: 'Pegang kata yang mirip dengan warga dan berbaurlah tanpa ketahuan sampai akhir ronde.',
    clueTip: 'Dengarkan petunjuk pemain pertama sebelum bicara supaya deskripsimu tetap masuk akal.',
    accent: 'stamp',
  },
  {
    id: 'mrwhite',
    label: 'Mr. White',
    goal: 'Masuk tanpa kata sama sekali. Bertahanlah atau tebak kata warga saat tereliminasi untuk menang.',
    clueTip: 'Tangkap pola kata dari petunjuk meja lalu susun alasan yang meyakinkan.',
    accent: 'sun',
  },
];

export interface MiniRoundPlayer {
  id: string;
  name: string;
  clue: string;
  isImpostor: boolean;
  word: string;
}

export interface MiniRoundCase {
  id: string;
  topic: string;
  civilianWord: string;
  undercoverWord: string;
  explanation: string;
  players: MiniRoundPlayer[];
}

export const MINI_ROUNDS: MiniRoundCase[] = [
  {
    id: 'minuman',
    topic: 'Minuman meja pagi',
    civilianWord: 'Kopi',
    undercoverWord: 'Teh',
    explanation: 'Tiga warga menjelaskan Kopi (pahit, kafein, biji sangrai), sedangkan Bima menyinggung pucuk daun karena memegang Teh.',
    players: [
      { id: 'raka', name: 'Raka', clue: 'Sering diminum biar melek pagi', isImpostor: false, word: 'Kopi' },
      { id: 'sinta', name: 'Sinta', clue: 'Bisa diseduh dari biji sangrai', isImpostor: false, word: 'Kopi' },
      { id: 'bima', name: 'Bima', clue: 'Dipetik dari pucuk daun kering', isImpostor: true, word: 'Teh' },
      { id: 'dina', name: 'Dina', clue: 'Cocok dicampur susu atau gula aren', isImpostor: false, word: 'Kopi' },
    ],
  },
  {
    id: 'profesi',
    topic: 'Profesi ruang bersalin',
    civilianWord: 'Dokter',
    undercoverWord: 'Bidan',
    explanation: 'Warga menyebut resep dan operasi di rumah sakit, sementara Tari lebih dekat ke persalinan normal karena memegang Bidan.',
    players: [
      { id: 'faris', name: 'Faris', clue: 'Menulis resep obat di klinik', isImpostor: false, word: 'Dokter' },
      { id: 'tari', name: 'Tari', clue: 'Fokus mendampingi ibu melahirkan', isImpostor: true, word: 'Bidan' },
      { id: 'kevin', name: 'Kevin', clue: 'Pakai stetoskop saat periksa pasien', isImpostor: false, word: 'Dokter' },
      { id: 'nadia', name: 'Nadia', clue: 'Ada spesialis bedah dan anak', isImpostor: false, word: 'Dokter' },
    ],
  },
  {
    id: 'wisata',
    topic: 'Tujuan akhir pekan',
    civilianWord: 'Pantai',
    undercoverWord: 'Gunung',
    explanation: 'Tiga warga berbicara soal ombak dan pasir, sedangkan Yoga menyinggung jaket tebal dan jalur pendakian.',
    players: [
      { id: 'arya', name: 'Arya', clue: 'Asyik lihat matahari terbenam di laut', isImpostor: false, word: 'Pantai' },
      { id: 'yoga', name: 'Yoga', clue: 'Perlu jaket tebal dan sepatu trekking', isImpostor: true, word: 'Gunung' },
      { id: 'maya', name: 'Maya', clue: 'Banyak pasir putih dan ombak', isImpostor: false, word: 'Pantai' },
      { id: 'aldi', name: 'Aldi', clue: 'Bawa kacamata hitam dan sandal jepit', isImpostor: false, word: 'Pantai' },
    ],
  },
];

export const ROUND_STEPS = [
  {
    step: '01',
    title: 'Intip kata',
    desc: 'Tahan kartu, lihat katamu, lalu oper HP ke teman sebelah.',
    screen: 'reveal',
  },
  {
    step: '02',
    title: 'Jelaskan',
    desc: 'Tiap orang beri satu petunjuk singkat tanpa menyebut katanya.',
    screen: 'describe',
  },
  {
    step: '03',
    title: 'Voting',
    desc: 'Pilih siapa yang paling mencurigakan. Suara terbanyak keluar.',
    screen: 'voting',
  },
  {
    step: '04',
    title: 'Tebakan Mr. White',
    desc: 'Mr. White tidak punya kata. Jika tebakannya tepat, dia menang.',
    screen: 'mrwhite',
  },
];

export const MODES = {
  head: 'Dua cara main.',
  tabs: [
    {
      id: 'local',
      title: 'Satu HP',
      badge: 'Pass & Play',
      points: [
        'Cukup satu HP untuk semua pemain di meja',
        'Mendukung 3 sampai 20 pemain sekaligus',
        'Oper HP bergantian saat giliran intip kata rahasia',
      ],
      action: 'Main di satu HP',
    },
    {
      id: 'online',
      title: 'Room online',
      badge: 'Multi-device',
      points: [
        'Tiap orang memegang HP masing-masing',
        'Gabung cepat pakai kode meja 4 huruf',
        'Host atur kategori kata, timer, dan jumlah penyamar',
      ],
      action: 'Buat room online',
    },
  ],
};

function pickDiverseSamplePairs(limit: number) {
  const picked: typeof DEFAULT_WORD_PAIRS = [];
  const pickedSet = new Set<(typeof DEFAULT_WORD_PAIRS)[number]>();
  const seenCategories = new Set<string>();

  for (const pair of DEFAULT_WORD_PAIRS) {
    if (!seenCategories.has(pair.category)) {
      seenCategories.add(pair.category);
      picked.push(pair);
      pickedSet.add(pair);
      if (picked.length >= limit) return picked;
    }
  }

  const categoryCounts = new Map<string, number>();
  for (const pair of picked) {
    categoryCounts.set(pair.category, (categoryCounts.get(pair.category) ?? 0) + 1);
  }

  for (const pair of DEFAULT_WORD_PAIRS) {
    if (pickedSet.has(pair)) continue;
    const count = categoryCounts.get(pair.category) ?? 0;
    if (count < 2) {
      picked.push(pair);
      pickedSet.add(pair);
      categoryCounts.set(pair.category, count + 1);
    }
    if (picked.length >= limit) break;
  }

  return picked;
}

export const SAMPLE_PAIRS = pickDiverseSamplePairs(8);
export const PAIR_COUNT = DEFAULT_WORD_PAIRS.length;
export const CATEGORY_COUNT = CATEGORIES.length - 1;
