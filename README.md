# Intercom Backend

Node.js / TypeScript microservices powering an AI sales & support agent platform. Clients talk to a single **API Gateway**; internal services communicate over **gRPC** and **RabbitMQ**.

---

## Architecture overview

```
                          ┌─────────────────────┐
                          │   Frontend (Vite)   │
                          │   :5173             │
                          └──────────┬──────────┘
                     HTTP /api/v1    │    WebSocket
                                     ▼
                          ┌─────────────────────┐
                          │      Gateway        │
                          │  Express :3000      │
                          │  WebSocket :WS_PORT │
                          └──────────┬──────────┘
                    gRPC             │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
┌──────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│  Auth Service    │    │    Task Service      │    │ Notification Service │
│  gRPC :50053     │    │    gRPC :50052       │    │ gRPC :50051          │
│  MongoDB         │    │  MongoDB · Redis     │    │ SMTP (Nodemailer)    │
│  RabbitMQ pub    │    │  PGVector · Agenda   │    │ RabbitMQ consumer    │
└────────┬─────────┘    │  LangGraph agents    │    └──────────▲───────────┘
         │              └──────────────────────┘               │
         │              topic: user.events                     │
         └──────────── user.created ───────────────────────────┘
```

| Service | Role | Default port |
|---------|------|--------------|
| **gateway** | Public HTTP API + WebSocket fan-out; JWT middleware; gRPC client to other services | `3000` (+ `WS_PORT`) |
| **auth-service** | Register / login / email OTP verify; JWT issuance; publishes `user.created` | `50053` |
| **task-service** | Agents, chat streaming, sessions, customers, knowledge base, memory pipelines | `50052` |
| **notification-service** | Consumes RabbitMQ events and sends email (OTP, etc.) | `50051` |

---

## Tech stack

| Layer | Choices |
|-------|---------|
| Runtime | Node.js 22, TypeScript, Express 5 |
| Inter-service RPC | gRPC (`@grpc/grpc-js` + Protobuf) |
| Messaging | RabbitMQ (topic exchange `user.events`) |
| Primary DB | MongoDB (Mongoose) |
| Cache | Redis |
| Vector store | PostgreSQL + pgvector (`@langchain/pgvector`) |
| AI orchestration | LangChain + LangGraph |
| LLM providers | Fireworks (Minimax / GLM), Cohere (embeddings / rerank) |
| Jobs | Agenda (Mongo-backed) — document & knowledge-base embedding |
| Realtime | `ws` WebSocket on the gateway |
| Auth | JWT + bcrypt; email OTP via RabbitMQ → notification service |
| Observability | LangSmith tracing (optional) |
| Packaging | Per-service `Dockerfile` (Alpine) |

---

## Repository layout

```
microservices-Nodejs/
└── microservices/
    ├── gateway/                 # Public edge (HTTP + WS)
    │   ├── proto/               # Shared .proto contracts (mounted at /app/proto in Docker)
    │   └── src/
    │       ├── routes/          # /api/v1 auth + task routes
    │       ├── middleware/      # JWT verification
    │       └── app/bootstrap/   # Express, WebSocket, gRPC clients
    ├── auth-service/
    │   └── src/
    │       ├── models/          # User schema
    │       ├── services/
    │       ├── helper/          # JWT, OTP, password hashing
    │       └── app/bootstrap/   # Express, gRPC, MongoDB, RabbitMQ
    ├── task-service/            # Core AI + domain logic
    │   └── src/
    │       ├── graph/           # LangGraph: memoryAgent → workerAgent
    │       ├── memoryAgent/     # Working / long-term memory tools & pipelines
    │       ├── workerAgent/     # B2B agent tools (KB search, lead capture/update)
    │       ├── knowledgebase/   # Document load + embed / retrieve pipelines
    │       ├── llm/             # Fireworks model factory
    │       ├── models/          # Agent, Session, ChatHistory, Customer, KB, Memory…
    │       ├── services/
    │       └── app/bootstrap/   # gRPC, MongoDB, Redis, Agenda
    └── notification-service/
        └── src/
            ├── email/           # Nodemailer transport
            └── app/bootstrap/   # gRPC, RabbitMQ consumer
```

