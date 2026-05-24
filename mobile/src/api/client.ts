import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../config/api';

const TOKEN_KEY = 'focusnet_token';

export type User = {
  id?: string;
  _id?: string;
  email: string;
  displayName: string;
  avatarIndex: number;
  theme: 'dark' | 'light';
  streak: number;
  totalMinutesAllTime?: number;
};

export function userId(u: { id?: string; _id?: string }): string {
  return String(u.id || u._id || '');
}

export type DailyGoal = {
  date: string;
  targetMinutes: number;
  completedMinutes: number;
};

export type MeResponse = {
  user: User;
  todayGoal: DailyGoal | null;
  todayProgressPercent: number;
};

async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string | null): Promise<void> {
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function api<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, ...init } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && auth) {
    await setToken(null);
    throw new Error('SESSION_EXPIRED');
  }

  if (!res.ok) {
    const msg = (data as { error?: string }).error || res.statusText || 'İstek başarısız';
    throw new Error(msg);
  }
  return data as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    api<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string, displayName: string) =>
    api<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, password, displayName }),
    }),
  resetPassword: (email: string, newPassword: string) =>
    api<{ ok: boolean; message: string }>('/api/auth/reset-password', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ email, newPassword }),
    }),
};

export const appApi = {
  me: () => api<MeResponse>('/api/me'),
  updateMe: (body: { displayName?: string; avatarIndex?: number; theme?: 'dark' | 'light' }) =>
    api<{ user: User }>('/api/me', { method: 'PUT', body: JSON.stringify(body) }),
  setGoal: (hours: number, minutes: number) =>
    api<DailyGoal>('/api/goals', { method: 'POST', body: JSON.stringify({ hours, minutes }) }),
  deleteGoal: (date: string) => api<{ ok: boolean }>(`/api/goals/${date}`, { method: 'DELETE' }),
  logStudy: (durationMinutes: number, mode = 'free') =>
    api<MeResponse & { ok: boolean }>('/api/study/log', {
      method: 'POST',
      body: JSON.stringify({ durationMinutes, mode }),
    }),
  leaderboard: () =>
    api<{
      top: Array<User & { totalMinutesAllTime: number }>;
      myRank: number;
      myMinutes: number;
    }>('/api/leaderboard'),
  friends: () => api<{ friends: User[] }>('/api/friends'),
  addFriend: (email: string) =>
    api<{ friends: User[] }>('/api/friends', { method: 'POST', body: JSON.stringify({ email }) }),
  removeFriend: (id: string) =>
    api<{ friends: User[] }>(`/api/friends/${id}`, { method: 'DELETE' }),
  calendar: (year: number, month: number) =>
    api<{
      sessionMap: Record<string, number>;
      goalMap: Record<string, DailyGoal>;
    }>(`/api/calendar?year=${year}&month=${month}`),
};
