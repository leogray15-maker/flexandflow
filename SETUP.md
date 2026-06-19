# Flex & Flow — Setup Guide

This gets the website **live on Vercel** with:
- a contact form that saves enquiries to **Firebase (Firestore)**,
- a **Telegram text** to Kenna for every new message,
- a private **CRM dashboard** at `/admin` she logs into with a Telegram code.

Everything below is on a **free** plan. No credit card required.
Set aside ~20–30 minutes. Do the steps in order.

---

## What you'll end up with
| Page | URL | Who |
|------|-----|-----|
| Website | `https://your-site.vercel.app/` | Everyone |
| CRM dashboard | `https://your-site.vercel.app/admin` | Kenna (login required) |

You'll create **4 secrets** along the way. Keep them handy — you paste them into
Vercel at the end:

```
FIREBASE_SERVICE_ACCOUNT   (a JSON blob from Firebase)
TELEGRAM_BOT_TOKEN         (from Telegram's BotFather)
TELEGRAM_CHAT_ID           (Kenna's Telegram chat id)
SESSION_SECRET             (any long random string you make up)
```

---

## 1. Firebase (the database) 🔥

1. Go to <https://console.firebase.google.com> and **Add a project**
   (name it e.g. `flex-and-flow`). You can skip Google Analytics.
2. In the left menu open **Build → Firestore Database → Create database**.
   - Choose **Production mode**, pick a location near the UK
     (e.g. `europe-west2`), and click Enable.
3. Get the service account key (this is how the website talks to the database):
   - Click the **⚙️ gear → Project settings → Service accounts** tab.
   - Click **Generate new private key** → **Generate key**. A `.json` file downloads.
   - Open that file in any text editor and copy **everything** (the whole JSON,
     from `{` to `}`). This is your **`FIREBASE_SERVICE_ACCOUNT`** value.

> The app creates the `messages` and `auth_codes` collections automatically —
> you don't need to set anything else up in Firestore.

---

## 2. Telegram (the alerts + login codes) 💬

You need a **bot token** and a **chat id**.

**Create the bot:**
1. In Telegram, search for **@BotFather** and open the chat.
2. Send `/newbot`, give it a name (e.g. `Flex & Flow`) and a username
   ending in `bot` (e.g. `flexandflow_alerts_bot`).
3. BotFather replies with a token like `123456:ABC-DEF...`.
   That's your **`TELEGRAM_BOT_TOKEN`**.

**Get the chat id (so the bot knows who to text):**
1. On Kenna's phone, open the new bot and tap **Start** / send it any message
   (e.g. "hi"). *This step is essential — the bot can't message her until she
   messages it first.*
2. In a browser, visit (paste your token in):
   `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
3. Find `"chat":{"id":123456789` in the response. That number is your
   **`TELEGRAM_CHAT_ID`**.

> Want the alerts to go to a group instead? Add the bot to the group, send a
> message there, and use the group's (negative) chat id.

---

## 3. SESSION_SECRET (login security) 🔑

Just make up a long random string — 30+ random characters. For example, run this
in a terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output. That's your **`SESSION_SECRET`**.

---

## 4. Deploy to Vercel ▲

1. Push this repo to GitHub (already done if you're reading this on GitHub).
2. Go to <https://vercel.com> → sign up / log in with GitHub (free **Hobby** plan).
3. **Add New… → Project → Import** this repository.
4. Leave the framework as **Other** — no build command needed; it's a static site
   with serverless functions.
5. Before clicking Deploy, open **Environment Variables** and add all four:

   | Name | Value |
   |------|-------|
   | `FIREBASE_SERVICE_ACCOUNT` | the whole JSON from step 1 |
   | `TELEGRAM_BOT_TOKEN` | from step 2 |
   | `TELEGRAM_CHAT_ID` | from step 2 |
   | `SESSION_SECRET` | from step 3 |

6. Click **Deploy**. After a minute you'll get a live URL.

> If you add env vars *after* the first deploy, go to
> **Settings → Environment Variables**, add them, then **Redeploy**.

---

## 5. Test it ✅

1. Open your live site, scroll to **Contact**, send a test message.
   - Kenna's Telegram should ping within a few seconds. 🎉
2. Go to `https://your-site.vercel.app/admin`.
   - Click **Send me a login code** → a code arrives on Telegram.
   - Enter it → you're in the CRM and can see the test message.
3. In the CRM, try **Mark contacted**, **Archive**, **Reply** and **Delete**.

---

## Using the CRM day to day
- **New** = unread enquiries (orange). **Contacted** = you've replied.
  **Archived** = done/old.
- **Reply** opens Kenna's email app pre-addressed to the visitor.
- Use the search box and the **All / New / Contacted / Archived** tabs to filter.
- The login lasts 30 days on that device, then asks for a new code.

## Troubleshooting
- **No Telegram message?** Make sure Kenna pressed **Start** on the bot (step 2.1),
  and that `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` are correct in Vercel.
- **Can't log in / "Could not send the code"?** Same as above — it uses the same bot.
- **Form says "Could not save"?** Check `FIREBASE_SERVICE_ACCOUNT` is the full,
  valid JSON and Firestore is enabled, then redeploy.
- After changing any environment variable you must **Redeploy** for it to take effect.
