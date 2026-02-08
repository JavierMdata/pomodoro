import React, { useState, useMemo } from 'react';
import {
  Book,
  BookPlus,
  Trash2,
  Edit3,
  Star,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  BookOpen,
  CheckCircle2,
  Pause,
  Play,
  Quote,
  BarChart3,
  Filter,
  Search,
  Plus,
  X,
  BookMarked,
  Award,
  Flame,
  ListOrdered
} from 'lucide-react';
import {
  Book as BookType,
  BookStatus,
  BookGenre,
  BookReadingSession,
  BookQuote,
  CurrentReadingProgress
} from '../types';

interface BooksManagerProps {
  books: BookType[];
  subjects: Array<{ id: string; name: string; color: string }>;
  onAddBook: (book: Partial<BookType>) => void;
  onUpdateBook: (id: string, updates: Partial<BookType>) => void;
  onDeleteBook: (id: string) => void;
  onAddReadingSession: (session: Partial<BookReadingSession>) => void;
  onAddQuote: (quote: Partial<BookQuote>) => void;
  profileId: string;
  theme?: 'dark' | 'light';
}

const statusLabels: Record<BookStatus, string> = {
  not_started: 'No iniciado',
  reading: 'Leyendo',
  paused: 'Pausado',
  completed: 'Completado',
  abandoned: 'Abandonado',
};

const statusIcons = {
  not_started: BookPlus,
  reading: BookOpen,
  paused: Pause,
  completed: CheckCircle2,
  abandoned: X,
};

const genreLabels: Record<BookGenre, string> = {
  ficcion: 'Ficción',
  no_ficcion: 'No Ficción',
  academico: 'Académico',
  tecnico: 'Técnico',
  autoayuda: 'Autoayuda',
  biografia: 'Biografía',
  historia: 'Historia',
  ciencia: 'Ciencia',
  filosofia: 'Filosofía',
  otro: 'Otro',
};

const genreOptions: BookGenre[] = [
  'ficcion', 'no_ficcion', 'academico', 'tecnico', 'autoayuda',
  'biografia', 'historia', 'ciencia', 'filosofia', 'otro',
];

