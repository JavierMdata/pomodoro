import React from 'react';
import { Book as BookIcon, AlertCircle } from 'lucide-react';

/**
 * Versión segura del componente de libros
 * Muestra un mensaje amigable si el sistema no está disponible
 */
export default function BooksManagerSafe() {
  return (
    <div className="p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
      <div className="max-w-md mx-auto text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-blue-100 rounded-full">
            <BookIcon className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            📚 Sistema de Libros
          </h3>
          <p className="text-gray-600">
            La sección de libros está lista para configurarse.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <div className="flex gap-2 items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Para activar esta sección:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-700">
                <li>Ejecuta el archivo SQL en Supabase</li>
                <li>Configura las funciones de carga de datos</li>
                <li>Refresca la aplicación</li>
              </ol>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Consulta la documentación en <code className="bg-gray-200 px-2 py-1 rounded">LIBROS_FEATURE.md</code>
        </p>
      </div>
    </div>
  );
}
