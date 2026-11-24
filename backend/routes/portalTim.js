const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');
const { verifyPassword, generateToken } = require('../utils/auth');
const { requireTimAuth } = require('../middleware/timAuth');
const { checkGeofence } = require('../utils/geofence');

const router = express.Router();

// Ensure uploads/tanam directory exists
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'tanam');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage for before/after photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanField = file.fieldname === 'foto_before' ? 'before' : 'after';
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e4)}`;
    cb(null, `tanam_${cleanField}_${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // Max 15MB per photo
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|heic|heif|bmp|gif|tiff/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mime = file.mimetype || '';
    if (allowed.test(ext) || mime.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya berkas foto/gambar (JPG, JPEG, PNG, WEBP, HEIC, dll) yang diperbolehkan.'));
    }
  },
});

const uploadPointPhotos = upload.fields([
  { name: 'foto_before', maxCount: 1 },
  { name: 'foto_after', maxCount: 1 },
]);

function handlePointPhotoUpload(req, res, next) {
  uploadPointPhotos(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Gagal memproses berkas foto.' });
    }
    return next();
  });
}

function removeLocalTanamFile(assetUrl) {
  if (!assetUrl || !String(assetUrl).startsWith('/uploads/tanam/')) return;
  const targetPath = path.join(UPLOAD_DIR, path.basename(assetUrl));
  if (targetPath.startsWith(UPLOAD_DIR) && fs.existsSync(targetPath)) {
    try {
      fs.unlinkSync(targetPath);
    } catch (err) {
      console.warn('Warning deleting superseded photo:', err.message);
    }
  }
}

function cleanupUploadedFiles(files) {
  if (!files) return;
  for (const fieldFiles of Object.values(files)) {
    for (const file of fieldFiles || []) {
      if (file?.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch {
          // Ignore temporary file cleanup errors
        }
      }
    }
  }
}

function parseAndValidatePointInput(body) {
  const {
    latitude,
    longitude,
    lokasi_id,
    lokasi_nama,
    jenis_pohon,
    umur_tanam_bulan,
    jangka_hidup_tahun,
  } = body;

  if (!latitude || !longitude) {
    return { error: 'Koordinat latitude dan longitude wajib diisi.' };
  }

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { error: 'Format koordinat GPS tidak valid.' };
  }

  const locId = (lokasi_id || 'batu-busuak').trim().toLowerCase().replace(/\s+/g, '-');
  const locName = (lokasi_nama || 'Batu Busuak').trim();
  const treeSpecies = (jenis_pohon || 'Trembesi').trim();
  const parsedUmur = parseInt(umur_tanam_bulan, 10);
  const umurBulan = Number.isFinite(parsedUmur) && parsedUmur >= 0 ? parsedUmur : 1;
  const jangkaTahun = parseInt(jangka_hidup_tahun, 10) || 40;

  const geofence = checkGeofence(lat, lng, locId);
  const initialCatatan = geofence.isOutOfZone
    ? `🚨 [GEOFENCE ALERT]: Posisi terdeteksi berjarak ${geofence.distFormatted} di luar zona resmi ${geofence.zoneName}!`
    : null;

  return {
    lat,
    lng,
    locId,
    locName,
    treeSpecies,
    umurBulan,
    jangkaTahun,
    pointWkt: `POINT(${lng} ${lat})`,
    initialCatatan,
  };
}
// =========================================================================
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan kata sandi tim wajib diisi.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, proposal_id, username, password_hash, salt, nama_tim, nama_ketua, telepon, target_pohon, is_active FROM tim_users WHERE username = ? LIMIT 1',
      [username.trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Username atau kata sandi tim tidak ditemukan.' });
    }

    const team = rows[0];
    if (!team.is_active) {
      return res.status(403).json({ error: 'Akun tim Anda sedang dinonaktifkan oleh panitia.' });
    }

    const isMatch = verifyPassword(password, team.salt, team.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Username atau kata sandi tim salah.' });
    }

    // Update last_login
    await pool.query('UPDATE tim_users SET last_login = NOW() WHERE id = ?', [team.id]);

    const token = generateToken({
      id: team.id,
      proposal_id: team.proposal_id,
      username: team.username,
      nama_tim: team.nama_tim,
      role: 'tim',
    });

    res.json({
      message: 'Login tim berhasil',
      token,
      team: {
        id: team.id,
        proposal_id: team.proposal_id,
        username: team.username,
        nama_tim: team.nama_tim,
        nama_ketua: team.nama_ketua,
        telepon: team.telepon,
        target_pohon: team.target_pohon,
      },
    });
  } catch (error) {
    console.error('POST /api/tim/login error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan sistem saat memproses login tim.' });
  }
});

