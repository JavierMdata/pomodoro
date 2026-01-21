import React, { useState, useEffect, useRef, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import {
  Network, ZoomIn, ZoomOut, Maximize2, Filter,
  BookOpen, CheckSquare, FileText, Lightbulb, Book
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { EntityType, GraphData } from '../types';

interface KnowledgeGraphProps {
  height?: number;
  onNodeClick?: (nodeId: string, nodeType: EntityType) => void;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  height = 600,
  onNodeClick
}) => {
  const activeProfileId = useAppStore(state => state.activeProfileId);
  const knowledgeNodes = useAppStore(state => state.knowledgeNodes);
  const noteLinks = useAppStore(state => state.noteLinks);
  const subjects = useAppStore(state => state.subjects);
  const refreshKnowledgeGraph = useAppStore(state => state.refreshKnowledgeGraph);

  const graphRef = useRef<any>();
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [filterType, setFilterType] = useState<EntityType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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

    // Crear nodos
    const nodes = filteredNodes.map(node => ({
      id: `${node.node_type}:${node.node_id}`,
      name: node.title,
      type: node.node_type,
      color: node.color || '#6B7280',
      size: Math.max(3, node.node_size * 2), // Escalar tamaño para visibilidad
      icon: node.icon,
      metadata: {
        totalTime: node.total_time_seconds,
        sessionCount: node.session_count,
        focusRating: node.avg_focus_rating
      }
    }));

    // Crear enlaces (solo entre nodos visibles)
    const nodeIds = new Set(nodes.map(n => n.id));
    const links = noteLinks
      .filter(link => link.profile_id === activeProfileId)
      .map(link => {
        const sourceId = `${link.source_type}:${link.source_id}`;
        const targetId = `${link.target_type}:${link.target_id}`;

        // Solo incluir si ambos nodos están visibles
        if (!nodeIds.has(sourceId) || !nodeIds.has(targetId)) {
          return null;
        }

        return {
          source: sourceId,
          target: targetId,
          weight: link.weight,
          color: `rgba(100, 100, 100, ${Math.min(0.8, link.weight / 10)})`
        };
      })
      .filter(link => link !== null) as GraphData['links'];

    return { nodes, links };
  }, [knowledgeNodes, noteLinks, activeProfileId, filterType, searchTerm]);

  // Funciones de control de zoom
  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() * 1.2);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(graphRef.current.zoom() / 1.2);
    }
  };

  const handleResetView = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400);
    }
  };

  // Renderizar nodo personalizado
  const paintNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px Inter, sans-serif`;

    // Dibujar círculo del nodo
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color;
    ctx.fill();

    // Borde más grueso si está seleccionado
    if (selectedNode && selectedNode.id === node.id) {
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();
    }

    // Etiqueta del nodo
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1F2937';
    ctx.fillText(label, node.x, node.y + node.size + fontSize);
  };

  // Manejar click en nodo
  const handleNodeClickInternal = (node: any) => {
    setSelectedNode(node);

    if (onNodeClick) {
      const [type, id] = node.id.split(':');
      onNodeClick(id, type as EntityType);
    }
  };

  if (!activeProfileId) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-100 dark:bg-gray-900 rounded-2xl">
        <div className="text-center text-gray-500">
          <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Selecciona un perfil para ver el grafo de conocimiento</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-100 dark:bg-gray-900 rounded-2xl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Construyendo tu mapa de conocimiento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header con controles */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-white/95 to-transparent dark:from-gray-800/95">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Mapa de Conocimiento
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {graphData.nodes.length} nodos · {graphData.links.length} conexiones
              </p>
            </div>
          </div>

          {/* Búsqueda */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar nodos..."
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 mt-3">
          <FilterButton
            label="Todo"
            active={filterType === 'all'}
            onClick={() => setFilterType('all')}
            count={knowledgeNodes.length}
          />
          <FilterButton
            label="Materias"
            active={filterType === 'subject'}
            onClick={() => setFilterType('subject')}
            icon={<BookOpen className="w-3 h-3" />}
            count={knowledgeNodes.filter(n => n.node_type === 'subject').length}
          />
          <FilterButton
            label="Tareas"
            active={filterType === 'task'}
            onClick={() => setFilterType('task')}
            icon={<CheckSquare className="w-3 h-3" />}
            count={knowledgeNodes.filter(n => n.node_type === 'task').length}
          />
          <FilterButton
            label="Journals"
            active={filterType === 'focus_journal'}
            onClick={() => setFilterType('focus_journal')}
            icon={<Lightbulb className="w-3 h-3" />}
            count={knowledgeNodes.filter(n => n.node_type === 'focus_journal').length}
          />
          <FilterButton
            label="Materiales"
            active={filterType === 'material'}
            onClick={() => setFilterType('material')}
            icon={<Book className="w-3 h-3" />}
            count={knowledgeNodes.filter(n => n.node_type === 'material').length}
          />
        </div>
      </div>

      {/* Grafo */}
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeLabel="name"
        nodeCanvasObject={paintNode}
        onNodeClick={handleNodeClickInternal}
        linkColor={link => (link as any).color}
        linkWidth={link => Math.max(1, (link as any).weight / 2)}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        width={window.innerWidth - 100}
        height={height}
        backgroundColor="#F9FAFB"
        cooldownTicks={100}
        onEngineStop={() => graphRef.current?.zoomToFit(400)}
      />

      {/* Controles de zoom */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
          title="Acercar"
        >
          <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
          title="Alejar"
        >
          <ZoomOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <button
          onClick={handleResetView}
          className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
          title="Ajustar vista"
        >
          <Maximize2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Panel de detalles del nodo seleccionado */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 z-10 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedNode.color }}
                ></div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                  {selectedNode.type}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {selectedNode.name}
              </h3>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tiempo dedicado:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {Math.floor(selectedNode.metadata.totalTime / 60)} min
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Sesiones:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedNode.metadata.sessionCount}
              </span>
            </div>
            {selectedNode.metadata.focusRating > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Enfoque promedio:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {selectedNode.metadata.focusRating.toFixed(1)}/5
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 text-xs shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Leyenda</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: subjects[0]?.color || '#8B5CF6' }}></div>
            <span className="text-gray-600 dark:text-gray-400">Tamaño = Tiempo Pomodoro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 bg-gray-400"></div>
            <span className="text-gray-600 dark:text-gray-400">Grosor = Fuerza de enlace</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para botones de filtro
interface FilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  count?: number;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  label,
  active,
  onClick,
  icon,
  count
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
        ${active
          ? 'bg-blue-500 text-white shadow-md'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }
      `}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span className={`
          ml-1 px-1.5 py-0.5 rounded text-xs
          ${active ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}
        `}>
          {count}
        </span>
      )}
    </button>
  );
};

export default KnowledgeGraph;
