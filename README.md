# 🍅 PomoSmart - Aplicación Completa de Productividad y Gestión Académica

> **Sistema integral de estudio que combina la Técnica Pomodoro con gestión académica avanzada y un "Segundo Cerebro" digital**

---

## 📋 **ÍNDICE**

1. [¿Qué es PomoSmart?](#qué-es-pomosmart)
2. [Características Principales](#características-principales)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Módulos y Funcionalidades](#módulos-y-funcionalidades)
5. [Tecnologías Utilizadas](#tecnologías-utilizadas)
6. [Guía de Uso](#guía-de-uso)
7. [Configuración y Personalización](#configuración-y-personalización)
8. [Base de Datos y Almacenamiento](#base-de-datos-y-almacenamiento)

---

## 🎯 **¿QUÉ ES POMOSMART?**

PomoSmart es una **aplicación web progresiva (PWA)** diseñada para estudiantes y profesionales que buscan maximizar su productividad académica mediante:

- ✅ **Técnica Pomodoro** con temporizador visual inmersivo
- 📚 **Gestión Académica Completa** (materias, parciales, tareas, exámenes)
- 🧠 **Segundo Cerebro Digital** tipo Notion/Obsidian
- 📊 **Análisis de Productividad** con estadísticas y gráficos
- 🔗 **Grafo de Conocimiento** para visualizar conexiones entre conceptos
- 📝 **Diario de Enfoque** para reflexión y mejora continua

---

## ✨ **CARACTERÍSTICAS PRINCIPALES**

### 🍅 **1. POMODORO PROFESIONAL**

#### **Temporizador Fullscreen Inmersivo**
- **Diseño minimalista** con círculo de progreso animado
- **Gradientes dinámicos** según el color de la materia
- **Efectos de partículas** animadas de fondo
- **Tamaños responsive**: 280px (móvil), 400px (tablet), 600px (desktop)
- **Sonidos personalizados** con Web Audio API (sin archivos externos)

#### **Controles Avanzados**
- ▶️ **Play/Pause** con gradiente animado
- 🔄 **Reset** con rotación al hover
- ⭐ **Completar** anticipadamente con rating de concentración
- 🔊 **Feedback sonoro** para cada acción (inicio, pausa, completado)

#### **Configuración Personalizable**
- ⏱️ **Tiempo de trabajo**: 1-60 minutos (default: 25)
- ☕ **Descanso corto**: 1-30 minutos (default: 5)
- 🛋️ **Descanso largo**: 1-60 minutos (default: 15)
- 🔢 **Pomodoros antes del descanso largo**: 2-10 (default: 4)
- ⚙️ **Auto-iniciar descansos**: On/Off

#### **Rating de Sesión**
Al completar cada Pomodoro, calificas tu concentración con **5 estrellas animadas**:
- ⭐ 1-2 estrellas: Baja concentración
- ⭐⭐⭐ 3 estrellas: Concentración moderada
- ⭐⭐⭐⭐⭐ 4-5 estrellas: Alta concentración

---

### 📚 **2. GESTIÓN ACADÉMICA COMPLETA**

#### **A. MATERIAS (SubjectsManager)**

##### **Grid Responsive**
- 📱 **Móvil**: 1 columna
- 📱 **Tablet (sm:640px+)**: 2 columnas
- 💻 **Desktop (lg:1024px+)**: 3 columnas

##### **Tarjetas de Materia con Glassmorphism**
Cada materia incluye:
- 🎨 **Color personalizado** con efecto glow animado
- 📊 **Barras de progreso** para Tareas y Temas
- 📈 **Estadísticas visuales**: X Parciales, X Tareas, X Temas
- ⚡ **Efecto hover** con escala y brillo
- ✏️ **Botones de editar** y **eliminar**

##### **Funcionalidades**
- ➕ **Agregar materia**: Nombre + Color personalizado
- ✏️ **Editar materia**: Modificar nombre y color
- 🗑️ **Eliminar materia**: Con confirmación (elimina parciales, tareas y materiales)
- 🔽 **Expandir/Contraer**: Ver parciales y temas de cada materia

---

#### **B. PARCIALES/EXÁMENES (Diseño Único)**

##### **Cards con Efectos Especiales**
- ✨ **Glow effect** animado con el color de la materia
- 🎨 **Gradientes** en background:
  - Dark: `from-slate-800/80 via-slate-800/60 to-slate-900/60`
  - Light: `from-white/80 via-white/60 to-slate-50/60`
- 🎯 **Icono Target** con badge circular y borde
- 📱 **Layout adaptativo**:
  - Móvil: Vertical (título + badge + chevron)
  - Desktop: Horizontal (todo en línea)

##### **Información Detallada**
Cada parcial muestra:
- 📌 **Nombre del parcial**
- 📚 **Cantidad de temas**: "Parcial • 3 temas"
- 🔽 **Expandir**: Ver lista de temas

---

#### **C. TEMAS DE EXAMEN (Con Status Visual)**

##### **Status Indicators Únicos**
Cada tema tiene un **badge cuadrado** con emoji:
- ✅ **Completado** → Badge verde con ✓
- ⏳ **En progreso** → Badge amarillo con ⟳
- ⭕ **Pendiente** → Badge gris con ○

##### **Diseño de Tema**
- 📝 **Título del tema** con truncate
- 🏷️ **Label de status**: "Completado", "En progreso", "Pendiente"
- ▶️ **Botón "Estudiar"**:
  - Gradiente con color de la materia
  - Icono Play + Flame animado
  - Efecto shimmer al hover

##### **Iniciar Pomodoro**
Al hacer clic en "Estudiar":
1. Se abre el **temporizador fullscreen**
2. Se muestra el **nombre del tema**
3. Se usa el **color de la materia**
4. Al completar, se registra la sesión con rating

---

#### **D. PROYECTO DEL PARCIAL**

Sección especial para proyectos finales:
- 📁 **Card con diseño único**:
  - Border dashed que se vuelve solid al hover
  - Glow effect sutil
  - Icono FolderKanban
- ➕ **Botón "+ Agregar Proyecto"** con color de materia

---

### 📝 **3. EDITOR DE NOTAS (BlockEditor)**

#### **Editor Enriquecido tipo Notion**

##### **Características del Editor**
- 📝 **TipTap** (editor WYSIWYG extensible)
- 🎨 **Formato de texto**:
  - Negrita, cursiva, código inline
  - Encabezados H1, H2, H3
  - Listas ordenadas y desordenadas
  - Listas de tareas (checkboxes)
- 🖼️ **Imágenes**: Drag & drop o selección
- 🔢 **Fórmulas matemáticas**: Soporte LaTeX con KaTeX
- 🔗 **Enlaces**: Inserción de URLs

##### **Auto-guardado Inteligente**
- 💾 **Guardado automático** cada 3 segundos
- 💾 **Guardado manual** con botón
- ✅ **Indicador visual** de estado:
  - 🟣 "Guardando..."
  - 🟢 "Guardado 12:34:56"

##### **Asociación a Materias**
- 🔗 **Vincular nota** a una materia específica
- 📚 **Dropdown** con lista de materias
- 🎨 **Badge de materia** con color personalizado

##### **Detección de Hashtags**
- 🏷️ **Detección automática** de #hashtags
- 📊 **Contador** de hashtags en header
- 🏷️ **Footer** con lista de todos los hashtags
- 🔍 **Búsqueda** por hashtag (futuro)

##### **Toolbar Responsive**
- 📱 **Móvil**: Scroll horizontal, iconos compactos
- 💻 **Desktop**: Todos los botones visibles
- 🎨 **Botones con estado activo** (fondo morado)

---

### 🧠 **4. SEGUNDO CEREBRO DIGITAL**

#### **A. KNOWLEDGE GRAPH (Grafo de Conocimiento)**

##### **Visualización Interactiva**
- 🌐 **Grafo 2D** con Force Graph
- 🔵 **Nodos** por tipo de entidad:
  - 📚 Materias (azul)
  - 📝 Tareas (verde)
  - 📄 Exámenes (naranja)
  - 📋 Temas (morado)
  - 📝 Notas (cyan)
- 🔗 **Enlaces** bidireccionales entre entidades
- 🔍 **Zoom** y navegación interactiva

##### **Tipos de Conexiones**
- **Materia ↔ Examen**: Parciales de una materia
- **Examen ↔ Tema**: Temas de un parcial
- **Materia ↔ Tarea**: Tareas de una materia
- **Nota ↔ Materia**: Notas asociadas a materias
- **Enlaces Wiki**: `[[Nombre]]` en notas

##### **Funcionalidades**
- 🔍 **Búsqueda** de nodos por nombre
- 🎯 **Filtrar** por tipo de entidad
- 📊 **Metadatos** de nodos:
  - Tiempo total dedicado
  - Cantidad de sesiones
  - Rating promedio de enfoque

---

#### **B. FOCUS JOURNAL (Diario de Enfoque)**

##### **Filosofía "Amar el Proceso"**
Reflexión estructurada después de cada sesión de estudio.

##### **Componentes del Journal**
1. **Estado Emocional** (9 opciones):
   - 😊 Energizado
   - 😌 Tranquilo
   - 🎯 Enfocado
   - 😴 Cansado
   - 😰 Ansioso
   - 😤 Frustrado
   - 😑 Neutral
   - 😁 Feliz
   - 😔 Triste

2. **Preguntas Guiadas**:
   - 💖 **¿Qué te apasionó?**
   - 📚 **¿Qué aprendiste?**
   - 💪 **¿Con qué luchaste?**
   - 🚀 **¿Próximos pasos?**

3. **Métricas**:
   - ⚡ **Nivel de energía** (1-5)
   - 🌊 **Flow State** (1-5)

4. **Tags Personalizados**:
   - 🏷️ Agregar etiquetas libres
   - 🔍 Filtrar journals por tag

##### **Estadísticas del Journal**
- 📊 **Total de journals**
- 😊 **Mood más frecuente**
- 🌊 **Flow state promedio**

---

### 📊 **5. ESTADÍSTICAS Y ANÁLISIS**

#### **Dashboard de Productividad**

##### **Métricas Generales**
- ⏱️ **Total de tiempo estudiado**
- 🍅 **Pomodoros completados**
- 📈 **Promedio de concentración**
- 🔥 **Racha actual** de días

##### **Gráficos Interactivos**
- 📊 **Gráfico de barras**: Pomodoros por materia
- 📈 **Gráfico de líneas**: Productividad en el tiempo
- 🥧 **Gráfico circular**: Distribución de tiempo por materia
- 📅 **Calendario de actividad**: Heatmap de sesiones

##### **Análisis por Materia**
Para cada materia:
- 🍅 **Pomodoros dedicados**
- ⏱️ **Tiempo total**
- ⭐ **Rating promedio**
- 📊 **Progreso de tareas** (%)
- 📊 **Progreso de temas** (%)

---

### 🔐 **6. GESTIÓN DE PERFILES**

#### **Sistema Multi-Perfil**

##### **Funcionalidades**
- 👤 **Crear perfiles** ilimitados
- ✏️ **Editar perfil**: Nombre y configuraciones
- 🗑️ **Eliminar perfil** (con confirmación)
- 🔄 **Cambiar entre perfiles** rápidamente

##### **Seguridad con PIN**
- 🔒 **PIN de 4 dígitos** opcional
- 🔐 **Protección** al cambiar de perfil
- ✅ **Validación** antes de acceder
- 🎨 **UI de PIN** con teclado numérico animado

##### **Configuraciones por Perfil**
Cada perfil tiene:
- ⚙️ **Settings de Pomodoro** independientes
- 📚 **Materias** propias
- 📝 **Tareas y exámenes** separados
- 📊 **Estadísticas** individuales
- 🧠 **Segundo cerebro** propio

---

### 🎨 **7. TEMAS Y PERSONALIZACIÓN**

#### **Modo Claro/Oscuro**
- ☀️ **Light Mode**: Fondo blanco con acentos suaves
- 🌙 **Dark Mode**: Fondo slate-900 con glassmorphism
- 🔄 **Toggle** instantáneo sin recarga
- 💾 **Persistencia** en localStorage

#### **Colores Personalizados**
- 🎨 **Selector de color** para cada materia
- 🌈 **Paleta HEX** completa
- ✨ **Efectos visuales** adaptados al color:
  - Glow effects
  - Gradientes
  - Badges
  - Botones de Pomodoro

#### **Glassmorphism & Efectos**
- 🔮 **Backdrop blur** en tarjetas
- ✨ **Gradientes animados** de fondo
- 💫 **Partículas flotantes**
- 🌊 **Transiciones suaves** (duration-300/500)

---

## 🏗️ **ARQUITECTURA DEL SISTEMA**

### **Stack Tecnológico**

#### **Frontend**
- ⚛️ **React 19.2** con TypeScript
- 🎨 **Tailwind CSS 3.4** para estilos
- 🗂️ **Zustand** para state management
- 🔄 **Zustand Persist** para localStorage

#### **Editor y Visualización**
- 📝 **TipTap** (editor WYSIWYG)
- 🔢 **KaTeX** (fórmulas matemáticas)
- 🌐 **Force Graph** (visualización de grafos)
- 📊 **Recharts** (gráficos estadísticos)

#### **Backend y Base de Datos**
- 🗄️ **Supabase** (PostgreSQL + Auth + Storage)
- 🔄 **Sincronización en tiempo real**
- 💾 **Backup automático** en la nube

#### **PWA y Optimización**
- 📱 **Service Worker** para funcionalidad offline
- 🚀 **Vite** para build ultrarrápido
- ⚡ **Code splitting** automático

---

### **Estructura de Directorios**

```
pomodoro/
├── components/          # Componentes React
│   ├── FullscreenPomodoro.tsx    # Timer fullscreen
│   ├── SubjectsManager.tsx       # Gestión de materias
│   ├── BlockEditor.tsx           # Editor de notas
│   ├── KnowledgeGraph.tsx        # Grafo de conocimiento
│   ├── FocusJournal.tsx          # Diario de enfoque
│   ├── ProfileSettings.tsx       # Configuración
│   └── ...
├── stores/             # Estado global (Zustand)
│   └── useAppStore.ts
├── lib/                # Utilidades
│   ├── supabase.ts              # Cliente Supabase
│   └── soundService.ts          # Servicio de sonidos
├── types.ts            # Definiciones TypeScript
├── public/             # Assets estáticos
└── dist/               # Build de producción
```

---

## 📖 **MÓDULOS Y FUNCIONALIDADES DETALLADAS**

### **1. COMPONENTE: FullscreenPomodoro.tsx**

#### **Props**
```typescript
interface FullscreenPomodoroProps {
  item: {
    title: string;           // Nombre del tema/tarea
    color?: string;          // Color de la materia
    subjectName?: string;    // Nombre de la materia
  };
  duration: number;          // Duración en minutos
  onClose: () => void;       // Callback al cerrar
  onComplete: (rating: number) => void;  // Callback al completar
}
```

#### **Estados Internos**
- `timeLeft`: Segundos restantes
- `isActive`: Timer activo/pausado
- `showComplete`: Mostrar modal de rating
- `rating`: Rating seleccionado (1-5)

#### **Efectos**
1. **useEffect para duration**: Actualiza `timeLeft` cuando cambian las settings
2. **useEffect para countdown**: Decrementa cada segundo cuando está activo

#### **Funciones**
- `handleStart()`: Inicia timer + sonido
- `handlePause()`: Pausa timer
- `handleReset()`: Reinicia a duración original
- `handleComplete()`: Detiene y muestra modal de rating
- `formatTime()`: Formatea segundos a MM:SS

#### **Sonidos**
- 🔊 **Inicio**: Acorde ascendente (C5, E5, G5)
- 🔊 **Completado**: Campana (C5, E5, G5, C6)

---

### **2. COMPONENTE: SubjectsManager.tsx**

#### **Estados Locales**
- `expandedSubjects`: Set de IDs de materias expandidas
- `expandedExams`: Set de IDs de exámenes expandidos
- `showAddSubject`: Modal de agregar materia
- `showEditSubject`: Modal de editar materia
- `newSubjectName`: Nombre de nueva materia
- `newSubjectColor`: Color de nueva materia

#### **Funciones CRUD**
- `handleAddSubject()`: Agregar materia con validación
- `handleEditSubject()`: Modificar materia existente
- `handleDeleteSubject()`: Eliminar con confirmación
- `toggleSubject()`: Expandir/contraer materia
- `toggleExam()`: Expandir/contraer examen
- `startPomodoro()`: Iniciar sesión de estudio

#### **Organización de Datos**
```typescript
interface SubjectWithData {
  subject: Subject;
  exams: Exam[];
  topics: ExamTopic[];
  tasks: Task[];
  materials: Material[];
}
```

Usa `useMemo` para calcular:
- Exámenes por materia
- Temas por examen
- Tareas completadas/pendientes
- Porcentajes de progreso

---

### **3. COMPONENTE: BlockEditor.tsx**

#### **Configuración de TipTap**
```typescript
const editor = useEditor({
  extensions: [
    StarterKit,            // Formato básico
    Image,                 // Soporte de imágenes
    Link,                  // Enlaces
    Mathematics,           // LaTeX
    TaskList,              // Listas de tareas
    TaskItem,              // Items de tareas
    Placeholder,           // Placeholder personalizado
  ],
  content: initialContent,
  onUpdate: ({ editor }) => {
    // Auto-guardar cada 3s
  }
});
```

#### **Auto-guardado**
- ⏱️ **Debounce** de 3 segundos
- 💾 **Guarda en Supabase** automáticamente
- ✅ **Actualiza timestamp** de "último guardado"

#### **Detección de Hashtags**
Regex: `/#[\w]+/g`
- Encuentra todos los #hashtags
- Los almacena en un array
- Los muestra en el footer
- Permite búsqueda futura

---

### **4. STORE: useAppStore.ts**

#### **Estado Global**
```typescript
interface AppState {
  // UI
  theme: 'light' | 'dark';

  // Perfiles
  profiles: Profile[];
  activeProfileId: string | null;

  // Académico
  periods: SchoolPeriod[];
  subjects: Subject[];
  tasks: Task[];
  exams: Exam[];
  examTopics: ExamTopic[];
  materials: Material[];

  // Productividad
  sessions: PomodoroSession[];
  settings: Record<string, PomodoroSettings>;
  alerts: Alert[];

  // Segundo Cerebro
  contentBlocks: ContentBlock[];
  noteLinks: NoteLink[];
  focusJournals: FocusJournal[];
  knowledgeNodes: KnowledgeNode[];
}
```

#### **Acciones Principales**
- **Perfiles**: `addProfile`, `deleteProfile`, `setActiveProfile`
- **Materias**: `addSubject`, `updateSubject`, `deleteSubject`
- **Tareas**: `addTask`, `updateTask`
- **Exámenes**: `addExam`, `updateExam`, `deleteExam`
- **Temas**: `addExamTopic`, `updateExamTopic`, `deleteExamTopic`
- **Sesiones**: `addSession`
- **Settings**: `updateSettings`
- **Notas**: `addContentBlock`, `updateContentBlock`
- **Journal**: `addFocusJournal`, `updateFocusJournal`
- **Grafo**: `refreshKnowledgeGraph`, `searchNodes`

#### **Sincronización con Supabase**
```typescript
syncWithSupabase: async () => {
  // Cargar perfiles
  // Cargar materias
  // Cargar exámenes
  // Cargar tareas
  // Cargar sesiones
  // Cargar notas
  // Refrescar grafo
}
```

---

## 🗄️ **BASE DE DATOS Y ALMACENAMIENTO**

### **Supabase (PostgreSQL)**

#### **Tablas Principales**

##### **1. profiles**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT,
  pin_code TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

##### **2. subjects**
```sql
CREATE TABLE subjects (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  school_period_id UUID NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  professor_name TEXT,
  classroom TEXT,
  code TEXT,
  start_date DATE,
  end_date DATE,
  icon TEXT
);
```

##### **3. exams**
```sql
CREATE TABLE exams (
  id UUID PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id),
  name TEXT NOT NULL,
  exam_date DATE,
  total_score NUMERIC,
  weight NUMERIC,
  description TEXT
);
```

##### **4. exam_topics**
```sql
CREATE TABLE exam_topics (
  id UUID PRIMARY KEY,
  exam_id UUID REFERENCES exams(id),
  title TEXT NOT NULL,
  estimated_pomodoros INTEGER,
  completed_pomodoros INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')),
  notes TEXT,
  resources_url TEXT
);
```

##### **5. tasks**
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  subject_id UUID REFERENCES subjects(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')),
  estimated_pomodoros INTEGER,
  completed_pomodoros INTEGER DEFAULT 0,
  score NUMERIC,
  weight NUMERIC
);
```

##### **6. pomodoro_sessions**
```sql
CREATE TABLE pomodoro_sessions (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  task_id UUID REFERENCES tasks(id),
  exam_topic_id UUID REFERENCES exam_topics(id),
  material_id UUID REFERENCES materials(id),
  session_type TEXT CHECK (session_type IN ('work', 'short_break', 'long_break')),
  planned_duration_minutes INTEGER,
  duration_seconds INTEGER,
  status TEXT CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  focus_rating INTEGER CHECK (focus_rating BETWEEN 1 AND 5),
  notes TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

##### **7. content_blocks (Notas)**
```sql
CREATE TABLE content_blocks (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  parent_block_id UUID REFERENCES content_blocks(id),
  block_type TEXT,
  position INTEGER,
  title TEXT,
  content TEXT,
  subject_id UUID REFERENCES subjects(id),
  task_id UUID REFERENCES tasks(id),
  exam_id UUID REFERENCES exams(id),
  exam_topic_id UUID REFERENCES exam_topics(id),
  material_id UUID REFERENCES materials(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

##### **8. focus_journals**
```sql
CREATE TABLE focus_journals (
  id UUID PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  session_id UUID REFERENCES pomodoro_sessions(id),
  mood TEXT,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  flow_state INTEGER CHECK (flow_state BETWEEN 1 AND 5),
  what_loved TEXT,
  what_learned TEXT,
  what_struggled TEXT,
  next_steps TEXT,
  tags TEXT[],
  subject_id UUID REFERENCES subjects(id),
  task_id UUID REFERENCES tasks(id),
  exam_topic_id UUID REFERENCES exam_topics(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

##### **9. pomodoro_settings**
```sql
CREATE TABLE pomodoro_settings (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id),
  work_duration INTEGER DEFAULT 25,
  short_break INTEGER DEFAULT 5,
  long_break INTEGER DEFAULT 15,
  poms_before_long INTEGER DEFAULT 4,
  auto_start_breaks BOOLEAN DEFAULT false
);
```

---

### **localStorage (Respaldo)**

Zustand Persist guarda todo el estado en `localStorage`:
```javascript
{
  "state": {
    "theme": "dark",
    "profiles": [...],
    "subjects": [...],
    "tasks": [...],
    "sessions": [...],
    "contentBlocks": [...],
    // ...
  },
  "version": 0
}
```

**Ventajas**:
- ✅ Funciona sin internet
- ✅ Respaldo automático
- ✅ Recuperación rápida

---

## 🎯 **GUÍA DE USO**

### **1. PRIMER USO**

#### **Paso 1: Crear Perfil**
1. Abre la app
2. Haz clic en "➕ Nuevo Perfil"
3. Ingresa tu nombre
4. (Opcional) Configura un PIN de 4 dígitos
5. Haz clic en "Crear Perfil"

#### **Paso 2: Configurar Pomodoro**
1. Ve a "⚙️ Config"
2. Ajusta los tiempos:
   - Tiempo de trabajo (ej: 25 min)
   - Descanso corto (ej: 5 min)
   - Descanso largo (ej: 15 min)
3. Haz clic en "💾 Guardar Preferencias"

#### **Paso 3: Agregar Primera Materia**
1. Ve a "📚 Estudio"
2. Haz clic en "Nueva Materia"
3. Ingresa el nombre (ej: "Cálculo Integral")
4. Selecciona un color
5. Haz clic en "Crear Materia"

---

### **2. GESTIÓN DE PARCIALES Y TEMAS**

#### **Agregar Parcial**
1. Expande una materia (clic en el nombre)
2. Los parciales se cargan desde Supabase
3. Para agregar, usa otro componente (ExamManager)

#### **Agregar Temas**
1. Expande un parcial
2. Haz clic en "➕ Agregar Tema"
3. Ingresa título y estimación de pomodoros
4. Guarda

#### **Estudiar un Tema**
1. Haz clic en "▶️ Estudiar" en un tema
2. Se abre el Pomodoro fullscreen
3. Haz clic en Play para iniciar
4. Al terminar, califica tu concentración (1-5 ⭐)

---

### **3. TOMAR NOTAS**

#### **Crear Nota**
1. Ve a "📝 Notas"
2. Escribe un título
3. Vincula a una materia (opcional)
4. Usa el toolbar para formato:
   - **B** = Negrita
   - *I* = Cursiva
   - H1/H2/H3 = Encabezados
   - Lista = Listas
   - ☑️ = Lista de tareas
5. Inserta imágenes arrastrando
6. Agrega fórmulas con botón Σ

#### **Hashtags**
- Escribe `#importante` en cualquier parte
- Se detecta automáticamente
- Aparece en el footer

---

### **4. DIARIO DE ENFOQUE**

#### **Crear Entrada**
1. Ve a "❤️ Journal"
2. Selecciona tu estado emocional
3. Responde las preguntas:
   - ¿Qué te apasionó hoy?
   - ¿Qué aprendiste?
   - ¿Con qué luchaste?
   - ¿Próximos pasos?
4. Califica energía y flow (1-5)
5. Agrega tags personalizados
6. Guarda

---

### **5. VISUALIZAR GRAFO**

1. Ve a "🌐 Grafo"
2. Verás todos los nodos:
   - 🔵 Materias
   - 🟢 Tareas
   - 🟠 Exámenes
   - 🟣 Temas
3. Haz clic en un nodo para detalles
4. Arrastra para mover
5. Usa la rueda del mouse para zoom

---

## 🎨 **CONFIGURACIÓN Y PERSONALIZACIÓN**

### **Temas Visuales**

#### **Cambiar Tema**
- Haz clic en el botón ☀️/🌙 en la esquina superior derecha
- Cambio instantáneo sin recarga

#### **Personalizar Colores de Materias**
1. Al crear/editar materia
2. Haz clic en el selector de color
3. Elige cualquier color HEX
4. El color se aplica a:
   - Glow effects
   - Botones de Pomodoro
   - Badges de parciales
   - Iconos de temas

---

### **Sonidos**

#### **Tipos de Sonidos**
- 🔔 **Inicio**: Acorde ascendente
- ⏸️ **Pausa**: Dos tonos descendentes
- ✅ **Completado**: Campana de 4 notas
- ❌ **Error**: Dos tonos bajos

#### **Deshabilitar Sonidos**
- En construcción: Toggle en Settings

---

### **Vibración Háptica**

En dispositivos móviles:
- **Guardar**: Vibración [100ms, 50ms, 100ms]
- **Clicks**: Vibración de 10-30ms
- **Alerts**: Vibración de patrón

---

## 🚀 **INSTALACIÓN Y DESARROLLO**

### **Requisitos**
- Node.js 18+
- npm o yarn
- Cuenta de Supabase (opcional)

### **Instalación**
```bash
# Clonar repositorio
git clone https://github.com/JavierMdata/pomodoro.git
cd pomodoro

# Instalar dependencias
npm install

# Configurar Supabase
cp .env.example .env
# Edita .env con tus credenciales

# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview de producción
npm run preview
```

### **Variables de Entorno**
```env
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

---

## 📱 **RESPONSIVE DESIGN**

### **Breakpoints de Tailwind**

- **Móvil (base)**: 0px+ (sin prefijo)
- **Tablet (sm:)**: 640px+
- **Desktop (md:)**: 768px+
- **Large Desktop (lg:)**: 1024px+
- **XL Desktop (xl:)**: 1280px+

### **Ejemplos Aplicados**

#### **Pomodoro Timer**
```css
/* Tamaño del círculo */
w-[280px] md:w-[400px] lg:w-[600px]

/* Tamaño del texto del timer */
text-6xl md:text-8xl lg:text-[180px]

/* Botones */
w-32 md:w-40 lg:w-48
p-4 md:p-6 lg:p-8
```

#### **Grid de Materias**
```css
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
```

#### **Paddings Responsive**
```css
p-4 md:p-6 lg:p-8
```

---

## 🐛 **SOLUCIÓN DE PROBLEMAS**

### **Error: "a is not a function"**
**Causa**: Nombre incorrecto de función en el store.
**Solución**: ✅ Ya arreglado (usar `updateSettings` en lugar de `updatePomodoroSettings`)

### **Configuraciones no se guardan**
**Causa**: Error en el hook de Zustand.
**Solución**: ✅ Ya arreglado con `useEffect` para sincronizar settings

### **AudioContext warning en consola**
**Causa**: Navegadores requieren interacción del usuario para iniciar audio.
**Solución**: Normal, se resuelve al hacer clic en Play

### **Supabase 401 errors**
**Causa**: Políticas RLS no configuradas.
**Solución**: Ejecuta el SQL de políticas en Supabase

---

## 📚 **TECNOLOGÍAS Y LIBRERÍAS**

### **Core**
- React 19.2.3
- TypeScript 5.x
- Vite 6.4.1
- Tailwind CSS 3.4.1

### **State Management**
- Zustand 5.x
- Zustand Persist

### **Editor**
- @tiptap/react 3.16.0
- @tiptap/starter-kit 3.16.0
- @tiptap/extension-image 3.16.0
- @tiptap/extension-mathematics 3.16.0
- KaTeX 0.16.27

### **Visualización**
- react-force-graph-2d 1.29.0
- recharts 2.x
- force-graph 1.51.0

### **Backend**
- @supabase/supabase-js 2.48.1

### **Utilidades**
- date-fns 4.1.0
- lucide-react 0.562.0

---

## 🎓 **METODOLOGÍA APLICADA**

### **Técnica Pomodoro**
- 🍅 25 minutos de trabajo enfocado
- ☕ 5 minutos de descanso
- 🛋️ 15 minutos de descanso largo cada 4 pomodoros

### **Segundo Cerebro (PARA System)**
- **P**rojects: Tareas con fecha límite
- **A**reas: Materias de estudio
- **R**esources: Materiales y notas
- **A**rchive: Proyectos completados

### **Filosofía "Amar el Proceso"**
- Reflexión post-sesión
- Registro de aprendizajes
- Identificación de obstáculos
- Planificación de mejoras

---

## 🎯 **ROADMAP FUTURO**

### **Próximas Features**
- [ ] Notificaciones push
- [ ] Sincronización en tiempo real
- [ ] Modo offline completo
- [ ] Exportar estadísticas a PDF
- [ ] Integración con Google Calendar
- [ ] Compartir materias con compañeros
- [ ] IA para sugerencias de estudio
- [ ] Modo "Focus" con bloqueo de distracciones

---

## 📝 **LICENCIA**

MIT License - Ver archivo LICENSE para más detalles.

---

## 👤 **AUTOR**

Creado con ❤️ por **JavierMdata**
- GitHub: [@JavierMdata](https://github.com/JavierMdata)

---

## 🙏 **AGRADECIMIENTOS**

- A la comunidad de React por el ecosistema increíble
- A Vercel por el hosting
- A Supabase por el backend as a service
- A todos los estudiantes que buscan mejorar su productividad

---

**🍅 ¡Feliz Pomodoro! 🎓**
