
export type ProfileType = 'universidad' | 'trabajo' | 'personal' | 'otro';
export type Gender = 'masculino' | 'femenino' | 'ambos';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  user_name: string;
  gender: Gender;
  type: ProfileType;
  color: string;
  icon: string;
}

export interface SchoolPeriod {
  id: string;
  profile_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface Subject {
  id: string;
  profile_id: string;
  school_period_id: string;
  name: string;
  code?: string;
  color: string;
  icon: string;
  professor_name?: string;
  classroom?: string;
  start_date: string;
  end_date: string;
}

export interface ClassSchedule {
  id: string;
  subject_id: string;
  day_of_week: number; // 0-6
  start_time: string; // "HH:mm"
  end_time: string;
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'late';

export interface Task {
  id: string;
  subject_id: string;
  title: string;
  description?: string;
  due_date: string;
  priority: Priority;
  status: TaskStatus;
  estimated_pomodoros: number;
  completed_pomodoros: number;
  custom_pomodoro_duration?: number;
  alert_days_before: number;
  created_at: string;
}

export interface Exam {
  id: string;
  subject_id: string;
  name: string;
  exam_date: string;
  duration_minutes: number;
  weight_percentage?: number;
  status: 'upcoming' | 'completed' | 'missed';
  alert_days_before: number;
}

export interface ExamTopic {
  id: string;
  exam_id: string;
  title: string;
  estimated_pomodoros: number;
  completed_pomodoros: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

export type MaterialType = 'libro' | 'articulo' | 'video' | 'curso' | 'documento' | 'otro';
export interface Material {
  id: string;
  profile_id: string;
  subject_id?: string;
  title: string;
  type: MaterialType;
  total_units: number;
  completed_units: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  custom_pomodoro_duration?: number;
}

export interface PomodoroSettings {
  profile_id: string;
  work_duration: number;
  short_break: number;
  long_break: number;
  poms_before_long: number;
  auto_start_breaks: boolean;
}

export interface PomodoroSession {
  id: string;
  profile_id: string;
  task_id?: string;
  exam_topic_id?: string;
  material_id?: string;
  duration_seconds: number;
  focus_rating?: number;
  started_at: string;
  completed_at: string;
  status: 'completed' | 'interrupted';
}

export interface Alert {
  id: string;
  profile_id: string;
  type: 'task_due' | 'exam_upcoming';
  title: string;
  message: string;
  priority: Priority;
  is_read: boolean;
  item_id: string;
  date: string;
}
