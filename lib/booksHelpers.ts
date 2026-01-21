// ============================================================================
// MANEJO SEGURO DE LIBROS - Evita errores si no está implementado
// ============================================================================
// Este archivo proporciona datos vacíos por defecto para evitar errores

import { Book, BookReadingSession, BookQuote, ReadingGoal } from './types';

// Datos vacíos por defecto
export const EMPTY_BOOKS_DATA = {
  books: [] as Book[],
  readingSessions: [] as BookReadingSession[],
  bookQuotes: [] as BookQuote[],
  readingGoals: [] as ReadingGoal[],
};

// Funciones stub que no hacen nada (para evitar errores)
export const EMPTY_BOOKS_HANDLERS = {
  handleAddBook: async (book: Partial<Book>) => {
    console.log('Sistema de libros no inicializado aún');
  },
  handleUpdateBook: async (id: string, updates: Partial<Book>) => {
    console.log('Sistema de libros no inicializado aún');
  },
  handleDeleteBook: async (id: string) => {
    console.log('Sistema de libros no inicializado aún');
  },
  handleAddReadingSession: async (session: Partial<BookReadingSession>) => {
    console.log('Sistema de libros no inicializado aún');
  },
  handleAddQuote: async (quote: Partial<BookQuote>) => {
    console.log('Sistema de libros no inicializado aún');
  },
};

// Función para verificar si el sistema de libros está disponible
export async function checkBooksSystemAvailable(supabase: any): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('id')
      .limit(1);

    return !error;
  } catch (err) {
    return false;
  }
}
