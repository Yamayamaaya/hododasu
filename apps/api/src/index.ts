// 環境変数を最初に読み込む
import './config/env';
import { env } from './config/env';
import { OpenAPIHono } from '@hono/zod-openapi';
import { serve } from '@hono/node-server';
import { swaggerUI } from '@hono/swagger-ui';
import sessionsRouter from './routes/sessions';

const app = new OpenAPIHono();

// CORS設定（手動実装）
app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }
  await next();
});

// ヘルスチェック
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// APIルート
app.get('/', (c) => {
  return c.json({ message: 'Hododasu API' });
});

app.route('/api/sessions', sessionsRouter);

// OpenAPI仕様書のエンドポイント
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Hododasu API',
    description: '割り勘計算API',
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}`,
      description: '開発環境',
    },
  ],
});

// Swagger UIエンドポイント
app.get('/swagger', swaggerUI({ url: '/doc' }));

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
