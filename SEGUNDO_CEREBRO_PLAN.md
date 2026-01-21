# 🧠 PLAN DE IMPLEMENTACIÓN: Segundo Cerebro Integral

## 📋 Resumen Ejecutivo

Transformar PomoSmart en un sistema de gestión de conocimiento que combine:
- **Notion**: Editor de bloques y bases de datos relacionales
- **Obsidian**: Grafo de conocimiento con enlaces bidireccionales
- **Filosofía "Amar el Proceso"**: Journaling de enfoque y seguimiento emocional

---

## 🎯 Objetivos Principales

1. ✅ **Crear infraestructura de base de datos** (4 nuevas tablas + 1 vista materializada)
2. 📦 **Instalar dependencias** (TipTap editor + React Force Graph)
3. 🎨 **Implementar componentes visuales** (Editor, Grafo, Journal)
4. 🔄 **Integrar con Zustand store** (CRUD operations)
5. 🎭 **Aplicar diseño Lo-Fi/Minimalista** (estética relajante)

---

## 📊 Nuevas Tablas de Base de Datos

### 1️⃣ **content_blocks** (Bloques tipo Notion)
```sql
- Bloques de contenido enriquecido (texto, imágenes, código, bases de datos)
- Soporte para jerarquía (bloques anidados)
- 14 tipos de bloques diferentes
- JSONB para flexibilidad máxima
```

### 2️⃣ **note_links** (Enlaces bidireccionales tipo Obsidian)
```sql
- Relaciones [[enlace]] entre entidades
- Peso de enlaces (se incrementa con cada mención)
- Soporte para cualquier tipo de entidad (tareas, materias, journals, etc.)
```

### 3️⃣ **focus_journals** (Journaling de Enfoque)
```sql
- Reflexiones post-sesión
- Preguntas guiadas (qué amé, qué aprendí, qué me costó)
- Tracking de mood y flow state
- Tags personalizados
```

### 4️⃣ **knowledge_nodes** (Vista Materializada)
```sql
- Nodos optimizados para visualización de grafo
- Cálculo automático de tamaño basado en tiempo Pomodoro
- Combina datos de todas las entidades
```

### 5️⃣ **Extensión: sessions.mood**
```sql
- Campo mood agregado a sesiones existentes
- quick_notes para anotaciones rápidas
```

---

## 🛠️ Stack Tecnológico Adicional

### Nuevas Dependencias a Instalar

```bash
# Editor de bloques tipo Notion
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
npm install @tiptap/extension-image @tiptap/extension-link
npm install @tiptap/extension-task-list @tiptap/extension-task-item

# Visualización de grafos tipo Obsidian
npm install react-force-graph-2d
npm install force-graph # Engine de física

# Utilidades adicionales
npm install react-markdown remark-gfm # Para renderizar [[links]]
npm install lucide-react # (ya instalado - confirmar versión)
```

---

## 📁 Estructura de Componentes Nuevos

```
components/
├── BlockEditor/
│   ├── BlockEditor.tsx          # Editor principal tipo Notion
│   ├── BlockToolbar.tsx         # Barra de herramientas
│   ├── BlockSelector.tsx        # Selector de tipo de bloque
│   └── blocks/
│       ├── TextBlock.tsx        # Bloque de texto
│       ├── ChecklistBlock.tsx   # Lista de verificación
│       ├── DatabaseBlock.tsx    # Base de datos relacional
│       └── ImageBlock.tsx       # Bloque de imagen
│
├── KnowledgeGraph/
│   ├── KnowledgeGraph.tsx       # Visualización del grafo
│   ├── NodeDetails.tsx          # Panel de detalles del nodo
│   ├── GraphFilters.tsx         # Filtros de visualización
│   └── GraphLegend.tsx          # Leyenda del grafo
│
├── FocusJournal/
│   ├── FocusJournal.tsx         # Vista principal de journals
│   ├── JournalEntry.tsx         # Formulario de entrada
│   ├── JournalCard.tsx          # Tarjeta de journal individual
│   ├── MoodSelector.tsx         # Selector de mood visual
│   └── GuidedQuestions.tsx      # Preguntas reflexivas
│
└── Shared/
    ├── WikiLink.tsx             # Renderizador de [[enlaces]]
    ├── TagInput.tsx             # Input de tags
    └── LoFiBackground.tsx       # Fondo animado Lo-Fi
```

---

## 🎨 Paleta de Colores Lo-Fi

