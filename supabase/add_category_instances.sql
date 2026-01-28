-- ============================================
-- MIGRACIÓN: SISTEMA CENTRAL DE GESTIÓN DE CATEGORÍAS
-- FIX: Evita error si el trigger ya existe
-- ============================================

-- Eliminar trigger y función si ya existen
DROP TRIGGER IF EXISTS set_category_instance_updated_at ON category_instances;
DROP FUNCTION IF EXISTS update_category_instance_updated_at();

-- Crear tabla si no existe
CREATE TABLE IF NOT EXISTS category_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Información básica
  name VARCHAR(255) NOT NULL,
  category_type VARCHAR(50) NOT NULL,

  -- Configuración de periodo
  period_type VARCHAR(50) DEFAULT 'indefinido',
  start_date DATE,
  end_date DATE,

  -- Horario y frecuencia semanal
  schedule_days INTEGER[] DEFAULT '{}',
  schedule_start_time TIME NOT NULL,
  schedule_end_time TIME NOT NULL,
  times_per_week INTEGER DEFAULT 1,

  -- Vinculación opcional
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,

  -- Presentación
  color VARCHAR(7) DEFAULT '#6366F1',
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_category_instances_profile ON category_instances(profile_id);
CREATE INDEX IF NOT EXISTS idx_category_instances_type ON category_instances(category_type);
CREATE INDEX IF NOT EXISTS idx_category_instances_active ON category_instances(is_active);
CREATE INDEX IF NOT EXISTS idx_category_instances_subject ON category_instances(subject_id);

-- Función y trigger para updated_at
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

-- Desactivar RLS
ALTER TABLE category_instances DISABLE ROW LEVEL SECURITY;

-- ============================================
-- CONFIGURACIÓN COMPLETADA
-- ============================================
