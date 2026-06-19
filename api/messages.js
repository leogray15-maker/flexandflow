// GET /api/messages — PROTECTED. Lists all enquiries for the CRM.
import { getDb } from '../lib/firebase.js';
import { requireAuth } from '../lib/auth.js';

export default async function handler(req, res) {
  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const db = getDb();
    const snap = await db.collection('messages').orderBy('createdAt', 'desc').get();
    const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.status(200).json({ messages });
  } catch (e) {
    return res.status(500).json({ error: 'Could not load messages.' });
  }
}
