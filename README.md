# 🏥 Clinic AI Platform

A full-stack platform for searching clinics, viewing clinic details, and managing medical appointments.

---

## 📐 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, Axios |
| Backend | Java 17, Spring Boot 3, Maven |
| Database | PostgreSQL 15 |
| API Docs | OpenAPI 3 / Swagger UI |

---

## 📁 Project Structure

```
clinic-ai-platform/
├── frontend/          # React + Vite + TailwindCSS app
├── backend/           # Spring Boot REST API
├── docs/              # Architecture, DB schema, API contracts
├── agents/            # AI agent role definitions
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 18+
- PostgreSQL 15 running locally

### 1. Start the Backend

```bash
cd backend

# Edit src/main/resources/application.yml with your DB credentials

mvn spring-boot:run
```

API runs on: `http://localhost:8080`  
Swagger UI: `http://localhost:8080/swagger-ui.html`

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on: `http://localhost:5173`

---

## 📖 Documentation

| Document | Description |
|---|---|
| [Architecture](docs/architecture.md) | System design, components, scalability |
| [Database Schema](docs/database_schema.md) | Tables, relationships, ER diagram |
| [API Contracts](docs/api_contracts.md) | REST endpoints, request/response shapes |

---

## 🤖 Agents

| Agent | Role |
|---|---|
| [Architect Agent](agents/architect_agent.md) | System design & task breakdown |
| [Developer Agent](agents/developer_agent.md) | Backend & frontend implementation |
| [QA Agent](agents/qa_agent.md) | API validation & integration testing |

---

## ✨ Features

- 🔍 Search clinics by name or specialization
- 🏥 View detailed clinic profiles with doctor listings
- 📅 Book appointments with doctors
- 📋 View and manage your appointments

---

## 📄 License

MIT License © 2026 Clinic AI Platform
