const API_URL = 'http://localhost:8000/auth'; // ml-service is usually on 8000 or 5000?

export const authService = {
  async register(name: string, email: string, password: string) {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('cityzen_token', data.access_token);
    return data;
  },

  logout() {
    localStorage.removeItem('cityzen_token');
  },

  async getMe() {
    const token = localStorage.getItem('cityzen_token');
    if (!token) throw new Error('No token');
    const res = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Session expired');
    return res.json();
  },
  
  getToken() {
    return localStorage.getItem('cityzen_token');
  }
};
