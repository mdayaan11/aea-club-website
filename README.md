# AEA Club — All Engineers Association

<div align="center">

![AEA Club](https://img.shields.io/badge/AEA-Club-c94b2b?style=for-the-badge&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-14213D?style=for-the-badge)

**Voice of Engineers · Siliguri, West Bengal**

[🌐 Live Website](https://aea-club-website.vercel.app) · [📋 Join AEA](https://aea-club-website.vercel.app/#join) · [💬 WhatsApp Community](https://chat.whatsapp.com/GQnRp0BaDnB2w4VvXlq1uU)

</div>

---

## ✨ About

The **All Engineers Association (AEA) Club** is a student-led engineering community based in Siliguri, West Bengal. This is the official website — built to showcase the club, accept memberships, and connect engineers.

## 🚀 Features

- **3D Animated Intro** — Three.js cinematic landing sequence on first visit
- **Member Registration** — Form with auto-generated Member ID (`AEA-2026-XXXX`)
- **MongoDB Backend** — All registrations stored permanently in MongoDB Atlas
- **Confirmation Email** — Auto-sent to every new member with their ID + WhatsApp link
- **Team Carousel** — Sliding team section with auto-advance
- **Live Effects** — Custom cursor, parallax, stat counters, particle animations
- **Admin API** — View and manage all members via secure endpoint

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, Vanilla CSS3, JavaScript |
| 3D Graphics | Three.js (r128) |
| Backend | Vercel Serverless Functions (Node.js) |
| Database | MongoDB Atlas |
| Email | Nodemailer + Gmail SMTP |
| Hosting | Vercel |

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| Navy | `#14213D` | Primary dark colour |
| Cream | `#FDF6EC` | Background |
| Coral | `#E8614A` | Accent / CTA |
| Ink | `#1A1812` | Body text |

## 📁 Project Structure

```
aea-club-website/
├── index.html          ← Single-page app
├── styles.css          ← Full design system + components
├── app.js              ← Core JS (canvas, form, navigation)
├── effects.js          ← 12 live effects (cursor, parallax, counters...)
├── intro.js            ← Three.js 3D intro animation
├── intro.css           ← Intro overlay styles
├── vercel.json         ← Vercel routing + function config
├── api/
│   ├── join.js         ← POST /api/join — registration + Member ID
│   ├── auth.js         ← POST /api/auth — member login
│   └── members.js      ← GET/PATCH /api/members — admin panel
└── lib/
    └── db.js           ← MongoDB connection (serverless optimised)
```

## ⚙️ Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `GMAIL_USER` | Gmail address for sending emails |
| `GMAIL_PASS` | Gmail App Password (16-char) |
| `ADMIN_SECRET` | Bearer token for admin API |

## 🔌 API Reference

### Register a Member
```http
POST /api/join
Content-Type: application/json

{
  "name": "Student Name",
  "email": "student@gmail.com",
  "department": "Computer Science",
  "year": "Second Year",
  "motivation": "I want to join AEA because..."
}
```
**Response:**
```json
{ "success": true, "memberId": "AEA-2026-0001" }
```

### List All Members (Admin)
```http
GET /api/members
Authorization: Bearer aeaclub_admin_2026
```

### Update Member Status (Admin)
```http
PATCH /api/members
Authorization: Bearer aeaclub_admin_2026
Content-Type: application/json

{ "memberId": "AEA-2026-0001", "status": "approved" }
```

## 🏃 Run Locally

```bash
# Clone the repo
git clone https://github.com/mdayaan11/aea-club-website.git
cd aea-club-website

# Install Vercel CLI
npm i -g vercel

# Add environment variables
cp .env.example .env.local
# Fill in your MongoDB URI, Gmail credentials

# Run locally
vercel dev
```

## 👥 Leadership

| # | Name | Role |
|---|---|---|
| 01 | Arkajyoti Das | President — Board's District Topper |
| 02 | Md Ayan Sk | Vice President — IIT Madras Student · IIT Ropar Intern |
| 03 | Banti Agarwal | Secretary — 10 CGPA Holder, MAKAUT |
| 04 | Mit Sharma | Treasurer |
| 05 | Bethin Baishya | Director of Corporate |

## 📬 Contact

- **Email:** aeacsupport@gmail.com
- **WhatsApp:** [Join Community](https://chat.whatsapp.com/GQnRp0BaDnB2w4VvXlq1uU)
- **Location:** Siliguri, West Bengal, India

---

<div align="center">

Made with ❤️ by the AEA Club Team · © 2026

</div>
