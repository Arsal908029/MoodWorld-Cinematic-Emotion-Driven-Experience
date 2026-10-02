// backend/query.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const MoodEntry = require('./models/MoodEntry');

dotenv.config();

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/moodworld';

async function connect() {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
}

async function printUsers() {
  console.log('\n=================== 👤 REGISTERED USERS ===================');
  const users = await User.find({}).select('-password').sort({ createdAt: -1 });
  if (users.length === 0) {
    console.log('No users found in database.');
    return;
  }
  users.forEach((u, i) => {
    console.log(`[${i + 1}] ID: ${u._id}`);
    console.log(`    Name:         ${u.name}`);
    console.log(`    Email:        ${u.email}`);
    console.log(`    Current Mood: ${u.currentMood}`);
    console.log(`    Streak:       ${u.streak} days`);
    console.log(`    Last CheckIn: ${u.lastCheckIn ? u.lastCheckIn.toISOString() : 'Never'}`);
    console.log(`    Created At:   ${u.createdAt.toISOString()}`);
    console.log('------------------------------------------------------------');
  });
}

async function printMoodEntries(limit = 10) {
  console.log(`\n=================== 📝 RECENT MOOD ENTRIES (Latest ${limit}) ===================`);
  const entries = await MoodEntry.find({})
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);

  if (entries.length === 0) {
    console.log('No mood entries found in database.');
    return;
  }

  entries.forEach((e, i) => {
    const userLabel = e.userId ? `${e.userId.name} (${e.userId.email})` : 'Unknown User';
    const env = e.worldState?.env || e.worldState?.environment || 'Default';
    const weather = e.worldState?.weather || 'N/A';
    const triggers = e.triggers && e.triggers.length > 0 ? e.triggers.join(', ') : 'None';

    console.log(`[${i + 1}] User:        ${userLabel}`);
    console.log(`    Emotion:     ${e.emotion} (Intensity: ${e.intensity}/10)`);
    console.log(`    World State: ${weather} in ${env}`);
    console.log(`    Triggers:    ${triggers}`);
    console.log(`    Logged At:   ${e.createdAt.toISOString()}`);
    console.log('------------------------------------------------------------');
  });
}

async function printAggregatedStats() {
  console.log('\n=================== 📊 EMOTIONAL ATMOSPHERE STATS ===================');
  const totalEntries = await MoodEntry.countDocuments();
  const totalUsers = await User.countDocuments();

  const stats = await MoodEntry.aggregate([
    {
      $group: {
        _id: '$emotion',
        count: { $sum: 1 },
        avgIntensity: { $avg: '$intensity' },
      },
    },
    { $sort: { count: -1 } },
  ]);

  console.log(`Total Database Users:    ${totalUsers}`);
  console.log(`Total Logged Check-Ins:  ${totalEntries}\n`);
  console.log('Emotion Breakdown:');

  stats.forEach((s) => {
    const pct = totalEntries > 0 ? ((s.count / totalEntries) * 100).toFixed(1) : 0;
    const bar = '█'.repeat(Math.round(pct / 5));
    console.log(
      `  ${s._id.padEnd(8)}: ${s.count.toString().padStart(3)} entries (${pct.padStart(5)}%) [${bar.padEnd(20)}] Avg Intensity: ${s.avgIntensity.toFixed(1)}/10`
    );
  });
  console.log('====================================================================\n');
}

async function run() {
  const args = process.argv.slice(2);
  const command = args[0] ? args[0].toLowerCase() : 'all';

  try {
    const maskedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log(`[Database Query Tool] Connecting to: ${maskedUri}`);
    await connect();
    console.log(`[Database Query Tool] Connected to MongoDB host: ${mongoose.connection.host}`);

    if (command === 'users') {
      await printUsers();
    } else if (command === 'moods') {
      await printMoodEntries(args[1] ? parseInt(args[1], 10) : 25);
    } else if (command === 'stats') {
      await printAggregatedStats();
    } else if (command === 'user' && args[1]) {
      const email = args[1].toLowerCase().trim();
      const user = await User.findOne({ email }).select('-password');
      if (!user) {
        console.log(`User not found with email: ${email}`);
      } else {
        console.log('\nUser Profile:');
        console.log(JSON.stringify(user, null, 2));
        const userLogs = await MoodEntry.find({ userId: user._id }).sort({ createdAt: -1 });
        console.log(`\nMood Logs for ${user.name} (${userLogs.length} entries):`);
        userLogs.forEach((l, i) => {
          console.log(`  ${i + 1}. [${l.createdAt.toLocaleDateString()}] ${l.emotion} (${l.intensity}/10) - ${l.worldState?.weather || ''} / ${l.worldState?.env || ''}`);
        });
      }
    } else {
      // Default: Print full comprehensive report
      await printUsers();
      await printMoodEntries(5);
      await printAggregatedStats();
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('[Query Error]:', err.message);
    process.exit(1);
  }
}

run();
