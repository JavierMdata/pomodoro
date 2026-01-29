import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { soundService } from '../lib/soundService';
import SectionsDropdownMenu from './SectionsDropdownMenu';
import CommandCenterSidebar from './CommandCenterSidebar';
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
  const { theme, toggleTheme, profiles, activeProfileId, setActiveProfile, setSelectedSectionForPomodoro } = useAppStore();
  const activeProfile = profiles.find(p => p.id === activeProfileId);

  // Manejar selección de sección desde el menú desplegable
  const handleSelectSection = (sectionId: string, sectionType: 'subject' | 'category') => {
    setSelectedSectionForPomodoro(sectionId, sectionType);
    setActiveTab('pomodoro');
  };

  if (!activeProfile) return <>{children}</>;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30'}`}>
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl float-animation" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }} />
      </div>

      {/* Sidebar */}
      <CommandCenterSidebar
        theme={theme}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Top Bar - Solo para Profile, Menu de Secciones y Tema */}
      <div className={`fixed top-0 left-72 right-0 z-40 backdrop-blur-2xl border-b transition-all ${
        theme === 'dark'
          ? 'bg-slate-900/80 border-slate-800'
          : 'bg-white/80 border-slate-200/50'
      }`}>
        <div className="px-6 h-20 flex items-center justify-between">
          {/* Profile Info */}
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer"
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
            <div>
              <h2 className={`font-black text-lg leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {activeProfile.name}
              </h2>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-indigo-500">
                {activeProfile.type}
              </p>
            </div>
          </div>

          {/* Sections Menu & Theme Toggle */}
          <div className="flex items-center gap-3">
            {/* Menú de secciones */}
            <SectionsDropdownMenu
              theme={theme}
              onSelectSection={handleSelectSection}
            />

            {/* Theme Toggle */}
            <button
              onClick={() => {
                soundService.playToggle();
                soundService.vibrate(15);
                toggleTheme();
              }}
              className={`p-3 rounded-xl transition-all hover:scale-110 active:scale-95 ${
                theme === 'dark'
                  ? 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 ml-72 pt-28 pb-12">
        <div className="px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
          className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center group bg-gradient-to-br from-indigo-600 to-purple-600"
          style={{
            boxShadow: '0 20px 60px rgba(99, 102, 241, 0.4)'
          }}
          aria-label="Abrir Pomodoro"
        >
          <Timer size={28} className="text-white group-hover:rotate-12 transition-transform" />

          {/* Pulse effect */}
          <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-indigo-500" />
        </button>
      )}
    </div>
  );
};

export default ModernLayout;
