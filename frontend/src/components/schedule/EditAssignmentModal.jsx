import React, { useState, useContext } from 'react';
import { DataContext } from '../../context/DataContext';
import { Trash2 } from 'lucide-react'; // Import trash icon

const EditAssignmentModal = ({ assignment, onClose, onSave, onSwap, onDelete }) => {
  const { workers, schedule } = useContext(DataContext);
  const [mode, setMode] = useState('reassign'); // 'reassign', 'swap', or 'delete'
  const [selectedWorkerId, setSelectedWorkerId] = useState(assignment.worker?._id);
  const [selectedSwapTargetId, setSelectedSwapTargetId] = useState('');

  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Flatten schedule for swap dropdown
  const allAssignments = Object.values(schedule).flatMap(day => [...day.opening, ...day.closing]);
  const swapCandidates = allAssignments.filter(a => a._id !== assignment._id);

  const handleSave = () => {
    if (mode === 'reassign') {
      onSave(assignment._id, selectedWorkerId);
    } else if (mode === 'swap') {
      if (selectedSwapTargetId) {
        onSwap(assignment._id, selectedSwapTargetId);
      }
    }
    onClose();
  };

  const handleDelete = () => {
    onDelete(assignment._id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Editar Turno</h2>
        
        <div className="space-y-2 mb-4 p-4 bg-gray-50 rounded-lg">
          <div><span className="font-semibold">Día:</span> {daysOfWeek[assignment.day]}</div>
          <div><span className="font-semibold">Turno:</span> {assignment.shift === 'opening' ? 'Apertura' : 'Cierre'}</div>
          <div><span className="font-semibold">Rol:</span> {assignment.role?.name}</div>
          <div><span className="font-semibold">Trabajador Actual:</span> {assignment.worker?.name}</div>
          <div className="mt-2 pt-2 border-t">
            <span className="font-semibold text-sm text-gray-600">Roles del Trabajador:</span>
            <ul className="list-disc list-inside text-sm text-gray-500 mt-1">
              <li>Primario: {assignment.worker?.primaryRole?.name || 'N/A'}</li>
              <li>Secundario: {assignment.worker?.secondaryRole?.name || 'N/A'}</li>
              <li>Terciario: {assignment.worker?.tertiaryRole?.name || 'N/A'}</li>
            </ul>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex border-b">
            <button onClick={() => setMode('reassign')} className={`flex-1 py-2 ${mode === 'reassign' ? 'border-b-2 border-blue-500 font-semibold text-blue-600' : 'text-gray-500'}`}>Reasignar</button>
            <button onClick={() => setMode('swap')} className={`flex-1 py-2 ${mode === 'swap' ? 'border-b-2 border-blue-500 font-semibold text-blue-600' : 'text-gray-500'}`}>Intercambiar</button>
            <button onClick={() => setMode('delete')} className={`flex-1 py-2 ${mode === 'delete' ? 'border-b-2 border-red-500 font-semibold text-red-600' : 'text-gray-500'}`}>Eliminar</button>
          </div>
        </div>

        {mode === 'reassign' && (
          <div>
            <label htmlFor="worker-select" className="block text-sm font-medium text-gray-700 mb-2">Asignar a:</label>
            <select id="worker-select" value={selectedWorkerId} onChange={(e) => setSelectedWorkerId(e.target.value)} className="w-full p-2 border rounded-lg bg-white">
              {workers.map(worker => (
                <option key={worker._id} value={worker._id}>{worker.name}</option>
              ))}
            </select>
          </div>
        )}

        {mode === 'swap' && (
          <div>
            <label htmlFor="swap-select" className="block text-sm font-medium text-gray-700 mb-2">Intercambiar con:</label>
            <select id="swap-select" value={selectedSwapTargetId} onChange={(e) => setSelectedSwapTargetId(e.target.value)} className="w-full p-2 border rounded-lg bg-white">
              <option value="">Seleccionar un turno...</option>
              {swapCandidates.map(candidate => (
                <option key={candidate._id} value={candidate._id}>
                  {`${daysOfWeek[candidate.day]} - ${candidate.shift === 'opening' ? 'Apertura' : 'Cierre'} - ${candidate.worker?.name} (${candidate.role?.code})`}
                </option>
              ))}
            </select>
          </div>
        )}

        {mode === 'delete' && (
            <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="font-semibold text-red-700">¿Estás seguro de que quieres eliminar este turno?</p>
                <p className="text-sm text-red-600">Esta acción no se puede deshacer.</p>
            </div>
        )}

        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400">Cancelar</button>
          {mode === 'delete' ? (
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
              <Trash2 size={16} />
              Confirmar Eliminación
            </button>
          ) : (
            <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Guardar Cambios</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditAssignmentModal;