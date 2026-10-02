const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, nama_wilayah, kecamatan, luas_ha, ST_AsGeoJSON(geom) AS geom_json
      FROM batas_wilayah
      ORDER BY id
    `);

    const features = rows.map((row) => ({
      type: 'Feature',
      geometry: JSON.parse(row.geom_json),
      properties: {
        id: row.id,
        nama_wilayah: row.nama_wilayah,
        kecamatan: row.kecamatan,
        luas_ha: row.luas_ha,
      },
    }));

    res.json({ type: 'FeatureCollection', features });
  } catch (error) {
    console.error('GET /api/wilayah failed:', error);
    res.status(500).json({ error: 'Gagal mengambil data wilayah' });
  }
});

module.exports = router;