---

## Request flow

### Auth

1. Client → `POST /api/v1/register` → Gateway → Auth gRPC `registerUser`
2. Auth stores user, publishes `user.created` on RabbitMQ
3. Notification service receives event → sends OTP email
4. Client → `POST /api/v1/verify-email` → Auth verifies OTP
5. Client → `POST /api/v1/login` → Auth returns JWT

### Chat (streaming)

1. Client → `POST /api/v1/chats` → Gateway opens a **server-streaming** gRPC call to Task Service
2. Gateway streams chunks to the HTTP response and broadcasts progress over WebSocket
3. Task Service runs the LangGraph workflow (see below)

### Human / AI takeover

`GET /api/v1/ai-take-over?actor=human|ai` broadcasts a `takeOverChat` event on the gateway WebSocket so the UI can switch control between a human operator and the AI agent.

---

## AI agent system (task-service)

Chat is orchestrated with **LangGraph**:

```
START → memoryAgent ──(nextNode === "workerAgent")──► workerAgent → END
                   └── otherwise ───────────────────► END
```

### Memory agent

- Assembles context (token-aware) via `ContextAssembler`
- Tools: `writeMemory`, `searchMemory`, `delegate_agent`
- Pipelines: embedding, BM25 retrieval, Cohere rerank/compression, customer LLM extraction
- Memory models: working memory, working-memory archive, long-term memory

### Worker agent (B2B sales/support)

- Persona / goal / company context loaded from the Agent document
- Tools:
  - `searchKnowledgeBase` — RAG over uploaded docs (pgvector)
  - `captureLead` / `updateLead` — CRM-style lead capture
- LLM: Fireworks Minimax (default) or GLM via a singleton factory

### Knowledge base & jobs

- Uploads go through Gateway → Task gRPC `UploadService`
- Agenda jobs:
  - `knowledbaseJob` — load document → embed into pgvector
  - `docEmbeddingJob` — embed daily / summary memory docs

---

## API surface (Gateway `/api/v1`)

### Auth

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/register` | Create account |
| `POST` | `/verify-email` | Confirm OTP |
| `POST` | `/login` | Issue JWT |

### Tasks / agents / chat

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/tasks` | List tasks (JWT) |
| `POST` | `/chats` | Stream chat with agent |
| `POST` | `/test-chats` | Test chat stream |
| `GET` | `/chathistory` | Conversation history |
| `POST` | `/agents` | Create agent |
| `GET` | `/agents` | List agents |
| `GET` | `/agents/:agentId` | Get agent |
| `PUT` | `/agents/:agentId` | Update agent |
| `POST` | `/upload` | Upload KB file (multipart) |
| `GET` | `/customers` | List customers / leads |
| `GET` | `/knowledbases` | List knowledge bases |
| `POST` | `/sessions` | Create session |
| `GET` | `/sessions` | List sessions |
| `PUT` | `/sessions/:id` | Update session |
| `GET` | `/ai-take-over` | Toggle AI ↔ human control |

gRPC hostnames used inside Docker Compose networking:

- Auth → `auth-service:50053`
- Task → `task-service:50052`

---

## Prerequisites

- **Node.js** 22+
- **MongoDB**
- **RabbitMQ**
- **Redis** (task-service)
- **PostgreSQL with pgvector** (task-service)
- API keys: Fireworks, Cohere (and optionally LangSmith)

For local Docker-style hostnames (`mongo`, `rabbitmq`, `redis-cache`, `pg-vector-db`, `task-service`, `auth-service`), run the matching infra containers or point `.env` at localhost equivalents.

---

## Getting started

### 1. Clone and install each service

