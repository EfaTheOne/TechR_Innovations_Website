# TechR Innovations Website

The official site for **TechR Innovations** — built by **Ryan Pegg**. Hardware hacker, PCB designer, maker, and self-taught engineer.

I design and build everything from pen-testing tools to macropads to NFC business cards. This is the website where all my products live.

---

## What I Build

- **Techack** — Cybersecurity hardware. The [Techack1 Pro](https://github.com/EfaTheOne/Techack1) is a portable pen-testing device with a CC1101 module, WiFi, Bluetooth, and USB HID. The [Techack1 MS](https://github.com/EfaTheOne/Techack1MS) is the budget-friendly version. The [TechBot4](https://github.com/EfaTheOne/TechBot4) is an ESP32-based Marauder-compatible tool with a 2.0" IPS display.
- **TechBox** — STEM education kits. The [Tech_Pad Macropad](https://github.com/EfaTheOne/Tech_Pad1) is a DIY 6-key macropad with NeoPixels and a Seeed XIAO RP2040. The [NFC Hacker Card](https://github.com/EfaTheOne/NFC_Hacker_card) is a custom PCB business card with embedded NFC.
- **Rithim** — Casual streetwear and apparel.
- **StudyTech** — AI-powered learning tools for students and schools.

---

## How It Works

This is a **bare metal** site — vanilla HTML, CSS, and JavaScript. No frameworks, no build tools. Just open `index.html`.

All product data and images sync through **Supabase** (database + storage + auth). If Supabase isn't configured, it falls back to localStorage so everything still works offline.

---

## Supabase Setup

This is how you connect the site to Supabase so products, images, and logins sync across all devices.

### 1. Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project
2. Go to **Settings → API**
3. Copy your **Project URL** and **anon/public key** (the long JWT starting with `eyJ`)

### 2. Paste Your Keys into app.js

Open `app.js` and find the config at the top:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

Replace those with your actual values.

### 3. Create the Products Table

Go to **SQL Editor** in your Supabase dashboard and run:

```sql
CREATE TABLE products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image TEXT,
  images TEXT[],
  colors TEXT[],
  category TEXT NOT NULL,
  "desc" TEXT,
  status TEXT DEFAULT 'active'
);

-- Allow anyone to read products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON products FOR SELECT USING (true);
CREATE POLICY "Auth write" ON products FOR ALL USING (auth.role() = 'authenticated');
```

### 4. Set Up Storage (for Image Uploads)

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `products` and set it to **Public**
3. Go to **Storage → Policies** and add:
   - **SELECT** (public read): Allow all users to read
   - **INSERT/UPDATE/DELETE** (authenticated): Only logged-in users can upload

### 5. Set Up Authentication

1. Go to **Authentication → Providers**
2. Make sure **Email** is enabled
3. Go to **Authentication → Users** and click **Add User**
4. Enter your admin email and password — this is what you use to log into the Staff Portal

### 6. Enable Realtime

1. Go to **Database → Replication**
2. Enable replication for the `products` table

This lets the site automatically update in real-time when products change.

---

## Adding Products

Once Supabase is connected, go to `#admin` on the site, log in, then go to `#dashboard`. From there you can:

- **Add products** — Click "Add Product", fill in the name/price/category/description/image, and save. It syncs to Supabase automatically.
- **Upload images** — Drag or select an image file. It uploads to Supabase Storage and the URL is saved with the product.
- **Edit/delete products** — Click on any product in the dashboard to edit or remove it.
- **Import/export** — Export products as CSV or JSON, or import from a JSON file.
- **Reset to defaults** — Restores the 12 original products.

You can also add products directly in the Supabase dashboard (Table Editor → products → Insert Row).

---

## Files

| File | What it does |
|------|-------------|
| `index.html` | Page structure, nav, footer, CDN scripts |
| `style.css` | Full design system — colors, layout, animations |
| `app.js` | Everything else — routing, state, admin dashboard, Supabase sync, Stripe checkout |

---

## My GitHub Projects

| Project | What it is |
|---------|-----------|
| [Techack1](https://github.com/EfaTheOne/Techack1) | Portable pen-testing device — CC1101, WiFi, Bluetooth, USB HID |
| [Techack1 MS](https://github.com/EfaTheOne/Techack1MS) | Budget version of the Techack1 |
| [TechackProtoM1](https://github.com/EfaTheOne/TechackProtoM1) | Techack prototype board |
| [TechBot4](https://github.com/EfaTheOne/TechBot4) | ESP32 Marauder-compatible tool with IPS display |
| [Tech_Pad1](https://github.com/EfaTheOne/Tech_Pad1) | DIY macropad — 6 keys, NeoPixels, XIAO RP2040 |
| [NFC Hacker Card](https://github.com/EfaTheOne/NFC_Hacker_card) | Custom NFC PCB business card |
| [Engineroom](https://github.com/EfaTheOne/Engineroom) | Project workspace |
| [BioMistDragons](https://github.com/EfaTheOne/BioMistDragons) | Side project |
| [MarauderCheck](https://github.com/EfaTheOne/MarauderCheck) | Marauder testing |

---

© 2026 TechR Innovations — Ryan Pegg
