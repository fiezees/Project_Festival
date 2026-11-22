const pool = require('./db');
const { hashPassword } = require('./utils/auth');

async function initDatabase() {
  try {
    // 1. Create table pendaftaran_proposal
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pendaftaran_proposal (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        nomor_registrasi VARCHAR(50) NOT NULL UNIQUE,
        nama_tim VARCHAR(150) NOT NULL,
        nama_ketua VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        telepon VARCHAR(50) NOT NULL,
        nama_file VARCHAR(255) NULL,
        file_path VARCHAR(255) NULL,
        file_size INT UNSIGNED NULL,
        catatan TEXT NULL,
        catatan_admin TEXT NULL,
        status ENUM('Menunggu', 'Ditinjau', 'Diterima', 'Ditolak') NOT NULL DEFAULT 'Menunggu',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_pendaftaran_status (status),
        INDEX idx_pendaftaran_email (email),
        INDEX idx_pendaftaran_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('[DB] Tabel pendaftaran_proposal siap.');

    // Ensure column catatan_admin exists in pendaftaran_proposal (migration check)
    try {
      await pool.query('ALTER TABLE pendaftaran_proposal ADD COLUMN catatan_admin TEXT NULL AFTER catatan');
      console.log('[DB] Kolom catatan_admin berhasil dipastikan.');
    } catch (colErr) {
      // Ignore if column already exists (ER_DUP_FIELDNAME)
    }

    // 2. Create table admin_users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        salt VARCHAR(64) NOT NULL,
        nama_lengkap VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        last_login DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('[DB] Tabel admin_users siap.');

    // 3. Seed default admin if table is empty
    const [existingAdmins] = await pool.query('SELECT id, username FROM admin_users LIMIT 1');
    if (existingAdmins.length === 0) {
      const defaultUsername = 'admin';
      const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'adminfestival2026';
      const { salt, hash } = hashPassword(defaultPassword);

      await pool.query(`
        INSERT INTO admin_users (username, password_hash, salt, nama_lengkap, role)
        VALUES (?, ?, ?, ?, ?)
      `, [defaultUsername, hash, salt, 'Admin Festival Tanam Hulu', 'admin']);

      console.log(`[DB] Akun admin awal berhasil dibuat! Username: "${defaultUsername}", Password: "${defaultPassword}"`);
    } else {
      console.log('[DB] Akun admin sudah tersedia.');
    }

    return true;
  } catch (error) {
    console.error('[DB] Gagal menginisialisasi database:', error);
    throw error;
  }
}

module.exports = initDatabase;

if (require.main === module) {
  initDatabase().then(() => {
    console.log('[DB] Inisialisasi database selesai.');
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
