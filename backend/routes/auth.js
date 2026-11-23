const express = require('express');
const pool = require('../db');
const { verifyPassword, hashPassword, generateToken } = require('../utils/auth');
const { requireAdminAuth } = require('../middleware/auth');
const { performDatabaseBackup, listBackups } = require('../utils/backupService');

const router = express.Router();

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan kata sandi wajib diisi' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, username, password_hash, salt, nama_lengkap, role FROM admin_users WHERE username = ? LIMIT 1',
      [username.trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Username atau kata sandi tidak cocok' });
    }

    const admin = rows[0];
    const isMatch = verifyPassword(password, admin.salt, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Username atau kata sandi tidak cocok' });
    }

    // Update last_login
    await pool.query('UPDATE admin_users SET last_login = NOW() WHERE id = ?', [admin.id]);

    const token = generateToken({
      id: admin.id,
      username: admin.username,
      nama_lengkap: admin.nama_lengkap,
      role: admin.role,
    });

    return res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: admin.id,
        username: admin.username,
        nama_lengkap: admin.nama_lengkap,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('POST /api/admin/login failed:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan saat memproses login admin' });
  }
});

// GET /api/admin/me
router.get('/me', requireAdminAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, nama_lengkap, role, last_login, created_at FROM admin_users WHERE id = ? LIMIT 1',
      [req.admin.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Akun admin tidak ditemukan' });
    }

    res.json({ user: rows[0] });
  } catch (error) {
    console.error('GET /api/admin/me failed:', error);
    res.status(500).json({ error: 'Gagal mengambil data profil admin' });
  }
});

// POST /api/admin/backup - Trigger manual database backup
router.post('/backup', requireAdminAuth, async (req, res) => {
  try {
    const result = await performDatabaseBackup();
    res.json({
      message: 'Backup database berhasil dibuat',
      backup: {
        filename: result.filename,
        sizeBytes: result.sizeBytes,
        rowCounts: result.rowCounts,
        timestamp: result.timestamp,
      },
    });
  } catch (error) {
    console.error('Database backup failed:', error);
    res.status(500).json({ error: `Gagal membuat backup database: ${error.message}` });
  }
});

// GET /api/admin/backup/download - Download instant database backup as .sql
router.get('/backup/download', requireAdminAuth, async (req, res) => {
  try {
    const result = await performDatabaseBackup();
    res.download(result.sqlPath, result.filename, (err) => {
      if (err) {
        console.error('Error sending backup file:', err);
      }
    });
  } catch (error) {
    console.error('Database backup download failed:', error);
    res.status(500).json({ error: `Gagal mengunduh backup database: ${error.message}` });
  }
});

// GET /api/admin/backups - List all available backups
router.get('/backups', requireAdminAuth, (req, res) => {
  try {
    const backups = listBackups();
    res.json({ backups });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil riwayat backup' });
  }
});

module.exports = router;
