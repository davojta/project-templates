import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import api from './src/api/index.js';

const app = new Hono();

const isDev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);

app.route('/api', api);

app.use('/data/*', serveStatic({ root: './' }));

if (isDev) {
  app.get('*', async (c) => {
    const viteUrl = `http://localhost:5173${c.req.path}`;
    try {
      const res = await fetch(viteUrl);
      return new Response(res.body, {
        status: res.status,
        headers: res.headers,
      });
    } catch (error) {
      return c.json({ error: 'Vite dev server not running' }, 503);
    }
  });
} else {
  app.use('/*', serveStatic({ root: './dist/client' }));
  app.get('*', serveStatic({ path: './dist/client/index.html' }));
}

console.log(`Server running on http://localhost:${port}`);
console.log(`Mode: ${isDev ? 'development' : 'production'}`);

export default {
  port,
  fetch: app.fetch,
};
