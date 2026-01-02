-- ============================================
-- SCRIPT DE CONFIGURACIÓN FINAL - POMOSMART
-- Este script crea las tablas con los nombres exactos que usa el código React
-- y configura la seguridad para permitir acceso público inicial.
-- ============================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA DE PERFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- Opcional para pruebas iniciales
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  gender VARCHAR(20) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(50) DEFAULT 'user',
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PERIODOS ESCOLARES
CREATE TABLE IF NOT EXISTS school_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MATERIAS
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  school_period_id UUID REFERENCES school_periods(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  professor_name VARCHAR(200),
  classroom VARCHAR(100),
  start_date DATE,
  end_date DATE,
  code VARCHAR(50),
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. HORARIOS
CREATE TABLE IF NOT EXISTS class_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TAREAS
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'pending',
  estimated_pomodoros INTEGER DEFAULT 1,
  completed_pomodoros INTEGER DEFAULT 0,
  alert_days_before INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. EXÁMENES
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200) NOT NULL,
  exam_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) DEFAULT 'upcoming',
  duration_minutes INTEGER DEFAULT 60,
  weight_percentage DECIMAL(5,2) DEFAULT 0,
  alert_days_before INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TEMAS DE EXAMEN
CREATE TABLE IF NOT EXISTS exam_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(500) NOT NULL,
  estimated_pomodoros INTEGER DEFAULT 1,
  completed_pomodoros INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'not_started',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. MATERIALES (Nombre corregido para coincidir con React)
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(500) NOT NULL,
  type VARCHAR(50) NOT NULL,
  total_units INTEGER DEFAULT 1,
  completed_units INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'not_started',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. SESIONES DE POMODORO
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  task_id UUID,
  exam_topic_id UUID,
  material_id UUID,
  session_type VARCHAR(50) NOT NULL,
  planned_duration_minutes INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL,
  focus_rating INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. ALERTAS
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CONFIGURACIÓN DE SEGURIDAD (RLS)
-- ============================================

-- Desactivar RLS para permitir acceso público inicial (Recomendado para pruebas)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_periods DISABLE ROW LEVEL SECURITY;
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE class_schedule DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE exams DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE alerts DISABLE ROW LEVEL SECURITY;

-- Si prefieres mantener RLS, usa estas políticas en su lugar:
-- CREATE POLICY "Acceso Público" ON profiles FOR ALL USING (true);
-- (Repetir para cada tabla)
