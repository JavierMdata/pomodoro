# 🎯 Cómo Añadir Horarios a tus Materias en Supabase

## ⚠️ Problema Actual

Tu consola muestra:
```
❌ ERROR: No se encontraron horarios en Supabase
📋 Total schedules in store: 0
📚 Total subjects in store: 5
```

Esto significa que tienes **5 materias** pero **0 horarios**. ¡Vamos a arreglarlo!

---

## 🚀 Solución Rápida (Opción 1: Automática)

### Paso 1: Ir a Supabase SQL Editor

1. Abre [supabase.com](https://supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** en el menú izquierdo
4. Click en **New query**

### Paso 2: Copiar y Ejecutar el Script

Copia TODO el contenido del archivo `add_sample_schedules.sql` y pégalo en el editor SQL.

Click en **Run** (o presiona `Ctrl+Enter`)

### Paso 3: Verificar

El script creará automáticamente **2 horarios por semana** para cada una de tus 5 materias, distribuidos de lunes a viernes en diferentes horarios.

Para verificar que funcionó:
```sql
SELECT
  s.name as materia,
  CASE cs.day_of_week
    WHEN 1 THEN 'Lunes'
    WHEN 2 THEN 'Martes'
    WHEN 3 THEN 'Miércoles'
    WHEN 4 THEN 'Jueves'
    WHEN 5 THEN 'Viernes'
  END as dia,
  cs.start_time as inicio,
  cs.end_time as fin
FROM class_schedule cs
JOIN subjects s ON cs.subject_id = s.id
ORDER BY cs.day_of_week, cs.start_time;
```

---

## ✍️ Solución Manual (Opción 2: Personalizada)

Si prefieres añadir horarios específicos manualmente:

### Paso 1: Obtener IDs de tus Materias

```sql
SELECT id, name FROM subjects ORDER BY name;
```

### Paso 2: Añadir Horario para una Materia

```sql
INSERT INTO class_schedule (subject_id, day_of_week, start_time, end_time)
VALUES (
  'PEGA_AQUI_EL_UUID_DE_TU_MATERIA',
  1,           -- 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes
  '08:00:00',  -- Hora de inicio
  '10:00:00'   -- Hora de fin
);
```

### Ejemplo Real (usando el ID que vi en tus logs):

```sql
-- Crítica Económica - Lunes 8am-10am
INSERT INTO class_schedule (subject_id, day_of_week, start_time, end_time)
VALUES (
  '2b97a1fb-4683-4d30-a337-3554a1226706',
  1,
  '08:00:00',
  '10:00:00'
);

-- Crítica Económica - Miércoles 8am-10am
INSERT INTO class_schedule (subject_id, day_of_week, start_time, end_time)
VALUES (
  '2b97a1fb-4683-4d30-a337-3554a1226706',
  3,
  '08:00:00',
  '10:00:00'
);
```

Repite esto para cada materia y cada horario.

---

## 📋 Referencia: Días de la Semana

```
0 = Domingo
1 = Lunes
2 = Martes
3 = Miércoles
4 = Jueves
5 = Viernes
6 = Sábado
```

---

## ✅ Verificar que Funcionó

Después de añadir los horarios:

1. **Recarga tu app** (F5 o Ctrl+R)
2. Ve a la pestaña **"Horario"**
3. Deberías ver tu calendario poblado con tus clases
4. La consola debería mostrar:
   ```
   📋 Total schedules in store: 10  ← (ejemplo: 5 materias × 2 horarios)
   ✅ Filtered schedules count: 10
   ```

---

## 🧠 Bonus: IA usará estos Horarios

Una vez que tengas horarios en Supabase:

1. Ve a **"Plan IA"**
2. Click en **"Generar Plan con IA"**
3. La IA creará sesiones de estudio **evitando tus horarios de clase**
4. Usará repetición espaciada y las mejores técnicas de estudio

---

## ❓ Troubleshooting

### "No veo los horarios después de ejecutar el script"

1. Verifica en SQL que los horarios se crearon:
   ```sql
   SELECT COUNT(*) FROM class_schedule;
   ```
2. Recarga la app (F5)
3. Revisa la consola del navegador (F12)

### "El script da error"

- Asegúrate de que la tabla `class_schedule` existe
- Verifica que tienes materias creadas:
  ```sql
  SELECT COUNT(*) FROM subjects;
  ```

### "Quiero borrar todo y empezar de nuevo"

```sql
-- ⚠️ CUIDADO: Esto borra TODOS los horarios
DELETE FROM class_schedule;
```

Luego vuelve a ejecutar el script automático.

---

## 📞 Siguiente Paso

Una vez añadidos los horarios, podrás:
- ✅ Ver tu calendario semanal completo
- ✅ Generar planes de estudio con IA
- ✅ La IA respetará tus horarios de clase
- ✅ Visualización hermosa en el componente WeeklySchedule