// =========================================================================
// 2. GET /api/tim/me - Profil & Progres Penanaman Tim
// =========================================================================
router.get('/me', requireTimAuth, async (req, res) => {
  try {
    const [teamRows] = await pool.query(
      'SELECT id, proposal_id, username, nama_tim, nama_ketua, telepon, target_pohon, last_login FROM tim_users WHERE id = ? LIMIT 1',
      [req.tim.id]
    );

    if (teamRows.length === 0) {
      return res.status(404).json({ error: 'Profil tim tidak ditemukan.' });
    }

    const team = teamRows[0];

    // Count statistics of submitted points
    const [statRows] = await pool.query(`
      SELECT 
        COUNT(*) AS total_submitted,
        SUM(CASE WHEN status_verifikasi = 'approved' THEN 1 ELSE 0 END) AS total_approved,
        SUM(CASE WHEN status_verifikasi = 'pending' THEN 1 ELSE 0 END) AS total_pending,
        SUM(CASE WHEN status_verifikasi = 'rejected' THEN 1 ELSE 0 END) AS total_rejected
      FROM titik_tanam
      WHERE tim_id = ?
    `, [req.tim.id]);

    const stats = statRows[0] || { total_submitted: 0, total_approved: 0, total_pending: 0, total_rejected: 0 };

    res.json({
      team,
      stats: {
        target_pohon: team.target_pohon,
        total_submitted: Number(stats.total_submitted) || 0,
        total_approved: Number(stats.total_approved) || 0,
        total_pending: Number(stats.total_pending) || 0,
        total_rejected: Number(stats.total_rejected) || 0,
      },
    });
  } catch (error) {
    console.error('GET /api/tim/me error:', error);
    res.status(500).json({ error: 'Gagal memuat profil tim.' });
  }
});

