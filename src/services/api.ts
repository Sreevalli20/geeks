/**
 * Production API Client
 * Connects to the SkillProof backend server for all data operations
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'https://geeks2.onrender.com';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// Get stored auth token
const getAuthToken = () => {
  return localStorage.getItem('skillproof_token');
};

// Handle 401 errors by clearing auth token
const handleAuthError = () => {
  clearAuthToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

// Set auth token
export const setAuthToken = (token: string) => {
  localStorage.setItem('skillproof_token', token);
};

// Clear auth token
export const clearAuthToken = () => {
  localStorage.removeItem('skillproof_token');
};

export const apiClient = {
  get: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
    });

    if (!res.ok) {
      if (res.status === 401) {
        handleAuthError();
        throw new Error('Authentication expired. Please login again.');
      }
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      const errorMessage = error.error || error.message || `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(`${errorMessage} (URL: ${API_BASE_URL}${endpoint})`);
    }

    return res.json();
  },

  post: async <T>(endpoint: string, body: any): Promise<ApiResponse<T>> => {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      if (res.status === 401) {
        handleAuthError();
        throw new Error('Authentication expired. Please login again.');
      }
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      const errorMessage = error.error || error.message || `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(`${errorMessage} (URL: ${API_BASE_URL}${endpoint})`);
    }

    return res.json();
  },

  put: async <T>(endpoint: string, body: any): Promise<ApiResponse<T>> => {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      if (res.status === 401) {
        handleAuthError();
        throw new Error('Authentication expired. Please login again.');
      }
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      const errorMessage = error.error || error.message || `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(`${errorMessage} (URL: ${API_BASE_URL}${endpoint})`);
    }

    return res.json();
  },

  delete: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    if (!res.ok) {
      if (res.status === 401) {
        handleAuthError();
        throw new Error('Authentication expired. Please login again.');
      }
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      const errorMessage = error.error || error.message || `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(`${errorMessage} (URL: ${API_BASE_URL}${endpoint})`);
    }

    return res.json();
  },

  upload: async <T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> => {
    const token = getAuthToken();
    const headers: HeadersInit = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      if (res.status === 401) {
        handleAuthError();
        throw new Error('Authentication expired. Please login again.');
      }
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      const errorMessage = error.error || error.message || `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(`${errorMessage} (URL: ${API_BASE_URL}${endpoint})`);
    }

    return res.json();
  },
};
