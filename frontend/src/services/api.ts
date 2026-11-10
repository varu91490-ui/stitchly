const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export function getAuthToken(): string | null {
  return localStorage.getItem('stitchly_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('stitchly_token', token);
}

export function removeAuthToken(): void {
  localStorage.setItem('stitchly_token', '');
  localStorage.removeItem('stitchly_token');
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeAuthToken();
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('ದೃಢೀಕರಣ ಮುಕ್ತಾಯಗೊಂಡಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ.');
  }

  if (!response.ok) {
    let errorDetail = 'ಸರ್ವರ್ ದೋಷ ಸಂಭವಿಸಿದೆ';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      // Non-json error
    }
    throw new Error(errorDetail);
  }

  return response.json();
}
