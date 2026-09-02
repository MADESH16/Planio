import jwt from 'jsonwebtoken';
import { pool, isPgConnected, localStore } from '../config/db.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, token missing.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'planio_super_secret_jwt_key_2026_modern_secure');

    if (isPgConnected) {
      const result = await pool.query('SELECT id, name, email, avatar_initials, color, role, created_at FROM users WHERE id = $1', [decoded.id]);
      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, message: 'User belonging to this token no longer exists.' });
      }
      req.user = result.rows[0];
    } else {
      const user = localStore.users.find((u) => u.id === decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User belonging to this token no longer exists.' });
      }
      const { password_hash, ...safeUser } = user;
      req.user = safeUser;
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
};