```css
/* Tema Claro - Aesthetic Lo-Fi */
--lofi-bg: #F5F1E8        /* Beige cálido */
--lofi-surface: #FFFFFF   /* Blanco puro */
--lofi-primary: #8B7355   /* Café suave */
--lofi-secondary: #A8B5C8 /* Azul pastel */
--lofi-accent: #E8C4A0    /* Melocotón */
--lofi-text: #4A4A4A      /* Gris oscuro */
--lofi-text-soft: #8B8B8B /* Gris medio */

/* Tema Oscuro - Chill Night */
--lofi-dark-bg: #1A1A2E       /* Azul noche oscuro */
--lofi-dark-surface: #25274D  /* Azul profundo */
--lofi-dark-primary: #AAABB8  /* Gris azulado */
--lofi-dark-secondary: #D4A5A5 /* Rosa suave */
--lofi-dark-accent: #9B8DC5   /* Lavanda */
--lofi-dark-text: #E8E8E8     /* Gris muy claro */
--lofi-dark-text-soft: #B0B0B0 /* Gris claro */

/* Moods */
--mood-energized: #F59E0B  /* Naranja */
--mood-calm: #3B82F6       /* Azul */
--mood-focused: #8B5CF6    /* Púrpura */
--mood-curious: #EC4899    /* Rosa */
--mood-proud: #10B981      /* Verde */
--mood-frustrated: #EF4444 /* Rojo */
```

---

## 🔄 Integración con Zustand Store

### Nuevas secciones en `useAppStore.ts`:

```typescript
interface AppState {
  // ... estado existente ...

  // NUEVO: Bloques de contenido
  contentBlocks: ContentBlock[]
  addContentBlock: (block: Omit<ContentBlock, 'id' | 'created_at'>) => Promise<ContentBlock>
  updateContentBlock: (id: string, updates: Partial<ContentBlock>) => Promise<void>
  deleteContentBlock: (id: string) => Promise<void>
  getBlocksByParent: (parentId: string) => ContentBlock[]
  getBlocksByEntity: (entityType: string, entityId: string) => ContentBlock[]

  // NUEVO: Enlaces de conocimiento
  noteLinks: NoteLink[]
  createLink: (source: EntityRef, target: EntityRef, text?: string) => Promise<void>
  getLinksByNode: (nodeType: string, nodeId: string) => NoteLink[]
  parseWikiLinks: (text: string) => string[] // Encuentra [[enlaces]] en texto

  // NUEVO: Journals de enfoque
  focusJournals: FocusJournal[]
  addJournal: (journal: Omit<FocusJournal, 'id' | 'created_at'>) => Promise<FocusJournal>
  updateJournal: (id: string, updates: Partial<FocusJournal>) => Promise<void>
  deleteJournal: (id: string) => Promise<void>
  getJournalsByDate: (startDate: Date, endDate: Date) => FocusJournal[]
  getJournalsByMood: (mood: string) => FocusJournal[]

  // NUEVO: Grafo de conocimiento
  knowledgeNodes: KnowledgeNode[]
  refreshKnowledgeGraph: () => Promise<void>
  searchNodes: (term: string) => KnowledgeNode[]
}
```

---

## 📅 Plan de Implementación Paso a Paso

### **FASE 1: Infraestructura (Completado ✅)**

- [x] Crear esquema SQL completo
- [x] Documentar plan de implementación

### **FASE 2: Setup de Dependencias**

- [ ] Instalar TipTap y extensiones
- [ ] Instalar React Force Graph
- [ ] Instalar utilidades adicionales
- [ ] Actualizar types.ts con nuevos tipos

### **FASE 3: Zustand Store (Lógica de Negocio)**

- [ ] Agregar tipos TypeScript para nuevas entidades
- [ ] Implementar CRUD para content_blocks
- [ ] Implementar CRUD para note_links
- [ ] Implementar CRUD para focus_journals
- [ ] Implementar función de parsing de [[wiki links]]
- [ ] Implementar función de refresh del grafo

### **FASE 4: Componente Block Editor (Tipo Notion)**

- [ ] Crear BlockEditor.tsx (componente principal)
- [ ] Integrar TipTap con configuración personalizada
- [ ] Implementar BlockToolbar (formato, tipos de bloque)
- [ ] Implementar selector de tipo de bloque (/)
- [ ] Soporte para bloques de texto enriquecido
- [ ] Soporte para checklists
- [ ] Soporte para imágenes
- [ ] Implementar auto-detección de [[enlaces]]
- [ ] Guardar bloques en Supabase automáticamente

### **FASE 5: Componente Knowledge Graph (Tipo Obsidian)**

- [ ] Crear KnowledgeGraph.tsx
- [ ] Integrar react-force-graph-2d
- [ ] Cargar nodos desde knowledge_nodes view
- [ ] Cargar enlaces desde note_links
- [ ] Implementar zoom y pan
- [ ] Colorear nodos por tipo/mood
- [ ] Tamaño de nodos según tiempo Pomodoro
- [ ] Click en nodo → mostrar detalles
- [ ] Implementar filtros (por materia, tipo, fecha)
- [ ] Tooltip al hacer hover

### **FASE 6: Componente Focus Journal**

