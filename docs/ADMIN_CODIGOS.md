# Guia del Administrador: Sistema de Codigos de Activacion

## Resumen

Este sistema te permite vender acceso a PomoSmart de forma manual:
1. Tu recibes el pago (PayPal, transferencia, efectivo, etc.)
2. Generas un codigo en Supabase
3. Le envias el codigo al usuario
4. El usuario lo canjea en la app y obtiene acceso premium

---

## Paso 1: Ejecutar el SQL de Codigos

Primero, ejecuta el archivo `supabase/activation_codes.sql` en tu proyecto de Supabase:

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor** (icono de terminal)
4. Crea un **New query**
5. Copia y pega TODO el contenido de `activation_codes.sql`
6. Haz clic en **Run**

---

## Paso 2: Generar Codigos

### Opcion A: Desde el SQL Editor de Supabase (Recomendado)

Ve a **SQL Editor** y ejecuta estos comandos:

#### Generar 1 codigo Premium (30 dias)
```sql
SELECT * FROM admin_generate_codes('premium', 1, 30);
```

#### Generar 5 codigos Premium (30 dias)
```sql
SELECT * FROM admin_generate_codes('premium', 5, 30);
```

#### Generar 1 codigo Lifetime (acceso de por vida)
```sql
SELECT * FROM admin_generate_codes('lifetime', 1);
```

#### Generar codigos Basic (plan basico, 30 dias)
```sql
SELECT * FROM admin_generate_codes('basic', 3, 30);
```

#### Generar codigo de prueba/trial (7 dias)
```sql
SELECT * FROM admin_generate_codes('basic', 1, 7, 'TRIAL');
```

El resultado mostrara los codigos generados:
```
| code           | plan    | duration_days | expires_at |
|----------------|---------|---------------|------------|
| POMO-A3B2-F8C1 | premium | 30            | NULL       |
```

### Opcion B: Desde Table Editor

1. Ve a **Table Editor** > **activation_codes**
2. Haz clic en **Insert row**
3. Llena los campos:
   - `code`: Tu codigo personalizado (ej: `JUAN-PREM-2024`)
   - `plan`: `premium`, `basic`, o `lifetime`
   - `duration_days`: Numero de dias (NULL para lifetime)
4. Guarda

---

## Paso 3: Ver Codigos Generados

### Ver codigos NO usados (disponibles)
```sql
SELECT * FROM admin_list_codes(false);
```

### Ver TODOS los codigos (usados y no usados)
```sql
SELECT * FROM admin_list_codes(true);
```

### O directamente en Table Editor
Ve a **Table Editor** > **activation_codes** para ver y editar codigos.

---

## Paso 4: Enviar el Codigo al Usuario

Una vez generado el codigo, simplemente enviaselo al usuario:

**Mensaje ejemplo:**
```
Gracias por tu compra!

Tu codigo de activacion para PomoSmart Premium es:

POMO-A3B2-F8C1

Para activarlo:
1. Inicia sesion en PomoSmart
2. Haz clic en "Actualizar plan" o el icono de corona
3. Ingresa tu codigo
4. Listo! Ya tienes acceso premium

Cualquier duda, estoy para ayudarte.
```

---

## Referencia Rapida de Planes

| Plan | Duracion | Perfiles | Materias/Perfil |
|------|----------|----------|-----------------|
| `basic` | X dias | 3 | 15 |
| `premium` | X dias | Ilimitados | Ilimitadas |
| `lifetime` | Para siempre | Ilimitados | Ilimitadas |

---

## Parametros de admin_generate_codes()

```sql
admin_generate_codes(
    plan_type TEXT,      -- 'basic', 'premium', 'lifetime'
    quantity INTEGER,    -- Cuantos codigos generar (default: 1)
    duration INTEGER,    -- Dias de duracion (NULL para lifetime)
    prefix TEXT,         -- Prefijo del codigo (default: 'POMO')
    expiry_days INTEGER  -- Dias hasta que el codigo expire (opcional)
)
```

### Ejemplos avanzados

```sql
-- 10 codigos premium de 30 dias, prefijo personalizado
SELECT * FROM admin_generate_codes('premium', 10, 30, 'VIP');
-- Resultado: VIP-XXXX-XXXX

-- Codigo que expira en 7 dias (el usuario tiene 7 dias para canjearlo)
SELECT * FROM admin_generate_codes('premium', 1, 30, 'POMO', 7);

-- Codigo trial de 14 dias
SELECT * FROM admin_generate_codes('basic', 1, 14, 'TRIAL');
```

---

## Verificar si un codigo fue usado

```sql
SELECT code, is_used, used_by, used_at
FROM activation_codes
WHERE code = 'POMO-A3B2-F8C1';
```

O busca el email del usuario:
```sql
SELECT ac.code, ac.plan, ac.used_at, up.email
FROM activation_codes ac
JOIN user_profiles up ON ac.used_by = up.id
WHERE ac.is_used = true
ORDER BY ac.used_at DESC;
```

---

## Agregar notas a un codigo

Util para recordar a quien se lo vendiste:

```sql
UPDATE activation_codes
SET notes = 'Vendido a Juan Garcia - PayPal $9 - 15/01/2024'
WHERE code = 'POMO-A3B2-F8C1';
```

---

## Desactivar un codigo (si es necesario)

Si necesitas invalidar un codigo no usado:

```sql
DELETE FROM activation_codes
WHERE code = 'POMO-A3B2-F8C1' AND is_used = false;
```

---

## Flujo Completo de Venta

1. **Usuario te contacta** (WhatsApp, email, etc.)
2. **Recibes el pago** (PayPal, transferencia, etc.)
3. **Generas codigo:**
   ```sql
   SELECT * FROM admin_generate_codes('premium', 1, 30);
   ```
4. **Agregas nota:**
   ```sql
   UPDATE activation_codes
   SET notes = 'Juan Garcia - PayPal $9'
   WHERE code = 'POMO-XXXX-XXXX';
   ```
5. **Envias codigo al usuario**
6. **Usuario lo canjea en la app**
7. **Listo!**

---

## Troubleshooting

### "Codigo no valido"
- Verifica que el codigo existe en `activation_codes`
- Verifica que no tiene espacios extra

### "Codigo ya utilizado"
- El codigo ya fue canjeado por alguien
- Genera uno nuevo

### Usuario no puede acceder despues de canjear
- Pide que cierre sesion y vuelva a entrar
- Verifica en `user_profiles` que su `plan` sea correcto
