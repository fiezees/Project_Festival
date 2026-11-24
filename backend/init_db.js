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
      'ALTER TABLE titik_tanam MODIFY COLUMN foto_after_url VARCHAR(500) NULL',
      "ALTER TABLE titik_tanam ADD COLUMN status_verifikasi ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved' AFTER foto_after_url",
      'ALTER TABLE titik_tanam ADD COLUMN catatan_verifikasi TEXT NULL AFTER status_verifikasi',
      'ALTER TABLE titik_tanam ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER geom',
      'ALTER TABLE titik_tanam ADD COLUMN updated_at DATETIME NULL DEFAULT NULL AFTER created_at',
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

    // 5. Create table kategori_berita
    await pool.query(`
      CREATE TABLE IF NOT EXISTS kategori_berita (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        nama VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(120) NOT NULL UNIQUE,
        deskripsi TEXT NULL,
        warna_badge VARCHAR(30) NOT NULL DEFAULT '#2E8068',
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_kat_slug (slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('[DB] Tabel kategori_berita siap.');

    // Seed default categories if empty
    const [existingCategories] = await pool.query('SELECT id FROM kategori_berita LIMIT 1');
    if (existingCategories.length === 0) {
      const defaultCategories = [
        ['Persiapan', 'persiapan', 'Persiapan teknis & koordinasi lapangan penanaman', '#063F35'],
        ['Edukasi', 'edukasi', 'Wawasan ekologi hulu sungai, DAS, dan botani pohon', '#2E8068'],
        ['Pengumuman', 'pengumuman', 'Kabar resmi dan jadwal kegiatan', '#F4B91F'],
        ['Konservasi', 'konservasi', 'Aksi restorasi lereng kritis dan resapan air', '#10b981'],
        ['Inovasi', 'inovasi', 'Pemanfaatan WebGIS dan pemantauan vegetasi', '#3b82f6'],
        ['Komunitas', 'komunitas', 'Kolaborasi pemuda, pegiat lingkungan, dan warga', '#8b5cf6'],
      ];

      for (const [nama, slug, deskripsi, warna] of defaultCategories) {
        await pool.query(
          'INSERT INTO kategori_berita (nama, slug, deskripsi, warna_badge) VALUES (?, ?, ?, ?)',
          [nama, slug, deskripsi, warna]
        );
      }
      console.log('[DB] 6 Kategori berita awal berhasil di-seed.');
    }

    // 6. Create table berita
    await pool.query(`
      CREATE TABLE IF NOT EXISTS berita (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        slug VARCHAR(255) NOT NULL UNIQUE,
        judul VARCHAR(255) NOT NULL,
        ringkasan TEXT NOT NULL,
        konten LONGTEXT NOT NULL,
        gambar_url VARCHAR(500) NULL,
        kategori VARCHAR(100) NOT NULL DEFAULT 'Umum',
        penulis VARCHAR(150) NOT NULL DEFAULT 'Tim Redaksi Festival',
        waktu_baca VARCHAR(50) NOT NULL DEFAULT '3 menit',
        status ENUM('published', 'draft', 'archived') NOT NULL DEFAULT 'published',
        is_featured TINYINT(1) NOT NULL DEFAULT 0,
        views_count INT UNSIGNED NOT NULL DEFAULT 0,
        published_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        INDEX idx_berita_status (status),
        INDEX idx_berita_kategori (kategori),
        INDEX idx_berita_featured (is_featured),
        INDEX idx_berita_slug (slug),
        INDEX idx_berita_published (published_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('[DB] Tabel berita siap.');

    // Seed default articles if empty
    const [existingArticles] = await pool.query('SELECT id FROM berita LIMIT 1');
    if (existingArticles.length === 0) {
      const defaultArticles = [
        {
          slug: 'persiapan-pemetaan-60000-titik-tanam-batu-busuak-pauh-padang',
          judul: 'Persiapan Pemetaan 60.000 Titik Tanam di Pauh & Kuranji Resmi Dimulai',
          ringkasan: 'Panitia Festival Tanam Hulu mematangkan persiapan pemetaan 60.000 titik penggalian di kawasan Batu Busuak, Lambung Bukit, Gunung Nago, dan Gunung Sarik.',
          konten: `KOTA PADANG — Menjelang pembukaan Festival Tanam Hulu 2026 pada Oktober mendatang, panitia pelaksana bekerja sama dengan Dinas Lingkungan Hidup dan komunitas pemuda lokal telah memulai tahap awal validasi titik tanam.\n\nSebanyak 60.000 titik lubang tanam ditargetkan tersebar di 4 objek lokasi strategis, yaitu Batu Busuak (18.000 titik), Lambung Bukit (15.000 titik), Gunung Nago (14.000 titik), dan Gunung Sarik (13.000 titik).\n\nPenyiapan titik ini memanfaatkan teknologi geospasial WebGIS untuk memastikan penanaman tidak hanya sekadar formalitas, namun memperhatikan topografi, kesuburan tanah, serta keamanan lereng dari potensi tanah longsor.\n\n"Kami ingin memastikan setiap bibit yang ditanam memiliki koordinat yang tercatat dan umur tanam yang dapat dipantau secara berkala melalui sistem GIS," ungkap ketua pelaksana dalam rapat kooperatif.`,
          gambar_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80',
          kategori: 'Persiapan',
          penulis: 'Dr. Hafiz Faqih',
          waktu_baca: '4 menit',
          status: 'published',
          is_featured: 1,
          views_count: 342,
          published_at: '2026-09-20 10:00:00',
        },
        {
          slug: 'kerapuhan-hulu-sungai-padang-mengapa-batu-busuak-jadi-fokus',
          judul: 'Kerapuhan Hulu Sungai Padang: Mengapa Batu Busuak dan Lambung Bukit Jadi Fokus?',
          ringkasan: 'Ulasan mendalam mengenai pentingnya tutupan vegetasi kayu keras di Daerah Aliran Sungai (DAS) Pauh untuk mencegah banjir bandang Kota Padang.',
          konten: `Daerah Aliran Sungai (DAS) Pauh dan Kuranji merupakan dua benteng resapan air terpenting bagi Kota Padang. Namun, maraknya pembukaan lahan dan alih fungsi hutan di kawasan hulu seperti Batu Busuak dan Lambung Bukit menuntut perhatian ekstra.\n\nPohon-pohon spesifik seperti Surian, Mahoni, Kayu Manis, dan Bambu Betung memiliki sistem perakaran serabut dan tunggang yang sanggup mencengkeram tanah hingga kedalaman puluhan meter.\n\nDengan penanaman 60.000 bibit ini, diperkirakan tingkat retensi air hujan akan meningkat hingga 35%, mengurangi risiko debit limpasan ekstrem saat curah hujan tinggi di puncak musim penghujan.`,
          gambar_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1000&q=80',
          kategori: 'Edukasi',
          penulis: 'Dr. Fachri',
          waktu_baca: '6 menit',
          status: 'published',
          is_featured: 0,
          views_count: 215,
          published_at: '2026-09-15 08:30:00',
        },
        {
          slug: 'kolaborasi-pemuda-kuranji-dan-pauh-siapkan-pembibitan-pohon-endemik',
          judul: 'Kolaborasi Pemuda Kuranji dan Pauh Siapkan Pembibitan Pohon Endemik',
          ringkasan: 'Ratusan pemuda dari Gunung Nago dan Gunung Sarik bahu membahu menyiapkan rumah bibit swadaya untuk menyuplai bibit unggul berkualitas.',
          konten: `Semangat gotong royong tampak menggelora di Kecamatan Pauh dan Kuranji. Pemuda karang taruna setempat telah mendirikan 4 titik persemaian bibit swadaya yang menampung jenis tanaman produktif dan kayu hutan.\n\nBibit buah seperti Durian Unggul, Alpukat, Manggis, dan Matoa dipilih agar selain berfungsi menjaga daya serap air, juga memberikan manfaat ekonomi berjangka bagi warga di masa mendatang.`,
          gambar_url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1000&q=80',
          kategori: 'Konservasi',
          penulis: 'Dr. Fachri',
          waktu_baca: '5 menit',
          status: 'published',
          is_featured: 0,
          views_count: 178,
          published_at: '2026-09-02 09:00:00',
        },
      ];

      for (const a of defaultArticles) {
        await pool.query(`
          INSERT INTO berita (slug, judul, ringkasan, konten, gambar_url, kategori, penulis, waktu_baca, status, is_featured, views_count, published_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          a.slug, a.judul, a.ringkasan, a.konten, a.gambar_url,
          a.kategori, a.penulis, a.waktu_baca, a.status, a.is_featured,
          a.views_count, a.published_at,
        ]);
      }
      console.log('[DB] 3 Artikel berita awal berhasil di-seed.');
    }

    await pool.query(
      "UPDATE berita SET status = 'archived' WHERE slug = ?",
      ['total-hadiah-100-juta-siap-diperebutkan-komunitas-hijau-sekolah']
    );

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
