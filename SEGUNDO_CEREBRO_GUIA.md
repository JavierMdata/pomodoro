# 🧠 Guía Completa: Segundo Cerebro Integral de PomoSmart

¡Bienvenido a la nueva era de PomoSmart! Tu aplicación de Pomodoro ahora es un **Segundo Cerebro Completo** que combina lo mejor de **Notion** y **Obsidian** con una filosofía centrada en **amar el proceso** de aprendizaje.

---

## 📋 Tabla de Contenidos

1. [Novedades Principales](#novedades-principales)
2. [Instalación y Configuración](#instalación-y-configuración)
3. [Nuevas Funcionalidades](#nuevas-funcionalidades)
4. [Guía de Uso](#guía-de-uso)
5. [Filosofía "Amar el Proceso"](#filosofía-amar-el-proceso)
6. [Trucos y Consejos](#trucos-y-consejos)
7. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 🎉 Novedades Principales

### ✨ 3 Nuevas Secciones en PomoSmart

1. **📝 Notas** (Editor de Bloques tipo Notion)
   - Editor de texto enriquecido
   - Bloques de contenido personalizables
   - Detección automática de [[enlaces]] entre notas
   - Auto-guardado cada 3 segundos

2. **🕸️ Grafo de Conocimiento** (Mapa de Nodos tipo Obsidian)
   - Visualización interactiva de tu red de conocimiento
   - Nodos que crecen según tiempo Pomodoro dedicado
   - Enlaces bidireccionales entre tareas, materias, journals y notas
   - Filtros por tipo de contenido y búsqueda en tiempo real

3. **💖 Journal de Enfoque** (Filosofía "Amar el Proceso")
   - Reflexiones post-sesión de estudio
   - Preguntas guiadas para introspección
   - Seguimiento de estado emocional (moods)
   - Medición de flow state y energía

---

## 🛠️ Instalación y Configuración

### Paso 1: Ejecutar el Script SQL

1. Abre tu **Supabase Dashboard**
2. Ve a **SQL Editor**
3. Crea una **New Query**
4. Copia y pega TODO el contenido de `supabase/second_brain_schema.sql`
5. Presiona **Run** (ejecutar)
6. Verifica que no haya errores (deberías ver mensajes de éxito)

**Tablas creadas:**
- ✅ `content_blocks` (bloques de notas)
- ✅ `note_links` (enlaces bidireccionales)
- ✅ `focus_journals` (journals de enfoque)
- ✅ `knowledge_nodes` (vista materializada del grafo)

### Paso 2: Las Dependencias ya están instaladas

Ya instalamos todas las dependencias necesarias:
- ✅ `@tiptap/react` - Editor de texto enriquecido
- ✅ `react-force-graph-2d` - Visualización de grafos
- ✅ `react-markdown` - Renderizado de markdown

### Paso 3: Ejecutar la Aplicación

```bash
npm run dev
```

La app se abrirá en `http://localhost:3000`

---

## 🚀 Nuevas Funcionalidades

### 1. 📝 Editor de Notas (Tipo Notion)

#### Características

**Formato de Texto:**
- **Negrita**, *cursiva*, `código`
- Encabezados (H1, H2, H3)
- Listas de viñetas y numeradas
- Listas de tareas (checkboxes)
- Citas y bloques de código

**Elementos Enriquecidos:**
- Imágenes (con URL)
- Enlaces externos
- [[Enlaces internos]] a otras notas/tareas

**Auto-guardado:**
- Guardado automático cada 3 segundos
- Indicador visual de estado (guardando/guardado)
- Sincronización con Supabase

#### Cómo Usar

1. Ve a la pestaña **Notas** 📝
2. Escribe un título para tu nota
3. Escribe contenido usando la barra de herramientas
4. Usa `[[nombre]]` para crear enlaces a otras entidades
5. La nota se guarda automáticamente

**Ejemplo de nota:**

```markdown
# Aprendizaje de Algoritmos Recursivos

Hoy estudié el algoritmo de **merge sort**. Me encantó cómo se divide
el problema en subproblemas más pequeños.

Conexiones:
- [[Estructuras de Datos]]
- [[Complejidad Algorítmica]]

Pendiente: Practicar con ejercicios de [[LeetCode]]
```

---

### 2. 🕸️ Grafo de Conocimiento (Tipo Obsidian)

#### Características

**Visualización Interactiva:**
- Nodos representan: materias, tareas, exámenes, journals, notas
- Tamaño de nodo = tiempo Pomodoro dedicado
- Color de nodo = tipo de contenido o mood
- Grosor de enlace = frecuencia de conexión

**Controles:**
- 🔍 Zoom in/out
- 🖱️ Arrastrar y soltar nodos
- 🎯 Click en nodo para ver detalles
- 🔎 Búsqueda en tiempo real
- 🎨 Filtros por tipo de contenido

#### Cómo Usar

1. Ve a la pestaña **Grafo** 🕸️
2. El grafo se carga automáticamente con tus datos
3. **Explorar:**
   - Haz zoom con los botones o con la rueda del mouse
   - Arrastra nodos para reorganizar
   - Haz click en un nodo para ver sus detalles
4. **Filtrar:**
   - Usa los botones de filtro (Materias, Tareas, Journals, etc.)
   - Busca por nombre en el campo de búsqueda
5. **Entender el grafo:**
   - Nodos grandes = más tiempo dedicado
   - Enlaces gruesos = conexiones fuertes
   - Colores = categorías o moods

**Interpretación:**

```
Nodo Grande → Has dedicado mucho tiempo
Muchos enlaces → Concepto central
Enlaces gruesos → Conceptos relacionados frecuentemente
```

---

### 3. 💖 Journal de Enfoque (Filosofía "Amar el Proceso")

#### Características

**Preguntas Reflexivas:**
- 💖 ¿Qué te apasionó de esta sesión?
- ✨ ¿Qué aprendiste?
- 🤔 ¿Con qué luchaste?
- 🚀 ¿Próximos pasos?

**Seguimiento Emocional:**
- 9 moods diferentes: energizado, tranquilo, enfocado, curioso, orgulloso, etc.
- Nivel de energía (1-5)
- Flow state rating (1-5)

**Estadísticas:**
- Total de journals
- Mood más frecuente
- Flow state promedio
- Journals del mes

#### Cómo Usar

1. Ve a la pestaña **Journal** 💖
2. Haz click en **Nuevo Journal**
3. Completa el formulario:
   - **Título:** Ej: "Descubrimiento sobre recursión"
   - **Mood:** Selecciona cómo te sentiste
   - **Reflexión:** Escribe tu experiencia
   - **Preguntas guiadas:** (opcional) Responde las 4 preguntas
   - **Niveles:** Ajusta energía y flow state
4. Haz click en **Crear Journal**

**Ejemplo de journal:**

```
Título: Breakthrough en Machine Learning

Mood: 🤔 Curioso

Reflexión:
Hoy por fin entendí cómo funciona el backpropagation.
Ver las matemáticas detrás del algoritmo fue revelador.

💖 ¿Qué te apasionó?
La elegancia de cómo las derivadas se propagan hacia atrás

✨ ¿Qué aprendiste?
Regla de la cadena aplicada a redes neuronales

🤔 ¿Con qué luchaste?
Las notaciones matriciales al principio confundían

🚀 ¿Próximos pasos?
Implementar una red neuronal desde cero

Energía: ⚡⚡⚡⚡ (4/5)
Flow State: ⭐⭐⭐⭐⭐ (5/5)
```

---

## 💡 Filosofía "Amar el Proceso"

### Cambio de Mentalidad

PomoSmart ya no es solo sobre **completar tareas**. Ahora es sobre **disfrutar el viaje de aprendizaje**.

#### Antes vs Ahora

| Antes | Ahora |
|-------|-------|
| Enfoque en terminar | Enfoque en aprender |
| Presión del reloj | Reloj como guía |
| Tareas completadas | Conocimiento conectado |
| Productividad fría | Proceso con significado |

### Principios Clave

1. **Celebra la Curiosidad** 🎨
   - El grafo muestra conexiones de aprendizaje
   - Los journals resaltan "qué amé" no "qué terminé"

2. **Reduce la Presión** ⏰
   - El timer es una herramienta, no un dictador
   - Los nodos crecen con amor invertido

3. **Estética Relajante** 🌙
   - Colores cálidos y pasteles
   - Animaciones suaves
   - Diseño Lo-Fi minimalista

4. **Reflexión > Producción** 🧘
   - Journaling después de sesiones
   - Preguntas introspectivas
   - Reconocimiento emocional

---

## 🎯 Guía de Uso Práctica

### Flujo de Trabajo Recomendado

#### 1. Antes de Estudiar

1. Ve a **Journal** y revisa tus últimas reflexiones
2. Identifica en qué mood estás hoy
3. Revisa tu **Grafo** para ver conexiones recientes

#### 2. Durante el Estudio

1. Usa el **Pomodoro Timer** como siempre
2. Toma **Notas** en la nueva sección con formato enriquecido
3. Usa `[[enlaces]]` para conectar conceptos relacionados

#### 3. Después de Estudiar

1. Crea un **Journal** de enfoque
2. Responde las preguntas reflexivas
3. Revisa tu **Grafo** para ver cómo creció tu conocimiento

### Caso de Uso: Preparar un Examen

```mermaid
1. Crear temas de examen (como siempre)
2. Crear notas para cada tema ([[Tema 1]], [[Tema 2]])
3. Durante sesiones Pomodoro, vincular notas a temas
4. Después de cada sesión, journal sobre qué aprendiste
5. Revisar el grafo para identificar temas débiles (nodos pequeños)
6. Enfocarte en nodos pequeños (menos tiempo dedicado)
7. Celebrar el crecimiento del grafo
```

---

## 🔗 Enlaces Bidireccionales [[]]

### ¿Qué son?

Los enlaces tipo `[[nombre]]` crean conexiones automáticas entre:
- Notas ↔ Tareas
- Journals ↔ Materias
- Tareas ↔ Exámenes
- Notas ↔ Notas

### Cómo Funcionan

1. Escribe `[[` en cualquier nota o journal
2. Continúa con el nombre de lo que quieres enlazar
3. Cierra con `]]`
4. El sistema detecta automáticamente el enlace
5. Aparece en el grafo de conocimiento

**Ejemplo:**

```
En mi sesión de hoy estudié [[Cálculo Integral]] y practiqué
problemas de [[Integración por Partes]]. Mañana seguiré con
[[Sustitución Trigonométrica]].
```

Esto crea 3 conexiones en el grafo automáticamente.

---

## 🎨 Estilo Lo-Fi/Minimalista

### Paleta de Colores

**Tema Claro (Cálido y Acogedor):**
- Fondo: Beige cálido `#F5F1E8`
- Superficie: Blanco puro
- Acentos: Café suave, azul pastel, melocotón

**Tema Oscuro (Chill Night):**
- Fondo: Azul noche `#1A1A2E`
- Superficie: Azul profundo
- Acentos: Gris azulado, rosa suave, lavanda

### Animaciones Suaves

- Transiciones lentas (300ms-500ms)
- Efectos de hover sutiles
- Sin movimientos bruscos
- Respeto por el modo de movimiento reducido

---

## 💻 Trucos y Consejos

### Atajos de Teclado en el Editor

| Atajo | Acción |
|-------|--------|
| `Ctrl+B` | Negrita |
| `Ctrl+I` | Cursiva |
| `Ctrl+K` | Insertar enlace |
| `[[texto]]` | Enlace interno |
| `/` | Abrir menú de bloques (próximamente) |

### Optimización del Grafo

**Para mejor visualización:**
1. Limita filtros a 1-2 tipos a la vez
2. Usa búsqueda para encontrar nodos específicos
3. Arrastra nodos clave al centro
4. Usa el botón "Ajustar vista" después de filtrar

**Interpretación:**
- Nodos aislados = conceptos no relacionados (oportunidad)
- Clusters densos = área de especialización
- Nodos centrales grandes = pilares de tu conocimiento

### Journaling Efectivo

**Mejores prácticas:**
1. Escribe journals inmediatamente después de estudiar
2. Sé honesto con tus moods (no hay moods "malos")
3. Enfócate en aprendizajes, no en completar
4. Usa tags para temas recurrentes
5. Revisa journals antiguos para ver tu progreso

---

## ❓ Preguntas Frecuentes

### ¿Cómo actualizo mi grafo de conocimiento?

El grafo se actualiza automáticamente cuando:
- Creas nuevos enlaces [[]]
- Completas sesiones Pomodoro
- Agregas journals

**Para forzar actualización:**
1. Recarga la página
2. Cambia de tab y vuelve a Grafo

### ¿Puedo exportar mis notas?

Actualmente las notas están en Supabase. Para exportar:
1. Ve a Supabase Dashboard
2. SQL Editor
3. `SELECT * FROM content_blocks WHERE profile_id = 'tu-id'`
4. Copia los resultados

**Próximamente:** Exportación a Markdown automática.

### ¿Qué pasa con mis datos antiguos?

Todos tus datos antiguos siguen funcionando:
- Materias, tareas, exámenes, sesiones Pomodoro
- Todo está integrado en el grafo automáticamente

### ¿Por qué algunos nodos son muy pequeños?

Nodos pequeños = poco tiempo Pomodoro dedicado.

**Solución:** Dedica más sesiones a esos temas para que crezcan.

### ¿Puedo desactivar las nuevas funciones?

Sí, simplemente no uses esos tabs. Las funciones antiguas siguen
funcionando exactamente igual.

---

## 🔮 Próximas Funcionalidades

Estamos trabajando en:

1. **Templates de Notas**
   - Plantillas predefinidas para diferentes tipos de contenido
   - Plantillas de journals personalizadas

2. **Búsqueda Global**
   - Buscar en todas las notas, journals y tareas a la vez
   - Búsqueda por tags y moods

3. **Exportación**
   - Exportar grafo como imagen PNG
   - Exportar notas a Markdown
   - Backup completo del segundo cerebro

4. **IA Integration**
   - Sugerencias de conexiones automáticas
   - Resúmenes de journals
   - Análisis de patrones de aprendizaje

5. **Modo Focus**
   - Vista sin distracciones para escribir
   - Timer integrado en el editor
   - Música lo-fi integrada

---

## 🙏 Agradecimientos

Gracias por usar PomoSmart. Espero que estas nuevas funcionalidades
te ayuden a **amar el proceso** de aprendizaje tanto como yo amo
desarrollar herramientas para estudiantes apasionados.

**¡Feliz aprendizaje!** 🚀✨

---

## 📞 Soporte

¿Problemas o sugerencias?

1. Revisa `SEGUNDO_CEREBRO_PLAN.md` para detalles técnicos
2. Revisa `supabase/second_brain_schema.sql` para la estructura de DB
3. Abre un issue en GitHub (si aplica)

---

**Versión:** 2.0 - Segundo Cerebro Integral
**Fecha:** Enero 2026
**Licencia:** MIT
