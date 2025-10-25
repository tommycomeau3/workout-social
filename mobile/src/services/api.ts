const API_BASE_URL = 'http://localhost:3000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  bio: string;
  created_at: string;
}

interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'An error occurred' };
      }

      return { data };
    } catch (error) {
      return { error: 'Network error' };
    }
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async register(username: string, email: string, password: string, bio?: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, bio }),
    });
  }

  async getProfile(token: string) {
    return this.request('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Workout endpoints
  async getWorkouts(token: string) {
    return this.request('/workouts', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async createWorkout(token: string, workoutData: any) {
    return this.request('/workouts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(workoutData),
    });
  }

  async getWorkout(token: string, workoutId: string) {
    return this.request(`/workouts/${workoutId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Exercise endpoints
  async getExercises() {
    return this.request('/exercises');
  }

  async getExercisesByMuscleGroup(muscleGroup: string) {
    return this.request(`/exercises/muscle-group/${muscleGroup}`);
  }

  // Social endpoints
  async getFeed(token: string) {
    return this.request('/social/feed', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getDiscover(token: string) {
    return this.request('/social/discover', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async likeWorkout(token: string, workoutId: string) {
    return this.request(`/social/like/${workoutId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async unlikeWorkout(token: string, workoutId: string) {
    return this.request(`/social/like/${workoutId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async followUser(token: string, userId: string) {
    return this.request(`/social/follow/${userId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async unfollowUser(token: string, userId: string) {
    return this.request(`/social/follow/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async addComment(token: string, workoutId: string, content: string) {
    return this.request(`/social/comment/${workoutId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content }),
    });
  }

  async getComments(token: string, workoutId: string) {
    return this.request(`/social/comments/${workoutId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

export default new ApiService();
