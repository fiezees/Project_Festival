require('dotenv').config();
const express = require('express');
const cors = require('cors');

const wilayahRoutes = require('./routes/wilayah');
const tanamRoutes = require('./routes/tanam');
const statsRoutes = require('./routes/stats');

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'festival-pohon-api',
    endpoints: ['/api/wilayah', '/api/tanam', '/api/stats'],
  });
});

app.use('/api/wilayah', wilayahRoutes);
app.use('/api/tanam', tanamRoutes.router);
app.use('/api/stats', statsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
