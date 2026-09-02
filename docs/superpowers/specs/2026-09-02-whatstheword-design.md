# What's The Word (Undercover Web Game) - Comprehensive Design Spec

> **Document ID:** 2026-09-02-whatstheword-design  
> **Date:** 2026-09-02  
> **Status:** Approved by User  
> **Target Path:** C:\Users\ASUS\Documents\ALIFKA\PROJECT\whatstheword  
> **Aesthetic:** Sleek Dark Cyber (#080c16, #06b6d4, #f43f5e, #a855f7)

---

## 1. Executive Summary & Architecture

**What's The Word** adalah web game deduksi kata sosial (*social deduction word party game*) yang dirancang fleksibel untuk dimainkan secara langsung di satu ruangan (Pass & Play) maupun secara online antar perangkat (Multi-Device Room via Socket.io).

### Monorepo Architecture
`
whatstheword/
├── package.json                   # Root orchestrator ( npm run dev concurrently)
├── .env.example / .env            # Supabase config & Server Port
├── client/                        # React 18 + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/            # UI (SecretCard, VotingGrid, CountdownTimer, AvatarPicker)
│   │   ├── context/               # SocketContext, AudioContext, PassPlayContext
│   │   ├── data/                  # defaultWordPacks.ts (Fallback offline)
│   │   ├── hooks/                 # useGameSound, useSocket, useCountdown
│   │   ├── pages/                 # HomePage, LobbyPage, PassPlayPage, RoomPage, GameOverPage
│   │   ├── services/              # supabaseClient.ts, wordPackService.ts
│   │   └── utils/                 # soundSynthesizer.ts, fuzzyMatcher.ts
└── server/                        # Node.js + Express + Socket.io + TypeScript
    ├── src/
    │   ├── engine/                # GameEngine.ts, FuzzyMatcher.ts
    │   ├── handlers/              # roomHandler.ts, gameHandler.ts, voteHandler.ts
    │   ├── managers/              # RoomManager.ts (In-memory state + session reconnect)
    │   └── server.ts              # Entrypoint Socket.io & REST API
`

---

## 2. Core Game Rules & Roles

### 2.1 Peran Pemain
1. **Civilian (Warga)**:
   - Mendapatkan kata rahasia mayoritas (contoh: *Kopi*).
   - Tujuan: Menemukan dan mengeliminasi seluruh Undercover dan Mr. White.
2. **Undercover (Impostor)**:
   - Mendapatkan kata rahasia yang mirip dengan Warga (contoh: *Teh*).
   - Tujuan: Bertahan hidup sampai jumlah Undercover setara dengan Civilian yang tersisa.
3. **Mr. White (Buta Kata - Opsi Toggle)**:
   - Tidak mendapatkan kata sama sekali (muncul *???*).
   - Tujuan: Menebak kata rahasia Civilian saat tereliminasi ATAU bertahan hidup hingga tersisa 2 pemain.

### 2.2 Aturan Voting & Eliminasi
- **Voting**: Setiap pemain memilih 1 nama yang dicurigai secara rahasia.
- **Tie-Breaker**: Jika hasil perolehan suara terbanyak seri, **sistem langsung melewati eliminasi (Skip Elimination)** dan permainan melanjutkan ke ronde deskripsi berikutnya tanpa ada yang gugur.
- **Mr. White Intercept**:
  - Jika Mr. White tereliminasi melalui voting, muncul pop-up darurat 45 detik untuk mengetik tebakan kata Warga.
  - Menggunakan algoritma **Fuzzy Matching Pintar** (toleran huruf besar/kecil, spasi berlebih, dan typo ringan).
  - Jika tebakan benar -> **Mr. White Menang Seketika**. Jika salah -> Mr. White gugur dan permainan lanjut.

---

## 3. Database & Cloud Word Bank (Supabase)

- **Supabase Project URL**: https://rmsvxhoblwdhhdjpgjdn.supabase.co
- **Tabel word_packs & custom_packs**:
  - Menyimpan kategori kata bawaan (Makanan & Minuman, Hewan, Benda & Gadget, Tempat, Profesi).
  - Fitur **Community Custom Pack**: Pemain dapat membuat kata kustom, menyimpannya ke Supabase, dan membagikan kode pack ke pemain lain.
  - **Offline Fallback**: Game tetap dapat dimainkan tanpa koneksi internet (khusus Pass & Play) menggunakan database kata bawaan lokal di defaultWordPacks.ts.

---

## 4. Audio Engine & UI Design Tokens

- **Web Audio API Synthesizer**:
  - Nol ketergantungan file MP3 eksternal; suara disintesis langsung menggunakan Web Audio Oscillator (Timer tick, flip reveal sting, voting buzzer, victory fanfare).
  - Dilengkapi tombol toggle Mute dengan persistensi localStorage.
- **Theme Palette (Sleek Dark Cyber)**:
  - Background: #080c16 (Deep Void Navy)
  - Surface: gba(15, 23, 42, 0.82) dengan ackdrop-blur-md
  - Civilian: #06b6d4 (Cyan Glow)
  - Undercover: #f43f5e (Crimson Neon)
  - Mr. White: #a855f7 (Electric Violet)
  - Warning/Timer: #f59e0b (Amber)
- **Viewport Protection**: min-h-[100dvh] di seluruh container utama untuk mencegah glitch scrolling di mobile Safari/Chrome.
