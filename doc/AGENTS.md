# AGENTS.md — Priorio
## Mandat
Implementasikan Priorio V1 sesuai docs. Baca PRD, DESIGN, DATABASE, ARCHITECTURE, SECURITY, TESTING, TASKS, ROADMAP, DECISIONS dan TRACEABILITY.csv sebelum coding. Jangan perluas scope. Bila konflik, jangan diam-diam memilih: catat dan selesaikan terhadap PRD/DECISIONS; minta keputusan hanya jika berdampak pada produk atau keamanan. DATABASE mengikat integritas data; SECURITY mengikat batas runtime; DESIGN mengikat visual.

## Workflow
- Periksa repo dan lingkungan terlebih dahulu. T-01/T-02 wajib lulus sebelum fitur.
- Gunakan npm dan Node 22 LTS; ikuti versi yang dikunci dari probe; jangan upgrade major tanpa persetujuan.
- Kerjakan satu task atau batch terkait secara berurutan sesuai TASKS. Sebelum edit, sebutkan ID, dependensi, file yang akan disentuh dan acceptance.
- Jangan menimpa perubahan pengguna atau menghapus data. Jangan menjalankan reset migration pada database pengguna.
- Setelah task: jalankan test terkait, lint, typecheck; catat command, exit code, hasil, file, keterbatasan dan status di `.work/progress.md`. Status lulus hanya dengan bukti.
- Jika gagal, diagnosis dan perbaiki dalam scope; jika diblokir, catat sebab dan jangan menandai selesai. Jangan memalsukan hasil atau mengabaikan test.
- Jangan mengubah PRD, rumus prioritas, desain atau stack diam-diam. Catat perubahan yang disetujui.

## Engineering
- Next.js App Router, React, TypeScript strict, Tailwind, shadcn/ui, Lucide, Prisma SQLite, Zod, React Hook Form, Recharts, next-intl, next-themes, Vitest, Playwright.
- UI tidak mengakses database langsung. Server actions -> validation -> service -> repository. Server-only untuk Prisma.
- Satu sumber kebenaran untuk aturan domain, waktu, sorting dan validation. Priority engine pure dengan injected clock/timezone. Hindari any, duplicate logic, inline magic colors, dan mock data production.
- Mutasi harus tervalidasi server, transactional jika multi-step, dan tidak optimistic-success sebelum persist. Revalidate semua route yang terpengaruh.
- Gunakan string tanggal lokal dan jam sesuai DATABASE. Jangan parsing YYYY-MM-DD sebagai UTC instant. Jangan simpan priority score atau overdue.
- Semua teks UI, validasi, aria labels, chart labels memakai dictionary ID/EN. User content tidak diterjemahkan. Tidak ada locale prefix pada route.
- Gunakan semantic tokens DESIGN; accessible keyboard/focus, contrast, reduced motion, responsive. Tidak gunakan CDN, remote fonts, external tracking.
- Default single user, loopback 127.0.0.1, SQLite di luar public, tidak ada auth/cloud. Periksa origin/host mutasi; jangan bypass keamanan untuk test.
- Pertahankan data seed idempoten; test memakai DB sementara yang berbeda dari data pengguna.
- Jangan commit .env, database, WAL/SHM, backup, credential atau output test sensitif. Commit migration dan lockfile.

## Gates
`npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:integration`, `npm run build`, `npm run test:e2e`. Lihat ARCHITECTURE untuk definisi script. Jangan klaim semua lulus apabila ada yang tidak dijalankan. T-20 wajib audit traceability, offline, production build, backup/restore, dokumentasi dan acceptance.

## Output setiap sesi
Ringkas task selesai, requirement/test terkait, perubahan file, hasil command aktual, blocker, dan task berikutnya. Tidak membuat fitur tambahan atau deploy publik.
