import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { sendVerificationEmail } from '../utils/mailer.js';

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

// In-memory cache for pending email OTP verifications
// Key: email (lowercase) -> { code, userData, expiresAt }
export const pendingVerifications = new Map();

// POST /api/auth/signup/request-code - Validate inputs and issue 6-digit email OTP
router.post('/signup/request-code', async (req, res) => {
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

    // Duplicate check in database
    const duplicateCheck = User.checkDuplicate({ username: username.trim(), email: email.trim() });
    if (duplicateCheck.duplicate) {
      return res.status(409).json({
        success: false,
        field: duplicateCheck.field,
        message: duplicateCheck.message
      });
    }

    // Generate secure 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const cleanEmail = email.trim().toLowerCase();

    // Store in pending verification cache (expires in 10 minutes)
    pendingVerifications.set(cleanEmail, {
      code,
      userData: {
        username: username.trim(),
        email: cleanEmail,
        password,
        role: role || 'fan',
        name: name?.trim() || username.trim(),
        bio,
        category
      },
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    // Dispatch real email via nodemailer transporter
    await sendVerificationEmail({
      to: cleanEmail,
      code,
      username: username.trim()
    });

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}. Please check your email inbox.`,
      email: cleanEmail
    });
  } catch (err) {
    console.error('[Request Code Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to send verification code. Please try again.'
    });
  }
});

// POST /api/auth/signup/verify-code - Verify 6-digit OTP and complete registration
router.post('/signup/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and 6-digit verification code are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const pending = pendingVerifications.get(cleanEmail);

    if (!pending) {
      return res.status(400).json({
        success: false,
        message: 'No pending registration found for this email, or code has expired. Please sign up again.'
      });
    }

    if (Date.now() > pending.expiresAt) {
      pendingVerifications.delete(cleanEmail);
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.'
      });
    }

    if (pending.code !== code.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check your email and try again.'
      });
    }

    // Code matches! Create user in database with passwordHash
    const newUser = await User.create(pending.userData);

    // Clean up pending verification record
    pendingVerifications.delete(cleanEmail);

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Email verified successfully! Welcome to JustFans.',
      token,
      user: User.toSafeUser(newUser)
    });
  } catch (err) {
    console.error('[Verify Code Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete registration.'
    });
  }
});

// POST /api/auth/signup/resend-code - Resend a fresh 6-digit OTP
router.post('/signup/resend-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const pending = pendingVerifications.get(cleanEmail);

    if (!pending) {
      return res.status(404).json({
        success: false,
        message: 'Registration session not found. Please restart registration.'
      });
    }

    // Generate fresh code & refresh timer
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    pending.code = newCode;
    pending.expiresAt = Date.now() + 10 * 60 * 1000;

    await sendVerificationEmail({
      to: cleanEmail,
      code: newCode,
      username: pending.userData?.username || 'there'
    });

    return res.json({
      success: true,
      message: `A new 6-digit verification code was sent to ${cleanEmail}. Please check your email inbox.`
    });
  } catch (err) {
    console.error('[Resend Code Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to resend code.' });
  }
});

// POST /api/auth/signup - Direct password hashing with bcrypt + duplicate validation
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
