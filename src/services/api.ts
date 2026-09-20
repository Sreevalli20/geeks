/**
 * Production API Client
 * Connects to the SkillProof backend server for all data operations
 * Updated: Production deployment with VITE_API_URL environment variable
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://geeks2.onrender.com';

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
      if (res.status === 404) {
        throw new Error('Resource not found. Please check the endpoint.');
      }
      if (res.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      const errorMessage = error.error || error.message || error.detail || `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(errorMessage);
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

    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`POST ${url}`, body);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      console.log(`Response status: ${res.status} ${res.statusText}`);

      if (!res.ok) {
        if (res.status === 401) {
          handleAuthError();
          throw new Error('Authentication expired. Please login again.');
        }
        if (res.status === 404) {
          throw new Error('Resource not found. Please check the endpoint.');
        }
        if (res.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        
        let error;
        try {
          error = await res.json();
          console.log('Error response:', error);
        } catch (e) {
          error = { error: 'Request failed' };
          console.log('Failed to parse error response:', e);
        }
        
        const errorMessage = error.error || error.message || error.detail || `HTTP ${res.status}: ${res.statusText}`;
        throw new Error(errorMessage);
      }

      return res.json();
    } catch (error) {
      console.error('Network error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
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
      if (res.status === 404) {
        throw new Error('Resource not found. Please check the endpoint.');
      }
      if (res.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      const errorMessage = error.error || error.message || error.detail || `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(errorMessage);
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
      if (res.status === 404) {
        throw new Error('Resource not found. Please check the endpoint.');
      }
      if (res.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      const errorMessage = error.error || error.message || error.detail || `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(errorMessage);
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
      if (res.status === 404) {
        throw new Error('Resource not found. Please check the endpoint.');
      }
      if (res.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      const error = await res.json().catch(() => ({ error: 'Request failed' }));
      const errorMessage = error.error || error.message || error.detail || `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(errorMessage);
    }

    return res.json();
  },
};
