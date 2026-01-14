
import React, { useState } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { Plus, Timer, Trash2, CheckCircle2, Circle, ClipboardList, Filter } from 'lucide-react';
import { Priority, TaskStatus } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const TaskBoard: React.FC = () => {
  const { activeProfileId, subjects, tasks, addTask, updateTask } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  
  const [newTask, setNewTask] = useState({
    title: '',
    subject_id: '',
    priority: 'medium' as Priority,
    due_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    estimated_pomodoros: 1,
    alert_days_before: 1
  });

  const profileSubjects = subjects.filter(s => s.profile_id === activeProfileId);
  const profileTasks = tasks.filter(t => {
      const subj = subjects.find(s => s.id === t.subject_id);
      return subj?.profile_id === activeProfileId && (filterStatus === 'all' || t.status === filterStatus);
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.subject_id) return;
    
    addTask({
      ...newTask,
      status: 'pending'
    });
    setIsAdding(false);
    setNewTask({ title: '', subject_id: '', priority: 'medium', due_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"), estimated_pomodoros: 1, alert_days_before: 1 });
  };

  const priorityColors = {
    low: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };

  const { theme } = useAppStore();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className={`text-5xl font-black tracking-tight bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent`}>
            Mis Tareas
          </h1>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-bold mt-2 flex items-center gap-2`}>
            <ClipboardList size={18} className="text-indigo-500" />
            Organiza tus materias y entregas académicas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
             <button 
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
             >Todas</button>
             <button 
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === 'pending' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
             >Pendientes</button>
             <button 
                onClick={() => setFilterStatus('completed')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === 'completed' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}
             >Hechas</button>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
          >
            <Plus size={20} strokeWidth={3} />
            Nueva Tarea
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 mb-10 animate-in slide-in-from-top duration-300">
          <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Título de la tarea</label>
              <input 
                type="text" required value={newTask.title}
                onChange={e => setNewTask({...newTask, title: e.target.value})}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                placeholder="Ej: Ensayo de Filosofía"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Materia</label>
              <select 
                required value={newTask.subject_id}
                onChange={e => setNewTask({...newTask, subject_id: e.target.value})}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              >
                <option value="">Selecciona materia...</option>
                {profileSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Fecha Entrega</label>
              <input 
                type="datetime-local" required value={newTask.due_date}
                onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Prioridad</label>
              <select 
                value={newTask.priority}
                onChange={e => setNewTask({...newTask, priority: e.target.value as Priority})}
                className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Pomodoros</label>
                  <input type="number" value={newTask.estimated_pomodoros} onChange={e => setNewTask({...newTask, estimated_pomodoros: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
               </div>
               <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Alerta (días antes)</label>
                  <input type="number" value={newTask.alert_days_before} onChange={e => setNewTask({...newTask, alert_days_before: parseInt(e.target.value)})} className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
               </div>
            </div>
            <div className="md:col-span-2 flex justify-end gap-4 pt-6 border-t border-slate-100">
              <button type="button" onClick={() => setIsAdding(false)} className="px-8 py-4 font-black text-slate-400 uppercase tracking-widest text-xs">Cancelar</button>
              <button type="submit" className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Crear Tarea</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {profileTasks.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-slate-200">
            <div className="inline-flex p-6 rounded-full bg-slate-50 mb-6 text-slate-300">
              <ClipboardList size={64} strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-black text-slate-800">No hay tareas</h3>
            <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2">Crea tu primera tarea para empezar a organizar tu semestre.</p>
          </div>
        ) : (
          profileTasks.map(task => {
            const subject = subjects.find(s => s.id === task.subject_id);
            return (
              <div
                key={task.id}
                className={`group relative flex items-center gap-6 p-6 rounded-[2rem] border-2 transition-all duration-300 overflow-hidden card-hover-effect ${
                  task.status === 'completed'
                    ? theme === 'dark'
                      ? 'opacity-60 bg-slate-800/50 grayscale border-slate-700'
                      : 'opacity-60 bg-slate-50 grayscale border-slate-100'
                    : theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 hover:border-indigo-500/50'
                      : 'bg-white border-slate-100 hover:border-indigo-300'
                }`}
              >
                {/* Background gradient on hover */}
                {task.status !== 'completed' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}

                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-2"
                  style={{ backgroundColor: subject?.color }}
                />

                <button
                  onClick={() => updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' })}
                  className={`relative flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 ${
                    task.status === 'completed'
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : theme === 'dark'
                        ? 'border-slate-600 text-transparent hover:border-indigo-400 hover:bg-indigo-500/10'
                        : 'border-slate-200 text-transparent hover:border-indigo-400 hover:bg-indigo-50'
                  }`}
                >
                  <CheckCircle2 size={24} />
                </button>

                <div className="flex-1 min-w-0 relative z-10">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h4 className={`text-lg font-black truncate max-w-md ${
                      task.status === 'completed'
                        ? 'line-through text-slate-400'
                        : theme === 'dark'
                          ? 'text-slate-200'
                          : 'text-slate-800'
                    }`}>
                      {task.title}
                    </h4>
                    <span
                      className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${priorityColors[task.priority]}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <div className={`flex items-center gap-6 text-xs font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full shadow-md"
                        style={{ backgroundColor: subject?.color, boxShadow: `0 0 10px ${subject?.color}40` }}
                      />
                      <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-800'}>{subject?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-full">
                      <Timer size={14} className="text-indigo-500" />
                      <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                        {task.completed_pomodoros} / {task.estimated_pomodoros} poms
                      </span>
                    </div>
                    <p className="text-slate-400">
                      Vence: {format(new Date(task.due_date), "d MMM, HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 relative z-10">
                  <button className={`p-3 rounded-xl transition-all hover:scale-110 ${
                    theme === 'dark'
                      ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white'
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                  }`}>
                    <Timer size={20} />
                  </button>
                </div>

                {/* Progress indicator */}
                {task.status !== 'completed' && task.estimated_pomodoros > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                      style={{ width: `${(task.completed_pomodoros / task.estimated_pomodoros) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  );
};

export default TaskBoard;
