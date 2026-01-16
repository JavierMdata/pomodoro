# 🚨 SOLUCIÓN RÁPIDA - Horarios Vacíos

## 🔍 Problema Detectado

Tu consola muestra:
```
❌ ERROR: No se encontraron horarios en Supabase
📋 Total schedules in store: 0
📚 Total subjects in store: 5
👤 Active profile ID: 5b232f74-fbd2-45ee-a8a0-f7c1b15b1c5b
```

**Traducción:** Tienes 5 materias pero 0 horarios → Tu calendario está vacío.

---

## ✅ Solución en 3 Pasos (2 minutos)

### 1️⃣ Abre Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión
3. Selecciona tu proyecto
4. Click en **"SQL Editor"** (menú izquierdo)

### 2️⃣ Ejecuta el Script

1. Click en **"New query"**
2. Abre el archivo `supabase/add_sample_schedules.sql` de este proyecto
3. **Copia TODO** el contenido
4. **Pégalo** en el SQL Editor de Supabase
5. Click en **"Run"** (o presiona `Ctrl + Enter`)

Verás mensajes como:
```
Horarios creados para: Crítica Económica (Días: 1 y 3)
Horarios creados para: [Otra Materia] (Días: 2 y 4)
...
Total materias procesadas: 5
```

### 3️⃣ Recarga tu App

1. Vuelve a tu app en Vercel
2. Presiona **F5** para recargar
3. Ve a la pestaña **"Horario"**
4. **¡BOOM!** 💥 Deberías ver tu calendario completo

---

## 📊 ¿Qué Hace el Script?

El script `add_sample_schedules.sql` automáticamente:

✅ Toma tus 5 materias existentes
✅ Crea 2 sesiones por semana para cada una
✅ Las distribuye de Lunes a Viernes
✅ Asigna horarios: 8-10am, 10am-12pm, 2-4pm, 4-6pm
✅ **Total:** ~10 horarios creados automáticamente

**Ejemplo de resultado:**
```
Materia 1: Lunes 8-10am, Miércoles 8-10am
Materia 2: Martes 10am-12pm, Jueves 10am-12pm
Materia 3: Miércoles 2-4pm, Viernes 2-4pm
...
```

---

## 🧠 Bonus: ¿Qué Pasa Después?

Una vez tengas horarios:

### 1. Ver tu Calendario Completo
- Pestaña **"Horario"** mostrará todas tus clases
- Vista semanal hermosa con colores por materia
- Indicador del día actual y hora actual

### 2. Generar Planes de Estudio con IA
- Ve a **"Plan IA"**
- Click en **"Generar Plan con IA"**
- La IA creará sesiones de estudio:
  - ✅ Evitando tus horarios de clase
  - ✅ Con repetición espaciada (1, 3, 7, 14, 30 días)
  - ✅ Usando 7 técnicas científicas de estudio
  - ✅ Optimizado según tus exámenes

### 3. Mini Pomodoro en Cada Sección
- Ahora cada sección tiene un timer flotante
- Puedes estudiar mientras navegas la app
- 25 minutos de Pomodoro clásico

---

## 🎨 ¿Quieres Horarios Personalizados?

Si prefieres configurar tus horarios manualmente:

### Opción 1: En Supabase (Recomendado)

```sql
-- 1. Ver tus materias y sus IDs
SELECT id, name FROM subjects ORDER BY name;

-- 2. Añadir un horario
INSERT INTO class_schedule (subject_id, day_of_week, start_time, end_time)
VALUES (
  'TU_SUBJECT_ID_AQUI',  -- ID de la materia
  1,                      -- 1=Lunes, 2=Martes, ..., 5=Viernes
  '14:00:00',            -- Hora inicio
  '16:00:00'             -- Hora fin
);
```

### Opción 2: En el Futuro (UI)

Estoy trabajando en el botón **"Nueva Clase"** que ves en el Horario para que puedas añadir horarios desde la interfaz. Por ahora usa Supabase.

---

## ❓ Troubleshooting

### "No veo cambios después de ejecutar el script"

1. **Verifica en Supabase que se crearon:**
   ```sql
   SELECT COUNT(*) FROM class_schedule;
   ```
   Debería mostrar ~10 (o más)

2. **Recarga la página con caché limpio:**
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

3. **Revisa la consola del navegador (F12):**
   Debería mostrar:
   ```
   ✅ Sincronización con Supabase completada
   📊 Datos cargados: { schedules: 10, subjects: 5, ... }
   ```

### "El script da error en Supabase"

Error común: `relation "class_schedule" does not exist`

**Solución:** Ejecuta primero el script de setup completo:
```sql
-- En Supabase SQL Editor
-- Ejecuta: supabase/final_setup.sql
```

### "Quiero empezar de cero"

```sql
-- ⚠️ CUIDADO: Borra TODOS los horarios
DELETE FROM class_schedule;

-- Luego vuelve a ejecutar add_sample_schedules.sql
```

---

## 📚 Documentación Completa

- **`supabase/COMO_AÑADIR_HORARIOS.md`** - Guía detallada paso a paso
- **`supabase/add_sample_schedules.sql`** - Script automático
- **`VERCEL_SETUP.md`** - Configuración de API Keys de Gemini

---

## ✨ Estado Actual del Proyecto

### ✅ Completado
- [x] Diseño moderno con tabs horizontales
- [x] MiniPomodoro en todas las secciones
- [x] AI Study Planner con Gemini
- [x] Sistema de debugging completo
- [x] Repetición espaciada (SuperMemo SM-2)
- [x] 7 técnicas de estudio científicas
- [x] WeeklySchedule con vista de calendario
- [x] Detección automática de problemas
- [x] Scripts SQL para soluciones rápidas

### 🔄 Siguiente
- [ ] UI para añadir horarios desde la app (botón "Nueva Clase")
- [ ] Editar/eliminar horarios desde la interfaz
- [ ] Drag & drop para reorganizar horarios
- [ ] Notificaciones antes de clases

---

## 💬 ¿Necesitas Ayuda?

Si algo no funciona:

1. Revisa la consola del navegador (F12)
2. Revisa los logs de Supabase SQL
3. Comparte el error exacto

**Estoy aquí para ayudarte** 🚀
