# MoodWorld: End-to-End Technical Implementation Guide & Codebase

**Stack:** React Native (Expo) | Node.js & Express | MongoDB & Mongoose  
**Target Platform:** Android (Optimized for Google Pixel 7) & iOS  
**Document Version:** 1.0.0 (Production Release)  
**Compatibility:** Microsoft Word, VS Code, Markdown Editors  

---

## Table of Contents

1. [System Architecture & Data Flow](#1-system-architecture--data-flow)
2. [Database Schemas & Data Models (MongoDB / Mongoose)](#2-database-schemas--data-models-mongodb--mongoose)
   - 2.1 User Model (`models/User.js`)
   - 2.2 Mood Entry Model (`models/MoodEntry.js`)
   - 2.3 Journal Reflection Model (`models/Journal.js`)
3. [Backend API Engine (Node.js & Express)](#3-backend-api-engine-nodejs--express)
   - 3.1 Main Express Application Server (`server.js`)
   - 3.2 Database Connection & Resilience Pool (`config/db.js`)
   - 3.3 Authentication & Authorization Routes (`routes/authRoutes.js`)
   - 3.4 Mood Check-in & Community Pulse Routes (`routes/moodRoutes.js`)
   - 3.5 Journal Reflection Routes (`routes/journalRoutes.js`)
4. [Procedural World Generator Engine](#4-procedural-world-generator-engine)
   - 4.1 Emotional State Matrix & Landscape Computation (`services/worldGenerator.js`)
5. [React Native Frontend Implementation](#5-react-native-frontend-implementation)
   - 5.1 Responsive Mobile Scaling Engine (`src/theme/scaling.js`)
   - 5.2 Cinematic Design System & Atmosphere Token Definition (`src/theme/moodWorldTheme.js`)
   - 5.3 Secure API Client with Network Resilience (`src/services/api.js`)
   - 5.4 Global Authentication Context & Session Management (`src/context/AuthContext.js`)
   - 5.5 Route Navigation Architecture (`src/navigation/RootNavigator.js` & `MainTabNavigator.js`)
   - 5.6 Core Screen Suite:
     - 5.6.1 Welcome & Brand Gateway (`src/screens/WelcomeScreen.js`)
     - 5.6.2 Authenticated Sign Up & Sign In (`src/screens/SignUpScreen.js`)
     - 5.6.3 Interactive Mood Check-In (`src/screens/CheckInScreen.js`)
     - 5.6.4 Dynamic Procedural World Visualizer (`src/screens/WorldScreen.js`)
     - 5.6.5 Mindful Breathing Exercise (`src/screens/BreathingScreen.js`)
     - 5.6.6 User Profile, Journey Analytics & Settings (`src/screens/ProfileScreen.js`)
     - 5.6.7 Policy & Instruction (`src/screens/PolicyInstructionScreen.js`)
     - 5.6.8 Focus Onboarding (`src/screens/AccountSetupScreen.js`)
   - 5.7 World Vector Rendering Subsystem (`Foreground.js`, `Sky.js`, `Scene.js`)
6. [Database Seeding, Query CLI & MongoDB Compass Guide](#6-database-seeding-query-cli--mongodb-compass-guide)
   - 6.1 Database Seeder Script (`seed.js`)
   - 6.2 Interactive Database Query CLI Tool (`query.js`)
   - 6.3 MongoDB Compass Connection Instructions
7. [Deployment & Environment Configuration](#7-deployment--environment-configuration)
   - 7.1 Environment Configuration (`.env`)
   - 7.2 Run Commands

---

## 1. System Architecture & Data Flow

```
+-----------------------------------------------------------------------+
|                     REACT NATIVE CLIENT (EXPO)                       |
|                                                                       |
|  - React Navigation 6 (Strict Auth-Guarded Stacks + Floating Tabs)    |
|  - React Native Reanimated 3 (Harmonic Breathing & Sky Particle Orbs) |
|  - React Native SVG (Dynamic Procedural Biome Horizon Silhouettes)    |
|  - Expo Blur (Hardware-Accelerated Dark Glassmorphic Panels)          |
|  - Responsive Scaler (Pixel 7 High-Density & Android Inset Support)   |
|  - AsyncStorage (Encrypted JWT Token & User Session Persistence)      |
+-----------------------------------+-----------------------------------+
                                    |
                    HTTPS / REST API (Port 5000)
                                    |
+-----------------------------------v-----------------------------------+
|                     NODE.JS & EXPRESS BACKEND                         |
|                                                                       |
|  - server.js (CORS, Express JSON Parser, Route Dispatcher)            |
|  - PBKDF2 SHA-512 Cryptographic Password Hasher & Verifier            |
|  - JWT-Simple Token Generation & Verification Middleware              |
|  - Procedural World Generation Engine (Emotion -> Weather/Biome)     |
|  - Real-Time Community Atmosphere Aggregator                          |
+-----------------------------------+-----------------------------------+
                                    |
                     Mongoose ODM v8.3 (Auto-Reconnect)
                                    |
+-----------------------------------v-----------------------------------+
|                     MONGODB ATLAS CLOUD CLUSTER                       |
|                                                                       |
|  - Database: moodworld                                                |
|  - Collection: users (Email-indexed, Streak, Auth tokens)             |
|  - Collection: moodentries (Compound-indexed: userId + createdAt)     |
|  - Collection: journals (Reflective diary entries & emotion tags)     |
+-----------------------------------------------------------------------+
```

---

## 2. Database Schemas & Data Models (MongoDB / Mongoose)

### 2.1 User Model (`backend/models/User.js`)

```javascript
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
    settings: {
      autoChangeWorld: { type: Boolean, default: true },
      sound: { type: Boolean, default: true },
      notifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Static method to securely hash password using PBKDF2 with random salt
UserSchema.statics.hashPassword = function (plainPassword) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plainPassword, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

// Method to verify candidate password against stored hash
UserSchema.methods.comparePassword = function (candidatePassword) {
  if (!this.password) return false;
  if (!this.password.includes(':')) {
    return this.password === candidatePassword;
  }
  const [salt, originalHash] = this.password.split(':');
  const hash = crypto.pbkdf2Sync(candidatePassword, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
};

module.exports = mongoose.model('User', UserSchema);
```

### 2.2 Mood Entry Model (`backend/models/MoodEntry.js`)

```javascript
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

// High-speed compound indexes for queries
moodEntrySchema.index({ userId: 1, createdAt: -1 });
moodEntrySchema.index({ emotion: 1, createdAt: -1 });
moodEntrySchema.index({ createdAt: -1 });

module.exports = mongoose.model('MoodEntry', moodEntrySchema);
```

### 2.3 Journal Reflection Model (`backend/models/Journal.js`)

```javascript
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
```

---

## 3. Backend API Engine (Node.js & Express)

### 3.1 Main Application Server (`backend/server.js`)

```javascript
// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const moodRoutes = require('./routes/moodRoutes');
const journalRoutes = require('./routes/journalRoutes');

dotenv.config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/journals', journalRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MoodWorld Backend running on port ${PORT} (0.0.0.0)`);
});
```

### 3.2 Database Connection & Resilience Pool (`backend/config/db.js`)

```javascript
// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/moodworld';
    
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

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('[Database] MongoDB connection closed on app termination.');
      process.exit(0);
    });

    return conn;
  } catch (err) {
    console.error(`[Database Critical] Connection Failed: ${err.message}`);
  }
};

