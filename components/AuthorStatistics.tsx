import React, { useMemo, useState } from 'react';
import { User, Book, Award, TrendingUp, Clock, Star, ChevronDown, ChevronRight } from 'lucide-react';
import { Book as BookType } from '../types';

interface AuthorStatisticsProps {
  books: BookType[];
  profileId: string;
}

interface AuthorStats {
  author: string;
  totalBooks: number;
  booksCompleted: number;
  booksReading: number;
  booksPending: number;
  totalPagesRead: number;
  totalTimeMinutes: number;
  avgRating: number;
  maxStreak: number;
  completionRate: number;
  books: BookType[];
}

export default function AuthorStatistics({ books, profileId }: AuthorStatisticsProps) {
  const [expandedAuthor, setExpandedAuthor] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'completed' | 'total' | 'rating' | 'pages'>('completed');

  // Calcular estadísticas por autor
  const authorStats = useMemo(() => {
    const statsByAuthor = new Map<string, AuthorStats>();

    books.forEach((book) => {
      const author = book.author?.trim() || 'Autor Desconocido';

      if (!statsByAuthor.has(author)) {
        statsByAuthor.set(author, {
          author,
          totalBooks: 0,
          booksCompleted: 0,
          booksReading: 0,
          booksPending: 0,
          totalPagesRead: 0,
          totalTimeMinutes: 0,
          avgRating: 0,
          maxStreak: 0,
          completionRate: 0,
          books: [],
        });
      }

      const stats = statsByAuthor.get(author)!;
      stats.totalBooks++;
      stats.books.push(book);

      if (book.status === 'completed') {
        stats.booksCompleted++;
        stats.totalPagesRead += book.total_pages;
      } else if (book.status === 'reading') {
        stats.booksReading++;
      } else if (book.status === 'not_started') {
        stats.booksPending++;
      }

      stats.totalTimeMinutes += book.total_reading_time_minutes;
      stats.maxStreak = Math.max(stats.maxStreak, book.reading_streak_days);
    });

    // Calcular promedios y tasas
    statsByAuthor.forEach((stats) => {
      const ratedBooks = stats.books.filter((b) => b.rating);
      stats.avgRating = ratedBooks.length > 0
        ? ratedBooks.reduce((sum, b) => sum + (b.rating || 0), 0) / ratedBooks.length
        : 0;
      stats.completionRate = stats.totalBooks > 0
        ? (stats.booksCompleted / stats.totalBooks) * 100
        : 0;
    });

    return Array.from(statsByAuthor.values());
  }, [books]);

  // Ordenar autores
  const sortedAuthors = useMemo(() => {
    return [...authorStats].sort((a, b) => {
      switch (sortBy) {
        case 'completed':
          return b.booksCompleted - a.booksCompleted || b.totalBooks - a.totalBooks;
        case 'total':
          return b.totalBooks - a.totalBooks;
        case 'rating':
          return b.avgRating - a.avgRating;
        case 'pages':
          return b.totalPagesRead - a.totalPagesRead;
        default:
          return 0;
      }
    });
  }, [authorStats, sortBy]);

  // Estadísticas globales
  const globalStats = useMemo(() => {
    return {
      totalAuthors: authorStats.length,
      favAuthors: authorStats.filter((a) => a.booksCompleted >= 3).length,
      avgBooksPerAuthor: authorStats.length > 0
        ? authorStats.reduce((sum, a) => sum + a.totalBooks, 0) / authorStats.length
        : 0,
      topAuthor: sortedAuthors[0] || null,
    };
  }, [authorStats, sortedAuthors]);

  const toggleAuthor = (author: string) => {
    setExpandedAuthor(expandedAuthor === author ? null : author);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-7 h-7 text-indigo-600" />
          Estadísticas por Autor
        </h2>
        <p className="text-gray-600">Descubre cuántos libros has leído de cada autor</p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-600 font-medium">Total Autores</p>
              <p className="text-2xl font-bold text-indigo-900">{globalStats.totalAuthors}</p>
            </div>
            <User className="w-8 h-8 text-indigo-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Autores Favoritos</p>
              <p className="text-2xl font-bold text-purple-900">{globalStats.favAuthors}</p>
              <p className="text-xs text-purple-600">3+ libros completados</p>
            </div>
            <Award className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Promedio</p>
              <p className="text-2xl font-bold text-blue-900">
                {globalStats.avgBooksPerAuthor.toFixed(1)}
              </p>
              <p className="text-xs text-blue-600">libros/autor</p>
            </div>
            <Book className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">Top Autor</p>
              <p className="text-lg font-bold text-amber-900 truncate">
                {globalStats.topAuthor ? globalStats.topAuthor.author.substring(0, 15) : '-'}
              </p>
              <p className="text-xs text-amber-600">
                {globalStats.topAuthor ? `${globalStats.topAuthor.booksCompleted} completados` : ''}
              </p>
            </div>
            <Star className="w-8 h-8 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Sorting */}
      <div className="flex gap-2 items-center bg-white p-4 rounded-lg border">
        <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        >
          <option value="completed">Más completados</option>
          <option value="total">Total de libros</option>
          <option value="rating">Mejor calificación</option>
          <option value="pages">Más páginas leídas</option>
        </select>
      </div>

      {/* Authors List */}
      <div className="space-y-3">
        {sortedAuthors.map((stats, index) => (
          <div key={stats.author} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-all">
            {/* Author Header */}
            <div
              className="p-4 cursor-pointer"
              onClick={() => toggleAuthor(stats.author)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Ranking Badge */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${
                      index === 0
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                        : index === 1
                        ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                        : index === 2
                        ? 'bg-gradient-to-br from-orange-400 to-orange-600'
                        : 'bg-gradient-to-br from-blue-400 to-blue-600'
                    }`}
                  >
                    {index + 1}
                  </div>

                  {/* Author Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg truncate">{stats.author}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Book className="w-4 h-4" />
                        {stats.totalBooks} {stats.totalBooks === 1 ? 'libro' : 'libros'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-green-600" />
                        {stats.booksCompleted} completados
                      </span>
                      {stats.avgRating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          {stats.avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="flex items-center gap-6 text-center flex-shrink-0 mr-4">
                  <div>
                    <p className="text-2xl font-bold text-indigo-600">{stats.booksCompleted}</p>
                    <p className="text-xs text-gray-600">Completados</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.totalPagesRead.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-600">Páginas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {Math.round(stats.totalTimeMinutes / 60)}h
                    </p>
                    <p className="text-xs text-gray-600">Tiempo</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{stats.completionRate.toFixed(0)}%</p>
                    <p className="text-xs text-gray-600">Finalización</p>
                  </div>
                </div>

                {/* Expand Icon */}
                {expandedAuthor === stats.author ? (
                  <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-6 h-6 text-gray-400 flex-shrink-0" />
                )}
              </div>
            </div>

            {/* Expanded Books List */}
            {expandedAuthor === stats.author && (
              <div className="border-t bg-gray-50 p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Book className="w-5 h-5 text-indigo-600" />
                  Libros de {stats.author} ({stats.books.length})
                </h4>
                <div className="space-y-2">
                  {stats.books
                    .sort((a, b) => {
                      // Ordenar por estado: reading > completed > paused > not_started
                      const statusOrder = { reading: 1, completed: 2, paused: 3, not_started: 4, abandoned: 5 };
                      return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
                    })
                    .map((book) => (
                      <div
                        key={book.id}
                        className="bg-white p-3 rounded-lg border flex items-center justify-between hover:shadow-sm transition-shadow"
                      >
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 truncate">{book.title}</h5>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                book.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : book.status === 'reading'
                                  ? 'bg-blue-100 text-blue-700'
                                  : book.status === 'paused'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {book.status}
                            </span>
                            <span>{book.total_pages} páginas</span>
                            {book.rating && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                {book.rating}/5
                              </span>
                            )}
                            {book.status === 'reading' && (
                              <span className="text-blue-600 font-medium">
                                {Math.round((book.current_page / book.total_pages) * 100)}% completado
                              </span>
                            )}
                          </div>
                        </div>

                        {book.status === 'completed' && (
                          <div className="flex items-center gap-3 text-sm text-gray-600 ml-4">
                            {book.total_reading_time_minutes > 0 && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {Math.round(book.total_reading_time_minutes / 60)}h
                              </span>
                            )}
                            {book.pages_per_hour && (
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                {Math.round(book.pages_per_hour)} pág/h
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {/* Author Summary Stats */}
                <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Leyendo</p>
                    <p className="text-lg font-bold text-blue-600">{stats.booksReading}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Pendientes</p>
                    <p className="text-lg font-bold text-gray-600">{stats.booksPending}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Racha Máxima</p>
                    <p className="text-lg font-bold text-orange-600">{stats.maxStreak} días</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Tiempo Total</p>
                    <p className="text-lg font-bold text-purple-600">
                      {Math.round(stats.totalTimeMinutes / 60)}h {stats.totalTimeMinutes % 60}m
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {sortedAuthors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay autores registrados</h3>
          <p className="text-gray-600">
            Agrega libros con autores para ver las estadísticas por autor
          </p>
        </div>
      )}
    </div>
  );
}
