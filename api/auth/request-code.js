// POST /api/auth/request-code — generates a 6-digit code and Telegrams it to Kenna.
import { getDb } from '../../lib/firebase.js';
import { sendTelegram } from '../../lib/telegram.js';
import { genCode, hashCode } from '../../lib/auth.js';

const RESEND_WINDOW_MS = 60 * 1000; // one code per minute
const CODE_TTL_MS = 5 * 60 * 1000; // valid for 5 minutes

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const db = getDb();
    const ref = db.collection('auth_codes').doc('login');
    const now = Date.now();

    const snap = await ref.get();
    if (snap.exists) {
      const d = snap.data();
      if (d.lastSentAt && now - d.lastSentAt < RESEND_WINDOW_MS) {
        return res
          .status(429)
          .json({ error: 'Please wait a minute before requesting another code.' });
      }
    }

    const code = genCode();
    await ref.set({
      codeHash: hashCode(code),
      expiresAt: now + CODE_TTL_MS,
      lastSentAt: now,
      attempts: 0,
    });

    const ok = await sendTelegram(
      '🔐 *Flex & Flow login code*\n\n' +
        `Your code is: *${code}*\n\n` +
        "Expires in 5 minutes. If you didn't request this, ignore it."
    );
    if (!ok) {
      return res
        .status(500)
        .json({ error: 'Could not send the code. Check the Telegram setup.' });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Could not start login.' });
  }
}
