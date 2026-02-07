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
2. Enable **Firestore Database** (for product data sync when Supabase is unavailable)
3. Enable **Firebase Storage** (for image uploads that sync across all devices)
4. Enable **Firebase Authentication** with Email/Password (fallback login)
5. Copy your Firebase config from Project Settings → General → Your apps → Web app
6. Replace the `FIREBASE_CONFIG` values in `app.js` with your config

**Sync priority:** Supabase → Firebase → localStorage (offline fallback)

### Files
- `index.html`: Main structure.
- `style.css`: Design system and theming.
- `app.js`: Core logic, router, and state management.
