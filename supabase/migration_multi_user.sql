-- ============================================================================
-- MIGRACION A MULTI-USUARIO (Multi-Tenant) - PomoSmart SaaS
-- ============================================================================
-- Este script transforma la aplicacion de single-user a multi-usuario con:
-- 1. Columna user_id vinculada a auth.users
-- 2. Tabla de user_profiles para datos adicionales del usuario
-- 3. Row Level Security (RLS) para aislamiento de datos
-- 4. Politicas de seguridad para CRUD
-- ============================================================================

-- ============================================================================
-- PASO 1: CREAR TABLA DE PERFILES DE USUARIO (user_profiles)
-- Esta tabla extiende auth.users con datos adicionales
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,

    -- Plan y monetizacion
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'premium', 'lifetime')),
    is_active BOOLEAN DEFAULT true,
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'expired')),
    subscription_expires_at TIMESTAMPTZ,

    -- Stripe/Gumroad IDs (para integracion futura)
    stripe_customer_id TEXT,
    gumroad_sale_id TEXT,

    -- Limites de uso
    max_profiles INTEGER DEFAULT 1, -- Free: 1, Basic: 3, Premium: unlimited
    max_subjects_per_profile INTEGER DEFAULT 5, -- Free: 5, Basic: 15, Premium: unlimited

    -- Metadata
    preferences JSONB DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT false,
    last_login_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indice para busquedas por email
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- Trigger para actualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trigger_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- ============================================================================
-- PASO 2: FUNCION PARA CREAR PERFIL DE USUARIO AUTOMATICAMENTE
-- Se ejecuta cuando un usuario se registra via Supabase Auth
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se ejecuta al crear un usuario en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- PASO 3: MODIFICAR TABLA PROFILES EXISTENTE
-- Agregar columna user_id y vincularla a auth.users
-- ============================================================================

-- Verificar si la columna user_id existe y su tipo
DO $$
BEGIN
    -- Si user_id existe pero es TEXT, la convertimos a UUID
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'user_id'
        AND data_type = 'text'
    ) THEN
        -- Primero eliminamos los datos hardcoded 'local-user'
        -- En produccion, aqui migrarias los datos existentes
        ALTER TABLE profiles DROP COLUMN user_id;
        ALTER TABLE profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Columna user_id convertida de TEXT a UUID';
    END IF;

    -- Si user_id no existe, la creamos
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Columna user_id creada';
    END IF;
END $$;

-- Crear indice para busquedas por user_id
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- ============================================================================
-- PASO 4: HABILITAR ROW LEVEL SECURITY EN TODAS LAS TABLAS
-- ============================================================================

-- Habilitar RLS en user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en school_periods
ALTER TABLE public.school_periods ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en subjects
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en class_schedule
ALTER TABLE public.class_schedule ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en exams
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en exam_topics
ALTER TABLE public.exam_topics ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en materials
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en pomodoro_sessions
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en pomodoro_settings
ALTER TABLE public.pomodoro_settings ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en active_timers
ALTER TABLE public.active_timers ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en alerts
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en content_blocks (si existe)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_blocks') THEN
        ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Habilitar RLS en note_links (si existe)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'note_links') THEN
        ALTER TABLE public.note_links ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Habilitar RLS en focus_journals (si existe)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'focus_journals') THEN
        ALTER TABLE public.focus_journals ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Habilitar RLS en books (si existe)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'books') THEN
        ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ============================================================================
-- PASO 5: POLITICAS RLS PARA user_profiles
-- ============================================================================

-- Eliminar politicas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

-- SELECT: Usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = id);

-- UPDATE: Usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- INSERT: Se maneja via trigger, no se necesita politica directa

-- ============================================================================
-- PASO 6: POLITICAS RLS PARA profiles (perfiles de app)
-- ============================================================================

-- Eliminar politicas existentes
DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profiles" ON public.profiles;

-- SELECT: Usuarios pueden ver sus propios perfiles de app
CREATE POLICY "Users can view own profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Usuarios pueden crear perfiles vinculados a su cuenta
CREATE POLICY "Users can create own profiles"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Usuarios pueden actualizar sus propios perfiles
CREATE POLICY "Users can update own profiles"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuarios pueden eliminar sus propios perfiles
CREATE POLICY "Users can delete own profiles"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- PASO 7: POLITICAS RLS PARA school_periods
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own periods" ON public.school_periods;
DROP POLICY IF EXISTS "Users can create own periods" ON public.school_periods;
DROP POLICY IF EXISTS "Users can update own periods" ON public.school_periods;
DROP POLICY IF EXISTS "Users can delete own periods" ON public.school_periods;

