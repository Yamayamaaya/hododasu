import {
  CreateSessionRequest,
  CreateSessionResponse,
  SessionResponse,
  UpdateSessionRequest,
} from '@hododasu/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

export async function createSession(
  data: CreateSessionRequest
): Promise<CreateSessionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create session');
  }
  return response.json();
}

export async function getSession(editId: string): Promise<SessionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${editId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch session');
  }
  return response.json();
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
  if (!response.ok) {
    throw new Error('Failed to update session');
  }
  return response.json();
}

export async function deleteSession(editId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${editId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete session');
  }
}

