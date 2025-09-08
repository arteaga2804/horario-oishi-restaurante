import React, { useState, useContext } from 'react';
import { DataContext } from '../../context/DataContext';

const AddAssignmentModal = ({ day, shift, onClose, onSave }) => {
  const { workers, roles } = useContext(DataContext);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');

  // TODO: Filter workers and roles who are eligible for this shift
  const availableWorkers = workers;
  const availableRoles = roles;

  const handleSave = () => {
    if (selectedWorkerId && selectedRoleId) {
      onSave({ 
        day, 
        shift, 
        worker: selectedWorkerId, 
        role: selectedRoleId 
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Agregar Turno</h2>
        
        <div className="space-y-4">
          <div>
            <span className="font-semibold">Día:</span> {new Date(0, 0, day).toLocaleDateString('es-ES', { weekday: 'long' })}
          </div>
          <div>
            <span className="font-semibold">Turno:</span> {shift === 'opening' ? 'Apertura' : 'Cierre'}
          </div>
          
          <hr />

          <div>
            <label htmlFor="worker-select" className="block text-sm font-medium text-gray-700 mb-2">
              Asignar Trabajador:
            </label>
            <select
              id="worker-select"
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white"
            >
              <option value="">Seleccionar trabajador...</option>
              {availableWorkers.map(worker => (
                <option key={worker._id} value={worker._id}>
                  {worker.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 mb-2">
              Asignar Rol:
            </label>
            <select
              id="role-select"
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white"
            >
              <option value="">Seleccionar rol...</option>
              {availableRoles.map(role => (
                <option key={role._id} value={role._id}>
                  {role.name} ({role.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAssignmentModal;