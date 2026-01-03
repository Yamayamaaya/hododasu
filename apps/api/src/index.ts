// 環境変数を最初に読み込む
import './config/env';
import { env } from './config/env';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import sessionsRouter from './routes/sessions';

const app = new Hono();

// CORS設定
app.use('/*', cors());

// ヘルスチェック
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// APIルート
app.get('/', (c) => {
  return c.json({ message: 'Hododasu API' });
});

app.route('/api/sessions', sessionsRouter);

const port = env.PORT;

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`🚀 Server is running on http://localhost:${info.port}`);
  }
);
