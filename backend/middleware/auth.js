const { verifyToken } = require('../utils/auth');

function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Akses ditolak: Token autentikasi tidak ditemukan' });
  }

  const token = authHeader.split(' ')[1];
  const admin = verifyToken(token);

  if (!admin) {
    return res.status(401).json({ error: 'Akses ditolak: Token tidak valid atau sudah kedaluwarsa' });
  }

  req.admin = admin;
  next();
}

module.exports = { requireAdminAuth };
