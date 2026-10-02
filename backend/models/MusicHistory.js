const mongoose = require('mongoose');

const musicHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    videoId: { type: String, required: true },
    title: { type: String, required: true },
    channelTitle: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    emotion: { type: String, required: true },
    language: { type: String, required: true },
    musicType: { type: String, default: 'songs' },
    playedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

musicHistorySchema.index({ userId: 1, playedAt: -1 });

module.exports = mongoose.model('MusicHistory', musicHistorySchema);
