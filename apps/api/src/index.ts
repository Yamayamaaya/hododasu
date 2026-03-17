// 環境変数を最初に読み込む
import './config/env';
import { env } from './config/env';
import { OpenAPIHono, $ } from '@hono/zod-openapi';
import { serve } from '@hono/node-server';
import { swaggerUI } from '@hono/swagger-ui';
import { cors } from 'hono/cors';
import sessionsRouter from './routes/sessions';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { getDirectClient } from './db';

const baseApp = new OpenAPIHono();

// CORS設定（Hono公式ミドルウェアを使用）
baseApp.use(
  '*',
  cors({
    origin: ['http://localhost:3000'], // 開発環境のフロントエンドURL
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// OpenAPIHono型に復元
const app = $(baseApp);

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

const directClient = getDirectClient();
await migrate(drizzle(directClient), { migrationsFolder: './drizzle' });
await directClient.end();

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
