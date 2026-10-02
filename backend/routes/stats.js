const express = require('express');
const pool = require('../db');
const { VALID_CLASSES } = require('./tanam');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM titik_tanam) AS total,
        (SELECT COALESCE(SUM(luas_ha), 0) FROM batas_wilayah) AS luas_ha,
        ${VALID_CLASSES.map((treeClass) =>
          `(SELECT COUNT(*) FROM titik_tanam WHERE jenis_pohon = ${pool.escape(treeClass)}) AS \`${treeClass}\``
        ).join(',\n        ')}
    `);

    const row = rows[0];
    const perJenis = Object.fromEntries(
      VALID_CLASSES.map((treeClass) => [treeClass, Number(row[treeClass])])
    );

    res.json({
      total: Number(row.total),
      luas_ha: Number(row.luas_ha),
      per_jenis: perJenis,
    });
  } catch (error) {
    console.error('GET /api/stats failed:', error);
    res.status(500).json({ error: 'Gagal mengambil statistik' });
  }
});

module.exports = router;
