# TechR Innovations Website

This is the official website for **TechR Innovations**, a forward-thinking technology company specializing in:
- **Techack**: Cybersecurity Hardware
- **TechBox**: STEM Education
- **Rithim**: Recovery Technology
- **StudyTech**: AI Learning Assistants

## Deployment
This website uses **Protocol: BARE METAL**. 
It is a native HTML/CSS/JS application requiring **no build tools**.

### How to Run
Simply open `index.html` in any web browser.

### Cloud Sync Setup
This app supports **dual-cloud sync** for real-time data and image uploads across all devices:

**Supabase** (Primary database):
- Already configured in `app.js` — update `SUPABASE_URL` and `SUPABASE_KEY` with your Supabase project credentials

**Firebase** (Image storage & sync fallback):
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Register a web app and copy the config keys
3. Paste the config keys into `app.js` → `FIREBASE_CONFIG` object (line ~11)
4. Enable **Firestore Database**, **Firebase Storage**, and **Authentication** (Email/Password)

> **📖 For a detailed step-by-step walkthrough (with screenshots descriptions, security rules, and troubleshooting), see [FIREBASE_SETUP.md](FIREBASE_SETUP.md)**

**Sync priority:** Supabase → Firebase → localStorage (offline fallback)

### Files
- `index.html`: Main structure.
- `style.css`: Design system and theming.
- `app.js`: Core logic, router, and state management.
