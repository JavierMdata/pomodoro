import React from 'react';
import { useAppStore } from '../stores/useAppStore';
import { BookOpen, Sparkles, Clock, Target } from 'lucide-react';

/**
 * Versión segura del componente de libros
 * Muestra un mensaje amigable mientras la sección se desarrolla
 */
export default function BooksManagerSafe() {
  const { theme } = useAppStore();
  const isDark = theme === 'dark';

  return (
    <div className={`max-w-2xl mx-auto ${isDark ? 'text-white' : 'text-slate-900'}`}>
      <div className={`rounded-2xl border overflow-hidden ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Gradient header */}
        <div className="h-2 w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

        <div className="p-10 text-center space-y-6">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 w-fit mx-auto">
            <BookOpen size={48} className={isDark ? 'text-pink-400' : 'text-pink-500'} />
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight mb-2">Mis Libros</h2>
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Rastrea tu progreso de lectura, toma notas y registra sesiones
            </p>
          </div>

          {/* Feature preview cards */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/80' : 'bg-slate-50'}`}>
              <Target size={20} className="mx-auto mb-2 text-indigo-500" />
              <p className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Metas diarias</p>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/80' : 'bg-slate-50'}`}>
              <Clock size={20} className="mx-auto mb-2 text-purple-500" />
              <p className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Sesiones</p>
            </div>
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/80' : 'bg-slate-50'}`}>
              <Sparkles size={20} className="mx-auto mb-2 text-pink-500" />
              <p className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Estadísticas</p>
            </div>
          </div>

          <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold ${
            isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
          }`}>
            <Sparkles size={16} />
            Próximamente disponible
          </div>
        </div>
      </div>
    </div>
  );
}