module.exports = connectDB;
```

---

## 4. Procedural World Generator Engine

### 4.1 Emotional State Matrix & Landscape Computation (`backend/services/worldGenerator.js`)

```javascript
// backend/services/worldGenerator.js
const MOOD_MATRIX = {
  Happy:   { weather: 'Sunny',   lighting: 'bright',   env: 'Garden',    sky: ['#4aa8ff', '#ffc98a', '#fff0cf'], ground: '#3d8a52', music: 'Happy' },
  Calm:    { weather: 'Rainbow', lighting: 'soft',     env: 'Beach',     sky: ['#3a6fd0', '#78cfd6', '#f6d8ee'], ground: '#2b6d80', music: 'Relax' },
  Okay:    { weather: 'Cloudy',  lighting: 'neutral',  env: 'Forest',    sky: ['#7f95ad', '#aebccb', '#dde4ea'], ground: '#3f6553', music: 'Focus' },
  Sad:     { weather: 'Rainy',   lighting: 'gloomy',   env: 'Forest',    sky: ['#18233f', '#34466f', '#6a7fa8'], ground: '#131d33', music: 'Sleep' },
  Angry:   { weather: 'Stormy',  lighting: 'dramatic', env: 'City',      sky: ['#170a1e', '#6b1a3a', '#e2553a'], ground: '#160c15', music: 'Energy', lightning: true },
  Anxious: { weather: 'Foggy',   lighting: 'foggy',    env: 'Mountains', sky: ['#454a78', '#8a8fb5', '#c9cbdf'], ground: '#2c2f50', music: 'Relax' },
  Tired:   { weather: 'Snowy',   lighting: 'dim',      env: 'Space',     sky: ['#080a28', '#232a66', '#5a60ab'], ground: '#0e1030', music: 'Sleep' },
};

