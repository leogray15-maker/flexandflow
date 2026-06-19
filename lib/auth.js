// Lightweight, dependency-free session + one-time-code helpers.
// Sessions are stateless signed tokens (HMAC-SHA256) stored in an httpOnly cookie.
import crypto from 'crypto';

export const COOKIE_NAME = 'ff_session';

// ---- Signed token (mini-JWT) ----
export function sign(payload, secret, maxAgeSec) {
  const body = { ...payload, exp: Math.floor(Date.now() / 1000) + maxAgeSec };
  const data = base64url(JSON.stringify(body));
  return `${data}.${hmac(data, secret)}`;
}

export function verifyToken(token, secret) {
  if (!token || !token.includes('.')) return null;
  const [data, sig] = token.split('.');
  const expected = hmac(data, secret);
  if (!timingSafeEqual(sig, expected)) return null;
  let body;
  try {
    body = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!body.exp || body.exp < Math.floor(Date.now() / 1000)) return null;
  return body;
}

function hmac(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
}
function base64url(s) {
  return Buffer.from(s).toString('base64url');
}
function timingSafeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

// ---- One-time codes ----
export function genCode() {
  return String(crypto.randomInt(100000, 1000000)); // always 6 digits
}
export function hashCode(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex');
}

// ---- Cookies ----
export function getCookie(req, name) {
  const header = req.headers?.cookie || '';
  const part = header.split(/;\s*/).find((c) => c.startsWith(name + '='));
  return part ? decodeURIComponent(part.slice(name.length + 1)) : null;
}
export function sessionCookie(token, maxAgeSec) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAgeSec}`;
}
export function clearCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

// ---- Guard ----
export function requireAuth(req) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  return verifyToken(getCookie(req, COOKIE_NAME), secret);
}
