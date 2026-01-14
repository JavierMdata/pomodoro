/**
 * Utilidades para manejo de fechas
 */

export function parseRelativeDate(text) {
  const lowerText = text.toLowerCase();
  const now = new Date();

  // Hoy
  if (lowerText.includes('hoy')) {
    return now.toISOString().split('T')[0];
  }

  // Mañana
  if (lowerText.includes('mañana')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  // Pasado mañana
  if (lowerText.includes('pasado mañana')) {
    const dayAfter = new Date(now);
    dayAfter.setDate(dayAfter.getDate() + 2);
    return dayAfter.toISOString().split('T')[0];
  }

  // Días de la semana
  const daysOfWeek = {
    'lunes': 1,
    'martes': 2,
    'miércoles': 3,
    'miercoles': 3,
    'jueves': 4,
    'viernes': 5,
    'sábado': 6,
    'sabado': 6,
    'domingo': 0
  };

  for (const [day, targetDay] of Object.entries(daysOfWeek)) {
    if (lowerText.includes(day)) {
      const currentDay = now.getDay();
      let daysToAdd = targetDay - currentDay;

      if (daysToAdd <= 0) {
        daysToAdd += 7; // Próxima semana
      }

      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + daysToAdd);
      return targetDate.toISOString().split('T')[0];
    }
  }

  // Formato DD/MM o DD-MM
  const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1;
    const year = now.getFullYear();
    const date = new Date(year, month, day);

    // Si la fecha ya pasó este año, usar el próximo año
    if (date < now) {
      date.setFullYear(year + 1);
    }

    return date.toISOString().split('T')[0];
  }

  return null;
}

export function parseTime(text) {
  // Formato HH:MM
  const timeMatch = text.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
  }

  // Formato "a las 10", "a las 3 pm"
  const timeTextMatch = text.match(/(?:a las?|al?) (\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (timeTextMatch) {
    let hour = parseInt(timeTextMatch[1]);
    const minutes = timeTextMatch[2] || '00';
    const period = timeTextMatch[3]?.toLowerCase();

    if (period === 'pm' && hour < 12) {
      hour += 12;
    } else if (period === 'am' && hour === 12) {
      hour = 0;
    }

    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  }

  return null;
}

export function formatDateRelative(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '🔴 Hoy';
  if (diffDays === 1) return '🟠 Mañana';
  if (diffDays === 2) return '🟡 Pasado mañana';
  if (diffDays > 0 && diffDays <= 7) return `🟢 En ${diffDays} días`;
  if (diffDays < 0) return '⚫ Pasado';

  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getUpcomingDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}
