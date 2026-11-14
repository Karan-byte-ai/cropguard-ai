# ADR 0001: CropGuard AI Architecture Decisions

## Context
CropGuard AI is a plant disease identification and awareness platform targeting farmers, agricultural extension workers, and students in India. Operating environments often feature weak 4G/2G mobile connectivity, diverse regional languages (English, Hindi, Marathi), and critical trust requirements around chemical and organic agricultural treatments.

## Decisions

### 1. Monorepo Structure
- **Decision**: Consolidate frontend (`apps/web`), API gateway (`apps/api`), ONNX inference (`apps/inference`), background workers (`apps/worker`), ML training (`ml/`), and knowledge base (`knowledge-base/`) into a single monorepo.
- **Rationale**: Ensures shared domain models, unified Docker Compose orchestration, synchronised CI/CD test matrices, and rapid iteration.

### 2. Separation of API Gateway & Inference Service
- **Decision**: Run FastAPI API gateway on port 8000 and a stateless ONNX Runtime microservice on port 8001.
- **Rationale**: Heavy machine learning tensor operations and CPU/GPU memory footprints are isolated from web requests, allowing independent horizontal scaling or migration to GPU nodes.

### 3. Grounded Advisory with Zero Unretrieved Generation
- **Decision**: Advisory content is stored in a curated knowledge base citing ICAR, state agricultural universities, and KVK research. Language models may not hallucinate chemical recipes.
- **Rationale**: Farmer safety and regulatory compliance require strict citation of approved chemical dosages and banned substance avoidance.

### 4. Multilingual PWA & Locale Persistence
- **Decision**: Implement Next.js 14 App Router with `next-intl` (`en`, `hi`, `mr`), persist locale in cookies, and provide mobile-first bottom navigation.
- **Rationale**: Farmers require seamless access in Hindi and Marathi, with large touch targets and low-literacy friendly visual icons.

### 5. Security & Upload Hardening
- **Decision**: Re-encode all uploaded images with Pillow, strip EXIF/GPS, enforce Redis token-bucket rate limits, hash client IPs, and protect sessions with Argon2 and HTTPOnly SameSite cookies.
- **Rationale**: Prevents malicious image payload execution, protects farmer geolocation privacy, and protects services from denial of service.
