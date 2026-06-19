// PATCH  /api/messages/:id — update status (new | contacted | archived)
// DELETE /api/messages/:id — remove an enquiry
// PROTECTED.
import { getDb } from '../../lib/firebase.js';
import { requireAuth } from '../../lib/auth.js';

const ALLOWED = ['new', 'contacted', 'archived'];

export default async function handler(req, res) {
  if (!requireAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const id = req.query.id;
  if (!id) return res.status(400).json({ error: 'Bad id.' });

  const db = getDb();
  const ref = db.collection('messages').doc(String(id));

  if (req.method === 'PATCH') {
    const status = (req.body || {}).status;
    if (!ALLOWED.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
    try {
      await ref.update({ status });
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(404).json({ error: 'Message not found.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await ref.delete();
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'Could not delete message.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
