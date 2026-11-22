/**
 * AEA CLUB — Bulk Email Sender
 * Fetches all member emails from MongoDB and sends a registration
 * reminder/recruitment email to each one.
 *
 * Usage:
 *   node send-bulk-email.js
 *
 * Requirements:
 *   Set GMAIL_USER and GMAIL_PASS (App Password) below
 */

const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');

/* ── CONFIG — fill these in ── */
const MONGODB_URI = 'mongodb+srv://mdayansh30090_db_user:haT1RJp75xEoQaR3@ayaan.a6ouyjo.mongodb.net/aeaclub?retryWrites=true&w=majority';
const GMAIL_USER  = 'aeacsupport@gmail.com';
const GMAIL_PASS  = 'YOUR_16_CHAR_APP_PASSWORD'; // ← replace with App Password
const REGISTER_URL = 'https://aea-club-website.vercel.app/#join';
const WHATSAPP_URL  = 'https://chat.whatsapp.com/GXeU4KvBVwX89RxCLUNIZD';
const DELAY_MS     = 1500; // delay between emails (avoid Gmail rate limit)

/* ── Delay helper ── */
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ── Email HTML template ── */
function buildEmail(name) {
  const firstName = name ? name.split(' ')[0] : 'Engineer';
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0ebe0;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#1a1812;border-radius:10px;overflow:hidden;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#14213D,#1e2d4a);padding:36px 40px 28px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;">
        <div style="display:flex;gap:4px;align-items:flex-end;">
          <span style="display:inline-block;width:7px;height:22px;background:#c94b2b;border-radius:2px;"></span>
          <span style="display:inline-block;width:7px;height:14px;background:#c94b2b;border-radius:2px;"></span>
          <span style="display:inline-block;width:7px;height:22px;background:#c94b2b;border-radius:2px;"></span>
        </div>
        <span style="color:#eee9df;font-size:1.15rem;font-weight:900;letter-spacing:0.06em;">AEA<span style="opacity:0.45;">CLUB</span></span>
      </div>
      <h1 style="color:#eee9df;margin:0;font-size:1.7rem;font-weight:900;line-height:1.2;">
        Your friends are<br><span style="color:#e8614a;">waiting for you</span> to join. 🚀
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:32px 40px;color:#eee9df;">
      <p style="margin:0 0 20px;font-size:1rem;line-height:1.7;">
        Hi <strong>${firstName}</strong>,
      </p>
      <p style="margin:0 0 20px;color:rgba(238,233,223,0.75);line-height:1.8;">
        You're part of the <strong style="color:#eee9df;">AEA Club WhatsApp community</strong> — but
        did you know we now have an <strong style="color:#e8614a;">official membership portal</strong>?
      </p>
      <p style="margin:0 0 28px;color:rgba(238,233,223,0.75);line-height:1.8;">
        Register now to get your <strong style="color:#e8614a;">official Member ID</strong>, be part of
        the core directory, and unlock access to club events, projects, and workshops.
      </p>

      <!-- Benefits -->
      <div style="background:rgba(255,255,255,0.04);border-radius:8px;padding:20px 24px;margin-bottom:28px;">
        <p style="margin:0 0 14px;font-size:0.78rem;letter-spacing:0.14em;color:rgba(238,233,223,0.4);text-transform:uppercase;">What you get</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:7px 0;color:rgba(238,233,223,0.75);">🎫</td><td style="padding:7px 0;color:rgba(238,233,223,0.75);">Official <strong style="color:#eee9df;">Member ID</strong> (AEA-2026-XXXX)</td></tr>
          <tr><td style="padding:7px 0;color:rgba(238,233,223,0.75);">📋</td><td style="padding:7px 0;color:rgba(238,233,223,0.75);">Listed in the official <strong style="color:#eee9df;">AEA member directory</strong></td></tr>
          <tr><td style="padding:7px 0;color:rgba(238,233,223,0.75);">🛠️</td><td style="padding:7px 0;color:rgba(238,233,223,0.75);">Access to <strong style="color:#eee9df;">workshops, hackathons & seminars</strong></td></tr>
          <tr><td style="padding:7px 0;color:rgba(238,233,223,0.75);">🤝</td><td style="padding:7px 0;color:rgba(238,233,223,0.75);">Network with <strong style="color:#eee9df;">fellow engineers</strong> across departments</td></tr>
        </table>
      </div>

      <!-- CTA Button -->
      <a href="${REGISTER_URL}"
         style="display:block;text-align:center;background:#c94b2b;color:#fff;text-decoration:none;
                padding:16px 24px;border-radius:4px;font-weight:900;font-size:1rem;
                letter-spacing:0.04em;margin-bottom:16px;">
        REGISTER NOW — IT'S FREE →
      </a>
      <p style="text-align:center;margin:0 0 28px;font-size:0.78rem;color:rgba(238,233,223,0.3);">
        Takes less than 60 seconds · ${REGISTER_URL}
      </p>

      <!-- WhatsApp -->
      <a href="${WHATSAPP_URL}"
         style="display:block;text-align:center;background:linear-gradient(135deg,#25D366,#128C7E);
                color:#fff;text-decoration:none;padding:13px 24px;border-radius:4px;
                font-weight:700;font-size:0.9rem;margin-bottom:28px;">
        📱 Already in the WhatsApp community? Share this with friends →
      </a>

      <!-- Footer -->
      <div style="border-top:1px solid rgba(238,233,223,0.08);padding-top:20px;">
        <p style="margin:0 0 6px;font-size:0.76rem;color:rgba(238,233,223,0.3);">
          Questions? Reply to this email or write to
          <a href="mailto:aeacsupport@gmail.com" style="color:#e8614a;">aeacsupport@gmail.com</a>
        </p>
        <p style="margin:0;font-size:0.74rem;color:rgba(238,233,223,0.2);">
          All Engineers Association Club · Siliguri, West Bengal · © 2026
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/* ── Main ── */
async function main() {
  if (GMAIL_PASS === 'YOUR_16_CHAR_APP_PASSWORD') {
    console.error('❌ Please set your Gmail App Password in the GMAIL_PASS variable first!');
    process.exit(1);
  }

  // Connect to MongoDB
  console.log('🔌 Connecting to MongoDB...');
  const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  const db = client.db('aeaclub');
  const members = await db.collection('members')
    .find({}, { projection: { name: 1, email: 1, memberId: 1 } })
    .sort({ joinedAt: 1 })
    .toArray();
  await client.close();
  console.log(`✅ Found ${members.length} members in database\n`);

  // Setup Gmail transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  });

  // Send emails
  let sent = 0, failed = 0;
  for (const member of members) {
    try {
      await transporter.sendMail({
        from:    `"AEA Club" <${GMAIL_USER}>`,
        replyTo: GMAIL_USER,
        to:      member.email,
        subject: `🚀 AEA Club — Register Now & Get Your Official Member ID`,
        html:    buildEmail(member.name),
      });
      sent++;
      console.log(`✅ [${sent}/${members.length}] Sent to ${member.name} <${member.email}>`);
    } catch (err) {
      failed++;
      console.error(`❌ Failed for ${member.email}: ${err.message}`);
    }
    await sleep(DELAY_MS); // avoid Gmail rate limiting
  }

  console.log(`\n📊 Done! Sent: ${sent} | Failed: ${failed}`);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
