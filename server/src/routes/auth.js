import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'justfans_super_secret_jwt_key_2026';
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    secret,
    { expiresIn: '7d' }
  );
};

// Helper for fallback compatibility
export const getCurrentUser = (req) => {
  if (req && req.user) return req.user;
  return User.users[0]; // fallback
};

// POST /api/auth/signup - Password hashing with bcrypt + duplicate validation
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, role, name, bio, category } = req.body;

    // Input validations
    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, message: 'Username is required.' });
    }
    if (username.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Duplicate validation
    const duplicateCheck = User.checkDuplicate({ username: username.trim(), email: email.trim() });
    if (duplicateCheck.duplicate) {
      return res.status(409).json({
        success: false,
        field: duplicateCheck.field,
        message: duplicateCheck.message
      });
    }

    // Create user with bcrypt passwordHash
    const newUser = await User.create({
      username,
      email,
      password,
      role,
      name,
      bio,
      category
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: User.toSafeUser(newUser)
    });
  } catch (err) {
    console.error('[Signup Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred during signup.'
    });
  }
});

// POST /api/auth/login - Credential validation + JWT generation
router.post('/login', async (req, res) => {
  try {
    const { emailOrUsername, email, username, password } = req.body;
    const credential = emailOrUsername || email || username;

    if (!credential || !credential.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Username or email is required to log in.'
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required.'
      });
    }

    const user = User.findByCredential(credential);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User does not exist.'
      });
    }

    const isMatch = await User.comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.'
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: User.toSafeUser(user)
    });
  } catch (err) {
    console.error('[Login Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during login authentication.'
    });
  }
});

// GET /api/auth/me - Protected route to verify active JWT and return current user
router.get('/me', requireAuth, (req, res) => {
  return res.json({
    success: true,
    user: User.toSafeUser(req.user)
  });
});

// POST /api/auth/switch-demo - Generates valid token for quick switching between test accounts
router.post('/switch-demo', (req, res) => {
  const { userId } = req.body;
  const user = User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Demo user not found.' });
  }

  const token = generateToken(user);
  return res.json({
    success: true,
    message: `Switched demo account to ${user.name} (${user.role})`,
    token,
    user: User.toSafeUser(user)
  });
});

export default router;
