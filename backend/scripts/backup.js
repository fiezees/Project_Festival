#!/usr/bin/env node
require('dotenv').config();
const { performDatabaseBackup } = require('../utils/backupService');

async function run() {
  console.log('🔄 Memulai proses backup database Festival Tanam Hulu 2026...');
  const start = Date.now();
  try {
    const result = await performDatabaseBackup();
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log('✅ Backup database BERHASIL!');
    console.log(`📁 File SQL  : ${result.sqlPath}`);
    console.log(`📁 File JSON : ${result.jsonPath}`);
    console.log(`📊 Ukuran    : ${(result.sizeBytes / 1024).toFixed(2)} KB`);
    console.log(`⏱️ Waktu     : ${duration} detik`);
    console.log('📋 Ringkasan Baris per Tabel:');
    Object.entries(result.rowCounts).forEach(([table, count]) => {
      console.log(`   - ${table.padEnd(16)}: ${count} baris`);
    });
    process.exit(0);
  } catch (err) {
    const msg = err.message || err.code || String(err);
    console.error('❌ Gagal melakukan backup database:', msg);
    if (err.code === 'ECONNREFUSED' || err.code === 'EACCES') {
      console.error('💡 Catatan: Pastikan service MySQL/XAMPP sedang aktif dan port 3306 dapat diakses.');
    }
    process.exit(1);
  }
}

run();
