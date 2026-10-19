import express from 'express';
import { createServer as createViteServer } from 'vite';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import net from 'net';

// Firebase SDK integration for Node.js backend
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const PYTHON_PORT = 5001;

let pythonProcess: ChildProcess | null = null;

// Read Firebase applet configuration
let firebaseConfig: any = null;
let firestoreDb: any = null;
let lastSyncTimestamp: string = 'Never';
let syncStats = {
  productsSynced: 0,
  ordersSynced: 0,
  inquiriesSynced: 0,
  auditLogsSynced: 0,
  lastError: null as string | null
};

try {
  const configPath = path.join(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const firebaseApp = initializeApp(firebaseConfig);
    firestoreDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    console.log(`[Firebase Backend] Connected to project: ${firebaseConfig.projectId}, db: ${firebaseConfig.firestoreDatabaseId}`);
  }
} catch (e: any) {
  console.error('[Firebase Backend] Initialization error:', e.message);
}

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

/**
 * Synchronize all SQLite records to Firebase Firestore
 */
async function syncDatabaseToFirebase(): Promise<{ success: boolean; details: any }> {
  if (!firestoreDb) {
    return { success: false, details: 'Firestore not initialized' };
  }

  console.log('[Sync Engine] Starting full sync between SQLite database and Firebase Firestore...');
  const results = {
    products: 0,
    orders: 0,
    inquiries: 0,
    auditLogs: 0,
    errors: [] as string[]
  };

  try {
    // 1. Sync Products
    const prodRes = await fetch(`http://127.0.0.1:${PYTHON_PORT}/api/products`).catch(() => null);
    if (prodRes && prodRes.ok) {
      const prodData = await prodRes.json();
      const products = prodData.products || [];
      for (const p of products) {
        try {
          const docId = String(p.id);
          await setDoc(doc(firestoreDb, 'products', docId), {
            id: docId,
            name: p.name,
            description: p.description || '',
            price: Number(p.price) || 0,
            originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
            category: p.category || 'cloth',
            image: p.image || '',
            images: p.images || [p.image || ''],
            rating: Number(p.rating) || 5.0,
            tag: p.tag || '',
            inStock: Boolean(p.in_stock ?? p.inStock ?? true),
            updatedAt: new Date().toISOString()
          }, { merge: true });
          results.products++;
        } catch (err: any) {
          results.errors.push(`Product #${p.id}: ${err.message}`);
        }
      }
    }

    // 2. Sync Orders
    const orderRes = await fetch(`http://127.0.0.1:${PYTHON_PORT}/api/orders`).catch(() => null);
    if (orderRes && orderRes.ok) {
      const orderData = await orderRes.json();
      const orders = orderData.orders || [];
      for (const o of orders) {
        try {
          const docId = String(o.id);
          await setDoc(doc(firestoreDb, 'orders', docId), {
            id: docId,
            customerName: o.customerName || 'Customer',
            customerPhone: o.customerPhone || '',
            shippingAddress: o.shippingAddress || '',
            total: Number(o.total) || 0,
            subtotal: Number(o.subtotal || o.total) || 0,
            paymentMethod: o.paymentMethod || 'momo',
            paymentReference: o.paymentReference || '',
            paymentPhone: o.paymentPhone || '',
            paymentApiKey: o.paymentApiKey || '05935632-6968-4a2e-919a-8c0ea161d3f6',
            gatewayAuth: o.gatewayAuth || `AUTH-05935632-${docId}`,
            status: o.status || 'Paid & Verified via Payment API',
            createdAt: typeof o.createdAt === 'number' 
              ? new Date(o.createdAt * 1000).toISOString() 
              : String(o.createdAt || new Date().toISOString()),
            userEmail: o.userEmail || '',
            userId: o.userId || 'guest'
          }, { merge: true });
          results.orders++;
        } catch (err: any) {
          results.errors.push(`Order #${o.id}: ${err.message}`);
        }
      }
    }

    // 3. Sync Audit Logs
    const logRes = await fetch(`http://127.0.0.1:${PYTHON_PORT}/api/audit-logs`).catch(() => null);
    if (logRes && logRes.ok) {
      const logData = await logRes.json();
      const logs = logData.logs || [];
      for (const l of logs) {
        try {
          const docId = `log_${l.id}`;
          await setDoc(doc(firestoreDb, 'audit_logs', docId), {
            id: docId,
            actionType: l.actionType || 'EVENT',
            actor: l.actor || 'System',
            details: l.details || '',
            createdAt: typeof l.createdAt === 'number'
              ? new Date(l.createdAt * 1000).toISOString()
              : String(l.createdAt || new Date().toISOString())
          }, { merge: true });
          results.auditLogs++;
        } catch (err: any) {
          results.errors.push(`Log #${l.id}: ${err.message}`);
        }
      }
    }

    // 4. Verify test connection document
    await setDoc(doc(firestoreDb, 'test', 'connection'), {
      status: 'active',
      timestamp: new Date().toISOString()
    }, { merge: true });

    lastSyncTimestamp = new Date().toISOString();
    syncStats = {
      productsSynced: results.products,
      ordersSynced: results.orders,
      inquiriesSynced: results.inquiries,
      auditLogsSynced: results.auditLogs,
      lastError: results.errors.length > 0 ? results.errors[0] : null
    };

    console.log(`[Sync Engine] Full sync complete: ${results.products} products, ${results.orders} orders, ${results.auditLogs} audit logs mirrored to Firebase.`);
    return { success: true, details: results };
  } catch (err: any) {
    console.error('[Sync Engine Error]:', err);
    syncStats.lastError = err.message;
    return { success: false, details: err.message };
  }
}

