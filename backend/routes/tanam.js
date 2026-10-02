const express = require('express');
const pool = require('../db');

const router = express.Router();
const VALID_CLASSES = ['A', 'B', 'C'];

router.get('/', async (req, res) => {
  const species = typeof req.query.jenis === 'string' ? req.query.jenis.trim() : '';

  if (species && !VALID_CLASSES.includes(species)) {
    return res.status(400).json({
      error: 'Jenis pohon tidak valid',
      valid: VALID_CLASSES,
    });
  }

  try {
    const where = species ? 'WHERE jenis_pohon = ?' : '';
    const params = species ? [species] : [];
    const [rows] = await pool.query(`
                  SELECT id, nama_peserta, lokasi_id, lokasi_nama, jenis_pohon,
                    umur_tanam_bulan, jangka_hidup_tahun, foto_before_url,
                    foto_after_url,
              ST_AsGeoJSON(geom) AS geom_json
      FROM titik_tanam
      ${where}
      ORDER BY id
    `, params);

    const features = rows.map((row) => ({
      type: 'Feature',
      geometry: JSON.parse(row.geom_json),
      properties: {
        id: row.id,
        nama_peserta: row.nama_peserta,
        lokasi_id: row.lokasi_id,
        lokasi_nama: row.lokasi_nama,
        jenis_pohon: row.jenis_pohon,
        umur_tanam_bulan: row.umur_tanam_bulan,
        jangka_hidup_tahun: row.jangka_hidup_tahun,
        foto_before_url: row.foto_before_url,
        foto_after_url: row.foto_after_url,
      },
    }));

    res.json({ type: 'FeatureCollection', features });
  } catch (error) {
    console.error('GET /api/tanam failed:', error);
    res.status(500).json({ error: 'Gagal mengambil data titik tanam' });
  }
});

module.exports = { router, VALID_CLASSES };
