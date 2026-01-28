import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { soundService } from '../lib/soundService';
import {
  ClipboardList, BookOpen, Timer, BarChart3, Settings,
  LayoutDashboard, GraduationCap, FileText,
  Moon, Sun, Flame, BookText, Network, CalendarDays, Clock, Layers
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
    { id: 'categories', label: 'Categorías', icon: Layers, color: '#8B5CF6', emoji: '🎯' },
    { id: 'graph', label: 'Grafo', icon: Network, color: '#7C3AED', emoji: '🕸️' },
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
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          {/* Logo y Profile */}
          <div className="flex items-center gap-3 md:gap-6">
            <div className="flex items-center gap-2 md:gap-4">
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-white font-black text-lg md:text-xl shadow-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer touch-manipulation"
                style={{
                  background: `linear-gradient(135deg, ${activeProfile.color}, ${activeProfile.color}dd)`
                }}
                onClick={() => {
                  soundService.playWhoosh();
                  soundService.vibrate(20);
                  setActiveProfile(null);
                }}
              >
                {activeProfile.name.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <h2 className={`font-black text-sm md:text-lg leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {activeProfile.name}
                </h2>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.15em] text-indigo-500">
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
            onClick={() => {
              soundService.playToggle();
              soundService.vibrate(15);
              toggleTheme();
            }}
            className={`p-2 md:p-3 rounded-lg md:rounded-xl transition-all hover:scale-110 active:scale-95 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center ${
              theme === 'dark'
                ? 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
            aria-label="Cambiar tema"
          >
            {theme === 'dark' ? <Sun size={18} className="md:w-5 md:h-5" /> : <Moon size={18} className="md:w-5 md:h-5" />}
          </button>
        </div>
      </div>

      {/* Tabs Navigation - Horizontal */}
      <div className={`fixed top-16 md:top-20 left-0 right-0 z-30 backdrop-blur-2xl border-b transition-all ${
        theme === 'dark'
          ? 'bg-slate-900/50 border-slate-800'
          : 'bg-white/50 border-slate-200/50'
      }`}>
        <div className="max-w-[1800px] mx-auto px-3 md:px-6">
          <div className="flex items-center gap-1 md:gap-2 overflow-x-auto scrollbar-hide py-2 md:py-4 snap-x snap-mandatory">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundService.hapticFeedback('light');
                    setActiveTab(item.id);
                  }}
                  className={`group relative flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all duration-300 whitespace-nowrap touch-manipulation min-h-[44px] snap-center ${
                    isActive
                      ? 'text-white shadow-2xl scale-105'
                      : theme === 'dark'
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/50 active:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 active:bg-white'
                  }`}
                  style={isActive ? {
                    background: `linear-gradient(135deg, ${item.color}, ${item.color}dd)`,
                    boxShadow: `0 8px 32px ${item.color}40`
                  } : {}}
                  aria-label={item.label}
                  role="tab"
                  aria-selected={isActive}
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
                  <div className="relative z-10 flex items-center gap-2 md:gap-3">
                    <Icon
                      size={18}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={`transition-transform md:w-5 md:h-5 ${isActive ? '' : 'group-hover:scale-110 active:scale-90'}`}
                    />
                    <span className="hidden md:inline">{item.label}</span>

                    {/* Solo emoji en móvil pequeño */}
                    <span className="md:hidden text-base">{item.emoji}</span>
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
      <main className="relative z-10 pt-28 md:pt-40 pb-8 md:pb-12">
        <div className="max-w-[1800px] mx-auto px-4 md:px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>

      {/* Mini Pomodoro Floating Button - Solo visible cuando NO estás en pomodoro */}
      {activeTab !== 'pomodoro' && (
        <button
          onClick={() => {
            soundService.playNotification();
            soundService.vibrate([50, 100, 50]);
            setActiveTab('pomodoro');
          }}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center group bg-gradient-to-br from-indigo-600 to-purple-600 touch-manipulation"
          style={{
            boxShadow: '0 20px 60px rgba(99, 102, 241, 0.4)'
          }}
          aria-label="Abrir Pomodoro"
        >
          <Timer size={24} className="md:w-7 md:h-7 text-white group-hover:rotate-12 transition-transform" />

          {/* Pulse effect */}
          <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-indigo-500" />
        </button>
      )}

      {/* Quick Stats Floating Widget - Solo desktop grande */}
      <div className={`hidden xl:block fixed bottom-6 md:bottom-8 left-6 md:left-8 z-50 p-4 md:p-6 rounded-2xl md:rounded-3xl backdrop-blur-2xl border shadow-2xl transition-all ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-800'
          : 'bg-white/90 border-slate-200'
      }`}>
        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
          <Flame className="text-indigo-500" size={18} />
          <span className="font-black text-xs md:text-sm uppercase tracking-widest text-slate-400">
            Hoy
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl md:text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            0
          </span>
          <span className="text-xs md:text-sm font-bold text-slate-400">pomodoros</span>
        </div>
        <div className="mt-3 md:mt-4 h-1.5 md:h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
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
