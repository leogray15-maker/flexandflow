// POST /api/contact — PUBLIC. Saves an enquiry and pings Telegram.
import { getDb } from '../lib/firebase.js';
import { sendTelegram, escapeMd } from '../lib/telegram.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const data = req.body || {};

  // Honeypot — bots fill hidden fields; humans never see this one.
  if (data.company) return res.status(200).json({ ok: true });

  const name = String(data.name || '').trim();
  const email = String(data.email || '').trim();
  const message = String(data.message || '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please fill in all fields.' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (name.length > 120 || email.length > 200 || message.length > 5000) {
    return res.status(400).json({ error: 'That message is a little too long.' });
  }

  try {
    const db = getDb();
    await db.collection('messages').add({
      name,
      email,
      message,
      status: 'new',
      createdAt: new Date().toISOString(),
    });
  } catch (e) {
    return res.status(500).json({ error: 'Could not save your message. Please try again.' });
  }

  // Awaited (not background) so it reliably fires before the function freezes.
  await sendTelegram(
    '🧘 *New Flex & Flow enquiry*\n\n' +
      `👤 *${escapeMd(name)}*\n` +
      `✉️ ${escapeMd(email)}\n\n` +
      `💬 ${escapeMd(message)}`
  );

  return res.status(200).json({ ok: true });
}
