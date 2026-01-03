// 共通のzodスキーマをエクスポート
// API入出力・ドメイン型の定義をここに追加

export {
  participantSchema,
  sessionInputSchema,
  createSessionRequestSchema,
  updateSessionRequestSchema,
  createSessionResponseSchema,
  sessionParticipantResponseSchema,
  sessionResponseSchema,
  errorResponseSchema,
  deleteSessionResponseSchema,
  type Participant,
  type SessionInput,
  type CreateSessionRequest,
  type UpdateSessionRequest,
  type CreateSessionResponse,
  type SessionResponse,
  type SessionParticipantResponse,
  type ErrorResponse,
  type DeleteSessionResponse,
} from './schemas';
