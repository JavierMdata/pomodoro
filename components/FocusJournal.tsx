import React, { useState, useEffect } from 'react';
import {
  Heart, Sparkles, Lightbulb, TrendingUp, Calendar,
  Plus, Search, Filter, Edit, Trash2, BookHeart
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { FocusJournal as FocusJournalType, Mood } from '../types';

// Configuración de moods con colores y emojis
const MOODS: Record<Mood, { emoji: string; color: string; label: string }> = {
  energized: { emoji: '⚡', color: '#F59E0B', label: 'Energizado' },
  calm: { emoji: '😌', color: '#3B82F6', label: 'Tranquilo' },
  focused: { emoji: '🎯', color: '#8B5CF6', label: 'Enfocado' },
  frustrated: { emoji: '😤', color: '#EF4444', label: 'Frustrado' },
  curious: { emoji: '🤔', color: '#EC4899', label: 'Curioso' },
  proud: { emoji: '😊', color: '#10B981', label: 'Orgulloso' },
  overwhelmed: { emoji: '😰', color: '#F97316', label: 'Abrumado' },
  playful: { emoji: '🎨', color: '#06B6D4', label: 'Juguetón' },
  determined: { emoji: '💪', color: '#7C3AED', label: 'Determinado' }
};

export const FocusJournal: React.FC = () => {
  const activeProfileId = useAppStore(state => state.activeProfileId);
  const focusJournals = useAppStore(state => state.focusJournals);
  const addFocusJournal = useAppStore(state => state.addFocusJournal);
  const updateFocusJournal = useAppStore(state => state.updateFocusJournal);
  const deleteFocusJournal = useAppStore(state => state.deleteFocusJournal);
  const getJournalsByMood = useAppStore(state => state.getJournalsByMood);
  const subjects = useAppStore(state => state.subjects);
  const sessions = useAppStore(state => state.sessions);

  const [showNewJournalForm, setShowNewJournalForm] = useState(false);
  const [editingJournal, setEditingJournal] = useState<FocusJournalType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMood, setFilterMood] = useState<Mood | 'all'>('all');

  // Filtrar journals
  const filteredJournals = focusJournals
    .filter(j => j.profile_id === activeProfileId)
    .filter(j => {
      if (filterMood !== 'all' && j.mood !== filterMood) return false;
      if (searchTerm && !j.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !j.entry.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => b.journal_date.localeCompare(a.journal_date));

  if (!activeProfileId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-purple-900">
        <div className="text-center">
          <BookHeart className="w-16 h-16 mx-auto mb-4 text-pink-400" />
          <p className="text-gray-600 dark:text-gray-400">Selecciona un perfil para ver tus journals</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Diario de Enfoque
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Celebra tu proceso de aprendizaje
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowNewJournalForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Nuevo Journal
          </button>
        </div>

        {/* Búsqueda y filtros */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en tus reflexiones..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterMood}
              onChange={(e) => setFilterMood(e.target.value as Mood | 'all')}
              className="px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Todos los moods</option>
              {Object.entries(MOODS).map(([key, { emoji, label }]) => (
                <option key={key} value={key}>
                  {emoji} {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<BookHeart className="w-6 h-6" />}
            label="Total de Journals"
            value={filteredJournals.length}
            color="bg-pink-500"
          />
          <StatCard
            icon={<Sparkles className="w-6 h-6" />}
            label="Mood más frecuente"
            value={getMostFrequentMood()}
            color="bg-purple-500"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Flow State Promedio"
            value={getAverageFlowState().toFixed(1)}
            color="bg-blue-500"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            label="Este Mes"
            value={getThisMonthCount()}
            color="bg-green-500"
          />
        </div>
      </div>

      {/* Lista de journals */}
      <div className="max-w-6xl mx-auto">
        {filteredJournals.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
            <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || filterMood !== 'all'
                ? 'No se encontraron journals con esos filtros'
                : '¡Empieza tu primer journal de enfoque!'}
            </p>
            {!searchTerm && filterMood === 'all' && (
              <button
                onClick={() => setShowNewJournalForm(true)}
                className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
              >
                Crear mi primer journal
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJournals.map(journal => (
              <JournalCard
                key={journal.id}
                journal={journal}
                onEdit={() => setEditingJournal(journal)}
                onDelete={() => deleteFocusJournal(journal.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de nuevo journal */}
      {showNewJournalForm && (
        <JournalFormModal
          onClose={() => setShowNewJournalForm(false)}
          onSave={(data) => {
            addFocusJournal(data);
            setShowNewJournalForm(false);
          }}
        />
      )}

      {/* Modal de edición */}
      {editingJournal && (
        <JournalFormModal
          journal={editingJournal}
          onClose={() => setEditingJournal(null)}
          onSave={(data) => {
            updateFocusJournal(editingJournal.id, data);
            setEditingJournal(null);
          }}
        />
      )}
    </div>
  );

  // Funciones auxiliares
  function getMostFrequentMood(): string {
    if (filteredJournals.length === 0) return '-';

    const moodCounts: Record<string, number> = {};
    filteredJournals.forEach(j => {
      if (j.mood) {
        moodCounts[j.mood] = (moodCounts[j.mood] || 0) + 1;
      }
    });

    const mostFrequent = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
    return mostFrequent ? MOODS[mostFrequent[0] as Mood].emoji : '-';
  }

  function getAverageFlowState(): number {
    if (filteredJournals.length === 0) return 0;

    const total = filteredJournals.reduce((sum, j) => sum + (j.flow_state_rating || 0), 0);
    return total / filteredJournals.length;
  }

  function getThisMonthCount(): number {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    return filteredJournals.filter(j => j.journal_date.startsWith(thisMonth)).length;
  }
};

// Componente de tarjeta de journal
interface JournalCardProps {
  journal: FocusJournalType;
  onEdit: () => void;
  onDelete: () => void;
}

const JournalCard: React.FC<JournalCardProps> = ({ journal, onEdit, onDelete }) => {
  const moodConfig = journal.mood ? MOODS[journal.mood] : null;

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all p-6 border-l-4"
      style={{ borderColor: moodConfig?.color || '#6B7280' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {moodConfig && (
            <span className="text-2xl">{moodConfig.emoji}</span>
          )}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
              {journal.title}
            </h3>
            <p className="text-sm text-gray-500">
              {new Date(journal.journal_date).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
        {journal.entry}
      </p>

      {journal.guided_questions && (
        <div className="space-y-2 text-sm">
          {journal.guided_questions.what_loved && (
            <div className="flex items-start gap-2">
              <Heart className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
              <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                {journal.guided_questions.what_loved}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {journal.energy_level && (
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Energía:</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < journal.energy_level! ? 'text-yellow-500' : 'text-gray-300'}>
                  ⚡
                </span>
              ))}
            </div>
          </div>
        )}

        {journal.flow_state_rating && (
          <div className="flex items-center gap-1 text-sm">
            <span className="text-gray-600 dark:text-gray-400">Flow:</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < journal.flow_state_rating! ? 'text-purple-500' : 'text-gray-300'}>
                  ⭐
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {journal.tags && journal.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {journal.tags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// Modal de formulario de journal
interface JournalFormModalProps {
  journal?: FocusJournalType;
  onClose: () => void;
  onSave: (data: Omit<FocusJournalType, 'id' | 'created_at' | 'updated_at'>) => void;
}

const JournalFormModal: React.FC<JournalFormModalProps> = ({ journal, onClose, onSave }) => {
  const activeProfileId = useAppStore(state => state.activeProfileId)!;

  const [title, setTitle] = useState(journal?.title || '');
  const [entry, setEntry] = useState(journal?.entry || '');
  const [mood, setMood] = useState<Mood | undefined>(journal?.mood);
  const [energyLevel, setEnergyLevel] = useState(journal?.energy_level || 3);
  const [flowState, setFlowState] = useState(journal?.flow_state_rating || 3);
  const [whatLoved, setWhatLoved] = useState(journal?.guided_questions?.what_loved || '');
  const [whatLearned, setWhatLearned] = useState(journal?.guided_questions?.what_learned || '');
  const [whatStruggled, setWhatStruggled] = useState(journal?.guided_questions?.what_struggled || '');
  const [nextSteps, setNextSteps] = useState(journal?.guided_questions?.next_steps || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: Omit<FocusJournalType, 'id' | 'created_at' | 'updated_at'> = {
      profile_id: activeProfileId,
      title,
      entry,
      mood,
      energy_level: energyLevel,
      flow_state_rating: flowState,
      guided_questions: {
        what_loved: whatLoved,
        what_learned: whatLearned,
        what_struggled: whatStruggled,
        next_steps: nextSteps
      },
      journal_date: new Date().toISOString().split('T')[0]
    };

    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            {journal ? 'Editar' : 'Nuevo'} Journal de Enfoque
          </h2>

          {/* Título */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ej: Descubrimiento sobre algoritmos recursivos"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Mood selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ¿Cómo te sentiste?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(MOODS).map(([key, { emoji, label, color }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMood(key as Mood)}
                  className={`
                    p-3 rounded-xl border-2 transition-all
                    ${mood === key
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="text-2xl block mb-1">{emoji}</span>
                  <span className="text-xs text-gray-700 dark:text-gray-300">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reflexión principal */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reflexión
            </label>
            <textarea
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              required
              rows={4}
              placeholder="Escribe sobre tu experiencia de aprendizaje..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Preguntas guiadas */}
          <div className="space-y-3 mb-4">
            <input
              type="text"
              value={whatLoved}
              onChange={(e) => setWhatLoved(e.target.value)}
              placeholder="💖 ¿Qué te apasionó de esta sesión?"
              className="w-full px-4 py-2 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-700 outline-none focus:ring-2 focus:ring-pink-500"
            />
            <input
              type="text"
              value={whatLearned}
              onChange={(e) => setWhatLearned(e.target.value)}
              placeholder="✨ ¿Qué aprendiste?"
              className="w-full px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700 outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              value={whatStruggled}
              onChange={(e) => setWhatStruggled(e.target.value)}
              placeholder="🤔 ¿Con qué luchaste?"
              className="w-full px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              placeholder="🚀 ¿Próximos pasos?"
              className="w-full px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Niveles */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nivel de Energía: {energyLevel}/5
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={energyLevel}
                onChange={(e) => setEnergyLevel(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Flow State: {flowState}/5
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={flowState}
                onChange={(e) => setFlowState(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              {journal ? 'Guardar Cambios' : 'Crear Journal'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente de tarjeta de estadística
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className={`p-3 ${color} text-white rounded-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
};

export default FocusJournal;
