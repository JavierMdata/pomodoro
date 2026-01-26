-- ================================================================
-- TABLA PARA TIMERS ACTIVOS PERSISTENTES
-- ================================================================
-- Esta tabla permite que el timer del Pomodoro siga corriendo
-- aunque el usuario cierre la aplicación web.
-- Solo se detiene cuando el usuario lo ordena explícitamente.

-- Crear tabla active_timers si no existe
CREATE TABLE IF NOT EXISTS active_timers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Estado del timer
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('work', 'short_break', 'long_break')),
  started_at TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER NOT NULL,
  is_paused BOOLEAN DEFAULT FALSE,
  paused_at TIMESTAMPTZ,
  elapsed_when_paused INTEGER,
  session_count INTEGER DEFAULT 1,

  -- Item seleccionado (para restaurar al volver)
  selected_item_type VARCHAR(20) CHECK (selected_item_type IN ('task', 'exam', 'material')),
  selected_item_id UUID,
  selected_meta_id UUID,
  selected_subject_id UUID,
  selected_display_title TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Solo un timer activo por perfil
  UNIQUE(profile_id)
);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_active_timer_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_active_timer_timestamp ON active_timers;
CREATE TRIGGER update_active_timer_timestamp
  BEFORE UPDATE ON active_timers
  FOR EACH ROW
  EXECUTE FUNCTION update_active_timer_timestamp();

-- Índice para búsquedas rápidas por perfil
CREATE INDEX IF NOT EXISTS idx_active_timers_profile ON active_timers(profile_id);

-- RLS: Cada usuario solo puede ver sus propios timers
ALTER TABLE active_timers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own timers" ON active_timers;
CREATE POLICY "Users can view own timers" ON active_timers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own timers" ON active_timers;
CREATE POLICY "Users can insert own timers" ON active_timers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own timers" ON active_timers;
CREATE POLICY "Users can update own timers" ON active_timers
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete own timers" ON active_timers;
CREATE POLICY "Users can delete own timers" ON active_timers
  FOR DELETE USING (true);

-- Comentarios descriptivos
COMMENT ON TABLE active_timers IS 'Almacena el estado del timer Pomodoro para persistencia entre sesiones';
COMMENT ON COLUMN active_timers.started_at IS 'Timestamp de cuando se inició el timer';
COMMENT ON COLUMN active_timers.duration_seconds IS 'Duración total del timer en segundos';
COMMENT ON COLUMN active_timers.elapsed_when_paused IS 'Segundos transcurridos al momento de pausar';
