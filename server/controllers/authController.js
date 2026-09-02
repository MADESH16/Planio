import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool, isPgConnected, localStore, saveStore } from '../config/db.js';

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'planio_super_secret_jwt_key_2026_modern_secure',
    { expiresIn: '30d' }
  );
};

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const AVATAR_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];

/**
 * @route POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'Developer' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const initials = getInitials(name);
    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    if (isPgConnected) {
      // Check existing user
      const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, avatar_initials, color, role)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, email, avatar_initials, color, role, created_at`,
        [name, normalizedEmail, passwordHash, initials, randomColor, role]
      );

      const user = result.rows[0];
      const token = generateToken(user.id);

      return res.status(201).json({
        success: true,
        token,
        user,
      });
    } else {
      // Local store fallback
      const existing = localStore.users.find((u) => u.email === normalizedEmail);
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      const newUser = {
        id: Date.now(),
        name,
        email: normalizedEmail,
        password_hash: passwordHash,
        avatar_initials: initials,
        color: randomColor,
        role,
        created_at: new Date().toISOString(),
      };

      localStore.users.push(newUser);
      saveStore();

      const { password_hash, ...safeUser } = newUser;
      const token = generateToken(newUser.id);

      return res.status(201).json({
        success: true,
        token,
        user: safeUser,
      });
    }
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration', error: err.message });
  }
};

/**
 * @route POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isPgConnected) {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const { password_hash, ...safeUser } = user;
      const token = generateToken(user.id);

      return res.json({
        success: true,
        token,
        user: safeUser,
      });
    } else {
      const user = localStore.users.find((u) => u.email === normalizedEmail);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const { password_hash, ...safeUser } = user;
      const token = generateToken(user.id);

      return res.json({
        success: true,
        token,
        user: safeUser,
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login', error: err.message });
  }
};

/**
 * @route GET /api/auth/me
 */
export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

/**
 * @route GET /api/auth/users
 */
export const getUsers = async (req, res) => {
  try {
    if (isPgConnected) {
      const result = await pool.query('SELECT id, name, email, avatar_initials, color, role FROM users ORDER BY id ASC');
      return res.json({ success: true, users: result.rows });
    } else {
      const safeUsers = localStore.users.map(({ password_hash, ...rest }) => rest);
      return res.json({ success: true, users: safeUsers });
    }
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve users' });
  }
};
