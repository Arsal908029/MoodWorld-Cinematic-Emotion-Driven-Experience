// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jwt-simple');
const crypto = require('crypto');
const User = require('../models/User');
const { isEmailConfigured, sendOtpEmail } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'moodworld_secret_key_2026';

// Password hashing with PBKDF2 (SHA-512)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash) return false;
  // Backward compatibility with legacy plain text passwords
  if (!storedHash.includes(':')) {
    return password === storedHash;
  }
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

// Helper to decode auth header
function getUserIdFromReq(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/, '');
  try {
    const decoded = jwt.decode(token, JWT_SECRET);
    return decoded.id;
  } catch (e) {
    return null;
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_TTL_MS = 15 * 60 * 1000;

function createOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

// 1. Register User (Signup)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, acceptedTerms } = req.body;

    if (!isEmailConfigured()) {
      return res.status(503).json({ success: false, error: 'Email delivery is not configured on the server.' });
    }

    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered. Please log in.' });
    }

    const hashedPassword = hashPassword(password);
    const verificationCode = createOtp();

    const newUser = await User.create({
      name: name?.trim() || 'Explorer',
      email: normalizedEmail,
      password: hashedPassword,
      currentMood: 'Calm',
      streak: 1,
      lastCheckIn: new Date(),
      acceptedTermsAt: acceptedTerms ? new Date() : new Date(),
      isEmailVerified: false,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: new Date(Date.now() + OTP_TTL_MS),
      settings: {
        autoChangeWorld: true,
        sound: true,
        notifications: true,
      },
    });

    try {
      await sendOtpEmail({ to: normalizedEmail, code: verificationCode, purpose: 'verify' });
    } catch (emailError) {
      await User.deleteOne({ _id: newUser._id });
      console.error('Signup email delivery failed:', emailError.message);
      return res.status(502).json({ success: false, error: 'We could not send your verification email. Please try again.' });
    }

    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.emailVerificationCode;
    delete userResponse.emailVerificationExpires;

    res.status(201).json({ 
      success: true, 
      requiresVerification: true, 
      user: userResponse,
      message: `Account created. Verification code sent to ${normalizedEmail}.`
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, error: err.message || 'Server error during signup.' });
  }
});

// 2. Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ success: false, error: 'No account found with this email. Please sign up.' });
    }

    const isMatch = verifyPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });
    }

    const token = jwt.encode({ id: user._id, iat: Date.now() }, JWT_SECRET);
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ success: true, token, user: userResponse });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: err.message || 'Server error during login.' });
  }
});

// 3. Verify Token & Get Current User
router.get('/me', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required. No valid token provided.' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User session not found.' });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Server error verifying session.' });
  }
});

// 4. Update Settings / Preferences
router.patch('/settings', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const { settings } = req.body;
    const settingUpdates = Object.fromEntries(
      Object.entries(settings || {}).map(([key, value]) => [`settings.${key}`, value])
    );
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: settingUpdates },
      { new: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Server error updating settings.' });
  }
});

// 5. Send Email Verification Code (Accepts Bearer token or email body)
router.post('/send-verification-email', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!isEmailConfigured()) {
      return res.status(503).json({ success: false, error: 'Email delivery is not configured on the server.' });
    }
    let userId = getUserIdFromReq(req);
    let user;

    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // Generate 6-digit code
    const verificationCode = createOtp();
    user.emailVerificationCode = verificationCode;
    user.emailVerificationExpires = new Date(Date.now() + OTP_TTL_MS);
    await user.save();

    try {
      await sendOtpEmail({ to: user.email, code: verificationCode, purpose: 'verify' });
    } catch (emailError) {
      user.emailVerificationCode = null;
      user.emailVerificationExpires = null;
      await user.save();
      console.error('Verification email delivery failed:', emailError.message);
      return res.status(502).json({ success: false, error: 'We could not send your verification email. Please try again.' });
    }

    res.json({ 
      success: true, 
      message: `Verification code sent to ${user.email}.`
    });
  } catch (err) {
    console.error('Send verification error:', err);
    res.status(500).json({ success: false, error: 'Failed to send verification code.' });
  }
});

// 6. Verify Email Code (Accepts Bearer token or email body)
router.post('/verify-email', async (req, res) => {
  try {
    const { code, email } = req.body || {};
    let userId = getUserIdFromReq(req);
    let user;

    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (!code) {
      return res.status(400).json({ success: false, error: 'Verification code is required.' });
    }

    if (
      !user.emailVerificationCode ||
      user.emailVerificationCode !== code.trim() ||
      !user.emailVerificationExpires ||
      user.emailVerificationExpires <= new Date()
    ) {
      return res.status(400).json({ success: false, error: 'Invalid verification code. Please check your email.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;
    await user.save();

    const token = jwt.encode({ id: user._id, iat: Date.now() }, JWT_SECRET);
    const userObj = user.toObject();
    delete userObj.password;

    res.json({ 
      success: true, 
      token,
      message: 'Email successfully verified!',
      user: userObj 
    });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ success: false, error: 'Failed to verify email.' });
  }
});

// 7. Request Password Reset (Forgot Password)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!isEmailConfigured()) {
      return res.status(503).json({ success: false, error: 'Email delivery is not configured on the server.' });
    }
    if (!email || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, error: 'No account registered with this email address.' });
    }

    // 6-digit reset code, expires in 15 minutes
    const resetCode = createOtp();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = new Date(Date.now() + OTP_TTL_MS);
    await user.save();

    try {
      await sendOtpEmail({ to: normalizedEmail, code: resetCode, purpose: 'reset' });
    } catch (emailError) {
      user.resetPasswordCode = null;
      user.resetPasswordExpires = null;
      await user.save();
      console.error('Password reset email delivery failed:', emailError.message);
      return res.status(502).json({ success: false, error: 'We could not send your password reset email. Please try again.' });
    }

    res.json({ 
      success: true, 
      message: `Password reset code sent to ${normalizedEmail}.`
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, error: 'Failed to process forgot password request.' });
  }
});

// 8. Verify Reset Code
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, error: 'Email and reset code are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ 
      email: normalizedEmail,
      resetPasswordCode: code.trim(),
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset code.' });
    }

    res.json({ success: true, message: 'Reset code verified successfully.' });
  } catch (err) {
    console.error('Verify reset code error:', err);
    res.status(500).json({ success: false, error: 'Failed to verify reset code.' });
  }
});

// 9. Reset Password with Code
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email, code, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ 
      email: normalizedEmail,
      resetPasswordCode: code.trim(),
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset code.' });
    }

    user.password = hashPassword(newPassword);
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, error: 'Failed to reset password.' });
  }
});

module.exports = router;