#  Trade Predict — NIFTY 50 Stock Prediction Platform

> ML-powered stock prediction platform with real-time dashboard and automated email alerts.

🔗 **Live Demo:** [https://tradepredict-five.vercel.app/]

---

##  About

**Trade Predict** is a full-stack web application that delivers daily machine learning predictions for the top NIFTY 50 companies. Users log in to a personalized dashboard to view the latest stock predictions and receive automated hourly email alerts to stay ahead of market movements.

---

##  Features

-  Secure user registration & login via **Supabase Auth**
-  Clean **React dashboard** displaying real-time ML predictions for NIFTY 50 stocks
-  **Hourly automated email alerts** sent to users with updated predictions
-  **Daily cron job scheduler** keeping predictions and alerts in sync
-  **REST APIs** connecting the frontend, backend, and ML prediction service
-  **UptimeRobot** pinging the backend every 5 minutes to prevent Render cold starts

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS |
| Backend | Node.js, Express |
| Database & Auth | Supabase |
| Email Alerts | SMTP + Node Cron |
| ML Model | Python (trained & deployed by teammate) |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| Uptime Monitoring | UptimeRobot |


---

##  Deployment

- **Frontend** deployed on **Vercel** — auto-deploys on push to `main`
- **Backend** deployed on **Render** — kept alive via UptimeRobot pings
- **ML Model** separately deployed on **Render**
- **Database & Auth** managed via **Supabase**

---

##  Highlights

- Real-time prediction updates with minimal latency  
- Scalable architecture using microservice-style separation  
- Automated alert system for continuous user engagement  

---

> Built with focus on real-time data delivery, clean UX, and reliable alert infrastructure. 🚀
