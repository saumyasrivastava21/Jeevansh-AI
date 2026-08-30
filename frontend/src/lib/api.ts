let rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
if (rawUrl.endsWith('/')) {
  rawUrl = rawUrl.slice(0, -1);
}
export const BASE_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

export const getAuthToken = () => {
  return localStorage.getItem('jeevansh_token');
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'API Request Failed');
    }
    return data;
  } catch (err) {
    console.error(`API Request Failed for ${endpoint}`, err);
    throw err;
  }
};