export default function BooksManager({
  books, subjects, onAddBook, onUpdateBook, onDeleteBook,
  onAddReadingSession, onAddQuote, profileId, theme = 'dark',
}: BooksManagerProps) {
  const isDark = theme === 'dark';

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<BookType | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [filterStatus, setFilterStatus] = useState<BookStatus | 'all'>('all');
  const [filterGenre, setFilterGenre] = useState<BookGenre | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [formData, setFormData] = useState<Partial<BookType>>({
    title: '', author: '', total_pages: 100, total_chapters: 0,
    genre: 'ficcion', status: 'not_started', current_page: 0, is_favorite: false,
  });

  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionData, setSessionData] = useState({
    start_page: 0, end_page: 0, duration_minutes: 25,
    chapter_number: undefined as number | undefined, chapter_name: '',
    focus_rating: 4, enjoyment_rating: 4, session_notes: '',
  });

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesStatus = filterStatus === 'all' || book.status === filterStatus;
      const matchesGenre = filterGenre === 'all' || book.genre === filterGenre;
      const matchesSearch = searchTerm === '' ||
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesGenre && matchesSearch;
    });
  }, [books, filterStatus, filterGenre, searchTerm]);

  const stats = useMemo(() => {
    const total = books.length;
    const completed = books.filter((b) => b.status === 'completed').length;
    const reading = books.filter((b) => b.status === 'reading').length;
    const totalPages = books.filter((b) => b.status === 'completed').reduce((sum, b) => sum + b.total_pages, 0);
    const totalTime = books.reduce((sum, b) => sum + b.total_reading_time_minutes, 0);
    const booksWithSpeed = books.filter((b) => b.pages_per_hour);
    const avgSpeed = booksWithSpeed.length > 0
      ? booksWithSpeed.reduce((sum, b) => sum + (b.pages_per_hour || 0), 0) / booksWithSpeed.length : 0;
    const longestStreak = Math.max(...books.map((b) => b.reading_streak_days), 0);
    return { total, completed, reading, totalPages, totalTime, avgSpeed: Math.round(avgSpeed), longestStreak };
  }, [books]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBook) {
      onUpdateBook(editingBook.id, formData);
      setEditingBook(null);
    } else {
      onAddBook({ ...formData, profile_id: profileId });
    }
    setFormData({ title: '', author: '', total_pages: 100, total_chapters: 0, genre: 'ficcion', status: 'not_started', current_page: 0, is_favorite: false });
    setShowAddForm(false);
  };

  const handleEdit = (book: BookType) => {
    setEditingBook(book);
    setFormData(book);
    setShowAddForm(true);
  };

  const handleLogSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;
    onAddReadingSession({
      book_id: selectedBook.id, profile_id: profileId,
      ...sessionData, session_date: new Date().toISOString().split('T')[0],
    });
    setSessionData({ start_page: sessionData.end_page, end_page: sessionData.end_page, duration_minutes: 25,
      chapter_number: undefined, chapter_name: '', focus_rating: 4, enjoyment_rating: 4, session_notes: '' });
    setShowSessionForm(false);
    setSelectedBook(null);
  };

  const calculateProgress = (book: BookType) => Math.round((book.current_page / book.total_pages) * 100);

  const estimatedTimeLeft = (book: BookType) => {
    if (!book.pages_per_hour || book.pages_per_hour === 0) return null;
    const pagesLeft = book.total_pages - book.current_page;
    return Math.round((pagesLeft / book.pages_per_hour) * 60);
  };

  // Theme-aware class helpers
  const cardBg = isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200';
  const cardHover = isDark ? 'hover:border-slate-600' : 'hover:border-slate-300 hover:shadow-md';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const textMuted = isDark ? 'text-slate-500' : 'text-slate-400';
  const inputBg = isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400';
  const modalBg = isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white';

  const getStatusStyle = (status: BookStatus) => {
    const styles = {
      not_started: isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700',
      reading: isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700',
      paused: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700',
      completed: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700',
      abandoned: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700',
    };
    return styles[status];
  };

  const coverGradients = [
    'from-indigo-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-fuchsia-600',
  ];

  const getCoverGradient = (index: number) => coverGradients[index % coverGradients.length];

  return (
    <div className={`space-y-6 ${textPrimary}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl text-white shadow-lg">
            <Book size={24} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Mis Libros</h2>
            <p className={`text-xs sm:text-sm font-medium ${textSecondary}`}>Rastrea tu progreso de lectura</p>
          </div>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setEditingBook(null); setFormData({ title: '', author: '', total_pages: 100, total_chapters: 0, genre: 'ficcion', status: 'not_started', current_page: 0, is_favorite: false }); }}
          className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 font-bold text-sm"
        >
          <Plus size={18} />
          Agregar Libro
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Book, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Completados', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Leyendo', value: stats.reading, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Páginas', value: stats.totalPages.toLocaleString(), icon: BookMarked, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Horas', value: Math.round(stats.totalTime / 60), icon: Clock, color: 'text-pink-500', bg: 'bg-pink-500/10' },
          { label: 'Pág/Hora', value: stats.avgSpeed, icon: TrendingUp, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
          { label: 'Racha', value: `${stats.longestStreak}d`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        ].map((stat, i) => (
          <div key={i} className={`p-3 sm:p-4 rounded-xl border transition-all ${cardBg}`}>
            <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-2`}>
              <stat.icon size={16} strokeWidth={2.5} />
            </div>
            <p className="text-xl sm:text-2xl font-black">{stat.value}</p>
            <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest ${textMuted}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`flex flex-wrap gap-3 items-center p-3 sm:p-4 rounded-xl border ${cardBg}`}>
        <div className="flex-1 min-w-[180px]">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
            <input
              type="text"
              placeholder="Buscar por título o autor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm font-medium outline-none transition-all focus:border-indigo-500 ${inputBg}`}
            />
          </div>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as BookStatus | 'all')}
          className={`px-3 py-2.5 border rounded-xl text-sm font-bold outline-none ${inputBg}`}
        >
          <option value="all">Todos</option>
          {Object.entries(statusLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <select
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value as BookGenre | 'all')}
          className={`px-3 py-2.5 border rounded-xl text-sm font-bold outline-none ${inputBg}`}
        >
          <option value="all">Géneros</option>
          {genreOptions.map((genre) => (
            <option key={genre} value={genre}>{genreLabels[genre]}</option>
          ))}
        </select>

        <div className={`flex gap-1 border rounded-xl p-1 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-500/20 text-indigo-500' : textMuted}`}
          >
            <BarChart3 size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-500/20 text-indigo-500' : textMuted}`}
          >
            <ListOrdered size={16} />
          </button>
        </div>
      </div>

      {/* Book Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBooks.map((book, idx) => {
            const progress = calculateProgress(book);
            const StatusIcon = statusIcons[book.status];
            const timeLeft = estimatedTimeLeft(book);

            return (
              <div key={book.id} className={`rounded-xl border overflow-hidden transition-all group ${cardBg} ${cardHover}`}>
                {/* Cover */}
                <div className={`h-40 sm:h-48 bg-gradient-to-br ${getCoverGradient(idx)} relative overflow-hidden`}>
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Book className="w-16 h-16 text-white/40" />
                    </div>
                  )}
                  {book.is_favorite && (
                    <div className="absolute top-2 right-2 bg-yellow-400 rounded-full p-1.5 shadow-md">
                      <Star className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${getStatusStyle(book.status)}`}>
                      {statusLabels[book.status]}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-black text-sm sm:text-base line-clamp-2">{book.title}</h3>
                    <p className={`text-xs font-medium ${textSecondary}`}>{book.author || 'Autor desconocido'}</p>
                  </div>

                  {book.status !== 'not_started' && (
                    <div>
                      <div className={`flex justify-between text-[10px] font-bold mb-1 ${textMuted}`}>
                        <span>{book.current_page} / {book.total_pages} pág</span>
                        <span className="text-indigo-500">{progress}%</span>
                      </div>
                      <div className={`w-full rounded-full h-1.5 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className={`flex flex-wrap gap-2 text-[10px] font-bold ${textMuted}`}>
                    {book.pages_per_hour && (
                      <span className="flex items-center gap-1"><TrendingUp size={10} />{Math.round(book.pages_per_hour)} pág/h</span>
                    )}
                    {book.reading_streak_days > 0 && (
                      <span className="flex items-center gap-1 text-orange-500"><Flame size={10} />{book.reading_streak_days}d</span>
                    )}
                    {timeLeft && (
                      <span className="flex items-center gap-1"><Clock size={10} />{timeLeft}min</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-transparent group-hover:border-current/5 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => { setSelectedBook(book); setSessionData({ ...sessionData, start_page: book.current_page, end_page: book.current_page }); setShowSessionForm(true); }}
                      className="flex-1 px-3 py-2 bg-indigo-500/10 text-indigo-500 rounded-lg hover:bg-indigo-500/20 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Play size={14} /> Sesión
                    </button>
                    <button onClick={() => handleEdit(book)} className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}>
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => { if (confirm('¿Eliminar este libro?')) onDeleteBook(book.id); }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredBooks.map((book, idx) => {
            const progress = calculateProgress(book);

            return (
              <div key={book.id} className={`p-3 sm:p-4 rounded-xl border flex items-center gap-3 sm:gap-4 transition-all ${cardBg} ${cardHover}`}>
                <div className={`w-12 h-16 sm:w-14 sm:h-20 bg-gradient-to-br ${getCoverGradient(idx)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Book className="w-6 h-6 text-white/50" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <h3 className="font-black text-sm truncate">{book.title}</h3>
                      <p className={`text-xs truncate ${textSecondary}`}>{book.author || 'Autor desconocido'}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black flex-shrink-0 ${getStatusStyle(book.status)}`}>
                      {statusLabels[book.status]}
                    </span>
                  </div>
                  {book.status !== 'not_started' && (
                    <div>
                      <div className={`flex justify-between text-[10px] font-bold mb-1 ${textMuted}`}>
                        <span>{book.current_page}/{book.total_pages} pág ({progress}%)</span>
                        {book.pages_per_hour && <span>{Math.round(book.pages_per_hour)} pág/h</span>}
                      </div>
                      <div className={`w-full rounded-full h-1.5 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => { setSelectedBook(book); setSessionData({ ...sessionData, start_page: book.current_page, end_page: book.current_page }); setShowSessionForm(true); }}
                    className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg hover:bg-indigo-500/20 transition-colors"
                  >
                    <Play size={14} />
                  </button>
                  <button onClick={() => handleEdit(book)} className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-100'}`}>
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => { if (confirm('¿Eliminar este libro?')) onDeleteBook(book.id); }} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredBooks.length === 0 && (
        <div className={`text-center py-12 sm:py-16 rounded-2xl border-2 border-dashed ${isDark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-slate-50'}`}>
          <Book className={`w-14 h-14 mx-auto mb-4 ${textMuted}`} />
          <h3 className="text-lg font-black mb-2">No hay libros</h3>
          <p className={`text-sm mb-6 max-w-md mx-auto px-4 ${textSecondary}`}>
            {searchTerm || filterStatus !== 'all' || filterGenre !== 'all'
              ? 'No se encontraron libros con los filtros seleccionados'
              : 'Comienza agregando tu primer libro'}
          </p>
          {!searchTerm && filterStatus === 'all' && filterGenre === 'all' && (
            <button onClick={() => setShowAddForm(true)} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all">
              <Plus className="w-5 h-5 inline mr-2" /> Agregar Primer Libro
            </button>
          )}
        </div>
      )}

      {/* Modal: Add/Edit Book */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${modalBg} rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>
            <div className={`sticky top-0 ${isDark ? 'bg-slate-900 border-b border-slate-800' : 'bg-white border-b border-slate-200'} px-5 sm:px-6 py-4 flex justify-between items-center rounded-t-2xl`}>
              <h3 className="text-xl font-black">{editingBook ? 'Editar Libro' : 'Agregar Nuevo Libro'}</h3>
              <button onClick={() => { setShowAddForm(false); setEditingBook(null); }} className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${textSecondary}`}>Título *</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 ${inputBg}`} placeholder="ej: Atomic Habits" />
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${textSecondary}`}>Autor</label>
                  <input type="text" value={formData.author || ''} onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 ${inputBg}`} placeholder="ej: James Clear" />
                </div>

                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${textSecondary}`}>Total Páginas *</label>
                  <input type="number" required min="1" value={formData.total_pages} onChange={(e) => setFormData({ ...formData, total_pages: parseInt(e.target.value) })}
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 ${inputBg}`} />
                </div>

                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${textSecondary}`}>Total Capítulos</label>
                  <input type="number" min="0" value={formData.total_chapters || ''} onChange={(e) => setFormData({ ...formData, total_chapters: parseInt(e.target.value) || undefined })}
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 ${inputBg}`} />
                </div>

                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${textSecondary}`}>Género</label>
                  <select value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value as BookGenre })}
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none ${inputBg}`}>
                    {genreOptions.map((genre) => (<option key={genre} value={genre}>{genreLabels[genre]}</option>))}
                  </select>
                </div>

                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${textSecondary}`}>Estado</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as BookStatus })}
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none ${inputBg}`}>
                    {Object.entries(statusLabels).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
                  </select>
                </div>

                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${textSecondary}`}>ISBN (opcional)</label>
                  <input type="text" value={formData.isbn || ''} onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 ${inputBg}`} placeholder="978-0735211292" />
                </div>

                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${textSecondary}`}>Meta diaria (pág)</label>
                  <input type="number" min="0" value={formData.daily_pages_goal || ''} onChange={(e) => setFormData({ ...formData, daily_pages_goal: parseInt(e.target.value) || undefined })}
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 ${inputBg}`} placeholder="30" />
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${textSecondary}`}>Materia relacionada</label>
                  <select value={formData.subject_id || ''} onChange={(e) => setFormData({ ...formData, subject_id: e.target.value || undefined })}
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none ${inputBg}`}>
                    <option value="">Sin materia</option>
                    {subjects.map((subject) => (<option key={subject.id} value={subject.id}>{subject.name}</option>))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_favorite || false} onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500" />
                    <span className="text-sm font-bold">Favorito</span>
                    <Star className="w-4 h-4 text-yellow-500" />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowAddForm(false); setEditingBook(null); }}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all">
                  {editingBook ? 'Guardar Cambios' : 'Agregar Libro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reading Session */}
      {showSessionForm && selectedBook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${modalBg} rounded-2xl max-w-lg w-full shadow-2xl`}>
            <div className={`${isDark ? 'border-b border-slate-800' : 'border-b border-slate-200'} px-5 sm:px-6 py-4 flex justify-between items-center`}>
              <div>
                <h3 className="text-lg font-black">Registrar Sesión</h3>
                <p className={`text-xs font-medium ${textSecondary}`}>{selectedBook.title}</p>
              </div>
              <button onClick={() => { setShowSessionForm(false); setSelectedBook(null); }} className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLogSession} className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${textSecondary}`}>Pág. Inicial *</label>
                  <input type="number" required min="0" max={selectedBook.total_pages} value={sessionData.start_page}
                    onChange={(e) => setSessionData({ ...sessionData, start_page: parseInt(e.target.value) })}
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none focus:border-indigo-500 ${inputBg}`} />
                </div>
                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${textSecondary}`}>Pág. Final *</label>
                  <input type="number" required min={sessionData.start_page} max={selectedBook.total_pages} value={sessionData.end_page}
                    onChange={(e) => setSessionData({ ...sessionData, end_page: parseInt(e.target.value) })}
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none focus:border-indigo-500 ${inputBg}`} />
                </div>

                <div className="col-span-2">
                  <div className={`p-3 rounded-xl text-sm font-bold text-center ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                    Páginas leídas: {Math.max(0, sessionData.end_page - sessionData.start_page)}
                  </div>
                </div>

                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${textSecondary}`}>Duración (min) *</label>
                  <input type="number" required min="1" value={sessionData.duration_minutes}
                    onChange={(e) => setSessionData({ ...sessionData, duration_minutes: parseInt(e.target.value) })}
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none focus:border-indigo-500 ${inputBg}`} />
                </div>
                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${textSecondary}`}>Capítulo #</label>
                  <input type="number" min="0" value={sessionData.chapter_number || ''}
                    onChange={(e) => setSessionData({ ...sessionData, chapter_number: parseInt(e.target.value) || undefined })}
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none focus:border-indigo-500 ${inputBg}`} />
                </div>

                <div className="col-span-2">
                  <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${textSecondary}`}>Nombre capítulo</label>
                  <input type="text" value={sessionData.chapter_name}
                    onChange={(e) => setSessionData({ ...sessionData, chapter_name: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 ${inputBg}`} placeholder="ej: Introducción" />
                </div>

                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${textSecondary}`}>Enfoque</label>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" onClick={() => setSessionData({ ...sessionData, focus_rating: n })}
                        className={`w-8 h-8 rounded-lg font-black text-xs transition-all ${sessionData.focus_rating >= n ? 'bg-indigo-500 text-white' : isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${textSecondary}`}>Disfrute</label>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" onClick={() => setSessionData({ ...sessionData, enjoyment_rating: n })}
                        className={`w-8 h-8 rounded-lg font-black text-xs transition-all ${sessionData.enjoyment_rating >= n ? 'bg-purple-500 text-white' : isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className={`block text-[10px] font-black uppercase tracking-wider mb-1.5 ${textSecondary}`}>Notas</label>
                  <textarea value={sessionData.session_notes} rows={2}
                    onChange={(e) => setSessionData({ ...sessionData, session_notes: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl text-sm font-medium outline-none focus:border-indigo-500 resize-none ${inputBg}`} placeholder="¿Qué aprendiste?" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowSessionForm(false); setSelectedBook(null); }}
                  className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  Cancelar
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all">
                  Guardar Sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
