-- ================================================================
-- POMODORO SMART - SEGUNDO CEREBRO INTEGRAL
-- Esquema de Base de Datos para Funcionalidades Notion + Obsidian
-- ================================================================

-- ================================================================
-- 1. TABLA: content_blocks (Bloques de Contenido tipo Notion)
-- ================================================================
-- Almacena bloques de contenido enriquecido vinculados a tareas, materias o independientes
CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Relaciones opcionales (puede estar vinculado a tarea, materia, examen o ser independiente)
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  exam_topic_id UUID REFERENCES exam_topics(id) ON DELETE CASCADE,
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,

  -- Jerarquía de bloques (permite bloques anidados)
  parent_block_id UUID REFERENCES content_blocks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0, -- Orden dentro del parent

  -- Tipo de bloque
  block_type VARCHAR(50) NOT NULL DEFAULT 'text',
  -- Tipos soportados: 'text', 'heading1', 'heading2', 'heading3',
  --                   'checklist', 'bullet_list', 'numbered_list',
  --                   'image', 'code', 'quote', 'divider',
  --                   'database', 'gallery', 'kanban'

  -- Contenido del bloque (JSON estructurado)
  content JSONB NOT NULL DEFAULT '{}',
  -- Ejemplos de estructura:
  -- Text: {"text": "contenido", "format": {"bold": true, "italic": false}}
  -- Checklist: {"items": [{"text": "item", "checked": false}]}
  -- Image: {"url": "https://...", "caption": "descripción"}
  -- Database: {"columns": [...], "rows": [...], "view": "table|gallery|list"}

  -- Metadata
  title VARCHAR(500), -- Título opcional del bloque (útil para páginas)
  icon VARCHAR(100), -- Emoji o ícono
  cover_image TEXT, -- URL de imagen de portada

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_block_type CHECK (
    block_type IN (
      'text', 'heading1', 'heading2', 'heading3',
      'checklist', 'bullet_list', 'numbered_list',
      'image', 'code', 'quote', 'divider',
      'database', 'gallery', 'kanban', 'callout'
    )
  )
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_content_blocks_profile ON content_blocks(profile_id);
CREATE INDEX IF NOT EXISTS idx_content_blocks_task ON content_blocks(task_id);
CREATE INDEX IF NOT EXISTS idx_content_blocks_subject ON content_blocks(subject_id);
CREATE INDEX IF NOT EXISTS idx_content_blocks_parent ON content_blocks(parent_block_id);
CREATE INDEX IF NOT EXISTS idx_content_blocks_position ON content_blocks(position);
CREATE INDEX IF NOT EXISTS idx_content_blocks_type ON content_blocks(block_type);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_content_blocks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_content_blocks_updated_at
BEFORE UPDATE ON content_blocks
FOR EACH ROW
EXECUTE FUNCTION update_content_blocks_updated_at();

-- ================================================================
-- 2. TABLA: note_links (Enlaces Bidireccionales tipo Obsidian)
-- ================================================================
-- Almacena las relaciones [[enlace]] entre bloques, tareas, materias, etc.
CREATE TABLE IF NOT EXISTS note_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Source: de dónde sale el enlace
  source_type VARCHAR(50) NOT NULL,
  -- Tipos: 'content_block', 'task', 'subject', 'exam', 'exam_topic', 'material'
  source_id UUID NOT NULL,

  -- Target: hacia dónde apunta el enlace
  target_type VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,

  -- Metadata del enlace
  link_text VARCHAR(500), -- Texto del [[enlace]] original
  context TEXT, -- Contexto donde apareció el enlace (fragmento de texto)

  -- Peso del enlace (se incrementa con cada mención)
  weight INTEGER NOT NULL DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_referenced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint: evitar duplicados
  UNIQUE(profile_id, source_type, source_id, target_type, target_id),

  CONSTRAINT valid_link_types CHECK (
    source_type IN ('content_block', 'task', 'subject', 'exam', 'exam_topic', 'material', 'focus_journal') AND
    target_type IN ('content_block', 'task', 'subject', 'exam', 'exam_topic', 'material', 'focus_journal')
  )
);

