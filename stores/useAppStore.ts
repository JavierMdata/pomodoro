
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
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

  toggleTheme: () => void;
  addProfile: (profile: Omit<Profile, 'id'>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  setActiveProfile: (id: string | null) => void;
  addPeriod: (period: Omit<SchoolPeriod, 'id'>) => void;
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  addSchedule: (schedule: Omit<ClassSchedule, 'id'>) => void;
  addTask: (task: Omit<Task, 'id' | 'completed_pomodoros'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addExam: (exam: Omit<Exam, 'id'>) => void;
  addExamTopic: (topic: Omit<ExamTopic, 'id' | 'completed_pomodoros'>) => void;
  addMaterial: (material: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  addSession: (session: Omit<PomodoroSession, 'id'>) => void;
  updateSettings: (profileId: string, updates: Partial<PomodoroSettings>) => void;
  markAlertRead: (id: string) => void;
  
  // Acción para cargar todo desde Supabase
  syncWithSupabase: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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

      syncWithSupabase: async () => {
        console.log("Intentando sincronizar con Supabase...");

        try {
          // Cargar perfiles
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: true });

          if (!profilesError && profilesData) {
            console.log(`✅ Cargados ${profilesData.length} perfiles de Supabase`);

            // Cargar configuraciones de pomodoro
            const { data: settingsData } = await supabase
              .from('pomodoro_default_settings')
              .select('*');

            const settingsMap: Record<string, PomodoroSettings> = {};
            settingsData?.forEach(s => {
              settingsMap[s.profile_id] = s;
            });

            // Cargar períodos escolares
            const { data: periodsData } = await supabase
              .from('school_periods')
              .select('*')
              .order('start_date', { ascending: false });

            // Cargar materias
            const { data: subjectsData } = await supabase
              .from('subjects')
              .select('*')
              .order('name', { ascending: true });

            // Cargar horarios
            const { data: schedulesData } = await supabase
              .from('class_schedule')
              .select('*')
              .order('day_of_week', { ascending: true });

            // Cargar tareas
            const { data: tasksData } = await supabase
              .from('tasks')
              .select('*')
              .order('due_date', { ascending: true });

            // Cargar exámenes
            const { data: examsData } = await supabase
              .from('exams')
              .select('*')
              .order('exam_date', { ascending: true });

            // Cargar temas de examen
            const { data: topicsData } = await supabase
              .from('exam_topics')
              .select('*');

            // Cargar materiales
            const { data: materialsData } = await supabase
              .from('study_materials')
              .select('*')
              .order('created_at', { ascending: false });

            // Cargar sesiones (últimas 100)
            const { data: sessionsData } = await supabase
              .from('pomodoro_sessions')
              .select('*')
              .order('started_at', { ascending: false })
              .limit(100);

            // Cargar alertas no leídas
            const { data: alertsData } = await supabase
              .from('alerts')
              .select('*')
              .eq('is_read', false)
              .order('created_at', { ascending: false });

            set({
              profiles: profilesData || [],
              settings: settingsMap,
              periods: periodsData || [],
              subjects: subjectsData || [],
              schedules: schedulesData || [],
              tasks: tasksData || [],
              exams: examsData || [],
              examTopics: topicsData || [],
              materials: materialsData || [],
              sessions: sessionsData || [],
              alerts: alertsData || []
            });

            console.log("✅ Sincronización con Supabase completada");
          } else {
            console.log("ℹ️ No hay datos en Supabase o trabajando en modo offline");
          }
        } catch (error) {
          console.error("Error al sincronizar con Supabase:", error);
          console.log("ℹ️ Continuando en modo offline con datos locales");
        }
      },

      addProfile: async (profile) => {
        const id = crypto.randomUUID();
        const newProfile = { ...profile, id };
        const defaultSettings: PomodoroSettings = {
          profile_id: id,
          work_duration: 25,
          short_break: 5,
          long_break: 15,
          poms_before_long: 4,
          auto_start_breaks: false,
        };

        // Guardar en Supabase si está disponible
        try {
          await supabase.from('profiles').insert([newProfile]);
        } catch (e) {
          console.error("Error al guardar perfil en Supabase", e);
        }

        set((state) => ({
          profiles: [...state.profiles, newProfile],
          settings: { ...state.settings, [id]: defaultSettings }
        }));
      },

      deleteProfile: async (id) => {
        try {
          await supabase.from('profiles').delete().eq('id', id);
        } catch (e) { console.error(e); }

        set((state) => ({
          profiles: state.profiles.filter(p => p.id !== id),
          activeProfileId: state.activeProfileId === id ? null : state.activeProfileId,
          periods: state.periods.filter(p => p.profile_id !== id),
          subjects: state.subjects.filter(s => s.profile_id !== id),
          sessions: state.sessions.filter(s => s.profile_id !== id),
          alerts: state.alerts.filter(a => a.profile_id !== id)
        }));
      },

      setActiveProfile: (id) => set({ activeProfileId: id }),

      addPeriod: (period) => set((state) => ({
        periods: [...state.periods, { ...period, id: crypto.randomUUID() }]
      })),

      addSubject: (subject) => set((state) => ({
        subjects: [...state.subjects, { ...subject, id: crypto.randomUUID() }]
      })),

      addSchedule: (schedule) => set((state) => ({
        schedules: [...state.schedules, { ...schedule, id: crypto.randomUUID() }]
      })),

      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, { ...task, id: crypto.randomUUID(), completed_pomodoros: 0 }]
      })),

      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
      })),

      addExam: (exam) => set((state) => ({
        exams: [...state.exams, { ...exam, id: crypto.randomUUID() }]
      })),

      addExamTopic: (topic) => set((state) => ({
        examTopics: [...state.examTopics, { ...topic, id: crypto.randomUUID(), completed_pomodoros: 0 }]
      })),

      addMaterial: (material) => set((state) => ({
        materials: [...state.materials, { ...material, id: crypto.randomUUID() }]
      })),

      updateMaterial: (id, updates) => set((state) => ({
        materials: state.materials.map(m => m.id === id ? { ...m, ...updates } : m)
      })),

      addSession: (session) => {
        const id = crypto.randomUUID();
        const currentTasks = get().tasks;
        const currentTopics = get().examTopics;

        if (session.session_type === 'work') {
          if (session.task_id) {
            set({ tasks: currentTasks.map(t => t.id === session.task_id ? { ...t, completed_pomodoros: t.completed_pomodoros + 1 } : t) });
          } else if (session.exam_topic_id) {
            set({ examTopics: currentTopics.map(et => et.id === session.exam_topic_id ? { ...et, completed_pomodoros: et.completed_pomodoros + 1 } : et) });
          }
        }
        
        // Guardar sesión en Supabase para analíticas
        supabase.from('sessions').insert([{ ...session, id }]).then();

        set((state) => ({ sessions: [...state.sessions, { ...session, id }] }));
      },

      updateSettings: (profileId, updates) => set((state) => ({
        settings: { ...state.settings, [profileId]: { ...state.settings[profileId], ...updates } }
      })),

      markAlertRead: (id) => set((state) => ({
        alerts: state.alerts.map(a => a.id === id ? { ...a, is_read: true } : a)
      }))
    }),
    { name: 'pomosmart-cloud-v1' }
  )
);
