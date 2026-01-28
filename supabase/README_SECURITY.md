# Sistema de Seguridad con PIN - Instrucciones de Migración

## ⚠️ Importante

El sistema de PIN para protección de perfiles requiere agregar columnas adicionales a la tabla `profiles` en Supabase.

## 📋 Pasos para Activar el Sistema de PIN

### 1. Acceder a Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión y selecciona tu proyecto
3. En el menú lateral, selecciona **SQL Editor**

### 2. Ejecutar la Migración

1. Abre el archivo `add_profile_security.sql` en este directorio
2. Copia todo el contenido del archivo
3. Pégalo en el **SQL Editor** de Supabase
4. Click en **Run** (o presiona `Ctrl/Cmd + Enter`)

### 3. Verificar la Migración

Ejecuta esta consulta para verificar que las columnas se crearon correctamente:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('pin_hash', 'requires_pin', 'biometric_enabled', 'auto_lock_minutes', 'last_accessed_at');
```

Deberías ver 5 filas con las nuevas columnas.

### 4. Reiniciar la Aplicación

Una vez ejecutada la migración:

1. Refresca tu aplicación web
2. Ve a **Configuración** (Settings)
3. Baja hasta la sección **"Seguridad del Perfil"**
4. Click en **"Configurar PIN"**

## 🔒 Características del Sistema de PIN

### PIN de 4 Dígitos
- Solo números
- Hash SHA-256 para seguridad
- Nunca se guarda en texto plano

### Protección contra Intentos
- Máximo 3 intentos
- Bloqueo temporal de 30 segundos después de 3 intentos fallidos

### Bloqueo Automático
- Configurable: 5 min, 15 min, 30 min, 1 hora, 2 horas
- Se activa automáticamente por inactividad

### Autenticación Biométrica (Opcional)
- Face ID (iOS/macOS)
- Touch ID (iOS/macOS)
- Fingerprint (Android)

## 🛠️ Solución de Problemas

### Error HTTP 400 al Guardar PIN

Si ves errores HTTP 400 en la consola al intentar configurar el PIN:

```
XHR PATCH https://...supabase.co/rest/v1/profiles?id=eq... [HTTP/3 400]
```

**Solución**: Ejecuta la migración SQL `add_profile_security.sql` en Supabase.

### El PIN no se Guarda

1. Verifica que ejecutaste la migración SQL
2. Abre la consola del navegador (F12)
3. Busca mensajes de error
4. Verifica que Supabase esté conectado correctamente

### No Aparece la Opción de PIN

1. Verifica que estés en la pestaña **"Config"** (Settings)
2. Desplázate hacia abajo hasta ver **"Seguridad del Perfil"**
3. Si no aparece, refresca la página

## 📊 Estructura de Datos

Las nuevas columnas agregadas a `profiles`:

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `pin_hash` | VARCHAR(64) | Hash SHA-256 del PIN |
| `requires_pin` | BOOLEAN | Si requiere PIN para desbloquear |
| `biometric_enabled` | BOOLEAN | Si está habilitada la autenticación biométrica |
| `auto_lock_minutes` | INTEGER | Minutos de inactividad antes de bloquear |
| `last_accessed_at` | TIMESTAMP | Última vez que se accedió al perfil |

## 🔄 Reversión (Rollback)

Si necesitas revertir los cambios:

```sql
ALTER TABLE profiles
  DROP COLUMN IF EXISTS pin_hash,
  DROP COLUMN IF EXISTS requires_pin,
  DROP COLUMN IF EXISTS biometric_enabled,
  DROP COLUMN IF EXISTS auto_lock_minutes,
  DROP COLUMN IF EXISTS last_accessed_at;
```

⚠️ **Advertencia**: Esto eliminará todos los PINs configurados.
