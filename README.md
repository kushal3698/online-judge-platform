# Online Judge Platform — Scalable Architecture & Production Codebase

> **Author**: Kuswanth Tumma  
> **Repository**: [https://github.com/kuswanthtumma/online-judge-platform](https://github.com/kuswanthtumma/online-judge-platform)  
> **Technology Stack**: React 18, Vite, Tailwind CSS, Monaco Editor, Express, TypeScript, MongoDB, Redis, BullMQ, Docker (cgroups v2 + seccomp)  
> **Status**: Full-Stack Implemented & Verified  

---

## 🌟 Executive Overview

The **Online Judge Platform** is a production-oriented distributed algorithmic evaluation system and AI-powered learning environment. It enables developers and competitive programmers to write solutions in **C++**, **Python 3**, and **Java**, execute code asynchronously in resource-constrained, hardened **Docker sandboxes**, and receive real-time verdicts with microsecond timing accuracy.

The platform includes **🧞 OJ Genie**, a context-aware AI Coding Mentor embedded inside the problem workspace that offers **progressive hint scaffolding**, **line-by-line code breakdowns**, **submission autopsies**, **bug detection**, and **adversarial test generation**.

---

## 🏗️ High-Level System Architecture

```
                                  ┌───────────────────────────┐
                                  │      CLIENT BROWSER       │
                                  │  React 18 + Monaco Editor │
                                  └─────────────┬─────────────┘
                                                │ (HTTPS / REST)
                                                ▼
                                  ┌───────────────────────────┐
                                  │    EXPRESS API GATEWAY    │
                                  │ TypeScript + JWT Security │
                                  └──────┬──────────────┬─────┘
                                         │              │
                    ┌────────────────────┘              └────────────────────┐
                    ▼                                                        ▼
         ┌─────────────────────┐                                  ┌─────────────────────┐
         │     MONGODB v6.0    │                                  │   REDIS + BULLMQ    │
         │ Schemas & Audit Log │                                  │ Async Ingestion Q   │
         └─────────────────────┘                                  └──────────┬──────────┘
                                                                             │
                                                                             ▼
                                                                  ┌─────────────────────┐
                                                                  │   WORKER NODE (x4)  │
                                                                  │ Docker Sandbox Host │
                                                                  └──────────┬──────────┘
                                                                             │
                                      ┌──────────────────────────────────────┴──────────────────────────────────────┐
                                      ▼                                      ▼                                      ▼
                           ┌─────────────────────┐                ┌─────────────────────┐                ┌─────────────────────┐
                           │   DOCKER C++17      │                │  DOCKER PYTHON 3.10 │                │  DOCKER OPENJDK 17  │
                           │  --network none     │                │  --memory 256m      │                │  --cpus 1.0         │
                           │  --pids-limit 64    │                │  --read-only        │                │  UID: 10001         │
                           └─────────────────────┘                └─────────────────────┘                └─────────────────────┘
```

---

## 🚀 Key Subsystems & Features

### 1. 💻 Coding Workspace & Monaco Editor
- **Multi-Language Support**: C++ (GCC 12 / C++17), Python 3 (3.10), and Java (OpenJDK 17).
- **Split-View Canvas**: Problem statement, constraints, and sample I/O on the left; code editor and submission triggers on the right.
- **Asynchronous Verdict Polling**: Submissions return `202 Accepted` immediately, transitioning through `Pending` $\rightarrow$ `Processing` $\rightarrow$ `Accepted` with live execution time (ms) and memory stats (KB).
- **Submission History**: Complete historical audit log per problem with source code modal inspection.

### 2. 🧞 OJ Genie — AI Coding Mentor
Embedded directly as a workspace tab alongside Problem Description and Submission History:
- 🔍 **Line-by-Line Code Breakdown**: Structured explanation of input deserialization, hash table lookups, and complexity profiles.
- 💡 **Adaptive Progressive Hints**: Scaffolds learning across 4 progressive tiers (Structural Insight $\rightarrow$ State Memory $\rightarrow$ Hash Map $\rightarrow$ Approach Revealed) without giving away raw copy-paste answers.
- 🧪 **AI Submission Autopsy**: Root-cause diagnostic engine evaluating failed submissions (e.g., TLE due to $O(N^2)$ loops vs. Wrong Answer due to duplicate keys).
- 🐛 **AI Bug Detective**: Off-by-one boundary scanner (`i <= n`), unhandled edge case flagger, and complexity warning system.
- 🔥 **Break My Code (Adversarial Tester)**: Generates worst-case inputs ($N = 100,000$, duplicates at boundary) designed to challenge algorithmic bottlenecks.
- ⚔️ **Code Duel**: Directly benchmarks student solution complexity ($O(N^2)$) against the optimal platform standard ($O(N)$).

### 3. 🛡️ Container Sandboxing & Kernel Security
- **Network Isolation**: `--network none` permanently severs socket access, blocking network exfiltration.
- **Resource Hardening**: `--memory 256m --memory-swap 256m` enforced by Linux cgroups v2 + `--cpus 1.0`.
- **Fork Bomb Neutralization**: `--pids-limit 64` blocks process table exhaustion.
- **Rootfs Protection**: `--read-only` root filesystem and read-only volume mounts (`/sandbox:ro`).
- **Unprivileged Execution**: Non-root execution under UID `10001:10001`.
- **System Call Whitelist**: Hardened Linux `seccomp.json` filter blocking unauthorized syscalls.

### 4. 📊 Platform Analytics & Administration
- **Global Leaderboard**: Live ranking by problems solved, total submissions, and accuracy percentages.
- **Admin Management Panel**: Problem statement authoring, custom time/memory limit configuration, and hidden testcase suite uploads.

---

## 📁 Repository Directory Structure

```
d:/project HLD/
├── backend/                              # Express REST API (TypeScript)
│   ├── src/
│   │   ├── config/                       # Database, Redis, and Environment settings
│   │   ├── controllers/                  # Auth, Problem, Testcase, Submission, Leaderboard, Genie
│   │   ├── middleware/                   # JWT Auth, RBAC Admin Guard, Zod Validator, Error Handler
│   │   ├── models/                       # Mongoose Schemas (User, Problem, TestCase, Submission)
│   │   ├── routes/                       # Express Route Handlers & Zod Schemas
│   │   ├── services/                     # Business Logic, DB operations, Genie AI Service
│   │   └── server.ts                     # Main Express Bootstrap
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                             # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/                   # Navbar, CodeEditor (Monaco), OJGenieTab
│   │   ├── context/                      # AuthContext (JWT & profile state)
│   │   ├── pages/                        # Home, Problems, ProblemDetail, Leaderboard, Login, Register, Admin
│   │   ├── services/                     # Axios API Client with JWT Interceptors
│   │   ├── App.tsx                       # React Router configuration
│   │   └── main.tsx                      # DOM entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── worker/                               # Asynchronous BullMQ Execution Worker
│   ├── src/
│   │   ├── docker/                       # Docker container spawning & cgroups runner
│   │   ├── evaluator/                    # Diff evaluator (whitespace-normalized)
│   │   └── worker.ts                     # BullMQ event loop & verdict resolution
│   ├── package.json
│   └── tsconfig.json
│
├── docker/                               # Execution Sandbox Definitions
│   ├── cpp/                              # GCC 12 C++17 Runner Dockerfile & run.sh
│   ├── python/                           # Python 3.10 Runner Dockerfile & run.sh
│   ├── java/                             # OpenJDK 17 Runner Dockerfile & run.sh
│   └── seccomp.json                      # Linux kernel syscall security filter
│
├── tests/
│   └── SECURITY_TESTS.md                 # 8 Formal Security & Edge Case Test Specs
│
├── docs/                                 # Complete Engineering Documentation Suite
│   ├── 1_High_Level_Design.md            # Primary 10–15 page HLD Blueprint
│   ├── 2_Low_Level_Design.md             # Low-Level MVC & Schemas
│   ├── 3_Software_Requirement_Specification.md # IEEE 830 SRS
│   ├── 4_API_Documentation.md            # OpenAPI 3.0 Reference
│   ├── 5_Database_Design.md             # Database ERD & Modeling
│   └── 6_System_Diagrams.md             # 11 System Diagrams
│
├── pdf_export/                           # 7 Compiled PDF Documentation Files
├── docker-compose.yml                    # Multi-container orchestration (Mongo, Redis, API, Worker)
├── .env.example                          # Environment configuration template
└── README.md                             # Platform Documentation
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Docker Desktop** (for sandbox execution)
- **MongoDB** & **Redis** (optional in local development; built-in memory fallback included)

---

### Local Development Setup

#### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/kuswanthtumma/online-judge-platform.git
cd online-judge-platform

# Install Backend Dependencies
cd backend
npm install
cd ..

# Install Frontend Dependencies
cd frontend
npm install
cd ..

# Install Worker Dependencies
cd worker
npm install
cd ..
```

#### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGO_URI=mongodb://localhost:27017/online_judge
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=super_secret_jwt_key_kuswanth_online_judge_2026
```

#### 3. Start Development Servers

Open 3 terminal windows:

**Terminal 1 — Backend API Server (Port 5000)**:
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend UI (Port 3000)**:
```bash
cd frontend
npm run dev
```

**Terminal 3 — Evaluation Queue Worker**:
```bash
cd worker
npm run dev
```

---

## 🌐 Live Service Endpoints

| Component | URL | Description |
| :--- | :--- | :--- |
| **Frontend Web App** | `http://localhost:3000` | Problem set, Monaco Editor, Genie AI |
| **Backend REST API** | `http://localhost:5000/api` | Problem CRUD, Auth, Submissions, Leaderboard |
| **Health Live Probe** | `http://localhost:5000/api/health/live` | Container liveness check |
| **Health Ready Probe**| `http://localhost:5000/api/health/ready` | Database readiness check |

---

## 🧪 Security & Sandbox Verification

The platform has been audited against 8 critical security tests detailed in `tests/SECURITY_TESTS.md`:

| Test ID | Test Scenario | Mechanism | Result |
| :---: | :--- | :--- | :---: |
| **T1** | Infinite Loop (`while(true)`) | Hard execution timer + cgroup quota | `Time Limit Exceeded` |
| **T2** | Memory Explosion ($>256$ MB) | Linux cgroups `--memory 256m` OOM Killer | `Memory Limit Exceeded` |
| **T3** | Network Socket Creation | `--network none` namespace drop | `Runtime Error` (Unreachable) |
| **T4** | Host Filesystem Write | Read-only rootfs (`--read-only`) | Blocked by OS Kernel |
| **T5** | Fork Bomb Attack | Process thread cap (`--pids-limit 64`) | Blocked at 64 PIDs |
| **T6** | Frontend Privilege Escalation | Server-side JWT `requireAdmin` check | `403 Forbidden` |
| **T7** | NoSQL / Script Injection | Zod request schema validation | Sanitized / Clean |
| **T8** | Code Payload Size ($>64$ KB) | Buffer byte size limit check | `400 Bad Request` |

---

## 📜 Documentation Package

The complete engineering documentation suite has been compiled and is available in the repository under `docs/` and `pdf_export/`:

1. **[High-Level Design (HLD)](file:///d:/project%20HLD/docs/1_High_Level_Design.md)**: Architectural blueprints, distributed queueing, and container security.
2. **[Low-Level Design (LLD)](file:///d:/project%20HLD/docs/2_Low_Level_Design.md)**: Class diagrams, controller pipelines, and data models.
3. **[Software Requirement Specification (SRS)](file:///d:/project%20HLD/docs/3_Software_Requirement_Specification.md)**: Functional and non-functional requirements.
4. **[API Documentation](file:///d:/project%20HLD/docs/4_API_Documentation.md)**: Complete OpenAPI 3.0 specification.
5. **[Database Design](file:///d:/project%20HLD/docs/5_Database_Design.md)**: Entity Relationship Diagrams (ERD) and indexing strategies.
6. **[System Diagrams](file:///d:/project%20HLD/docs/6_System_Diagrams.md)**: 11 architectural, sequence, state, and deployment diagrams.

---

## 👤 Author

**Kuswanth Tumma**  
*Project Lead & System Architect*  
*Online Judge Platform — August 2026*
