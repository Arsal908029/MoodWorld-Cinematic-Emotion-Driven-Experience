# MoodWorld-Cinematic-Emotion-Driven-Experience
MoodWorld transforms a user’s feelings into an immersive, full‑bleed illustrated world. The landscape (sky, sun/moon, clouds, terrain, weather) is always visible behind the UI, which floats on frosted‑glass panels. The app feels premium, calm, and cinematic – never childish or corporate.

## Backend email delivery

Copy `backend/.env.example` to `backend/.env` and set `RESEND_API_KEY` plus a `RESEND_FROM_EMAIL` address verified with Resend before starting the backend. Signup verification, verification-code resend, and password-reset codes are sent to the account email and expire after 15 minutes; codes are never returned by the API. Keep `backend/.env` private and out of version control.

## Run the app

**Backend** (Node 18+)
```bash
cd backend
cp .env.example .env   # then fill in your own values (never commit .env)
npm install
npm start
```

**Frontend** (Expo)
```bash
cd frontend
npm install
npx expo start -c      # -c clears the Metro cache
```
Scan the QR code with Expo Go. Your phone and computer must be on the same Wi-Fi. The app finds the backend automatically from the Metro host address.

### Expo Go and daily reminders
`expo-notifications` does not work inside Expo Go (SDK 53+). `src/services/dailyReminder.js` therefore loads it lazily and skips it in Expo Go, so the app opens normally and the reminder toggle shows a short message instead of crashing. To test real reminders, use a development build: `npx expo run:android` / `npx expo run:ios`, or `eas build --profile development`.
