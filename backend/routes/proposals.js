const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');
const { requireAdminAuth } = require('../middleware/auth');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'proposals');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e4)}`;
    cb(null, `${sanitizedBase}_${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExts = ['.pdf', '.doc', '.docx'];
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
    'application/zip',
  ];
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  if (allowedExts.includes(ext) && (allowedMimes.includes(mime) || !file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung. Harap unggah dokumen asli berformat PDF, DOC, atau DOCX.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// In-Memory Rate Limiter (Proteksi Anti-Spam / DoS Pendaftaran)
const submissionRateMap = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 menit
const MAX_SUBMISSIONS_PER_IP = 6; // Maksimal 6 proposal per IP dalam 15 menit

function proposalRateLimiter(req, res, next) {
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  // Bersihkan data lama jika ukuran map > 1000
  if (submissionRateMap.size > 1000) {
    for (const [ip, data] of submissionRateMap.entries()) {
      if (now - data.firstTime > RATE_LIMIT_WINDOW_MS) {
        submissionRateMap.delete(ip);
      }
    }
  }

  const record = submissionRateMap.get(clientIp);
  if (!record || now - record.firstTime > RATE_LIMIT_WINDOW_MS) {
    submissionRateMap.set(clientIp, { count: 1, firstTime: now });
    return next();
  }

  if (record.count >= MAX_SUBMISSIONS_PER_IP) {
    const minutesLeft = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - record.firstTime)) / 60000);
    return res.status(429).json({
      error: `Terlalu banyak pengiriman berkas dari jaringan Anda. Harap tunggu sekitar ${minutesLeft} menit lagi sebelum mencoba mendaftar kembali.`
    });
  }

  record.count += 1;
  next();
}

// Helper to generate unique registration number
async function generateUniqueRegistrationId() {
  for (let i = 0; i < 10; i++) {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const regId = `FTH2026-REG-${randomCode}`;
    const [existing] = await pool.query(
      'SELECT id FROM pendaftaran_proposal WHERE nomor_registrasi = ? LIMIT 1',
      [regId]
    );
    if (existing.length === 0) return regId;
  }
  return `FTH2026-REG-${Date.now().toString().slice(-6)}`;
}

// -------------------------------------------------------------
// PUBLIC: POST /api/proposals - Pendaftaran & Unggah Proposal
// -------------------------------------------------------------
router.post('/', proposalRateLimiter, (req, res) => {
  upload.single('proposalFile')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Ukuran file melebihi batas maksimal 10MB.' });
      }
      return res.status(400).json({ error: `Gagal mengunggah file: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      // Support both camelCase and snake_case payload fields
      const nama_tim = (req.body.nama_tim || req.body.teamName || '').trim();
      const nama_ketua = (req.body.nama_ketua || req.body.leaderName || '').trim();
      const email = (req.body.email || '').trim();
      const telepon = (req.body.telepon || req.body.phone || '').trim();
      const catatan = (req.body.catatan || req.body.notes || '').trim();

      if (!nama_tim || !nama_ketua || !email || !telepon) {
        // If file was uploaded during an invalid payload, remove it
        if (req.file) {
          try { fs.unlinkSync(req.file.path); } catch (e) {}
        }
        return res.status(400).json({
          error: 'Nama tim, nama ketua, email, dan nomor telepon wajib diisi.'
        });
      }

      const regId = await generateUniqueRegistrationId();
      const nama_file = req.file ? req.file.originalname : null;
      const file_path = req.file ? req.file.filename : null;
      const file_size = req.file ? req.file.size : null;

      const [result] = await pool.query(`
        INSERT INTO pendaftaran_proposal 
        (nomor_registrasi, nama_tim, nama_ketua, email, telepon, nama_file, file_path, file_size, catatan, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu')
      `, [regId, nama_tim, nama_ketua, email, telepon, nama_file, file_path, file_size, catatan]);

      const [newRow] = await pool.query(
        'SELECT * FROM pendaftaran_proposal WHERE id = ?',
        [result.insertId]
      );

      return res.status(201).json({
        message: 'Proposal Anda berhasil dikirim dan terdaftar!',
        data: newRow[0],
      });
    } catch (dbError) {
      console.error('POST /api/proposals DB error:', dbError);
      if (req.file) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      return res.status(500).json({ error: 'Terjadi kesalahan sistem saat menyimpan data pendaftaran.' });
    }
  });
});

// -------------------------------------------------------------
// ADMIN: GET /api/proposals - Daftar Pendaftar dengan Filter & Search
// -------------------------------------------------------------
router.get('/', requireAdminAuth, async (req, res) => {
  try {
    const { q, status } = req.query;

    let whereClauses = [];
    let params = [];

    if (status && status !== 'Semua') {
      whereClauses.push('status = ?');
      params.push(status);
    }

    if (q && q.trim()) {
      const searchTerm = `%${q.trim()}%`;
      whereClauses.push('(nama_tim LIKE ? OR nama_ketua LIKE ? OR email LIKE ? OR telepon LIKE ? OR nomor_registrasi LIKE ?)');
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const [rows] = await pool.query(`
      SELECT id, nomor_registrasi, nama_tim, nama_ketua, email, telepon, 
             nama_file, file_path, file_size, catatan, catatan_admin, status, created_at, updated_at
      FROM pendaftaran_proposal
      ${whereSQL}
      ORDER BY created_at DESC
    `, params);

    // Get statistics breakdown
    const [statsRows] = await pool.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'Menunggu' THEN 1 ELSE 0 END) AS menunggu,
        SUM(CASE WHEN status = 'Ditinjau' THEN 1 ELSE 0 END) AS ditinjau,
        SUM(CASE WHEN status = 'Diterima' THEN 1 ELSE 0 END) AS diterima,
        SUM(CASE WHEN status = 'Ditolak' THEN 1 ELSE 0 END) AS ditolak
      FROM pendaftaran_proposal
    `);

    res.json({
      data: rows,
      stats: {
        total: Number(statsRows[0].total || 0),
        menunggu: Number(statsRows[0].menunggu || 0),
        ditinjau: Number(statsRows[0].ditinjau || 0),
        diterima: Number(statsRows[0].diterima || 0),
        ditolak: Number(statsRows[0].ditolak || 0),
      },
    });
  } catch (error) {
    console.error('GET /api/proposals failed:', error);
    res.status(500).json({ error: 'Gagal mengambil daftar pendaftar proposal.' });
  }
});

