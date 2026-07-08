# ⚡ Cortex AI Copilot

<div align="center">

### AI-Powered Energy Monitoring & Intelligent Customer Support Platform

Monitor • Analyze • Predict • Ask AI

Built with **React**, **FastAPI**, **Supabase**, **pgvector**, and **Google Gemini**

</div>

---

# 📖 Project Overview

Cortex AI Copilot is an AI-powered energy monitoring platform designed to help customers monitor electricity consumption, analyze historical trends, and interact with their data using natural language.

Traditional dashboards require users to manually interpret charts and reports. Cortex AI Copilot introduces a Retrieval-Augmented Generation (RAG) architecture that allows users to ask questions about their energy usage while grounding AI responses using customer-specific operational data.

The system combines real-time visualization, scalable time-series storage, semantic search, and Google's Gemini models to deliver accurate and context-aware responses.

---

# ❗ Problem Statement

Modern energy monitoring systems continuously generate thousands of sensor readings from smart meters and industrial devices.

Although dashboards display graphs and statistics, users often struggle to:

- Understand consumption trends
- Detect abnormal power usage
- Retrieve historical information quickly
- Generate meaningful insights
- Ask operational questions in natural language

Manual analysis becomes increasingly difficult as data volume grows.

Cortex AI Copilot solves this challenge by combining AI-powered Retrieval-Augmented Generation (RAG) with real-time energy analytics, enabling users to interact with their data conversationally while maintaining context accuracy.

---

# ✨ Features

## 📊 Energy Monitoring Dashboard

- Real-time electricity monitoring
- Voltage, Current, Frequency, and Power Factor visualization
- Active Power monitoring
- Historical usage analytics
- Daily, weekly, and monthly reports
- Interactive charts
- Customer-specific dashboard

---

## 🤖 AI Copilot

- Natural language question answering
- Customer-specific responses
- Historical data summarization
- Energy usage explanation
- AI-powered recommendations
- Semantic document retrieval
- Context-aware responses using RAG

---

## 📂 Knowledge Base

- Upload operational documents
- Automatic text extraction
- Intelligent document chunking
- Vector embedding generation
- Semantic search
- Grounded AI responses

---

## 🔒 Authentication

- Secure login
- Session management
- Customer isolation
- Protected APIs

---

## 📈 Analytics

- Usage trends
- Peak demand analysis
- Consumption comparison
- Historical insights
- Energy efficiency recommendations

---

# 🛠 Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Vanilla CSS
- React Router
- Fetch API

---

## Backend

- FastAPI
- SQLAlchemy
- asyncpg
- Python

---

## Database

- Supabase PostgreSQL
- pgvector
- Time-series energy readings
- Vector storage

---

## Artificial Intelligence

- Google Gemini
- google-genai SDK
- gemini-2.5-flash
- Embedding Generation
- Retrieval-Augmented Generation (RAG)

---

## Development Tools

- Git
- GitHub
- VS Code
- Postman

---

# 🏗 System Architecture

```text
                         +-----------------------+
                         |       Customer        |
                         +-----------+-----------+
                                     |
                                     |
                              React + Vite
                                     |
                      Customer Session (localStorage)
                                     |
                                     |
                             REST API Requests
                                     |
                                     |
                     +---------------+---------------+
                     |                               |
                     |                               |
             FastAPI Backend                  AI Copilot
                     |                               |
             SQLAlchemy + asyncpg          Google Gemini API
                     |                               |
                     +---------------+---------------+
                                     |
                          Supabase PostgreSQL
                                     |
                           pgvector Extension
                                     |
                   Energy Data + Embedded Documents
```

---

# 🔄 RAG (Retrieval-Augmented Generation) Workflow

The AI Copilot follows a Retrieval-Augmented Generation pipeline to ensure responses are grounded in customer-specific information instead of relying solely on the language model.

## Document Ingestion

```text
Upload Text File
        │
        ▼
Read Document
        │
        ▼
Clean & Parse Text
        │
        ▼
Split into Chunks
        │
        ▼
Generate 768-Dimensional Embeddings
        │
        ▼
Store in pgvector
```

---

## User Query Pipeline

