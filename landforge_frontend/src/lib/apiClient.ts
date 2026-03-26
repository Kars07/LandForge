/**
 * LandForge Backend API Client
 * Thin wrapper around fetch() targeting the Express backend at localhost:3001.
 * Falls back silently if the backend is unreachable, so the UI never breaks.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Token helpers (stored separately from AuthContext so apiClient is standalone)
export const getToken = () => localStorage.getItem('lf_token');
export const setToken = (t: string) => localStorage.setItem('lf_token', t);
export const clearToken = () => localStorage.removeItem('lf_token');

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

// ---- Auth ----
export const apiAuth = {
  register: (data: object) => req<{ token: string; user: any }>('POST', '/auth/register', data),
  login:    (email: string, password: string) => req<{ token: string; user: any }>('POST', '/auth/login', { email, password }),
  me:       () => req<any>('GET', '/auth/me'),
};

// ---- Properties ----
export const apiProperties = {
  list:   (params?: Record<string, string>) => req<any[]>('GET', `/properties${params ? '?' + new URLSearchParams(params) : ''}`),
  get:    (id: string) => req<any>('GET', `/properties/${id}`),
  create: (data: object) => req<any>('POST', '/properties', data),
  update: (id: string, data: object) => req<any>('PATCH', `/properties/${id}`, data),
};

// ---- Document Verifications ----
export const apiVerifications = {
  save: (data: object) => req<any>('POST', '/verifications', data),
  list: (params?: Record<string, string>) => req<any[]>('GET', `/verifications${params ? '?' + new URLSearchParams(params) : ''}`),
};

// ---- Area Intelligence Reports ----
export const apiAreaReports = {
  save:   (data: object) => req<any>('POST', '/area-reports', data),
  lookup: (location: string) => req<any[]>('GET', `/area-reports?location=${encodeURIComponent(location)}`),
};

// ---- Payments ----
export const apiPayments = {
  record: (data: {
    iswTxnRef: string; amount: number; buyerId?: string;
    propertyId?: string; landlordId?: string; purpose?: string;
    iswResponse?: any; suiTxDigest?: string; suiListingId?: string;
  }) => req<any>('POST', '/payments', data),
  list: (params?: Record<string, string>) => req<any[]>('GET', `/payments${params ? '?' + new URLSearchParams(params) : ''}`),
};

// ---- Withdrawals ----
export const apiWithdrawals = {
  record: (data: object) => req<any>('POST', '/withdrawals', data),
  list:   (landlordId: string) => req<any[]>('GET', `/withdrawals?landlordId=${landlordId}`),
};

// ---- Wallet ----
export const apiWallet = {
  get:      (landlordId: string) => req<any>('GET', `/wallet/${landlordId}`),
  provision: (data: object) => req<any>('POST', '/wallet', data),
};

// ---- Sui Events ----
export const apiSui = {
  record: (data: {
    txDigest: string; eventSeq?: string; packageId?: string;
    module?: string; sender?: string; eventType?: string;
    parsedJson?: any; propertyId?: string; paymentId?: string; userId?: string;
  }) => req<any>('POST', '/sui-events', data),
  list: (params?: Record<string, string>) => req<any[]>('GET', `/sui-events${params ? '?' + new URLSearchParams(params) : ''}`),
};
