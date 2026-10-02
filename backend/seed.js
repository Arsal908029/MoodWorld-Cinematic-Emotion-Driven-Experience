// backend/seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const MoodEntry = require('./models/MoodEntry');
const { generateWorldFromMood } = require('./services/worldGenerator');

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/moodworld';
    console.log('[Seed] Connecting to MongoDB:', mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('[Seed] Connected successfully.');

    // 1. Clear existing test data
    await User.deleteMany({});
    await MoodEntry.deleteMany({});
    console.log('[Seed] Cleared existing User and MoodEntry collections.');

    // 2. Create Primary Demo User
    const primaryPassword = User.hashPassword('password123');
    const primaryUser = await User.create({
      name: 'Arsalan Ali',
      email: 'arsalan@moodworld.com',
      password: primaryPassword,
      currentMood: 'Happy',
      streak: 7,
      lastCheckIn: new Date(),
      hasCompletedOnboarding: true,
      acceptedTermsAt: new Date(),
      settings: {
        autoChangeWorld: true,
        sound: true,
        notifications: true,
      },
    });

    console.log(`[Seed] Created primary user: ${primaryUser.name} (${primaryUser.email})`);

    // 3. Create Additional Demo User
    const demoUser = await User.create({
      name: 'Explorer User',
      email: 'demo@moodworld.com',
      password: primaryPassword,
      currentMood: 'Calm',
      streak: 3,
      lastCheckIn: new Date(),
      hasCompletedOnboarding: true,
      acceptedTermsAt: new Date(),
      settings: {
        autoChangeWorld: true,
        sound: true,
        notifications: true,
      },
    });

    // 4. Seed Historical 7-Day Journey for Primary User
    const pastDaysMoods = [
      { emotion: 'Calm', intensity: 6, triggers: ['Morning walk', 'Mindful breathing'], daysAgo: 6 },
      { emotion: 'Okay', intensity: 5, triggers: ['Work tasks'], daysAgo: 5 },
      { emotion: 'Happy', intensity: 8, triggers: ['Project completed', 'Good news'], daysAgo: 4 },
      { emotion: 'Anxious', intensity: 6, triggers: ['Deadlines', 'Busy schedule'], daysAgo: 3 },
      { emotion: 'Sad', intensity: 4, triggers: ['Rainy afternoon', 'Fatigue'], daysAgo: 2 },
      { emotion: 'Calm', intensity: 7, triggers: ['Evening tea', 'Meditation session'], daysAgo: 1 },
      { emotion: 'Happy', intensity: 9, triggers: ['Feeling energized', 'Family dinner'], daysAgo: 0 },
    ];

    for (const item of pastDaysMoods) {
      const entryDate = new Date();
      entryDate.setDate(entryDate.getDate() - item.daysAgo);

      const computedWorld = generateWorldFromMood(item.emotion, item.intensity);

      await MoodEntry.create({
        userId: primaryUser._id,
        emotion: item.emotion,
        intensity: item.intensity,
        triggers: item.triggers,
        worldState: computedWorld,
        createdAt: entryDate,
        updatedAt: entryDate,
      });
    }

    console.log(`[Seed] Created ${pastDaysMoods.length} personal historical mood logs for ${primaryUser.name}.`);

    // 5. Seed Community Atmosphere Entries (Simulating Live Global Atmosphere)
    const communityEmotions = [
      'Happy', 'Happy', 'Happy', 'Calm', 'Calm', 'Calm', 'Calm', 'Calm',
      'Okay', 'Okay', 'Sad', 'Sad', 'Angry', 'Anxious', 'Anxious', 'Tired', 'Tired'
    ];

    for (let i = 0; i < communityEmotions.length; i++) {
      const emo = communityEmotions[i];
      const intensity = Math.floor(Math.random() * 6) + 4;
      const hoursAgo = Math.floor(Math.random() * 24);
      const createdAt = new Date(Date.now() - hoursAgo * 3600000);

      await MoodEntry.create({
        userId: demoUser._id,
        emotion: emo,
        intensity,
        triggers: ['Community Pulse'],
        worldState: generateWorldFromMood(emo, intensity),
        createdAt,
        updatedAt: createdAt,
      });
    }

    const totalMoods = await MoodEntry.countDocuments();
    const totalUsers = await User.countDocuments();
    console.log(`\n========================================`);
    console.log(`Database Seeded Successfully!`);
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Total Mood Logs: ${totalMoods}`);
    console.log(`Login Credentials:`);
    console.log(`  Email:    arsalan@moodworld.com (or demo@moodworld.com)`);
    console.log(`  Password: password123`);
    console.log(`========================================\n`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Failed to seed database:', err);
    process.exit(1);
  }
};

seedDatabase();