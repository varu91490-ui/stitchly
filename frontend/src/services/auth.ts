import { request, setAuthToken, removeAuthToken } from './api';
import { User } from '../types';

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  name: string;
  username: string;
}

export const authService = {
  async register(name: string, username: string, password: string): Promise<TokenResponse> {
    const data = await request<TokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, username, password }),
    });
    setAuthToken(data.access_token);
    return data;
  },

  async login(username: string, password: string): Promise<TokenResponse> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      let msg = 'ಬಳಕೆದಾರರ ಹೆಸರು ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ ತಪ್ಪಾಗಿದೆ';
      try {
        const err = await response.json();
        msg = err.detail || msg;
      } catch {}
      throw new Error(msg);
    }

    const data: TokenResponse = await response.json();
    setAuthToken(data.access_token);
    return data;
  },

  async getMe(): Promise<User> {
    return request<User>('/auth/me');
  },

  logout(): void {
    removeAuthToken();
    window.location.href = '/login';
  }
};