-- Índices para optimizar consultas de grafos
CREATE INDEX IF NOT EXISTS idx_note_links_profile ON note_links(profile_id);
CREATE INDEX IF NOT EXISTS idx_note_links_source ON note_links(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_note_links_target ON note_links(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_note_links_weight ON note_links(weight DESC);

-- ================================================================
-- 3. TABLA: focus_journals (Journaling de Enfoque)
-- ================================================================
-- Permite al usuario reflexionar sobre sus sesiones de estudio
CREATE TABLE IF NOT EXISTS focus_journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Relación con sesión Pomodoro (opcional)
  session_id UUID REFERENCES pomodoro_sessions(id) ON DELETE SET NULL,

  -- Relaciones opcionales con contexto
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  exam_topic_id UUID REFERENCES exam_topics(id) ON DELETE SET NULL,
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,

  -- Contenido del journal
  title VARCHAR(500) NOT NULL,
  entry TEXT NOT NULL, -- Reflexión principal

  -- Preguntas guiadas (JSON con respuestas)
  guided_questions JSONB DEFAULT '{}',
  -- Ejemplo: {
  --   "what_loved": "Me encantó descubrir cómo funciona el algoritmo",
  --   "what_learned": "Aprendí sobre complejidad O(n)",
  --   "what_struggled": "Me costó entender la recursividad",
  --   "next_steps": "Practicar más problemas de recursión"
  -- }

  -- Emociones y estado
  mood VARCHAR(50), -- 'energized', 'calm', 'focused', 'frustrated', 'curious', 'proud'
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5), -- 1=agotado, 5=energizado
  flow_state_rating INTEGER CHECK (flow_state_rating BETWEEN 1 AND 5), -- Qué tan "en la zona" estaba

  -- Tags personalizados
  tags TEXT[], -- Array de tags: ['matemáticas', 'breakthrough', 'necesito_ayuda']

  -- Metadata
  journal_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_mood CHECK (
    mood IN ('energized', 'calm', 'focused', 'frustrated', 'curious', 'proud', 'overwhelmed', 'playful', 'determined')
  )
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_focus_journals_profile ON focus_journals(profile_id);
CREATE INDEX IF NOT EXISTS idx_focus_journals_session ON focus_journals(session_id);
CREATE INDEX IF NOT EXISTS idx_focus_journals_date ON focus_journals(journal_date DESC);
CREATE INDEX IF NOT EXISTS idx_focus_journals_mood ON focus_journals(mood);
CREATE INDEX IF NOT EXISTS idx_focus_journals_tags ON focus_journals USING GIN(tags);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_focus_journals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_focus_journals_updated_at
BEFORE UPDATE ON focus_journals
FOR EACH ROW
EXECUTE FUNCTION update_focus_journals_updated_at();

-- ================================================================
-- 4. TABLA: knowledge_nodes (Nodos del Grafo de Conocimiento)
-- ================================================================
-- Vista materializada para optimizar la visualización del grafo
-- Combina información de múltiples tablas para el mapa de nodos
CREATE MATERIALIZED VIEW IF NOT EXISTS knowledge_nodes AS
WITH node_stats AS (
  -- Calcular estadísticas de tiempo Pomodoro por entidad
  SELECT
    'subject' as node_type,
    s.id as node_id,
    s.profile_id,
    s.name as title,
    s.color,
    s.icon,
    COALESCE(SUM(ses.duration_seconds), 0) as total_time_seconds,
    COUNT(DISTINCT ses.id) as session_count,
    COALESCE(AVG(ses.focus_rating), 0) as avg_focus_rating
  FROM subjects s
  LEFT JOIN pomodoro_sessions ses ON (
    ses.task_id IN (SELECT id FROM tasks WHERE subject_id = s.id) OR
    ses.exam_topic_id IN (SELECT et.id FROM exam_topics et JOIN exams e ON et.exam_id = e.id WHERE e.subject_id = s.id) OR
    ses.material_id IN (SELECT id FROM materials WHERE subject_id = s.id)
  )
  GROUP BY s.id, s.profile_id, s.name, s.color, s.icon

  UNION ALL

  -- Tareas como nodos
  SELECT
    'task' as node_type,
    t.id as node_id,
    s.profile_id,
    t.title as title,
    s.color,
    t.priority::text as icon,
    COALESCE(SUM(ses.duration_seconds), 0) as total_time_seconds,
    COUNT(DISTINCT ses.id) as session_count,
    COALESCE(AVG(ses.focus_rating), 0) as avg_focus_rating
  FROM tasks t
  JOIN subjects s ON t.subject_id = s.id
  LEFT JOIN pomodoro_sessions ses ON ses.task_id = t.id
  GROUP BY t.id, s.profile_id, t.title, s.color, t.priority

  UNION ALL

  -- Exámenes como nodos
  SELECT
    'exam' as node_type,
    e.id as node_id,
    s.profile_id,
    e.name as title,
    s.color,
    '📝' as icon,
    COALESCE(SUM(ses.duration_seconds), 0) as total_time_seconds,
    COUNT(DISTINCT ses.id) as session_count,
    COALESCE(AVG(ses.focus_rating), 0) as avg_focus_rating
  FROM exams e
  JOIN subjects s ON e.subject_id = s.id
  LEFT JOIN pomodoro_sessions ses ON ses.exam_topic_id IN (SELECT id FROM exam_topics WHERE exam_id = e.id)
  GROUP BY e.id, s.profile_id, e.name, s.color

  UNION ALL

  -- Materiales como nodos
  SELECT
    'material' as node_type,
    m.id as node_id,
    m.profile_id,
    m.title as title,
    COALESCE(s.color, '#6B7280') as color,
    m.type as icon,
    COALESCE(SUM(ses.duration_seconds), 0) as total_time_seconds,
    COUNT(DISTINCT ses.id) as session_count,
    COALESCE(AVG(ses.focus_rating), 0) as avg_focus_rating
  FROM materials m
  LEFT JOIN subjects s ON m.subject_id = s.id
  LEFT JOIN pomodoro_sessions ses ON ses.material_id = m.id
  GROUP BY m.id, m.profile_id, m.title, s.color, m.type

  UNION ALL

  -- Focus Journals como nodos
  SELECT
    'focus_journal' as node_type,
    fj.id as node_id,
    fj.profile_id,
    fj.title as title,
    CASE
      WHEN fj.mood = 'energized' THEN '#F59E0B'
      WHEN fj.mood = 'calm' THEN '#3B82F6'
      WHEN fj.mood = 'focused' THEN '#8B5CF6'
      WHEN fj.mood = 'curious' THEN '#EC4899'
      WHEN fj.mood = 'proud' THEN '#10B981'
      ELSE '#6B7280'
    END as color,
    '✍️' as icon,
    0 as total_time_seconds,
    0 as session_count,
    COALESCE(fj.flow_state_rating, 0) as avg_focus_rating
  FROM focus_journals fj
)
SELECT
  node_type,
  node_id,
  profile_id,
  title,
  color,
  icon,
  total_time_seconds,
  session_count,
  avg_focus_rating,
  -- Calcular tamaño del nodo basado en tiempo dedicado
  CASE
    WHEN total_time_seconds = 0 THEN 1
    ELSE LEAST(10, 1 + LOG(1 + total_time_seconds / 600.0)) -- Escala logarítmica
  END as node_size
FROM node_stats;

-- Índices en la vista materializada
CREATE UNIQUE INDEX IF NOT EXISTS idx_knowledge_nodes_unique
ON knowledge_nodes(node_type, node_id);

CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_profile
ON knowledge_nodes(profile_id);

-- Función para refrescar la vista
CREATE OR REPLACE FUNCTION refresh_knowledge_graph()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY knowledge_nodes;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 5. EXTENSIÓN: Campos adicionales en tabla 'pomodoro_sessions'
-- ================================================================
-- Agregar campo de mood a sesiones existentes (si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pomodoro_sessions' AND column_name = 'mood'
  ) THEN
    ALTER TABLE pomodoro_sessions ADD COLUMN mood VARCHAR(50);

    ALTER TABLE pomodoro_sessions ADD CONSTRAINT pomodoro_sessions_mood_check CHECK (
      mood IN ('energized', 'calm', 'focused', 'frustrated', 'curious', 'proud', 'overwhelmed', 'playful', 'determined')
    );

    CREATE INDEX idx_pomodoro_sessions_mood ON pomodoro_sessions(mood);
  END IF;

  -- Agregar campo de notas rápidas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pomodoro_sessions' AND column_name = 'quick_notes'
  ) THEN
    ALTER TABLE pomodoro_sessions ADD COLUMN quick_notes TEXT;
  END IF;
