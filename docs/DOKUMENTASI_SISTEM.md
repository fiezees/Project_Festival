# Dokumentasi Sistem WebGIS Kelapa Sawit

Dokumen ini menjelaskan cara menjalankan, memahami, dan mengembangkan aplikasi WebGIS pemetaan perkebunan kelapa sawit pada proyek ini. Sistem terdiri dari frontend Next.js, backend Express.js, dan database MySQL/MariaDB dengan data spasial.

## 1. Gambaran Umum

```text
Browser
  |
  v
Frontend Next.js + React + Leaflet
  | REST/JSON dan GeoJSON
  v
Backend Express.js
  | mysql2/promise
  v
MySQL 8.0+ atau MariaDB 10.5+
```

Fitur yang tersedia:

- Menampilkan polygon batas blok pada peta OpenStreetMap.
- Menampilkan titik pohon berdasarkan kelas kondisi.
- Menampilkan statistik total pohon, jumlah tiap kelas, luas blok, dan jumlah blok.
- Memfilter marker berdasarkan kelas pohon.
- Mencari pohon berdasarkan ID, kelas, atau deskripsi.
- Memusatkan peta dan menyorot pohon dari hasil pencarian atau klik marker.
- Mengubah kelas dan deskripsi pohon melalui panel edit.

## 2. Struktur Proyek

```text
webgis-sawit/
├── backend/
│   ├── index.js             # Entry point Express dan registrasi route
│   ├── db.js                # Connection pool MySQL
│   ├── nyawit.sql           # Schema dan data awal
│   ├── package.json
│   └── routes/
│       ├── blok.js          # Endpoint polygon blok
│       ├── pohon.js         # Endpoint pohon, search, dan update
│       └── stats.js         # Endpoint statistik
├── frontend/
│   ├── app/
│   │   ├── page.js          # Halaman utama dan state aplikasi
│   │   ├── layout.js        # Root layout
│   │   └── globals.css      # Style global
│   ├── components/
│   │   ├── Map.jsx          # Peta Leaflet dan layer GeoJSON
│   │   ├── RightPanel.jsx   # Statistik, filter, legenda, dan detail
│   │   ├── SearchBar.jsx    # Pencarian pohon
│   │   └── EditModal.jsx    # Form perubahan data pohon
│   ├── lib/
│   │   ├── api.js           # Helper request ke backend
│   │   └── colors.js        # Warna dan label kelas pohon
│   └── package.json
└── docs/
  ├── DOKUMENTASI_SISTEM.md
  ├── backend/RENCANA_BACKEND.md
  └── frontend/RENCANA_FRONTEND.md
```

## 3. Prasyarat

- Node.js 18 atau lebih baru.
- npm.
- MySQL 8.0+ atau MariaDB 10.5+.
- Peramban modern yang mendukung JavaScript.

## 4. Instalasi Database

Masuk ke MySQL/MariaDB:

```powershell
mysql -u root -p
```

Buat database:

```sql
CREATE DATABASE nyawit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Import schema dan data dari folder `backend`:

```powershell
cd backend
mysql -u root -p nyawit_db < nyawit.sql
```

Verifikasi data:

```sql
USE nyawit_db;
SELECT COUNT(*) AS jumlah_pohon FROM titik_pohon;
SELECT COUNT(*) AS jumlah_blok FROM batas_blok;
SELECT tree_class, COUNT(*) AS jumlah
FROM titik_pohon
GROUP BY tree_class;
```

Database awal berisi satu polygon blok dan 250 titik pohon. Geometri menggunakan `POINT` dan `POLYGON`. Koordinat disimpan sebagai `X=longitude` dan `Y=latitude` menggunakan SRID 0 supaya langsung cocok dengan GeoJSON dan Leaflet.

## 5. Menjalankan Backend

Masuk ke folder backend dan install dependency:

```powershell
cd backend
npm install
```

Buat file `.env` di dalam folder `backend`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nyawit_db
DB_USER=root
DB_PASSWORD=password_mysql_anda
PORT=3001
FRONTEND_ORIGIN=http://localhost:3000
```

Mode pengembangan:

```powershell
npm run dev
```

Mode produksi:

```powershell
npm start
```

Backend berjalan pada `http://localhost:3001`. Endpoint `/` dapat digunakan sebagai health check.

## 6. Menjalankan Frontend

Buka terminal baru:

```powershell
cd frontend
npm install
```

Buat file `.env.local`:

```env
NEXT_PUBLIC_API_BASE=http://localhost:3001/api
```

Jalankan frontend:

```powershell
npm run dev
```

Buka `http://localhost:3000`.

Perintah frontend lain:

```powershell
npm run lint
npm run build
npm start
```

Frontend mengimpor `Map.jsx` dengan `next/dynamic` dan `ssr: false` karena Leaflet membutuhkan objek browser seperti `window`.

## 7. Dokumentasi API Backend

Base URL: `http://localhost:3001`

### Health check

```http
GET /
```

Contoh respons:

