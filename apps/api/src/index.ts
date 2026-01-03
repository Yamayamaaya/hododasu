import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

app.get('/', (c) => {
  return c.json({ message: 'Hododasu API' });
});

const port = Number(process.env.PORT) || 8787;

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`🚀 Server is running on http://localhost:${info.port}`);
});

