# Priorio

Aplikasi manajemen tugas pribadi untuk akademik dan nonakademik. Priorio menyimpan data di SQLite pada perangkat ini dan berjalan di alamat lokal `http://127.0.0.1:3000`.

## Mulai

Gunakan Node.js 22 LTS (minimal 22.12 pada major 22) dan npm. Jalankan perintah berikut dari folder proyek. Instalasi pertama membutuhkan koneksi internet. Aplikasi inti berfungsi offline setelah instalasi.

```powershell
Copy-Item .env.example .env
npm ci
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Buka [Priorio lokal](http://127.0.0.1:3000). Pada macOS atau Linux, gunakan `cp .env.example .env`. Perintah seed menyiapkan kategori bawaan satu kali. Untuk tugas akademik pertama, buat mata kuliah di halaman **Mata kuliah** atau langsung dari form tugas.

Untuk mode produksi lokal, hentikan server dev, lalu jalankan:

```powershell
npm run build
npm run start
```

**Semua tugas** menyediakan pencarian judul dan deskripsi, filter gabungan, dan pengurutan. **Prioritas** menampilkan ranking dinamis berdasarkan urgensi tenggat dan tingkat kesulitan. **Kalender** menampilkan tugas berdasarkan tanggal tenggat. Tema, bahasa, preferensi sidebar, versi, dan path database tersedia di **Pengaturan**.

## Penyimpanan dan upgrade

Secara default, database berada di `data/priorio.db`. Jika perlu, atur `DATABASE_URL` di `.env` ke path SQLite lokal dengan awalan `file:`. Path relatif dihitung dari root proyek. Pengaturan aplikasi dan tugas tersimpan lintas restart.

Cadangkan database sebelum upgrade. Dari root, jalankan `npm ci`, `npm run db:generate`, `npm run db:migrate`, dan `npm run db:seed`, lalu build ulang untuk mode produksi. Untuk migrasi pengembangan gunakan hanya database fixture terpisah. Priorio V1 berjalan single-user di loopback tanpa login. Jaga file database dan cadangannya di lokasi lokal yang hanya dapat diakses oleh akun yang berwenang.

## Cadangan dan pemulihan

1. Hentikan Priorio dan tutup semua klien SQLite yang membuka database.
2. Jika ada file berakhiran `-wal` atau `-shm`, lakukan checkpoint dengan klien SQLite tepercaya lalu tutup klien. Verifikasi bahwa file sidecar sudah hilang. Jika tidak melakukan checkpoint, simpan database dan sidecar yang masih ada sebagai satu snapshot dari server yang sudah dihentikan.
3. Salin file ke folder cadangan di luar proyek. Contoh PowerShell untuk snapshot dengan database tunggal:

   ```powershell
   $backupDir = Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'Priorio Backups'
   New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
   $snapshot = Join-Path $backupDir ("priorio-" + (Get-Date -Format 'yyyyMMdd-HHmmss') + ".db")
   Copy-Item -LiteralPath 'data/priorio.db' -Destination $snapshot
   ```

4. Verifikasi salinan terisolasi menggunakan `PRAGMA integrity_check;` dan periksa jumlah tugas. Gunakan path database dari **Pengaturan** jika Anda mengubah lokasi default.
5. Untuk memulihkan, hentikan kembali seluruh klien SQLite. Buat cadangan database aktif terlebih dahulu. Ganti database dengan snapshot yang telah dibuktikan, sertakan sidecar snapshot jika ada, dan pisahkan sidecar lama setelah memastikan salinannya aman. Jalankan pemeriksaan integritas serta `npm run db:migrate`, lalu mulai Priorio dan periksa jumlah tugas serta preferensi.

## Pengujian

```powershell
npm run check
npm exec -- playwright install chromium
npm run test:e2e
```

`check` menjalankan lint, typecheck, unit/integration test, dan build. Playwright menggunakan server produksi terpisah di port 3100 serta database sementara. Spesifikasi tersedia di [folder doc](doc/README.md).
