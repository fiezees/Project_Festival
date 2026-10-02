CREATE DATABASE IF NOT EXISTS festival_pohon_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE festival_pohon_db;

DROP TABLE IF EXISTS titik_tanam;
DROP TABLE IF EXISTS batas_wilayah;

CREATE TABLE batas_wilayah (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nama_wilayah VARCHAR(120) NOT NULL,
  kecamatan VARCHAR(80) NOT NULL,
  luas_ha DECIMAL(10, 2) NOT NULL,
  geom POLYGON NOT NULL,
  PRIMARY KEY (id),
  SPATIAL INDEX idx_batas_wilayah_geom (geom)
) ENGINE=InnoDB;

CREATE TABLE titik_tanam (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nama_peserta VARCHAR(120) NOT NULL,
  lokasi_id VARCHAR(40) NOT NULL,
  lokasi_nama VARCHAR(120) NOT NULL,
  jenis_pohon ENUM('A', 'B', 'C') NOT NULL,
  umur_tanam_bulan SMALLINT UNSIGNED NOT NULL,
  jangka_hidup_tahun SMALLINT UNSIGNED NOT NULL,
  foto_before_url VARCHAR(500) NOT NULL,
  foto_after_url VARCHAR(500) NOT NULL,
  geom POINT NOT NULL,
  PRIMARY KEY (id),
  SPATIAL INDEX idx_titik_tanam_geom (geom),
  INDEX idx_titik_tanam_jenis (jenis_pohon),
  INDEX idx_titik_tanam_lokasi (lokasi_id)
) ENGINE=InnoDB;

INSERT INTO batas_wilayah (nama_wilayah, kecamatan, luas_ha, geom) VALUES
('Batu Busuak', 'Pauh', 6.80,
 ST_GeomFromText('POLYGON((100.4480 -0.9140, 100.4580 -0.9140, 100.4580 -0.9030, 100.4480 -0.9030, 100.4480 -0.9140))')),
('Lambung Bukit', 'Pauh', 6.20,
 ST_GeomFromText('POLYGON((100.4360 -0.9220, 100.4460 -0.9220, 100.4460 -0.9120, 100.4360 -0.9120, 100.4360 -0.9220))')),
('Gunung Nago', 'Pauh', 5.90,
 ST_GeomFromText('POLYGON((100.4270 -0.9310, 100.4370 -0.9310, 100.4370 -0.9200, 100.4270 -0.9200, 100.4270 -0.9310))')),
('Gunung Sarik', 'Kuranji', 5.60,
 ST_GeomFromText('POLYGON((100.4130 -0.8930, 100.4230 -0.8930, 100.4230 -0.8820, 100.4130 -0.8820, 100.4130 -0.8930))'));

DELIMITER //
CREATE PROCEDURE seed_titik_tanam()
BEGIN
  DECLARE nomor INT DEFAULT 1;
  WHILE nomor <= 100 DO
    INSERT INTO titik_tanam
      (nama_peserta, lokasi_id, lokasi_nama, jenis_pohon, umur_tanam_bulan,
      jangka_hidup_tahun, foto_before_url, foto_after_url, geom)
    VALUES
      (
        ELT(1 + MOD(nomor - 1, 4),
          'Komunitas Sungai Lestari',
          'Pemuda Hijau Pauh',
          'Sekolah Adiwiyata Padang',
          'Relawan Kuranji'
        ),
        ELT(1 + MOD(nomor - 1, 4), 'batu-busuak', 'lambung-bukit', 'gunung-nago', 'gunung-sarik'),
        ELT(1 + MOD(nomor - 1, 4), 'Batu Busuak', 'Lambung Bukit', 'Gunung Nago', 'Gunung Sarik'),
        ELT(1 + MOD(nomor - 1, 3), 'A', 'B', 'C'),
        1 + MOD(nomor * 7, 24),
        ELT(1 + MOD(nomor - 1, 3), 40, 60, 50),
        ELT(1 + MOD(nomor - 1, 4),
          'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1511497584788-876761465586?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80'
        ),
        ELT(1 + MOD(nomor, 4),
          'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1511497584788-876761465586?auto=format&fit=crop&w=800&q=80'
        ),
        ST_GeomFromText(CONCAT(
          'POINT(',
          CAST(CASE MOD(nomor - 1, 4)
            WHEN 0 THEN 100.4532 + MOD(nomor * 37, 30) / 10000
            WHEN 1 THEN 100.4410 + MOD(nomor * 37, 30) / 10000
            WHEN 2 THEN 100.4321 + MOD(nomor * 37, 30) / 10000
            ELSE 100.4180 + MOD(nomor * 37, 30) / 10000
          END AS DECIMAL(10, 6)),
          ' ',
          CAST(CASE MOD(nomor - 1, 4)
            WHEN 0 THEN -0.9085 + MOD(nomor * 53, 30) / 10000
            WHEN 1 THEN -0.9168 + MOD(nomor * 53, 30) / 10000
            WHEN 2 THEN -0.9254 + MOD(nomor * 53, 30) / 10000
            ELSE -0.8872 + MOD(nomor * 53, 30) / 10000
          END AS DECIMAL(10, 6)),
          ')'
        ))
      );
    SET nomor = nomor + 1;
  END WHILE;
END//
DELIMITER ;

CALL seed_titik_tanam();
DROP PROCEDURE seed_titik_tanam;
