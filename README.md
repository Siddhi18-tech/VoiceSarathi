# VoiceSarathi 🛵🎙️

**A zero-touch "Software Smart Helmet" PWA for two-wheeler riders featuring code-mixed voice navigation and automated crash SOS.**



---

## 🛑 The Problem

India has over 200 million registered two-wheelers, accounting for over 44% of the country's road accident fatalities. With the rapid surge in the gig economy, millions of delivery riders are forced to constantly look away from heavy traffic to check handlebar phone mounts for GPS routing. 

This continuous **visual, manual, and cognitive distraction** delays reaction times and causes erratic lane changes, making distracted riders four times more likely to crash.

## 💡 Our Solution: VoiceSarathi

VoiceSarathi acts as a virtual smart helmet running entirely in the mobile browser. It ensures riders can navigate complex routes and trigger SOS alerts while keeping their **eyes on the road and hands on the handlebars**. 

By transforming any standard smartphone and Bluetooth earphone combination into an AI-powered safety device, VoiceSarathi provides high-end road safety without requiring gig workers to purchase expensive proprietary hardware.

---

## ✨ Key Features

*   **Zero-Touch Voice Activation:** Hijacks the Media Session API, allowing riders to trigger the microphone simply by clicking the physical button on their standard Bluetooth earphones. No screen-tapping required.
*   **Code-Mixed NLP:** Integrates the Google Gemini 1.5 Flash API to parse native, code-mixed voice commands (e.g., Bengali/Hindi + English: *"Salt Lake Sector 5 le cholo"*) to accurately extract the geographical destination.
*   **Hybrid Sovereign Routing:** Uses ISRO's Bhuvan WMS satellite tiles for an India-first visual layer, while invisibly leveraging Google Maps Platform's `TWO_WHEELER` routing engine to calculate safe, bike-friendly shortcuts that avoid highways.
*   **Automated Crash SOS:** Monitors the phone's native `DeviceMotion` accelerometer. If a sudden jolt (>25 m/s²) is detected and the rider fails to verbally cancel the 15-second audio prompt, the app auto-dispatches an SOS payload with live GPS coordinates via a Telegram Bot.
*   **Frictionless Access:** Implements a password-based Neon Postgres + Auth.js backend with instant-login capabilities, specifically designed for gig workers who cannot waste time on complex email verification flows.

---

## 🏗️ System Architecture

![VoiceSarathi System Architecture](watermarked_img_2009026790516915157.png)

## 🛠️ Tech Stack

*   **Frontend:** Next.js 14 (App Router), Tailwind CSS, PWA setup
*   **Backend & Auth:** Node.js (Next.js API Routes), Neon Serverless Postgres, Auth.js (NextAuth)
*   **AI & Routing:** Google Gemini API (`gemini-1.5-flash`), Google Maps Platform (Routes API, Geocoding API), ISRO Bhuvan WMS
*   **Web APIs:** Media Session API, Web Speech API, Geolocation, DeviceMotion, Wake Lock
*   **SOS Dispatch:** Telegram Bot API

---

## 📊 Proven Impact (Field Testing)

*Note: Data collected during our pre-submission testing phase in Kolkata.*
*   **Trips Logged:** 15 successfully navigated trips.
*   **Distance Covered:** 120+ km of active routing.
*   **Language Accuracy:** Successfully processed 45+ code-mixed voice commands across Hindi, Bengali, and English.
*   **User Feedback:** Test riders reported a near-total elimination of "junction hesitation" and zero physical interaction with their phone mounts during the ride.

---

## 🚀 Getting Started (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/YourUsername/VoiceSarathi.git
cd VoiceSarathi
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and add the following keys:

```env
# Database & Auth
DATABASE_URL="postgres://user:password@endpoint.neon.tech/dbname"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# AI & Mapping
GEMINI_API_KEY="your-google-gemini-api-key"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Telegram SOS Dispatch
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
TELEGRAM_CHAT_ID="your-target-chat-id"
```

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. *Note: Voice and accelerometer features require testing on a physical mobile device (via ngrok or local network IP) over HTTPS.*

---
**Made with ❤️ for the Code for a Billion Hackathon by Siddhi Bathwal & Team.**
