// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/moodworld';
    
    // Connection options for stability and fast error detection
    const options = {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(uri, options);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[Database Error] Connection issue: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database Warning] MongoDB disconnected. Attempting reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[Database Info] MongoDB reconnected successfully.');
    });

    // Graceful process exit
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('[Database] MongoDB connection closed on app termination.');
      process.exit(0);
    });

    return conn;
  } catch (err) {
    console.error(`[Database Critical] Connection Failed: ${err.message}`);
    // If Atlas fails, fallback to local mongo if available
    if (!uri.includes('localhost') && !uri.includes('127.0.0.1')) {
      console.log('[Database] Attempting fallback to local MongoDB instance...');
      try {
        const localConn = await mongoose.connect('mongodb://localhost:27017/moodworld', {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`[Database] Connected to Local Fallback: ${localConn.connection.host}`);
        return localConn;
      } catch (localErr) {
        console.error(`[Database Fallback Failed] ${localErr.message}`);
      }
    }
  }
};

module.exports = connectDB;