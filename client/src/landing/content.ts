import { DEFAULT_WORD_PAIRS, CATEGORIES } from '../data/defaultWordPacks';

export const HERO = {
  title: 'Satu kata beda. Siapa orangnya?',
  sentence: 'Game tebak penyamar untuk 3 sampai 20 teman, cukup satu HP.',
  primary: 'Main di satu HP',
  secondary: 'Buat room online',
  fact1: '3 sampai 20 pemain',
  fact2: 'tanpa perlu akun',
  caption: 'Tiga kartu Kopi, satu kartu Teh. Yang pegang Teh adalah penyamar.',
};

export const BEFORE_AFTER = {
  head: 'Tanpa kertas, tanpa juri.',
  before: {
    label: 'Dulu',
    desc: 'Tulis kata di sobekan kertas, satu orang jadi juri dan tidak ikut main, kertasnya ketahuan dari belakang.',
  },
  after: {
    label: 'Sekarang',
    desc: 'HP membagikan kata secara acak, semua orang ikut main, dan kata baru terlihat saat kartunya kamu tahan.',
  },
};

export const ROUND_STEPS = [
  {
    step: '01',
    title: 'Intip kata',
    desc: 'Tahan kartu, lihat katamu, oper HP ke teman.',
    screen: 'reveal',
  },
  {
    step: '02',
    title: 'Jelaskan',
    desc: 'Tiap orang kasih satu petunjuk tanpa menyebut katanya.',
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
    desc: 'Mr. White tidak punya kata. Kalau tebakannya benar, dia menang.',
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
        '1 HP cukup untuk semua pemain',
        '3 sampai 20 pemain',
        'Oper HP bergantian saat giliran intip kata',
      ],
      action: 'Main di satu HP',
    },
    {
      id: 'online',
      title: 'Room online',
      badge: 'Multi-device',
      points: [
        'Tiap orang pegang HP masing-masing',
        'Masuk dengan satu kode room 6 karakter',
        'Host atur kategori kata dan jumlah penyamar',
      ],
      action: 'Buat room online',
    },
  ],
};

export const SAMPLE_PAIRS = DEFAULT_WORD_PAIRS.slice(0, 8);
export const PAIR_COUNT = DEFAULT_WORD_PAIRS.length;
export const CATEGORY_COUNT = CATEGORIES.length - 1;
