import { OpenAPIHono } from '@hono/zod-openapi';
import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { db } from '../db';
import { sessions, sessionParticipants } from '../db/schema';
import { eq } from 'drizzle-orm';
import {
  createSessionRequestSchema,
  updateSessionRequestSchema,
  createSessionResponseSchema,
  sessionResponseSchema,
  errorResponseSchema,
  deleteSessionResponseSchema,
} from '@hododasu/shared';
import { calculateShareAmounts } from '../utils/calculation';
import { nanoid } from 'nanoid';

const sessionsRouter = new OpenAPIHono();

// POST /api/sessions
const createSessionRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Sessions'],
  summary: 'セッションを作成',
  description: '新しい割り勘セッションを作成します',
  request: {
    body: {
      content: {
        'application/json': {
          schema: createSessionRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'セッションが正常に作成されました',
      content: {
        'application/json': {
          schema: createSessionResponseSchema,
        },
      },
    },
    500: {
      description: 'サーバーエラー',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

sessionsRouter.openapi(createSessionRoute, async (c) => {
  const data = c.req.valid('json');
  const editId = nanoid();
  const resultId = nanoid();

  try {
    // セッションを作成
    const [session] = await db
      .insert(sessions)
      .values({
        editId,
        resultId,
        title: data.title,
        totalAmount: data.totalAmount,
        messageTemplate: data.messageTemplate || null,
        attachDetailsLink: data.attachDetailsLink ?? false,
      })
      .returning();

    // 参加者を作成
    if (data.participants.length > 0) {
      await db.insert(sessionParticipants).values(
        data.participants.map((p) => ({
          sessionId: session.id,
          name: p.name,
          weight: p.weight,
          shareAmount: null, // 後で計算
        }))
      );

      // 作成した参加者を取得
      const currentParticipants = await db
        .select()
        .from(sessionParticipants)
        .where(eq(sessionParticipants.sessionId, session.id));

      // 計算を実行
      const calculatedAmounts = calculateShareAmounts(
        session.totalAmount,
        currentParticipants.map((p) => ({
          name: p.name,
          weight: p.weight,
        }))
      );

      // 計算結果を保存
      for (const calculated of calculatedAmounts) {
        const participant = currentParticipants.find(
          (p) => p.name === calculated.name
        );
        if (participant) {
          await db
            .update(sessionParticipants)
            .set({ shareAmount: calculated.shareAmount })
            .where(eq(sessionParticipants.id, participant.id));
        }
      }
    }

    return c.json({ editId }, 201);
  } catch (error) {
    console.error('Error creating session:', error);
    return c.json({ error: 'Failed to create session' }, 500);
  }
});

// GET /api/sessions/:editId
const getSessionRoute = createRoute({
  method: 'get',
  path: '/{editId}',
  tags: ['Sessions'],
  summary: 'セッションを取得',
  description: 'editIdを使用してセッション情報を取得します',
  request: {
    params: z.object({
      editId: z.string().describe('編集用ID'),
    }),
  },
  responses: {
    200: {
      description: 'セッション情報',
      content: {
        'application/json': {
          schema: sessionResponseSchema,
        },
      },
    },
    404: {
      description: 'セッションが見つかりません',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    500: {
      description: 'サーバーエラー',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

sessionsRouter.openapi(getSessionRoute, async (c) => {
  const { editId } = c.req.valid('param');

  try {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.editId, editId))
      .limit(1);

    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    const participants = await db
      .select()
      .from(sessionParticipants)
      .where(eq(sessionParticipants.sessionId, session.id));

    return c.json({
      id: session.id,
      editId: session.editId,
      resultId: session.resultId,
      title: session.title,
      totalAmount: session.totalAmount,
      messageTemplate: session.messageTemplate,
      attachDetailsLink: session.attachDetailsLink,
      participants: participants.map((p) => ({
        id: p.id,
        name: p.name,
        weight: p.weight,
        shareAmount: p.shareAmount,
      })),
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return c.json({ error: 'Failed to fetch session' }, 500);
  }
});

// PATCH /api/sessions/:editId
const updateSessionRoute = createRoute({
  method: 'patch',
  path: '/{editId}',
  tags: ['Sessions'],
  summary: 'セッションを更新',
  description: 'editIdを使用してセッション情報を更新し、割り勘金額を計算します',
  request: {
    params: z.object({
      editId: z.string().describe('編集用ID'),
    }),
    body: {
      content: {
        'application/json': {
          schema: updateSessionRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'セッションが正常に更新されました',
      content: {
        'application/json': {
          schema: sessionResponseSchema,
        },
      },
    },
    404: {
      description: 'セッションが見つかりません',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    500: {
      description: 'サーバーエラー',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

sessionsRouter.openapi(updateSessionRoute, async (c) => {
  const { editId } = c.req.valid('param');
  const data = c.req.valid('json');

    try {
      // セッションを取得
      const [session] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.editId, editId))
        .limit(1);

      if (!session) {
        return c.json({ error: 'Session not found' }, 404);
      }

      // セッション情報を更新
      const updateData: {
        title?: string;
        totalAmount?: number;
        messageTemplate?: string | null;
        attachDetailsLink?: boolean;
        updatedAt?: Date;
      } = {
        updatedAt: new Date(),
      };

      if (data.title !== undefined) updateData.title = data.title;
      if (data.totalAmount !== undefined) updateData.totalAmount = data.totalAmount;
      if (data.messageTemplate !== undefined)
        updateData.messageTemplate = data.messageTemplate || null;
      if (data.attachDetailsLink !== undefined)
        updateData.attachDetailsLink = data.attachDetailsLink;

      await db.update(sessions).set(updateData).where(eq(sessions.id, session.id));

      // 参加者を更新
      if (data.participants !== undefined) {
        // 既存の参加者を削除
        await db
          .delete(sessionParticipants)
          .where(eq(sessionParticipants.sessionId, session.id));

        // 新しい参加者を追加
        if (data.participants.length > 0) {
          await db.insert(sessionParticipants).values(
            data.participants.map((p) => ({
              sessionId: session.id,
              name: p.name,
              weight: p.weight,
              shareAmount: null, // 後で計算
            }))
          );
        }
      }

      // 更新後のセッション情報を取得
      const [updatedSession] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, session.id))
        .limit(1);

      const currentParticipants = await db
        .select()
        .from(sessionParticipants)
        .where(eq(sessionParticipants.sessionId, session.id));

      // 計算を実行（PATCH時に確定）
      const calculatedAmounts = calculateShareAmounts(
        updatedSession.totalAmount,
        currentParticipants.map((p) => ({
          name: p.name,
          weight: p.weight,
        }))
      );

      // 計算結果を保存
      for (const calculated of calculatedAmounts) {
        const participant = currentParticipants.find(
          (p) => p.name === calculated.name
        );
        if (participant) {
          await db
            .update(sessionParticipants)
            .set({ shareAmount: calculated.shareAmount })
            .where(eq(sessionParticipants.id, participant.id));
        }
      }

      // 更新後のデータを取得して返す
      const finalParticipants = await db
        .select()
        .from(sessionParticipants)
        .where(eq(sessionParticipants.sessionId, session.id));

      return c.json({
        id: updatedSession.id,
        editId: updatedSession.editId,
        resultId: updatedSession.resultId,
        title: updatedSession.title,
        totalAmount: updatedSession.totalAmount,
        messageTemplate: updatedSession.messageTemplate,
        attachDetailsLink: updatedSession.attachDetailsLink,
        participants: finalParticipants.map((p) => ({
          id: p.id,
          name: p.name,
          weight: p.weight,
          shareAmount: p.shareAmount,
        })),
        createdAt: updatedSession.createdAt.toISOString(),
        updatedAt: updatedSession.updatedAt.toISOString(),
      });
    } catch (error) {
      console.error('Error updating session:', error);
      return c.json({ error: 'Failed to update session' }, 500);
    }
  }
);

// GET /api/sessions/result/:resultId
const getSessionByResultIdRoute = createRoute({
  method: 'get',
  path: '/result/{resultId}',
  tags: ['Sessions'],
  summary: '結果IDでセッションを取得',
  description: 'resultIdを使用してセッション情報を取得します',
  request: {
    params: z.object({
      resultId: z.string().describe('結果表示用ID'),
    }),
  },
  responses: {
    200: {
      description: 'セッション情報',
      content: {
        'application/json': {
          schema: sessionResponseSchema,
        },
      },
    },
    404: {
      description: 'セッションが見つかりません',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    500: {
      description: 'サーバーエラー',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

sessionsRouter.openapi(getSessionByResultIdRoute, async (c) => {
  const { resultId } = c.req.valid('param');

  try {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.resultId, resultId))
      .limit(1);

    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    const participants = await db
      .select()
      .from(sessionParticipants)
      .where(eq(sessionParticipants.sessionId, session.id));

    return c.json({
      id: session.id,
      editId: session.editId,
      resultId: session.resultId,
      title: session.title,
      totalAmount: session.totalAmount,
      messageTemplate: session.messageTemplate,
      attachDetailsLink: session.attachDetailsLink,
      participants: participants.map((p) => ({
        id: p.id,
        name: p.name,
        weight: p.weight,
        shareAmount: p.shareAmount,
      })),
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return c.json({ error: 'Failed to fetch session' }, 500);
  }
});

// DELETE /api/sessions/:editId
const deleteSessionRoute = createRoute({
  method: 'delete',
  path: '/{editId}',
  tags: ['Sessions'],
  summary: 'セッションを削除',
  description: 'editIdを使用してセッションを削除します',
  request: {
    params: z.object({
      editId: z.string().describe('編集用ID'),
    }),
  },
  responses: {
    200: {
      description: 'セッションが正常に削除されました',
      content: {
        'application/json': {
          schema: deleteSessionResponseSchema,
        },
      },
    },
    404: {
      description: 'セッションが見つかりません',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
    500: {
      description: 'サーバーエラー',
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
    },
  },
});

sessionsRouter.openapi(deleteSessionRoute, async (c) => {
  const { editId } = c.req.valid('param');

  try {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.editId, editId))
      .limit(1);

    if (!session) {
      return c.json({ error: 'Session not found' }, 404);
    }

    // 参加者は外部キー制約で自動削除される（cascade）
    await db.delete(sessions).where(eq(sessions.id, session.id));

    return c.json({ message: 'Session deleted' }, 200);
  } catch (error) {
    console.error('Error deleting session:', error);
    return c.json({ error: 'Failed to delete session' }, 500);
  }
});

export default sessionsRouter;

