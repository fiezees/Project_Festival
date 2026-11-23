const { verifyToken } = require('../utils/auth');

function requireTimAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Akses ditolak. Token otentikasi tim tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'tim') {
      return res.status(403).json({ error: 'Akses ditolak. Token bukan milik akun tim peserta.' });
    }
    req.tim = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Sesi login tim telah berakhir atau token tidak valid.' });
  }
}

module.exports = { requireTimAuth };
