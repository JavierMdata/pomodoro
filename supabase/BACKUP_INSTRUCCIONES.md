# 🛡️ Cómo NO Perder Datos Nunca en Supabase

## Opción 1: Backup Manual Semanal (Recomendado)

### Paso 1: Exportar todos los datos

Ejecuta este script en Supabase SQL Editor y guarda el resultado:

```sql
-- BACKUP COMPLETO - Copiar todos estos resultados

-- 1. Perfiles
SELECT 'PERFILES' as tabla;
SELECT * FROM profiles ORDER BY created_at;

-- 2. Períodos escolares
SELECT 'PERIODOS' as tabla;
SELECT * FROM school_periods ORDER BY created_at;

-- 3. Materias
SELECT 'MATERIAS' as tabla;
SELECT * FROM subjects ORDER BY created_at;

-- 4. Horarios
SELECT 'HORARIOS' as tabla;
SELECT * FROM class_schedule ORDER BY created_at;

-- 5. Tareas
SELECT 'TAREAS' as tabla;
SELECT * FROM tasks ORDER BY created_at;

-- 6. Exámenes
SELECT 'EXAMENES' as tabla;
SELECT * FROM exams ORDER BY created_at;

-- 7. Temas de examen
SELECT 'TEMAS_EXAMEN' as tabla;
SELECT * FROM exam_topics ORDER BY created_at;

-- 8. Materiales
SELECT 'MATERIALES' as tabla;
SELECT * FROM materials ORDER BY created_at;

-- 9. Sesiones de pomodoro
SELECT 'SESIONES' as tabla;
SELECT * FROM pomodoro_sessions ORDER BY started_at DESC LIMIT 1000;

-- 10. Configuraciones
SELECT 'CONFIGURACIONES' as tabla;
SELECT * FROM pomodoro_settings;
```

**Guarda esto en un archivo** (ejemplo: `backup_2026-01-20.sql`)

---

## Opción 2: Usar el Dashboard de Supabase

1. Ve a tu proyecto en Supabase
2. **Database** → **Backups** (en el menú lateral)
3. Habilita **Point-in-Time Recovery (PITR)** si estás en un plan pago
4. Para plan gratuito: Usa el botón **"Download backup"** manualmente

---

## Opción 3: Script de Restauración de Emergencia

Si pierdes datos, ejecuta este script para restaurar desde cero:

```sql
-- SOLO USA ESTO SI PERDISTE DATOS Y TIENES UN BACKUP

-- 1. Eliminar datos actuales (CUIDADO!)
TRUNCATE TABLE pomodoro_sessions CASCADE;
TRUNCATE TABLE exam_topics CASCADE;
TRUNCATE TABLE exams CASCADE;
TRUNCATE TABLE tasks CASCADE;
TRUNCATE TABLE class_schedule CASCADE;
TRUNCATE TABLE materials CASCADE;
TRUNCATE TABLE subjects CASCADE;
TRUNCATE TABLE school_periods CASCADE;
TRUNCATE TABLE pomodoro_settings CASCADE;
TRUNCATE TABLE alerts CASCADE;
TRUNCATE TABLE profiles CASCADE;

-- 2. Restaurar datos desde tu backup
-- (Copia y pega los INSERT que guardaste)
```

---

## Opción 4: Backup Automático con GitHub

Guarda un snapshot mensual de tu base de datos:

1. En tu proyecto, ejecuta:
```bash
cd /home/user/pomodoro
mkdir -p backups
```

2. Descarga el backup desde Supabase Dashboard
3. Guárdalo en `backups/backup-YYYY-MM.sql`
4. Haz commit:
```bash
git add backups/
git commit -m "backup: Base de datos $(date +%Y-%m)"
git push
```

---

## ⚡ Backup Rápido de Emergencia (AHORA)

Ejecuta esto **AHORA** para tener un backup de tus datos actuales:

```sql
-- COPIA TODO EL RESULTADO DE ESTA QUERY Y GUÁRDALO

SELECT
  'INSERT INTO profiles VALUES (' ||
  quote_literal(id::text) || '::uuid, ' ||
  quote_literal(user_id) || ', ' ||
  quote_literal(name) || ', ' ||
  quote_literal(user_name) || ', ' ||
  quote_literal(gender) || ', ' ||
  quote_literal(type) || ', ' ||
  quote_literal(color) || ', ' ||
  quote_literal(icon) || ', ' ||
  quote_literal(created_at::text) || '::timestamptz, ' ||
  quote_literal(updated_at::text) || '::timestamptz);'
FROM profiles;

SELECT
  'INSERT INTO subjects VALUES (' ||
  quote_literal(id::text) || '::uuid, ' ||
  quote_literal(profile_id::text) || '::uuid, ' ||
  quote_literal(school_period_id::text) || '::uuid, ' ||
  quote_literal(name) || ', ' ||
  COALESCE(quote_literal(code), 'NULL') || ', ' ||
  quote_literal(color) || ', ' ||
  COALESCE(quote_literal(professor_name), 'NULL') || ', ' ||
  COALESCE(quote_literal(classroom), 'NULL') || ', ' ||
  COALESCE(quote_literal(start_date::text), 'NULL') || ', ' ||
  COALESCE(quote_literal(end_date::text), 'NULL') || ', ' ||
  quote_literal(icon) || ', ' ||
  quote_literal(created_at::text) || '::timestamptz, ' ||
  quote_literal(updated_at::text) || '::timestamptz);'
FROM subjects;

SELECT
  'INSERT INTO class_schedule VALUES (' ||
  quote_literal(id::text) || '::uuid, ' ||
  quote_literal(subject_id::text) || '::uuid, ' ||
  day_of_week || ', ' ||
  quote_literal(start_time::text) || '::time, ' ||
  quote_literal(end_time::text) || '::time, ' ||
  quote_literal(created_at::text) || '::timestamptz);'
FROM class_schedule;
```

**Guarda el resultado en un archivo de texto seguro.**

---

## 📋 Checklist de Seguridad

- [ ] Backup manual cada semana
- [ ] Backup antes de ejecutar scripts SQL que modifiquen datos
- [ ] Guardar backups en GitHub (carpeta `backups/`)
- [ ] Probar restauración una vez al mes
- [ ] Habilitar PITR en Supabase (plan pago)

---

## 🆘 Contacto de Emergencia

Si pierdes datos:
1. **NO EJECUTES NADA** inmediatamente
2. Revisa Supabase Dashboard → Database → Backups
3. Contacta soporte de Supabase si estás en plan pago
4. Usa tus backups manuales guardados
