require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const wilayahRoutes = require('./routes/wilayah');
const tanamRoutes = require('./routes/tanam');
const statsRoutes = require('./routes/stats');
const proposalsRoutes = require('./routes/proposals');
const adminAuthRoutes = require('./routes/auth');
const adminTeamsRoutes = require('./routes/adminTeams');
const portalTimRoutes = require('./routes/portalTim');
const initDatabase = require('./init_db');
const { performDatabaseBackup } = require('./utils/backupService');

const app = express();
const port = Number(process.env.PORT) || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  ...(process.env.FRONTEND_ORIGIN ? process.env.FRONTEND_ORIGIN.split(',').map(o => o.trim()) : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, Railway health checks)
    if (!origin) return callback(null, true);
    // Allow all vercel.app preview & production deployments
    if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically with open CORS & CORP
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  },
  express.static(path.join(__dirname, 'uploads'))
);

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'festival-pohon-api',
    endpoints: [
      '/api/wilayah',
      '/api/tanam',
      '/api/stats',
      '/api/proposals',
      '/api/admin/login',
      '/api/admin/me',
    ],
  });
});

app.use('/api/wilayah', wilayahRoutes);
app.use('/api/tanam', tanamRoutes.router);
app.use('/api/stats', statsRoutes);
app.use('/api/proposals', proposalsRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin', adminTeamsRoutes);
app.use('/api/tim', portalTimRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

// Auto initialize tables on server startup
initDatabase().catch((err) => {
  console.warn('[DB Init Warning] Auto init failed (MySQL mungkin belum siap):', err.message);
});

// Automated Daily Database Backup Scheduler
function startBackupScheduler() {
  setTimeout(async () => {
    try {
      console.log('⏰ [Scheduler] Memeriksa backup otomatis database...');
      const res = await performDatabaseBackup();
      console.log(`✅ [Scheduler] Backup database otomatis tersimpan: ${res.filename}`);
    } catch (err) {
      console.warn('⚠️ [Scheduler] Backup otomatis awal ditangguhkan:', err.message);
    }
  }, 20000);

  // Periodic daily backup (every 24 hours)
  setInterval(async () => {
    try {
      console.log('⏰ [Scheduler] Menjalankan backup otomatis 24 jam...');
      const res = await performDatabaseBackup();
      console.log(`✅ [Scheduler] Backup berkala selesai: ${res.filename}`);
    } catch (err) {
      console.warn('⚠️ [Scheduler] Gagal backup berkala:', err.message);
    }
  }, 24 * 60 * 60 * 1000);
}

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
  startBackupScheduler();
});