// -------------------------------------------------------------
// ADMIN: GET /api/proposals/:id - Detail Pendaftar
// -------------------------------------------------------------
router.get('/:id', requireAdminAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM pendaftaran_proposal WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Data pendaftaran tidak ditemukan.' });
    }

    res.json({ data: rows[0] });
  } catch (error) {
    console.error('GET /api/proposals/:id failed:', error);
    res.status(500).json({ error: 'Gagal mengambil detail pendaftaran.' });
  }
});

// -------------------------------------------------------------
// PUBLIC: GET /api/proposals/track/:regId - Lacak Status Pendaftaran Mandiri
// -------------------------------------------------------------
router.get('/track/:regId', async (req, res) => {
  const { regId } = req.params;
  if (!regId || !regId.trim()) {
    return res.status(400).json({ error: 'Nomor registrasi wajib diisi.' });
  }

  try {
    const cleanReg = regId.trim().toUpperCase();
    const [rows] = await pool.query(
      `SELECT nomor_registrasi, nama_tim, nama_ketua, status, catatan, catatan_admin, created_at, updated_at
       FROM pendaftaran_proposal 
       WHERE UPPER(nomor_registrasi) = ? 
       LIMIT 1`,
      [cleanReg]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        error: 'Nomor registrasi tidak ditemukan. Pastikan kode yang Anda masukkan sesuai (contoh: FTH2026-REG-XXXX).' 
      });
    }

    res.json({
      message: 'Status pendaftaran berhasil ditemukan.',
      data: rows[0],
    });
  } catch (error) {
    console.error('Track proposal failed:', error);
    res.status(500).json({ error: 'Terjadi kesalahan sistem saat mencari status registrasi.' });
  }
});

// -------------------------------------------------------------
// ADMIN: PATCH /api/proposals/bulk-status - Ubah Status Massal
// -------------------------------------------------------------
router.patch('/bulk-status', requireAdminAuth, async (req, res) => {
  const { ids, status } = req.body;
  const validStatuses = ['Menunggu', 'Ditinjau', 'Diterima', 'Ditolak'];

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Daftar ID proposal wajib dipilih' });
  }

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status tidak valid', validStatuses });
  }

  try {
    await pool.query(
      'UPDATE pendaftaran_proposal SET status = ?, updated_at = NOW() WHERE id IN (?)',
      [status, ids]
    );

    res.json({
      message: `Berhasil mengubah status ${ids.length} proposal terpilih menjadi "${status}".`,
      count: ids.length,
      status,
    });
  } catch (error) {
    console.error('Bulk update status failed:', error);
    res.status(500).json({ error: 'Gagal memperbarui status secara massal.' });
  }
});

