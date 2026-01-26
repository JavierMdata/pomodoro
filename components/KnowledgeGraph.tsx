import React, { useState, useEffect, useRef, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import {
  Network, ZoomIn, ZoomOut, Maximize2, Search, X,
  BookOpen, CheckSquare, FileText, Lightbulb, Book,
  Play, Edit2, Clock, Target, ChevronRight, Loader2
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { EntityType, GraphData } from '../types';

interface KnowledgeGraphProps {
  height?: number;
  onNodeClick?: (nodeId: string, nodeType: EntityType) => void;
}

// Colores para cada tipo de nodo
const NODE_COLORS = {
  subject: { bg: '#3B82F6', glow: 'rgba(59, 130, 246, 0.6)', label: 'Materia' },
  task: { bg: '#10B981', glow: 'rgba(16, 185, 129, 0.5)', label: 'Tarea' },
  exam: { bg: '#F97316', glow: 'rgba(249, 115, 22, 0.6)', label: 'Examen' },
  exam_topic: { bg: '#A855F7', glow: 'rgba(168, 85, 247, 0.5)', label: 'Tema' },
  material: { bg: '#06B6D4', glow: 'rgba(6, 182, 212, 0.5)', label: 'Material' },
  focus_journal: { bg: '#EC4899', glow: 'rgba(236, 72, 153, 0.5)', label: 'Journal' },
  content_block: { bg: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.5)', label: 'Nota' },
  book: { bg: '#F59E0B', glow: 'rgba(245, 158, 11, 0.5)', label: 'Libro' },
};

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  height,
  onNodeClick
}) => {
  const { theme, activeProfileId, sessions } = useAppStore();
  const knowledgeNodes = useAppStore(state => state.knowledgeNodes);
  const noteLinks = useAppStore(state => state.noteLinks);
  const subjects = useAppStore(state => state.subjects);
  const tasks = useAppStore(state => state.tasks);
  const exams = useAppStore(state => state.exams);
  const examTopics = useAppStore(state => state.examTopics);
  const refreshKnowledgeGraph = useAppStore(state => state.refreshKnowledgeGraph);

  const graphRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [filterType, setFilterType] = useState<EntityType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Actualizar dimensiones del contenedor
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width || 800,
          height: height || window.innerHeight - 200
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height]);

  // Cargar grafo al montar
  useEffect(() => {
    const loadGraph = async () => {
      setIsLoading(true);
      await refreshKnowledgeGraph();
      setIsLoading(false);
    };

    if (activeProfileId) {
      loadGraph();
    }
  }, [activeProfileId]);

  // Construir datos del grafo
  const graphData: GraphData = useMemo(() => {
    if (!activeProfileId) {
      return { nodes: [], links: [] };
    }

    // Filtrar nodos según filtros activos
    let filteredNodes = knowledgeNodes.filter(n => n.profile_id === activeProfileId);

    if (filterType !== 'all') {
      filteredNodes = filteredNodes.filter(n => n.node_type === filterType);
    }

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filteredNodes = filteredNodes.filter(n =>
        n.title.toLowerCase().includes(lowerSearch)
      );
    }

    // Crear nodos con colores y tamaños
    const nodes = filteredNodes.map(node => {
      const nodeColor = NODE_COLORS[node.node_type as keyof typeof NODE_COLORS] || NODE_COLORS.subject;
      return {
        id: `${node.node_type}:${node.node_id}`,
        name: node.title,
        type: node.node_type,
        color: node.color || nodeColor.bg,
        glow: nodeColor.glow,
        size: Math.max(4, Math.min(20, node.node_size * 3)),
        icon: node.icon,
        metadata: {
          totalTime: node.total_time_seconds,
          sessionCount: node.session_count,
          focusRating: node.avg_focus_rating
        }
      };
    });

    // Crear enlaces
    const nodeIds = new Set(nodes.map(n => n.id));
    const links = noteLinks
      .filter(link => link.profile_id === activeProfileId)
      .map(link => {
        const sourceId = `${link.source_type}:${link.source_id}`;
        const targetId = `${link.target_type}:${link.target_id}`;

        if (!nodeIds.has(sourceId) || !nodeIds.has(targetId)) {
          return null;
        }

        return {
          source: sourceId,
          target: targetId,
          weight: link.weight,
          color: theme === 'dark' ? 'rgba(100, 100, 150, 0.4)' : 'rgba(100, 100, 100, 0.3)'
        };
      })
      .filter(link => link !== null) as GraphData['links'];

    return { nodes, links };
  }, [knowledgeNodes, noteLinks, activeProfileId, filterType, searchTerm, theme]);

  // Funciones de control
  const handleZoomIn = () => graphRef.current?.zoom(graphRef.current.zoom() * 1.3);
  const handleZoomOut = () => graphRef.current?.zoom(graphRef.current.zoom() / 1.3);
  const handleResetView = () => graphRef.current?.zoomToFit(400, 50);

  // Renderizar nodo con glow
  const paintNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const size = node.size || 6;
    const isSelected = selectedNode?.id === node.id;

    // Glow effect
    if (isSelected || node.metadata?.sessionCount > 0) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 4, 0, 2 * Math.PI);
      ctx.fillStyle = node.glow || 'rgba(99, 102, 241, 0.3)';
      ctx.fill();
    }

    // Círculo principal
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = node.color;
    ctx.fill();

    // Borde
    ctx.strokeStyle = theme === 'dark' ? '#1e1e2e' : '#ffffff';
    ctx.lineWidth = 2 / globalScale;
    ctx.stroke();

    // Borde de selección
    if (isSelected) {
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 3 / globalScale;
      ctx.stroke();
    }

    // Label (solo si zoom suficiente)
    if (globalScale > 0.7) {
      const label = node.name.length > 20 ? node.name.substring(0, 18) + '...' : node.name;
      const fontSize = Math.max(10, 12 / globalScale);
      ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // Background del label
      const textWidth = ctx.measureText(label).width;
      const padding = 4;
      ctx.fillStyle = theme === 'dark' ? 'rgba(16, 16, 34, 0.9)' : 'rgba(255, 255, 255, 0.95)';
      ctx.fillRect(
        node.x - textWidth / 2 - padding,
        node.y + size + 4,
        textWidth + padding * 2,
        fontSize + padding
      );

      // Texto
      ctx.fillStyle = theme === 'dark' ? '#e2e8f0' : '#1e293b';
      ctx.fillText(label, node.x, node.y + size + 6);
    }
  };

  // Click en nodo
  const handleNodeClickInternal = (node: any) => {
    setSelectedNode(node);
    if (onNodeClick) {
      const [type, id] = node.id.split(':');
      onNodeClick(id, type as EntityType);
    }
  };

  // Formatear tiempo
  const formatTime = (seconds: number) => {
    if (!seconds) return '0 min';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  // Obtener info adicional del nodo seleccionado
  const getNodeDetails = () => {
    if (!selectedNode) return null;
    const [type, id] = selectedNode.id.split(':');

    let additionalInfo: any = {};

    if (type === 'subject') {
      const subject = subjects.find(s => s.id === id);
      additionalInfo = {
        professor: subject?.professor_name,
        classroom: subject?.classroom
      };
    } else if (type === 'exam') {
      const exam = exams.find(e => e.id === id);
      const subject = subjects.find(s => s.id === exam?.subject_id);
      additionalInfo = {
        subject: subject?.name,
        date: exam?.exam_date
      };
    }

    return additionalInfo;
  };

  const isDark = theme === 'dark';

  if (!activeProfileId) {
    return (
      <div className={`flex items-center justify-center h-[600px] rounded-2xl ${isDark ? 'bg-[#101022]' : 'bg-slate-100'}`}>
        <div className="text-center">
          <Network className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
          <p className={isDark ? 'text-slate-500' : 'text-slate-600'}>Selecciona un perfil para ver el grafo</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-[600px] rounded-2xl ${isDark ? 'bg-[#101022]' : 'bg-slate-100'}`}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Construyendo mapa de conocimiento...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl ${isDark ? 'bg-[#101022]' : 'bg-slate-50'}`}
      style={{ height: dimensions.height }}
    >
      {/* Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundSize: '40px 40px',
          backgroundImage: isDark
            ? 'linear-gradient(to right, #232348 1px, transparent 1px), linear-gradient(to bottom, #232348 1px, transparent 1px)'
            : 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)'
        }}
      />

      {/* Grafo */}
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeCanvasObject={paintNode}
        onNodeClick={handleNodeClickInternal}
        linkColor={(link: any) => link.color}
        linkWidth={(link: any) => Math.max(1, (link.weight || 1) / 2)}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.003}
        linkDirectionalParticleWidth={2}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="transparent"
        cooldownTicks={100}
        onEngineStop={() => graphRef.current?.zoomToFit(400, 80)}
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />

      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 pointer-events-auto">
          {/* Search */}
          <div className={`flex-1 shadow-lg rounded-xl ${isDark ? 'shadow-black/20' : 'shadow-black/5'}`}>
            <div className={`flex items-center h-12 rounded-xl border transition-colors ${
              isDark
                ? 'bg-[#1e2036] border-[#2e3152] focus-within:border-indigo-500'
                : 'bg-white border-slate-200 focus-within:border-indigo-500'
            }`}>
              <Search className={`ml-4 w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar nodos..."
                className={`flex-1 bg-transparent border-none outline-none h-full px-3 text-sm ${
                  isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'
                }`}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="mr-3 text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            <FilterChip
              label="Materias"
              color="#3B82F6"
              active={filterType === 'subject'}
              onClick={() => setFilterType(filterType === 'subject' ? 'all' : 'subject')}
              theme={theme}
            />
            <FilterChip
              label="Tareas"
              color="#10B981"
              active={filterType === 'task'}
              onClick={() => setFilterType(filterType === 'task' ? 'all' : 'task')}
              theme={theme}
            />
            <FilterChip
              label="Exámenes"
              color="#F97316"
              active={filterType === 'exam' || filterType === 'exam_topic'}
              onClick={() => setFilterType(filterType === 'exam' ? 'all' : 'exam')}
              theme={theme}
            />
            <FilterChip
              label="Temas"
              color="#A855F7"
              active={filterType === 'exam_topic'}
              onClick={() => setFilterType(filterType === 'exam_topic' ? 'all' : 'exam_topic')}
              theme={theme}
            />
          </div>
        </div>
      </div>

      {/* Zoom Controls - Bottom Left */}
      <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-2">
        <div className={`rounded-xl border shadow-lg flex flex-col p-1 ${
          isDark ? 'bg-[#1e2036] border-[#2e3152]' : 'bg-white border-slate-200'
        }`}>
          <button
            onClick={handleZoomIn}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-[#2a2d48] text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-indigo-600'
            }`}
          >
            <ZoomIn size={20} />
          </button>
          <div className={`h-px mx-2 ${isDark ? 'bg-[#2e3152]' : 'bg-slate-200'}`} />
          <button
            onClick={handleZoomOut}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-[#2a2d48] text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-indigo-600'
            }`}
          >
            <ZoomOut size={20} />
          </button>
        </div>
        <button
          onClick={handleResetView}
          className={`rounded-xl border p-2 shadow-lg transition-colors ${
            isDark
              ? 'bg-[#1e2036] border-[#2e3152] text-slate-400 hover:text-white'
              : 'bg-white border-slate-200 text-slate-500 hover:text-indigo-600'
          }`}
          title="Centrar vista"
        >
          <Maximize2 size={20} />
        </button>
      </div>

      {/* Legend - Bottom Right */}
      <div className={`absolute bottom-6 right-6 z-10 hidden sm:block ${selectedNode ? 'sm:hidden' : ''}`}>
        <div className={`backdrop-blur-md rounded-xl border p-3 shadow-lg ${
          isDark ? 'bg-[#1e2036]/80 border-[#2e3152]' : 'bg-white/80 border-slate-200'
        }`}>
          <div className={`flex items-center gap-4 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>Materia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Tarea</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>Examen</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Tema</span>
            </div>
          </div>
        </div>
      </div>

      {/* Node Details Panel - Floating Right */}
      {selectedNode && (
        <aside className={`absolute top-4 bottom-4 right-4 w-80 rounded-xl border shadow-2xl z-20 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 ${
          isDark ? 'bg-[#1e2036] border-[#2e3152]' : 'bg-white border-slate-200'
        }`}>
          {/* Header */}
          <div className={`p-5 border-b flex justify-between items-start ${
            isDark ? 'border-[#2e3152] bg-[#1a1c30]' : 'border-slate-100 bg-slate-50/50'
          }`}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide border"
                  style={{
                    backgroundColor: `${selectedNode.color}20`,
                    color: selectedNode.color,
                    borderColor: `${selectedNode.color}40`
                  }}
                >
                  {NODE_COLORS[selectedNode.type as keyof typeof NODE_COLORS]?.label || selectedNode.type}
                </span>
                {selectedNode.metadata?.sessionCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide border ${
                    isDark
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  }`}>
                    Activo
                  </span>
                )}
              </div>
              <h2 className={`text-xl font-bold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {selectedNode.name}
              </h2>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className={`transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#161828] border-[#2e3152]' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className={`flex items-center gap-1.5 mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Clock size={14} />
                  <span className="text-[10px] font-medium uppercase tracking-wider">Tiempo Total</span>
                </div>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {formatTime(selectedNode.metadata?.totalTime || 0)}
                </p>
              </div>
              <div className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#161828] border-[#2e3152]' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className={`flex items-center gap-1.5 mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Target size={14} />
                  <span className="text-[10px] font-medium uppercase tracking-wider">Enfoque</span>
                </div>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {selectedNode.metadata?.focusRating > 0 ? `${(selectedNode.metadata.focusRating * 20).toFixed(0)}%` : '-'}
                </p>
              </div>
            </div>

            {/* Sessions */}
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <h3 className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  Sesiones de Estudio
                </h3>
                <span className="text-xs font-medium text-indigo-500">
                  {selectedNode.metadata?.sessionCount || 0} sesiones
                </span>
              </div>
              <div className={`w-full rounded-full h-2 overflow-hidden ${isDark ? 'bg-[#161828]' : 'bg-slate-100'}`}>
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (selectedNode.metadata?.sessionCount || 0) * 10)}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className={`text-sm space-y-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <p>
                <span className="font-medium">Tamaño del nodo:</span> basado en tiempo de estudio
              </p>
              <p>
                <span className="font-medium">Conexiones:</span> enlaces con otros temas relacionados
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className={`p-5 border-t ${isDark ? 'border-[#2e3152] bg-[#1a1c30]' : 'border-slate-100 bg-slate-50/50'}`}>
            <button className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2">
              <Play size={18} />
              Iniciar Sesión
            </button>
            <button className={`w-full mt-2 h-8 text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'
            }`}>
              <Edit2 size={14} />
              Ver Detalles
            </button>
          </div>
        </aside>
      )}

      {/* Stats Badge */}
      <div className={`absolute top-4 left-4 z-10 px-4 py-2 rounded-xl backdrop-blur-md border shadow-lg ${
        isDark ? 'bg-[#1e2036]/80 border-[#2e3152]' : 'bg-white/80 border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <Network size={18} className="text-indigo-500" />
          <div>
            <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {graphData.nodes.length} nodos
            </p>
            <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {graphData.links.length} conexiones
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Filter Chip Component
interface FilterChipProps {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
  theme: string;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, color, active, onClick, theme }) => {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 h-10 px-4 rounded-xl border transition-all whitespace-nowrap ${
        active
          ? 'text-white shadow-md'
          : isDark
            ? 'bg-[#1e2036] border-[#2e3152] text-slate-300 hover:bg-[#2a2d48]'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
      style={active ? {
        backgroundColor: color,
        borderColor: color,
        boxShadow: `0 4px 14px ${color}40`
      } : {}}
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: active ? '#fff' : color }}
      />
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
};

export default KnowledgeGraph;
