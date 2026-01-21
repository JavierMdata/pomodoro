
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import {
  Profile, SchoolPeriod, Subject, Task, Exam,
  ExamTopic, Material, PomodoroSession, PomodoroSettings, Alert,
  ContentBlock, NoteLink, FocusJournal, KnowledgeNode,
  EntityType, EntityRef
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

  // SEGUNDO CEREBRO: Nuevos estados
  contentBlocks: ContentBlock[];
  noteLinks: NoteLink[];
  focusJournals: FocusJournal[];
  knowledgeNodes: KnowledgeNode[];

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

      // SEGUNDO CEREBRO: Estados iniciales
      contentBlocks: [],
      noteLinks: [],
      focusJournals: [],
      knowledgeNodes: [],

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
              tasks: tasksData || [],
              exams: examsData || [],
              examTopics: topicsData || [],
              materials: materialsData || [],
              sessions: sessionsData || [],
              alerts: alertsData || [],
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
      })),

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
      }
    }),
    { name: 'pomosmart-cloud-v1' }
  )
);
