// POST /api/auth/verify { code } — checks the code and sets a session cookie.
import { getDb } from '../../lib/firebase.js';
import { hashCode, sign, sessionCookie } from '../../lib/auth.js';

const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const MAX_ATTEMPTS = 5;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const code = String((req.body || {}).code || '').trim();
  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'Enter the 6-digit code.' });
  }

  const secret = process.env.SESSION_SECRET;
  if (!secret) return res.status(500).json({ error: 'Server not configured.' });

  try {
    const db = getDb();
    const ref = db.collection('auth_codes').doc('login');
    const snap = await ref.get();

    if (!snap.exists) {
      return res.status(400).json({ error: 'No active code. Request a new one.' });
    }
    const d = snap.data();

    if (Date.now() > d.expiresAt) {
      await ref.delete();
      return res.status(400).json({ error: 'Code expired. Request a new one.' });
    }
    if ((d.attempts || 0) >= MAX_ATTEMPTS) {
      await ref.delete();
      return res.status(429).json({ error: 'Too many attempts. Request a new code.' });
    }
    if (d.codeHash !== hashCode(code)) {
      await ref.update({ attempts: (d.attempts || 0) + 1 });
      return res.status(401).json({ error: 'Incorrect code.' });
    }

    await ref.delete();
    const token = sign({ sub: 'kenna' }, secret, SESSION_MAX_AGE);
    res.setHeader('Set-Cookie', sessionCookie(token, SESSION_MAX_AGE));
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Could not verify the code.' });
  }
}
