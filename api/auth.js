// api/auth.js — Member Sign-In: validate email + Member ID against MongoDB

const { getDb } = require('../lib/db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'Method not allowed' });

  const { email, memberId } = req.body;

  if (!email || !memberId) {
    return res.status(400).json({ error: 'Email and Member ID are required.' });
  }

  try {
    const db      = await getDb();
    const members = db.collection('members');

    const member = await members.findOne({
      email:    email.trim().toLowerCase(),
      memberId: memberId.trim().toUpperCase(),
    });

    if (!member) {
      return res.status(401).json({
        success: false,
        error:   'Invalid email or Member ID. Please check your credentials.',
      });
    }

    if (member.status === 'rejected') {
      return res.status(403).json({
        success: false,
        error:   'Your application was not approved. Contact supportaeac@gmail.com.',
      });
    }

    return res.status(200).json({
      success:    true,
      name:       member.name,
      memberId:   member.memberId,
      department: member.department,
      status:     member.status,
    });

  } catch (err) {
    console.error('Auth API error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
};