function generateWorldFromMood(emotion, intensity = 5) {
  const base = MOOD_MATRIX[emotion] || MOOD_MATRIX.Okay;
  return {
    weather: base.weather,
    env: base.env,
    environment: base.env,
    lighting: base.lighting,
    sky: base.sky,
    ground: base.ground,
    music: base.music,
    lightning: base.lightning || false,
    rainIntensity: (emotion === 'Sad' || emotion === 'Angry') ? (intensity / 10) : 0,
    fog: (emotion === 'Anxious' || intensity > 6) ? 'high' : 'low',
    fogDensity: (emotion === 'Anxious' || intensity > 6) ? 'high' : 'low',
  };
}

module.exports = { generateWorldFromMood, MOOD_MATRIX };
```

---

## 5. React Native Frontend Implementation

### 5.1 Responsive Mobile Scaling Engine (`frontend/src/theme/scaling.js`)

Specifically designed to handle Pixel 7 (412 × 915 dp) and diverse mobile aspect ratios without content clipping:

```javascript
// src/theme/scaling.js
import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GUIDELINE_BASE_WIDTH = 390;
const GUIDELINE_BASE_HEIGHT = 844;

export const scale = (size) => (SCREEN_WIDTH / GUIDELINE_BASE_WIDTH) * size;
export const verticalScale = (size) => (SCREEN_HEIGHT / GUIDELINE_BASE_HEIGHT) * size;
export const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

export const scaledFontSize = (size, min = size * 0.85, max = size * 1.25) => {
  const scaled = moderateScale(size, 0.4);
  return Math.min(Math.max(scaled, min), max);
};

export const DEVICE = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  isSmallScreen: SCREEN_WIDTH < 375 || SCREEN_HEIGHT < 700,
  isTallScreen: SCREEN_HEIGHT >= 850,
  pixelRatio: PixelRatio.get(),
  isAndroid: Platform.OS === 'android',
  isIOS: Platform.OS === 'ios',
};

