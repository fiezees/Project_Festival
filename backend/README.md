# Festival Pohon API

Backend REST API untuk fitur WebGIS Festival Tanam Pohon.

## Setup

1. Pastikan MySQL 8+ atau MariaDB 10.5+ aktif.
2. Import `festival_pohon.sql`:

```powershell
mysql -u root -p < festival_pohon.sql
```

3. Salin `.env.example` menjadi `.env`, lalu isi password database.
4. Install dependency dan jalankan server:

```powershell
npm install
npm run dev
```

API tersedia di `http://localhost:3001`.

Frontend Vite berjalan di `http://localhost:5173`, sehingga `.env` backend perlu
memakai `FRONTEND_ORIGIN=http://localhost:5173` agar request tidak diblokir CORS.

## Endpoint

- `GET /` health check
- `GET /api/wilayah` GeoJSON polygon wilayah
- `GET /api/tanam` GeoJSON 100 titik tanam
- `GET /api/tanam?jenis=Mahoni` filter jenis pohon
- `GET /api/stats` total, statistik per jenis, dan luas wilayah