- [ ] Crear FocusJournal.tsx (vista lista)
- [ ] Crear JournalEntry.tsx (formulario)
- [ ] Implementar MoodSelector (visual con emojis/colores)
- [ ] Implementar GuidedQuestions (preguntas reflexivas)
- [ ] Integración con sesiones Pomodoro
- [ ] Auto-sugerir journal después de cada sesión
- [ ] Filtros por mood, fecha, materia
- [ ] Búsqueda full-text en journals

### **FASE 7: Diseño Lo-Fi/Minimalista**

- [ ] Crear variables CSS para paleta Lo-Fi
- [ ] Implementar LoFiBackground.tsx (animaciones sutiles)
- [ ] Actualizar ModernLayout.tsx con nuevos estilos
- [ ] Animaciones suaves con Tailwind (transition-all, ease-in-out)
- [ ] Tipografía cálida (font-sans con Inter o Poppins)
- [ ] Bordes redondeados suaves (rounded-2xl, rounded-3xl)
- [ ] Sombras suaves (shadow-sm, shadow-md con opacidad baja)

### **FASE 8: Integración en App.tsx**

- [ ] Agregar 3 nuevos tabs:
  - 'notes' → BlockEditor (páginas independientes)
  - 'graph' → KnowledgeGraph
  - 'journal' → FocusJournal
- [ ] Actualizar navegación en ModernLayout
- [ ] Iconos: BookText (notes), Network (graph), Heart (journal)

### **FASE 9: Features Avanzadas**

- [ ] Búsqueda global en todos los bloques
- [ ] Plantillas de bloques (templates)
- [ ] Exportar grafo como imagen
- [ ] Modo "Focus" sin distracciones
- [ ] Recordatorios para journaling
- [ ] Análisis de patrones (moods recurrentes)
- [ ] Integración con IA (sugerencias de conexiones)

### **FASE 10: Testing y Documentación**

- [ ] Probar flujo completo de creación de bloques
- [ ] Probar creación automática de enlaces
- [ ] Probar visualización de grafo con datos reales
- [ ] Verificar sincronización con Supabase
- [ ] Crear guía de usuario (SEGUNDO_CEREBRO_GUIA.md)
- [ ] Screenshots y ejemplos de uso

---

## 🚀 Comandos de Ejecución

### 1. Ejecutar SQL en Supabase

```bash
# Copia el contenido de supabase/second_brain_schema.sql
# Pégalo en: Supabase Dashboard → SQL Editor → New Query
# Ejecuta todo el script
```

### 2. Instalar dependencias

```bash
cd /home/user/pomodoro
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-image @tiptap/extension-link @tiptap/extension-task-list @tiptap/extension-task-item react-force-graph-2d force-graph react-markdown remark-gfm
```

### 3. Iniciar desarrollo

```bash
npm run dev
```

---

## 📊 Métricas de Éxito

- ✅ Usuario puede crear bloques de contenido con formato enriquecido
- ✅ Enlaces [[]] se detectan y crean automáticamente
- ✅ Grafo muestra todas las conexiones de conocimiento
- ✅ Nodos se dimensionan según tiempo Pomodoro dedicado
- ✅ Journals capturan la experiencia emocional del estudio
- ✅ Diseño transmite calma y enfoque (no presión)
- ✅ Todo funciona offline con sincronización a Supabase

---

## 🎓 Filosofía de Diseño: "Amar el Proceso"

### Principios Clave

1. **Celebrar la Curiosidad** 🎨
   - El grafo muestra conexiones de aprendizaje, no solo tareas completadas
   - Los journals resaltan "qué me apasionó" antes que "qué terminé"

2. **Reducir la Presión del Reloj** ⏰
   - El timer Pomodoro es una guía, no un dictador
   - Los nodos crecen con amor invertido, no con velocidad

3. **Estética Relajante** 🌙
   - Colores cálidos y pasteles (Lo-Fi)
   - Animaciones lentas y suaves
   - Espacios en blanco generosos
   - Tipografía legible y amigable

4. **Reflexión > Producción** 🧘
   - Journaling incentivado después de cada sesión
   - Preguntas que invitan a la introspección
   - Reconocimiento del estado emocional

---

## 🔗 Recursos Adicionales

- **TipTap Documentation**: https://tiptap.dev/
- **React Force Graph**: https://github.com/vasturiano/react-force-graph
- **Obsidian Graph View**: https://help.obsidian.md/Plugins/Graph+view
- **Notion Blocks**: https://developers.notion.com/reference/block

---

## 📝 Notas Finales

- **Independencia de Perfiles**: Todas las consultas filtran por `profile_id`
- **RLS Deshabilitado**: Para desarrollo (habilitar en producción)
- **Sincronización**: Zustand maneja cache local + Supabase remoto
- **Performance**: Vista materializada se actualiza bajo demanda con `refresh_knowledge_graph()`

---

**Próximo Paso**: Ejecutar el SQL en Supabase y comenzar con la instalación de dependencias.

🎯 **Let's build your Second Brain!** 🧠✨
