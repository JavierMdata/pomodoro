# Guia Completa: PomoSmart Multi-Usuario SaaS

Esta guia documenta la transformacion de PomoSmart de una aplicacion single-user a una plataforma multi-usuario (multi-tenant) segura.

---

## Tabla de Contenidos

1. [Resumen de la Arquitectura](#1-resumen-de-la-arquitectura)
2. [Parte 1: Base de Datos (Supabase)](#parte-1-base-de-datos-supabase)
3. [Parte 2: Frontend (React)](#parte-2-frontend-react)
4. [Parte 3: Administracion y Monetizacion](#parte-3-administracion-y-monetizacion)
5. [Configuracion de Variables de Entorno](#configuracion-de-variables-de-entorno)
6. [Flujo de Usuario](#flujo-de-usuario)
7. [Troubleshooting](#troubleshooting)

---

## 1. Resumen de la Arquitectura

### Antes (Single-User)
```
Usuario -> Frontend -> Supabase (sin autenticacion, sin RLS)
           Datos globales, sin aislamiento
```

### Despues (Multi-Usuario)
```
Usuario -> Frontend -> Supabase Auth -> Supabase (con RLS)
           Datos aislados por usuario via auth.uid()
```

### Stack Tecnologico
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Estado**: Zustand con persistencia
- **Backend/DB**: Supabase (PostgreSQL + Auth + RLS)
- **Hosting**: Vercel
- **Pagos**: Gumroad/Stripe (manual inicial)

---

## Parte 1: Base de Datos (Supabase)

### 1.1 Ejecutar la Migracion

El archivo `supabase/migration_multi_user.sql` contiene todo lo necesario. Para ejecutarlo:

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Crea un nuevo query
4. Copia y pega el contenido de `migration_multi_user.sql`
5. Ejecuta el script

### 1.2 Que hace la migracion?

#### Nueva tabla `user_profiles`
```sql
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    full_name TEXT,
    plan TEXT DEFAULT 'free',  -- 'free', 'basic', 'premium', 'lifetime'
    is_active BOOLEAN DEFAULT true,
    subscription_status TEXT DEFAULT 'active',
    max_profiles INTEGER DEFAULT 1,
    max_subjects_per_profile INTEGER DEFAULT 5,
    -- ... mas campos
);
```

Esta tabla se crea automaticamente cuando un usuario se registra gracias al trigger `on_auth_user_created`.

#### Modificacion de la tabla `profiles`
```sql
ALTER TABLE profiles
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
```

La columna `user_id` ahora es un UUID que referencia a `auth.users`.

### 1.3 Politicas RLS (Row Level Security)

Las politicas aseguran que cada usuario solo vea sus propios datos:

```sql
-- Ejemplo para la tabla profiles
CREATE POLICY "Users can view own profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own profiles"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Las demas tablas usan subconsultas para verificar la propiedad
CREATE POLICY "Users can view own subjects"
ON public.subjects
FOR SELECT
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);
```

### 1.4 Habilitar RLS manualmente (si es necesario)

Si RLS no se activo automaticamente:

1. Ve a **Table Editor** en Supabase
2. Selecciona cada tabla
3. Haz clic en **RLS disabled** (boton rojo)
4. Activa **Enable RLS**

O via SQL:
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
-- ... para todas las tablas
```

---

## Parte 2: Frontend (React)

### 2.1 Estructura de Archivos Nuevos

```
/lib
  supabase.ts          # Cliente con funciones de autenticacion

/contexts
  AuthContext.tsx      # Contexto global de autenticacion

/components
  Auth.tsx             # Formularios login/registro
  WelcomePage.tsx      # Landing page para no autenticados
  ModernLayout.tsx     # Layout con boton de logout (modificado)

App.tsx                # Flujo principal con autenticacion
```

### 2.2 Cliente Supabase (`lib/supabase.ts`)

El cliente ahora incluye funciones de autenticacion:

```typescript
// Funciones principales
export async function signUp(email, password, fullName?)
export async function signIn(email, password)
export async function signOut()
export async function getSession()
export async function getUser()
export async function resetPassword(email)
export async function getUserProfile()
export async function canCreateProfile()
export async function canCreateSubject(profileId)
```

### 2.3 Contexto de Autenticacion (`contexts/AuthContext.tsx`)

Provee estado global de autenticacion:

```tsx
// En cualquier componente:
const {
  user,           // Usuario de Supabase Auth
  userProfile,    // Perfil extendido (plan, limites, etc.)
  isAuthenticated,
  isLoading,
  signIn,
  signUp,
  signOut,
  resetPassword,
} = useAuth();
```

### 2.4 Flujo en App.tsx

```tsx
// 1. Wrapper con AuthProvider
const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

// 2. Logica de renderizado
const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <WelcomePage />;
  if (!activeProfileId) return <ProfileSelector />;
  return <MainApp />;
};
```

### 2.5 Crear perfil con user_id correcto

```tsx
const handleCreateProfile = async () => {
  const userId = await getCurrentUserId();

  await addProfile({
    name: "Mi Perfil",
    user_id: userId,  // UUID del usuario autenticado
    // ... otros campos
  });
};
```

---

## Parte 3: Administracion y Monetizacion

### 3.1 Acceso de Administrador

**IMPORTANTE**: Nunca expongas la `service_role_key` en el frontend.

#### Opcion 1: Dashboard de Supabase

1. Ve a **Table Editor** en Supabase
2. Puedes ver/editar todos los datos directamente
3. Usa los filtros para buscar usuarios especificos

#### Opcion 2: Script Node.js con service_role_key

Crea un script local para administracion:

```javascript
// admin/scripts/manage-users.js
const { createClient } = require('@supabase/supabase-js');

// Solo usar en scripts locales, NUNCA en el frontend
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Ver todos los usuarios
async function getAllUsers() {
  const { data, error } = await supabase.rpc('admin_get_all_users');
  console.table(data);
}

// Activar usuario premium
async function setPremium(userId) {
  await supabase.rpc('admin_set_user_plan', {
    target_user_id: userId,
    new_plan: 'premium',
    expires_at: '2025-12-31T23:59:59Z'
  });
}

// Desactivar cuenta
async function deactivateUser(userId) {
  await supabase.rpc('admin_set_user_active', {
    target_user_id: userId,
    active_status: false
  });
}
```

#### Opcion 3: Supabase Edge Functions

Para administracion mas avanzada, puedes crear Edge Functions protegidas:

```typescript
// supabase/functions/admin-users/index.ts
import { createClient } from '@supabase/supabase-js';

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');

  // Verificar token de admin (implementar tu propia logica)
  if (!isValidAdminToken(authHeader)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );

  // Tu logica de administracion aqui...
});
```

### 3.2 Monetizacion Manual (Flujo Inicial)

#### Paso 1: Configurar Gumroad o Stripe

**Gumroad** (mas simple para empezar):
1. Crea una cuenta en [gumroad.com](https://gumroad.com)
2. Crea un producto para cada plan (Premium, Lifetime)
3. Configura el precio y descripcion

**Stripe** (mas profesional):
1. Crea una cuenta en [stripe.com](https://stripe.com)
2. Configura productos y precios en el Dashboard
3. Usa Payment Links para pagos simples

#### Paso 2: Recibir notificacion de venta

Cuando alguien compra:
- **Gumroad**: Te envia un email con los datos del comprador
- **Stripe**: Puedes configurar webhooks o ver en el Dashboard

#### Paso 3: Activar la cuenta manualmente

1. Busca el email del comprador en Supabase:
   - Ve a **Table Editor** > **user_profiles**
   - Filtra por email

2. Actualiza el plan:
   ```sql
   UPDATE user_profiles
   SET
     plan = 'premium',
     subscription_status = 'active',
     subscription_expires_at = '2026-01-26T23:59:59Z',
     max_profiles = 999,
     max_subjects_per_profile = 999
   WHERE email = 'comprador@email.com';
   ```

   O usa el script de admin:
   ```bash
   node admin/scripts/manage-users.js setPremium <user-id>
   ```

#### Paso 4: Verificacion en el frontend

El frontend automaticamente verifica los limites:

```tsx
// En el store o componente
const { userProfile } = useAuth();

if (userProfile?.plan === 'premium') {
  // Acceso completo
} else {
  // Mostrar limitaciones y CTA para upgrade
}
```

### 3.3 Planes y Limites Sugeridos

| Plan | Perfiles | Materias/Perfil | Precio Sugerido |
|------|----------|-----------------|-----------------|
| Free | 1 | 5 | Gratis |
| Basic | 3 | 15 | $4/mes |
| Premium | Ilimitados | Ilimitadas | $9/mes |
| Lifetime | Ilimitados | Ilimitadas | $49 unico |

### 3.4 Automatizacion Futura (Webhooks)

Para automatizar completamente:

1. **Stripe Webhooks**:
   ```javascript
   // Endpoint para recibir eventos de Stripe
   app.post('/webhooks/stripe', async (req, res) => {
     const event = req.body;

     if (event.type === 'checkout.session.completed') {
       const email = event.data.object.customer_email;
       await activatePremium(email);
     }
   });
   ```

2. **Supabase Edge Function** para webhooks:
   ```typescript
   // supabase/functions/stripe-webhook/index.ts
   Deno.serve(async (req) => {
     const event = await req.json();
     // Procesar evento y actualizar user_profiles
   });
   ```

---

## Configuracion de Variables de Entorno

### En desarrollo (.env.local)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_GEMINI_API_KEY=your-gemini-key
```

### En Vercel (Variables de entorno)
1. Ve a tu proyecto en Vercel
2. Settings > Environment Variables
3. Agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`

### Scripts de admin (separado, nunca en frontend)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # SECRETO - nunca exponer
```

---

## Flujo de Usuario

### 1. Nuevo usuario
```
Landing Page -> Registrarse -> Confirmar email ->
Seleccionar/Crear perfil -> Usar la app
```

### 2. Usuario existente
```
Landing Page -> Iniciar sesion ->
Seleccionar perfil -> Usar la app
```

### 3. Upgrade a Premium
```
Usuario Free -> Limite alcanzado ->
Mostrar CTA upgrade -> Pagar en Gumroad/Stripe ->
Admin activa manualmente -> Usuario tiene acceso Premium
```

---

## Troubleshooting

### Error: "new row violates row-level security policy"
**Causa**: El usuario no tiene permiso para insertar/actualizar.
**Solucion**:
- Verificar que el `user_id` sea correcto
- Verificar que el usuario este autenticado
- Revisar las politicas RLS

### Error: "User not authenticated"
**Causa**: La sesion expiro o no existe.
**Solucion**:
- Verificar `isAuthenticated` antes de operaciones
- Implementar refresh de token

### Los datos no se cargan
**Causa**: RLS esta bloqueando las consultas.
**Solucion**:
1. Verificar que RLS este habilitado
2. Verificar que las politicas existan
3. Probar con el Dashboard de Supabase (que bypasea RLS)

### El usuario no puede crear mas perfiles
**Causa**: Alcanzo el limite de su plan.
**Solucion**:
- Aumentar `max_profiles` en `user_profiles`
- O upgradear el plan del usuario

---

## Siguientes Pasos Recomendados

1. [ ] Ejecutar migracion SQL en Supabase
2. [ ] Configurar variables de entorno en Vercel
3. [ ] Probar registro e inicio de sesion
4. [ ] Verificar que RLS funcione correctamente
5. [ ] Configurar producto en Gumroad/Stripe
6. [ ] Crear script de administracion local
7. [ ] Implementar pagina de precios en el frontend
8. [ ] Automatizar con webhooks (opcional, despues)

---

## Recursos

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Gumroad API](https://help.gumroad.com/article/149-api)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
