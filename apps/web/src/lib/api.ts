import {
  CreateSessionRequest,
  CreateSessionResponse,
  SessionResponse,
  UpdateSessionRequest,
} from '@hododasu/shared';
import { Sentry } from './sentry';

// 相対パスでAPIを呼び出す（Viteプロキシ経由）
const API_BASE_URL = '';

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response, errorMessage: string): Promise<T> {
  if (!response.ok) {
    const error = new ApiError(errorMessage, response.status);
    Sentry.captureException(error, {
      extra: { statusCode: response.status, url: response.url },
    });
    throw error;
  }
  return response.json();
}

export async function createSession(data: CreateSessionRequest): Promise<CreateSessionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<CreateSessionResponse>(response, 'Failed to create session');
}

export async function getSession(editId: string): Promise<SessionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${editId}`);
  return handleResponse<SessionResponse>(response, 'Failed to fetch session');
}

export async function getSessionByResultId(resultId: string): Promise<SessionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/result/${resultId}`);
  return handleResponse<SessionResponse>(response, 'Failed to fetch session');
}

export async function updateSession(
  editId: string,
  data: UpdateSessionRequest
): Promise<SessionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${editId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<SessionResponse>(response, 'Failed to update session');
}

export async function deleteSession(editId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${editId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = new ApiError('Failed to delete session', response.status);
    Sentry.captureException(error, {
      extra: { statusCode: response.status, url: response.url },
    });
    throw error;
  }
}
