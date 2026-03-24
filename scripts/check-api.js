const http = require('http');

const HOST = '127.0.0.1';
const START_PORT = 3000;
const END_PORT = 3010;
const PATHNAME = '/api/test';

function requestHealth(port) {
  return new Promise((resolve) => {
    const req = http.get(
      {
        host: HOST,
        port,
        path: PATHNAME,
        timeout: 1500,
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(raw || '{}');
            if (res.statusCode === 200 && parsed.message === 'API is working!') {
              resolve({ ok: true, port, message: parsed.message });
              return;
            }
          } catch {
            // Ignore parse errors and treat as unhealthy.
          }
          resolve({ ok: false, port });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, port });
    });

    req.on('error', () => {
      resolve({ ok: false, port });
    });
  });
}

async function main() {
  for (let port = START_PORT; port <= END_PORT; port += 1) {
    const result = await requestHealth(port);
    if (result.ok) {
      console.log(`Backend health check passed on http://localhost:${result.port}${PATHNAME}`);
      process.exit(0);
    }
  }

  console.error('Backend health check failed: no healthy /api/test endpoint found on ports 3000-3010.');
  console.error('Start backend first with: npm run dev:backend (from project root) or npm --prefix backend start');
  process.exit(1);
}

main();
