import { z } from 'zod';

// 参加者スキーマ
export const participantSchema = z.object({
  name: z.string().min(1),
  weight: z.number().int().min(1).default(100),
});

// セッション作成・更新用スキーマ
export const sessionInputSchema = z.object({
  title: z.string().min(1),
  totalAmount: z.number().int().min(0),
  participants: z.array(participantSchema).min(1),
  messageTemplate: z.string().optional(),
  attachDetailsLink: z.boolean().default(false),
  roundingMethod: z.enum(['round_up', 'round_down', 'round_half_up']).default('round_half_up'),
  roundingUnit: z.union([z.literal(0.1), z.literal(1), z.literal(10), z.literal(100)]).default(0.1),
});

// API リクエスト/レスポンス用スキーマ
export const createSessionRequestSchema = sessionInputSchema;
export const updateSessionRequestSchema = sessionInputSchema.partial();

export const createSessionResponseSchema = z.object({
  editId: z.string(),
});

export const sessionParticipantResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  weight: z.number().int(),
  shareAmount: z.number().int().nullable(),
});

export const sessionResponseSchema = z.object({
  id: z.string(),
  editId: z.string(),
  resultId: z.string(),
  title: z.string(),
  totalAmount: z.number().int(),
  messageTemplate: z.string().nullable(),
  attachDetailsLink: z.boolean(),
  roundingMethod: z.enum(['round_up', 'round_down', 'round_half_up']),
  roundingUnit: z.number(),
  participants: z.array(sessionParticipantResponseSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// エラーレスポンススキーマ
export const errorResponseSchema = z.object({
  error: z.string(),
});

export const deleteSessionResponseSchema = z.object({
  message: z.string(),
});

// 型エクスポート
export type Participant = z.infer<typeof participantSchema>;
export type SessionInput = z.infer<typeof sessionInputSchema>;
export type CreateSessionRequest = z.infer<typeof createSessionRequestSchema>;
export type UpdateSessionRequest = z.infer<typeof updateSessionRequestSchema>;
export type CreateSessionResponse = z.infer<typeof createSessionResponseSchema>;
export type SessionResponse = z.infer<typeof sessionResponseSchema>;
export type SessionParticipantResponse = z.infer<typeof sessionParticipantResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type DeleteSessionResponse = z.infer<typeof deleteSessionResponseSchema>;

