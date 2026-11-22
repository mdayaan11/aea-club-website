// api/join.js
// 1. Validate input
// 2. Save member to MongoDB + generate Member ID  (always happens)
// 3. Try to send emails                           (non-blocking — won't fail the response)

const nodemailer = require('nodemailer');
const { getDb }  = require('../lib/db');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  /* ── 1. Validate ── */
  const { name, email, department, year, motivation } = req.body || {};

  if (!name || !email || !department || !year)
    return res.status(400).json({ error: 'Please fill in all required fields.' });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: 'Please enter a valid email address.' });

  /* ── 2. Database ── */
  let db;
  try {
    db = await getDb();
  } catch (dbErr) {
    console.error('DB connect error:', dbErr.message);
    return res.status(503).json({
      error: 'Database temporarily unavailable. Please try again in a moment.',
    });
  }

  const members  = db.collection('members');
  const counters = db.collection('counters');

  // Duplicate check
  try {
    const existing = await members.findOne(
      { email: email.trim().toLowerCase() },
      { projection: { memberId: 1 } }
    );
    if (existing) {
      return res.status(409).json({
        error: `This email is already registered. Your Member ID is: ${existing.memberId}`,
      });
    }
  } catch (err) {
    console.error('Duplicate check error:', err.message);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }

  // Generate sequential Member ID
  const year_ = new Date().getFullYear();
  let seq;
  try {
    const counter = await counters.findOneAndUpdate(
      { _id: `member_${year_}` },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: 'after' }
    );
    seq = counter.seq;
  } catch (err) {
    console.error('Counter error:', err.message);
    return res.status(500).json({ error: 'Server error generating Member ID. Please try again.' });
  }

  const memberId = `AEA-${year_}-${String(seq).padStart(4, '0')}`;

  // Insert member — auto-approved on registration
  const now = new Date();
  const memberDoc = {
    memberId,
    name:       name.trim(),
    email:      email.trim().toLowerCase(),
    department,
    year,
    motivation: motivation || '',
    status:     'approved',
    joinedAt:   now,
    approvedAt: now,
  };

  try {
    await members.insertOne(memberDoc);
  } catch (err) {
    console.error('Insert error:', err.message);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    return res.status(500).json({ error: 'Failed to save your application. Please try again.' });
  }

  /* ── 3. Respond immediately — DB save succeeded ── */
  res.status(200).json({ success: true, memberId });

  /* ── 4. Send emails after response (non-blocking) ── */
  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.log('Email env vars missing — skipping email for', memberId);
    return;
  }

  const year_str = new Date().getFullYear();

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
      connectionTimeout: 8000,
      greetingTimeout:   8000,
      socketTimeout:     10000,
    });

    // Team notification
    transporter.sendMail({
      from:    `"AEA Club" <${process.env.GMAIL_USER}>`,
      to:      'aeacsupport@gmail.com',
      subject: `📋 New Application — ${name} (${memberId})`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#f5f0e8;padding:32px;border-radius:8px;">
          <h2 style="color:#c94b2b;margin-bottom:4px;">New Membership Application</h2>
          <p style="color:#7a7268;margin-top:0;font-size:0.9rem;">Member ID: <strong style="color:#1a1812;">${memberId}</strong></p>
          <table style="width:100%;border-collapse:collapse;margin-top:20px;background:#fff;border-radius:6px;overflow:hidden;">
            <tr><td style="padding:12px 16px;color:#7a7268;border-bottom:1px solid #eee;width:130px;">Name</td><td style="padding:12px 16px;font-weight:700;border-bottom:1px solid #eee;">${name}</td></tr>
            <tr><td style="padding:12px 16px;color:#7a7268;border-bottom:1px solid #eee;">Email</td><td style="padding:12px 16px;border-bottom:1px solid #eee;">${email}</td></tr>
            <tr><td style="padding:12px 16px;color:#7a7268;border-bottom:1px solid #eee;">Department</td><td style="padding:12px 16px;border-bottom:1px solid #eee;">${department}</td></tr>
            <tr><td style="padding:12px 16px;color:#7a7268;border-bottom:1px solid #eee;">Year</td><td style="padding:12px 16px;border-bottom:1px solid #eee;">${year}</td></tr>
            <tr><td style="padding:12px 16px;color:#7a7268;vertical-align:top;">Motivation</td><td style="padding:12px 16px;">${motivation || '—'}</td></tr>
          </table>
        </div>`,
    }).catch(e => console.warn('Team email failed:', e.message));

    // Confirmation email to applicant
    transporter.sendMail({
      from:    `"AEA Club" <${process.env.GMAIL_USER}>`,
      replyTo: 'aeacsupport@gmail.com',
      to:      email,
      subject: `🎉 Welcome to AEA Club — Your Member ID: ${memberId}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#1a1812;color:#eee9df;padding:40px;border-radius:8px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:28px;">
            <div style="display:flex;gap:4px;align-items:flex-end;">
              <span style="display:block;width:6px;height:20px;background:#c94b2b;border-radius:2px;"></span>
              <span style="display:block;width:6px;height:13px;background:#c94b2b;border-radius:2px;"></span>
              <span style="display:block;width:6px;height:20px;background:#c94b2b;border-radius:2px;"></span>
            </div>
            <span style="font-size:1.1rem;font-weight:900;letter-spacing:0.04em;">AEA<span style="opacity:0.4;">CLUB</span></span>
          </div>

          <h2 style="color:#e8614a;margin:0 0 6px;font-size:1.6rem;">Welcome to AEA! 🎉</h2>
          <p style="color:rgba(238,233,223,0.5);margin:0 0 24px;font-size:0.85rem;">All Engineers Association Club — Voice of Engineers</p>

          <p style="margin:0 0 16px;">Hi <strong>${name}</strong>,</p>
          <p style="color:rgba(238,233,223,0.75);line-height:1.7;margin:0 0 24px;">
            You are now an <strong style="color:#e8614a;">official member</strong> of AEA Club. Your membership has been confirmed. Here is your unique Member ID:
          </p>

          <div style="margin:0 0 28px;padding:28px 24px;background:rgba(201,75,43,0.12);border:1.5px solid rgba(201,75,43,0.35);border-radius:6px;text-align:center;">
            <p style="margin:0 0 10px;font-size:0.68rem;letter-spacing:0.2em;color:rgba(238,233,223,0.35);">YOUR MEMBER ID</p>
            <p style="margin:0;font-size:2.4rem;font-weight:900;letter-spacing:0.1em;color:#e8614a;line-height:1;">${memberId}</p>
            <p style="margin:12px 0 0;font-size:0.74rem;color:rgba(238,233,223,0.35);">Save this — you need it to sign in to the members area.</p>
          </div>

          <table style="width:100%;font-size:0.84rem;border-collapse:collapse;margin-bottom:28px;">
            <tr><td style="padding:9px 0;color:rgba(238,233,223,0.4);width:120px;border-bottom:1px solid rgba(255,255,255,0.06);">Name</td><td style="color:#eee9df;border-bottom:1px solid rgba(255,255,255,0.06);">${name}</td></tr>
            <tr><td style="padding:9px 0;color:rgba(238,233,223,0.4);border-bottom:1px solid rgba(255,255,255,0.06);">Department</td><td style="color:#eee9df;border-bottom:1px solid rgba(255,255,255,0.06);">${department}</td></tr>
            <tr><td style="padding:9px 0;color:rgba(238,233,223,0.4);border-bottom:1px solid rgba(255,255,255,0.06);">Year</td><td style="color:#eee9df;border-bottom:1px solid rgba(255,255,255,0.06);">${year}</td></tr>
            <tr><td style="padding:9px 0;color:rgba(238,233,223,0.4);">Status</td><td style="color:#25D366;font-weight:700;">✓ Approved</td></tr>
          </table>

          <a href="https://chat.whatsapp.com/GXeU4KvBVwX89RxCLUNIZD" style="display:block;padding:14px 20px;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;text-decoration:none;border-radius:4px;text-align:center;font-weight:700;font-size:0.95rem;margin-bottom:28px;">
            📱 Join our WhatsApp Community →
          </a>

          <div style="padding-top:20px;border-top:1px solid rgba(238,233,223,0.08);">
            <p style="font-size:0.76rem;color:rgba(238,233,223,0.3);margin:0 0 4px;">Questions? Reply to this email or write to <a href="mailto:aeacsupport@gmail.com" style="color:#e8614a;">aeacsupport@gmail.com</a></p>
            <p style="font-size:0.76rem;color:rgba(238,233,223,0.25);margin:0;">AEA Club · Siliguri, West Bengal · © ${year_str}</p>
          </div>
        </div>`,
    }).catch(e => console.warn('Applicant email failed:', e.message));

  } catch (mailErr) {
    console.warn('Email setup failed (non-fatal):', mailErr.message);
  }
};
