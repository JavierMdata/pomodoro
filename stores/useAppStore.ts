
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import {
  Profile, SchoolPeriod, Subject, Task, Exam,
  ExamTopic, Material, PomodoroSession, PomodoroSettings, Alert,
  ContentBlock, NoteLink, FocusJournal, KnowledgeNode,
  EntityType, EntityRef, ClassSchedule, ActiveTimer,
  WorkSchedule, SubjectTimeAllocation, CategoryInstance, WorkCategory,
  Book, BookReadingSession, BookQuote, EnglishSession
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

  // Timer activo persistente
  activeTimer: ActiveTimer | null;

  // HORARIO Y DISTRIBUCIÓN DE TIEMPO
  workSchedules: WorkSchedule[];
  timeAllocations: SubjectTimeAllocation[];
  categoryInstances: CategoryInstance[];

  // LIBROS
  books: Book[];
  bookReadingSessions: BookReadingSession[];
  bookQuotes: BookQuote[];

  // INGLÉS
  englishSessions: EnglishSession[];

  // SEGUNDO CEREBRO: Nuevos estados
  contentBlocks: ContentBlock[];
  noteLinks: NoteLink[];
  focusJournals: FocusJournal[];
  knowledgeNodes: KnowledgeNode[];

  // SECCIÓN SELECCIONADA PARA POMODORO
  selectedSectionForPomodoro: {
    id: string;
    type: 'subject' | 'category';
  } | null;

  toggleTheme: () => void;
  addProfile: (profile: Omit<Profile, 'id'>) => Promise<void>;
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  setActiveProfile: (id: string | null) => void;
  addPeriod: (period: Omit<SchoolPeriod, 'id'>) => void;
  updatePeriod: (id: string, updates: Partial<SchoolPeriod>) => Promise<void>;
  deletePeriod: (id: string) => Promise<void>;
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

  // Timer activo persistente
  startActiveTimer: (timer: Omit<ActiveTimer, 'id'>) => Promise<void>;
  pauseActiveTimer: () => Promise<void>;
  resumeActiveTimer: () => Promise<void>;
  stopActiveTimer: () => Promise<void>;
  loadActiveTimer: () => Promise<ActiveTimer | null>;
  getElapsedSeconds: () => number;

  // HORARIO DE TRABAJO Y DISTRIBUCIÓN DE TIEMPO
  addWorkSchedule: (schedule: Omit<WorkSchedule, 'id'>) => Promise<void>;
  updateWorkSchedule: (id: string, updates: Partial<WorkSchedule>) => Promise<void>;
  deleteWorkSchedule: (id: string) => Promise<void>;
  calculateWeeklyWorkHours: () => number;
  addTimeAllocation: (allocation: Omit<SubjectTimeAllocation, 'id'>) => Promise<void>;
  updateTimeAllocation: (id: string, updates: Partial<SubjectTimeAllocation>) => Promise<void>;
  recalculateTimeAllocations: () => Promise<void>;

  // GESTIÓN DE CATEGORÍAS
  loadCategoryInstances: () => Promise<void>;
  addCategoryInstance: (instance: Omit<CategoryInstance, 'id' | 'created_at'>) => Promise<void>;
  updateCategoryInstance: (id: string, updates: Partial<CategoryInstance>) => Promise<void>;
  deleteCategoryInstance: (id: string) => Promise<void>;
  getCategoryInstancesByType: (type: WorkCategory) => CategoryInstance[];

  // SEGUNDO CEREBRO: Content Blocks (Notion-style)
  addContentBlock: (block: Omit<ContentBlock, 'id' | 'created_at' | 'updated_at'>) => Promise<ContentBlock>;
  updateContentBlock: (id: string, updates: Partial<ContentBlock>) => Promise<void>;
  deleteContentBlock: (id: string) => Promise<void>;
  getBlocksByParent: (parentId: string | null) => ContentBlock[];
  getBlocksByEntity: (entityType: EntityType, entityId: string) => ContentBlock[];

  // SEGUNDO CEREBRO: Note Links (Obsidian-style)
  createNoteLink: (source: EntityRef, target: EntityRef, linkText?: string, context?: string) => Promise<void>;
  deleteNoteLink: (id: string) => Promise<void>;
  getLinksByNode: (nodeType: EntityType, nodeId: string) => NoteLink[];
  parseWikiLinks: (text: string) => string[]; // Encuentra [[enlaces]] en texto

  // SEGUNDO CEREBRO: Focus Journals (Filosofía "Amar el Proceso")
  addFocusJournal: (journal: Omit<FocusJournal, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateFocusJournal: (id: string, updates: Partial<FocusJournal>) => Promise<void>;
  deleteFocusJournal: (id: string) => Promise<void>;
  getJournalsByDateRange: (startDate: string, endDate: string) => FocusJournal[];
  getJournalsByMood: (mood: string) => FocusJournal[];

  // SEGUNDO CEREBRO: Análisis Inteligente de Enlaces
  analyzeAndCreateLinks: (entityId: string, entityType: EntityType, title: string, content: string, hashtags: string[]) => Promise<void>;

  // SEGUNDO CEREBRO: Knowledge Graph
  refreshKnowledgeGraph: () => Promise<void>;
  searchNodes: (term: string) => KnowledgeNode[];

  // LIBROS
  addBook: (book: Partial<Book>) => Promise<void>;
  updateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  addBookReadingSession: (session: Partial<BookReadingSession>) => Promise<void>;
  addBookQuote: (quote: Partial<BookQuote>) => Promise<void>;

  // INGLÉS
  addEnglishSession: (session: Omit<EnglishSession, 'id' | 'created_at'>) => void;
  updateEnglishSession: (id: string, updates: Partial<EnglishSession>) => void;
  deleteEnglishSession: (id: string) => void;

  // SECCIÓN SELECCIONADA PARA POMODORO
  setSelectedSectionForPomodoro: (id: string, type: 'subject' | 'category') => void;
  clearSelectedSectionForPomodoro: () => void;

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

      // Timer activo persistente
      activeTimer: null,

      // HORARIO Y DISTRIBUCIÓN DE TIEMPO
      workSchedules: [],
      timeAllocations: [],
      categoryInstances: [],

      // LIBROS
      books: [],
      bookReadingSessions: [],
      bookQuotes: [],

      // INGLÉS
      englishSessions: [],

      // SEGUNDO CEREBRO: Estados iniciales
      contentBlocks: [],
      noteLinks: [],
      focusJournals: [],
      knowledgeNodes: [],

      // SECCIÓN SELECCIONADA PARA POMODORO
      selectedSectionForPomodoro: null,

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

            // Cargar horarios de clases
            const { data: schedulesData } = await supabase
              .from('class_schedule')
              .select('*');

            // Cargar horarios de trabajo
            const { data: workSchedulesData } = await supabase
              .from('work_schedule')
              .select('*')
              .order('day_of_week', { ascending: true });

            // Cargar asignaciones de tiempo por materia
            const { data: timeAllocationsData } = await supabase
              .from('subject_time_allocation')
              .select('*');

            // Cargar instancias de categorías
            const { data: categoryInstancesData } = await supabase
              .from('category_instances')
              .select('*')
              .order('created_at', { ascending: false });

            // Cargar libros (si la tabla existe)
            let booksData: any[] | null = null;
            let bookSessionsData: any[] | null = null;
            let bookQuotesData: any[] | null = null;
            try {
              const booksResult = await supabase.from('books').select('*').order('created_at', { ascending: false });
              booksData = booksResult.data;
              const sessResult = await supabase.from('book_reading_sessions').select('*').order('session_date', { ascending: false });
              bookSessionsData = sessResult.data;
              const quotesResult = await supabase.from('book_quotes').select('*').order('created_at', { ascending: false });
              bookQuotesData = quotesResult.data;
            } catch (e) {
              console.log('ℹ️ Tablas de libros no disponibles');
            }

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

            // Cargar timer activo (si existe)
            let activeTimerData = null;
            if (profilesData && profilesData.length > 0) {
              try {
                const { data: timerData } = await supabase
                  .from('active_timers')
                  .select('*')
                  .limit(1)
                  .single();

                if (timerData) {
                  // Verificar si el timer expiró
                  const startTime = new Date(timerData.started_at).getTime();
                  const elapsed = timerData.is_paused
                    ? timerData.elapsed_when_paused || 0
                    : Math.floor((Date.now() - startTime) / 1000);

                  if (elapsed < timerData.duration_seconds) {
                    activeTimerData = timerData;
                    console.log('🔄 Timer activo encontrado y restaurado');
                  } else {
                    // Timer expirado, eliminarlo
                    await supabase.from('active_timers').delete().eq('id', timerData.id);
                    console.log('⏰ Timer expirado eliminado');
                  }
                }
              } catch (e) {
                console.log('ℹ️ No hay timer activo o tabla no existe');
              }
            }

            // SEGUNDO CEREBRO: Cargar nuevas tablas (si existen)
            let blocksData = null;
            let linksData = null;
            let journalsData = null;

            try {
              const blocksResult = await supabase
                .from('content_blocks')
                .select('*')
                .order('created_at', { ascending: false });
              blocksData = blocksResult.data;
            } catch (e) {
              console.log('ℹ️ Tabla content_blocks no disponible (ejecuta el SQL primero)');
            }

            try {
              const linksResult = await supabase
                .from('note_links')
                .select('*')
                .order('last_referenced_at', { ascending: false });
              linksData = linksResult.data;
            } catch (e) {
              console.log('ℹ️ Tabla note_links no disponible (ejecuta el SQL primero)');
            }

            try {
              const journalsResult = await supabase
                .from('focus_journals')
                .select('*')
                .order('journal_date', { ascending: false })
                .limit(100);
              journalsData = journalsResult.data;
            } catch (e) {
              console.log('ℹ️ Tabla focus_journals no disponible (ejecuta el SQL primero)');
            }

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
              alerts: alertsData || [],
              activeTimer: activeTimerData,
              workSchedules: workSchedulesData || [],
              timeAllocations: timeAllocationsData || [],
              categoryInstances: categoryInstancesData || [],
              books: booksData || [],
              bookReadingSessions: bookSessionsData || [],
              bookQuotes: bookQuotesData || [],
              contentBlocks: blocksData || [],
              noteLinks: linksData || [],
              focusJournals: journalsData || [],
              knowledgeNodes: [] // Inicializar siempre como array vacío
            });

            console.log("✅ Sincronización con Supabase completada");
            const loadedData: any = {
              profiles: (profilesData || []).length,
              subjects: (subjectsData || []).length,
              tasks: (tasksData || []).length,
              exams: (examsData || []).length,
              examTopics: (topicsData || []).length
            };

            // Solo mostrar datos del Segundo Cerebro si las tablas existen
            if (blocksData !== null) {
              loadedData.contentBlocks = blocksData.length;
              loadedData.noteLinks = (linksData || []).length;
              loadedData.focusJournals = (journalsData || []).length;
            }

            console.log("📊 Datos cargados:", loadedData);

            // SEGUNDO CEREBRO: Refrescar grafo de conocimiento
            if (profilesData && profilesData.length > 0) {
              try {
                await get().refreshKnowledgeGraph();
              } catch (e) {
                console.log('ℹ️ No se pudo refrescar el grafo (puede que las tablas no existan aún)');
              }
            }

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
        const newProfile = {
          ...profile,
          id,
          requires_pin: false,
          biometric_enabled: false
        };
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

      updateProfile: async (id, updates) => {
        try {
          await supabase.from('profiles').update(updates).eq('id', id);
          console.log('✅ Perfil actualizado en Supabase');
        } catch (e) {
          console.error("Error al actualizar perfil en Supabase", e);
        }

        set((state) => ({
          profiles: state.profiles.map(p => p.id === id ? { ...p, ...updates } : p)
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

      updatePeriod: async (id, updates) => {
        try {
          await supabase.from('school_periods').update(updates).eq('id', id);
        } catch (e) {
          console.error("Error al actualizar periodo en Supabase", e);
        }

        set((state) => ({
          periods: state.periods.map(p => p.id === id ? { ...p, ...updates } : p)
        }));
      },

      deletePeriod: async (id) => {
        try {
          await supabase.from('school_periods').delete().eq('id', id);
        } catch (e) {
          console.error("Error al eliminar periodo en Supabase", e);
        }

        set((state) => ({
          periods: state.periods.filter(p => p.id !== id)
        }));
      },

      addSubject: async (subject) => {
        const id = crypto.randomUUID();
        const state = get();

        // Obtener o crear un período escolar si no hay uno
        let schoolPeriodId = subject.school_period_id;

        if (!schoolPeriodId) {
          const profilePeriods = state.periods.filter(p => p.profile_id === subject.profile_id);

          if (profilePeriods.length > 0) {
            // Usar el período activo o el primero disponible
            const activePeriod = profilePeriods.find(p => p.is_active) || profilePeriods[0];
            schoolPeriodId = activePeriod.id;
            console.log('📅 Usando período existente:', activePeriod.name);
          } else {
            // Crear un período por defecto
            const defaultPeriodId = crypto.randomUUID();
            const defaultPeriod = {
              id: defaultPeriodId,
              profile_id: subject.profile_id,
              name: 'Período Actual',
              start_date: new Date().toISOString().split('T')[0],
              end_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              is_active: true
            };

            console.log('📅 Creando período por defecto:', defaultPeriod);

            // Guardar el período en Supabase
            try {
              const { error } = await supabase.from('school_periods').insert([defaultPeriod]);
              if (error) {
                console.error('❌ Error al crear período:', error);
              } else {
                console.log('✅ Período creado correctamente');
              }
            } catch (e) {
              console.error('❌ Error de red al crear período:', e);
            }

            // Actualizar estado local con el nuevo período
            set((state) => ({
              periods: [...state.periods, defaultPeriod]
            }));

            schoolPeriodId = defaultPeriodId;
          }
        }

        const newSubject = { ...subject, id, school_period_id: schoolPeriodId };
        console.log('📚 Intentando guardar materia:', newSubject);

        // Primero actualizar estado local para respuesta inmediata
        set((state) => ({
          subjects: [...state.subjects, newSubject]
        }));

        // Luego sincronizar con Supabase
        try {
          const { error } = await supabase.from('subjects').insert([newSubject]);
          if (error) {
            console.error('❌ Error de Supabase al guardar materia:', error);
          } else {
            console.log('✅ Materia guardada correctamente en Supabase:', id);
          }
        } catch (e) {
          console.error('❌ Error de red al guardar materia en Supabase:', e);
        }
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

      addSession: async (session) => {
        const id = crypto.randomUUID();
        const currentTasks = get().tasks;
        const currentTopics = get().examTopics;

        // Actualizar contadores localmente y en Supabase
        if (session.session_type === 'work') {
          if (session.task_id) {
            const task = currentTasks.find(t => t.id === session.task_id);
            const newCount = (task?.completed_pomodoros || 0) + 1;
            set({ tasks: currentTasks.map(t => t.id === session.task_id ? { ...t, completed_pomodoros: newCount } : t) });

            // Sincronizar con Supabase
            try {
              await supabase.from('tasks').update({ completed_pomodoros: newCount }).eq('id', session.task_id);
            } catch (e) {
              console.error('Error al actualizar contador de tarea en Supabase:', e);
            }
          } else if (session.exam_topic_id) {
            const topic = currentTopics.find(et => et.id === session.exam_topic_id);
            const newCount = (topic?.completed_pomodoros || 0) + 1;
            set({ examTopics: currentTopics.map(et => et.id === session.exam_topic_id ? { ...et, completed_pomodoros: newCount } : et) });

            // Sincronizar con Supabase
            try {
              await supabase.from('exam_topics').update({ completed_pomodoros: newCount }).eq('id', session.exam_topic_id);
            } catch (e) {
              console.error('Error al actualizar contador de tema en Supabase:', e);
            }
          }
        }

        // Guardar sesión en Supabase para analíticas
        try {
          await supabase.from('pomodoro_sessions').insert([{ ...session, id }]);
          console.log('✅ Sesión guardada en Supabase:', id);
        } catch (e) {
          console.error('Error al guardar sesión en Supabase:', e);
        }

        set((state) => ({ sessions: [...state.sessions, { ...session, id }] }));
      },

      updateSettings: (profileId, updates) => set((state) => ({
        settings: { ...state.settings, [profileId]: { ...state.settings[profileId], ...updates } }
      })),

      markAlertRead: (id) => set((state) => ({
        alerts: state.alerts.map(a => a.id === id ? { ...a, is_read: true } : a)
      })),

      // ================================================================
      // TIMER ACTIVO PERSISTENTE
      // ================================================================

      startActiveTimer: async (timerData) => {
        const profileId = get().activeProfileId;
        if (!profileId) return;

        const id = crypto.randomUUID();
        const newTimer: ActiveTimer = {
          ...timerData,
          id,
          profile_id: profileId
        };

        // Guardar en Supabase
        try {
          // Primero eliminar cualquier timer activo previo del perfil
          await supabase.from('active_timers').delete().eq('profile_id', profileId);

          // Insertar el nuevo timer
          const { error } = await supabase.from('active_timers').insert([newTimer]);
          if (error) {
            console.error('❌ Error al guardar timer activo:', error);
          } else {
            console.log('✅ Timer activo guardado en Supabase');
          }
        } catch (e) {
          console.error('Error de red al guardar timer:', e);
        }

        set({ activeTimer: newTimer });
      },

      pauseActiveTimer: async () => {
        const currentTimer = get().activeTimer;
        if (!currentTimer || currentTimer.is_paused) return;

        const now = new Date().toISOString();
        const startTime = new Date(currentTimer.started_at).getTime();
        const elapsed = Math.floor((Date.now() - startTime) / 1000);

        const updatedTimer: ActiveTimer = {
          ...currentTimer,
          is_paused: true,
          paused_at: now,
          elapsed_when_paused: elapsed
        };

        // Actualizar en Supabase
        try {
          await supabase.from('active_timers').update({
            is_paused: true,
            paused_at: now,
            elapsed_when_paused: elapsed
          }).eq('id', currentTimer.id);
          console.log('⏸️ Timer pausado');
        } catch (e) {
          console.error('Error al pausar timer:', e);
        }

        set({ activeTimer: updatedTimer });
      },

      resumeActiveTimer: async () => {
        const currentTimer = get().activeTimer;
        if (!currentTimer || !currentTimer.is_paused) return;

        // Calcular nuevo started_at para que el tiempo restante sea correcto
        const elapsedWhenPaused = currentTimer.elapsed_when_paused || 0;
        const newStartedAt = new Date(Date.now() - (elapsedWhenPaused * 1000)).toISOString();

        const updatedTimer: ActiveTimer = {
          ...currentTimer,
          is_paused: false,
          started_at: newStartedAt,
          paused_at: undefined,
          elapsed_when_paused: undefined
        };

        // Actualizar en Supabase
        try {
          await supabase.from('active_timers').update({
            is_paused: false,
            started_at: newStartedAt,
            paused_at: null,
            elapsed_when_paused: null
          }).eq('id', currentTimer.id);
          console.log('▶️ Timer reanudado');
        } catch (e) {
          console.error('Error al reanudar timer:', e);
        }

        set({ activeTimer: updatedTimer });
      },

      stopActiveTimer: async () => {
        const currentTimer = get().activeTimer;
        if (!currentTimer) return;

        // Eliminar de Supabase
        try {
          await supabase.from('active_timers').delete().eq('id', currentTimer.id);
          console.log('⏹️ Timer detenido y eliminado');
        } catch (e) {
          console.error('Error al detener timer:', e);
        }

        set({ activeTimer: null });
      },

      loadActiveTimer: async () => {
        const profileId = get().activeProfileId;
        if (!profileId) return null;

        try {
          const { data, error } = await supabase
            .from('active_timers')
            .select('*')
            .eq('profile_id', profileId)
            .single();

          if (error || !data) {
            console.log('ℹ️ No hay timer activo guardado');
            set({ activeTimer: null });
            return null;
          }

          // Verificar si el timer ya expiró
          const startTime = new Date(data.started_at).getTime();
          const elapsed = data.is_paused
            ? data.elapsed_when_paused || 0
            : Math.floor((Date.now() - startTime) / 1000);

          if (elapsed >= data.duration_seconds) {
            // El timer expiró mientras la app estaba cerrada
            console.log('⏰ Timer expirado - limpiando');
            await supabase.from('active_timers').delete().eq('id', data.id);
            set({ activeTimer: null });
            return null;
          }

          console.log('🔄 Timer activo restaurado:', data);
          set({ activeTimer: data as ActiveTimer });
          return data as ActiveTimer;
        } catch (e) {
          console.error('Error al cargar timer activo:', e);
          return null;
        }
      },

      getElapsedSeconds: () => {
        const timer = get().activeTimer;
        if (!timer) return 0;

        if (timer.is_paused) {
          return timer.elapsed_when_paused || 0;
        }

        const startTime = new Date(timer.started_at).getTime();
        return Math.floor((Date.now() - startTime) / 1000);
      },

      // ================================================================
      // SEGUNDO CEREBRO: Content Blocks (Notion-style)
      // ================================================================

      addContentBlock: async (block) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const newBlock: ContentBlock = {
          ...block,
          id,
          created_at: now,
          updated_at: now
        };

        try {
          await supabase.from('content_blocks').insert([newBlock]);
          console.log('✅ Bloque guardado en Supabase:', id);
        } catch (e) {
          console.error('Error al guardar bloque en Supabase:', e);
        }

        set((state) => ({
          contentBlocks: [...state.contentBlocks, newBlock]
        }));

        // Auto-detectar y crear enlaces [[wiki]] si hay texto
        if (block.content?.text) {
          const wikiLinks = get().parseWikiLinks(block.content.text);
          for (const linkText of wikiLinks) {
            // TODO: Resolver el linkText a una entidad real
            // Por ahora solo lo loggeamos
            console.log('🔗 Detectado wiki link:', linkText);
          }
        }

        return newBlock;
      },

      updateContentBlock: async (id, updates) => {
        const updatedBlock = {
          ...updates,
          updated_at: new Date().toISOString()
        };

        try {
          await supabase.from('content_blocks').update(updatedBlock).eq('id', id);
        } catch (e) {
          console.error('Error al actualizar bloque en Supabase:', e);
        }

        set((state) => ({
          contentBlocks: state.contentBlocks.map(b =>
            b.id === id ? { ...b, ...updatedBlock } : b
          )
        }));
      },

      deleteContentBlock: async (id) => {
        try {
          await supabase.from('content_blocks').delete().eq('id', id);
        } catch (e) {
          console.error('Error al eliminar bloque en Supabase:', e);
        }

        set((state) => ({
          contentBlocks: state.contentBlocks.filter(b => b.id !== id)
        }));
      },

      getBlocksByParent: (parentId) => {
        const state = get();
        return state.contentBlocks
          .filter(b => b.parent_block_id === parentId)
          .sort((a, b) => a.position - b.position);
      },

      getBlocksByEntity: (entityType, entityId) => {
        const state = get();
        const fieldMap: Record<string, keyof ContentBlock> = {
          task: 'task_id',
          subject: 'subject_id',
          exam: 'exam_id',
          exam_topic: 'exam_topic_id',
          material: 'material_id'
        };

        const field = fieldMap[entityType];
        if (!field) return [];

        return state.contentBlocks
          .filter(b => b[field] === entityId)
          .sort((a, b) => a.position - b.position);
      },

      // ================================================================
      // SEGUNDO CEREBRO: Note Links (Obsidian-style)
      // ================================================================

      createNoteLink: async (source, target, linkText, context) => {
        const profileId = get().activeProfileId;
        if (!profileId) {
          console.error('No hay perfil activo');
          return;
        }

        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        const newLink: NoteLink = {
          id,
          profile_id: profileId,
          source_type: source.type,
          source_id: source.id,
          target_type: target.type,
          target_id: target.id,
          link_text: linkText,
          context,
          weight: 1,
          created_at: now,
          last_referenced_at: now
        };

        try {
          // Usar la función de Supabase para crear enlaces bidireccionales
          const { data, error } = await supabase.rpc('create_bidirectional_link', {
            p_profile_id: profileId,
            p_source_type: source.type,
            p_source_id: source.id,
            p_target_type: target.type,
            p_target_id: target.id,
            p_link_text: linkText,
            p_context: context
          });

          if (error) throw error;

          console.log('✅ Enlace creado:', data);
        } catch (e) {
          console.error('Error al crear enlace en Supabase:', e);
          // Fallback: insertar manualmente
          try {
            await supabase.from('note_links').insert([newLink]);
          } catch (e2) {
            console.error('Error en fallback de enlace:', e2);
          }
        }

        // Actualizar estado local (buscar si ya existe para incrementar peso)
        set((state) => {
          const existing = state.noteLinks.find(
            l =>
              l.profile_id === profileId &&
              l.source_type === source.type &&
              l.source_id === source.id &&
              l.target_type === target.type &&
              l.target_id === target.id
          );

          if (existing) {
            // Incrementar peso del existente
            return {
              noteLinks: state.noteLinks.map(l =>
                l.id === existing.id
                  ? { ...l, weight: l.weight + 1, last_referenced_at: now }
                  : l
              )
            };
          } else {
            // Agregar nuevo
            return {
              noteLinks: [...state.noteLinks, newLink]
            };
          }
        });

        // Refrescar el grafo después de crear un enlace
        await get().refreshKnowledgeGraph();
      },

      deleteNoteLink: async (id) => {
        try {
          await supabase.from('note_links').delete().eq('id', id);
        } catch (e) {
          console.error('Error al eliminar enlace en Supabase:', e);
        }

        set((state) => ({
          noteLinks: state.noteLinks.filter(l => l.id !== id)
        }));
      },

      getLinksByNode: (nodeType, nodeId) => {
        const state = get();
        return state.noteLinks.filter(
          l =>
            (l.source_type === nodeType && l.source_id === nodeId) ||
            (l.target_type === nodeType && l.target_id === nodeId)
        );
      },

      parseWikiLinks: (text) => {
        const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
        const matches = [];
        let match;

        while ((match = wikiLinkRegex.exec(text)) !== null) {
          matches.push(match[1].trim());
        }

        return matches;
      },

      // ================================================================
      // SEGUNDO CEREBRO: Focus Journals
      // ================================================================

      addFocusJournal: async (journal) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const newJournal: FocusJournal = {
          ...journal,
          id,
          created_at: now,
          updated_at: now
        };

        try {
          await supabase.from('focus_journals').insert([newJournal]);
          console.log('✅ Journal guardado en Supabase:', id);
        } catch (e) {
          console.error('Error al guardar journal en Supabase:', e);
        }

        set((state) => ({
          focusJournals: [...state.focusJournals, newJournal]
        }));

        // Auto-detectar y crear enlaces [[wiki]] en el entry
        const wikiLinks = get().parseWikiLinks(journal.entry);
        for (const linkText of wikiLinks) {
          console.log('🔗 Detectado wiki link en journal:', linkText);
          // TODO: Resolver y crear enlaces automáticamente
        }
      },

      updateFocusJournal: async (id, updates) => {
        const updatedJournal = {
          ...updates,
          updated_at: new Date().toISOString()
        };

        try {
          await supabase.from('focus_journals').update(updatedJournal).eq('id', id);
        } catch (e) {
          console.error('Error al actualizar journal en Supabase:', e);
        }

        set((state) => ({
          focusJournals: state.focusJournals.map(j =>
            j.id === id ? { ...j, ...updatedJournal } : j
          )
        }));
      },

      deleteFocusJournal: async (id) => {
        try {
          await supabase.from('focus_journals').delete().eq('id', id);
        } catch (e) {
          console.error('Error al eliminar journal en Supabase:', e);
        }

        set((state) => ({
          focusJournals: state.focusJournals.filter(j => j.id !== id)
        }));
      },

      getJournalsByDateRange: (startDate, endDate) => {
        const state = get();
        return state.focusJournals.filter(j => {
          const jDate = j.journal_date;
          return jDate >= startDate && jDate <= endDate;
        }).sort((a, b) => b.journal_date.localeCompare(a.journal_date));
      },

      getJournalsByMood: (mood) => {
        const state = get();
        return state.focusJournals.filter(j => j.mood === mood);
      },

      // ================================================================
      // SEGUNDO CEREBRO: Análisis Inteligente de Enlaces
      // ================================================================

      analyzeAndCreateLinks: async (entityId, entityType, title, content, hashtags) => {
        const profileId = get().activeProfileId;
        if (!profileId) return;

        try {
          // 1. Extraer palabras clave del título (ignorar palabras comunes)
          const stopWords = ['el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'y', 'o', 'en', 'a', 'para', 'con', 'por', 'como', 'que', 'es'];
          const titleWords = title
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.includes(word));

          // 2. Buscar otras notas con palabras clave similares
          const allBlocks = get().contentBlocks.filter(b => b.profile_id === profileId && b.id !== entityId);

          for (const block of allBlocks) {
            const blockTitleWords = (block.title || '')
              .toLowerCase()
              .split(/\s+/)
              .filter(word => word.length > 3 && !stopWords.includes(word));

            // Calcular coincidencias
            const matches = titleWords.filter(word => blockTitleWords.includes(word));

            // Si hay al menos 2 palabras en común, crear enlace
            if (matches.length >= 2) {
              await get().createNoteLink(
                { type: entityType, id: entityId },
                { type: 'content_block', id: block.id },
                matches.join(', '),
                `Conexión automática por palabras clave: ${matches.join(', ')}`
              );
              console.log(`🔗 Enlace automático creado con "${block.title}" (${matches.length} coincidencias)`);
            }
          }

          // 3. Crear nodos y enlaces para hashtags
          if (hashtags && hashtags.length > 0) {
            for (const tag of hashtags) {
              // Crear o actualizar nodo de hashtag en la base de datos
              // (Los hashtags se almacenarán como content_blocks especiales de tipo 'tag')
              const tagBlockData: Omit<ContentBlock, 'id' | 'created_at' | 'updated_at'> = {
                profile_id: profileId,
                block_type: 'text',
                position: 0,
                title: `#${tag}`,
                content: {
                  text: `<p>Hashtag: #${tag}</p>`,
                  type: 'hashtag'
                }
              };

              // Buscar si ya existe un bloque para este hashtag
              const existingTagBlock = get().contentBlocks.find(
                b => b.profile_id === profileId && b.title === `#${tag}` && b.content?.type === 'hashtag'
              );

              let tagBlockId: string;

              if (existingTagBlock) {
                tagBlockId = existingTagBlock.id;
              } else {
                // Crear nuevo nodo de hashtag
                const newTagBlock = await get().addContentBlock(tagBlockData);
                tagBlockId = newTagBlock?.id || '';
                console.log(`🏷️ Nodo de hashtag creado: #${tag}`);
              }

              // Crear enlace entre la nota y el hashtag
              if (tagBlockId) {
                await get().createNoteLink(
                  { type: entityType, id: entityId },
                  { type: 'content_block', id: tagBlockId },
                  `#${tag}`,
                  `Hashtag encontrado en el contenido`
                );
                console.log(`🔗 Nota vinculada al hashtag #${tag}`);
              }
            }
          }

          // 4. Refrescar el grafo para mostrar las nuevas conexiones
          await get().refreshKnowledgeGraph();

        } catch (error) {
          console.error('Error al analizar y crear enlaces:', error);
        }
      },

      // ================================================================
      // SEGUNDO CEREBRO: Knowledge Graph
      // ================================================================

      refreshKnowledgeGraph: async () => {
        const profileId = get().activeProfileId;
        if (!profileId) {
          console.log('No hay perfil activo, no se puede refrescar el grafo');
          return;
        }

        try {
          // Refrescar la vista materializada (solo si existe)
          const { error: rpcError } = await supabase.rpc('refresh_knowledge_graph');

          if (rpcError) {
            // Si la función no existe, simplemente loggeamos y continuamos
            console.log('ℹ️ Función refresh_knowledge_graph no disponible (ejecuta el SQL primero)');
          }

          // Cargar nodos del grafo
          const { data: nodesData, error } = await supabase
            .from('knowledge_nodes')
            .select('*')
            .eq('profile_id', profileId);

          if (error) {
            console.log('ℹ️ Vista knowledge_nodes no disponible (ejecuta el SQL primero)');
            set({ knowledgeNodes: [] }); // Asegurar que siempre sea un array
            return;
          }

          set({ knowledgeNodes: nodesData || [] });

          console.log(`✅ Grafo refrescado: ${(nodesData || []).length} nodos`);
        } catch (e) {
          console.log('ℹ️ No se pudo refrescar el grafo (las tablas del Segundo Cerebro aún no existen)');
          set({ knowledgeNodes: [] }); // Asegurar que siempre sea un array
        }
      },

      searchNodes: (term) => {
        const state = get();
        const lowerTerm = term.toLowerCase();

        return state.knowledgeNodes
          .filter(n => n.title.toLowerCase().includes(lowerTerm))
          .sort((a, b) => {
            // Priorizar matches exactos
            const aExact = a.title.toLowerCase() === lowerTerm ? 1 : 0;
            const bExact = b.title.toLowerCase() === lowerTerm ? 1 : 0;
            if (aExact !== bExact) return bExact - aExact;

            // Luego por tiempo dedicado
            return b.total_time_seconds - a.total_time_seconds;
          });
      },

      // ================================================================
      // HORARIO DE TRABAJO Y DISTRIBUCIÓN DE TIEMPO
      // ================================================================

      addWorkSchedule: async (schedule) => {
        const id = crypto.randomUUID();
        const newSchedule = { ...schedule, id };

        try {
          await supabase.from('work_schedule').insert([newSchedule]);
        } catch (e) {
          console.error("Error al guardar horario de trabajo en Supabase", e);
        }

        set((state) => ({
          workSchedules: [...state.workSchedules, newSchedule]
        }));

        // Recalcular distribución de tiempo automáticamente
        await get().recalculateTimeAllocations();
      },

      updateWorkSchedule: async (id, updates) => {
        try {
          await supabase.from('work_schedule').update(updates).eq('id', id);
        } catch (e) {
          console.error("Error al actualizar horario de trabajo en Supabase", e);
        }

        set((state) => ({
          workSchedules: state.workSchedules.map(s => s.id === id ? { ...s, ...updates } : s)
        }));

        // Recalcular distribución de tiempo automáticamente
        await get().recalculateTimeAllocations();
      },

      deleteWorkSchedule: async (id) => {
        try {
          await supabase.from('work_schedule').delete().eq('id', id);
        } catch (e) {
          console.error("Error al eliminar horario de trabajo en Supabase", e);
        }

        set((state) => ({
          workSchedules: state.workSchedules.filter(s => s.id !== id)
        }));

        // Recalcular distribución de tiempo automáticamente
        await get().recalculateTimeAllocations();
      },

      calculateWeeklyWorkHours: () => {
        const state = get();
        const profileSchedules = state.workSchedules.filter(
          s => s.profile_id === state.activeProfileId && s.is_active && s.block_type === 'study'
        );

        const totalHours = profileSchedules.reduce((total, schedule) => {
          const [startHour, startMin] = schedule.start_time.split(':').map(Number);
          const [endHour, endMin] = schedule.end_time.split(':').map(Number);

          const startMinutes = startHour * 60 + startMin;
          const endMinutes = endHour * 60 + endMin;
          const durationHours = (endMinutes - startMinutes) / 60;

          return total + durationHours;
        }, 0);

        return totalHours;
      },

      addTimeAllocation: async (allocation) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const newAllocation = { ...allocation, id, last_updated: now };

        try {
          await supabase.from('subject_time_allocation').insert([newAllocation]);
        } catch (e) {
          console.error("Error al guardar asignación de tiempo en Supabase", e);
        }

        set((state) => ({
          timeAllocations: [...state.timeAllocations, newAllocation]
        }));
      },

      updateTimeAllocation: async (id, updates) => {
        const now = new Date().toISOString();
        const updatedData = { ...updates, last_updated: now };

        try {
          await supabase.from('subject_time_allocation').update(updatedData).eq('id', id);
        } catch (e) {
          console.error("Error al actualizar asignación de tiempo en Supabase", e);
        }

        set((state) => ({
          timeAllocations: state.timeAllocations.map(a => a.id === id ? { ...a, ...updatedData } : a)
        }));
      },

      recalculateTimeAllocations: async () => {
        const state = get();
        const profileId = state.activeProfileId;
        if (!profileId) return;

        // Obtener horas totales disponibles
        const totalAvailableHours = get().calculateWeeklyWorkHours();
        if (totalAvailableHours === 0) return;

        // Obtener materias activas del perfil
        const profileSubjects = state.subjects.filter(s => s.profile_id === profileId);
        if (profileSubjects.length === 0) return;

        // Calcular prioridad basada en exámenes próximos y tareas pendientes
        const subjectPriorities = profileSubjects.map(subject => {
          const subjectExams = state.exams.filter(e =>
            e.subject_id === subject.id &&
            e.status === 'upcoming' &&
            new Date(e.exam_date) > new Date()
          );

          const subjectTasks = state.tasks.filter(t =>
            t.subject_id === subject.id &&
            t.status !== 'completed' &&
            new Date(t.due_date) > new Date()
          );

          // Calcular prioridad: más alta si tiene exámenes próximos
          let priority = 3; // Prioridad base

          if (subjectExams.length > 0) {
            const nearestExam = subjectExams.sort((a, b) =>
              new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime()
            )[0];

            const daysUntilExam = Math.ceil(
              (new Date(nearestExam.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );

            if (daysUntilExam <= 7) priority = 5;
            else if (daysUntilExam <= 14) priority = 4;
          }

          if (subjectTasks.length > 0) {
            priority = Math.min(5, priority + 1);
          }

          return { subject, priority, examCount: subjectExams.length, taskCount: subjectTasks.length };
        });

        // Distribuir horas proporcionalmente según prioridad
        const totalPriorityPoints = subjectPriorities.reduce((sum, sp) => sum + sp.priority, 0);

        for (const sp of subjectPriorities) {
          const allocatedHours = (sp.priority / totalPriorityPoints) * totalAvailableHours;

          // Buscar si ya existe una asignación
          const existing = state.timeAllocations.find(
            a => a.profile_id === profileId && a.subject_id === sp.subject.id
          );

          if (existing) {
            await get().updateTimeAllocation(existing.id, {
              allocated_hours_per_week: Number(allocatedHours.toFixed(2)),
              priority_level: sp.priority,
              auto_calculated: true
            });
          } else {
            await get().addTimeAllocation({
              profile_id: profileId,
              subject_id: sp.subject.id,
              allocated_hours_per_week: Number(allocatedHours.toFixed(2)),
              priority_level: sp.priority,
              auto_calculated: true,
              last_updated: new Date().toISOString()
            });
          }
        }

        console.log(`✅ Distribución de tiempo recalculada: ${totalAvailableHours}h disponibles distribuidas entre ${profileSubjects.length} materias`);
      },

      // ================================================================
      // GESTIÓN DE CATEGORÍAS
      // ================================================================

      loadCategoryInstances: async () => {
        try {
          const { data, error } = await supabase
            .from('category_instances')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error al cargar instancias de categorías:', error);
            return;
          }

          set({ categoryInstances: data || [] });
          console.log(`✅ Cargadas ${(data || []).length} instancias de categorías`);
        } catch (e) {
          console.error('Error al cargar instancias de categorías:', e);
        }
      },

      addCategoryInstance: async (instance) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        // Sanitizar fechas: convertir strings vacíos a null
        const sanitizedInstance = {
          ...instance,
          id,
          created_at: now,
          start_date: instance.start_date && instance.start_date.trim() !== '' ? instance.start_date : null,
          end_date: instance.end_date && instance.end_date.trim() !== '' ? instance.end_date : null,
        };

        // Primero actualizar estado local para respuesta inmediata
        set((state) => ({
          categoryInstances: [...state.categoryInstances, sanitizedInstance]
        }));

        // Luego sincronizar con Supabase
        try {
          const { error } = await supabase
            .from('category_instances')
            .insert([sanitizedInstance]);

          if (error) {
            console.error('Error al guardar instancia de categoría en Supabase:', error);
            // Revertir cambio local si falla
            set((state) => ({
              categoryInstances: state.categoryInstances.filter(ci => ci.id !== id)
            }));
            // Lanzar error para que el componente lo maneje
            throw new Error(error.message || 'Error al guardar en Supabase');
          } else {
            console.log('✅ Instancia de categoría guardada correctamente en Supabase:', id);
          }
        } catch (e) {
          console.error('Error de red al guardar instancia de categoría:', e);
          // Revertir cambio local si falla
          set((state) => ({
            categoryInstances: state.categoryInstances.filter(ci => ci.id !== id)
          }));
          // Re-lanzar el error
          throw e;
        }
      },

      updateCategoryInstance: async (id, updates) => {
        // Sanitizar fechas: convertir strings vacíos a null
        const sanitizedUpdates = {
          ...updates,
          updated_at: new Date().toISOString(),
          start_date: updates.start_date && updates.start_date.trim() !== '' ? updates.start_date : null,
          end_date: updates.end_date && updates.end_date.trim() !== '' ? updates.end_date : null,
        };

        // Guardar estado anterior para poder revertir
        const state = get();
        const previousInstance = state.categoryInstances.find(ci => ci.id === id);

        // Actualizar estado local primero
        set((state) => ({
          categoryInstances: state.categoryInstances.map(ci =>
            ci.id === id ? { ...ci, ...sanitizedUpdates } : ci
          )
        }));

        // Sincronizar con Supabase
        try {
          const { error } = await supabase
            .from('category_instances')
            .update(sanitizedUpdates)
            .eq('id', id);

          if (error) {
            console.error('Error al actualizar instancia de categoría en Supabase:', error);
            // Revertir cambio local si falla
            if (previousInstance) {
              set((state) => ({
                categoryInstances: state.categoryInstances.map(ci =>
                  ci.id === id ? previousInstance : ci
                )
              }));
            }
            // Lanzar error para que el componente lo maneje
            throw new Error(error.message || 'Error al actualizar en Supabase');
          } else {
            console.log('✅ Instancia de categoría actualizada en Supabase');
          }
        } catch (e) {
          console.error('Error al actualizar instancia de categoría:', e);
          // Revertir cambio local si falla
          if (previousInstance) {
            set((state) => ({
              categoryInstances: state.categoryInstances.map(ci =>
                ci.id === id ? previousInstance : ci
              )
            }));
          }
          // Re-lanzar el error
          throw e;
        }
      },

      deleteCategoryInstance: async (id) => {
        // Guardar instancia para poder revertir
        const state = get();
        const instanceToDelete = state.categoryInstances.find(ci => ci.id === id);

        // Eliminar de estado local primero
        set((state) => ({
          categoryInstances: state.categoryInstances.filter(ci => ci.id !== id)
        }));

        // Sincronizar con Supabase
        try {
          const { error } = await supabase
            .from('category_instances')
            .delete()
            .eq('id', id);

          if (error) {
            console.error('Error al eliminar instancia de categoría en Supabase:', error);
            // Revertir si falla
            if (instanceToDelete) {
              set((state) => ({
                categoryInstances: [...state.categoryInstances, instanceToDelete]
              }));
            }
          } else {
            console.log('✅ Instancia de categoría eliminada de Supabase');
          }
        } catch (e) {
          console.error('Error al eliminar instancia de categoría:', e);
          // Revertir si falla
          if (instanceToDelete) {
            set((state) => ({
              categoryInstances: [...state.categoryInstances, instanceToDelete]
            }));
          }
        }
      },

      getCategoryInstancesByType: (type) => {
        const state = get();
        return state.categoryInstances
          .filter(ci => ci.category_type === type)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      },

      // LIBROS CRUD
      addBook: async (book) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const newBook = { ...book, id, created_at: now, updated_at: now } as Book;
        set((state) => ({ books: [...state.books, newBook] }));
        try {
          const { error } = await supabase.from('books').insert([newBook]);
          if (error) {
            console.error('Error al guardar libro:', error);
            set((state) => ({ books: state.books.filter(b => b.id !== id) }));
          }
        } catch (e) {
          console.error('Error al guardar libro:', e);
          set((state) => ({ books: state.books.filter(b => b.id !== id) }));
        }
      },

      updateBook: async (id, updates) => {
        const prev = get().books.find(b => b.id === id);
        set((state) => ({ books: state.books.map(b => b.id === id ? { ...b, ...updates, updated_at: new Date().toISOString() } : b) }));
        try {
          const { error } = await supabase.from('books').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
          if (error && prev) {
            set((state) => ({ books: state.books.map(b => b.id === id ? prev : b) }));
          }
        } catch (e) {
          if (prev) set((state) => ({ books: state.books.map(b => b.id === id ? prev : b) }));
        }
      },

      deleteBook: async (id) => {
        const prev = get().books.find(b => b.id === id);
        set((state) => ({
          books: state.books.filter(b => b.id !== id),
          bookReadingSessions: state.bookReadingSessions.filter(s => s.book_id !== id),
          bookQuotes: state.bookQuotes.filter(q => q.book_id !== id)
        }));
        try {
          await supabase.from('books').delete().eq('id', id);
        } catch (e) {
          if (prev) set((state) => ({ books: [...state.books, prev] }));
        }
      },

      addBookReadingSession: async (session) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const newSession = { ...session, id, created_at: now } as BookReadingSession;
        set((state) => ({ bookReadingSessions: [...state.bookReadingSessions, newSession] }));
        try {
          const { error } = await supabase.from('book_reading_sessions').insert([newSession]);
          if (error) {
            console.error('Error al guardar sesión de lectura:', error);
            set((state) => ({ bookReadingSessions: state.bookReadingSessions.filter(s => s.id !== id) }));
          } else {
            // Re-fetch the book to get trigger-updated stats
            if (session.book_id) {
              const { data } = await supabase.from('books').select('*').eq('id', session.book_id).single();
              if (data) {
                set((state) => ({ books: state.books.map(b => b.id === session.book_id ? data : b) }));
              }
            }
          }
        } catch (e) {
          console.error('Error al guardar sesión de lectura:', e);
        }
      },

      addBookQuote: async (quote) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const newQuote = { ...quote, id, created_at: now, updated_at: now } as BookQuote;
        set((state) => ({ bookQuotes: [...state.bookQuotes, newQuote] }));
        try {
          const { error } = await supabase.from('book_quotes').insert([newQuote]);
          if (error) {
            console.error('Error al guardar cita:', error);
            set((state) => ({ bookQuotes: state.bookQuotes.filter(q => q.id !== id) }));
          }
        } catch (e) {
          console.error('Error al guardar cita:', e);
        }
      },

      // SECCIÓN SELECCIONADA PARA POMODORO
      setSelectedSectionForPomodoro: (id, type) => {
        set({ selectedSectionForPomodoro: { id, type } });
      },

      clearSelectedSectionForPomodoro: () => {
        set({ selectedSectionForPomodoro: null });
      },

      // INGLÉS CRUD
      addEnglishSession: (session) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const newSession: EnglishSession = { ...session, id, created_at: now };
        set((state) => ({ englishSessions: [...state.englishSessions, newSession] }));
      },

      updateEnglishSession: (id, updates) => {
        set((state) => ({
          englishSessions: state.englishSessions.map(s =>
            s.id === id ? { ...s, ...updates } : s
          )
        }));
      },

      deleteEnglishSession: (id) => {
        set((state) => ({
          englishSessions: state.englishSessions.filter(s => s.id !== id)
        }));
      },
    }),
    { name: 'pomosmart-cloud-v1' }
  )
);
