# SupportDesk

SupportDesk is a full-stack customer support portal with a React + Vite frontend, an Express + MongoDB backend, and a Gemini-powered support chat assistant.

It is designed to help users:

- submit and track support tickets
- ask questions in chat support
- browse FAQs and service centers
- send feedback
- see dashboard stats for support operations

## What This Project Contains

- Frontend: React 19 + Vite UI in [src](src)
- Backend: Express API in [../backend](../backend)
- Database: MongoDB, with an in-memory fallback when MongoDB is unavailable
- AI chat: Google Gemini via `@google/genai`

## How The App Works

The frontend talks to the backend through REST endpoints defined in [src/api.js](src/api.js).

The backend exposes routes for:

- authentication
- tickets
- FAQs
- feedback
- products
- service centers
- chatbot history and Gemini chat replies

The chat assistant uses the Gemini API and a system instruction that keeps replies concise and professional.

## Main Features

- Dashboard with live backend health and summary cards
- Ticket submission form with category grouping and validation
- Ticket list and status/priority display
- Gemini chat support with saved history
- FAQ management and history
- Feedback submission
- Service center list
- Basic auth flow for login/register UI

## Project Structure

```text
Web1-master/
	backend/
		server.js
		routes/
		models/
		middleware/
		data/
		package.json
		.env
	frontend/
		src/
			App.jsx
			api.js
			main.jsx
			App.css
			SupportDesk.css
		package.json
		vite.config.js
```

## Tech Stack

- Frontend: React, Vite, plain CSS
- Backend: Node.js, Express
- Database: MongoDB, Mongoose
- Auth: JWT and bcryptjs
- AI: Google Gemini via `@google/genai`

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB running locally or a hosted MongoDB connection string
- A Gemini API key from Google AI Studio

## Environment Setup

You need a `.env` file in the backend folder.

Create or update [backend/.env](../backend/.env) with:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/SupoortDB
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

If you want the frontend to point to a different backend URL, add a frontend `.env` file in this folder:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Install Dependencies

Open two terminals, one for backend and one for frontend.

Backend:

```bash
cd d:/Web1-master/Web1-master/backend
npm install
```

Frontend:

```bash
cd d:/Web1-master/Web1-master/frontend
npm install
```

## Run Locally

Start the backend first:

```bash
cd d:/Web1-master/Web1-master/backend
npm start
```

Then start the frontend:

```bash
cd d:/Web1-master/Web1-master/frontend
npm run dev
```

Frontend default URL:

```text
http://localhost:5173
```

Backend default URL:

```text
http://localhost:5000/api
```

## API Overview

The frontend uses these API calls from [src/api.js](src/api.js):

- `GET /health`
- `GET /tickets`
- `POST /tickets`
- `PATCH /tickets/:id/status`
- `GET /products`
- `GET /faqs`
- `POST /faqs`
- `GET /feedback`
- `POST /feedback`
- `GET /chatbot/history`
- `POST /chatbot`
- `GET /servicecenters`
- `POST /auth/login`
- `POST /auth/register`

## Chat Assistant Behavior

The chatbot route in [../backend/routes/chatbotRoutes.js](../backend/routes/chatbotRoutes.js) does the following:

- reads the user message from the request body
- sends it to Gemini with `ai.models.generateContent`
- uses the model `gemini-3.5-flash`
- applies a system instruction that keeps the assistant concise and professional
- returns the AI response as JSON
- saves the chat message in MongoDB when available, otherwise in memory

## Working With The Backend

The backend entry file is [../backend/server.js](../backend/server.js).

It:

- loads environment variables with `dotenv`
- enables CORS and JSON parsing
- connects to MongoDB
- mounts all API routes under `/api`
- starts the server on `PORT`

If MongoDB is unavailable, the backend still starts and uses in-memory storage for some features.
