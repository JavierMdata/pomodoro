
import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Plus, Book, FileText, Video, Link, Trash2 } from 'lucide-react';
import { MaterialType } from '../types';

const MaterialManager: React.FC = () => {
  const { theme, activeProfileId, materials, addMaterial, updateMaterial } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    type: 'libro' as MaterialType,
    category: '',
    total_units: 0,
    completed_units: 0
  });

  const profileMaterials = materials.filter(m => m.profile_id === activeProfileId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.title || !activeProfileId) return;
    
    addMaterial({
      ...newMaterial,
      profile_id: activeProfileId,
      status: 'not_started',
    });
    setIsAdding(false);
    setNewMaterial({ title: '', type: 'libro', category: '', total_units: 0, completed_units: 0 });
  };

  const IconMap = {
    libro: Book,
    articulo: FileText,
    video: Video,
    documento: FileText,
    otro: Link
  };

  return (
    <div className={`max-w-4xl mx-auto ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Recursos de Estudio</h1>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-medium`}>Haz seguimiento a tus lecturas y cursos.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all"
        >
          <Plus size={20} />
          Nuevo Material
        </button>
      </div>

      {isAdding && (
        <div className={`p-8 rounded-[2.5rem] shadow-sm border mb-8 animate-in slide-in-from-top duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Título</label>
              <input 
                type="text" required value={newMaterial.title}
                onChange={e => setNewMaterial({...newMaterial, title: e.target.value})}
                className={`w-full p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'}`}
                placeholder="Ej: Biología Celular"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Tipo</label>
              <select 
                value={newMaterial.type}
                onChange={e => setNewMaterial({...newMaterial, type: e.target.value as MaterialType})}
                className={`w-full p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'}`}
              >
                <option value="libro">Libro</option>
                <option value="articulo">Artículo</option>
                <option value="video">Video/Curso</option>
                <option value="documento">Documento</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2">Total Unidades/Páginas</label>
              <input 
                type="number" value={newMaterial.total_units}
                onChange={e => setNewMaterial({...newMaterial, total_units: parseInt(e.target.value) || 0})}
                className={`w-full p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-50'}`}
              />
            </div>
            <div className="flex justify-end md:col-span-2 gap-4 mt-4">
              <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-3 font-bold text-slate-400 uppercase tracking-widest text-xs">Cancelar</button>
              <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-md">Guardar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {profileMaterials.map(material => {
          const Icon = IconMap[material.type] || Link;
          const progress = material.total_units > 0 ? (material.completed_units || 0) / material.total_units * 100 : 0;
          
          return (
            <div key={material.id} className={`p-8 rounded-[2.5rem] border shadow-sm hover:shadow-lg transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-slate-700 text-indigo-400' : 'bg-slate-50 text-indigo-600'}`}>
                  <Icon size={28} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${theme === 'dark' ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  {material.type}
                </span>
              </div>
              
              <h4 className="text-2xl font-black mb-1">{material.title}</h4>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">{material.completed_units} / {material.total_units} {material.type === 'libro' ? 'páginas' : 'unidades'}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Progreso de Lectura</span>
                  <span className="text-indigo-500">{Math.round(progress)}%</span>
                </div>
                <div className={`w-full h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MaterialManager;
