# ⚡ Cortex AI Copilot

AI-powered Energy Monitoring Dashboard with a Retrieval-Augmented Generation (RAG) AI Copilot built using React, FastAPI, Supabase PostgreSQL, pgvector, and Google Gemini.

---

## 📖 Project Overview

Cortex AI Copilot is an intelligent energy monitoring platform that enables customers to monitor electricity consumption, visualize real-time and historical data, and interact with an AI assistant using natural language.

The AI Copilot retrieves customer-specific information from the database and knowledge base before generating responses, ensuring accurate, context-aware answers instead of generic AI outputs.

---

## ❗ Problem Statement

Energy monitoring platforms continuously generate large volumes of time-series data. While dashboards display graphs and metrics, users often find it difficult to interpret historical trends, identify anomalies, or retrieve operational information efficiently.

Cortex AI Copilot addresses this problem by combining real-time analytics with a Retrieval-Augmented Generation (RAG) pipeline, allowing users to ask questions in natural language and receive responses grounded in their own data.

---

## ✨ Features

- Customer-specific authentication
- Real-time energy monitoring dashboard
- Historical energy analytics
- AI Copilot powered by Google Gemini
- Retrieval-Augmented Generation (RAG)
- Semantic document search using pgvector
- Interactive charts and reports
- Customer data isolation
- RESTful API architecture
- Responsive user interface

---

## 🛠 Technology Stack

### Frontend
- React
- TypeScript
- Vite
- Vanilla CSS

### Backend
- FastAPI
- SQLAlchemy
- asyncpg

### Database
- Supabase PostgreSQL
- pgvector

### Artificial Intelligence
- Google Gemini
- google-genai SDK
- gemini-2.5-flash

### Tools
- Git
- GitHub
- VS Code
- Postman

---

## 🏗 Architecture

```text
Customer
   │
   ▼
React + TypeScript + Vite
   │
   ▼
FastAPI REST API
   │
   ├────────► Supabase PostgreSQL
   │
   ├────────► pgvector
   │
   └────────► Google Gemini
                   │
                   ▼
          Context-Aware AI Response
```

---

## 🔄 Workflow

```text
Login
   │
   ▼
Customer Session
   │
   ▼
Dashboard Loads Customer Data
   │
   ▼
User Asks AI Copilot
   │
   ▼
Generate Query Embedding
   │
   ▼
Cosine Similarity Search
   │
   ▼
Retrieve Relevant Context
   │
   ▼
Gemini 2.5 Flash
   │
   ▼
Grounded AI Response
```

---

## 📂 Project Structure

```text
Cortex-ai-copilot
├── backend
│   ├── api
│   ├── database
│   ├── embeddings
│   ├── models
│   ├── rag
│   ├── services
│   ├── utils
│   └── main.py
├── frontend
│   ├── public
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── hooks
│   │   ├── pages
│   │   ├── services
│   │   ├── styles
│   │   └── utils
│   ├── App.tsx
│   └── main.tsx
└── README.md
```

---

## 🚀 Live Deployment

### Frontend

https://cortex-ai-copilot.vercel.app/copilot

### Backend API

https://cortex-ai-copilot.onrender.com

---

## 💻 Public GitHub Repository

https://github.com/AkashMohanty004/Cortex-ai-copilot

---

## ⚙ Installation

Clone the repository

```bash
git clone https://github.com/AkashMohanty004/Cortex-ai-copilot.git
cd Cortex-ai-copilot
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv venv
```

Windows

```bash
venv\Scripts\activate
```

Linux/macOS

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run the server

```bash
uvicorn main:app --reload
```

---

## 🔑 Environment Variables

Create a `.env` file inside the backend directory.

```env
GOOGLE_API_KEY=
SUPABASE_URL=
SUPABASE_KEY=
DATABASE_URL=
MODEL_NAME=gemini-2.5-flash
```

---

## 📌 Deployment Details

| Component | Platform |
|----------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | Supabase PostgreSQL |
| Vector Database | pgvector |
| AI Model | Google Gemini 2.5 Flash |

---

## 📝 Evaluation Notes

- The deployed application is publicly accessible.
- The GitHub repository contains the complete source code.
- Each customer is assigned a unique **Customer ID**.
- A valid **Customer ID** is displayed at the bottom of the login page and should be used during evaluation.
- The AI Copilot retrieves customer-specific context before generating responses.
- All AI responses are grounded using the Retrieval-Augmented Generation (RAG) pipeline.

---

## 👤 Developer

**Akash Kumar Mohanty**

---

## ⚠ Assumptions

- Each customer has a unique Customer ID.
- Customers can access only their own data.
- Internet access is required for AI responses.
- pgvector is enabled in the database.

---

## 🚧 Limitations

- Supports text-based knowledge sources.
- AI quality depends on available contextual data.
- Large document uploads require indexing before retrieval.

---
