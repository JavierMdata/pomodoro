-- ============================================================================
-- SISTEMA DE CODIGOS DE ACTIVACION
-- ============================================================================
-- Este sistema permite generar codigos que los usuarios canjean para
-- activar planes premium. El admin genera los codigos manualmente.
-- ============================================================================

-- Tabla de codigos de activacion
CREATE TABLE IF NOT EXISTS public.activation_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- El codigo unico (ej: "POMO-ABCD-1234")
    code TEXT UNIQUE NOT NULL,

    -- Tipo de plan que otorga
    plan TEXT NOT NULL CHECK (plan IN ('basic', 'premium', 'lifetime')),

    -- Duracion en dias (NULL para lifetime)
    duration_days INTEGER,

    -- Estado del codigo
    is_used BOOLEAN DEFAULT false,
    used_by UUID REFERENCES auth.users(id),
    used_at TIMESTAMPTZ,

    -- Metadatos
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ, -- Fecha limite para usar el codigo (opcional)
    notes TEXT, -- Notas del admin (ej: "Vendido a Juan via PayPal")

    -- Restricciones
    CONSTRAINT valid_duration CHECK (
        (plan = 'lifetime' AND duration_days IS NULL) OR
        (plan != 'lifetime' AND duration_days > 0)
    )
);

-- Indice para busqueda rapida por codigo
CREATE INDEX IF NOT EXISTS idx_activation_codes_code ON public.activation_codes(code);
CREATE INDEX IF NOT EXISTS idx_activation_codes_unused ON public.activation_codes(is_used) WHERE is_used = false;

-- Habilitar RLS
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

-- Politica: Cualquier usuario autenticado puede verificar/canjear codigos
-- (la verificacion de uso se hace en la funcion)
CREATE POLICY "Users can view unused codes to redeem"
ON public.activation_codes
FOR SELECT
USING (auth.uid() IS NOT NULL AND is_used = false);

-- ============================================================================
-- FUNCION PARA CANJEAR CODIGO
-- ============================================================================

CREATE OR REPLACE FUNCTION public.redeem_activation_code(input_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    code_record RECORD;
    user_id UUID;
    new_expiry TIMESTAMPTZ;
    result JSON;
BEGIN
    -- Obtener el usuario actual
    user_id := auth.uid();

    IF user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'No estas autenticado'
        );
    END IF;

    -- Buscar el codigo (case insensitive, sin espacios)
    SELECT * INTO code_record
    FROM public.activation_codes
    WHERE UPPER(REPLACE(code, '-', '')) = UPPER(REPLACE(input_code, '-', ''))
    FOR UPDATE; -- Lock para evitar uso simultaneo

    -- Verificar si existe
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Codigo no valido'
        );
    END IF;

    -- Verificar si ya fue usado
    IF code_record.is_used THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Este codigo ya ha sido utilizado'
        );
    END IF;

    -- Verificar si el codigo ha expirado
    IF code_record.expires_at IS NOT NULL AND code_record.expires_at < now() THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Este codigo ha expirado'
        );
    END IF;

    -- Calcular nueva fecha de expiracion de suscripcion
    IF code_record.plan = 'lifetime' THEN
        new_expiry := NULL; -- Lifetime no expira
    ELSE
        -- Si ya tiene suscripcion activa, extender desde esa fecha
        SELECT
            CASE
                WHEN subscription_expires_at > now() THEN subscription_expires_at
                ELSE now()
            END + (code_record.duration_days || ' days')::INTERVAL
        INTO new_expiry
        FROM public.user_profiles
        WHERE id = user_id;

        IF new_expiry IS NULL THEN
            new_expiry := now() + (code_record.duration_days || ' days')::INTERVAL;
        END IF;
    END IF;

    -- Marcar codigo como usado
    UPDATE public.activation_codes
    SET
        is_used = true,
        used_by = user_id,
        used_at = now()
    WHERE id = code_record.id;

    -- Actualizar perfil del usuario
    UPDATE public.user_profiles
    SET
        plan = code_record.plan,
        subscription_status = 'active',
        subscription_expires_at = new_expiry,
        max_profiles = CASE
            WHEN code_record.plan IN ('premium', 'lifetime') THEN 999
            WHEN code_record.plan = 'basic' THEN 3
            ELSE max_profiles
        END,
        max_subjects_per_profile = CASE
            WHEN code_record.plan IN ('premium', 'lifetime') THEN 999
            WHEN code_record.plan = 'basic' THEN 15
            ELSE max_subjects_per_profile
        END,
        updated_at = now()
    WHERE id = user_id;

    -- Retornar exito
    RETURN json_build_object(
        'success', true,
        'plan', code_record.plan,
        'expires_at', new_expiry,
        'message', CASE
            WHEN code_record.plan = 'lifetime' THEN 'Plan Lifetime activado! Acceso de por vida.'
            ELSE 'Plan ' || code_record.plan || ' activado hasta ' || to_char(new_expiry, 'DD/MM/YYYY')
        END
    );
