const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../db');
const { requireAdminAuth } = require('../middleware/auth');

const router = express.Router();

// Ensure upload directory exists for news images
const newsUploadDir = path.join(__dirname, '..', 'uploads', 'berita');
if (!fs.existsSync(newsUploadDir)) {
  fs.mkdirSync(newsUploadDir, { recursive: true });
}

// Multer storage for news images
const newsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, newsUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e4)}`;
    cb(null, `berita_${cleanBase}_${uniqueSuffix}${ext}`);
  },
});

const newsFileFilter = (req, file, cb) => {
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  if (allowedExts.includes(ext) || mime.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung. Harap unggah gambar berekstensi JPG, PNG, WEBP, atau GIF.'));
  }
};

const uploadNewsImage = multer({
  storage: newsStorage,
  fileFilter: newsFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Helper to create a URL-friendly slug
function createSlug(title) {
  const base = String(title || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base || 'berita'}-${Date.now().toString(36)}`;
}

// Helper to calculate reading time
function estimateReadingTime(content) {
  const words = String(content || '').trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  return `${minutes} menit`;
}

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

// 1. GET /api/berita - Daftar Berita Publik Terpublikasi
router.get('/', async (req, res) => {
  try {
    const { search = '', kategori = 'Semua', page = 1, limit = 12 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    const conditions = ["status = 'published'"];
    const params = [];

    if (kategori && kategori !== 'Semua') {
      conditions.push('kategori = ?');
      params.push(kategori);
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      conditions.push('(judul LIKE ? OR ringkasan LIKE ? OR konten LIKE ? OR penulis LIKE ?)');
      params.push(q, q, q, q);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM berita ${whereClause}`,
      params
    );
    const total = countRows[0]?.total || 0;

    // Fetch articles
    const [rows] = await pool.query(
      `SELECT id, slug, judul, ringkasan, gambar_url, kategori, penulis, waktu_baca, is_featured, views_count, published_at, created_at
       FROM berita
       ${whereClause}
       ORDER BY is_featured DESC, published_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error('Error fetching public news:', error);
    res.status(500).json({ error: 'Gagal memuat berita.' });
  }
});

// 2. GET /api/berita/kategori - Daftar Kategori Berita Aktif
router.get('/kategori', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nama, slug, deskripsi, warna_badge 
       FROM kategori_berita 
       WHERE is_active = 1 
       ORDER BY id ASC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching news categories:', error);
    res.status(500).json({ error: 'Gagal memuat kategori berita.' });
  }
});

// 3. GET /api/berita/headline - Berita Utama / Featured
router.get('/headline', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, slug, judul, ringkasan, konten, gambar_url, kategori, penulis, waktu_baca, is_featured, views_count, published_at, created_at
       FROM berita
       WHERE status = 'published'
       ORDER BY is_featured DESC, published_at DESC, id DESC
       LIMIT 1`
    );

    res.json({
      success: true,
      data: rows[0] || null,
    });
  } catch (error) {
    console.error('Error fetching headline news:', error);
    res.status(500).json({ error: 'Gagal memuat berita utama.' });
  }
});

// 4. GET /api/berita/:slugOrId - Detail Berita Lengkap & Increment Views
router.get('/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const isNumeric = /^\d+$/.test(slugOrId);

    const condition = isNumeric ? 'id = ?' : 'slug = ?';
    const [rows] = await pool.query(
      `SELECT id, slug, judul, ringkasan, konten, gambar_url, kategori, penulis, waktu_baca, status, is_featured, views_count, published_at, created_at, updated_at
       FROM berita
       WHERE ${condition}
       LIMIT 1`,
      [slugOrId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Artikel berita tidak ditemukan.' });
    }

    const article = rows[0];

    // Increment views count silently
    pool.query('UPDATE berita SET views_count = views_count + 1 WHERE id = ?', [article.id]).catch(() => {});

    res.json({
      success: true,
      data: {
        ...article,
        views_count: article.views_count + 1,
      },
    });
  } catch (error) {
    console.error('Error fetching news detail:', error);
    res.status(500).json({ error: 'Gagal memuat artikel berita.' });
  }
});

// ============================================================================
// ADMIN ROUTES (Protected with requireAdminAuth)
// ============================================================================

// 5. GET /api/admin/berita - Daftar Semua Berita (termasuk draf & arsip) + Statistik
router.get('/admin/list', requireAdminAuth, async (req, res) => {
  try {
    const { status = 'all', kategori = 'Semua', search = '' } = req.query;

    const conditions = [];
    const params = [];

    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (kategori && kategori !== 'Semua') {
      conditions.push('kategori = ?');
      params.push(kategori);
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      conditions.push('(judul LIKE ? OR ringkasan LIKE ? OR penulis LIKE ?)');
      params.push(q, q, q);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Fetch articles
    const [rows] = await pool.query(
      `SELECT id, slug, judul, ringkasan, gambar_url, kategori, penulis, waktu_baca, status, is_featured, views_count, published_at, created_at, updated_at
       FROM berita
       ${whereClause}
       ORDER BY is_featured DESC, updated_at DESC, id DESC`,
      params
    );

    // Fetch summary statistics
    const [statRows] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) as archived,
        COALESCE(SUM(views_count), 0) as totalViews
      FROM berita
    `);

    res.json({
      success: true,
      data: rows,
      stats: statRows[0] || { total: 0, published: 0, draft: 0, archived: 0, totalViews: 0 },
    });
  } catch (error) {
    console.error('Error fetching admin news list:', error);
    res.status(500).json({ error: 'Gagal memuat data berita admin.' });
  }
});

