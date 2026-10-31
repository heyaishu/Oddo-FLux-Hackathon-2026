/**
 * Brightloop Standalone Backend Server Entry
 * Run via: npx tsx server.ts
 */

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { app } from './src/backend/app.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// If dist directory exists, serve static frontend assets
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// For non-API routes, fallback to index.html if dist exists
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      next();
    }
  });
});

app.listen(PORT, () => {
  console.log(`Brightloop Backend Server listening on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
  console.log(`Health Check: http://localhost:${PORT}/api/health`);
});
