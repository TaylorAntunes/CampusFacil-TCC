import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  avatar_url?: string;
  course?: string;
  semester?: string;
  bio?: string;
  location?: string;
  response_time?: string;
  skills?: string[];
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user?: User;
}

function normalizeUser(user: any): User {
  return {
    ...user,
    avatarUrl: user?.avatarUrl ?? user?.avatar_url,
    avatar_url: user?.avatar_url ?? user?.avatarUrl,
  };
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/sessions', data);
    const token = response.data.token;
    if (token) {
      localStorage.setItem('accessToken', token);
    }
    // Buscar dados do usuário após login
    const userResponse = await api.get('/me');
    const user = normalizeUser(userResponse.data);
    localStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  },

  async register(data: RegisterRequest): Promise<void> {
    await api.post('/users', data);
    // A sessão só é criada após a confirmação do e-mail institucional.
  },

  async logout(): Promise<void> {
    try {
      await api.post('/sessions/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return normalizeUser(JSON.parse(userStr));
  },

  async fetchUserProfile(): Promise<User> {
    const response = await api.get('/me');
    const user = normalizeUser(response.data);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  async updateUserProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/me', data);
    const user = normalizeUser(response.data);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const user = normalizeUser(response.data);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  },
};
