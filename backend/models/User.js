// backend/models/User.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'], 
      unique: true, 
      lowercase: true, 
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
    },
    password: { 
      type: String, 
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    avatar: { 
      type: String, 
      default: 'https://i.imgur.com/6VBx3io.png' 
    },
    currentMood: { 
      type: String, 
      enum: ['Happy', 'Calm', 'Okay', 'Sad', 'Angry', 'Anxious', 'Tired'],
      default: 'Calm' 
    },
    streak: { 
      type: Number, 
      default: 0,
      min: 0,
    },
    lastCheckIn: { 
      type: Date, 
      default: null 
    },
    hasCompletedOnboarding: { 
      type: Boolean, 
      default: false 
    },
    acceptedTermsAt: { 
      type: Date, 
      default: Date.now 
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    resetPasswordCode: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    achievements: [{
      id: { type: String, required: true },
      title: { type: String, required: true },
      badge: { type: String, required: true },
      description: { type: String, required: true },
      unlockedAt: { type: Date, default: Date.now },
    }],
    settings: {
      autoChangeWorld: { type: Boolean, default: true },
      sound: { type: Boolean, default: true },
      notifications: { type: Boolean, default: true },
      reminderTime: { type: String, default: '20:00' },
      musicLanguage: { type: String, enum: ['hindi', 'pakistani', 'mixed'], default: 'mixed' },
      musicType: { type: String, enum: ['songs', 'instrumental', 'ambient'], default: 'songs' },
    },
  },
  { timestamps: true }
);

// Static method to hash password
UserSchema.statics.hashPassword = function (plainPassword) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plainPassword, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

// Method to verify password
UserSchema.methods.comparePassword = function (candidatePassword) {
  if (!this.password) return false;
  // Backward compatibility with legacy plain text passwords
  if (!this.password.includes(':')) {
    return this.password === candidatePassword;
  }
  const [salt, originalHash] = this.password.split(':');
  const hash = crypto.pbkdf2Sync(candidatePassword, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
};

module.exports = mongoose.model('User', UserSchema);
