// api/members.js — Admin: list all members (protected by ADMIN_SECRET env var)

const { getDb } = require('../lib/db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── Auth check ──
  const authHeader = req.headers['authorization'] || '';
  const token      = authHeader.replace('Bearer ', '');
  if (!process.env.ADMIN_SECRET || token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const db      = await getDb();
    const members = db.collection('members');

    // GET — list all members
    if (req.method === 'GET') {
      const { status, page = 1, limit = 50 } = req.query;
      const filter = status ? { status } : {};
      const total  = await members.countDocuments(filter);
      const list   = await members
        .find(filter, { projection: { _id: 0, motivation: 0 } })
        .sort({ joinedAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .toArray();

      return res.status(200).json({ total, page: Number(page), members: list });
    }

    // PATCH — approve or reject a member
    if (req.method === 'PATCH') {
      const { memberId, status } = req.body;
      if (!memberId || !['approved', 'rejected', 'pending'].includes(status)) {
        return res.status(400).json({ error: 'memberId and valid status required.' });
      }

      const result = await members.findOneAndUpdate(
        { memberId },
        {
          $set: {
            status,
            approvedAt: status === 'approved' ? new Date() : null,
          },
        },
        { returnDocument: 'after' }
      );

      if (!result) return res.status(404).json({ error: 'Member not found.' });
      return res.status(200).json({ success: true, member: result });
    }

    return res.status(405).json({ error: 'Method not allowed.' });

  } catch (err) {
    console.error('Members API error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
};
