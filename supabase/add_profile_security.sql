-- ============================================
-- MIGRACIÓN: AGREGAR CAMPOS DE SEGURIDAD A PROFILES
-- ============================================
-- Este script agrega las columnas necesarias para el sistema de PIN
-- a la tabla profiles existente.

-- Agregar columnas de seguridad
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(64),
  ADD COLUMN IF NOT EXISTS requires_pin BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS biometric_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_lock_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE;

-- Índice para optimizar búsquedas por requires_pin
CREATE INDEX IF NOT EXISTS idx_profiles_requires_pin ON profiles(requires_pin);

-- Comentarios de documentación
COMMENT ON COLUMN profiles.pin_hash IS 'Hash SHA-256 del PIN de 4 dígitos (nunca almacenar en texto plano)';
COMMENT ON COLUMN profiles.requires_pin IS 'Si el perfil requiere PIN para desbloquearse';
COMMENT ON COLUMN profiles.biometric_enabled IS 'Si está habilitada la autenticación biométrica (Face ID/Touch ID)';
COMMENT ON COLUMN profiles.auto_lock_minutes IS 'Minutos de inactividad antes de bloquear automáticamente (NULL = nunca)';
COMMENT ON COLUMN profiles.last_accessed_at IS 'Última vez que se accedió al perfil';
