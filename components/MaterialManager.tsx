
import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Plus, Book, FileText, Video, Link, GraduationCap } from 'lucide-react';
import { MaterialType } from '../types';
import MiniPomodoro from './MiniPomodoro';

const MaterialManager: React.FC = () => {
  const { theme, activeProfileId, materials, subjects, addMaterial } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    subject_id: '',
    type: 'libro' as MaterialType,
    total_units: 0,
    completed_units: 0
  });

  const profileSubjects = subjects.filter(s => s.profile_id === activeProfileId);
  const profileMaterials = materials.filter(m => m.profile_id === activeProfileId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.title || !newMaterial.subject_id || !activeProfileId) return;
    
    addMaterial({
      ...newMaterial,
      profile_id: activeProfileId,
      status: 'not_started',
    });
    setIsAdding(false);
    setNewMaterial({ title: '', subject_id: '', type: 'libro', total_units: 0, completed_units: 0 });
  };

  const IconMap = {
    libro: Book,
    articulo: FileText,
    video: Video,
    documento: FileText,
    otro: Link
  };

  return (
    <div className={`max-w-6xl mx-auto relative ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      {/* Mini Pomodoro Widget */}
      <div className="fixed bottom-8 right-8 z-30">
        <MiniPomodoro duration={25} theme={theme} compact={false} />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black tracking-tighter">Biblioteca de Estudio</h1>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} font-bold mt-2 text-lg`}>Asocia recursos a tus materias para un control total.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-3xl font-black shadow-2xl hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={24} strokeWidth={3} />
          Nuevo Recurso
        </button>
      </div>

      {isAdding && (
        <div className={`p-10 rounded-[3rem] shadow-2xl border-2 mb-12 animate-in slide-in-from-top duration-500 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-3">Título del Recurso</label>
              <input 
                type="text" required value={newMaterial.title}
                onChange={e => setNewMaterial({...newMaterial, title: e.target.value})}
                className={`w-full p-5 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/20 font-black text-xl transition-all ${theme === 'dark' ? 'bg-slate-700 text-white placeholder:text-slate-500' : 'bg-slate-50 text-slate-900 placeholder:text-slate-300'}`}
                placeholder="Ej: Fundamentos de Redes"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-3">Vincular a Materia</label>
              <select 
                required value={newMaterial.subject_id}
                onChange={e => setNewMaterial({...newMaterial, subject_id: e.target.value})}
                className={`w-full p-5 rounded-2xl outline-none font-bold text-lg ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`}
              >
                <option value="">-- Selecciona una Materia --</option>
                {profileSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-3">Tipo</label>
                <select 
                  value={newMaterial.type}
                  onChange={e => setNewMaterial({...newMaterial, type: e.target.value as MaterialType})}
                  className={`w-full p-5 rounded-2xl outline-none font-bold text-lg ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`}
                >
                  <option value="libro">Libro</option>
                  <option value="video">Curso/Video</option>
                  <option value="documento">Documento</option>
                  <option value="articulo">Artículo</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-3">Unidades/Págs</label>
                <input 
                  type="number" value={newMaterial.total_units}
                  onChange={e => setNewMaterial({...newMaterial, total_units: parseInt(e.target.value) || 0})}
                  className={`w-full p-5 rounded-2xl outline-none font-bold text-lg ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-50 text-slate-900'}`}
                />
              </div>
            </div>
            <div className="flex justify-end md:col-span-2 gap-6 mt-6 border-t pt-8 border-slate-100 dark:border-slate-700">
              <button type="button" onClick={() => setIsAdding(false)} className="px-8 py-4 font-black text-slate-400 uppercase tracking-widest text-xs hover:text-slate-600 transition-colors">Cancelar</button>
              <button type="submit" className="px-12 py-4 bg-indigo-600 text-white font-black rounded-[1.5rem] shadow-xl shadow-indigo-500/20 hover:bg-indigo-700">Guardar Recurso</button>
            </div>
          </form>
        </div>
      )}

      {profileSubjects.map(subject => {
        const subjectMaterials = profileMaterials.filter(m => m.subject_id === subject.id);
        if (subjectMaterials.length === 0 && !isAdding) return null;

        return (
          <div key={subject.id} className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl shadow-lg" style={{ backgroundColor: subject.color }} />
              <h2 className="text-3xl font-black tracking-tight">{subject.name}</h2>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800 ml-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subjectMaterials.map(material => {
                const Icon = IconMap[material.type] || Link;
                const progress = material.total_units > 0 ? (material.completed_units || 0) / material.total_units * 100 : 0;
                
                return (
                  <div key={material.id} className={`group p-8 rounded-[2.5rem] border shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-8">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:rotate-6 ${theme === 'dark' ? 'bg-slate-700 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                        <Icon size={28} strokeWidth={2.5} />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${theme === 'dark' ? 'bg-slate-900 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                        {material.type}
                      </span>
                    </div>
                    
                    <h4 className={`text-2xl font-black mb-1 leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>{material.title}</h4>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10">
                      {material.completed_units} de {material.total_units} {material.type === 'libro' ? 'páginas' : 'módulos'}
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span>Estado del Estudio</span>
                        <span className="text-indigo-600">{Math.round(progress)}%</span>
                      </div>
                      <div className={`w-full h-4 rounded-full overflow-hidden p-1 shadow-inner ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`}>
                        <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MaterialManager;
