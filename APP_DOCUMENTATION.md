# Smart Notes — App Documentation

**Smart Notes** is a full-stack, AI-powered note-taking app. Users register, authenticate, and manage personal notes with AI-generated summaries via a local Ollama LLM (with fallback). A companion **MCP server** exposes the notes API to the Cursor IDE, letting AI agents manage notes directly from the editor.

---

## What It Does

- **User auth** — Register & login with JWT + bcrypt; protected routes on the frontend
- **Note management** — Create, read, update, delete personal notes stored in MongoDB (per-user isolation)
- **AI summaries** — Ollama LLM generates 2–3 sentence summaries; falls back to text truncation if Ollama is down
- **IDE integration** — MCP server exposes 6 tools (`list_notes`, `get_note`, `create_note`, `update_note`, `delete_note`, `whoami`) to Cursor via stdio transport

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, FastAPI, Motor (async MongoDB) |
| Frontend | React 18, Vite, React Router |
| Database | MongoDB 7 (Docker) |
| LLM | Ollama (llama3.2, local) |
| Auth | JWT + bcrypt |
| MCP | Node.js + @modelcontextprotocol/sdk |

## Architecture

```
Frontend (React :5173)  ←HTTP→  Backend (FastAPI :8000)  ←→  MongoDB (Docker :27017)
                                          ↓ HTTP
                                    Ollama LLM (:11434, optional)
                                          ↑ HTTP
MCP Server (Node.js, stdio) ←→  Backend API (JWT auth)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Create account |
| POST | `/api/login` | Sign in |
| GET | `/api/me` | Current user |
| GET | `/api/notes` | List user's notes |
| POST | `/api/notes` | Create note |
| GET | `/api/notes/{id}` | Get single note |
| PUT | `/api/notes/{id}` | Update note |
| DELETE | `/api/notes/{id}` | Delete note |
| POST | `/api/summarize` | Generate AI summary |

---

## Three Resume Points

### 1. Full-Stack AI-Powered Web Application
Built a full-stack note-taking app with a **FastAPI** backend (async MongoDB via Motor, JWT/bcrypt auth, Ollama LLM integration with fallback) and a **React 18 + Vite** frontend (dark-themed UI, React Router, Context API auth). Implemented a complete REST API with 8 endpoints for user auth and note CRUD, containerized with Docker Compose.

### 2. MCP (Model Context Protocol) Server
Developed a **Node.js MCP server** using `@modelcontextprotocol/sdk` that exposes 6 tools (`list_notes`, `get_note`, `create_note`, `update_note`, `delete_note`, `whoami`) to the **Cursor IDE** via stdio transport. Features Zod schema validation, automatic JWT token caching with 401 re-authentication, and case-insensitive note filtering.

### 3. Production-Ready Architecture & DevOps
Designed a production-ready architecture with Pydantic Settings config, CORS middleware, async DB lifecycle management (lifespan handlers), MongoDB indexing (unique email, compound user_id + updated_at), health checks, and Vite reverse proxy. Includes comprehensive docs, `.env.example` files, and Docker Compose setup.
