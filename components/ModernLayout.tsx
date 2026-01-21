import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import {
  ClipboardList, BookOpen, Timer, BarChart3, Settings,
  LayoutDashboard, GraduationCap, FileText,
  Moon, Sun, Flame
} from 'lucide-react';

interface ModernLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ModernLayout: React.FC<ModernLayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { theme, toggleTheme, profiles, activeProfileId, setActiveProfile } = useAppStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId);

  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard, color: '#3B82F6', emoji: '🏠' },
    { id: 'subjects', label: 'Materias', icon: GraduationCap, color: '#EC4899', emoji: '📚' },
    { id: 'exams', label: 'Exámenes', icon: FileText, color: '#F59E0B', emoji: '📝' },
    { id: 'tasks', label: 'Tareas', icon: ClipboardList, color: '#6366F1', emoji: '✅' },
    { id: 'materials', label: 'Estudio', icon: BookOpen, color: '#14B8A6', emoji: '📖' },
    { id: 'pomodoro', label: 'Pomodoro', icon: Flame, color: '#EF4444', emoji: '🍅' },
    { id: 'statistics', label: 'Stats', icon: BarChart3, color: '#06B6D4', emoji: '📊' },
    { id: 'settings', label: 'Config', icon: Settings, color: '#64748B', emoji: '⚙️' },
  ];

  if (!activeProfile) return <>{children}</>;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30'}`}>
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl float-animation" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }} />
      </div>

      {/* Top Bar - Profile and Theme */}
      <div className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-2xl border-b transition-all ${
        theme === 'dark'
          ? 'bg-slate-900/80 border-slate-800'
          : 'bg-white/80 border-slate-200/50'
      }`}>
        <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo y Profile */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-2xl transition-transform hover:scale-105 cursor-pointer"
                style={{
                  background: `linear-gradient(135deg, ${activeProfile.color}, ${activeProfile.color}dd)`
                }}
                onClick={() => setActiveProfile(null)}
              >
                {activeProfile.name.charAt(0)}
              </div>
              <div>
                <h2 className={`font-black text-lg leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {activeProfile.name}
                </h2>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-indigo-500">
                  {activeProfile.type}
                </p>
              </div>
            </div>

            {/* PomoSmart Logo */}
            <div className="hidden md:flex items-center gap-2 ml-6 pl-6 border-l border-slate-200 dark:border-slate-700">
              <Flame className="text-indigo-500" size={24} />
              <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                PomoSmart
              </span>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-3 rounded-xl transition-all hover:scale-110 active:scale-95 ${
              theme === 'dark'
                ? 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* Tabs Navigation - Horizontal */}
      <div className={`fixed top-20 left-0 right-0 z-30 backdrop-blur-2xl border-b transition-all ${
        theme === 'dark'
          ? 'bg-slate-900/50 border-slate-800'
          : 'bg-white/50 border-slate-200/50'
      }`}>
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group relative flex items-center gap-3 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'text-white shadow-2xl scale-105'
                      : theme === 'dark'
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                  style={isActive ? {
                    background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)`,
                    boxShadow: `0 8px 32px ${item.color}40`
                  } : {}}
                >
                  {/* Background glow effect */}
                  {isActive && (
                    <>
                      <div
                        className="absolute inset-0 rounded-2xl blur-xl opacity-50"
                        style={{ background: item.color }}
                      />
                      <div className="absolute inset-0 shimmer opacity-20 rounded-2xl" />
                    </>
                  )}

                  {/* Icon with animation */}
                  <div className="relative z-10 flex items-center gap-3">
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={`transition-transform ${isActive ? '' : 'group-hover:scale-110'}`}
                    />
                    <span className="hidden sm:inline">{item.label}</span>

                    {/* Emoji indicator on mobile */}
                    <span className="sm:hidden text-lg">{item.emoji}</span>
                  </div>

                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 pt-40 pb-12">
        <div className="max-w-[1800px] mx-auto px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>

      {/* Mini Pomodoro Floating Button - Solo visible cuando NO estás en pomodoro */}
      {activeTab !== 'pomodoro' && (
        <button
          onClick={() => setActiveTab('pomodoro')}
          className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center group bg-gradient-to-br from-indigo-600 to-purple-600"
          style={{
            boxShadow: '0 20px 60px rgba(99, 102, 241, 0.4)'
          }}
        >
          <Timer size={28} className="text-white group-hover:rotate-12 transition-transform" />

          {/* Pulse effect */}
          <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-indigo-500" />
        </button>
      )}

      {/* Quick Stats Floating Widget */}
      <div className={`hidden lg:block fixed bottom-8 left-8 z-50 p-6 rounded-3xl backdrop-blur-2xl border shadow-2xl transition-all ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-800'
          : 'bg-white/90 border-slate-200'
      }`}>
        <div className="flex items-center gap-3 mb-3">
          <Flame className="text-indigo-500" size={20} />
          <span className="font-black text-sm uppercase tracking-widest text-slate-400">
            Hoy
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            0
          </span>
          <span className="text-sm font-bold text-slate-400">pomodoros</span>
        </div>
        <div className="mt-4 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
            style={{ width: '0%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default ModernLayout;
