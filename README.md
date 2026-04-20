#  Trade Predict — NIFTY 50 Stock Prediction Platform

> ML-powered stock prediction platform with real-time dashboard and automated email alerts.

🔗 **Live Demo:** [https://tradepredict-five.vercel.app](https://tradepredict-five.vercel.app)

---

##  About

**Trade Predict** is a full-stack web application that delivers daily machine learning predictions for all 50 NIFTY 50 companies. Users sign up, log in, and land on a personalized dashboard showing live stock predictions, company rankings, and Top 5 picks — with automated daily email alerts to stay ahead of market movements.

---

##  Features

- Secure user registration & login via **Supabase Auth**
- Responsive **React dashboard** with live ML predictions streaming in via **Supabase real-time subscriptions** — no page refresh needed
- **Dynamic company ranking** and **Top 5 filtering logic** built with `useMemo` for optimized re-render performance
- **Per-company rank** computed live based on bullish % across the entire NIFTY 50
- **REST API** consuming ML model predictions, persisting structured data in **Supabase (PostgreSQL)** for real-time dashboard retrieval
- **Daily cron job pipeline** that pulls fresh predictions and dispatches automated email alerts to all registered users via **SMTP**
- Backend kept alive via scheduled pings to prevent cold starts on Render

---

##  Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Tailwind CSS, Framer Motion, Recharts |
| Backend | Node.js, Express |
| Database & Auth | Supabase (PostgreSQL) |
| Email Alerts | Nodemailer (SMTP) + Node Cron |
| ML Model | Python (trained & deployed by teammate) |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

---

##  Deployment

- **Frontend** deployed on **Vercel** — auto-deploys on push to `main`
- **Backend** deployed on **Render** — kept alive via scheduled pings
- **ML Model** separately deployed on **Render**
- **Database & Auth** managed via **Supabase**

---

##  Highlights

- Real-time prediction updates via Supabase subscriptions with no page refresh
- Dynamic filtering and ranking logic across all 50 companies with zero redundant re-renders
- Automated daily email alert pipeline running independently in the background
- Clean separation of concerns — ML model owned by teammate, full product engineering owned by me

---

> Built with focus on real-time data delivery, responsive UX, and reliable alert infrastructure.