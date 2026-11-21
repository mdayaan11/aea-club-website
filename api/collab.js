// api/collab.js — Project Collaboration Registration Handler
const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, branch, year, skills, why, project } = req.body;

  if (!name || !email || !branch || !year || !skills || !project) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // ── Notify AEA Club team ──
    await transporter.sendMail({
      from: `"AEA Club Website" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `🤝 New Collaboration Request — ${project} (${name})`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#f0f4ff;padding:32px;border-radius:16px;">
          <h2 style="color:#00B4D8;margin-bottom:4px;">New Collaboration Registration</h2>
          <p style="color:#8896AB;margin-top:0;">Project: <strong style="color:#1A1A2E;">${project}</strong></p>
          <table style="width:100%;border-collapse:collapse;margin-top:20px;">
            <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#8896AB;width:140px;">Name</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-weight:600;color:#1A1A2E;">${name}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#8896AB;">Email</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-weight:600;color:#1A1A2E;">${email}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#8896AB;">Branch</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#1A1A2E;">${branch}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#8896AB;">Year</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#1A1A2E;">${year}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#8896AB;">Skills</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#1A1A2E;">${skills}</td></tr>
            <tr><td style="padding:10px 0;color:#8896AB;vertical-align:top;">Motivation</td><td style="padding:10px 0;color:#1A1A2E;">${why || '—'}</td></tr>
          </table>
        </div>
      `,
    });

    // ── Confirm to applicant ──
    await transporter.sendMail({
      from: `"AEA Club" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `✅ Collaboration Application Received — ${project}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#f0f4ff;padding:32px;border-radius:16px;">
          <h2 style="color:#00B4D8;">Application Received!</h2>
          <p style="color:#4A5568;">Hi <strong>${name}</strong>,</p>
          <p style="color:#4A5568;">We've received your collaboration request for <strong>${project}</strong>. The AEA Club project lead will review your profile and skills, and get back to you shortly.</p>
          <div style="margin-top:24px;padding:16px;background:#fff;border-radius:12px;border-left:4px solid #00B4D8;">
            <p style="margin:0;color:#8896AB;font-size:0.85rem;">Questions? Email us at <a href="mailto:supportaeac@gmail.com" style="color:#6C5CE7;">supportaeac@gmail.com</a></p>
          </div>
          <p style="margin-top:24px;color:#8896AB;font-size:0.85rem;">— The AEA Club Team · Siliguri, West Bengal</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Collab API error:', err);
    return res.status(500).json({ error: 'Failed to send. Please try again.' });
  }
};
