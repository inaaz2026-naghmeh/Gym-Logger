# 🏋️ Majestic Gym Logger

A premium, mobile-first Progressive Web App (PWA) built for serious lifters. Designed with **Next.js 16**, **Tailwind CSS v4**, and **Firebase**.

![Majestic Gym Logger](https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200)

## ✨ Features

- **🚀 Instant Entry**: Start logging workouts immediately with our "Guest Mode" (Local Storage) or sync across devices with Google Sign-In.
- **📱 Mobile-First UI**: Tactile, oversized touch targets and glassmorphism design for sweaty fingers and gym environments.
- **🧠 Smart Defaults**: Remembers your last weight and reps for every exercise.
- **📦 Template Library**: Load "Majestic" pre-built routines or create your own custom templates.
- **📊 Detailed History**: Track your progress with weekly grouped workout summaries and total volume calculation.
- **📉 Data Portability**: Export your entire workout history to CSV anytime.
- **🎨 Dynamic Themes**: Automatically switches between sleek dark mode and high-contrast light mode.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Compiler**: React Compiler enabled
- **Styling**: Tailwind CSS v4 (@tailwindcss/postcss)
- **Database**: Firebase Firestore (with LocalStorage fallback)
- **Auth**: Firebase Auth (Google Sign-In)
- **Icons**: Lucide React
- **Animations**: Framer-like custom CSS springs and keyframes

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/your-username/gym-logger.git
cd gym-logger
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```
*Note: The app will run in **Guest Mode** automatically if these variables are missing.*

### 3. Run Locally
```bash
npm run dev
```

## 🏗️ Project Structure

- `/src/app`: Next.js App Router pages and layouts.
- `/src/components`: Tactile UI components (WorkoutForm, StaggeredList, etc.).
- `/src/context`: Global state management (Auth, Settings, Theme).
- `/src/lib`: Firebase configuration and Firestore CRUD helpers.
- `/src/types`: Centralized TypeScript interfaces.

## 📄 License
MIT License - Created with ❤️ by Antigravity
