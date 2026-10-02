const express = require('express');
const jwt = require('jwt-simple');
const MusicHistory = require('../models/MusicHistory');
const { buildMusicQuery } = require('../services/musicQueries');
const { searchYouTube } = require('../services/youtubeService');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'moodworld_secret_key_2026';

function getUserIdFromReq(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  try {
    return jwt.decode(authHeader.replace(/^Bearer\s+/, ''), JWT_SECRET).id;
  } catch (error) {
    return null;
  }
}

router.get('/recommendation', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, error: 'Authentication required.' });

    const emotion = req.query.emotion || 'Okay';
    const intensity = Math.min(10, Math.max(1, Number(req.query.intensity) || 5));
    const language = ['hindi', 'pakistani', 'mixed'].includes(req.query.language) ? req.query.language : 'mixed';
    const type = ['songs', 'instrumental', 'ambient'].includes(req.query.type) ? req.query.type : 'songs';
    const recent = await MusicHistory.find({ userId }).sort({ playedAt: -1 }).limit(20).select('videoId');
    const song = await searchYouTube({
      query: buildMusicQuery({ emotion, intensity, language, type }),
      excludeVideoIds: recent.map((item) => item.videoId),
    });

    const entry = await MusicHistory.create({ ...song, userId, emotion, language, musicType: type });
    res.json({ success: true, song: { ...song, emotion, language, musicType: type, historyId: entry._id } });
  } catch (error) {
    res.status(error.statusCode || 500).json({ success: false, error: error.message || 'Unable to find mood music.' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ success: false, error: 'Authentication required.' });
    const entries = await MusicHistory.find({ userId }).sort({ playedAt: -1 }).limit(20);
    res.json({ success: true, entries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Unable to load music history.' });
  }
});

module.exports = router;
