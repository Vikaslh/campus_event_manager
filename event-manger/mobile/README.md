# Campus Event Management - Mobile App

This is the React Native mobile application for the Campus Event Management system. It provides a mobile interface for students to browse events, register for events, mark attendance, and submit feedback.

## Features

- Student authentication (login/register)
- Browse and search events
- Register for events
- View registered events
- Mark attendance via QR code
- Submit feedback for attended events

## Setup

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Install dependencies:
   ```bash
   cd mobile
   npm install
   # or
   yarn install
   ```

2. Start the Metro bundler:
   ```bash
   npm start
   # or
   yarn start
   ```

3. Run on Android:
   ```bash
   npm run android
   # or
   yarn android
   ```

4. Run on iOS (macOS only):
   ```bash
   npm run ios
   # or
   yarn ios
   ```

## Project Structure

```
mobile/
├── src/
│   ├── api/           # API client and services
│   ├── assets/        # Images, fonts, etc.
│   ├── components/    # Reusable components
│   ├── contexts/      # React contexts (Auth, etc.)
│   ├── hooks/         # Custom hooks
│   ├── navigation/    # Navigation configuration
│   ├── screens/       # Screen components
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   └── App.tsx        # Root component
├── .gitignore
├── app.json
├── babel.config.js
├── index.js          # Entry point
├── metro.config.js
├── package.json
├── README.md
└── tsconfig.json
```

## Backend Integration

This mobile app connects to the same FastAPI backend as the web application. The API client is configured to use the same endpoints with appropriate authentication.