END $$;

-- ================================================================
-- 6. RLS (Row Level Security) - DESHABILITADO para desarrollo
-- ================================================================
-- Manteniendo consistencia con el resto de tu base de datos
ALTER TABLE content_blocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE note_links DISABLE ROW LEVEL SECURITY;
ALTER TABLE focus_journals DISABLE ROW LEVEL SECURITY;

-- Políticas preparadas para habilitación futura (comentadas)
/*
-- Habilitar RLS en producción
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_journals ENABLE ROW LEVEL SECURITY;

-- Políticas básicas por perfil
CREATE POLICY "Users can view their own content blocks"
  ON content_blocks FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own content blocks"
  ON content_blocks FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Repetir para note_links y focus_journals...
*/

-- ================================================================
-- 7. DATOS DE EJEMPLO (opcional - comentado)
-- ================================================================
/*
-- Insertar un bloque de ejemplo
INSERT INTO content_blocks (profile_id, block_type, title, content)
VALUES (
  (SELECT id FROM profiles LIMIT 1),
  'text',
  'Mi primera nota',
  '{"text": "Esta es una nota de ejemplo en mi segundo cerebro", "format": {"bold": false}}'
);

-- Insertar un journal de ejemplo
INSERT INTO focus_journals (profile_id, title, entry, mood, energy_level, flow_state_rating)
VALUES (
  (SELECT id FROM profiles LIMIT 1),
  'Descubrimiento sobre algoritmos',
  'Hoy entendí finalmente cómo funciona el merge sort. Me encantó visualizarlo con arrays',
  'curious',
  4,
  5
);
*/

