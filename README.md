# GreenCycle.lk — Plastic Awareness and Sustainability Platform

**SLIIT IT Project (ITP)** · MERN stack web application

Lack of proper plastic waste management is damaging the environment. People use plastic in daily life without realizing its long-term impact on rivers, seas and communities. While some individuals and organizations promote sustainability, many consumers lack awareness, knowledge, and motivation to reduce their plastic consumption. There is a need for a digital platform that educates users about plastic waste, calculates their plastic footprint, and provides actionable steps toward sustainability.

The GreenCycle.lk platform is designed to close this gap. It gives users the knowledge, tools and motivation to reduce their plastic footprint: they can track, reduce and recycle plastic and earn rewards for proper disposal. The platform brings together a **Plastic Footprint Calculator**, an **Awareness Hub** with educational resources on sustainable alternatives, a **Community Forum** for ideas, challenges and collaboration, a **Recycling Directory** of nearby recycling centres, and an **Analytical Dashboard** that tracks each user's eco-friendly actions.

---

## Table of contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Project structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Environment variables](#environment-variables)
6. [Run locally](#run-locally)
7. [API endpoints](#api-endpoints)
8. [Frontend routes](#frontend-routes)
9. [Scripts](#scripts)
10. [Troubleshooting](#troubleshooting)

---

## Features

**Accounts and security**

- Register, log in and log out (JWT in an HTTP-only cookie)
- Email verification with a one-time password (OTP)
- Forgot password → reset with an emailed OTP
- Emails sent through Brevo SMTP (Nodemailer)

**Plastic Footprint Calculator**

- Calculate your plastic footprint from daily usage
- Save results, view your history, delete entries
- Download a footprint report (PDF)
- Set a monthly plastic limit and track it

**User dashboard**

- Summary of your plastic data and progress
- **Eco-action tracker** — add, edit, complete and delete eco-friendly actions; daily actions
- **Achievements & badges** awarded automatically for milestones
- **Leaderboard** to compare progress with other users
- **Analytics** — weekly completed actions and category breakdown charts
- **Weekly and date-range reports**
- **Profile** editing

**Public pages:** Home, About Us, Contact Us

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (Create React App), React Router 7 (`createBrowserRouter`), Axios, js-cookie |
| Charts / PDF | Chart.js + react-chartjs-2, Recharts, jsPDF |
| Styling | CSS + Tailwind CSS |
| Backend | Node.js, Express 4 (ES modules) |
| Database | MongoDB Atlas with Mongoose 8 |
| Auth | JWT, bcryptjs, cookie-parser |
| Email | Nodemailer (Brevo SMTP relay) |
| Reports | pdfmake (server) |

## Project structure

```
GreenCycle.lk/
├── backend/                       # Express API (port 4000)
│   ├── server.js                  # App setup, CORS, routes, error handler
│   ├── config/
│   │   ├── mongodb.js             # Mongoose connection (database "GreenCycle")
│   │   └── nodemailer.js          # Brevo SMTP transporter
│   ├── controllers/               # auth, user, dashboard, footprint
│   ├── models/                    # user, PlasticUsage, ecoAction, achievement
│   ├── middleware/userAuth.js     # Verifies the JWT cookie
│   ├── routes/                    # /api/auth, /api/user, /api/dashboard, /api/footprint
│   └── utils/                     # achievements, suggestions
└── frontend/                      # React app (port 3000)
    ├── package.json               # "proxy": "http://localhost:4000"
    ├── tailwind.config.js, postcss.config.js
    └── src/
        ├── index.js               # Router configuration
        ├── context/               # AuthContext, AchievementNotificationContext
        ├── Components/            # Auth, Common, LandingPage, Layout
        ├── pages/
        │   ├── Home, AboutUs, ContactUs
        │   ├── plastic-footprint-calculator/
        │   └── user-dashboard/    # summary, eco-tracker, leaderboards, achievements-badges,
        │                          # analytics, user-profile
        └── images/
```

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| [Node.js](https://nodejs.org) | 18 or newer | `node -v` |
| npm | comes with Node.js | `npm -v` |
| MongoDB Atlas cluster (free tier is fine) | — | — |
| Brevo account (free) for SMTP email | — | — |
| Git | any | `git --version` |

## Environment variables

Create **`backend/.env`**:

```env
PORT=4000
MONGODB_URI=mongodb+srv://USER:PASSWORD@your-cluster.mongodb.net/
JWT_SECRET=replace-with-a-long-random-string
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Brevo SMTP (https://app.brevo.com → SMTP & API)
SMTP_USER=your-brevo-smtp-login
SMTP_PASS=your-brevo-smtp-key
SENDER_EMAIL=your-verified-sender@example.com
```

| Variable | Purpose |
|---|---|
| `PORT` | API port (default 4000) |
| `MONGODB_URI` | Atlas connection string **ending with `/`** — the app adds `GreenCycle?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret for signing login tokens |
| `NODE_ENV` | `production` makes cookies secure (HTTPS only) |
| `FRONTEND_URL` | Allowed CORS origin |
| `SMTP_USER`, `SMTP_PASS` | Brevo SMTP credentials |
| `SENDER_EMAIL` | "From" address for OTP and welcome emails |

Never commit `.env`.

## Run locally

```bash
# 1. Clone
git clone https://github.com/asjsolo/GreenCycle.lk.git
cd GreenCycle.lk
```

**Backend (terminal 1):**

```bash
cd backend
npm install
# create backend/.env as shown above
npm run server        # nodemon -> http://localhost:4000
```

You should see `Server started on PORT:4000` and `Database Connected`. Open http://localhost:4000 — it says **API Working fine**.

**Frontend (terminal 2):**

```bash
cd frontend
npm install
npm start             # http://localhost:3000
```

Register an account, check your email for the verification OTP, then explore the calculator and dashboard.

## API endpoints

Base URL `http://localhost:4000/api`. Routes marked 🔒 need the login cookie.

**Auth — `/api/auth`**

| Method | Route | |
|---|---|---|
| POST | `/register` | Create account |
| POST | `/login` | Log in, sets cookie |
| POST | `/logout` | Log out |
| POST | `/send-verify-otp` 🔒 | Email a verification OTP |
| POST | `/verify-account` 🔒 | Verify with OTP |
| GET | `/is-auth` 🔒 | Check login |
| GET | `/is-verified` 🔒 | Check verification |
| POST | `/send-reset-otp` | Email a password-reset OTP |
| POST | `/reset-password` | Reset with OTP |

**User — `/api/user`** 🔒

| Method | Route | |
|---|---|---|
| GET | `/data` | Current user |
| PUT | `/profile` | Update profile |
| PUT | `/set-monthly-limit` | Set monthly plastic limit |
| GET | `/plastic-data` | Plastic usage summary |
| PUT | `/track-calculator-usage` | Record calculator use |

**Footprint — `/api/footprint`** 🔒

| Method | Route | |
|---|---|---|
| POST | `/calculate` | Calculate footprint |
| POST | `/save-usage` | Save a result |
| GET | `/history` | Saved results |
| DELETE | `/history/:id` | Delete a result |
| GET | `/report` | Footprint report |

**Dashboard — `/api/dashboard`** 🔒

| Method | Route | |
|---|---|---|
| GET / POST | `/eco-actions` | List / add eco actions |
| PUT / DELETE | `/eco-actions/:actionId` | Update / delete |
| GET | `/daily-actions` | Today's actions |
| GET | `/achievements`, `/achievement-definitions` | Earned and available badges |
| GET | `/stats` | Dashboard stats |
| GET | `/analytics/weekly-completed-actions` | Weekly chart data |
| GET | `/analytics/category-breakdown` | Category chart data |
| GET | `/leaderboard` | Leaderboard |
| POST | `/generate-weekly-report` | Weekly report |
| POST | `/analytics/report-range` | Report for a date range |

## Frontend routes

| Route | Page |
|---|---|
| `/` | Home |
| `/about-us`, `/contact-us` | About, Contact |
| `/plasticFootprintCalculator` | Plastic Footprint Calculator |
| `/login`, `/register` | Sign in / sign up |
| `/verify-email` | Email verification |
| `/forgot-password`, `/reset-password` | Password reset |
| `/dashboard` | Dashboard summary |
| `/dashboard/ecoActionTracker` | Eco-action tracker |
| `/dashboard/leaderboard` | Leaderboard |
| `/dashboard/achievementsBadges` | Achievements & badges |
| `/dashboard/analytics` | Analytics |
| `/dashboard/profile` | Profile |

## Scripts

| Folder | Command | What it does |
|---|---|---|
| `backend/` | `npm run server` | API with auto-restart (nodemon) |
| `backend/` | `npm start` | API with plain Node |
| `frontend/` | `npm start` | React dev server on port 3000 |
| `frontend/` | `npm run build` | Production build in `frontend/build/` |
| `frontend/` | `npm test` | Tests in watch mode |

## Troubleshooting

| Problem | Fix |
|---|---|
| `MongoParseError` / can't connect | Make sure `MONGODB_URI` ends with `/` and your IP is allowed in Atlas → Network Access |
| No OTP email arrives | Check the Brevo SMTP login/key and that `SENDER_EMAIL` is a verified sender; look in spam |
| Logged in but dashboard redirects to login | Use http://localhost:3000 (matches `FRONTEND_URL`) so the cookie is sent |
| CORS error | Set `FRONTEND_URL` to the exact frontend URL |
| `Proxy error: Could not proxy request` | The backend isn't running on port 4000 |

---

SLIIT · IT Project (ITP) · GreenCycle.lk team
