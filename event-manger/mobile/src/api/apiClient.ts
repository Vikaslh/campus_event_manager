import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API base URL - update with your backend URL
const API_BASE_URL = 'http://10.0.2.2:8000'; // Android emulator default
// Use 'http://localhost:8000' for iOS simulator

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user');
      // Navigation will be handled by the AuthContext
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData: {
    email: string;
    password: string;
    full_name: string;
    role?: string;
    college_id?: string;
  }) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
};

// College API
export const collegeAPI = {
  getColleges: async () => {
    const response = await apiClient.get('/colleges');
    return response.data;
  },
};

// Event API
export const eventAPI = {
  getEvents: async (skip = 0, limit = 100) => {
    const response = await apiClient.get(`/events?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getEvent: async (eventId: string) => {
    const response = await apiClient.get(`/events/${eventId}`);
    return response.data;
  },
};

// Registration API
export const registrationAPI = {
  getMyRegistrations: async () => {
    const response = await apiClient.get('/registrations/my');
    return response.data;
  },

  registerForEvent: async (eventId: string) => {
    const response = await apiClient.post('/registrations', { event_id: eventId });
    return response.data;
  },
};

// Attendance API
export const attendanceAPI = {
  markAttendance: async (eventId: string) => {
    const response = await apiClient.post('/attendance', { event_id: eventId });
    return response.data;
  },

  getMyAttendances: async () => {
    const response = await apiClient.get('/attendance/my');
    return response.data;
  },
};

// Feedback API
export const feedbackAPI = {
  submitFeedback: async (eventId: string, rating: number, comment: string) => {
    const response = await apiClient.post('/feedback', {
      event_id: eventId,
      rating,
      comment,
    });
    return response.data;
  },

  getMyFeedbacks: async () => {
    const response = await apiClient.get('/feedback/my');
    return response.data;
  },
};

export default apiClient;