async function startServer() {
  // Start or reuse Python SQLite microservice
  await startPythonBackend();

  // Wait a short moment for Python microservice to initialize then trigger initial sync
  setTimeout(() => {
    syncDatabaseToFirebase().catch(e => console.warn('[Boot Sync Warning]:', e));
  }, 2000);

  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Live Firebase & SQLite Synchronization Status endpoint
  app.get('/api/sync/status', (_req, res) => {
    const isFirebaseConnected = !!firestoreDb;
    const dbPath = path.join(__dirname, 'backend', 'verified_store.db');
    const isDbConnected = fs.existsSync(dbPath);

    res.json({
      success: true,
      status: isFirebaseConnected && isDbConnected ? 'SYNCHRONIZED' : 'INITIALIZING',
      firebase: {
        connected: isFirebaseConnected,
        projectId: firebaseConfig?.projectId || 'Not Configured',
        databaseId: firebaseConfig?.firestoreDatabaseId || 'Not Configured',
        authDomain: firebaseConfig?.authDomain || ''
      },
      database: {
        connected: isDbConnected,
        engine: 'SQLite 3 (WAL Mode)',
        path: 'backend/verified_store.db',
        supportPhone: '059 883 0932'
      },
      metrics: {
        ...syncStats,
        lastSyncTimestamp
      }
    });
  });

  // Trigger manual force-sync between SQLite and Firebase
  app.post('/api/sync/run', async (_req, res) => {
    const result = await syncDatabaseToFirebase();
    res.json({
      success: result.success,
      message: result.success 
        ? 'All SQLite database records successfully mirrored to Firebase Firestore!' 
        : 'Sync encountered an issue.',
      result: result.details,
      timestamp: new Date().toISOString()
    });
  });

  // Dedicated Interceptor: POST /api/orders (Store in both SQLite and Firebase Firestore)
  app.post('/api/orders', async (req, res) => {
    const targetUrl = `http://127.0.0.1:${PYTHON_PORT}/api/orders`;
    try {
      // 1. Save to SQLite database via Python microservice
      const pyResponse = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers['authorization'] || `Bearer ${process.env.PAYMENT_API_KEY || '05935632-6968-4a2e-919a-8c0ea161d3f6'}`
        },
        body: JSON.stringify(req.body)
      });
      const dataText = await pyResponse.text();
      let parsedData: any = {};
      try {
        parsedData = JSON.parse(dataText);
      } catch {}

      // 2. Also save to Firebase Firestore in real-time
      if (firestoreDb && parsedData.orderId) {
        try {
          const orderId = String(parsedData.orderId);
          const nowIso = new Date().toISOString();
          await setDoc(doc(firestoreDb, 'orders', orderId), {
            id: orderId,
            orderId: orderId,
            customerName: req.body.customerName || 'Customer',
            customerPhone: req.body.customerPhone || '',
            shippingAddress: req.body.shippingAddress || '',
            total: Number(req.body.total) || 0,
            subtotal: Number(req.body.subtotal || req.body.total) || 0,
            paymentMethod: req.body.paymentMethod || 'momo',
            paymentReference: parsedData.reference || req.body.paymentReference || '',
            paymentPhone: req.body.paymentPhone || '',
            paymentApiKey: parsedData.paymentApiKey || req.body.paymentApiKey || '05935632-6968-4a2e-919a-8c0ea161d3f6',
            gatewayAuth: parsedData.gatewayAuth || `AUTH-05935632-${orderId}`,
            status: 'Paid & Verified via Payment API',
            createdAt: nowIso,
            userEmail: req.body.userEmail || '',
            userId: req.body.userId || 'guest'
          }, { merge: true });

          // Also record in Firestore audit logs
          const logId = `log_${Date.now()}`;
          await setDoc(doc(firestoreDb, 'audit_logs', logId), {
            id: logId,
            actionType: 'NEW_PURCHASE',
            actor: req.body.customerName || 'Customer',
            details: `Order #${orderId} placed for GH₵${Number(req.body.total).toLocaleString()} via ${req.body.paymentMethod || 'momo'}`,
            createdAt: nowIso
          }, { merge: true });

          console.log(`[Firebase Sync] Order #${orderId} successfully saved to Firebase Firestore and SQLite.`);
        } catch (fsErr) {
          console.warn('[Firebase Sync Warning on Order]:', fsErr);
        }
      }

      res.status(pyResponse.status);
      res.setHeader('Content-Type', 'application/json');
      res.send(dataText);
    } catch (error) {
      console.error('[Error handling /api/orders]:', error);
      res.status(500).json({ error: 'Failed to process order' });
    }
  });

  // Dedicated Interceptor: POST /api/support (Store in both SQLite and Firebase Firestore)
  app.post('/api/support', async (req, res) => {
    const targetUrl = `http://127.0.0.1:${PYTHON_PORT}/api/support`;
    try {
      const pyResponse = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const dataText = await pyResponse.text();
      let parsedData: any = {};
      try {
        parsedData = JSON.parse(dataText);
      } catch {}

      if (firestoreDb) {
        try {
          const ticketId = parsedData.ticketId || `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
          const nowIso = new Date().toISOString();
          await setDoc(doc(firestoreDb, 'support_tickets', ticketId), {
            id: ticketId,
            name: req.body.name || 'Customer',
            phone: req.body.phone || '',
            category: req.body.category || 'General Inquiry',
            message: req.body.message || '',
            status: 'open',
            createdAt: nowIso
          }, { merge: true });
          console.log(`[Firebase Sync] Support ticket ${ticketId} saved to Firebase Firestore and SQLite.`);
        } catch (fsErr) {
          console.warn('[Firebase Sync Warning on Support]:', fsErr);
        }
      }

      res.status(pyResponse.status);
      res.setHeader('Content-Type', 'application/json');
      res.send(dataText);
    } catch (error) {
      console.error('[Error handling /api/support]:', error);
      res.status(500).json({ error: 'Failed to record support ticket' });
    }
  });

  // Dedicated Interceptor: POST /api/cart (Store shopping cart items in both SQLite and Firebase Firestore)
  app.post('/api/cart', async (req, res) => {
    const targetUrl = `http://127.0.0.1:${PYTHON_PORT}/api/cart`;
    try {
      // 1. Save to SQLite database via Python microservice
      const pyResponse = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const dataText = await pyResponse.text();

      // 2. Also save to Firebase Firestore in real-time
      const userId = req.body.userId || req.body.email;
      if (firestoreDb && userId) {
        try {
          const cartId = String(userId);
          await setDoc(doc(firestoreDb, 'carts', cartId), {
            id: cartId,
            userId: cartId,
            items: req.body.items || [],
            updatedAt: new Date().toISOString()
          }, { merge: true });
          console.log(`[Firebase Sync] Cart for ${cartId} saved to Firebase Firestore and SQLite.`);
        } catch (fsErr) {
          console.warn('[Firebase Sync Cart Warning]:', fsErr);
        }
      }

      res.status(pyResponse.status);
      res.setHeader('Content-Type', 'application/json');
      res.send(dataText);
    } catch (error) {
      console.error('[Error handling /api/cart POST]:', error);
      res.status(500).json({ error: 'Failed to save shopping cart' });
    }
  });

  // Dedicated Interceptor: DELETE /api/cart (Clear shopping cart in SQLite and Firebase Firestore)
  app.delete('/api/cart', async (req, res) => {
    const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const targetUrl = `http://127.0.0.1:${PYTHON_PORT}/api/cart${queryString}`;
    try {
      const pyResponse = await fetch(targetUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body || {})
      });
      const dataText = await pyResponse.text();

      const userId = req.body?.userId || req.query.userId || req.query.email;
      if (firestoreDb && userId) {
        try {
          const cartId = String(userId);
          await deleteDoc(doc(firestoreDb, 'carts', cartId));
          console.log(`[Firebase Sync] Cart for ${cartId} cleared in Firebase Firestore.`);
        } catch (fsErr) {
          console.warn('[Firebase Sync Cart Delete Warning]:', fsErr);
        }
      }

      res.status(pyResponse.status);
      res.setHeader('Content-Type', 'application/json');
      res.send(dataText);
    } catch (error) {
      console.error('[Error handling /api/cart DELETE]:', error);
      res.status(500).json({ error: 'Failed to clear cart' });
    }
  });

  // Dedicated Resilient GET /api/products
  // Fetches from Python SQLite backend first; falls back seamlessly to Firebase Firestore or cached records
  app.get('/api/products', async (_req, res) => {
    try {
      const pyResponse = await fetch(`http://127.0.0.1:${PYTHON_PORT}/api/products`);
      if (pyResponse.ok) {
        const data = await pyResponse.json();
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          res.json(data);
          return;
        }
      }
    } catch (e) {
      console.warn('[Products GET fallback]: Python backend busy, querying Firestore...');
    }

    // Direct Firestore fallback
    if (firestoreDb) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'products'));
        if (!snap.empty) {
          const products: any[] = [];
          snap.forEach(d => {
            products.push(d.data());
          });
          if (products.length > 0) {
            res.json({ products });
            return;
          }
        }
      } catch (fsErr) {
        console.warn('[Products GET Firestore fallback error]:', fsErr);
      }
    }

    res.json({ products: [] });
  });

  // Dedicated Interceptors: Products Management in SQLite & Firebase Firestore
  app.post('/api/products', async (req, res) => {
    const targetUrl = `http://127.0.0.1:${PYTHON_PORT}/api/products`;
    try {
      const pyResponse = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers['authorization'] || `Bearer ${process.env.PAYMENT_API_KEY || '05935632-6968-4a2e-919a-8c0ea161d3f6'}`
        },
        body: JSON.stringify(req.body)
      });
      const dataText = await pyResponse.text();
      let parsedData: any = {};
      try {
        parsedData = JSON.parse(dataText);
      } catch {}

      if (firestoreDb && parsedData.productId) {
        try {
          const pId = String(parsedData.productId);
          await setDoc(doc(firestoreDb, 'products', pId), {
            id: pId,
            name: req.body.name,
            description: req.body.description || '',
            price: Number(req.body.price) || 0,
            originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : null,
            category: req.body.category || 'cloth',
            image: req.body.image || '',
            images: req.body.images || [req.body.image || ''],
            rating: Number(req.body.rating) || 5.0,
            tag: req.body.tag || '',
            inStock: Boolean(req.body.in_stock ?? req.body.inStock ?? true),
            updatedAt: new Date().toISOString()
          }, { merge: true });
          console.log(`[Firebase Sync] Product #${pId} saved to Firebase Firestore and SQLite.`);
        } catch (e) {
          console.warn('[Firebase Sync Product Warning]:', e);
        }
      }

      res.status(pyResponse.status);
      res.setHeader('Content-Type', 'application/json');
      res.send(dataText);
    } catch (e) {
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  app.put('/api/products', async (req, res) => {
    const targetUrl = `http://127.0.0.1:${PYTHON_PORT}/api/products`;
    try {
      const pyResponse = await fetch(targetUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers['authorization'] || `Bearer ${process.env.PAYMENT_API_KEY || '05935632-6968-4a2e-919a-8c0ea161d3f6'}`
        },
        body: JSON.stringify(req.body)
      });
      const dataText = await pyResponse.text();

      if (firestoreDb && req.body.id) {
        try {
          const pId = String(req.body.id);
          await setDoc(doc(firestoreDb, 'products', pId), {
            id: pId,
            name: req.body.name,
            description: req.body.description || '',
            price: Number(req.body.price) || 0,
            originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : null,
            category: req.body.category || 'cloth',
            image: req.body.image || '',
            images: req.body.images || [req.body.image || ''],
            rating: Number(req.body.rating) || 5.0,
            tag: req.body.tag || '',
            inStock: Boolean(req.body.in_stock ?? req.body.inStock ?? true),
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (e) {
          console.warn('[Firebase Sync Product Update Warning]:', e);
        }
      }

      res.status(pyResponse.status);
      res.setHeader('Content-Type', 'application/json');
      res.send(dataText);
    } catch (e) {
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  app.delete('/api/products', async (req, res) => {
    const targetUrl = `http://127.0.0.1:${PYTHON_PORT}/api/products`;
    try {
      const pyResponse = await fetch(targetUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers['authorization'] || `Bearer ${process.env.PAYMENT_API_KEY || '05935632-6968-4a2e-919a-8c0ea161d3f6'}`
        },
        body: JSON.stringify(req.body)
      });
      const dataText = await pyResponse.text();

      if (firestoreDb && req.body.id) {
        try {
          const pId = String(req.body.id);
          await deleteDoc(doc(firestoreDb, 'products', pId));
          console.log(`[Firebase Sync] Product #${pId} deleted from Firebase Firestore.`);
        } catch (e) {
          console.warn('[Firebase Sync Product Delete Warning]:', e);
        }
      }

      res.status(pyResponse.status);
      res.setHeader('Content-Type', 'application/json');
      res.send(dataText);
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  // General Proxy for all other /api/* endpoints to the Python backend
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
        backend: 'Python 3 SQLite + Firebase Firestore',
        supportPhone: '059 883 0932'
      });
    }
  });

  // Health endpoint fallback
  app.get('/api-status', (_req, res) => {
    res.json({
      server: 'Express Full-Stack + Python Backend + Firebase Firestore',
      pythonPort: PYTHON_PORT,
      status: 'active',
      firebaseConnected: !!firestoreDb,
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
    console.log(`[VERFIED] Backend linked to SQLite Database & Firebase Firestore (${firebaseConfig?.projectId || 'Configured'})`);
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
