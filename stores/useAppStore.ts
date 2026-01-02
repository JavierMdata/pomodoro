
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Profile, SchoolPeriod, Subject, ClassSchedule, Task, Exam, 
  ExamTopic, Material, PomodoroSession, PomodoroSettings, Alert
} from '../types';

interface AppState {
  theme: 'light' | 'dark';
  profiles: Profile[];
  activeProfileId: string | null;
  periods: SchoolPeriod[];
  subjects: Subject[];
  schedules: ClassSchedule[];
  tasks: Task[];
  exams: Exam[];
  examTopics: ExamTopic[];
  materials: Material[];
  sessions: PomodoroSession[];
  settings: Record<string, PomodoroSettings>;
  alerts: Alert[];

  // Actions
  toggleTheme: () => void;
  addProfile: (profile: Omit<Profile, 'id'>) => void;
  deleteProfile: (id: string) => void;
  setActiveProfile: (id: string | null) => void;
  
  addPeriod: (period: Omit<SchoolPeriod, 'id'>) => void;
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  addSchedule: (schedule: Omit<ClassSchedule, 'id'>) => void;
  
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'completed_pomodoros'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  
  addExam: (exam: Omit<Exam, 'id'>) => void;
  addExamTopic: (topic: Omit<ExamTopic, 'id' | 'completed_pomodoros'>) => void;
  
  addMaterial: (material: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  
  addSession: (session: Omit<PomodoroSession, 'id'>) => void;
  updateSettings: (profileId: string, updates: Partial<PomodoroSettings>) => void;
  
  markAlertRead: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      profiles: [],
      activeProfileId: null,
      periods: [],
      subjects: [],
      schedules: [],
      tasks: [],
      exams: [],
      examTopics: [],
      materials: [],
      sessions: [],
      settings: {},
      alerts: [],

      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      addProfile: (profile) => set((state) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newProfile = { ...profile, id };
        const defaultSettings: PomodoroSettings = {
          profile_id: id,
          work_duration: 25,
          short_break: 5,
          long_break: 15,
          poms_before_long: 4,
          auto_start_breaks: false,
        };
        return {
          profiles: [...state.profiles, newProfile],
          settings: { ...state.settings, [id]: defaultSettings }
        };
      }),

      deleteProfile: (id) => set((state) => ({
        profiles: state.profiles.filter(p => p.id !== id),
        activeProfileId: state.activeProfileId === id ? null : state.activeProfileId,
        periods: state.periods.filter(p => p.profile_id !== id),
        subjects: state.subjects.filter(s => s.profile_id !== id),
        tasks: state.tasks.filter(t => {
            const subject = state.subjects.find(s => s.id === t.subject_id);
            return subject?.profile_id !== id;
        }),
        sessions: state.sessions.filter(s => s.profile_id !== id),
        alerts: state.alerts.filter(a => a.profile_id !== id)
      })),

      setActiveProfile: (id) => set({ activeProfileId: id }),

      addPeriod: (period) => set((state) => ({
        periods: [...state.periods, { ...period, id: Math.random().toString(36).substr(2, 9) }]
      })),

      addSubject: (subject) => set((state) => ({
        subjects: [...state.subjects, { ...subject, id: Math.random().toString(36).substr(2, 9) }]
      })),

      addSchedule: (schedule) => set((state) => ({
        schedules: [...state.schedules, { ...schedule, id: Math.random().toString(36).substr(2, 9) }]
      })),

      addTask: (task) => set((state) => {
        const id = Math.random().toString(36).substr(2, 9);
        const alertId = Math.random().toString(36).substr(2, 9);
        const newAlert: Alert = {
          id: alertId,
          profile_id: state.activeProfileId!,
          type: 'task_due',
          title: 'Tarea próxima a vencer',
          message: `La tarea "${task.title}" vence pronto.`,
          priority: task.priority,
          is_read: false,
          item_id: id,
          date: new Date(new Date(task.due_date).getTime() - (task.alert_days_before * 24 * 60 * 60 * 1000)).toISOString()
        };
        return {
          tasks: [...state.tasks, { ...task, id, created_at: new Date().toISOString(), completed_pomodoros: 0 }],
          alerts: [...state.alerts, newAlert]
        };
      }),

      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
      })),

      addExam: (exam) => set((state) => ({
        exams: [...state.exams, { ...exam, id: Math.random().toString(36).substr(2, 9) }]
      })),

      addExamTopic: (topic) => set((state) => ({
        examTopics: [...state.examTopics, { ...topic, id: Math.random().toString(36).substr(2, 9), completed_pomodoros: 0 }]
      })),

      addMaterial: (material) => set((state) => ({
        materials: [...state.materials, { ...material, id: Math.random().toString(36).substr(2, 9) }]
      })),

      updateMaterial: (id, updates) => set((state) => ({
        materials: state.materials.map(m => m.id === id ? { ...m, ...updates } : m)
      })),

      addSession: (session) => set((state) => {
        const id = Math.random().toString(36).substr(2, 9);
        if (session.status === 'completed') {
          if (session.task_id) {
            state.updateTask(session.task_id, { completed_pomodoros: (state.tasks.find(t => t.id === session.task_id)?.completed_pomodoros || 0) + 1 });
          } else if (session.exam_topic_id) {
            set(s => ({ 
              examTopics: s.examTopics.map(et => et.id === session.exam_topic_id ? { ...et, completed_pomodoros: et.completed_pomodoros + 1 } : et) 
            }));
          } else if (session.material_id) {
            state.updateMaterial(session.material_id, { completed_pomodoros: (state.materials.find(m => m.id === session.material_id)?.completed_pomodoros || 0) + 1 });
          }
        }
        return { sessions: [...state.sessions, { ...session, id }] };
      }),

      updateSettings: (profileId, updates) => set((state) => ({
        settings: { ...state.settings, [profileId]: { ...state.settings[profileId], ...updates } }
      })),

      markAlertRead: (id) => set((state) => ({
        alerts: state.alerts.map(a => a.id === id ? { ...a, is_read: true } : a)
      }))
    }),
    { name: 'pomosmart-pro-v3' }
  )
);
