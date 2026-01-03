import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db';
import { sessions, sessionParticipants } from '../db/schema';
import { eq } from 'drizzle-orm';
import {
  createSessionRequestSchema,
  updateSessionRequestSchema,
} from '@hododasu/shared';
import { calculateShareAmounts } from '../utils/calculation';
import { nanoid } from 'nanoid';

const sessionsRouter = new Hono();

// POST /api/sessions
sessionsRouter.post(
  '/',
  zValidator('json', createSessionRequestSchema),
  async (c) => {
    const data = c.req.valid('json');
    const editId = nanoid();

    try {
      // セッションを作成
      const [session] = await db
        .insert(sessions)
        .values({
          editId,
          title: data.title || null,
          totalAmount: data.totalAmount,
          messageTemplate: data.messageTemplate || null,
          attachDetailsLink: data.attachDetailsLink ?? false,
        })
        .returning();

      // 参加者を作成（計算はまだ行わない）
      if (data.participants.length > 0) {
        await db.insert(sessionParticipants).values(
          data.participants.map((p) => ({
            sessionId: session.id,
            name: p.name,
            weight: p.weight,
            shareAmount: null, // 初期状態では計算しない
          }))
        );
      }

      return c.json({ editId }, 201);
    } catch (error) {
      console.error('Error creating session:', error);
      return c.json({ error: 'Failed to create session' }, 500);
    }
  }
);

// GET /api/sessions/:editId
sessionsRouter.get('/:editId', async (c) => {
  const editId = c.req.param('editId');

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
sessionsRouter.patch(
  '/:editId',
  zValidator('json', updateSessionRequestSchema),
  async (c) => {
    const editId = c.req.param('editId');
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
        title?: string | null;
        totalAmount?: number;
        messageTemplate?: string | null;
        attachDetailsLink?: boolean;
        updatedAt?: Date;
      } = {
        updatedAt: new Date(),
      };

      if (data.title !== undefined) updateData.title = data.title || null;
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

// DELETE /api/sessions/:editId
sessionsRouter.delete('/:editId', async (c) => {
  const editId = c.req.param('editId');

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

