# Deployment Guide — Local, Docker Compose & Render Cloud

> **Author**: Kuswanth Tumma  
> **Platform**: Online Judge Platform  

---

## 1. Cloud Deployment (Render)

### Live Production Endpoints:
- **Frontend App**: `https://online-judge-frontend-x36s.onrender.com`
- **Backend REST API**: `https://online-judge-platform-kz8u.onrender.com`

### 1-Click Blueprint:
The repository includes `render.yaml` configuring:
1. `online-judge-api` (Node.js Web Service on port 10000)
2. `online-judge-frontend` (Static Site with SPA rewrite rules)

---

## 2. Docker Compose Deployment (Full Multi-Container Stack)

```bash
# Build and spin up MongoDB, Redis, API Gateway, and Worker Nodes
docker-compose up --build -d
```

---

## 3. Local Development Setup

```bash
# 1. Backend
cd backend && npm install && npm run dev

# 2. Frontend
cd frontend && npm install && npm run dev

# 3. Queue Worker
cd worker && npm install && npm run dev
```
