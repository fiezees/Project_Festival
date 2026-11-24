const express = require('express');
const pool = require('../db');
const { hashPassword } = require('../utils/auth');
const { requireAdminAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * Helper to generate a random friendly password like Tanam#7291
 */
function generateRandomPassword() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `Tanam#${num}`;
}

// =========================================================================
// 1. POST /api/admin/teams/generate-account - Buat / Reset Akun Tim Peserta
// =========================================================================
router.post('/teams/generate-account', requireAdminAuth, async (req, res) => {
  const { proposal_id, target_pohon = 10, custom_password } = req.body;

  if (!proposal_id) {
    return res.status(400).json({ error: 'proposal_id wajib disertakan.' });
  }

  try {
    // 1. Check proposal
    const [propRows] = await pool.query(
      'SELECT id, nomor_registrasi, nama_tim, nama_ketua, email, telepon, status FROM pendaftaran_proposal WHERE id = ? LIMIT 1',
      [proposal_id]
    );

    if (propRows.length === 0) {
      return res.status(404).json({ error: 'Proposal pendaftar tidak ditemukan.' });
    }

    const proposal = propRows[0];

    // Optional recommendation: can be generated for any or only accepted proposal
    // Clean username from registration number e.g. "FTH2026-REG-1857" -> "reg1857" or lowercase
    const username = proposal.nomor_registrasi
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    const plainPassword = custom_password && custom_password.trim().length >= 6
      ? custom_password.trim()
      : generateRandomPassword();

    const { salt, hash } = hashPassword(plainPassword);

    // 2. Check if team account already exists
    const [existing] = await pool.query(
      'SELECT id FROM tim_users WHERE proposal_id = ? LIMIT 1',
      [proposal.id]
    );

    let teamId;
    if (existing.length > 0) {
      // Update password & username
      teamId = existing[0].id;
      await pool.query(`
        UPDATE tim_users 
        SET username = ?, password_hash = ?, salt = ?, target_pohon = ?, updated_at = NOW()
        WHERE id = ?
      `, [username, hash, salt, parseInt(target_pohon, 10) || 10, teamId]);
    } else {
      // Insert new team user
      const [insertRes] = await pool.query(`
        INSERT INTO tim_users (
          proposal_id, username, password_hash, salt, nama_tim, nama_ketua, telepon, target_pohon
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        proposal.id,
        username,
        hash,
        salt,
        proposal.nama_tim,
        proposal.nama_ketua,
        proposal.telepon,
        parseInt(target_pohon, 10) || 10,
      ]);
      teamId = insertRes.insertId;
    }

    // Format WhatsApp link for convenient one-click sharing
    let cleanedPhone = String(proposal.telepon).replace(/[^0-9]/g, '');
    if (cleanedPhone.startsWith('0')) cleanedPhone = '62' + cleanedPhone.slice(1);
    else if (cleanedPhone.startsWith('8')) cleanedPhone = '62' + cleanedPhone;

    let originHeader = req.headers.origin;
    if (!originHeader && req.headers.referer) {
      try {
        originHeader = new URL(req.headers.referer).origin;
      } catch (e) {
        originHeader = '';
      }
    }
    const portalUrl = originHeader ? `${originHeader}/#tim` : 'Website Festival Tanam Hulu (Menu Portal Tim / #tim)';

    const waMessage = 
      `*SELAMAT! TIM ANDA RESMI TERPILIH* 🌿✨\n` +
      `*Festival Tanam Hulu 2026 — Yayasan Galapagos*\n\n` +
      `Halo Kak *${proposal.nama_ketua}* & kawan-kawan dari Tim *${proposal.nama_tim}*! 👋🍃\n\n` +
      `Kabar gembira! Dari sekian banyak ide dan gagasan hebat yang masuk, proposal tim kalian *RESMI TERPILIH* menjadi salah satu dari 10 Tim Aksi Penanaman Pohon di Hulu Sungai Kota Padang! Keren banget, selamat yaa! 🎉🌳\n\n` +
      `Untuk persiapan aksi di lapangan, panitia sudah mengaktifkan akun khusus tim kalian ke *Portal WebGIS Titik Tanam*:\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🌱 *KREDENSIAL PORTAL TIM*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `• *Link Portal :* ${portalUrl}\n` +
      `• *Username   :* *${username}*\n` +
      `• *Kata Sandi :* *${plainPassword}*\n` +
      `• *Target Aksi:* *${target_pohon} Titik Pohon*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n\n` +
      `📲 *Langkah Praktis saat Hari-H Aksi di Lapangan:*\n` +
      `1. Buka link portal di atas lewat browser HP kalian.\n` +
      `2. Masuk menggunakan username & sandi tim.\n` +
      `3. Di lokasi penanaman, klik tombol *'Ambil Lokasi Saya'* (GPS langsung terkunci akurat).\n` +
      `4. Ambil foto *Before* (kondisi saat pertama ditanam). Foto *After* (perkembangan setelah ±6 bulan) bersifat opsional saat awal dan dapat disusulkan melalui fitur *Edit* dengan kode titik yang sama.\n` +
      `5. Tekan *Kirim*, dan pohon kalian otomatis masuk antrean verifikasi WebGIS!\n\n` +
      `Mohon simpan pesan ini dan bagikan ke kawan-kawan satu tim yaa. Jika ada kendala teknis, tim panitia siap mendampingi teman-teman di lapangan.\n\n` +
      `Mari bersama kita hijaukan kembali hulu sungai kita! Salam lestari! 💚🌿\n\n` +
      `Salam hangat,\n` +
      `*Panitia Festival Tanam Hulu 2026*\n` +
      `*Yayasan Galapagos Padang*`;

    const waLink = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(waMessage)}`;

    res.json({
      message: 'Akun tim penanam berhasil dibuat / diperbarui.',
      team: {
        id: teamId,
        proposal_id: proposal.id,
        nama_tim: proposal.nama_tim,
        nama_ketua: proposal.nama_ketua,
        telepon: proposal.telepon,
        username,
        plainPassword,
        target_pohon: parseInt(target_pohon, 10) || 10,
        waLink,
        waMessage,
      },
    });
  } catch (error) {
    console.error('POST /api/admin/teams/generate-account error:', error);
    res.status(500).json({ error: `Gagal membuat akun tim: ${error.message}` });
  }
});

// =========================================================================
// 2. GET /api/admin/teams - Daftar Semua Akun Tim & Progres Penanamannya
// =========================================================================
router.get('/teams', requireAdminAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.id, u.proposal_id, u.username, u.nama_tim, u.nama_ketua, u.telepon,
        u.target_pohon, u.is_active, u.last_login, u.created_at,
        p.nomor_registrasi, p.status AS proposal_status,
        COUNT(t.id) AS total_planted,
        SUM(CASE WHEN t.status_verifikasi = 'approved' THEN 1 ELSE 0 END) AS total_approved,
        SUM(CASE WHEN t.status_verifikasi = 'pending' THEN 1 ELSE 0 END) AS total_pending
      FROM tim_users u
      JOIN pendaftaran_proposal p ON u.proposal_id = p.id
      LEFT JOIN titik_tanam t ON u.id = t.tim_id
      GROUP BY u.id
      ORDER BY u.id DESC
    `);

    res.json({ data: rows });
  } catch (error) {
    console.error('GET /api/admin/teams error:', error);
    res.status(500).json({ error: 'Gagal mengambil daftar akun tim.' });
  }
});

// =========================================================================
// 3. GET /api/admin/titik-tanam - Daftar Titik Tanam & Kurasi Panitia
// =========================================================================
router.get('/titik-tanam', requireAdminAuth, async (req, res) => {
  const status = req.query.status; // 'pending' | 'approved' | 'rejected' | all
  try {
    let whereClause = '';
    const params = [];
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      whereClause = 'WHERE t.status_verifikasi = ?';
      params.push(status);
    }

    const [rows] = await pool.query(`
      SELECT 
        t.id, t.tim_id, t.nama_peserta, t.lokasi_id, t.lokasi_nama, t.jenis_pohon,
        t.umur_tanam_bulan, t.jangka_hidup_tahun, t.foto_before_url, t.foto_after_url,
        t.status_verifikasi, t.catatan_verifikasi, t.created_at, t.updated_at,
        ST_X(t.geom) AS longitude,
        ST_Y(t.geom) AS latitude,
        u.nama_tim, u.telepon, u.nama_ketua
      FROM titik_tanam t
      LEFT JOIN tim_users u ON t.tim_id = u.id
      ${whereClause}
      ORDER BY COALESCE(t.updated_at, t.created_at) DESC, t.id DESC
    `, params);

    res.json({ data: rows });
  } catch (error) {
    console.error('GET /api/admin/titik-tanam error:', error);
    res.status(500).json({ error: 'Gagal memuat titik penanaman.' });
  }
});

// =========================================================================
// 4. PATCH /api/admin/titik-tanam/:id/verify - Verifikasi Titik Tanam
// =========================================================================
router.patch('/titik-tanam/:id/verify', requireAdminAuth, async (req, res) => {
  const pointId = req.params.id;
  const { status_verifikasi, catatan_verifikasi } = req.body;

  if (!['approved', 'rejected', 'pending'].includes(status_verifikasi)) {
    return res.status(400).json({ error: 'Status verifikasi harus "approved", "rejected", atau "pending".' });
  }

  try {
    const [pointCheck] = await pool.query(
      'SELECT id, tim_id, nama_peserta FROM titik_tanam WHERE id = ? LIMIT 1',
      [pointId]
    );

    if (pointCheck.length === 0) {
      return res.status(404).json({ error: 'Titik penanaman tidak ditemukan.' });
    }

    await pool.query(`
      UPDATE titik_tanam 
      SET status_verifikasi = ?, catatan_verifikasi = ?
      WHERE id = ?
    `, [status_verifikasi, catatan_verifikasi || null, pointId]);

    res.json({
      message: `Titik penanaman berhasil diubah menjadi "${status_verifikasi}".`,
      id: pointId,
      status_verifikasi,
      catatan_verifikasi: catatan_verifikasi || null,
    });
  } catch (error) {
    console.error('PATCH /api/admin/titik-tanam/:id/verify error:', error);
    res.status(500).json({ error: 'Gagal memperbarui status verifikasi titik tanam.' });
  }
});

module.exports = router;
