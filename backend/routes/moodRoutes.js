// backend/routes/moodRoutes.js
const express = require('express');
const router = express.Router();
const MoodEntry = require('../models/MoodEntry');
const User = require('../models/User');
const { generateWorldFromMood } = require('../services/worldGenerator');
const jwt = require('jwt-simple');

const JWT_SECRET = process.env.JWT_SECRET || 'moodworld_secret_key_2026';

function getAchievementList(user, history = []) {
  const achievements = [];

  if ((history.length || 0) >= 1) {
    achievements.push({
      id: 'first-check-in',
      title: 'First Sky',
      badge: '🌤️',
      description: 'Complete your first mood check-in.',
      unlockedAt: new Date(),
    });
  }

  const calmCount = history.filter((entry) => entry.emotion === 'Calm').length;
  if (calmCount >= 3) {
    achievements.push({
      id: 'steady-breather',
      title: 'Steady Breather',
      badge: '🫁',
      description: 'Log 3 calm check-ins in a row.',
      unlockedAt: new Date(),
    });
  }

  if ((user?.streak || 0) >= 7) {
    achievements.push({
      id: 'seven-day-sky',
      title: '7-Day Sky',
      badge: '🔥',
      description: 'Build a 7-day streak.',
      unlockedAt: new Date(),
    });
  }

  const happyPeak = history.some((entry) => entry.emotion === 'Happy' && entry.intensity >= 8);
  if (happyPeak) {
    achievements.push({
      id: 'bright-morning',
      title: 'Bright Morning',
      badge: '☀️',
      description: 'Log a happy mood at intensity 8 or higher.',
      unlockedAt: new Date(),
    });
  }

  return achievements;
}

function getUserIdFromReq(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  try {
    const token = authHeader.replace(/^Bearer\s+/, '');
    return jwt.decode(token, JWT_SECRET).id;
  } catch (error) {
    return null;
  }
}

// 1. POST: Create Mood Entry & Compute World State (Real-Time Synchronous)
router.post('/checkin', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const { emotion, intensity, triggers } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!emotion || !intensity) {
      return res.status(400).json({ success: false, message: 'Missing required parameters: emotion, intensity' });
    }

    // Compute procedural world configuration
    const computedWorld = generateWorldFromMood(emotion, intensity);

    const newEntry = new MoodEntry({
      userId,
      emotion,
      intensity,
      triggers: triggers || [],
      worldState: computedWorld,
    });

    const savedEntry = await newEntry.save();

    // Calculate Streak & Update User
    const user = await User.findById(userId);
    let streak = user ? (user.streak || 0) : 0;
    const now = new Date();

    if (user && user.lastCheckIn) {
      const hoursSinceLast = Math.abs(now - new Date(user.lastCheckIn)) / 36e5;
      if (hoursSinceLast >= 20 && hoursSinceLast <= 48) {
        streak += 1;
      } else if (hoursSinceLast > 48) {
        streak = 1;
      }
    } else {
      streak = 1;
    }

    const userHistory = await MoodEntry.find({ userId }).sort({ createdAt: -1 }).limit(30);
    const achievements = getAchievementList(user ? { ...user.toObject(), streak } : { streak }, userHistory);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        currentMood: emotion,
        streak,
        lastCheckIn: now,
        achievements,
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      entry: savedEntry,
      streak,
      worldState: computedWorld,
      achievements,
      user: updatedUser,
    });
  } catch (err) {
    console.error('CheckIn error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. GET: Fetch Latest Mood Entry & World for a User
router.get('/latest/:userId', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId || userId !== req.params.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    const latest = await MoodEntry.findOne({ userId }).sort({ createdAt: -1 });
    if (!latest) {
      return res.status(200).json({
        success: true,
        entry: null,
        worldState: generateWorldFromMood('Calm', 5),
      });
    }

    res.status(200).json({
      success: true,
      entry: latest,
      worldState: latest.worldState || generateWorldFromMood(latest.emotion, latest.intensity),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. GET: Fetch Mood History for User
router.get('/history/:userId', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId || userId !== req.params.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    const history = await MoodEntry.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30);
    res.status(200).json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. GET: Real-Time Community Atmosphere
router.get('/community', async (req, res) => {
  try {
    const recent = await MoodEntry.find()
      .sort({ createdAt: -1 })
      .limit(100);

    const counts = { Happy: 0, Calm: 0, Okay: 0, Sad: 0, Angry: 0, Anxious: 0, Tired: 0 };
    recent.forEach((item) => {
      if (counts[item.emotion] !== undefined) counts[item.emotion]++;
    });

    res.status(200).json({ success: true, counts, total: recent.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;