-- ================================================================
-- 8. FUNCIONES AUXILIARES
-- ================================================================

-- Función: Crear enlace bidireccional automáticamente
CREATE OR REPLACE FUNCTION create_bidirectional_link(
  p_profile_id UUID,
  p_source_type VARCHAR,
  p_source_id UUID,
  p_target_type VARCHAR,
  p_target_id UUID,
  p_link_text VARCHAR DEFAULT NULL,
  p_context TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_link_id UUID;
BEGIN
  -- Insertar o actualizar el enlace
  INSERT INTO note_links (
    profile_id, source_type, source_id, target_type, target_id,
    link_text, context, weight, last_referenced_at
  )
  VALUES (
    p_profile_id, p_source_type, p_source_id, p_target_type, p_target_id,
    p_link_text, p_context, 1, NOW()
  )
  ON CONFLICT (profile_id, source_type, source_id, target_type, target_id)
  DO UPDATE SET
    weight = note_links.weight + 1,
    last_referenced_at = NOW(),
    link_text = COALESCE(p_link_text, note_links.link_text),
    context = COALESCE(p_context, note_links.context)
  RETURNING id INTO v_link_id;

  RETURN v_link_id;
END;
$$ LANGUAGE plpgsql;

-- Función: Obtener enlaces de un nodo (para construir el grafo)
CREATE OR REPLACE FUNCTION get_node_connections(
  p_profile_id UUID,
  p_node_type VARCHAR,
  p_node_id UUID
)
RETURNS TABLE(
  link_id UUID,
  connected_type VARCHAR,
  connected_id UUID,
  link_weight INTEGER,
  direction VARCHAR -- 'outgoing' o 'incoming'
) AS $$
BEGIN
  RETURN QUERY
  -- Enlaces salientes
  SELECT
    nl.id as link_id,
    nl.target_type as connected_type,
    nl.target_id as connected_id,
    nl.weight as link_weight,
    'outgoing'::VARCHAR as direction
  FROM note_links nl
  WHERE nl.profile_id = p_profile_id
    AND nl.source_type = p_node_type
    AND nl.source_id = p_node_id

  UNION ALL

  -- Enlaces entrantes
  SELECT
    nl.id as link_id,
    nl.source_type as connected_type,
    nl.source_id as connected_id,
    nl.weight as link_weight,
    'incoming'::VARCHAR as direction
  FROM note_links nl
  WHERE nl.profile_id = p_profile_id
    AND nl.target_type = p_node_type
    AND nl.target_id = p_node_id;
END;
$$ LANGUAGE plpgsql;

-- Función: Buscar nodos por texto (búsqueda full-text)
CREATE OR REPLACE FUNCTION search_knowledge_nodes(
  p_profile_id UUID,
  p_search_term VARCHAR
)
RETURNS TABLE(
  node_type VARCHAR,
  node_id UUID,
  title VARCHAR,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    kn.node_type::VARCHAR,
    kn.node_id,
    kn.title::VARCHAR,
    (
      CASE
        WHEN kn.title ILIKE '%' || p_search_term || '%' THEN 1.0
        ELSE 0.5
      END
    ) as relevance
  FROM knowledge_nodes kn
  WHERE kn.profile_id = p_profile_id
    AND (
      kn.title ILIKE '%' || p_search_term || '%'
    )
  ORDER BY relevance DESC, kn.total_time_seconds DESC;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- FIN DEL SCRIPT
-- ================================================================

-- Comentarios finales:
-- 1. Ejecuta este script completo en tu Supabase SQL Editor
-- 2. Verifica que no hay errores con: SELECT * FROM content_blocks LIMIT 1;
-- 3. Refresca el grafo con: SELECT refresh_knowledge_graph();
-- 4. La independencia de perfiles está garantizada por profile_id en todas las tablas
-- 5. Para producción, habilita RLS y descomenta las políticas

COMMENT ON TABLE content_blocks IS 'Bloques de contenido enriquecido tipo Notion con soporte para bases de datos relacionales';
COMMENT ON TABLE note_links IS 'Enlaces bidireccionales [[]] tipo Obsidian entre entidades del sistema';
COMMENT ON TABLE focus_journals IS 'Journaling de enfoque para reflexionar sobre sesiones de estudio (filosofía Amar el Proceso)';
COMMENT ON MATERIALIZED VIEW knowledge_nodes IS 'Vista materializada para optimizar la visualización del grafo de conocimiento';