END;
$$;

-- ============================================================================
-- FUNCION PARA GENERAR CODIGOS (SOLO ADMIN CON SERVICE_ROLE_KEY)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.admin_generate_codes(
    plan_type TEXT,
    quantity INTEGER DEFAULT 1,
    duration INTEGER DEFAULT NULL, -- dias (null para lifetime)
    prefix TEXT DEFAULT 'POMO',
    expiry_days INTEGER DEFAULT NULL -- dias hasta que el codigo expire
)
RETURNS TABLE (
    code TEXT,
    plan TEXT,
    duration_days INTEGER,
    expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    i INTEGER;
    new_code TEXT;
    code_expiry TIMESTAMPTZ;
BEGIN
    -- Validar plan
    IF plan_type NOT IN ('basic', 'premium', 'lifetime') THEN
        RAISE EXCEPTION 'Plan invalido. Usar: basic, premium, lifetime';
    END IF;

    -- Validar duracion
    IF plan_type != 'lifetime' AND duration IS NULL THEN
        RAISE EXCEPTION 'Debes especificar duration para planes no-lifetime';
    END IF;

    -- Calcular expiracion del codigo
    IF expiry_days IS NOT NULL THEN
        code_expiry := now() + (expiry_days || ' days')::INTERVAL;
    ELSE
        code_expiry := NULL;
    END IF;

    -- Generar codigos
    FOR i IN 1..quantity LOOP
        -- Generar codigo unico formato: PREFIX-XXXX-XXXX
        LOOP
            new_code := prefix || '-' ||
                        UPPER(substr(md5(random()::text), 1, 4)) || '-' ||
                        UPPER(substr(md5(random()::text), 1, 4));

            -- Verificar que no exista
            EXIT WHEN NOT EXISTS (SELECT 1 FROM public.activation_codes WHERE activation_codes.code = new_code);
        END LOOP;

        -- Insertar codigo
        INSERT INTO public.activation_codes (code, plan, duration_days, expires_at)
        VALUES (new_code, plan_type, duration, code_expiry);

        -- Retornar codigo generado
        code := new_code;
        plan := plan_type;
        duration_days := duration;
        expires_at := code_expiry;
        RETURN NEXT;
    END LOOP;
END;
$$;

-- ============================================================================
-- FUNCION PARA VER CODIGOS (SOLO ADMIN)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.admin_list_codes(
    show_used BOOLEAN DEFAULT false,
    limit_count INTEGER DEFAULT 100
)
RETURNS TABLE (
    code TEXT,
    plan TEXT,
    duration_days INTEGER,
    is_used BOOLEAN,
    used_by_email TEXT,
    used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    notes TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ac.code,
        ac.plan,
        ac.duration_days,
        ac.is_used,
        up.email as used_by_email,
        ac.used_at,
        ac.expires_at,
        ac.created_at,
        ac.notes
    FROM public.activation_codes ac
    LEFT JOIN public.user_profiles up ON ac.used_by = up.id
    WHERE show_used OR ac.is_used = false
    ORDER BY ac.created_at DESC
    LIMIT limit_count;
END;
$$;

-- ============================================================================
-- EJEMPLOS DE USO (ejecutar desde dashboard de Supabase con service_role_key)
-- ============================================================================

-- Generar 5 codigos premium de 30 dias:
-- SELECT * FROM admin_generate_codes('premium', 5, 30);

-- Generar 1 codigo lifetime:
-- SELECT * FROM admin_generate_codes('lifetime', 1);

-- Generar 10 codigos basic de 7 dias (trial):
-- SELECT * FROM admin_generate_codes('basic', 10, 7, 'TRIAL');

-- Ver codigos no usados:
-- SELECT * FROM admin_list_codes(false);

-- Ver todos los codigos:
-- SELECT * FROM admin_list_codes(true);
