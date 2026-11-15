# CropGuard AI

Plant leaf disease detection in English, Hindi and Marathi.
Team Pacific Coders | Srujan Hackathon 2026 | AI-05, Track T1

## What it does
Take or upload a photo of a leaf. CropGuard AI returns the likely disease, a confidence score and general advisory guidance with an ICAR link, in your language.

## Live links
- Website: https://cropguard-ai-rho.vercel.app
- Android app (APK + QR): https://cropguard-ai-rho.vercel.app/en/download
- Backend API: https://cropguard-api-n68r.onrender.com/health
  (free tier: the first request after idle can take about a minute)

## Tech stack
- Frontend: Next.js PWA (apps/web), deployed on Vercel
- Backend: FastAPI + ONNX Runtime (backend/), deployed on Render
- Model: EfficientNet-B0, 38 PlantVillage classes
- Android: PWA packaged with PWABuilder; iPhone users use Safari > Share > Add to Home Screen

## Model results and honest limits
- 99.94% validation accuracy on 17,572 PlantVillage images.
- These are lab-style images. Accuracy on real field photos will be lower.
- Advice is general guidance only, not a certified diagnosis. Consult a local agricultural officer.

## Run locally
Backend:
    cd backend
    pip install -r requirements.txt
    uvicorn app.main:app --reload
Frontend:
    cd apps/web
    npm install
    npm run dev
Set NEXT_PUBLIC_API_URL to your backend URL ending in /api/v1.

## Known gaps
No feedback endpoint yet, no Grad-CAM heatmaps, Disease Library content is static.

## Team
Pacific Coders