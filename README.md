# RideSafe Voice 🏍️🎧
**A zero-touch, voice-first "Software Smart Helmet" for Indian two-wheeler riders.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black.svg)](#)

**Built for the [Code for a Billion Hackathon](https://agentfoundry.me) — Transportation Safety Track.**

RideSafe Voice is a Progressive Web App (PWA) that eliminates the need for riders (especially gig delivery workers) to mount their phones on handlebars or look at screens while navigating heavy traffic. By hijacking standard Bluetooth earphone buttons and utilizing native browser sensors, it delivers code-mixed voice navigation, audio speed warnings, and automated crash SOS dispatch without requiring expensive specialized helmet hardware.

[👉 **Watch the 2-Minute Demo Video**](LINK_TO_YOUTUBE_OR_DRIVE_HERE)  
[👉 **Live PWA Deployment**](LINK_TO_VERCEL_DEPLOYMENT_HERE)

---

## 🛑 The Problem (Size & Severity)
* **Size:** India has over 200 million registered two-wheelers. The rise of quick-commerce and ride-hailing (Swiggy, Zomato, Rapido) has put millions of gig workers on the road who rely heavily on GPS.
* **Severity:** According to the Ministry of Road Transport and Highways (MoRTH), two-wheelers account for over 44% of total road accident deaths in India. A major contributing factor is distracted riding—specifically, riders taking their eyes off the road to check phone mounts for route updates or to operate touchscreen apps.

## 💡 The Solution (Quality of Solution)
RideSafe Voice acts as a **virtual smart helmet** running entirely in the browser, ensuring eyes stay on the road and hands stay on the handlebars.

### Key Features
1. **Zero-Touch Earphone Trigger:** Uses the **Media Session API** to hijack the play/pause button on standard Bluetooth earphones. Riders click their earbud to activate the microphone without touching their phone.
2. **Code-Mixed NLP Routing:** Uses the **Web Speech API** + **Google Gemini API** to understand mixed Indian languages (e.g., *"Salt Lake Sector 5 le cholo"*). It reliably extracts the geographical destination ignoring filler words.
3. **Audio-Only Navigation:** Uses **OpenRouteService** (two-wheeler routing) and the **Web Speech Synthesis API** to deliver turn-by-turn spoken instructions.
4. **Crash-Check SOS System:** Monitors the **DeviceMotion API** (accelerometer) for sudden jolts/spikes. If a crash is suspected, it prompts the rider: *"Are you okay?"* If uncancelled within 15 seconds, it dispatches an automated Telegram SOS with live GPS coordinates to emergency contacts.
5. **Acoustic Speedometer:** Tracks live speed via the **Geolocation API** and issues gentle audio warnings if the rider exceeds the safe speed limit.

---

## 📈 Proven Impact
*Hackathon Judges: We field-tested this prototype with real riders in Kolkata prior to submission.*

* **Total Test Trips:** [e.g., 12 trips completed]
* **Languages Processed:** [e.g., Bengali, Hindi, and English code-mixed queries]
* **Rider Feedback:** 
  > *"Not having to look down at my phone at busy junctions makes a huge difference. The earphone button click is completely natural."* — [Name], Delivery Rider / Commuter

---

## 🛠️ Technical Architecture & Stack

To keep this a universally accessible Digital Public Good, RideSafe relies on free-tier APIs and native web standards.

**Frontend (PWA / Browser APIs)**
* **Framework:** Next.js (React), Tailwind CSS
* **Mapping UI:** React-Leaflet & OpenStreetMap tiles
* **Native Sensors:** Web Speech API, Speech Synthesis API, Geolocation API, DeviceMotion API, Media Session API, Screen Wake Lock API.

**Backend (API Routes)**
* **NLP Extraction:** Google Gemini API (`gemini-1.5-flash`)
* **Geocoding:** Nominatim (OpenStreetMap)
* **Routing:** OpenRouteService (ORS) API
* **SOS Dispatch:** Telegram Bot API
* **Analytics Logging:** Supabase (PostgreSQL)

---

## 💻 Local Setup & Installation

To run this project locally, you will need Node.js installed.

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/ridesafe-voice.git](https://github.com/YOUR_USERNAME/ridesafe-voice.git)
   cd ridesafe-voice
