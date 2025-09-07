export interface College {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'admin';
  college_id?: string;
  is_active: boolean;
}

export interface Event {
  id: string;
  title: string;
  type: 'Workshop' | 'Fest' | 'Seminar' | 'Conference' | 'Sports' | 'Cultural';
  date: string;
  collegeId: string;
  description: string;
  location: string;
  maxAttendees?: number;
  averageRating?: number;
}

export interface Registration {
  id: string;
  studentId: string;
  eventId: string;
  timestamp: string;
}

export interface Attendance {
  id: string;
  registrationId: string;
  checkInTime: string;
}

export interface Feedback {
  id: string;
  registrationId: string;
  rating: number;
  comment: string;
}

export interface EventWithStats extends Event {
  registrationCount: number;
  attendanceCount: number;
  averageFeedback: number;
  averageRating?: number;
  collegeName: string;
  createdBy?: number;
  creatorName?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginFormData) => Promise<void>;
  register: (userData: RegisterFormData) => Promise<void>;
  logout: () => void;
}

export interface RegisterFormData {
  email: string;
  password: string;
  full_name: string;
  role?: string;
  college_id?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}