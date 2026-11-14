FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY apps/inference/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/inference /app/apps/inference
WORKDIR /app/apps/inference

EXPOSE 8001

CMD ["uvicorn", "service.predict:app", "--host", "0.0.0.0", "--port", "8001"]