```bash
cd microservices/gateway && npm install --legacy-peer-deps
cd ../auth-service && npm install --legacy-peer-deps
cd ../task-service && npm install --legacy-peer-deps
cd ../notification-service && npm install --legacy-peer-deps
```

### 2. Configure environment

Each service ships an `env.example`. Copy it to `.env` and fill in secrets:

```bash
cp env.example .env
```

Generate JWT keys if needed:

```bash
node -e "const c=require('crypto'); console.log('JWT_TOKEN_KEY='+c.randomBytes(64).toString('hex')); console.log('REFRESH_TOKEN_KEY='+c.randomBytes(64).toString('hex'));"
```

**Important env vars by service**

| Service | Key variables |
|---------|----------------|
| gateway | `PORT`, `WS_PORT`, `FRONT_APP_URL`, `JWT_TOKEN_KEY`, `REFRESH_TOKEN_KEY` |
| auth-service | `PORT`, `DB_URL`, `RabbitMQ_URL`, `JWT_TOKEN_KEY`, `REFRESH_TOKEN_KEY` |
| task-service | `PORT`, `DB_URL`, `REDIS_URL`, `FIRE_WORKS_API_KEY`, `COHERE_API_KEY`, `PG_VECTOR_*`, optional `LANGSMITH_*` |
| notification-service | `PORT`, `RabbitMQ_URL`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD` |

> Proto files are loaded from `/app/proto` (Docker `WORKDIR`). Ensure `.proto` contracts are present at that path in container images (or adjust the path for bare-metal local runs).

### 3. Run services (dev)

In four terminals:

```bash
# Gateway (HTTP + WebSocket)
cd microservices/gateway && npm run dev

# Auth
cd microservices/auth-service && npm run dev

# Task / AI
cd microservices/task-service && npm run dev

# Notifications
cd microservices/notification-service && npm run dev
```

Scripts:

- `npm run dev` — nodemon + ts-node (hot reload)
- `npm start` — ts-node once (used by some Docker images)

### 4. Docker (per service)

Each service has a `Dockerfile` (Node 22 Alpine). Example:

```bash
cd microservices/auth-service
docker build -t intercom-auth .
docker run --env-file .env -p 50053:50053 intercom-auth
```

Exposed ports: gateway `3000`, auth `50053`, task `50052`, notification `50051`.

---

## Domain models (task-service)

| Model | Purpose |
|-------|---------|
| `Agent` | Name, persona, goal, company context, category |
| `Session` | Conversation / thread session |
| `ChatHistory` | Persisted messages |
| `Customer` | Captured leads |
| `KnowledgeBase` | Uploaded KB metadata |
| `WorkingMemory` / `WorkingMemoryArchive` | Short-horizon agent memory |
| `LongTermMemory` | Durable memory store |

---

## Engineering notes

- **Single public entrypoint** — browsers never call auth/task/notification directly; the gateway owns HTTP, JWT, uploads, and WS broadcast.
- **Streaming end-to-end** — Task gRPC server-stream → Gateway HTTP/WS → client for low-latency chat tokens.
- **Event-driven email** — Auth publishes; Notification consumes (`email.notifications` ← `user.created`). Services stay decoupled.
- **Memory + RAG split** — Memory agent handles dialogue memory; worker agent handles product KB + lead tools.
- **Background embedding** — Agenda jobs keep chat latency off the hot path for heavy document processing.
- **Fail-fast bootstrap** — Task/auth/notification exit the process if Mongo / RabbitMQ / Redis init fails (container-friendly).

---

## Suggested local dependency map

| Dependency | Typical Docker hostname | Used by |
|------------|-------------------------|---------|
| MongoDB | `mongo:27017` | auth-service, task-service |
| RabbitMQ | `rabbitmq:5672` | auth-service, notification-service |
| Redis | `redis-cache:6379` | task-service |
| PGVector | `pg-vector-db:5432` | task-service |

---

## License

ISC (see individual `package.json` files).
