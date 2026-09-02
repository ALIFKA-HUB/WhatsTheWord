-- ==============================================================================
-- What's The Word - Supabase Database Schema & Seed Data
-- ==============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Table: word_packs (Official & Curated Word Pairs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS word_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  civilian_word TEXT NOT NULL,
  undercover_word TEXT NOT NULL,
  is_official BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_word_pack_entry UNIQUE (category, civilian_word, undercover_word)
);

-- ------------------------------------------------------------------------------
-- 2. Table: custom_packs (Community-Created & Shareable Word Packs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS custom_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author_name TEXT NOT NULL,
  share_code TEXT UNIQUE NOT NULL,
  word_pairs JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 3. Indexes for High Performance Queries
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_word_packs_category ON word_packs(category);
CREATE INDEX IF NOT EXISTS idx_word_packs_is_official ON word_packs(is_official);
CREATE INDEX IF NOT EXISTS idx_custom_packs_share_code ON custom_packs(share_code);
CREATE INDEX IF NOT EXISTS idx_custom_packs_is_public ON custom_packs(is_public);
CREATE INDEX IF NOT EXISTS idx_custom_packs_created_at ON custom_packs(created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------
ALTER TABLE word_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_packs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if script is re-run
DROP POLICY IF EXISTS "Allow public read on word_packs" ON word_packs;
DROP POLICY IF EXISTS "Allow public read on custom_packs" ON custom_packs;
DROP POLICY IF EXISTS "Allow public insert on custom_packs" ON custom_packs;

-- word_packs: Public anonymous read access
CREATE POLICY "Allow public read on word_packs"
  ON word_packs
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- custom_packs: Public read access for all community packs & share-code lookups
CREATE POLICY "Allow public read on custom_packs"
  ON custom_packs
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- custom_packs: Public anonymous insert access so anyone can publish packs
CREATE POLICY "Allow public insert on custom_packs"
  ON custom_packs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 5. Indonesian Word Bank Seed Statements (Official Packs)
-- ------------------------------------------------------------------------------
INSERT INTO word_packs (category, civilian_word, undercover_word, is_official) VALUES
  -- Makanan & Minuman
  ('Makanan & Minuman', 'Kopi', 'Teh', true),
  ('Makanan & Minuman', 'Bakso', 'Mie Ayam', true),
  ('Makanan & Minuman', 'Rendang', 'Gulai', true),
  ('Makanan & Minuman', 'Martabak Manis', 'Terang Bulan', true),
  ('Makanan & Minuman', 'Nasi Padang', 'Nasi Uduk', true),
  ('Makanan & Minuman', 'Nasi Goreng', 'Mie Goreng', true),
  ('Makanan & Minuman', 'Es Kelapa', 'Es Cendol', true),
  ('Makanan & Minuman', 'Sate Ayam', 'Sate Kambing', true),
  ('Makanan & Minuman', 'Pempek', 'Siomay', true),
  ('Makanan & Minuman', 'Roti Bakar', 'Pisang Bakar', true),
  ('Makanan & Minuman', 'Soto Ayam', 'Rawon', true),
  ('Makanan & Minuman', 'Jus Alpukat', 'Jus Mangga', true),
  ('Makanan & Minuman', 'Kerupuk', 'Keripik', true),
  ('Makanan & Minuman', 'Sambal Terasi', 'Sambal Matah', true),

  -- Hewan
  ('Hewan', 'Kucing', 'Harimau', true),
  ('Hewan', 'Bebek', 'Ayam', true),
  ('Hewan', 'Paus', 'Lumba-lumba', true),
  ('Hewan', 'Elang', 'Burung Hantu', true),
  ('Hewan', 'Kelinci', 'Hamster', true),
  ('Hewan', 'Singa', 'Macan Tutul', true),
  ('Hewan', 'Gajah', 'Badak', true),
  ('Hewan', 'Buaya', 'Alligator', true),
  ('Hewan', 'Kuda', 'Keledai', true),
  ('Hewan', 'Kupu-kupu', 'Capung', true),
  ('Hewan', 'Lebah', 'Tawon', true),
  ('Hewan', 'Hiu', 'Ikan Pari', true),
  ('Hewan', 'Beruang', 'Panda', true),

  -- Benda & Gadget
  ('Benda & Gadget', 'Laptop', 'Komputer', true),
  ('Benda & Gadget', 'Smartphone', 'Tablet', true),
  ('Benda & Gadget', 'Headphone', 'Earphone', true),
  ('Benda & Gadget', 'Kipas Angin', 'AC', true),
  ('Benda & Gadget', 'Jam Tangan', 'Jam Dinding', true),
  ('Benda & Gadget', 'Televisi', 'Proyektor', true),
  ('Benda & Gadget', 'Sepeda', 'Motor', true),
  ('Benda & Gadget', 'Kacamata', 'Lensa Kontak', true),
  ('Benda & Gadget', 'Dompet', 'Tas', true),
  ('Benda & Gadget', 'Pulpen', 'Pensil', true),
  ('Benda & Gadget', 'Payung', 'Jas Hujan', true),
  ('Benda & Gadget', 'Senter', 'Lilin', true),
  ('Benda & Gadget', 'Pintu', 'Jendela', true),

  -- Tempat & Hiburan
  ('Tempat & Hiburan', 'Bioskop', 'Teater', true),
  ('Tempat & Hiburan', 'Pantai', 'Danau', true),
  ('Tempat & Hiburan', 'Supermarket', 'Pasar Tradisional', true),
  ('Tempat & Hiburan', 'Museum', 'Perpustakaan', true),
  ('Tempat & Hiburan', 'Hotel', 'Villa', true),
  ('Tempat & Hiburan', 'Taman Hiburan', 'Kebun Binatang', true),
  ('Tempat & Hiburan', 'Restoran', 'Kafe', true),
  ('Tempat & Hiburan', 'Rumah Sakit', 'Puskesmas', true),
  ('Tempat & Hiburan', 'Bandara', 'Stasiun Kereta', true),
  ('Tempat & Hiburan', 'Kolam Renang', 'Waterpark', true),
  ('Tempat & Hiburan', 'Gunung', 'Bukit', true),
  ('Tempat & Hiburan', 'Mall', 'Pasar Malam', true),

  -- Profesi
  ('Profesi', 'Dokter', 'Perawat', true),
  ('Profesi', 'Pilot', 'Masinis', true),
  ('Profesi', 'Polisi', 'Tentara', true),
  ('Profesi', 'Koki', 'Barista', true),
  ('Profesi', 'Guru', 'Dosen', true),
  ('Profesi', 'Pemadam Kebakaran', 'Tim SAR', true),
  ('Profesi', 'Arsitek', 'Insinyur', true),
  ('Profesi', 'Hakim', 'Pengacara', true),
  ('Profesi', 'Wartawan', 'Fotografer', true),
  ('Profesi', 'Pramugari', 'Resepsionis', true),
  ('Profesi', 'Sopir Bus', 'Supir Taksi', true),
  ('Profesi', 'Aktor', 'Penyanyi', true)
ON CONFLICT (category, civilian_word, undercover_word) DO NOTHING;
