import express from 'express';
import path from 'path';
import fs from 'fs';
import { apiRouter } from './server/api';
import { db } from './server/db';

const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Router
  app.use('/api', apiRouter);

  // SEO: Dynamic Robots.txt
  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *
Allow: /
Disallow: /admin
Sitemap: https://eragadgets.ng/sitemap.xml
`);
  });

  // SEO: Dynamic Sitemap.xml
  app.get('/sitemap.xml', (_req, res) => {
    const products = db.getProducts({ status: 'Published' });
    const baseUrl = 'https://eragadgets.ng';
    const now = new Date().toISOString();

    const staticRoutes = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: '/shop', priority: '0.9', changefreq: 'daily' },
      { path: '/iphone', priority: '0.8', changefreq: 'weekly' },
      { path: '/samsung', priority: '0.8', changefreq: 'weekly' },
      { path: '/mac', priority: '0.8', changefreq: 'weekly' },
      { path: '/deals', priority: '0.8', changefreq: 'daily' },
      { path: '/contact', priority: '0.5', changefreq: 'monthly' }
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const route of staticRoutes) {
      xml += `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>\n`;
    }

    for (const p of products) {
      xml += `  <url>
    <loc>${baseUrl}/products/${p.slug}</loc>
    <lastmod>${p.updatedAt || now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    }

    xml += `</urlset>`;
    res.type('application/xml');
    res.send(xml);
  });

  if (!isProduction) {
    // Vite Dev Server middleware mode
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Era Gadgets] Server listening on http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[Era Gadgets] Server startup error:', err);
  process.exit(1);
});
