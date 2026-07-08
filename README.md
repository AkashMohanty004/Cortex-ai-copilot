# ⚡ Cortex AI Copilot

> **AI-Powered Industrial Energy Monitoring & Diagnostics Platform**

Cortex AI Copilot is a cloud-native industrial intelligence platform that combines **Artificial Intelligence**, **real-time energy analytics**, and **predictive diagnostics** to help organizations monitor facility performance, optimize energy consumption, and make data-driven operational decisions. The platform integrates Google Gemini AI with a scalable FastAPI backend and a modern React dashboard, delivering intelligent insights through natural language interactions.

---

## 🏗️ Tech Stack

| Category | Technologies |
|----------|--------------|
| 🎨 Frontend | React.js • TypeScript • Vite • Tailwind CSS • Axios • React Router • Context API |
| ⚙️ Backend | Python • FastAPI • Uvicorn • SQLAlchemy • AsyncPG • Pydantic |
| 🗄️ Database | Supabase PostgreSQL • PostgreSQL |
| 🤖 Artificial Intelligence | Google Gemini API • Prompt Engineering • Natural Language Processing |
| ☁️ Cloud & Deployment | Vercel • Render • GitHub |
| 🛠️ Developer Tools | VS Code • Git • GitHub • Postman • Chrome DevTools |

---

## 📂 System Architecture

```text
                                        CORTEX AI COPILOT

 ┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                        React + TypeScript (Vite)                                      │
 │                                  Responsive Industrial Dashboard                                      │
 └──────────────────────────────────────────────┬────────────────────────────────────────────────────────┘
                                                │
                                                │ REST API (Axios)
                                                ▼
 ┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                      FastAPI Backend (Python)                                          │
 │                                                                                                         │
 │  • Customer Management     • Dashboard APIs     • Reports     • AI Copilot     • Authentication        │
 └──────────────────────────────────────────────┬────────────────────────────────────────────────────────┘
                                                │
                           ┌────────────────────┴────────────────────┐
                           │                                         │
                           ▼                                         ▼
              Supabase PostgreSQL                         Google Gemini AI
          Industrial Energy Database              Natural Language Intelligence
                           │                                         │
                           └────────────────────┬────────────────────┘
                                                ▼
                                AI Insights • Analytics • Recommendations
                                                │
                                                ▼
                              Energy Monitoring Dashboard & AI Assistant
```

---

## ✨ Core Features

- 🔐 Secure Customer Authentication
- 📊 Real-Time Industrial Energy Dashboard
- 🤖 AI Copilot powered by Google Gemini
- 📈 Interactive Data Visualization
- ⚡ Live Energy Consumption Monitoring
- 📄 Automated Report Generation
- 🏭 Multi-Facility Energy Management
- 🔍 Predictive Diagnostics & Analysis
- 🚨 Intelligent Alerts & Recommendations
- ☁️ Cloud-Native Deployment
- 📱 Fully Responsive User Interface

---

## 🚀 Workflow

```text
Industrial Equipment
        │
        ▼
Energy Data Collection
        │
        ▼
Supabase PostgreSQL
        │
        ▼
FastAPI Backend
        │
        ├── Customer APIs
        ├── Dashboard APIs
        ├── Report APIs
        └── AI Copilot
                │
                ▼
Google Gemini AI
                │
                ▼
Intelligent Recommendations
                │
                ▼
React Dashboard (Vercel)
```

---

## 📦 Project Structure

```text
CORTEX-AI
│
├── backend
│   ├── api
│   ├── database
│   ├── models
│   ├── schemas
│   ├── rag
│   ├── scripts
│   ├── docs
│   ├── main.py
│   └── requirements.txt
│
├── frontend
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   ├── hooks
│   │   └── assets
│   │
│   ├── public
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## 🌐 Deployment

| Service | Platform |
|----------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | Supabase PostgreSQL |
| AI Model | Google Gemini |
| Version Control | GitHub |

---

### 💡 Built with modern cloud technologies to deliver scalable, AI-powered industrial energy intelligence.
