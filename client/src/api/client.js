const BASE_URL = '/api';
let isRefreshing = false;
let refreshQueue = [];

function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch { return null; }
}

function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return Date.now() >= decoded.exp * 1000;
}

function isTokenExpiringSoon(token) {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return (decoded.exp * 1000 - Date.now()) < 5 * 60 * 1000;
}

async function refreshToken() {
  const rToken = localStorage.getItem('km-barber-refresh');
  if (!rToken) throw new Error('No refresh token');

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: rToken }),
  }).catch(() => { throw new Error('Network error during token refresh'); });

  if (!res.ok) {
    let msg = 'Refresh failed';
    try { const d = await res.json(); msg = d.message || msg; } catch {}
    throw new Error(msg);
  }

  let data;
  try { data = await res.json(); }
  catch { throw new Error('Invalid response from refresh endpoint'); }

  if (!data?.data?.accessToken) throw new Error('No access token in refresh response');

  localStorage.setItem('km-barber-token', data.data.accessToken);
  localStorage.setItem('km-barber-refresh', data.data.refreshToken);
  return data.data.accessToken;
}

async function ensureValidToken() {
  const token = localStorage.getItem('km-barber-token');
  if (!token) return null;
  if (isTokenExpired(token) || isTokenExpiringSoon(token)) {
    try { return await refreshToken(); }
    catch { clearAuth(); return null; }
  }
  return token;
}

async function request(endpoint, options = {}) {
  let token = await ensureValidToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  let res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401 && localStorage.getItem('km-barber-refresh')) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await refreshToken();
        isRefreshing = false;
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];
        headers.Authorization = `Bearer ${newToken}`;
        res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
      } catch {
        isRefreshing = false;
        refreshQueue = [];
        clearAuth();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
    } else {
      return new Promise((resolve, reject) => {
        refreshQueue.push(async (newToken) => {
          headers.Authorization = `Bearer ${newToken}`;
          try {
            const retryRes = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
            let retryData;
            try { retryData = await retryRes.json(); }
            catch { retryData = {}; }
            if (!retryRes.ok) {
              const err = new Error(retryData.message || 'Request failed');
              err.status = retryRes.status;
              err.code = retryData.code;
              err.details = retryData.details;
              reject(err);
            } else {
              resolve(retryData);
            }
          } catch (err) { reject(err); }
        });
      });
    }
  }

  let data;
  try { data = await res.json(); }
  catch { data = {}; }

  if (!res.ok) {
    const error = new Error(data.message || `Request failed (${res.status})`);
    error.status = res.status;
    error.code = data.code;
    error.details = data.details;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export function clearAuth() {
  localStorage.removeItem('km-barber-token');
  localStorage.removeItem('km-barber-refresh');
}