// =========================================================================
// 3. GET /api/tim/titik-tanam - Daftar Titik yang Diinput oleh Tim
// =========================================================================
router.get('/titik-tanam', requireTimAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id, nama_peserta, lokasi_id, lokasi_nama, jenis_pohon,
        umur_tanam_bulan, jangka_hidup_tahun, foto_before_url, foto_after_url,
        status_verifikasi, catatan_verifikasi, created_at, updated_at,
        ST_X(geom) AS longitude,
        ST_Y(geom) AS latitude
      FROM titik_tanam
      WHERE tim_id = ?
      ORDER BY id DESC
    `, [req.tim.id]);

    res.json({ data: rows });
  } catch (error) {
    console.error('GET /api/tim/titik-tanam error:', error);
    res.status(500).json({ error: 'Gagal mengambil data titik tanam tim.' });
  }
});

// =========================================================================
// 4. POST /api/tim/titik-tanam - Tambah Titik Tanam Baru oleh Tim
//    (Foto Before wajib saat awal tanam; Foto After 6 bulan bersifat opsional)
// =========================================================================
router.post(
  '/titik-tanam',
  requireTimAuth,
  handlePointPhotoUpload,
  async (req, res) => {
    try {
      const parsed = parseAndValidatePointInput(req.body);
      if (parsed.error) {
        cleanupUploadedFiles(req.files);
        return res.status(400).json({ error: parsed.error });
      }

      const beforeFile = req.files && req.files.foto_before ? req.files.foto_before[0] : null;
      const afterFile = req.files && req.files.foto_after ? req.files.foto_after[0] : null;

      if (!beforeFile) {
        cleanupUploadedFiles(req.files);
        return res.status(400).json({
          error: 'Foto awal saat pertama ditanam (Before) wajib diunggah. Foto After (6 bulan) boleh menyusul.',
        });
      }

      const foto_before_url = `/uploads/tanam/${beforeFile.filename}`;
      const foto_after_url = afterFile ? `/uploads/tanam/${afterFile.filename}` : null;

      const [insertResult] = await pool.query(`
        INSERT INTO titik_tanam (
          tim_id, nama_peserta, lokasi_id, lokasi_nama, jenis_pohon,
          umur_tanam_bulan, jangka_hidup_tahun, foto_before_url, foto_after_url,
          status_verifikasi, catatan_verifikasi, geom
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          'pending', ?, ST_GeomFromText(?)
        )
      `, [
        req.tim.id,
        req.tim.nama_tim,
        parsed.locId,
        parsed.locName,
        parsed.treeSpecies,
        parsed.umurBulan,
        parsed.jangkaTahun,
        foto_before_url,
        foto_after_url,
        parsed.initialCatatan,
        parsed.pointWkt,
      ]);

      res.status(201).json({
        message: 'Titik penanaman berhasil dikirim! Menunggu verifikasi panitia.',
        id: insertResult.insertId,
        point: {
          id: insertResult.insertId,
          tim_id: req.tim.id,
          nama_peserta: req.tim.nama_tim,
          lokasi_id: parsed.locId,
          lokasi_nama: parsed.locName,
          jenis_pohon: parsed.treeSpecies,
          umur_tanam_bulan: parsed.umurBulan,
          jangka_hidup_tahun: parsed.jangkaTahun,
          latitude: parsed.lat,
          longitude: parsed.lng,
          foto_before_url,
          foto_after_url,
          status_verifikasi: 'pending',
          updated_at: null,
        },
      });
    } catch (error) {
      cleanupUploadedFiles(req.files);
      console.error('POST /api/tim/titik-tanam error:', error);
      res.status(500).json({ error: `Gagal menyimpan titik penanaman: ${error.message}` });
    }
  }
);

// =========================================================================
// 5. PUT /api/tim/titik-tanam/:id - Edit / Update Titik Tanam (Semua Kondisi)
//    Mempertahankan ID/kode titik yang sama dan mereset status ke 'pending'
// =========================================================================
router.put(
  '/titik-tanam/:id',
  requireTimAuth,
  handlePointPhotoUpload,
  async (req, res) => {
    const pointId = req.params.id;
    try {
      const [rows] = await pool.query(
        'SELECT id, tim_id, foto_before_url, foto_after_url, status_verifikasi FROM titik_tanam WHERE id = ? LIMIT 1',
        [pointId]
      );

      if (rows.length === 0) {
        cleanupUploadedFiles(req.files);
        return res.status(404).json({ error: 'Titik penanaman tidak ditemukan.' });
      }

      const existing = rows[0];
      if (existing.tim_id !== req.tim.id) {
        cleanupUploadedFiles(req.files);
        return res.status(403).json({ error: 'Anda hanya dapat memperbarui titik penanaman milik tim Anda.' });
      }

      const parsed = parseAndValidatePointInput(req.body);
      if (parsed.error) {
        cleanupUploadedFiles(req.files);
        return res.status(400).json({ error: parsed.error });
      }

      const beforeFile = req.files && req.files.foto_before ? req.files.foto_before[0] : null;
      const afterFile = req.files && req.files.foto_after ? req.files.foto_after[0] : null;
      const clearAfter = req.body.clear_foto_after === 'true';

      const nextBeforeUrl = beforeFile ? `/uploads/tanam/${beforeFile.filename}` : existing.foto_before_url;
      if (!nextBeforeUrl) {
        cleanupUploadedFiles(req.files);
        return res.status(400).json({ error: 'Foto awal saat pertama ditanam (Before) wajib tersedia.' });
      }

      const nextAfterUrl = afterFile
        ? `/uploads/tanam/${afterFile.filename}`
        : clearAfter
        ? null
        : existing.foto_after_url;

      await pool.query(`
        UPDATE titik_tanam
        SET lokasi_id = ?,
            lokasi_nama = ?,
            jenis_pohon = ?,
            umur_tanam_bulan = ?,
            jangka_hidup_tahun = ?,
            foto_before_url = ?,
            foto_after_url = ?,
            status_verifikasi = 'pending',
            catatan_verifikasi = ?,
            geom = ST_GeomFromText(?),
            updated_at = NOW()
        WHERE id = ? AND tim_id = ?
      `, [
        parsed.locId,
        parsed.locName,
        parsed.treeSpecies,
        parsed.umurBulan,
        parsed.jangkaTahun,
        nextBeforeUrl,
        nextAfterUrl,
        parsed.initialCatatan,
        parsed.pointWkt,
        pointId,
        req.tim.id,
      ]);

      // Remove superseded files only after DB update succeeds
      if (beforeFile && existing.foto_before_url && existing.foto_before_url !== nextBeforeUrl) {
        removeLocalTanamFile(existing.foto_before_url);
      }
      if ((afterFile || clearAfter) && existing.foto_after_url && existing.foto_after_url !== nextAfterUrl) {
        removeLocalTanamFile(existing.foto_after_url);
      }

      res.json({
        message: 'Data titik penanaman berhasil diperbarui dengan kode yang sama dan diajukan untuk verifikasi ulang panitia.',
        id: existing.id,
        point: {
          id: existing.id,
          tim_id: req.tim.id,
          nama_peserta: req.tim.nama_tim,
          lokasi_id: parsed.locId,
          lokasi_nama: parsed.locName,
          jenis_pohon: parsed.treeSpecies,
          umur_tanam_bulan: parsed.umurBulan,
          jangka_hidup_tahun: parsed.jangkaTahun,
          latitude: parsed.lat,
          longitude: parsed.lng,
          foto_before_url: nextBeforeUrl,
          foto_after_url: nextAfterUrl,
          status_verifikasi: 'pending',
        },
      });
    } catch (error) {
      cleanupUploadedFiles(req.files);
      console.error('PUT /api/tim/titik-tanam/:id error:', error);
      res.status(500).json({ error: `Gagal memperbarui titik penanaman: ${error.message}` });
    }
  }
);

// =========================================================================
// 5. DELETE /api/tim/titik-tanam/:id - Hapus Titik Tanam (jika masih pending)
// =========================================================================
router.delete('/titik-tanam/:id', requireTimAuth, async (req, res) => {
  const pointId = req.params.id;
  try {
    const [rows] = await pool.query(
      'SELECT id, tim_id, status_verifikasi FROM titik_tanam WHERE id = ? LIMIT 1',
      [pointId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Titik penanaman tidak ditemukan.' });
    }

    const pt = rows[0];
    if (pt.tim_id !== req.tim.id) {
      return res.status(403).json({ error: 'Anda hanya dapat menghapus titik penanaman milik tim Anda.' });
    }

    if (pt.status_verifikasi === 'approved') {
      return res.status(400).json({ error: 'Titik penanaman yang sudah disetujui panitia tidak dapat dihapus mandiri.' });
    }

    await pool.query('DELETE FROM titik_tanam WHERE id = ?', [pointId]);
    res.json({ message: 'Titik penanaman berhasil dihapus.' });
  } catch (error) {
    console.error('DELETE /api/tim/titik-tanam/:id error:', error);
    res.status(500).json({ error: 'Gagal menghapus titik penanaman.' });
  }
});

module.exports = router;
