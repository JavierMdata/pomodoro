-- ============================================
-- MIGRACIÓN: SISTEMA CENTRAL DE GESTIÓN DE CATEGORÍAS
-- ============================================
-- Tabla para almacenar instancias de categorías creadas por el usuario
-- Estas categorías se convierten en secciones dinámicas de la app

CREATE TABLE IF NOT EXISTS category_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Información básica
  name VARCHAR(255) NOT NULL, -- Ej: "Inglés B2", "Matemáticas I", "Freelance Dev"
  category_type VARCHAR(50) NOT NULL, -- 'materia', 'idioma', 'trabajo', 'gym', 'proyecto', 'descanso', 'otro'

  -- Configuración de periodo
  period_type VARCHAR(50) DEFAULT 'indefinido', -- 'mensual', 'trimestral', 'semestral', 'anual', 'indefinido', 'custom'
  start_date DATE,
  end_date DATE,

  -- Horario y frecuencia semanal
  schedule_days INTEGER[] DEFAULT '{}', -- [1, 3, 5] = Lunes, Miércoles, Viernes
  schedule_start_time TIME NOT NULL, -- Hora de inicio
  schedule_end_time TIME NOT NULL, -- Hora de fin
  times_per_week INTEGER DEFAULT 1, -- Cuántas veces se repite en la semana

  -- Vinculación opcional
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL, -- Si es materia, puede vincular a Subject

  -- Presentación
  color VARCHAR(7) DEFAULT '#6366F1', -- Color hex
  icon VARCHAR(50), -- Emoji o nombre de icono
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_category_instances_profile ON category_instances(profile_id);
CREATE INDEX IF NOT EXISTS idx_category_instances_type ON category_instances(category_type);
CREATE INDEX IF NOT EXISTS idx_category_instances_active ON category_instances(is_active);
CREATE INDEX IF NOT EXISTS idx_category_instances_subject ON category_instances(subject_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_category_instance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_category_instance_updated_at
  BEFORE UPDATE ON category_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_category_instance_updated_at();

-- Comentarios descriptivos
COMMENT ON TABLE category_instances IS 'Instancias de categorías creadas por usuarios - se convierten en secciones dinámicas de la app';
COMMENT ON COLUMN category_instances.name IS 'Nombre dado por el usuario a esta instancia';
COMMENT ON COLUMN category_instances.category_type IS 'Tipo: materia, idioma, trabajo, gym, proyecto, descanso, otro';
COMMENT ON COLUMN category_instances.period_type IS 'Duración: mensual, trimestral, semestral, anual, indefinido, custom';
COMMENT ON COLUMN category_instances.schedule_days IS 'Array de días de la semana: 0=Dom, 1=Lun, ..., 6=Sáb';
COMMENT ON COLUMN category_instances.times_per_week IS 'Frecuencia semanal de repetición';
COMMENT ON COLUMN category_instances.subject_id IS 'Vínculo opcional a materia si category_type=materia';

-- Desactivar RLS para pruebas
ALTER TABLE category_instances DISABLE ROW LEVEL SECURITY;

-- ============================================
-- CONFIGURACIÓN COMPLETADA
-- ============================================
