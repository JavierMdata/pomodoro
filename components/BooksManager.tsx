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
}

const statusColors = {
  not_started: 'bg-gray-100 text-gray-700',
  reading: 'bg-blue-100 text-blue-700',
  paused: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  abandoned: 'bg-red-100 text-red-700',
};

const statusIcons = {
  not_started: BookPlus,
  reading: BookOpen,
  paused: Pause,
  completed: CheckCircle2,
  abandoned: X,
};

const genreOptions: BookGenre[] = [
  'ficcion',
  'no_ficcion',
  'academico',
  'tecnico',
  'autoayuda',
  'biografia',
  'historia',
  'ciencia',
  'filosofia',
  'otro',
];

export default function BooksManager({
  books,
  subjects,
  onAddBook,
  onUpdateBook,
  onDeleteBook,
  onAddReadingSession,
  onAddQuote,
  profileId,
}: BooksManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<BookType | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [filterStatus, setFilterStatus] = useState<BookStatus | 'all'>('all');
  const [filterGenre, setFilterGenre] = useState<BookGenre | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Formulario
  const [formData, setFormData] = useState<Partial<BookType>>({
    title: '',
    author: '',
    total_pages: 100,
    total_chapters: 0,
    genre: 'ficcion',
    status: 'not_started',
    current_page: 0,
    is_favorite: false,
  });

  // Formulario de sesión de lectura
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionData, setSessionData] = useState({
    start_page: 0,
    end_page: 0,
    duration_minutes: 25,
    chapter_number: undefined as number | undefined,
    chapter_name: '',
    focus_rating: 4,
    enjoyment_rating: 4,
    session_notes: '',
  });

  // Filtrar libros
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesStatus = filterStatus === 'all' || book.status === filterStatus;
      const matchesGenre = filterGenre === 'all' || book.genre === filterGenre;
      const matchesSearch =
        searchTerm === '' ||
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesGenre && matchesSearch;
    });
  }, [books, filterStatus, filterGenre, searchTerm]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = books.length;
    const completed = books.filter((b) => b.status === 'completed').length;
    const reading = books.filter((b) => b.status === 'reading').length;
    const totalPages = books
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + b.total_pages, 0);
    const totalTime = books.reduce((sum, b) => sum + b.total_reading_time_minutes, 0);
    const avgSpeed = books
      .filter((b) => b.pages_per_hour)
      .reduce((sum, b) => sum + (b.pages_per_hour || 0), 0) / books.filter((b) => b.pages_per_hour).length || 0;
    const longestStreak = Math.max(...books.map((b) => b.reading_streak_days), 0);

    return {
      total,
      completed,
      reading,
      totalPages,
      totalTime,
      avgSpeed: Math.round(avgSpeed),
      longestStreak,
    };
  }, [books]);

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBook) {
      onUpdateBook(editingBook.id, formData);
      setEditingBook(null);
    } else {
      onAddBook({ ...formData, profile_id: profileId });
    }
    setFormData({
      title: '',
      author: '',
      total_pages: 100,
      total_chapters: 0,
      genre: 'ficcion',
      status: 'not_started',
      current_page: 0,
      is_favorite: false,
    });
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
      book_id: selectedBook.id,
      profile_id: profileId,
      ...sessionData,
      session_date: new Date().toISOString().split('T')[0],
    });

    setSessionData({
      start_page: sessionData.end_page,
      end_page: sessionData.end_page,
      duration_minutes: 25,
      chapter_number: undefined,
      chapter_name: '',
      focus_rating: 4,
      enjoyment_rating: 4,
      session_notes: '',
    });
    setShowSessionForm(false);
    setSelectedBook(null);
  };

  const calculateProgress = (book: BookType) => {
    return Math.round((book.current_page / book.total_pages) * 100);
  };

  const estimatedTimeLeft = (book: BookType) => {
    if (!book.pages_per_hour || book.pages_per_hour === 0) return null;
    const pagesLeft = book.total_pages - book.current_page;
    const hoursLeft = pagesLeft / book.pages_per_hour;
    return Math.round(hoursLeft * 60); // minutos
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Book className="w-7 h-7 text-blue-600" />
              Mis Libros
            </h2>
            <p className="text-gray-600">Rastrea tu progreso de lectura y evolución</p>
          </div>
          <button
            onClick={() => {
              setShowAddForm(true);
              setEditingBook(null);
              setFormData({
                title: '',
                author: '',
                total_pages: 100,
                total_chapters: 0,
                genre: 'ficcion',
                status: 'not_started',
                current_page: 0,
                is_favorite: false,
              });
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Agregar Libro
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <Book className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Completados</p>
                <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Leyendo</p>
                <p className="text-2xl font-bold text-purple-900">{stats.reading}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 font-medium">Páginas</p>
                <p className="text-2xl font-bold text-amber-900">{stats.totalPages.toLocaleString()}</p>
              </div>
              <BookMarked className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-pink-600 font-medium">Horas</p>
                <p className="text-2xl font-bold text-pink-900">{Math.round(stats.totalTime / 60)}</p>
              </div>
              <Clock className="w-8 h-8 text-pink-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-600 font-medium">Pág/Hora</p>
                <p className="text-2xl font-bold text-indigo-900">{stats.avgSpeed}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-indigo-400" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Racha</p>
                <p className="text-2xl font-bold text-orange-900">{stats.longestStreak} días</p>
              </div>
              <Flame className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-lg border">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título o autor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as BookStatus | 'all')}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los estados</option>
          <option value="not_started">No iniciado</option>
          <option value="reading">Leyendo</option>
          <option value="paused">Pausado</option>
          <option value="completed">Completado</option>
          <option value="abandoned">Abandonado</option>
        </select>

        <select
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value as BookGenre | 'all')}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los géneros</option>
          {genreOptions.map((genre) => (
            <option key={genre} value={genre}>
              {genre.charAt(0).toUpperCase() + genre.slice(1)}
            </option>
          ))}
        </select>

        <div className="flex gap-2 border rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
          >
            <BarChart3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
          >
            <ListOrdered className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Lista de libros */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => {
            const progress = calculateProgress(book);
            const StatusIcon = statusIcons[book.status];
            const timeLeft = estimatedTimeLeft(book);

            return (
              <div
                key={book.id}
                className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Cover/Header */}
                <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 rounded-t-lg relative overflow-hidden">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Book className="w-20 h-20 text-white opacity-50" />
                    </div>
                  )}
                  {book.is_favorite && (
                    <div className="absolute top-2 right-2 bg-yellow-400 rounded-full p-2">
                      <Star className="w-4 h-4 text-white fill-white" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[book.status]}`}>
                      <StatusIcon className="w-3 h-3 inline mr-1" />
                      {book.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{book.title}</h3>
                    <p className="text-sm text-gray-600">{book.author || 'Autor desconocido'}</p>
                  </div>

                  {/* Progress Bar */}
                  {book.status !== 'not_started' && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>
                          {book.current_page} / {book.total_pages} páginas
                        </span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex gap-3 text-xs text-gray-600">
                    {book.pages_per_hour && (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {Math.round(book.pages_per_hour)} pág/h
                      </div>
                    )}
                    {book.reading_streak_days > 0 && (
                      <div className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-500" />
                        {book.reading_streak_days} días
                      </div>
                    )}
                    {timeLeft && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeLeft}min
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setSelectedBook(book);
                        setSessionData({
                          ...sessionData,
                          start_page: book.current_page,
                          end_page: book.current_page,
                        });
                        setShowSessionForm(true);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <Play className="w-4 h-4" />
                      Sesión
                    </button>
                    <button
                      onClick={() => handleEdit(book)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('¿Eliminar este libro?')) onDeleteBook(book.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredBooks.map((book) => {
            const progress = calculateProgress(book);
            const StatusIcon = statusIcons[book.status];

            return (
              <div
                key={book.id}
                className="bg-white p-4 rounded-lg border hover:shadow-md transition-all flex items-center gap-4"
              >
                <div className="w-16 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded flex items-center justify-center flex-shrink-0">
                  <Book className="w-8 h-8 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{book.title}</h3>
                      <p className="text-sm text-gray-600 truncate">{book.author || 'Autor desconocido'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[book.status]} ml-2`}>
                      <StatusIcon className="w-3 h-3 inline mr-1" />
                      {book.status}
                    </span>
                  </div>

                  {book.status !== 'not_started' && (
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>
                          {book.current_page} / {book.total_pages} páginas ({progress}%)
                        </span>
                        {book.pages_per_hour && <span>{Math.round(book.pages_per_hour)} pág/hora</span>}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setSelectedBook(book);
                      setSessionData({
                        ...sessionData,
                        start_page: book.current_page,
                        end_page: book.current_page,
                      });
                      setShowSessionForm(true);
                    }}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-medium transition-colors"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(book)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('¿Eliminar este libro?')) onDeleteBook(book.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No hay libros */}
      {filteredBooks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay libros</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' || filterGenre !== 'all'
              ? 'No se encontraron libros con los filtros seleccionados'
              : 'Comienza agregando tu primer libro para rastrear tu progreso de lectura'}
          </p>
          {!searchTerm && filterStatus === 'all' && filterGenre === 'all' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Agregar Primer Libro
            </button>
          )}
        </div>
      )}

      {/* Modal: Agregar/Editar Libro */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {editingBook ? 'Editar Libro' : 'Agregar Nuevo Libro'}
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingBook(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título del libro *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Atomic Habits"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                  <input
                    type="text"
                    value={formData.author || ''}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: James Clear"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total de páginas *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.total_pages}
                    onChange={(e) => setFormData({ ...formData, total_pages: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total de capítulos</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.total_chapters || ''}
                    onChange={(e) => setFormData({ ...formData, total_chapters: parseInt(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Género</label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value as BookGenre })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {genreOptions.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre.charAt(0).toUpperCase() + genre.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as BookStatus })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="not_started">No iniciado</option>
                    <option value="reading">Leyendo</option>
                    <option value="paused">Pausado</option>
                    <option value="completed">Completado</option>
                    <option value="abandoned">Abandonado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ISBN (opcional)</label>
                  <input
                    type="text"
                    value={formData.isbn || ''}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="978-0735211292"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta diaria (páginas)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.daily_pages_goal || ''}
                    onChange={(e) => setFormData({ ...formData, daily_pages_goal: parseInt(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 30"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Materia relacionada (opcional)
                  </label>
                  <select
                    value={formData.subject_id || ''}
                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value || undefined })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sin materia</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_favorite || false}
                      onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Marcar como favorito</span>
                    <Star className="w-4 h-4 text-yellow-500" />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingBook(null);
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingBook ? 'Guardar Cambios' : 'Agregar Libro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar Sesión de Lectura */}
      {showSessionForm && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Registrar Sesión de Lectura</h3>
                <p className="text-sm text-gray-600">{selectedBook.title}</p>
              </div>
              <button
                onClick={() => {
                  setShowSessionForm(false);
                  setSelectedBook(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogSession} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Página inicial *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max={selectedBook.total_pages}
                    value={sessionData.start_page}
                    onChange={(e) => setSessionData({ ...sessionData, start_page: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Página final *
                  </label>
                  <input
                    type="number"
                    required
                    min={sessionData.start_page}
                    max={selectedBook.total_pages}
                    value={sessionData.end_page}
                    onChange={(e) => setSessionData({ ...sessionData, end_page: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                    Páginas leídas: <span className="font-bold text-blue-600">{Math.max(0, sessionData.end_page - sessionData.start_page)}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duración (minutos) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={sessionData.duration_minutes}
                    onChange={(e) => setSessionData({ ...sessionData, duration_minutes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capítulo #</label>
                  <input
                    type="number"
                    min="0"
                    value={sessionData.chapter_number || ''}
                    onChange={(e) => setSessionData({ ...sessionData, chapter_number: parseInt(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del capítulo
                  </label>
                  <input
                    type="text"
                    value={sessionData.chapter_name}
                    onChange={(e) => setSessionData({ ...sessionData, chapter_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Introducción"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enfoque (1-5)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={sessionData.focus_rating}
                    onChange={(e) => setSessionData({ ...sessionData, focus_rating: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-center text-sm font-medium text-blue-600">
                    {sessionData.focus_rating}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Disfrute (1-5)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={sessionData.enjoyment_rating}
                    onChange={(e) => setSessionData({ ...sessionData, enjoyment_rating: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-center text-sm font-medium text-blue-600">
                    {sessionData.enjoyment_rating}
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas de la sesión
                  </label>
                  <textarea
                    value={sessionData.session_notes}
                    onChange={(e) => setSessionData({ ...sessionData, session_notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="¿Qué aprendiste? ¿Qué te pareció interesante?"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowSessionForm(false);
                    setSelectedBook(null);
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
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
