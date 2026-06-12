# 🛠️ SupportDesk | Full-Stack AI Customer Support Portal

[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini](https://img.shields.io/badge/AI_Engine-Google_Gemini-4285F4?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Vercel](https://img.shields.io/badge/Hosting-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Hosting-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://render.com/)

A production-ready, full-stack enterprise helpdesk portal designed to streamline customer service workflows. The platform integrates a standard RESTful architecture with an automated AI Customer Support Assistant utilizing the Google Gemini API to resolve incoming customer queries instantly.

---

## 🚀 Key Features

* **🤖 Automated AI Support Agent:** Built-in real-time customer chat assistant leveraging the `@google/genai` SDK and `gemini-2.5-flash` model for instant, contextual inquiries resolution.
* **🎫 Ticket Lifecycle Tracking:** Create, categorize, prioritize, and track customer support tickets with complete data persistence.
* **🔐 Secure Authentication Pipeline:** User account registration and login protected via robust `bcryptjs` password hashing and stateful JSON Web Token (`JWT`) session validation.
* **📊 Live Operational Dashboard:** Dynamic health status monitoring (`GET /health`) displaying metrics, active ticket counters, and database connection state summaries.
* **💾 Resilient Database Architecture:** Core data persistence managed via MongoDB Atlas, featuring an automated in-memory array data fallback structure to ensure zero backend crashes if cloud connections drop.

---

## 💻 Technical Architecture & Ecosystem

| Layer | Component | Technologies Implemented |
| :--- | :--- | :--- |
| **Frontend UI** | Client Side | React 19, Vite Asset Bundler, CSS3 Grid/Flexbox, JavaScript (ES6+) |
| **Backend API**| Server Engine | Node.js, Express.js REST Architecture, CORS, Dotenv Configuration |
| **Database** | Persistence | MongoDB Atlas Cloud Cluster, Mongoose Object Data Modeling (ODM) |
| **Security** | Auth Layer | JSON Web Tokens (JWT), Encrypted Bcrypt Hashing, Route Middlewares |
| **AI Layer** | Automation | Google Gen AI SDK (`ai.models.generateContent`) |

---

## 📂 Repository Directory Layout

```text
Web1-master/
├── backend/                  # Express REST Gateway API Engine
│   ├── server.js             # Application Bootloader & Middleware Mount
│   ├── routes/               # API Router Endpoints (Auth, Tickets, Chatbot)
│   ├── models/               # Mongoose MongoDB Data Schemas
│   ├── middleware/           # Secure JWT Validation & Request Filters
│   ├── data/                 # In-Memory Backup Failover Data Stores
│   └── package.json
└── frontend/                 # Client Single Page Application (SPA)
    ├── src/
    │   ├── App.jsx           # Core Component Composition Layout 
    │   ├── api.js            # Axios/Fetch Global Endpoint Routing Interface
    │   ├── App.css           # Global Theme Ecosystem Variances
    │   └── SupportDesk.css   # Main Customer Portal Component Styling
    ├── package.json
    └── vite.config.js