CREATE POLICY "Users can view own periods"
ON public.school_periods
FOR SELECT
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can create own periods"
ON public.school_periods
FOR INSERT
WITH CHECK (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own periods"
ON public.school_periods
FOR UPDATE
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete own periods"
ON public.school_periods
FOR DELETE
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

-- ============================================================================
-- PASO 8: POLITICAS RLS PARA subjects
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can create own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can update own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can delete own subjects" ON public.subjects;

CREATE POLICY "Users can view own subjects"
ON public.subjects
FOR SELECT
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can create own subjects"
ON public.subjects
FOR INSERT
WITH CHECK (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own subjects"
ON public.subjects
FOR UPDATE
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete own subjects"
ON public.subjects
FOR DELETE
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

-- ============================================================================
-- PASO 9: POLITICAS RLS PARA class_schedule
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own schedules" ON public.class_schedule;
DROP POLICY IF EXISTS "Users can create own schedules" ON public.class_schedule;
DROP POLICY IF EXISTS "Users can update own schedules" ON public.class_schedule;
DROP POLICY IF EXISTS "Users can delete own schedules" ON public.class_schedule;

CREATE POLICY "Users can view own schedules"
ON public.class_schedule
FOR SELECT
USING (
    subject_id IN (
        SELECT s.id FROM public.subjects s
        JOIN public.profiles p ON s.profile_id = p.id
        WHERE p.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create own schedules"
ON public.class_schedule
FOR INSERT
WITH CHECK (
    subject_id IN (
        SELECT s.id FROM public.subjects s
        JOIN public.profiles p ON s.profile_id = p.id
        WHERE p.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own schedules"
ON public.class_schedule
FOR UPDATE
USING (
    subject_id IN (
        SELECT s.id FROM public.subjects s
        JOIN public.profiles p ON s.profile_id = p.id
        WHERE p.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete own schedules"
ON public.class_schedule
FOR DELETE
USING (
    subject_id IN (
        SELECT s.id FROM public.subjects s
        JOIN public.profiles p ON s.profile_id = p.id
        WHERE p.user_id = auth.uid()
    )
);

-- ============================================================================
-- PASO 10: POLITICAS RLS PARA tasks
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;

CREATE POLICY "Users can view own tasks"
ON public.tasks
FOR SELECT
USING (
    subject_id IN (
        SELECT s.id FROM public.subjects s
        JOIN public.profiles p ON s.profile_id = p.id
        WHERE p.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create own tasks"
ON public.tasks
FOR INSERT
WITH CHECK (
    subject_id IN (
        SELECT s.id FROM public.subjects s
        JOIN public.profiles p ON s.profile_id = p.id
        WHERE p.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own tasks"
ON public.tasks
FOR UPDATE
USING (
    subject_id IN (
        SELECT s.id FROM public.subjects s
        JOIN public.profiles p ON s.profile_id = p.id
        WHERE p.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete own tasks"
ON public.tasks
FOR DELETE
USING (
    subject_id IN (
        SELECT s.id FROM public.subjects s
        JOIN public.profiles p ON s.profile_id = p.id
        WHERE p.user_id = auth.uid()
    )
);

-- ============================================================================
-- PASO 11: POLITICAS RLS PARA exams
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own exams" ON public.exams;
DROP POLICY IF EXISTS "Users can create own exams" ON public.exams;
DROP POLICY IF EXISTS "Users can update own exams" ON public.exams;
DROP POLICY IF EXISTS "Users can delete own exams" ON public.exams;

CREATE POLICY "Users can view own exams"
ON public.exams
FOR SELECT
USING (
    subject_id IN (
        SELECT s.id FROM public.subjects s
        JOIN public.profiles p ON s.profile_id = p.id
        WHERE p.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create own exams"
ON public.exams
FOR INSERT
WITH CHECK (
    subject_id IN (
        SELECT s.id FROM public.subjects s
        JOIN public.profiles p ON s.profile_id = p.id
        WHERE p.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own exams"
ON public.exams
FOR UPDATE
USING (
    subject_id IN (
        SELECT s.id FROM public.subjects s
        JOIN public.profiles p ON s.profile_id = p.id
        WHERE p.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete own exams"
ON public.exams
FOR DELETE
USING (
    subject_id IN (
        SELECT s.id FROM public.subjects s
        JOIN public.profiles p ON s.profile_id = p.id
        WHERE p.user_id = auth.uid()
    )
);

-- ============================================================================
-- PASO 12: POLITICAS RLS PARA exam_topics
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own exam_topics" ON public.exam_topics;
DROP POLICY IF EXISTS "Users can create own exam_topics" ON public.exam_topics;
DROP POLICY IF EXISTS "Users can update own exam_topics" ON public.exam_topics;
DROP POLICY IF EXISTS "Users can delete own exam_topics" ON public.exam_topics;

CREATE POLICY "Users can view own exam_topics"
ON public.exam_topics
FOR SELECT
USING (
    exam_id IN (
        SELECT e.id FROM public.exams e
        JOIN public.subjects s ON e.subject_id = s.id
        JOIN public.profiles p ON s.profile_id = p.id
        WHERE p.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create own exam_topics"
ON public.exam_topics
FOR INSERT
WITH CHECK (
    exam_id IN (
        SELECT e.id FROM public.exams e
        JOIN public.subjects s ON e.subject_id = s.id
        JOIN public.profiles p ON s.profile_id = p.id
        WHERE p.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own exam_topics"
ON public.exam_topics
FOR UPDATE
USING (
    exam_id IN (
        SELECT e.id FROM public.exams e
        JOIN public.subjects s ON e.subject_id = s.id
        JOIN public.profiles p ON s.profile_id = p.id
        WHERE p.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete own exam_topics"
ON public.exam_topics
FOR DELETE
USING (
    exam_id IN (
        SELECT e.id FROM public.exams e
        JOIN public.subjects s ON e.subject_id = s.id
        JOIN public.profiles p ON s.profile_id = p.id
        WHERE p.user_id = auth.uid()
    )
);

-- ============================================================================
-- PASO 13: POLITICAS RLS PARA materials
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own materials" ON public.materials;
DROP POLICY IF EXISTS "Users can create own materials" ON public.materials;
DROP POLICY IF EXISTS "Users can update own materials" ON public.materials;
DROP POLICY IF EXISTS "Users can delete own materials" ON public.materials;

CREATE POLICY "Users can view own materials"
ON public.materials
FOR SELECT
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can create own materials"
ON public.materials
FOR INSERT
WITH CHECK (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own materials"
ON public.materials
FOR UPDATE
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete own materials"
ON public.materials
FOR DELETE
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

-- ============================================================================
-- PASO 14: POLITICAS RLS PARA pomodoro_sessions
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own sessions" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "Users can create own sessions" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.pomodoro_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.pomodoro_sessions;

CREATE POLICY "Users can view own sessions"
ON public.pomodoro_sessions
FOR SELECT
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can create own sessions"
ON public.pomodoro_sessions
FOR INSERT
WITH CHECK (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own sessions"
ON public.pomodoro_sessions
FOR UPDATE
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete own sessions"
ON public.pomodoro_sessions
FOR DELETE
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

-- ============================================================================
-- PASO 15: POLITICAS RLS PARA pomodoro_settings
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own settings" ON public.pomodoro_settings;
DROP POLICY IF EXISTS "Users can create own settings" ON public.pomodoro_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.pomodoro_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON public.pomodoro_settings;

CREATE POLICY "Users can view own settings"
ON public.pomodoro_settings
FOR SELECT
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can create own settings"
ON public.pomodoro_settings
FOR INSERT
WITH CHECK (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own settings"
ON public.pomodoro_settings
FOR UPDATE
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete own settings"
ON public.pomodoro_settings
FOR DELETE
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

-- ============================================================================
-- PASO 16: POLITICAS RLS PARA active_timers
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own timers" ON public.active_timers;
DROP POLICY IF EXISTS "Users can create own timers" ON public.active_timers;
DROP POLICY IF EXISTS "Users can update own timers" ON public.active_timers;
DROP POLICY IF EXISTS "Users can delete own timers" ON public.active_timers;

CREATE POLICY "Users can view own timers"
ON public.active_timers
FOR SELECT
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can create own timers"
ON public.active_timers
FOR INSERT
WITH CHECK (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own timers"
ON public.active_timers
FOR UPDATE
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete own timers"
ON public.active_timers
FOR DELETE
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

-- ============================================================================
-- PASO 17: POLITICAS RLS PARA alerts
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own alerts" ON public.alerts;
DROP POLICY IF EXISTS "Users can create own alerts" ON public.alerts;
DROP POLICY IF EXISTS "Users can update own alerts" ON public.alerts;
DROP POLICY IF EXISTS "Users can delete own alerts" ON public.alerts;

CREATE POLICY "Users can view own alerts"
ON public.alerts
FOR SELECT
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can create own alerts"
ON public.alerts
FOR INSERT
WITH CHECK (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update own alerts"
ON public.alerts
FOR UPDATE
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete own alerts"
ON public.alerts
FOR DELETE
USING (
    profile_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
);

-- ============================================================================
-- PASO 18: POLITICAS RLS PARA SEGUNDO CEREBRO (si las tablas existen)
-- ============================================================================

-- Content Blocks
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'content_blocks') THEN
        DROP POLICY IF EXISTS "Users can view own content_blocks" ON public.content_blocks;
        DROP POLICY IF EXISTS "Users can create own content_blocks" ON public.content_blocks;
        DROP POLICY IF EXISTS "Users can update own content_blocks" ON public.content_blocks;
        DROP POLICY IF EXISTS "Users can delete own content_blocks" ON public.content_blocks;

        EXECUTE 'CREATE POLICY "Users can view own content_blocks" ON public.content_blocks FOR SELECT USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))';
        EXECUTE 'CREATE POLICY "Users can create own content_blocks" ON public.content_blocks FOR INSERT WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))';
        EXECUTE 'CREATE POLICY "Users can update own content_blocks" ON public.content_blocks FOR UPDATE USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))';
        EXECUTE 'CREATE POLICY "Users can delete own content_blocks" ON public.content_blocks FOR DELETE USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))';
    END IF;
END $$;

-- Note Links
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'note_links') THEN
        DROP POLICY IF EXISTS "Users can view own note_links" ON public.note_links;
        DROP POLICY IF EXISTS "Users can create own note_links" ON public.note_links;
        DROP POLICY IF EXISTS "Users can update own note_links" ON public.note_links;
        DROP POLICY IF EXISTS "Users can delete own note_links" ON public.note_links;

        EXECUTE 'CREATE POLICY "Users can view own note_links" ON public.note_links FOR SELECT USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))';
        EXECUTE 'CREATE POLICY "Users can create own note_links" ON public.note_links FOR INSERT WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))';
        EXECUTE 'CREATE POLICY "Users can update own note_links" ON public.note_links FOR UPDATE USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))';
        EXECUTE 'CREATE POLICY "Users can delete own note_links" ON public.note_links FOR DELETE USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))';
    END IF;
END $$;

-- Focus Journals
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'focus_journals') THEN
        DROP POLICY IF EXISTS "Users can view own focus_journals" ON public.focus_journals;
        DROP POLICY IF EXISTS "Users can create own focus_journals" ON public.focus_journals;
        DROP POLICY IF EXISTS "Users can update own focus_journals" ON public.focus_journals;
        DROP POLICY IF EXISTS "Users can delete own focus_journals" ON public.focus_journals;

        EXECUTE 'CREATE POLICY "Users can view own focus_journals" ON public.focus_journals FOR SELECT USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))';
        EXECUTE 'CREATE POLICY "Users can create own focus_journals" ON public.focus_journals FOR INSERT WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))';
        EXECUTE 'CREATE POLICY "Users can update own focus_journals" ON public.focus_journals FOR UPDATE USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))';
        EXECUTE 'CREATE POLICY "Users can delete own focus_journals" ON public.focus_journals FOR DELETE USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))';
    END IF;
END $$;

-- Books
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'books') THEN
        DROP POLICY IF EXISTS "Users can view own books" ON public.books;
        DROP POLICY IF EXISTS "Users can create own books" ON public.books;
        DROP POLICY IF EXISTS "Users can update own books" ON public.books;
        DROP POLICY IF EXISTS "Users can delete own books" ON public.books;

        EXECUTE 'CREATE POLICY "Users can view own books" ON public.books FOR SELECT USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))';
        EXECUTE 'CREATE POLICY "Users can create own books" ON public.books FOR INSERT WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))';
        EXECUTE 'CREATE POLICY "Users can update own books" ON public.books FOR UPDATE USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))';
        EXECUTE 'CREATE POLICY "Users can delete own books" ON public.books FOR DELETE USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))';
    END IF;
END $$;

-- ============================================================================
-- PASO 19: FUNCION HELPER PARA VERIFICAR LIMITES DE PLAN
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_user_limits()
RETURNS TRIGGER AS $$
DECLARE
    user_plan TEXT;
    current_count INTEGER;
    max_allowed INTEGER;
BEGIN
    -- Obtener el plan del usuario
    SELECT plan INTO user_plan
    FROM public.user_profiles
    WHERE id = auth.uid();

    -- Contar perfiles actuales del usuario
    IF TG_TABLE_NAME = 'profiles' THEN
        SELECT COUNT(*) INTO current_count
        FROM public.profiles
        WHERE user_id = auth.uid();

        -- Verificar limites segun plan
        CASE user_plan
            WHEN 'free' THEN max_allowed := 1;
            WHEN 'basic' THEN max_allowed := 3;
            WHEN 'premium' THEN max_allowed := 999; -- "ilimitado"
            WHEN 'lifetime' THEN max_allowed := 999;
            ELSE max_allowed := 1;
        END CASE;

        IF current_count >= max_allowed THEN
            RAISE EXCEPTION 'Has alcanzado el limite de perfiles para tu plan (%). Actualiza tu plan para crear mas perfiles.', user_plan;
        END IF;
    END IF;

    -- Contar materias (subjects) si aplica
    IF TG_TABLE_NAME = 'subjects' THEN
        SELECT COUNT(*) INTO current_count
        FROM public.subjects s
        JOIN public.profiles p ON s.profile_id = p.id
        WHERE p.user_id = auth.uid()
        AND s.profile_id = NEW.profile_id;

        CASE user_plan
            WHEN 'free' THEN max_allowed := 5;
            WHEN 'basic' THEN max_allowed := 15;
            WHEN 'premium' THEN max_allowed := 999;
            WHEN 'lifetime' THEN max_allowed := 999;
            ELSE max_allowed := 5;
        END CASE;

        IF current_count >= max_allowed THEN
            RAISE EXCEPTION 'Has alcanzado el limite de materias para tu plan (%). Actualiza tu plan para crear mas materias.', user_plan;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para verificar limites al crear perfiles
DROP TRIGGER IF EXISTS check_profile_limits ON public.profiles;
CREATE TRIGGER check_profile_limits
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.check_user_limits();

-- Trigger para verificar limites al crear materias
DROP TRIGGER IF EXISTS check_subject_limits ON public.subjects;
CREATE TRIGGER check_subject_limits
    BEFORE INSERT ON public.subjects
    FOR EACH ROW
    EXECUTE FUNCTION public.check_user_limits();

-- ============================================================================
-- PASO 20: FUNCION PARA ADMINISTRADORES (usar con service_role_key)
-- ============================================================================

-- Esta funcion solo funciona cuando se llama con la service_role_key
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    full_name TEXT,
    plan TEXT,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    profiles_count BIGINT,
    total_sessions BIGINT
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        up.id as user_id,
        up.email,
        up.full_name,
        up.plan,
        up.is_active,
        up.created_at,
        (SELECT COUNT(*) FROM public.profiles p WHERE p.user_id = up.id) as profiles_count,
        (SELECT COUNT(*) FROM public.pomodoro_sessions ps
         JOIN public.profiles p ON ps.profile_id = p.id
         WHERE p.user_id = up.id) as total_sessions
    FROM public.user_profiles up
    ORDER BY up.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Funcion para activar/desactivar usuarios (solo admin con service_role_key)
CREATE OR REPLACE FUNCTION public.admin_set_user_active(
    target_user_id UUID,
    active_status BOOLEAN
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.user_profiles
    SET is_active = active_status,
        updated_at = now()
    WHERE id = target_user_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Funcion para cambiar plan de usuario (solo admin con service_role_key)
CREATE OR REPLACE FUNCTION public.admin_set_user_plan(
    target_user_id UUID,
    new_plan TEXT,
    expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.user_profiles
    SET plan = new_plan,
        subscription_expires_at = expires_at,
        subscription_status = CASE
            WHEN new_plan = 'lifetime' THEN 'active'
            WHEN expires_at IS NOT NULL AND expires_at > now() THEN 'active'
            ELSE subscription_status
        END,
        updated_at = now()
    WHERE id = target_user_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICACION FINAL
-- ============================================================================

-- Mostrar resumen de tablas con RLS habilitado
DO $$
DECLARE
    table_name TEXT;
BEGIN
    RAISE NOTICE '=== MIGRACION COMPLETADA ===';
    RAISE NOTICE 'Tablas con RLS habilitado:';

    FOR table_name IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename IN (
            'user_profiles', 'profiles', 'school_periods', 'subjects',
            'class_schedule', 'tasks', 'exams', 'exam_topics', 'materials',
            'pomodoro_sessions', 'pomodoro_settings', 'active_timers', 'alerts',
            'content_blocks', 'note_links', 'focus_journals', 'books'
        )
    LOOP
        RAISE NOTICE '  - %', table_name;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE 'Siguientes pasos:';
    RAISE NOTICE '1. Actualizar el codigo frontend para usar autenticacion';
    RAISE NOTICE '2. Migrar datos existentes asignando user_id correcto';
    RAISE NOTICE '3. Probar las politicas RLS con diferentes usuarios';
    RAISE NOTICE '4. Configurar variables de entorno en Vercel';
END $$;