// -------------------------------------------------------------
// ADMIN: PATCH /api/proposals/:id/status - Update Status Pendaftaran & Catatan Admin
// -------------------------------------------------------------
router.patch('/:id/status', requireAdminAuth, async (req, res) => {
  const { status, catatan_admin } = req.body;
  const validStatuses = ['Menunggu', 'Ditinjau', 'Diterima', 'Ditolak'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      error: 'Status tidak valid',
      validStatuses,
    });
  }

  try {
    const [check] = await pool.query(
      'SELECT id FROM pendaftaran_proposal WHERE id = ?',
      [req.params.id]
    );

    if (check.length === 0) {
      return res.status(404).json({ error: 'Data pendaftaran tidak ditemukan.' });
    }

    if (catatan_admin !== undefined) {
      await pool.query(
        'UPDATE pendaftaran_proposal SET status = ?, catatan_admin = ?, updated_at = NOW() WHERE id = ?',
        [status, catatan_admin, req.params.id]
      );
    } else {
      await pool.query(
        'UPDATE pendaftaran_proposal SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, req.params.id]
      );
    }

    const [updated] = await pool.query(
      'SELECT * FROM pendaftaran_proposal WHERE id = ?',
      [req.params.id]
    );

    res.json({
      message: `Status pendaftaran berhasil diubah menjadi "${status}".`,
      data: updated[0],
    });
  } catch (error) {
    console.error('PATCH /api/proposals/:id/status failed:', error);
    res.status(500).json({ error: 'Gagal memperbarui status pendaftaran.' });
  }
});

// -------------------------------------------------------------
// ADMIN: PATCH /api/proposals/:id/notes - Update Catatan Reviewer/Admin
// -------------------------------------------------------------
router.patch('/:id/notes', requireAdminAuth, async (req, res) => {
  const { catatan_admin } = req.body;

  try {
    const [check] = await pool.query(
      'SELECT id FROM pendaftaran_proposal WHERE id = ?',
      [req.params.id]
    );

    if (check.length === 0) {
      return res.status(404).json({ error: 'Data pendaftaran tidak ditemukan.' });
    }

    await pool.query(
      'UPDATE pendaftaran_proposal SET catatan_admin = ?, updated_at = NOW() WHERE id = ?',
      [catatan_admin !== undefined ? catatan_admin : null, req.params.id]
    );

    const [updated] = await pool.query(
      'SELECT * FROM pendaftaran_proposal WHERE id = ?',
      [req.params.id]
    );

    res.json({
      message: 'Catatan internal admin/reviewer berhasil disimpan.',
      data: updated[0],
    });
  } catch (error) {
    console.error('PATCH /api/proposals/:id/notes failed:', error);
    res.status(500).json({ error: 'Gagal memperbarui catatan admin.' });
  }
});

// -------------------------------------------------------------
// ADMIN: DELETE /api/proposals/:id - Hapus Data Pendaftar
// -------------------------------------------------------------
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, file_path FROM pendaftaran_proposal WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Data pendaftaran tidak ditemukan.' });
    }

    const item = rows[0];

    // Remove file if exists
    if (item.file_path) {
      const fullFilePath = path.join(uploadDir, item.file_path);
      if (fs.existsSync(fullFilePath)) {
        try { fs.unlinkSync(fullFilePath); } catch (e) {}
      }
    }

    await pool.query('DELETE FROM pendaftaran_proposal WHERE id = ?', [req.params.id]);

    res.json({ message: 'Data pendaftaran berhasil dihapus.' });
  } catch (error) {
    console.error('DELETE /api/proposals/:id failed:', error);
    res.status(500).json({ error: 'Gagal menghapus data pendaftaran.' });
  }
});

// -------------------------------------------------------------
// PREVIEW: GET /api/proposals/:id/preview - Preview Berkas Langsung (Inline)
// -------------------------------------------------------------
router.get('/:id/preview', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT nama_file, file_path FROM pendaftaran_proposal WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0 || !rows[0].file_path) {
      return res.status(404).send('Berkas proposal tidak ditemukan.');
    }

    const { nama_file, file_path: fileName } = rows[0];
    const fullFilePath = path.join(uploadDir, fileName);

    if (!fs.existsSync(fullFilePath)) {
      return res.status(404).send('File fisik tidak ditemukan di server.');
    }

    const ext = path.extname(fileName).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.doc') {
      contentType = 'application/msword';
    } else if (ext === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(nama_file || fileName)}"`);
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    res.sendFile(fullFilePath);
  } catch (error) {
    console.error('Preview proposal failed:', error);
    res.status(500).send('Terjadi kesalahan saat memuat berkas preview.');
  }
});

// -------------------------------------------------------------
// DOWNLOAD / VIEW: GET /api/proposals/:id/download - Unduh Berkas
// -------------------------------------------------------------
router.get('/:id/download', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT nama_file, file_path FROM pendaftaran_proposal WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0 || !rows[0].file_path) {
      return res.status(404).send('Berkas proposal tidak ditemukan.');
    }

    const { nama_file, file_path: fileName } = rows[0];
    const fullFilePath = path.join(uploadDir, fileName);

    if (!fs.existsSync(fullFilePath)) {
      return res.status(404).send('File fisik tidak ditemukan di server.');
    }

    res.download(fullFilePath, nama_file || fileName);
  } catch (error) {
    console.error('Download proposal failed:', error);
    res.status(500).send('Terjadi kesalahan saat mengunduh file.');
  }
});

module.exports = router;
