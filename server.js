const express = require('express');
const os = require('os');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// In-memory visitor counter
let visitorCount = 0;

// Get container/hostname ID
const containerId = os.hostname();
const startTime = new Date();

// Logger utility
const logger = {
  info: (msg) => console.log(`[${new Date().toISOString()}] INFO: ${msg}`),
  error: (msg, err) => console.error(`[${new Date().toISOString()}] ERROR: ${msg}`, err || ''),
  warn: (msg) => console.warn(`[${new Date().toISOString()}] WARN: ${msg}`)
};

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check middleware - runs before static files
app.get('/health', (req, res) => {
  try {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      startTime: startTime.toISOString(),
      containerId: containerId,
      visitorCount: visitorCount,
      environment: NODE_ENV,
      memory: process.memoryUsage()
    });
  } catch (err) {
    logger.error('Health check failed', err);
    res.status(500).json({ status: 'error', message: 'Health check failed' });
  }
});

// Ready check endpoint
app.get('/ready', (req, res) => {
  try {
    if (process.uptime() < 2) {
      return res.status(503).json({ status: 'not_ready', message: 'Application starting' });
    }
    res.status(200).json({ status: 'ready' });
  } catch (err) {
    logger.error('Ready check failed', err);
    res.status(500).json({ status: 'error', message: 'Ready check failed' });
  }
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  try {
    const mem = process.memoryUsage();
    res.status(200).json({
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024) + ' MB',
        rss: Math.round(mem.rss / 1024 / 1024) + ' MB'
      },
      requests: visitorCount
    });
  } catch (err) {
    logger.error('Metrics endpoint failed', err);
    res.status(500).json({ status: 'error', message: 'Metrics unavailable' });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Main route with error handling
app.get('/', (req, res) => {
  try {
    visitorCount++;
    const timestamp = new Date().toISOString();
    
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Node.js K8s App</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .container {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 24px;
      padding: 48px;
      max-width: 600px;
      width: 90%;
      box-shadow: 0 25px 50px rgba(0,0,0,0.3);
    }
    h1 {
      font-size: 2.2rem;
      margin-bottom: 8px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      color: rgba(255,255,255,0.6);
      margin-bottom: 32px;
      font-size: 0.95rem;
    }
    .info-card {
      background: rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 20px 24px;
      margin-bottom: 16px;
      border: 1px solid rgba(255,255,255,0.06);
      transition: transform 0.2s, background 0.2s;
    }
    .info-card:hover {
      transform: translateY(-2px);
      background: rgba(255,255,255,0.12);
    }
    .info-card .label {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: rgba(255,255,255,0.4);
      margin-bottom: 6px;
    }
    .info-card .value {
      font-size: 1.15rem;
      font-weight: 600;
      word-break: break-all;
    }
    .visitor-count .value {
      font-size: 2rem;
      background: linear-gradient(90deg, #f093fb, #f5576c);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .footer {
      margin-top: 32px;
      text-align: center;
      color: rgba(255,255,255,0.3);
      font-size: 0.8rem;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(72, 199, 142, 0.15);
      color: #48c78e;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 24px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      background: #48c78e;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
    .endpoints {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    .endpoint-link {
      display: block;
      padding: 8px 12px;
      margin: 4px 0;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 8px;
      text-decoration: none;
      color: #667eea;
      font-size: 0.9rem;
      transition: background 0.2s;
    }
    .endpoint-link:hover {
      background: rgba(102, 126, 234, 0.2);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="status-badge"><span class="status-dot"></span> Running on Kubernetes</div>
    <h1>Node.js K8s Application</h1>
    <p class="subtitle">Deployed with Docker &amp; Kubernetes on AWS Free Tier with CI/CD</p>
    
    <div class="info-card">
      <div class="label">⏰ Current Timestamp</div>
      <div class="value">${timestamp}</div>
    </div>
    
    <div class="info-card">
      <div class="label">🐳 Container / Pod ID</div>
      <div class="value">${containerId}</div>
    </div>
    
    <div class="info-card visitor-count">
      <div class="label">👥 Visitor Count</div>
      <div class="value">${visitorCount}</div>
    </div>

    <div class="endpoints">
      <div class="label">📊 Available Endpoints</div>
      <a href="/health" class="endpoint-link">GET /health - Health Check</a>
      <a href="/ready" class="endpoint-link">GET /ready - Readiness Check</a>
      <a href="/metrics" class="endpoint-link">GET /metrics - Metrics</a>
    </div>
    
    <div class="footer">
      Cloud Computing Project &bull; Docker &bull; Kubernetes &bull; GitHub Actions CI/CD
    </div>
  </div>
</body>
</html>
    `);
  } catch (err) {
    logger.error('Main route error', err);
    res.status(500).send('<h1>500 - Internal Server Error</h1>');
  }
});

// 404 handler
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    status: 'error',
    message: 'Not Found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error on ${req.method} ${req.path}`, err);
  
  const status = err.status || 500;
  const message = NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  
  res.status(status).json({
    status: 'error',
    message: message,
    ...(NODE_ENV !== 'production' && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handlers
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, starting graceful shutdown...`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  
  setTimeout(() => {
    logger.error('Shutdown timeout, forcing exit');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Container ID: ${containerId}`);
  logger.info(`Environment: ${NODE_ENV}`);
  logger.info(`Start time: ${startTime.toISOString()}`);
});
