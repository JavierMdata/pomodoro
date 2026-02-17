# Plan de Implementación — PomoSmart Módulos

## Resumen de Decisiones
- **Dashboard**: Sin cambios (el actual es suficiente)
- **Research/Study**: Integrado con el sistema de Materias existente — solo añadir `max_purchase_date` a Material y actualizar MaterialManager
- **English Module**: Nuevo componente dedicado con 3 metodologías: Assimil, Busuu, Pronunciación
- **Reading, Pomodoro, Tasks**: Ya implementados — sin cambios

---

## Cambios Necesarios

### 1. `types.ts` — Nuevos tipos

**A) Añadir campo a Material:**
```ts
max_purchase_date?: string;  // Fecha Máxima de Compra (para libros / proyectos empresariales)
```

**B) Nuevos tipos para EnglishModule:**
```ts
export type EnglishSessionType = 'assimil' | 'busuu' | 'pronunciacion';

export type AssimilPhase = 'pasiva' | 'activa';

export interface EnglishSession {
  id: string;
  profile_id: string;
  session_type: EnglishSessionType;
  session_date: string;
  duration_minutes: number;

  // Assimil
  assimil_lesson?: string;           // "Lección 15 - La Familia"
  assimil_phase?: AssimilPhase;      // 'pasiva' | 'activa'
  assimil_notes?: string;            // frases clave, vocab, gramática

  // Busuu
  busuu_unit?: string;               // unidad/lección
  busuu_score?: number;              // puntuación 0-100
  busuu_link?: string;               // URL a ejercicio específico

  // Pronunciación
  pronunciation_type?: string;       // "Minimal Pairs", "Lectura en Voz Alta"
  pronunciation_focus?: string;      // "Sonido /th/", "Entonación de preguntas"
  pronunciation_material?: string;   // "Video YouTube /r/ y /l/"
  pronunciation_self_eval?: string;  // autoevaluación / notas

  created_at: string;
}
```

---

### 2. `stores/useAppStore.ts` — Nuevo estado y acciones

Añadir junto a las secciones de books/journals (mismo patrón Zustand persist):

```ts
// State
englishSessions: EnglishSession[];

// Actions
addEnglishSession: (session: Omit<EnglishSession, 'id' | 'created_at'>) => void;
updateEnglishSession: (id: string, updates: Partial<EnglishSession>) => void;
deleteEnglishSession: (id: string) => void;
```

---

### 3. `components/MaterialManager.tsx` — Añadir campo max_purchase_date

- Añadir campo fecha "Fecha Máxima de Compra" en el formulario de creación/edición de Material
- Mostrar este campo de forma destacada en la lista cuando `type === 'libro'` o cuando la fecha es próxima (≤ 30 días)
- Añadir badge/alerta visual si la fecha está vencida o próxima

---

### 4. `components/EnglishModule.tsx` — NUEVO componente

Estructura del componente:
- **Header**: Stats rápidas (total sesiones, tiempo total, última sesión)
- **Tab bar**: Assimil | Busuu | Pronunciación | Historial
- **Tab Assimil**: Formulario + lista de sesiones con fase indicator (Pasiva/Activa)
- **Tab Busuu**: Formulario + lista con score visual y enlace externo
- **Tab Pronunciación**: Formulario específico + lista con foco fonético
- **Tab Historial/Stats**: Todas las sesiones ordenadas por fecha + gráfico semanal (Recharts)

---

### 5. `App.tsx` — Añadir routing del tab 'english'

En el switch/render de tabs, añadir:
```tsx
case 'english':
  return <EnglishModule />;
```

---

### 6. `components/CommandCenterSidebar.tsx` — Añadir entrada de navegación

En la sección `'academic'` del sidebar, añadir:
```ts
{ id: 'english', label: 'Inglés', icon: Languages, tab: 'english', color: '#0EA5E9' }
```
(El ícono `Languages` ya está importado en el sidebar)

---

## Orden de Implementación

1. `types.ts` — añadir `max_purchase_date` a Material + interfaces de EnglishSession
2. `stores/useAppStore.ts` — añadir state + actions de englishSessions
3. `components/MaterialManager.tsx` — añadir campo `max_purchase_date`
4. `components/EnglishModule.tsx` — crear componente completo
5. `App.tsx` — registrar tab 'english'
6. `CommandCenterSidebar.tsx` — añadir item de navegación
7. Git commit & push a `claude/dashboard-research-modules-4UeF7`
