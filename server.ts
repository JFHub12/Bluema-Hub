import express from 'express';
import { createServer as createViteServer } from 'vite';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const PYTHON_PORT = 5001;

let pythonProcess: ChildProcess | null = null;

function isPortInUse(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(400);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function startPythonBackend() {
  const inUse = await isPortInUse(PYTHON_PORT);
  if (inUse) {
    console.log(`[Full-Stack] Python microservice is already active on port ${PYTHON_PORT}. Reusing existing instance.`);
    return;
  }

  const scriptPath = path.join(__dirname, 'backend', 'server.py');
  console.log(`[Full-Stack] Launching Python backend from ${scriptPath} on port ${PYTHON_PORT}...`);
  
  pythonProcess = spawn('python3', [scriptPath], {
    env: { 
      ...process.env, 
      PYTHON_PORT: String(PYTHON_PORT),
      PAYMENT_API_KEY: process.env.PAYMENT_API_KEY || '05935632-6968-4a2e-919a-8c0ea161d3f6'
    },
    stdio: 'inherit'
  });

  pythonProcess.on('error', (err) => {
    console.error('[Python Backend Error]:', err);
  });

  pythonProcess.on('exit', (code, signal) => {
    console.log(`[Python Backend Exit]: code=${code}, signal=${signal}`);
  });
}

async function startServer() {
  // Start or reuse Python SQLite microservice
  await startPythonBackend();

  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Proxy /api requests to the Python backend
  app.all('/api/*', async (req, res) => {
    const targetUrl = `http://127.0.0.1:${PYTHON_PORT}${req.originalUrl}`;
    try {
      const options: RequestInit = {
        method: req.method,
        headers: {
          'Content-Type': req.headers['content-type'] || 'application/json',
          'Accept': 'application/json',
          'Authorization': req.headers['authorization'] || `Bearer ${process.env.PAYMENT_API_KEY || '05935632-6968-4a2e-919a-8c0ea161d3f6'}`
        }
      };

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        options.body = JSON.stringify(req.body);
      }

      const response = await fetch(targetUrl, options);
      const data = await response.text();
      
      res.status(response.status);
      res.setHeader('Content-Type', 'application/json');
      res.send(data);
    } catch (error) {
      console.warn(`[Proxy to Python failed for ${req.originalUrl}]:`, error);
      res.status(502).json({
        error: 'Python backend is initializing or unavailable. Please retry in a moment.',
        backend: 'Python 3',
        supportPhone: '059 883 0932'
      });
    }
  });

  // Health endpoint fallback
  app.get('/api-status', (_req, res) => {
    res.json({
      server: 'Express Full-Stack + Python Backend',
      pythonPort: PYTHON_PORT,
      status: 'active',
      support: '059 883 0932'
    });
  });

  // Explicit SEO & AI Crawler Directives endpoints
  app.get('/sitemap.xml', (_req, res) => {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
  });

  app.get('/robots.txt', (_req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
  });

  // Explicit PWA Manifest & Service Worker delivery with proper headers
  app.get('/manifest.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
  });

  app.get('/sw.js', (_req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(__dirname, 'public', 'sw.js'));
  });

  // Standalone Individual Legal Pages (/terms and /privacy)
  app.get(['/terms', '/terms.html'], (_req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    const prodFile = path.join(__dirname, 'dist', 'terms.html');
    const rootFile = path.join(__dirname, 'terms.html');
    const pubFile = path.join(__dirname, 'public', 'terms.html');
    if (process.env.NODE_ENV === 'production' && fs.existsSync(prodFile)) {
      res.sendFile(prodFile);
    } else if (fs.existsSync(rootFile)) {
      res.sendFile(rootFile);
    } else {
      res.sendFile(pubFile);
    }
  });

  app.get(['/privacy', '/privacy.html'], (_req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    const prodFile = path.join(__dirname, 'dist', 'privacy.html');
    const rootFile = path.join(__dirname, 'privacy.html');
    const pubFile = path.join(__dirname, 'public', 'privacy.html');
    if (process.env.NODE_ENV === 'production' && fs.existsSync(prodFile)) {
      res.sendFile(prodFile);
    } else if (fs.existsSync(rootFile)) {
      res.sendFile(rootFile);
    } else {
      res.sendFile(pubFile);
    }
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Mount Vite middleware in dev
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VERFIED] Server listening at http://localhost:${PORT}`);
  });

  // Graceful shutdown
  const cleanup = () => {
    if (pythonProcess) {
      pythonProcess.kill();
    }
    server.close();
    process.exit(0);
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

startServer();
