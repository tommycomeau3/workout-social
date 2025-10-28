import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for your backend API
const BASE_URL = 'http://10.0.0.155:3000/api';

// Types for API responses
export interface User {
  id: number;
  username: string;
  email: string;
  bio: string;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  bio?: string;
}

export interface Exercise {
  id: number;
  name: string;
  description: string;
  muscle_group: string;
  equipment_type: string;
  created_at: string;
}

export interface Workout {
  id: number;
  title: string;
  date: string;
  duration?: number;
  notes: string;
  is_public: boolean;
  created_at: string;
  user_id: number;
}

export interface WorkoutExercise {
  id: number;
  workout_id: number;
  exercise_id: number;
  order_in_workout: number;
}

export interface Set {
  id: number;
  workout_exercise_id: number;
  set_number: number;
  reps: number;
  weight: number;
  rest_time: number;
}

export interface CreateWorkoutRequest {
  title: string;
  date: string;
  duration?: number;
  notes?: string;
  is_public?: boolean;
}

export interface AddExerciseToWorkoutRequest {
  exercise_id: number;
  order_in_workout: number;
}

export interface AddSetsToExerciseRequest {
  set_number: number;
  reps: number;
  weight: number;
  rest_time: number;
}

// API service class
class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    const token = await this.getToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Token management
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store token for future requests
    await this.setToken(response.token);
    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Store token for future requests
    await this.setToken(response.token);
    return response;
  }

  async getProfile(): Promise<{ user: User }> {
    return await this.request<{ user: User }>('/auth/profile');
  }

  async logout(): Promise<void> {
    await this.removeToken();
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;

    try {
      // Try to fetch profile to validate token
      await this.getProfile();
      return true;
    } catch (error) {
      // Token is invalid, remove it
      await this.removeToken();
      return false;
    }
  }

  // Exercise methods
  async getExercisesByMuscleGroup(muscleGroup: string): Promise<{ exercises: Exercise[] }> {
    return await this.request<{ exercises: Exercise[] }>(`/exercises?muscle_group=${muscleGroup}`);
  }

  async getAllExercises(): Promise<{ exercises: Exercise[] }> {
    return await this.request<{ exercises: Exercise[] }>('/exercises');
  }

  // Workout methods
  async createWorkout(workoutData: CreateWorkoutRequest): Promise<{ message: string; workout: Workout }> {
    return await this.request<{ message: string; workout: Workout }>('/workouts', {
      method: 'POST',
      body: JSON.stringify(workoutData),
    });
  }

  async getUserWorkouts(): Promise<{ workouts: Workout[] }> {
    return await this.request<{ workouts: Workout[] }>('/workouts');
  }

  async getWorkout(workoutId: number): Promise<{ workout: Workout }> {
    return await this.request<{ workout: Workout }>(`/workouts/${workoutId}`);
  }

  async updateWorkout(workoutId: number, workoutData: Partial<CreateWorkoutRequest>): Promise<{ message: string; workout: Workout }> {
    return await this.request<{ message: string; workout: Workout }>(`/workouts/${workoutId}`, {
      method: 'PUT',
      body: JSON.stringify(workoutData),
    });
  }

  async deleteWorkout(workoutId: number): Promise<{ message: string }> {
    return await this.request<{ message: string }>(`/workouts/${workoutId}`, {
      method: 'DELETE',
    });
  }

  // Workout Exercise methods
  async addExerciseToWorkout(workoutId: number, exerciseData: AddExerciseToWorkoutRequest): Promise<{ message: string; workout_exercise: WorkoutExercise }> {
    return await this.request<{ message: string; workout_exercise: WorkoutExercise }>(`/workouts/${workoutId}/exercises`, {
      method: 'POST',
      body: JSON.stringify(exerciseData),
    });
  }

  // Set methods
  async addSetsToExercise(workoutExerciseId: number, setData: AddSetsToExerciseRequest): Promise<{ message: string; set: Set }> {
    return await this.request<{ message: string; set: Set }>(`/workouts/exercises/${workoutExerciseId}/sets`, {
      method: 'POST',
      body: JSON.stringify(setData),
    });
  }

  // Social methods
  async getFeed(): Promise<{ feed: any[] }> {
    return await this.request<{ feed: any[] }>('/social/feed');
  }

  async getDiscoverWorkouts(): Promise<{ workouts: any[] }> {
    return await this.request<{ workouts: any[] }>('/social/discover');
  }

  async likeWorkout(workoutId: number): Promise<{ message: string }> {
    return await this.request<{ message: string }>(`/social/like/${workoutId}`, {
      method: 'POST',
    });
  }

  async unlikeWorkout(workoutId: number): Promise<{ message: string }> {
    return await this.request<{ message: string }>(`/social/like/${workoutId}`, {
      method: 'DELETE',
    });
  }

  async addComment(workoutId: number, content: string): Promise<{ message: string; comment: any }> {
    return await this.request<{ message: string; comment: any }>(`/social/comment/${workoutId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async getComments(workoutId: number): Promise<{ comments: any[] }> {
    return await this.request<{ comments: any[] }>(`/social/comments/${workoutId}`);
  }
}

// Create and export API service instance
export const apiService = new ApiService(BASE_URL);
export default apiService;
