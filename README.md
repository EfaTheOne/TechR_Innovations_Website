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

### Firebase Setup (Cloud Sync)
This app uses **Firebase** for real-time data sync and image uploads across all devices:

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore Database** (start in test mode or configure security rules)
3. Enable **Firebase Storage** (for image uploads)
4. Enable **Firebase Authentication** with Email/Password (for admin login)
5. Copy your Firebase config from Project Settings → General → Your apps → Web app
6. Replace the `FIREBASE_CONFIG` object in `app.js` with your config values

Without Firebase configured, the app runs in **local-only mode** using `localStorage`.

### Files
- `index.html`: Main structure.
- `style.css`: Design system and theming.
- `app.js`: Core logic, router, and state management.
