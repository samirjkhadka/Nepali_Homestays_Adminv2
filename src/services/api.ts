/// <reference types="vite/client" />
// Simple API utility for backend requests
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  // Always use a plain object for headers to avoid type issues
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers ? (options.headers as Record<string, string>) : {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    let errorMsg = 'API error';
    try {
      const err = await res.json();
      errorMsg = err.error || err.message || errorMsg;
    } catch {
      console.error('Failed to parse API error');
    }
    throw new Error(errorMsg);
  }
  return res.json();
} 