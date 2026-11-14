# CropGuard AI - Production Deployment Guide

## Overview

CropGuard AI supports two production deployment topologies:

---

## Topology A: Managed Cloud Architecture (Serverless / Managed)

Best for low-maintenance auto-scaling:

1. **Frontend (`apps/web`)**:
   - Host on **Vercel** or **Netlify**.
   - Set environment variable: `NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1`.

2. **API & Workers (`apps/api`, `apps/worker`)**:
   - Deploy as containers on **Railway** or **Render**.
   - Configure health check path: `/health`.

3. **Inference Microservice (`apps/inference`)**:
   - Deploy on **Railway**, **Render**, or a dedicated CPU/GPU VM on GCP/AWS.
   - Set `MODEL_PATH` to loaded ONNX models.

4. **Database & Cache**:
   - PostgreSQL 16 with `pgvector` & `postgis`: **Neon** or **Supabase**.
   - Redis: **Upstash Redis**.
   - Storage: **Cloudflare R2** or **AWS S3**.

---

## Topology B: Single VPS / Cloud VM (Docker Compose)

Best for sovereign deployment behind Cloudflare:

### 1. Provision Server
- Minimum specs: 4 vCPU, 8GB RAM, 40GB SSD (e.g. Hetzner, AWS t3.xlarge, DigitalOcean).
- Install Docker Engine 24+ and Docker Compose v2.

### 2. Configure Environment
```bash
git clone https://github.com/your-org/cropguard-ai.git /opt/cropguard
cd /opt/cropguard
cp .env.example .env
nano .env  # Configure secure secrets and domain names
```

### 3. Initialize & Launch
```bash
docker compose up -d --build
docker compose exec api alembic upgrade head
docker compose exec api python -m app.db.seed
```

### 4. Health Verification
```bash
curl -f http://localhost:8000/health
curl -f http://localhost:8001/health
curl -f http://localhost:3000
```
