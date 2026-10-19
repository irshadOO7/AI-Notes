# Smart Notes — LinkedIn Project Description

## 🚀 Project Title
**Smart Notes — AI-Powered Note-Taking App with Cursor IDE Integration**

---

## 📄 Full Description

**Smart Notes** is a full-stack, AI-powered note-taking application that lets users securely manage personal notes with intelligent AI-generated summaries. Built with a FastAPI backend and React frontend, it features JWT/bcrypt authentication, MongoDB storage with per-user isolation, and open-source LLM integration via Ollama (with a graceful fallback when Ollama is unavailable).

What sets Smart Notes apart is its **MCP (Model Context Protocol) server** — a Node.js companion that exposes 6 tools (`list_notes`, `get_note`, `create_note`, `update_note`, `delete_note`, `whoami`) to the **Cursor IDE** via stdio transport. This means AI agents inside Cursor can directly read, create, and manage your notes without ever leaving the editor.

### ✨ Key Features
- 🔐 **User Authentication** — Register & login with JWT tokens + bcrypt password hashing; protected routes on the frontend
- 📝 **Note Management** — Full CRUD (create, read, update, delete) with per-user data isolation in MongoDB
- 🤖 **AI Summaries** — Ollama LLM (llama3.2) generates 2–3 sentence summaries; falls back to text truncation if Ollama is down
- 💻 **IDE Integration** — MCP server exposes notes API to Cursor, enabling AI agents to manage notes directly from the editor
- 🏭 **Production-Ready** — Pydantic Settings config, CORS middleware, async DB lifecycle management, MongoDB indexing, health checks, Docker Compose

### 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| 🐍 Backend | Python, FastAPI, Motor (async MongoDB) |
| ⚛️ Frontend | React 18, Vite, React Router, Context API |
| 🍃 Database | MongoDB 7 (Docker) |
| 🧠 LLM | Ollama (llama3.2, local) |
| 🔑 Auth | JWT + bcrypt |
| 🔌 MCP Server | Node.js + @modelcontextprotocol/sdk |
| 🐳 DevOps | Docker Compose |

### 🏗️ Architecture
```
Frontend (React :5173)  ←HTTP→  Backend (FastAPI :8000)  ←→  MongoDB (Docker :27017)
                                    ↓ HTTP
                                Ollama LLM (:11434, optional)
                                    ↑ HTTP
MCP Server (Node.js, stdio) ←→  Backend API (JWT auth)
```

---

## 💼 Resume Bullet Points (3 options)

### Option A — Concise & Impact-Focused
**Smart Notes — AI-Powered Note-Taking App** | *Full-Stack Developer*
- 🏗️ Built a full-stack note-taking app with **FastAPI** backend (async MongoDB via Motor, JWT/bcrypt auth, Ollama LLM integration with fallback) and **React 18 + Vite** frontend (dark-themed UI, React Router, Context API auth); containerized with Docker Compose
- 🔌 Developed a **Node.js MCP server** using `@modelcontextprotocol/sdk` that exposes 6 tools to the **Cursor IDE** via stdio transport, with Zod schema validation, automatic JWT token caching, and 401 re-authentication
- 🏭 Designed production-ready architecture with Pydantic Settings, CORS middleware, async DB lifecycle management, MongoDB indexing, health checks, and Vite reverse proxy

### Option B — Feature-Focused
**Smart Notes — AI-Powered Note-Taking App with Cursor IDE Integration** | *Full-Stack Developer*
- 🏗️ **Full-Stack Web App**: Built a complete note-taking application with a FastAPI backend (async MongoDB via Motor, JWT/bcrypt authentication, Ollama LLM integration with graceful fallback) and a React 18 + Vite frontend featuring a dark-themed UI, React Router, and Context API-based auth
- 🔌 **MCP Server for Cursor IDE**: Developed a Node.js MCP server using `@modelcontextprotocol/sdk` that exposes 6 tools (`list_notes`, `get_note`, `create_note`, `update_note`, `delete_note`, `whoami`) to the Cursor IDE via stdio transport — enabling AI agents to manage notes directly from the editor. Includes Zod schema validation, automatic JWT token caching with 401 re-authentication, and case-insensitive note filtering
- 🏭 **Production-Ready Architecture**: Implemented Pydantic Settings for configuration, CORS middleware, async database lifecycle management with lifespan handlers, MongoDB indexing (unique email, compound user_id + updated_at), health checks, and Vite reverse proxy. Includes comprehensive documentation, `.env.example` files, and Docker Compose setup

### Option C — Story-Driven
**Smart Notes — AI-Powered Note-Taking App with Cursor IDE Integration** | *Full-Stack Developer*

🎯 I built **Smart Notes** to solve a simple problem: I wanted to manage my notes with the help of AI, but also wanted my AI coding assistant (Cursor) to be able to read and write those notes directly from the editor.

The result is a full-stack application with three layers:
1. 🐍 **A FastAPI backend** with async MongoDB (via Motor), JWT/bcrypt auth, and Ollama LLM integration for AI-generated summaries (with a text-truncation fallback when Ollama isn't running)
2. ⚛️ **A React 18 + Vite frontend** with a dark-themed UI, React Router, and Context API auth — featuring real-time AI summary suggestions as you type
3. 🔌 **A Node.js MCP server** that exposes 6 tools to the Cursor IDE via stdio transport, so AI agents can `list_notes`, `get_note`, `create_note`, `update_note`, `delete_note`, and `whoami` — all with Zod validation, automatic JWT token caching, and 401 re-authentication

The whole stack is containerized with Docker Compose and designed for production with Pydantic Settings, CORS middleware, async DB lifecycle management, MongoDB indexing, and health checks.

---

## 🔧 GitHub
[github.com/irshadOO7/AI-Notes](https://github.com/irshadOO7/AI-Notes)

---

## 🏷️ Hashtags
`#FullStackDevelopment` `#FastAPI` `#ReactJS` `#MongoDB` `#AI` `#MachineLearning` `#Ollama` `#LLM` `#MCP` `#CursorIDE` `#ModelContextProtocol` `#Docker` `#JWT` `#Authentication` `#NoteTakingApp` `#OpenSource`
