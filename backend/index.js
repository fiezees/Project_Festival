require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const wilayahRoutes = require('./routes/wilayah');
const tanamRoutes = require('./routes/tanam');
const statsRoutes = require('./routes/stats');
const proposalsRoutes = require('./routes/proposals');
const adminAuthRoutes = require('./routes/auth');
const initDatabase = require('./init_db');

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

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

// Auto initialize tables on server startup
initDatabase().catch((err) => {
  console.warn('[DB Init Warning] Auto init failed (MySQL mungkin belum siap):', err.message);
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
