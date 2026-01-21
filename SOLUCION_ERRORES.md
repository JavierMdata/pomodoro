# 🔧 Solución de Errores - Segundo Cerebro

## 🚨 Problema que Estabas Viendo

Al abrir la aplicación veías estos errores en la consola:

```
Error al refrescar grafo: { code: 'PGRST', message: 'permission denied for materialized view knowledge_nodes' }
Uncaught TypeError: can't access property 'filter', e is undefined
```

## ✅ Solución (Ya Implementada)

**¡Buenas noticias!** He corregido el código para que la app funcione **con o sin** las nuevas tablas del Segundo Cerebro.

### Cambios Realizados:

1. ✅ La app ya NO se rompe si las tablas nuevas no existen
2. ✅ Los errores ahora son informativos, no críticos
3. ✅ Todo el código antiguo (Pomodoro, Tareas, Materias) funciona perfectamente
4. ✅ Las nuevas funciones (Notas, Grafo, Journal) solo aparecen después de ejecutar el SQL

## 📋 Próximos Pasos PARA TI

### Opción A: Usar SOLO las funciones antiguas (Sin Segundo Cerebro)

**¡NO HAGAS NADA!** La app funciona perfectamente con:
- ✅ Dashboard
- ✅ Materias
- ✅ Exámenes
- ✅ Tareas
- ✅ Materiales
- ✅ Pomodoro
- ✅ Estadísticas

Las pestañas **Notas**, **Grafo** y **Journal** simplemente no funcionarán (pero no romperán la app).

---

### Opción B: Activar el Segundo Cerebro Completo

Si quieres usar las nuevas funcionalidades, sigue estos pasos:

#### PASO 1: Ejecutar el Script SQL Principal

```sql
1. Abre: supabase/second_brain_schema.sql
2. Copia TODO el contenido (son ~900 líneas)
3. Ve a Supabase Dashboard → SQL Editor → New Query
4. Pega el script completo
5. Presiona "Run" (Ejecutar)
6. Espera ~10 segundos
```

**Resultado esperado:** Deberías ver mensajes de éxito sin errores en rojo.

#### PASO 2: Ejecutar el Script de Permisos

```sql
1. Abre: supabase/fix_permissions.sql
2. Copia TODO el contenido
3. Ve a Supabase Dashboard → SQL Editor → New Query
4. Pega el script
5. Presiona "Run" (Ejecutar)
```

**Resultado esperado:** Deberías ver:
```
status: "Permisos corregidos exitosamente"
```

#### PASO 3: Verificar Tablas Creadas

En Supabase → Table Editor, deberías ver estas nuevas tablas:

- ✅ `content_blocks` (Bloques de notas)
- ✅ `note_links` (Enlaces bidireccionales)
- ✅ `focus_journals` (Journals de enfoque)
- ✅ `knowledge_nodes` (Vista para el grafo)

#### PASO 4: Recargar la Aplicación

```bash
# Si la app está corriendo:
1. Recarga la página (F5 o Ctrl+R)

# Si no está corriendo:
npm run dev
```

**Resultado esperado:** Ahora las pestañas **Notas**, **Grafo** y **Journal** funcionarán completamente.

---

## 🔍 Verificación

### Cómo Saber si Todo Funciona

1. **Abre la consola del navegador** (F12)
2. **Busca estos mensajes:**

   ✅ **Si NO ejecutaste el SQL (Opción A):**
   ```
   ℹ️ Tabla content_blocks no disponible (ejecuta el SQL primero)
   ℹ️ Tabla note_links no disponible (ejecuta el SQL primero)
   ℹ️ Tabla focus_journals no disponible (ejecuta el SQL primero)
   ```
   ➡️ **Esto es NORMAL.** La app funciona bien sin las nuevas tablas.

   ✅ **Si ejecutaste el SQL (Opción B):**
   ```
   ✅ Sincronización con Supabase completada
   📊 Datos cargados: {
     profiles: 3,
     subjects: 6,
     tasks: 6,
     contentBlocks: 0,
     noteLinks: 0,
     focusJournals: 0
   }
   ✅ Grafo refrescado: 15 nodos
   ```
   ➡️ **Perfecto!** El Segundo Cerebro está activo.

---

## ❌ Errores Comunes y Soluciones

### Error: "relation content_blocks does not exist"

**Causa:** No ejecutaste el script SQL principal.

**Solución:** Ejecuta `supabase/second_brain_schema.sql` (Paso 1 de Opción B).

---

### Error: "permission denied for materialized view knowledge_nodes"

**Causa:** Ejecutaste el SQL principal pero no el de permisos.

**Solución:** Ejecuta `supabase/fix_permissions.sql` (Paso 2 de Opción B).

---

### Error: "function refresh_knowledge_graph() does not exist"

**Causa:** El script SQL principal se ejecutó con errores.

**Solución:**
1. Ve a Supabase → SQL Editor
2. Ejecuta: `SELECT * FROM pg_proc WHERE proname = 'refresh_knowledge_graph';`
3. Si retorna 0 filas, re-ejecuta el script completo

---

### La app está en blanco / pantalla blanca

**Causa:** Error de JavaScript no relacionado con el Segundo Cerebro.

**Solución:**
1. Abre la consola (F12)
2. Busca el error en rojo
3. Copia el error completo
4. Avísame cuál es

---

## 📞 Resumen

### Si quieres usar SOLO Pomodoro básico:
➡️ **NO HAGAS NADA.** Ya funciona perfectamente.

### Si quieres activar Notas, Grafo y Journal:
➡️ **Ejecuta 2 scripts SQL:**
1. `second_brain_schema.sql` (crea tablas)
2. `fix_permissions.sql` (corrige permisos)

---

## 🎯 Estado Actual del Código

**Commit:** `22fc3b4`
**Branch:** `claude/pomosmart-research-preview-zKI2K`

**Archivos actualizados:**
- ✅ `stores/useAppStore.ts` - Manejo robusto de errores
- ✅ `supabase/fix_permissions.sql` - Script de corrección de permisos

**Garantía:** La app NO se romperá independientemente de si ejecutas o no los scripts SQL.

---

¿Dudas? Pregúntame! 🚀
