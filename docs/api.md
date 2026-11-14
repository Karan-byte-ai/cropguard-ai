# CropGuard AI - REST API Specification

Version: `1.0.0`
Base URL: `/api/v1`

---

## 1. Authentication (`/auth`)

### `POST /auth/register`
Create a new user/farmer account.
- **Request Body**:
  ```json
  {
    "email": "farmer@example.com",
    "password": "SecurePassword123!",
    "language": "en",
    "region": "Punjab"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "language": "en",
    "region": "Punjab"
  }
  ```
- **Cookie**: Sets `refresh_token` in `httpOnly`, `SameSite=Lax` cookie.

### `POST /auth/login`
Authenticate with email and password.
- **Response `200 OK`**: Returns new access token; sets rotating refresh token cookie.

### `POST /auth/refresh`
Rotate refresh token and issue a fresh access token.

---

## 2. Scans (`/scans`)

### `POST /scans`
Upload a leaf photo for AI inference, leaf validation, Grad-CAM heatmap, and grounded advisory.
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `file`: binary image (JPEG/PNG/WebP, max 15MB)
  - `locale`: `"en" | "hi" | "mr"`
  - `crop_hint`: optional string
- **Response `201 Created`**:
  ```json
  {
    "scanId": "123e4567-e89b-12d3-a456-426614174000",
    "status": "done",
    "modelVersion": "v1.3.0",
    "leafDetected": true,
    "confidenceLevel": "high",
    "predictions": [
      {
        "disease": "tomato_late_blight",
        "label": "Late Blight",
        "crop": "Tomato",
        "confidence": 0.94
      }
    ],
    "heatmapUrl": "https://s3.example.com/scans/heatmap.png",
    "advisory": {
      "symptoms": ["Dark water-soaked lesions on leaves..."],
      "management": {
        "organic": ["Remove infected leaves; spray neem extract..."],
        "chemical": ["Mancozeb 75 WP @ 2.5 g/L..."]
      },
      "prevention": ["Maintain spacing, avoid overhead sprinklers..."],
      "sources": [
        {
          "name": "ICAR - Indian Institute of Horticultural Research",
          "url": "https://iihr.icar.gov.in"
        }
      ]
    },
    "disclaimer": "AI-assisted guidance only, not a replacement for an agronomist..."
  }
  ```

### `GET /scans/{id}`
Fetch scan result by UUID.

### `POST /scans/{id}/feedback`
Submit farmer validation (correct / incorrect).

---

## 3. Disease Library (`/diseases`)

### `GET /diseases`
List and search diseases by crop, keyword, and language.
- Query parameters: `crop`, `q`, `lang` (`en`, `hi`, `mr`)

### `GET /diseases/{slug}`
Retrieve full disease profile and grounded advisory.

---

## 4. News & Outbreak Alerts (`/news`)

### `GET /news`
Paginated crop disease outbreak news feed.
- Query parameters: `crop`, `state`, `q`, `page`, `size`

### `GET /news/alerts`
Active outbreak alerts filtered by region.

### `GET /news/trending`
Trending diseases scanned or reported over the last 7 days.

---

## 5. System Observability
- `GET /health` - Liveness probe
- `GET /ready` - Readiness probe
- `GET /metrics` - Prometheus metrics export
