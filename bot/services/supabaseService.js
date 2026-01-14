import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

export class SupabaseService {
  // ========== PERFILES ==========

  async getProfileByTelegramId(telegramId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('telegram_chat_id', telegramId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting profile:', error);
      return null;
    }

    return data;
  }

  async linkTelegramToProfile(profileId, telegramId, telegramUsername) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        telegram_chat_id: telegramId,
        telegram_username: telegramUsername,
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId)
      .select()
      .single();

    if (error) {
      console.error('Error linking Telegram:', error);
      return null;
    }

    return data;
  }

  async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    return data || [];
  }

  async updateProfileName(profileId, newName) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        user_name: newName,
        updated_at: new Date().toISOString()
      })
      .eq('id', profileId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile name:', error);
      return null;
    }

    return data;
  }

  // ========== MATERIAS ==========

  async getSubjectsByProfile(profileId) {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('profile_id', profileId)
      .order('name');

    return data || [];
  }

  async createSubject(profileId, name, color = '#6366f1') {
    const { data, error } = await supabase
      .from('subjects')
      .insert({
        profile_id: profileId,
        name,
        color,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating subject:', error);
      return null;
    }

    return data;
  }

  // ========== TAREAS ==========

  async getTasksByProfile(profileId) {
    const subjects = await this.getSubjectsByProfile(profileId);
    const subjectIds = subjects.map(s => s.id);

    if (subjectIds.length === 0) return [];

    const { data, error } = await supabase
      .from('tasks')
      .select('*, subjects(name, color)')
      .in('subject_id', subjectIds)
      .order('due_date', { ascending: true });

    return data || [];
  }

  async createTask(subjectId, title, description = '', priority = 'media', dueDate = null) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        subject_id: subjectId,
        title,
        description,
        priority,
        due_date: dueDate,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select('*, subjects(name)')
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return null;
    }

    return data;
  }

  async updateTaskStatus(taskId, status) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    return data;
  }

  // ========== EXÁMENES ==========

  async getExamsByProfile(profileId) {
    const subjects = await this.getSubjectsByProfile(profileId);
    const subjectIds = subjects.map(s => s.id);

    if (subjectIds.length === 0) return [];

    const { data, error } = await supabase
      .from('exams')
      .select('*, subjects(name, color)')
      .in('subject_id', subjectIds)
      .order('exam_date', { ascending: true });

    return data || [];
  }

  async createExam(subjectId, title, examDate, examTime = null, location = '') {
    const { data, error } = await supabase
      .from('exams')
      .insert({
        subject_id: subjectId,
        title,
        exam_date: examDate,
        exam_time: examTime,
        location,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select('*, subjects(name)')
      .single();

    if (error) {
      console.error('Error creating exam:', error);
      return null;
    }

    return data;
  }

  // ========== MATERIALES DE ESTUDIO ==========

  async getMaterialsByProfile(profileId) {
    const subjects = await this.getSubjectsByProfile(profileId);
    const subjectIds = subjects.map(s => s.id);

    if (subjectIds.length === 0) return [];

    const { data, error } = await supabase
      .from('materials')
      .select('*, subjects(name, color)')
      .in('subject_id', subjectIds)
      .order('created_at', { ascending: false });

    return data || [];
  }

  async createMaterial(subjectId, title, content = '', url = '', type = 'notes') {
    const { data, error } = await supabase
      .from('materials')
      .insert({
        subject_id: subjectId,
        title,
        content,
        url,
        type,
        status: 'not_started',
        created_at: new Date().toISOString()
      })
      .select('*, subjects(name)')
      .single();

    if (error) {
      console.error('Error creating material:', error);
      return null;
    }

    return data;
  }

  // ========== SESIONES POMODORO ==========

  async createPomodoroSession(profileId, sessionData) {
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .insert({
        profile_id: profileId,
        task_id: sessionData.task_id || null,
        exam_topic_id: sessionData.exam_topic_id || null,
        material_id: sessionData.material_id || null,
        session_type: sessionData.session_type || 'work',
        planned_duration_minutes: sessionData.planned_duration_minutes || 25,
        duration_seconds: sessionData.duration_seconds || 0,
        status: sessionData.status || 'in_progress',
        focus_rating: sessionData.focus_rating || null,
        started_at: sessionData.started_at || new Date().toISOString(),
        completed_at: sessionData.completed_at || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating pomodoro session:', error);
      return null;
    }

    return data;
  }

  async updatePomodoroSession(sessionId, updates) {
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    return data;
  }

  async getActivePomodoroSession(profileId) {
    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('profile_id', profileId)
      .eq('status', 'in_progress')
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting active session:', error);
      return null;
    }

    return data;
  }

  // ========== ESTADÍSTICAS ==========

  async getSessionsByProfile(profileId, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('profile_id', profileId)
      .eq('status', 'completed')
      .gte('completed_at', startDate.toISOString())
      .order('completed_at', { ascending: false });

    return data || [];
  }
}

export const supabaseService = new SupabaseService();
