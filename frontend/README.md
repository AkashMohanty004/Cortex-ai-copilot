# Cortex AI Frontend

This is the React + TypeScript frontend dashboard for the Cortex AI Industrial Energy Monitoring Platform. It provides a dark-charcoal premium grid layout featuring:

1. **Dashboard:** Stat cards and time-series charts showing live sensor readings and facility alerts.
2. **Customers:** Facility grid selection.
3. **Analytics:** Advanced metrics including phase balance indicators, power quality, core temperature thresholds, and interactive Recharts graphs.
4. **AI Copilot:** A RAG-driven chat interface powered by Gemini to troubleshoot active alerts.
5. **Reports:** Compliance audits table.
6. **Settings:** API connectivity diagnostics and a manual trigger for document indexing.

## Setup Instructions

1. **Configure Environment:**
   Create a `.env` file based on `.env.example`:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

2. **Install Dependencies:**
   Make sure you have Node.js (v18+) and npm installed:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Run Development Server:**
   Launch Vite dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Production Build:**
   Compile the app:
   ```bash
   npm run build
   ```
