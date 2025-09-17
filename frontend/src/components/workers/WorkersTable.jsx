import React, { useContext } from 'react';
import { DataContext } from '../../context/DataContext';
import { Pencil, Trash2, NotebookText } from 'lucide-react';

      const WorkersTable = ({ onEdit, onOpenNotes }) => {
        const { workers, removeWorker, user } = useContext(DataContext);
        const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-3 text-left">Nombre</th>
                  <th className="border border-gray-300 p-3 text-left">Contrato</th>
                  <th className="border border-gray-300 p-3 text-left">Horas/Semana</th>
                  <th className="border border-gray-300 p-3 text-left">Días Libres</th>
                  <th className="border border-gray-300 p-3 text-left">Puesto Primario</th>
                  {user && user.role === 'admin' && <th className="border border-gray-300 p-3 text-left">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {workers.map(worker => {

                  return (
                  <tr key={worker._id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3">{worker.name}</td>
                    <td className="border border-gray-300 p-3">{worker.contractType}</td>
                    <td className="border border-gray-300 p-3">{worker.weeklyHours}h</td>
                    <td className="border border-gray-300 p-3">{worker.daysOff.map(d => daysOfWeek[d]).join(', ') || 'N/A'}</td>
                    <td className="border border-gray-300 p-3">{worker.primaryRole?.name || 'N/A'}</td>
                    {user && user.role === 'admin' && (
                      <td className="border border-gray-300 p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => onEdit(worker)}
                            className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            title="Editar trabajador"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => onOpenNotes(worker)}
                            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            title="Ver/Editar notas"
                          >
                            <NotebookText size={16} />
                          </button>
                          <button
                            onClick={() => removeWorker(worker._id)}
                            className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                            title="Eliminar trabajador"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        );
      };

export default WorkersTable;