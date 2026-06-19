// GET /api/auth/me — quick session check for the dashboard.
import { requireAuth } from '../../lib/auth.js';

export default async function handler(req, res) {
  return res.status(200).json({ authenticated: Boolean(requireAuth(req)) });
}
