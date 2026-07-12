# Smart Notes — AI-Powered Note Taking App

A full-stack note-taking application with user authentication, MongoDB storage, and open-source LLM-powered summary suggestions via [Ollama](https://ollama.com).

## Features

- **User authentication** — Register, login, JWT-based sessions
- **Create & manage notes** — Title, content, auto-generated summaries
- **AI summary suggestions** — As you type, Ollama generates a concise summary (with fallback if Ollama is unavailable)
- **Persistent storage** — Notes saved in MongoDB, listed per user
- **Modern UI** — React + Vite dark-themed interface

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Python, FastAPI, Motor (async MongoDB) |
| Database   | MongoDB                             |
| Frontend   | React, Vite, React Router           |
| LLM        | Ollama (open-source, local)         |
| Auth       | JWT + bcrypt                        |

## Prerequisites

- Python 3.11+
- Node.js 18+
- Docker (for MongoDB)
- [Ollama](https://ollama.com) (optional, for AI summaries)

## Quick Start

### 1. Start MongoDB

```bash
docker compose up -d
```

### 2. (Optional) Start Ollama & pull a model

```bash
# Install Ollama from https://ollama.com, then:
ollama pull llama3.2
ollama serve
```

If Ollama is not running, the app falls back to a simple text truncation summary.

### 3. Start the Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Usage

1. **Register** an account at `/register`
2. **Sign in** and click **+ New** to create a note
3. **Type a title and content** — an AI summary appears automatically after ~1 second
4. **Save Note** — it appears in your sidebar list
5. **Click any note** to view/edit; use **×** to delete

## API Endpoints

| Method | Endpoint            | Description              |
|--------|---------------------|--------------------------|
| POST   | `/api/register`     | Create account           |
| POST   | `/api/login`        | Sign in                  |
| GET    | `/api/me`           | Current user             |
| GET    | `/api/notes`        | List user's notes        |
| POST   | `/api/notes`        | Create note              |
| GET    | `/api/notes/{id}`   | Get single note          |
| PUT    | `/api/notes/{id}`   | Update note              |
| DELETE | `/api/notes/{id}`   | Delete note              |
| POST   | `/api/summarize`    | Generate AI summary      |

## Configuration

Copy `backend/.env.example` to `backend/.env` and adjust:

| Variable          | Default                    | Description                |
|-------------------|----------------------------|----------------------------|
| `MONGODB_URL`     | `mongodb://localhost:27017`| MongoDB connection string |
| `DATABASE_NAME`   | `notes_app`                | Database name              |
| `SECRET_KEY`      | (change me)                | JWT signing key            |
| `OLLAMA_BASE_URL` | `http://localhost:11434`   | Ollama API URL             |
| `OLLAMA_MODEL`    | `llama3.2`                 | Model for summarization    |

## Project Structure

```
project/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app entry
│   │   ├── config.py        # Settings
│   │   ├── database.py      # MongoDB connection
│   │   ├── models/          # Pydantic schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # LLM summarization
│   │   └── utils/           # Auth helpers
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/           # Login, Register, Notes
│   │   ├── context/         # Auth context
│   │   ├── api.js           # API client
│   │   └── App.jsx
│   └── package.json
├── docker-compose.yml
└── README.md
```
# AI-Notes
