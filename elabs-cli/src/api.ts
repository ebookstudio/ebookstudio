import fetch, { Response } from 'node-fetch';
import { API_BASE } from './config';
import { getValidToken } from './auth';

// ─── Base request helper ──────────────────────────────────────────────────────
async function request(
  path: string,
  options: { method?: string; body?: any } = {}
): Promise<Response> {
  const token = await getValidToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return res;
}

// ─── Chat / Generation ────────────────────────────────────────────────────────
export async function streamChat(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  onText: (chunk: string) => void,
  onToolCall: (tool: { toolName: string; args: any }) => void
): Promise<void> {
  const token = await getValidToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/agent/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ messages }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  // Parse the streaming response format: 0:"text" | 9:{toolCall}
  const text = await res.text();
  const lines = text.split('\n').filter(Boolean);

  for (const line of lines) {
    if (line.startsWith('0:')) {
      try {
        const chunk = JSON.parse(line.slice(2));
        onText(chunk);
      } catch {}
    } else if (line.startsWith('9:')) {
      try {
        const tool = JSON.parse(line.slice(2));
        onToolCall(tool);
      } catch {}
    } else if (line.startsWith('e:')) {
      try {
        const err = JSON.parse(line.slice(2));
        throw new Error(err.message || 'Stream error');
      } catch {}
    }
  }
}

// ─── Library ──────────────────────────────────────────────────────────────────
export interface BookStub {
  id: string;
  title: string;
  author: string;
  price: number;
  isDraft: boolean;
  genre: string;
  publicationDate: string;
  pages?: number;
}

export async function getUserBooks(): Promise<BookStub[]> {
  try {
    const res = await request('/api/get-user-books');
    if (!res.ok) return [];
    const data = await res.json() as any;
    return data.books || [];
  } catch {
    return [];
  }
}

// ─── Publish ──────────────────────────────────────────────────────────────────
export async function publishBook(bookId: string, price: number): Promise<boolean> {
  try {
    const res = await request('/api/publish-book', {
      method: 'POST',
      body: { bookId, price },
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Payout ───────────────────────────────────────────────────────────────────
export async function createPayout(upiId: string, amount: number): Promise<{ success: boolean; message: string }> {
  try {
    const res = await request('/api/create-payout', {
      method: 'POST',
      body: { upiId, amount },
    });
    const data = await res.json() as any;
    return { success: res.ok, message: data.message || (res.ok ? 'Payout initiated' : 'Payout failed') };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

// ─── Sales ────────────────────────────────────────────────────────────────────
export interface SaleRecord {
  id: string;
  bookTitle: string;
  amount: number;
  timestamp: string;
  status: string;
}

export async function getSales(): Promise<SaleRecord[]> {
  try {
    const res = await request('/api/get-sales');
    if (!res.ok) return [];
    const data = await res.json() as any;
    return data.sales || [];
  } catch {
    return [];
  }
}

// ─── Subscription ─────────────────────────────────────────────────────────────
export async function createSubscription(planId: string): Promise<{ success: boolean; url?: string }> {
  try {
    const res = await request('/api/create-subscription', {
      method: 'POST',
      body: { planId },
    });
    const data = await res.json() as any;
    return { success: res.ok, url: data.url };
  } catch {
    return { success: false };
  }
}
