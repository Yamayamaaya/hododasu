import { z } from 'zod';

// ここに共通のzodスキーマを定義
// 例: APIリクエスト/レスポンス、ドメイン型など

// セッション関連のスキーマ例（project.mdに基づく）
export const participantSchema = z.object({
  name: z.string().min(1),
  weight: z.number().int().min(1).default(1),
});

export const sessionSchema = z.object({
  title: z.string().optional(),
  totalAmount: z.number().int().min(0),
  participants: z.array(participantSchema),
  messageTemplate: z.string().optional(),
  attachDetailsLink: z.boolean().default(false),
});

// 型エクスポート
export type Participant = z.infer<typeof participantSchema>;
export type Session = z.infer<typeof sessionSchema>;

