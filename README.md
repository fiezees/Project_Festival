# Festival Tanam Pohon

Aplikasi utama Festival Tanam Pohon terdiri dari frontend Vite/React dan backend Express/MySQL.

## Struktur

- `frontend/` - Home, WebGIS, Berita, dan komponen UI.
- `backend/` - REST API dan schema database spasial.
- `docs/` - Dokumentasi proyek.

## Menjalankan

Pastikan MySQL/MariaDB aktif dan database sudah di-import dari `backend/festival_pohon.sql`.

Terminal 1:

```powershell
cd frontend
npm run dev
```

Terminal 2:

```powershell
cd backend
npm run dev
```

Buka `http://localhost:5173`.

Frontend menggunakan `http://localhost:3001/api` melalui `frontend/.env`. Backend memakai `FRONTEND_ORIGIN=http://localhost:5173`.
