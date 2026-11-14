import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 50 },   // Sustained load of 50 concurrent requests
    { duration: '20s', target: 0 },   // Cool down
  ],
  thresholds: {
    // Section 1.2 Non-functional requirement: Inference latency under 2 seconds p95
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.01'],    // Error rate must be under 1%
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8000';

export default function () {
  // 1. Health check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health returns 200': (r) => r.status === 200,
  });

  // 2. Fetch diseases library
  const diseasesRes = http.get(`${BASE_URL}/api/v1/diseases?lang=en`);
  check(diseasesRes, {
    'diseases returns 200': (r) => r.status === 200,
  });

  // 3. Fetch outbreak news
  const newsRes = http.get(`${BASE_URL}/api/v1/news`);
  check(newsRes, {
    'news returns 200': (r) => r.status === 200,
  });

  sleep(1);
}
