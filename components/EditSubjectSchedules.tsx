/**
 * EDIT SUBJECT SCHEDULES - Modal para editar horarios de materia existente
 */
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import ScheduleEditor, { ScheduleSlot } from './ScheduleEditor';
import { X, Clock, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { soundService } from '../lib/soundService';

interface EditSubjectSchedulesProps {
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

const EditSubjectSchedules: React.FC<EditSubjectSchedulesProps> = ({
  subjectId,
  subjectName,
  subjectColor,
  onClose,
  theme = 'dark'
}) => {
  const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar horarios existentes
  useEffect(() => {
    loadSchedules();
  }, [subjectId]);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('class_schedule')
        .select('*')
        .eq('subject_id', subjectId)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error cargando horarios:', error);
        return;
      }

      if (data) {
        // Convertir a formato ScheduleSlot
        const slots: ScheduleSlot[] = data.map(schedule => ({
          id: schedule.id,
          day_of_week: schedule.day_of_week,
          start_time: schedule.start_time,
          end_time: schedule.end_time
        }));
        setSchedules(slots);
      }
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (schedules.length === 0) {
      alert('⚠️ Debes tener al menos un horario');
      return;
    }

    setSaving(true);

    try {
      // 1. Eliminar todos los horarios existentes de esta materia
      const { error: deleteError } = await supabase
        .from('class_schedule')
        .delete()
        .eq('subject_id', subjectId);

      if (deleteError) {
        console.error('Error eliminando horarios antiguos:', deleteError);
        alert('❌ Error al actualizar horarios');
        setSaving(false);
        return;
      }

      // 2. Insertar los nuevos horarios
      const scheduleRecords = schedules.map(schedule => ({
        subject_id: subjectId,
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time
      }));

      const { error: insertError } = await supabase
        .from('class_schedule')
        .insert(scheduleRecords);

      if (insertError) {
        console.error('Error insertando nuevos horarios:', insertError);
        alert('❌ Error al guardar horarios');
        setSaving(false);
        return;
      }

      // 3. Recargar datos en el store
      const { syncWithSupabase } = useAppStore.getState();
      await syncWithSupabase();

      soundService.playSuccess();
      soundService.vibrate([50, 100, 50]);
      alert(`✅ Horarios actualizados correctamente para "${subjectName}"`);
      onClose();
    } catch (error) {
      console.error('Error al guardar horarios:', error);
      alert('❌ Error inesperado al guardar horarios');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className={`w-full max-w-3xl p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${
        theme === 'dark' ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: subjectColor }}
            >
              <Clock size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black">Editar Horarios</h2>
              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                {subjectName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className={`p-2 rounded-lg transition-all ${
              theme === 'dark'
                ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Schedule Editor */}
            <ScheduleEditor
              schedules={schedules}
              onChange={setSchedules}
              theme={theme}
            />

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <button
                onClick={handleSave}
                disabled={saving || schedules.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Guardar Cambios
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                disabled={saving}
                className={`px-6 py-3 font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  theme === 'dark'
                    ? 'bg-slate-800 text-white hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditSubjectSchedules;
