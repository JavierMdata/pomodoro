
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import {
  Profile, SchoolPeriod, Subject, Task, Exam,
  ExamTopic, Material, PomodoroSession, PomodoroSettings, Alert
} from '../types';

interface AppState {
  theme: 'light' | 'dark';
  profiles: Profile[];
  activeProfileId: string | null;
  periods: SchoolPeriod[];
  subjects: Subject[];
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
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<void>;
  updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'completed_pomodoros'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addExam: (exam: Omit<Exam, 'id'>) => Promise<void>;
  updateExam: (id: string, updates: Partial<Exam>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  addExamTopic: (topic: Omit<ExamTopic, 'id' | 'completed_pomodoros'>) => Promise<void>;
  updateExamTopic: (id: string, updates: Partial<ExamTopic>) => Promise<void>;
  deleteExamTopic: (id: string) => Promise<void>;
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
              .from('pomodoro_settings')
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
              .from('materials')
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
              tasks: tasksData || [],
              exams: examsData || [],
              examTopics: topicsData || [],
              materials: materialsData || [],
              sessions: sessionsData || [],
              alerts: alertsData || []
            });

            console.log("✅ Sincronización con Supabase completada");
            console.log("📊 Datos cargados:", {
              profiles: (profilesData || []).length,
              subjects: (subjectsData || []).length,
              tasks: (tasksData || []).length,
              exams: (examsData || []).length,
              examTopics: (topicsData || []).length
            });

            // Validar si hay materias
            if ((subjectsData || []).length === 0) {
              console.error("❌ ERROR: No se encontraron materias en Supabase");
              console.error("   → La tabla 'subjects' está vacía");
              console.error("   → Debes agregar materias primero");
            } else {
              console.log("📚 Primera materia de ejemplo:", subjectsData![0]);
            }
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

      addSubject: async (subject) => {
        const id = crypto.randomUUID();
        const newSubject = { ...subject, id };

        try {
          await supabase.from('subjects').insert([newSubject]);
        } catch (e) {
          console.error("Error al guardar materia en Supabase", e);
        }

        set((state) => ({
          subjects: [...state.subjects, newSubject]
        }));
      },

      updateSubject: async (id, updates) => {
        try {
          await supabase.from('subjects').update(updates).eq('id', id);
        } catch (e) {
          console.error("Error al actualizar materia en Supabase", e);
        }

        set((state) => ({
          subjects: state.subjects.map(s => s.id === id ? { ...s, ...updates } : s)
        }));
      },

      deleteSubject: async (id) => {
        try {
          await supabase.from('subjects').delete().eq('id', id);
        } catch (e) {
          console.error("Error al eliminar materia en Supabase", e);
        }

        set((state) => ({
          subjects: state.subjects.filter(s => s.id !== id),
          tasks: state.tasks.filter(t => t.subject_id !== id),
          exams: state.exams.filter(e => e.subject_id !== id),
          materials: state.materials.filter(m => m.subject_id !== id)
        }));
      },

      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, { ...task, id: crypto.randomUUID(), completed_pomodoros: 0 }]
      })),

      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
      })),

      addExam: async (exam) => {
        const id = crypto.randomUUID();
        const newExam = { ...exam, id };

        try {
          await supabase.from('exams').insert([newExam]);
        } catch (e) {
          console.error("Error al guardar examen en Supabase", e);
        }

        set((state) => ({
          exams: [...state.exams, newExam]
        }));
      },

      updateExam: async (id, updates) => {
        try {
          await supabase.from('exams').update(updates).eq('id', id);
        } catch (e) {
          console.error("Error al actualizar examen en Supabase", e);
        }

        set((state) => ({
          exams: state.exams.map(e => e.id === id ? { ...e, ...updates } : e)
        }));
      },

      deleteExam: async (id) => {
        try {
          await supabase.from('exams').delete().eq('id', id);
        } catch (e) {
          console.error("Error al eliminar examen en Supabase", e);
        }

        set((state) => ({
          exams: state.exams.filter(e => e.id !== id),
          examTopics: state.examTopics.filter(et => et.exam_id !== id)
        }));
      },

      addExamTopic: async (topic) => {
        const id = crypto.randomUUID();
        const newTopic = { ...topic, id, completed_pomodoros: 0 };

        try {
          await supabase.from('exam_topics').insert([newTopic]);
        } catch (e) {
          console.error("Error al guardar tema en Supabase", e);
        }

        set((state) => ({
          examTopics: [...state.examTopics, newTopic]
        }));
      },

      updateExamTopic: async (id, updates) => {
        try {
          await supabase.from('exam_topics').update(updates).eq('id', id);
        } catch (e) {
          console.error("Error al actualizar tema en Supabase", e);
        }

        set((state) => ({
          examTopics: state.examTopics.map(et => et.id === id ? { ...et, ...updates } : et)
        }));
      },

      deleteExamTopic: async (id) => {
        try {
          await supabase.from('exam_topics').delete().eq('id', id);
        } catch (e) {
          console.error("Error al eliminar tema en Supabase", e);
        }

        set((state) => ({
          examTopics: state.examTopics.filter(et => et.id !== id)
        }));
      },

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
        supabase.from('pomodoro_sessions').insert([{ ...session, id }]).then();

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