// 6. POST /api/admin/berita - Tambah Berita Baru
router.post('/admin', requireAdminAuth, async (req, res) => {
  try {
    const {
      judul,
      ringkasan,
      konten,
      gambar_url,
      kategori = 'Umum',
      penulis = 'Tim Redaksi Festival',
      waktu_baca,
      status = 'published',
      is_featured = 0,
    } = req.body;

    if (!judul || !judul.trim()) {
      return res.status(400).json({ error: 'Judul berita wajib diisi.' });
    }
    if (!konten || !konten.trim()) {
      return res.status(400).json({ error: 'Konten artikel berita wajib diisi.' });
    }

    const cleanJudul = judul.trim();
    const cleanRingkasan = (ringkasan || konten.substring(0, 180)).trim();
    const cleanSlug = createSlug(cleanJudul);
    const calculatedReadTime = waktu_baca || estimateReadingTime(konten);
    const publishedAt = status === 'published' ? new Date() : null;

    const [result] = await pool.query(
      `INSERT INTO berita 
       (slug, judul, ringkasan, konten, gambar_url, kategori, penulis, waktu_baca, status, is_featured, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanSlug,
        cleanJudul,
        cleanRingkasan,
        konten.trim(),
        gambar_url || null,
        kategori,
        penulis.trim(),
        calculatedReadTime,
        status,
        is_featured ? 1 : 0,
        publishedAt,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Artikel berita berhasil diterbitkan!',
      data: {
        id: result.insertId,
        slug: cleanSlug,
        judul: cleanJudul,
        status,
      },
    });
  } catch (error) {
    console.error('Error creating news article:', error);
    res.status(500).json({ error: 'Gagal menyimpan artikel berita baru.' });
  }
});

// 7. PUT /api/admin/berita/:id - Edit / Perbarui Berita
router.put('/admin/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      judul,
      ringkasan,
      konten,
      gambar_url,
      kategori,
      penulis,
      waktu_baca,
      status,
      is_featured,
    } = req.body;

    const [existingRows] = await pool.query('SELECT * FROM berita WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Artikel berita tidak ditemukan.' });
    }

    const existing = existingRows[0];
    const newJudul = judul ? judul.trim() : existing.judul;
    const newKonten = konten ? konten.trim() : existing.konten;
    const newRingkasan = ringkasan ? ringkasan.trim() : existing.ringkasan;
    const newReadTime = waktu_baca || estimateReadingTime(newKonten);
    const newStatus = status || existing.status;
    const newFeatured = typeof is_featured !== 'undefined' ? (is_featured ? 1 : 0) : existing.is_featured;

    let publishedAt = existing.published_at;
    if (newStatus === 'published' && !publishedAt) {
      publishedAt = new Date();
    }

    await pool.query(
      `UPDATE berita SET 
         judul = ?,
         ringkasan = ?,
         konten = ?,
         gambar_url = ?,
         kategori = ?,
         penulis = ?,
         waktu_baca = ?,
         status = ?,
         is_featured = ?,
         published_at = ?
       WHERE id = ?`,
      [
        newJudul,
        newRingkasan,
        newKonten,
        gambar_url !== undefined ? gambar_url : existing.gambar_url,
        kategori || existing.kategori,
        penulis ? penulis.trim() : existing.penulis,
        newReadTime,
        newStatus,
        newFeatured,
        publishedAt,
        id,
      ]
    );

    res.json({
      success: true,
      message: 'Artikel berita berhasil diperbarui!',
    });
  } catch (error) {
    console.error('Error updating news article:', error);
    res.status(500).json({ error: 'Gagal memperbarui artikel berita.' });
  }
});

// 8. PATCH /api/admin/berita/:id/status - Toggle Status (published / draft / archived)
router.patch('/admin/:id/status', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['published', 'draft', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid.' });
    }

    const [rows] = await pool.query('SELECT published_at FROM berita WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Artikel berita tidak ditemukan.' });
    }

    let publishedAt = rows[0].published_at;
    if (status === 'published' && !publishedAt) {
      publishedAt = new Date();
    }

    await pool.query('UPDATE berita SET status = ?, published_at = ? WHERE id = ?', [
      status,
      publishedAt,
      id,
    ]);

    res.json({
      success: true,
      message: `Status berita berhasil diubah menjadi "${status}".`,
      data: { id, status },
    });
  } catch (error) {
    console.error('Error toggling news status:', error);
    res.status(500).json({ error: 'Gagal mengubah status berita.' });
  }
});

// 9. PATCH /api/admin/berita/:id/feature - Pin / Unpin Headline
router.patch('/admin/:id/feature', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_featured } = req.body;

    await pool.query('UPDATE berita SET is_featured = ? WHERE id = ?', [
      is_featured ? 1 : 0,
      id,
    ]);

    res.json({
      success: true,
      message: is_featured
        ? 'Berita berhasil disematkan sebagai Berita Utama (Headline)!'
        : 'Status Berita Utama berhasil dilepas.',
      data: { id, is_featured: is_featured ? 1 : 0 },
    });
  } catch (error) {
    console.error('Error toggling news feature status:', error);
    res.status(500).json({ error: 'Gagal mengubah status headline.' });
  }
});

// 10. DELETE /api/admin/berita/:id - Hapus atau Arsipkan Berita
router.delete('/admin/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { force = 'false' } = req.query;

    if (force === 'true') {
      // Hard delete
      await pool.query('DELETE FROM berita WHERE id = ?', [id]);
      return res.json({
        success: true,
        message: 'Artikel berita berhasil dihapus permanen dari sistem.',
      });
    }

    // Soft delete: move to archived
    await pool.query("UPDATE berita SET status = 'archived' WHERE id = ?", [id]);
    res.json({
      success: true,
      message: 'Artikel berita berhasil dipindahkan ke Arsip.',
    });
  } catch (error) {
    console.error('Error deleting news article:', error);
    res.status(500).json({ error: 'Gagal menghapus artikel berita.' });
  }
});

// 11. POST /api/admin/berita/upload-image - Unggah Thumbnail Berita
router.post('/admin/upload-image', requireAdminAuth, uploadNewsImage.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada file gambar yang diunggah.' });
    }

    const publicUrl = `/uploads/berita/${req.file.filename}`;
    res.json({
      success: true,
      message: 'Gambar thumbnail berita berhasil diunggah.',
      url: publicUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Error uploading news image:', error);
    res.status(500).json({ error: 'Gagal mengunggah gambar berita.' });
  }
});

// 12. CRUD Kategori Berita (Admin)
router.post('/admin/kategori', requireAdminAuth, async (req, res) => {
  try {
    const { nama, deskripsi, warna_badge = '#2E8068' } = req.body;
    if (!nama || !nama.trim()) {
      return res.status(400).json({ error: 'Nama kategori wajib diisi.' });
    }

    const cleanNama = nama.trim();
    const slug = cleanNama.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    const [result] = await pool.query(
      'INSERT INTO kategori_berita (nama, slug, deskripsi, warna_badge) VALUES (?, ?, ?, ?)',
      [cleanNama, slug, deskripsi || null, warna_badge]
    );

    res.status(201).json({
      success: true,
      message: `Kategori "${cleanNama}" berhasil ditambahkan!`,
      data: { id: result.insertId, nama: cleanNama, slug, warna_badge },
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Kategori dengan nama tersebut sudah ada.' });
    }
    console.error('Error creating news category:', error);
    res.status(500).json({ error: 'Gagal menambah kategori berita.' });
  }
});

router.put('/admin/kategori/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, deskripsi, warna_badge } = req.body;

    await pool.query(
      'UPDATE kategori_berita SET nama = ?, deskripsi = ?, warna_badge = ? WHERE id = ?',
      [nama.trim(), deskripsi || null, warna_badge || '#2E8068', id]
    );

    res.json({ success: true, message: 'Kategori berhasil diperbarui.' });
  } catch (error) {
    console.error('Error updating news category:', error);
    res.status(500).json({ error: 'Gagal memperbarui kategori.' });
  }
});

router.delete('/admin/kategori/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM kategori_berita WHERE id = ?', [id]);
    res.json({ success: true, message: 'Kategori berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting news category:', error);
    res.status(500).json({ error: 'Gagal menghapus kategori.' });
  }
});

module.exports = router;
