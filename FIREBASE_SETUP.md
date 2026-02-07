# Firebase Setup Guide for TechR Innovations

This guide walks you through setting up Firebase for the TechR Innovations website. Firebase provides **image storage** (so uploaded photos sync across all devices) and acts as a **sync fallback** when Supabase is unavailable.

---

## Table of Contents

1. [Create a Firebase Project](#step-1-create-a-firebase-project)
2. [Register a Web App & Get Your Config Keys](#step-2-register-a-web-app--get-your-config-keys)
3. [Paste Your Config Keys into app.js](#step-3-paste-your-config-keys-into-appjs)
4. [Enable Firestore Database](#step-4-enable-firestore-database)
5. [Enable Firebase Storage](#step-5-enable-firebase-storage)
6. [Enable Firebase Authentication](#step-6-enable-firebase-authentication)
7. [Set Security Rules](#step-7-set-security-rules)
8. [Test Your Setup](#step-8-test-your-setup)
9. [Troubleshooting](#troubleshooting)

---

## Step 1: Create a Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Create a project"** (or "Add project")
3. Enter a project name (e.g., `techr-innovations`)
4. You can disable Google Analytics (it's not needed for this app)
5. Click **"Create project"** and wait for it to finish
6. Click **"Continue"** when ready

---

## Step 2: Register a Web App & Get Your Config Keys

This is where you get the API keys that go into `app.js`.

1. In your Firebase project dashboard, click the **web icon** (`</>`) to add a web app
   - It's at the top of the Project Overview page, next to the iOS and Android icons
2. Enter an app nickname (e.g., `TechR Website`)
3. You do **NOT** need to set up Firebase Hosting — skip that checkbox
4. Click **"Register app"**
5. Firebase will show you a config block that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD-EXAMPLE-KEY-HERE",
  authDomain: "techr-innovations.firebaseapp.com",
  projectId: "techr-innovations",
  storageBucket: "techr-innovations.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

6. **Copy these values** — you'll need them in the next step

> **💡 Finding your config later:** If you need to find these values again, go to:
> Project Settings (gear icon) → General → scroll down to "Your apps" → look under the web app you registered

---

## Step 3: Paste Your Config Keys into app.js

Open `app.js` and find the `FIREBASE_CONFIG` object near the top of the file (around **line 20**):

```javascript
// Firebase Configuration - Replace with your own Firebase project config
const FIREBASE_CONFIG = {
    apiKey: "YOUR_FIREBASE_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

**Replace each placeholder** with the matching value from Step 2:

| Placeholder | Replace with | Example |
|---|---|---|
| `YOUR_FIREBASE_API_KEY_HERE` | `apiKey` from Firebase | `AIzaSyD-EXAMPLE-KEY-HERE` |
| `YOUR_PROJECT_ID.firebaseapp.com` | `authDomain` from Firebase | `techr-innovations.firebaseapp.com` |
| `YOUR_PROJECT_ID` (projectId) | `projectId` from Firebase | `techr-innovations` |
| `YOUR_PROJECT_ID.appspot.com` | `storageBucket` from Firebase | `techr-innovations.appspot.com` |
| `YOUR_SENDER_ID` | `messagingSenderId` from Firebase | `123456789012` |
| `YOUR_APP_ID` | `appId` from Firebase | `1:123456789012:web:abc123def456` |

After replacing, your config should look like this (with your actual values):

```javascript
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyD-EXAMPLE-KEY-HERE",
    authDomain: "techr-innovations.firebaseapp.com",
    projectId: "techr-innovations",
    storageBucket: "techr-innovations.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123def456"
};
```

> **⚠️ Important:** The `apiKey` must NOT start with `YOUR_` — the app checks for this and will skip Firebase initialization if it sees placeholder values.

---

## Step 4: Enable Firestore Database

Firestore stores your product data and syncs it across all devices in real time.

1. In the Firebase console, go to **Build → Firestore Database** (left sidebar)
2. Click **"Create database"**
3. Choose a location closest to your users (e.g., `us-central1` for US)
4. Select **"Start in test mode"** for now (you'll set proper rules in Step 7)
5. Click **"Create"**

That's it — Firestore is ready. The app will automatically create a `products` collection when you add your first product.

---

## Step 5: Enable Firebase Storage

Firebase Storage is where uploaded product images are saved so they sync across all devices.

1. In the Firebase console, go to **Build → Storage** (left sidebar)
2. Click **"Get started"**
3. Select **"Start in test mode"** for now (you'll set proper rules in Step 7)
4. Choose a storage location (same region as Firestore is fine)
5. Click **"Done"**

Uploaded images will be stored in a `products/` folder automatically.

---

## Step 6: Enable Firebase Authentication

Firebase Auth provides a fallback login when Supabase authentication is unavailable.

1. In the Firebase console, go to **Build → Authentication** (left sidebar)
2. Click **"Get started"**
3. Under **Sign-in method**, click **"Email/Password"**
4. Toggle the **"Enable"** switch on
5. Click **"Save"**

### Create an Admin User

1. Go to the **Users** tab in Authentication
2. Click **"Add user"**
3. Enter your admin email and a strong password
4. Click **"Add user"**

This user can now log in through the TechR Staff Portal.

---

## Step 7: Set Security Rules

Once everything is working, update your security rules for production.

### Firestore Rules

Go to **Firestore Database → Rules** and replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can read products
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Rules

Go to **Storage → Rules** and replace with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{fileName} {
      // Anyone can view product images
      allow read: if true;
      // Only authenticated users can upload (max 5MB images)
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

Click **"Publish"** after updating each set of rules.

---

## Step 8: Test Your Setup

1. Open `index.html` in your browser
2. Open the browser console (F12 → Console tab)
3. You should see: `[TechR] Firebase Online`
   - If you see `[TechR] Firebase Init Failed`, double-check your config values
4. Go to **#admin** → log in → navigate to **#dashboard**
5. The sync banner should show **"Firebase Cloud"** (green) instead of "Local Storage" (orange)
6. Try adding a product with an uploaded image — it should show "Image uploaded to cloud"
7. Open the site in a different browser or device — the product and image should appear there too

---

## Troubleshooting

### "Firebase Init Failed" in console
- Make sure your `FIREBASE_CONFIG` values in `app.js` are correct
- Make sure the `apiKey` does NOT start with `YOUR_`
- Check that you copied all 6 values from Firebase console

### Images upload but don't appear on other devices
- Check that Firebase Storage is enabled (Step 5)
- Check Storage Rules allow reads (Step 7)
- Look for errors in the browser console

### Login says "Database connection unavailable"
- Make sure Authentication is enabled with Email/Password (Step 6)
- Make sure you created a user account in Firebase Auth

### Products don't sync across devices
- Check that Firestore Database is enabled (Step 4)
- Check Firestore Rules allow reads (Step 7)
- Check the sync banner in the admin dashboard — it should say "Firebase Cloud"

### Still showing "Local Storage" in admin dashboard
- The app tries Supabase first, then Firebase, then localStorage
- If Supabase connects successfully, it will show "Supabase Cloud" (that's fine — both work)
- Firebase kicks in when Supabase is unavailable

---

## How the Sync System Works

```
┌─────────────────────────────────────────────┐
│              User opens site                │
│                                             │
│  1. Try Supabase  ──→  ✅ Use Supabase     │
│         │                (primary DB)       │
│         ▼ (fails)                           │
│  2. Try Firebase  ──→  ✅ Use Firebase      │
│         │                (fallback DB +     │
│         │                 image storage)    │
│         ▼ (fails)                           │
│  3. Use localStorage  (offline mode)        │
└─────────────────────────────────────────────┘

Image uploads always use Firebase Storage when available,
regardless of which database is active for product data.
```

---

## Quick Reference: Where Everything Goes

| What | Where | Line |
|---|---|---|
| Firebase API keys | `app.js` → `FIREBASE_CONFIG` object | ~Line 20 |
| Supabase keys | `app.js` → `SUPABASE_URL` and `SUPABASE_KEY` | ~Line 7-8 |
| Stripe keys | `app.js` → `STRIPE_PUBLISHABLE_KEY` | ~Line 37 |
| Firebase SDKs | `index.html` → `<head>` section | Lines 33-36 |
| CSP headers | `index.html` → `<meta>` tag | Line 12-13 |
