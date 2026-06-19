// POST /api/auth/login { username, password } — checks credentials, starts a session.
import crypto from 'crypto';
import { sign, sessionCookie } from '../../lib/auth.js';

const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body || {};
  const U = process.env.ADMIN_USERNAME;
  const P = process.env.ADMIN_PASSWORD;
  const secret = process.env.SESSION_SECRET;

  if (!U || !P || !secret) {
    return res.status(500).json({ error: 'Server not configured.' });
  }

  const userOk = safeEqual(username || '', U);
  const passOk = safeEqual(password || '', P);
  if (!(userOk && passOk)) {
    return res.status(401).json({ error: 'Incorrect username or password.' });
  }

  const token = sign({ sub: U }, secret, SESSION_MAX_AGE);
  res.setHeader('Set-Cookie', sessionCookie(token, SESSION_MAX_AGE));
  return res.status(200).json({ ok: true });
}
