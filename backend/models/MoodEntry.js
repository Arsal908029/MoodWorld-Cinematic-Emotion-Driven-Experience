// backend/models/MoodEntry.js
const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: [true, 'User ID is required'],
      index: true,
    },
    emotion: { 
      type: String, 
      enum: ['Happy', 'Calm', 'Okay', 'Sad', 'Angry', 'Anxious', 'Tired'], 
      required: [true, 'Emotion is required'],
      index: true,
    },
    intensity: { 
      type: Number, 
      min: [1, 'Intensity must be at least 1'], 
      max: [10, 'Intensity cannot exceed 10'], 
      required: [true, 'Intensity is required'],
    },
    triggers: [{ type: String, trim: true }],
    worldState: {
      weather: { 
        type: String, 
        enum: ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Snowy', 'Rainbow', 'Foggy'] 
      },
      env: { 
        type: String, 
        enum: ['Forest', 'Beach', 'Mountains', 'Space', 'Garden', 'City'] 
      },
      environment: { 
        type: String, 
        enum: ['Forest', 'Beach', 'Mountains', 'Space', 'Garden', 'City'] 
      },
      lighting: { type: String },
      fog: { type: String },
      fogDensity: { type: String },
      rainIntensity: { type: Number },
      musicCategory: { type: String },
      music: { type: String },
    },
  },
  { timestamps: true }
);

// Performance Indexes for high-frequency queries
moodEntrySchema.index({ userId: 1, createdAt: -1 });
moodEntrySchema.index({ emotion: 1, createdAt: -1 });
moodEntrySchema.index({ createdAt: -1 });

module.exports = mongoose.model('MoodEntry', moodEntrySchema);