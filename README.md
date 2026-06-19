# Flex & Flow — Pilates & Yoga Studio

A modern website for **Flex & Flow** with a contact form, Telegram alerts and a
private CRM dashboard — all on free hosting.

➡️ **To get it live, follow [SETUP.md](./SETUP.md).**

## What's included
- **Public website** (`index.html`) — responsive single-page site: hero, classes,
  about, pricing, new-client offers and a contact form.
- **Contact backend** (`/api/contact`) — saves enquiries to Firestore and sends a
  **Telegram text** to Kenna on every message.
- **CRM dashboard** (`/admin`) — a mini CRM to read, search, mark
  (new / contacted / archived), reply to and delete enquiries.
- **Username & password login** — Kenna signs in with credentials stored as
  Vercel environment variables (no secrets in the repo).

## Tech (all free tiers)
| Piece | Used for |
|-------|----------|
| **Vercel** | Hosting the site + serverless functions (`/api`) |
| **Firebase / Firestore** | Storing messages |
| **Telegram Bot API** | New-message alerts to Kenna |

No build step for the frontend; the only dependency is `firebase-admin` (installed
automatically by Vercel).

## Project structure
```
index.html, styles.css, script.js   → public website
admin/                               → CRM dashboard (index.html + app.js)
api/
  contact.js                         → POST public: save message + Telegram alert
  messages.js                        → GET  protected: list enquiries
  messages/[id].js                   → PATCH/DELETE protected: status / remove
  auth/login.js                      → check username/password, start session
  auth/logout.js, auth/me.js         → session helpers
lib/                                 → firebase, telegram, auth helpers
SETUP.md                             → step-by-step deployment guide
```

## Local development (optional)
```bash
npm install
npm i -g vercel      # one time
vercel dev           # runs site + functions locally (needs the env vars from SETUP.md)
```

## Customising
- **Text & prices** — edit `index.html`.
- **Colours & fonts** — the CSS variables at the top of `styles.css` (and in
  `admin/index.html`).
- **Photos** — currently Unsplash URLs; swap in Kenna's own studio photos before
  going live (self-hosting them in an `/images` folder is recommended).
