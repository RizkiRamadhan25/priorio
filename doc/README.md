# Priorio V1.0 — Implementation requirements
Know what to do next.

Paket spesifikasi, bukan source code aplikasi. Priorio adalah task manager single-user lokal untuk tugas akademik dan nonakademik. Bahasa antarmuka ID/EN, light/dark, kalender bulanan, sidebar collapsible, modal CRUD, ranking otomatis.

## Mulai dengan Codex
1. Ekstrak seluruh isi paket ke direktori proyek kosong atau repo yang dituju (jangan menimpa file lama tanpa review).
2. Buka folder tersebut di Codex. Berikan isi `CODEX_PROMPT.md`.
3. Codex membaca `AGENTS.md`, semua docs, kemudian menjalankan T-01 dan T-02 sebagai gate lingkungan. Jangan langsung membangun semua fitur.
4. Lanjutkan task berdasarkan dependensi `docs/TASKS.md`; bukti kemajuan di `.work/progress.md`.

## Dokumen
- PRD: scope, requirements, business rules, acceptance.
- DESIGN: layout, tokens, komponen, state, bilingual.
- DATABASE: ERD, tipe, constraint, migration, seed.
- ARCHITECTURE: stack, kontrak service, runtime dan command.
- SECURITY: threat model, localhost, backup.
- TESTING: pengujian dan matriks keterlacakan.
- TASKS / ROADMAP: urutan kerja dan release gates.
- TRACEABILITY.csv: setiap FR/NFR terhubung ke task dan test.
- skills/: panduan opsional per disiplin; AGENTS.md tetap mengikat.

## Menjalankan aplikasi (kontrak setelah implementasi)
Prasyarat Node.js 22 LTS (>=22.12 dalam major 22), npm, Windows/macOS/Linux dengan akses tulis. Instalasi pertama memerlukan internet untuk dependencies/browser pengujian. Setelah instalasi, fungsi inti tidak membutuhkan internet.
```powershell
Copy-Item .env.example .env
npm ci
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```
Pada macOS/Linux gunakan `cp .env.example .env`. Akses http://127.0.0.1:3000. Untuk mode produksi lokal: `npm run build` lalu `npm run start`. Jangan bind ke 0.0.0.0. Untuk upgrade, backup dulu, gunakan `npm ci`, generate, migrate dan seed idempoten, lalu build. Lihat SECURITY untuk restore. Jangan jalankan perintah ini sebelum Codex menyiapkan package.json, lockfile, dan migration.

## Status
Spesifikasi disiapkan; implementasi, dependency probe, build, dan test belum dilakukan. Asumsi teknis dicatat di `docs/DECISIONS.md`. Tidak ada deployment publik atau login dalam V1.