```json
{
  "status": "ok",
  "service": "webgis-sawit-api",
  "endpoints": ["/api/blok", "/api/pohon", "/api/pohon?class=healthy", "/api/stats"]
}
```

### Mengambil blok

```http
GET /api/blok
```

Respons berupa GeoJSON `FeatureCollection`. Property setiap feature adalah `id`, `nama_blok`, `komoditas`, dan `luas_ha`.

### Mengambil pohon

```http
GET /api/pohon
GET /api/pohon?class=healthy
```

Nilai `class` yang valid adalah `healthy`, `small`, `mismanaged`, `yellow`, dan `dead`. Feature pohon memiliki property `id`, `pohon_id`, `tree_class`, `confidence`, dan `deskripsi`.

### Mencari pohon

```http
GET /api/pohon/search?q=25
```

Pencarian mencocokkan sebagian `pohon_id`, `tree_class`, atau `deskripsi`, dan mengembalikan maksimal 10 hasil. Respons berupa array biasa, bukan `FeatureCollection`, dengan field `lat` dan `lng`.

### Mengubah data pohon

```http
PUT /api/pohon/:id
Content-Type: application/json
```

Body dapat berisi salah satu atau kedua field berikut:

```json
{
  "tree_class": "healthy",
  "deskripsi": "Kondisi membaik setelah perawatan"
}
```

`tree_class` harus memakai salah satu dari lima nilai kelas yang valid. Jika record tidak ditemukan, API mengembalikan status `404`.

### Mengambil statistik

```http
GET /api/stats
```

Contoh bentuk respons:

```json
{
  "total": 250,
  "healthy": 160,
  "small": 35,
  "mismanaged": 25,
  "yellow": 20,
  "dead": 10,
  "luas_ha": 8.5,
  "total_blok": 1
}
```

Nilai jumlah kelas pada contoh dapat berubah sesuai isi database.

## 8. Alur Frontend

1. `app/page.js` menyimpan state kelas aktif, pohon terpilih, target pencarian, dan `refreshKey`.
2. `Map.jsx` memanggil `/api/blok` dan `/api/pohon`, kemudian merender respons sebagai layer GeoJSON.
3. `RightPanel.jsx` memanggil `/api/stats`, menampilkan filter dan legenda, serta membuka detail pohon.
4. `SearchBar.jsx` melakukan pencarian dengan jeda 300 ms untuk mengurangi request berulang.
5. Saat hasil pencarian atau marker dipilih, frontend mengirim target koordinat ke peta untuk `flyTo` dan menampilkan highlight.
6. `EditModal.jsx` mengirim perubahan melalui `updatePohon()` ke endpoint `PUT`.
7. Setelah update berhasil, `refreshKey` berubah sehingga data peta dan statistik dimuat kembali.

Kelas dan warna marker didefinisikan terpusat di `frontend/lib/colors.js`:

| Kelas | Label | Warna |
|---|---|---|
| `healthy` | Sehat | Hijau |
| `small` | Kecil | Biru |
| `mismanaged` | Tidak Terawat | Oranye |
| `yellow` | Kuning | Kuning |
| `dead` | Mati | Merah |

## 9. Penanganan Error

- Backend mengembalikan `400` untuk parameter kelas yang tidak valid.
- Backend mengembalikan `404` untuk route atau pohon yang tidak ditemukan.
- Backend mengembalikan `500` jika query database gagal.
- Helper API frontend melempar error untuk semua respons HTTP non-2xx.
- Peta dan panel menampilkan pesan error ketika request gagal.

Jika peta gagal dimuat, periksa urutan berikut:

1. Backend aktif di port 3001.
2. `NEXT_PUBLIC_API_BASE` menunjuk ke URL backend yang benar.
3. Database aktif dan kredensial di `.env` benar.
4. CORS `FRONTEND_ORIGIN` sesuai dengan URL frontend.
5. Endpoint dapat diakses langsung, misalnya `http://localhost:3001/api/stats`.

## 10. Pengembangan dan Perluasan

Untuk menambah atribut pohon:

1. Tambahkan kolom pada tabel `titik_pohon`.
2. Sertakan kolom tersebut pada query di `routes/pohon.js`.
3. Masukkan field ke object `properties` GeoJSON.
4. Perbarui tipe data atau form pada `EditModal.jsx` bila field dapat diedit.
5. Perbarui dokumentasi API dan validasi request.

Untuk menambah kelas pohon, ubah secara konsisten `VALID_CLASSES` di backend dan `CLASS_COLORS`, `CLASS_LABELS`, serta `CLASS_KEYS` di frontend.

## 11. Catatan Produksi

- Jangan meng-commit `.env` atau password database.
- Batasi `FRONTEND_ORIGIN` ke domain frontend produksi, bukan `*`.
- Tambahkan autentikasi dan otorisasi sebelum mengaktifkan endpoint edit di jaringan publik.
- Gunakan HTTPS untuk frontend dan backend yang diakses melalui internet.
- Untuk data lebih besar, pertimbangkan pagination, bounding-box query, dan spatial index.
