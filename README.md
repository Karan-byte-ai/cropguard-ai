# CropGuard AI 🌿
**Plant Disease Identification and Awareness Platform**

CropGuard AI is a mobile-first, production-ready AI platform designed to photograph plant leaves, diagnose crop diseases with explainable Grad-CAM heatmaps, provide ICAR-certified treatment advisory in English, Hindi, and Marathi, and track regional pest outbreak surveillance.

---

## 🏗 System Architecture

The platform follows a modular monolith architecture with isolated async workers and inference services:

```
cropguard-ai/
├── apps/
│   ├── web/           # Next.js 14 PWA (App Router, Tailwind, next-intl, shadcn/ui)
│   ├── api/           # FastAPI Gateway (Auth, Scans, Advisory, News, PostGIS/pgvector)
│   ├── inference/     # ONNX Runtime microservice (Leaf validation, EfficientNet-B0, Grad-CAM)
│   └── worker/        # Celery & Celery Beat (News ingestion, data retention)
├── ml/                # Model training, dataset balancing, ONNX export pipeline
├── knowledge-base/    # ICAR/KVK-grounded advisory content & sources.yaml
├── infra/             # Docker Compose, Nginx reverse proxy, Prometheus, Grafana
├── .github/workflows/ # CI/CD pipelines (ruff, bandit, pytest, eslint, tsc, docker)
└── docs/              # OpenAPI specs, Architecture Decision Records (ADRs)
```

---

## 🚀 Quick Start (Local Docker Compose)

Start all services with a single command:

```bash
# 1. Clone repository & configure environment
cp .env.example .env

# 2. Spin up complete environment via Docker Compose
docker compose up -d --build
```

### Services & URLs:
- **Web App (Next.js PWA)**: [http://localhost:3000](http://localhost:3000)
- **API Gateway (FastAPI)**: [http://localhost:8000](http://localhost:8000)
- **Interactive OpenAPI Docs**: [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)
- **Inference Microservice**: [http://localhost:8001](http://localhost:8001)
- **MinIO S3 Console**: [http://localhost:9001](http://localhost:9001) (`minioadmin` / `minioadmin`)
- **Prometheus Metrics**: [http://localhost:9090](http://localhost:9090)
- **Grafana Dashboard**: [http://localhost:3001](http://localhost:3001) (`admin` / `admin`)

---

## 🛠 Manual Development Setup

### 1. Backend API (FastAPI)
```bash
cd apps/api
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start API server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend Web App (Next.js 14)
```bash
cd apps/web
npm install
npm run dev
```

---

## 🧪 Testing & Linting

### Backend Tests:
```bash
cd apps/api
pytest tests/ -v
ruff check .
bandit -r app -ll
```

### Frontend Tests & Type Checking:
```bash
cd apps/web
npm run lint
npm run type-check
npm run build
```

---

## 🛡 Security Controls (Section 11)
- **Upload Hardening**: File MIME verification by magic bytes, image re-encoding via Pillow (destroys malicious payloads), EXIF and GPS stripping.
- **Privacy Compliance**: Client IPs are hashed with SHA-256; only coarse geographical regions are retained.
- **Authentication**: Argon2 password hashing with short-lived JWT access tokens and rotating refresh tokens in `httpOnly` `SameSite=Lax` cookies.
- **Rate Limiting**: Token-bucket rate limiting backed by Redis.
- **Transport**: Strict Content Security Policy (CSP), Permissions-Policy (camera locked to self origin), HSTS, X-Content-Type-Options.

---

## 📜 Disclaimer
> **Medical / Agronomic Notice**: Results are AI-assisted guidance, not a replacement for an agronomist. Always confirm severe cases with a local Krishi Vigyan Kendra (KVK) or agriculture officer.