export default { scale, verticalScale, moderateScale, scaledFontSize, DEVICE };
```

### 5.2 Navigation Architecture (`frontend/src/navigation/RootNavigator.js`)

Guarantees strict authentication boundary — unauthenticated users cannot access main application tabs:

```javascript
// src/navigation/RootNavigator.js
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import WelcomeScreen from '../screens/WelcomeScreen';
import SignUpScreen from '../screens/SignUpScreen';
import AccountSetupScreen from '../screens/AccountSetupScreen';
import PolicyInstructionScreen from '../screens/PolicyInstructionScreen';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#60A5FA" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {user ? (
          // Authenticated Protected Stack
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="AccountSetup" component={AccountSetupScreen} />
            <Stack.Screen name="PolicyInstruction" component={PolicyInstructionScreen} />
          </>
        ) : (
          // Guest / Authentication Stack
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} initialParams={{ isLogin: false }} />
            <Stack.Screen name="Login" component={SignUpScreen} initialParams={{ isLogin: true }} />
            <Stack.Screen name="PolicyInstruction" component={PolicyInstructionScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

### 5.3 Scalable Floating Bottom Navigation (`frontend/src/navigation/MainTabNavigator.js`)

Includes dynamic safe-area clearance for Android gesture navigation bars:

```javascript
// src/navigation/MainTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CheckInScreen from '../screens/CheckInScreen';
import WorldScreen from '../screens/WorldScreen';
import BreathingScreen from '../screens/BreathingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import theme from '../theme/moodWorldTheme';
import { moderateScale, scaledFontSize } from '../theme/scaling';

const Tab = createBottomTabNavigator();

function TabItem({ icon, label, focused }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
        {label}
      </Text>
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const bottomOffset = Math.max(insets.bottom, 10) + 6;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [styles.tabBar, { bottom: bottomOffset }],
        tabBarBackground: () => (
          <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
        ),
      }}
    >
      <Tab.Screen
        name="CheckIn"
        component={CheckInScreen}
        options={{ tabBarIcon: ({ focused }) => <TabItem icon="✨" label="CheckIn" focused={focused} /> }}
      />
      <Tab.Screen
        name="World"
        component={WorldScreen}
        options={{ tabBarIcon: ({ focused }) => <TabItem icon="🌐" label="World" focused={focused} /> }}
      />
      <Tab.Screen
        name="Breathing"
        component={BreathingScreen}
        options={{ tabBarIcon: ({ focused }) => <TabItem icon="🫁" label="Breathe" focused={focused} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabItem icon="👤" label="Profile" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 64,
    borderRadius: theme.radius.sheet,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    paddingHorizontal: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    width: '100%',
    paddingTop: 4,
  },
  tabIcon: {
    fontSize: moderateScale(18),
    opacity: 0.65,
    marginBottom: 2,
  },
  tabIconActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: scaledFontSize(11),
    color: theme.ui.textSoft,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#38BDF8',
    marginTop: 2,
  },
});
```

---

## 6. Database Seeding, Query CLI & MongoDB Compass Guide

### 6.1 Database Seeder Script (`backend/seed.js`)

Initializes the MongoDB Atlas cloud cluster with realistic test accounts, a 7-day mood history, and community pulse entries:

```bash
npm run seed
```

Output:
```
[Seed] Connecting to MongoDB Atlas cluster...
[Seed] Connected successfully.
[Seed] Cleared existing User and MoodEntry collections.
[Seed] Created primary user: Arsalan Ali (arsalan@moodworld.com)
[Seed] Created 7 personal historical mood logs for Arsalan Ali.

========================================
Database Seeded Successfully!
Total Users: 2
Total Mood Logs: 24
Login Credentials:
  Email:    arsalan@moodworld.com (or demo@moodworld.com)
  Password: password123
========================================
```

### 6.2 Interactive Database Query CLI Tool (`backend/query.js`)

A built-in inspection tool is provided to view and verify database documents directly from the terminal:

```bash
# 1. Run complete report (users, latest entries, statistical distribution)
npm run query

# 2. View all registered users
node query.js users

# 3. View the latest 10 mood check-ins
node query.js moods 10

# 4. View aggregated community atmosphere analytics
node query.js stats

# 5. Query a specific user's complete history
node query.js user arsalan@moodworld.com
```

### 6.3 MongoDB Compass Connection Instructions

To inspect your database visually in **MongoDB Compass**:

1. Open **MongoDB Compass**.
2. Paste the following connection string into the **URI** field:
   ```text
   mongodb+srv://Maheen01:11223344@cluster0.usac0py.mongodb.net/moodworld?retryWrites=true&w=majority
   ```
3. Click **Connect**.
4. In the left panel, select the **`moodworld`** database.
5. You can view all live documents in:
   - **`users`** — User profiles, credentials, streak counts, current emotional state.
   - **`moodentries`** — Mood check-in entries with intensities, triggers, and generated procedural world states.
   - **`journals`** — Reflective mindfulness journal entries.

---

## 7. Deployment & Environment Configuration

### 7.1 Environment Variables (`backend/.env`)

```env
PORT=5000
NODE_ENV=development

# Primary Database: MongoDB Atlas Cloud Cluster
MONGODB_URI=mongodb+srv://Maheen01:11223344@cluster0.usac0py.mongodb.net/moodworld?retryWrites=true&w=majority

# Secret Key for JWT Token Generation
JWT_SECRET=moodworld_secret_key_2026
```

### 7.2 Running the Application

#### Start the Backend Server:
```bash
cd backend
npm install
npm start
```
*(Runs with `--watch` mode on Node.js v22+)*

#### Start the Mobile Client:
```bash
cd frontend
npm install
npx expo start
```
*Scan the generated QR code using the **Expo Go** application on your Google Pixel 7 or iOS device.*
