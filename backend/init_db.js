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

    // 2. Create table tim_users (Akun khusus 10 tim penanam terpilih)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tim_users (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        proposal_id INT UNSIGNED NOT NULL UNIQUE,
        username VARCHAR(60) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        salt VARCHAR(64) NOT NULL,
        nama_tim VARCHAR(150) NOT NULL,
        nama_ketua VARCHAR(150) NOT NULL,
        telepon VARCHAR(50) NOT NULL,
        target_pohon SMALLINT UNSIGNED NOT NULL DEFAULT 10,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        last_login DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_tim_proposal (proposal_id),
        INDEX idx_tim_username (username)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('[DB] Tabel tim_users siap.');

    // 3. Ensure columns on titik_tanam for team associations and verification
    const alterTitikQueries = [
      'ALTER TABLE titik_tanam ADD COLUMN tim_id INT UNSIGNED NULL AFTER id',
      "ALTER TABLE titik_tanam ADD COLUMN status_verifikasi ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved' AFTER foto_after_url",
      'ALTER TABLE titik_tanam ADD COLUMN catatan_verifikasi TEXT NULL AFTER status_verifikasi',
      'ALTER TABLE titik_tanam ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER geom',
    ];

    for (const q of alterTitikQueries) {
      try {
        await pool.query(q);
      } catch (err) {
        // Ignore column already exists
      }
    }
    console.log('[DB] Kolom verifikasi & tim pada titik_tanam dipastikan.');

    // 4. Create table admin_users
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
