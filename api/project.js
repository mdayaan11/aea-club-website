// api/project.js — Project Submission Handler
const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { memberEmail, title, domain, seats, description, skills } = req.body;

  if (!memberEmail || !title || !domain || !seats || !description) {
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
      subject: `📁 New Project Proposal — ${title}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#f0f4ff;padding:32px;border-radius:16px;">
          <h2 style="color:#6C5CE7;margin-bottom:4px;">New Project Submission</h2>
          <p style="color:#8896AB;margin-top:0;">Submitted by member: <strong style="color:#1A1A2E;">${memberEmail}</strong></p>
          <table style="width:100%;border-collapse:collapse;margin-top:20px;">
            <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#8896AB;width:140px;">Title</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-weight:700;color:#1A1A2E;">${title}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#8896AB;">Domain</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#1A1A2E;">${domain}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#8896AB;">Seats needed</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#1A1A2E;">${seats}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#8896AB;">Skills required</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#1A1A2E;">${skills || '—'}</td></tr>
            <tr><td style="padding:10px 0;color:#8896AB;vertical-align:top;">Description</td><td style="padding:10px 0;color:#1A1A2E;">${description}</td></tr>
          </table>
          <p style="margin-top:20px;color:#8896AB;font-size:0.85rem;">Reply to this email or contact the member at <strong>${memberEmail}</strong> to approve and publish.</p>
        </div>
      `,
    });

    // ── Confirm to member ──
    await transporter.sendMail({
      from: `"AEA Club" <${process.env.GMAIL_USER}>`,
      to: memberEmail,
      subject: `✅ Project Proposal Received — ${title}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#f0f4ff;padding:32px;border-radius:16px;">
          <h2 style="color:#6C5CE7;">Proposal Submitted!</h2>
          <p style="color:#4A5568;">Your project <strong>"${title}"</strong> has been submitted for board review. We'll notify you once it is approved and listed on the AEA Club Projects page.</p>
          <div style="margin-top:24px;padding:16px;background:#fff;border-radius:12px;border-left:4px solid #6C5CE7;">
            <p style="margin:0;color:#8896AB;font-size:0.85rem;">Questions? Email us at <a href="mailto:supportaeac@gmail.com" style="color:#6C5CE7;">supportaeac@gmail.com</a></p>
          </div>
          <p style="margin-top:24px;color:#8896AB;font-size:0.85rem;">— The AEA Club Team · Siliguri, West Bengal</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Project API error:', err);
    return res.status(500).json({ error: 'Failed to submit. Please try again.' });
  }
};
