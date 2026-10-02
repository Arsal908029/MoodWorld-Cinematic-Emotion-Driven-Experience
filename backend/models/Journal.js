// backend/models/Journal.js
const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true,
    },
    text: { 
      type: String, 
      required: [true, 'Journal entry text is required'],
      trim: true,
    },
    emotion: { 
      type: String,
      enum: ['Happy', 'Calm', 'Okay', 'Sad', 'Angry', 'Anxious', 'Tired'],
      default: 'Okay',
    },
    audioUri: { type: String, default: null },
    photoUri: { type: String, default: null },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

journalSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Journal', journalSchema);
