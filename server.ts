import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { apiRouter } from './server/routes.js';
import { db } from './server/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Initialize SOC Database & ML pipeline
  await db.initialize();

  // API router
  app.use('/api', apiRouter);

  // Vite integration
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[CyberSentinel Server] Vite dev middleware attached.');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`[CyberSentinel Server] Serving production build from ${distPath}`);
  }

  app.listen(PORT, () => {
    console.log(`[CyberSentinel SOC Platform] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[CyberSentinel Server Error]', err);
  process.exit(1);
});