```text
User Question
       │
       ▼
Generate Query Embedding
       │
       ▼
Cosine Similarity Search
       │
Retrieve Most Relevant Chunks
       │
       ▼
Build Prompt Context
       │
       ▼
Gemini 2.5 Flash
       │
       ▼
Grounded AI Response
```

---

# ⚙ Application Workflow

```text
Customer Login
      │
      ▼
Session Stored in localStorage
      │
      ▼
Dashboard Loads Customer ID
      │
      ▼
Frontend Requests Backend APIs
      │
      ▼
FastAPI Fetches Customer Data
      │
      ▼
Supabase PostgreSQL Returns Data
      │
      ▼
Dashboard Displays Charts
      │
      ▼
User Asks AI Question
      │
      ▼
Relevant Context Retrieved
      │
      ▼
Gemini Generates Response
      │
      ▼
AI Answer Displayed
```

---

# 📁 Project Structure

```text
Cortex-AI-Copilot
│
├── frontend/
│   │
│   ├── public/
│   │   └── Static assets
│   │
│   ├── src/
│   │   ├── assets/            Images and icons
│   │   ├── components/        Reusable UI components
│   │   ├── pages/             Dashboard pages
│   │   ├── hooks/             Custom React hooks
│   │   ├── services/          API communication
│   │   ├── utils/             Helper functions
│   │   ├── styles/            CSS files
│   │   ├── App.tsx            Root component
│   │   └── main.tsx           Application entry
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   │
│   ├── api/                   API endpoints
│   ├── models/                SQLAlchemy models
│   ├── schemas/               Pydantic schemas
│   ├── services/              Business logic
│   ├── database/              Database configuration
│   ├── embeddings/            Embedding generation
│   ├── rag/                   Retrieval pipeline
│   ├── utils/                 Utility functions
│   ├── uploads/               Uploaded documents
│   ├── main.py                FastAPI entry point
│   └── requirements.txt
│
├── README.md
└── LICENSE
```

---

# 🚀 Installation & Local Setup

## Clone Repository

```bash
git clone https://github.com/your-username/cortex-ai-copilot.git

cd cortex-ai-copilot
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Runs on:

```
http://localhost:5173
```

---

## Backend

Create a virtual environment:

```bash
python -m venv venv
```

Activate:

Windows

```bash
venv\Scripts\activate
```

Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run server

```bash
uvicorn main:app --reload
```

Runs on

```
http://localhost:8000
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend directory.

```env
SUPABASE_URL=

SUPABASE_KEY=

DATABASE_URL=

GOOGLE_API_KEY=

MODEL_NAME=gemini-2.5-flash
```

---

# 🚀 Deployment

## Frontend

- Vercel
- Netlify

---

## Backend

- Render
- Railway
- Fly.io

---

## Database

- Supabase PostgreSQL
- pgvector enabled

---

# 📊 Future Improvements

- PDF report generation
- Voice-enabled AI assistant
- Predictive energy forecasting
- Smart anomaly detection
- Multi-customer admin portal
- Mobile application
- Email alerts
- Dark mode
- Device health monitoring

---

# ⚠ Assumptions

- Every customer has a unique Customer ID.
- Customers can only access their own records.
- Documents uploaded belong to authenticated customers.
- Internet connectivity is required for Gemini API.
- pgvector extension is enabled in PostgreSQL.

---

# 🚧 Limitations

- AI responses depend on the quality of uploaded documents.
- Embedding search accuracy depends on chunk size.
- External API availability affects AI responses.
- Very large documents may require additional indexing time.
- Current implementation supports text-based knowledge sources.

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

---

# 📄 License

This project is intended for educational, research, internship, and demonstration purposes.

---

# 🙏 Acknowledgements

This project is built using the following open-source technologies:

- React
- TypeScript
- Vite
- FastAPI
- SQLAlchemy
- asyncpg
- Supabase
- PostgreSQL
- pgvector
- Google Gemini
- google-genai SDK

---

<div align="center">

### ⭐ If you found this project helpful, consider giving it a star on GitHub!

**Built with ❤️ using AI and Modern Web Technologies**

</div>
