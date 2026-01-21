import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Book,
  Clock,
  Award,
  Calendar,
  Flame,
  Target,
  BookOpen,
  Sparkles,
  Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import {
  Book as BookType,
  BookReadingSession,
  ReadingGoal,
  BookStatistics,
  ReadingActivityByMonth
} from '../types';

interface ReadingStatisticsProps {
  books: BookType[];
  sessions: BookReadingSession[];
  goals: ReadingGoal[];
  profileId: string;
}

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444'];

export default function ReadingStatistics({
  books,
  sessions,
  goals,
  profileId,
}: ReadingStatisticsProps) {
  // Calcular estadísticas generales
  const stats = useMemo(() => {
    const totalBooks = books.length;
    const completedBooks = books.filter((b) => b.status === 'completed').length;
    const readingBooks = books.filter((b) => b.status === 'reading').length;

    const totalPages = books
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + b.total_pages, 0);

    const totalTime = books.reduce((sum, b) => sum + b.total_reading_time_minutes, 0);

    const avgSpeed = books
      .filter((b) => b.pages_per_hour && b.pages_per_hour > 0)
      .reduce((sum, b) => sum + (b.pages_per_hour || 0), 0) /
      books.filter((b) => b.pages_per_hour && b.pages_per_hour > 0).length || 0;

    const longestStreak = Math.max(...books.map((b) => b.reading_streak_days), 0);
    const currentStreak = books
      .filter((b) => b.status === 'reading')
      .reduce((max, b) => Math.max(max, b.reading_streak_days), 0);

    const totalSessions = sessions.length;
    const avgFocus = sessions
      .filter((s) => s.focus_rating)
      .reduce((sum, s) => sum + (s.focus_rating || 0), 0) /
      sessions.filter((s) => s.focus_rating).length || 0;

    const avgEnjoyment = sessions
      .filter((s) => s.enjoyment_rating)
      .reduce((sum, s) => sum + (s.enjoyment_rating || 0), 0) /
      sessions.filter((s) => s.enjoyment_rating).length || 0;

    const completionRate = totalBooks > 0 ? (completedBooks / totalBooks) * 100 : 0;

    return {
      totalBooks,
      completedBooks,
      readingBooks,
      totalPages,
      totalTime,
      avgSpeed: Math.round(avgSpeed),
      longestStreak,
      currentStreak,
      totalSessions,
      avgFocus: avgFocus.toFixed(1),
      avgEnjoyment: avgEnjoyment.toFixed(1),
      completionRate: completionRate.toFixed(1),
    };
  }, [books, sessions]);

  // Datos para gráfico de libros por género
  const booksByGenre = useMemo(() => {
    const genreCounts = books.reduce((acc, book) => {
      const genre = book.genre || 'otro';
      acc[genre] = (acc[genre] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(genreCounts)
      .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
      .sort((a, b) => b.value - a.value);
  }, [books]);

  // Datos para gráfico de progreso mensual
  const monthlyProgress = useMemo(() => {
    const sessionsByMonth = sessions.reduce((acc, session) => {
      const month = session.session_date.substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { month, pages: 0, sessions: 0, minutes: 0 };
      }
      acc[month].pages += session.pages_read;
      acc[month].sessions += 1;
      acc[month].minutes += session.duration_minutes;
      return acc;
    }, {} as Record<string, { month: string; pages: number; sessions: number; minutes: number }>);

    return Object.values(sessionsByMonth)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Últimos 6 meses
  }, [sessions]);

  // Datos para gráfico de velocidad de lectura
  const readingSpeedData = useMemo(() => {
    return books
      .filter((b) => b.pages_per_hour && b.pages_per_hour > 0)
      .sort((a, b) => (b.pages_per_hour || 0) - (a.pages_per_hour || 0))
      .slice(0, 10)
      .map((b) => ({
        title: b.title.length > 20 ? b.title.substring(0, 20) + '...' : b.title,
        speed: Math.round(b.pages_per_hour || 0),
      }));
  }, [books]);

  // Datos para gráfico de distribución de estados
  const statusDistribution = useMemo(() => {
    const statusCounts = books.reduce((acc, book) => {
      acc[book.status] = (acc[book.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusLabels: Record<string, string> = {
      not_started: 'No iniciados',
      reading: 'Leyendo',
      paused: 'Pausados',
      completed: 'Completados',
      abandoned: 'Abandonados',
    };

    return Object.entries(statusCounts).map(([name, value]) => ({
      name: statusLabels[name] || name,
      value,
    }));
  }, [books]);

  // Top 5 libros más leídos (por tiempo)
  const topBooks = useMemo(() => {
    return [...books]
      .sort((a, b) => b.total_reading_time_minutes - a.total_reading_time_minutes)
      .slice(0, 5);
  }, [books]);

  // Objetivos activos
  const activeGoals = useMemo(() => {
    return goals.filter((g) => g.is_active && !g.is_completed);
  }, [goals]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-purple-600" />
          Estadísticas de Lectura
        </h2>
        <p className="text-gray-600">Visualiza tu progreso y hábitos de lectura</p>
      </div>

      {/* Stats Cards Principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg">
          <Book className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Total Libros</p>
          <p className="text-3xl font-bold">{stats.totalBooks}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
          <Award className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Completados</p>
          <p className="text-3xl font-bold">{stats.completedBooks}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg">
          <BookOpen className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Páginas Leídas</p>
          <p className="text-3xl font-bold">{stats.totalPages.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-4 rounded-lg">
          <Clock className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Horas Totales</p>
          <p className="text-3xl font-bold">{Math.round(stats.totalTime / 60)}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg">
          <Flame className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Racha Máxima</p>
          <p className="text-3xl font-bold">{stats.longestStreak}</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-4 rounded-lg">
          <TrendingUp className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Pág/Hora</p>
          <p className="text-3xl font-bold">{stats.avgSpeed}</p>
        </div>
      </div>

      {/* Métricas Secundarias */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Calendar className="w-4 h-4" />
            <p className="text-sm">Sesiones de Lectura</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Sparkles className="w-4 h-4" />
            <p className="text-sm">Enfoque Promedio</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.avgFocus}/5</p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Zap className="w-4 h-4" />
            <p className="text-sm">Disfrute Promedio</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.avgEnjoyment}/5</p>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Target className="w-4 h-4" />
            <p className="text-sm">Tasa de Finalización</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
        </div>
      </div>

      {/* Objetivos Activos */}
      {activeGoals.length > 0 && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Objetivos de Lectura Activos
          </h3>
          <div className="space-y-4">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{goal.title || `Meta ${goal.goal_type}`}</h4>
                    <p className="text-sm text-gray-600">
                      {goal.current_progress} / {goal.target_amount} {goal.goal_unit}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-blue-600">{goal.progress_percentage.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(goal.progress_percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progreso Mensual - Páginas */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Páginas Leídas por Mes</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="pages" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por Género */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Libros por Género</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={booksByGenre}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {booksByGenre.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Velocidad de Lectura por Libro */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Velocidad de Lectura (Top 10)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={readingSpeedData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" fontSize={12} />
              <YAxis type="category" dataKey="title" width={150} fontSize={11} />
              <Tooltip />
              <Bar dataKey="speed" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Estado de Libros */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución por Estado</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 5 Libros Más Leídos */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-600" />
          Top 5 Libros Más Leídos (por tiempo dedicado)
        </h3>
        <div className="space-y-3">
          {topBooks.map((book, index) => (
            <div key={book.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                index === 0 ? 'bg-yellow-500' :
                index === 1 ? 'bg-gray-400' :
                index === 2 ? 'bg-orange-600' :
                'bg-blue-500'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{book.title}</h4>
                <p className="text-sm text-gray-600">{book.author || 'Autor desconocido'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  {Math.round(book.total_reading_time_minutes / 60)}h {book.total_reading_time_minutes % 60}m
                </p>
                <p className="text-xs text-gray-600">
                  {book.current_page} / {book.total_pages} págs
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historial de Sesiones Recientes */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Sesiones de Lectura Recientes</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-gray-600">
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Libro</th>
                <th className="pb-2">Páginas</th>
                <th className="pb-2">Tiempo</th>
                <th className="pb-2">Enfoque</th>
                <th className="pb-2">Disfrute</th>
              </tr>
            </thead>
            <tbody>
              {sessions.slice(0, 10).map((session) => {
                const book = books.find((b) => b.id === session.book_id);
                return (
                  <tr key={session.id} className="border-b text-sm">
                    <td className="py-2">{new Date(session.session_date).toLocaleDateString()}</td>
                    <td className="py-2 font-medium">
                      {book ? (book.title.length > 30 ? book.title.substring(0, 30) + '...' : book.title) : 'Desconocido'}
                    </td>
                    <td className="py-2">{session.pages_read}</td>
                    <td className="py-2">{session.duration_minutes}min</td>
                    <td className="py-2">
                      <span className="text-blue-600 font-medium">{session.focus_rating || '-'}/5</span>
                    </td>
                    <td className="py-2">
                      <span className="text-purple-600 font-medium">{session.enjoyment_rating || '-'}/5</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sessions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No hay sesiones de lectura registradas aún</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
