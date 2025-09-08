import React, { useContext } from 'react';
import { DataContext } from '../../context/DataContext';

const ExportTab = () => {
  const { schedule, workers, roles, exportToPDF, exportToExcel, weeklyHours } = useContext(DataContext);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Exportar Horarios</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Opciones de exportación */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Formatos Disponibles</h3>
          
          <div className="space-y-4">
            <button
              onClick={exportToPDF}
              className="w-full bg-red-500 text-white p-4 rounded-lg hover:bg-red-600 flex items-center justify-center gap-3"
            >
              <span>⬇️</span>
              <div>
                <div className="font-semibold">Exportar a PDF</div>
                <div className="text-sm opacity-90">Formato ideal para impresión</div>
              </div>
            </button>
            
            <button
              onClick={exportToExcel}
              className="w-full bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 flex items-center justify-center gap-3"
            >
              <span>⬇️</span>
              <div>
                <div className="font-semibold">Exportar a Excel</div>
                <div className="text-sm opacity-90">Para edición y análisis</div>
              </div>
            </button>
          </div>
        </div>
        
        {/* Vista previa */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Vista Previa</h3>
          
          {Object.keys(schedule).length > 0 ? (
            <div className="text-sm space-y-2">
              <div className="font-semibold">Contenido del archivo:</div>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Horario semanal completo</li>
                <li>Asignación de roles por turno</li>
                <li>Control de horas por trabajador</li>
                <li>Leyenda de roles y colores</li>
                <li>Información de días de alta demanda</li>
              </ul>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="text-blue-800 font-medium">Estadísticas:</div>
                <div className="text-blue-700 text-sm">
                  • Total de trabajadores: {workers.length}<br/>
                  • Roles configurados: {roles.length}<br/>
                  • Horas totales asignadas: {Object.values(weeklyHours).reduce((a, b) => a + b, 0)}h
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Genera un horario primero para ver la vista previa
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportTab;
