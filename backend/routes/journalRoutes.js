// backend/routes/journalRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jwt-simple');
const Journal = require('../models/Journal');

const JWT_SECRET = process.env.JWT_SECRET || 'moodworld_secret_key_2026';

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

// 1. POST: Create Journal Entry
router.post('/', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Authentication required.' });
    }

    const { text, emotion, audioUri, photoUri, tags } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Journal text cannot be empty.' });
    }

    const entry = await Journal.create({
      userId,
      text: text.trim(),
      emotion: emotion || 'Okay',
      audioUri,
      photoUri,
      tags: tags || [],
    });

    res.status(201).json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. GET: Fetch User Journals
router.get('/', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Authentication required.' });
    }

    const entries = await Journal.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, entries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. DELETE: Remove Journal Entry
router.delete('/:id', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const entry = await Journal.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, error: 'Journal entry not found.' });
    }
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Authentication required.' });
    }
    if (entry.userId.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Forbidden.' });
    }

    await Journal.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Journal deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
