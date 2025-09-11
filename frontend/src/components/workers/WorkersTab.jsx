import React, { useState, useContext } from 'react';
import WorkerForm from './WorkerForm';
import WorkersTable from './WorkersTable';
import { DataContext } from '../../context/DataContext';
import { Plus, Shuffle, CalendarOff } from 'lucide-react';

const WorkersTab = () => {
  const { addWorker, updateWorkerData, assignRandomRoles, assignRandomDaysOff } = useContext(DataContext);
  const [editingWorker, setEditingWorker] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setIsFormVisible(true);
  };

  const handleAddNew = () => {
    setEditingWorker(null);
    setIsFormVisible(true);
  };

  const handleCancel = () => {
    setEditingWorker(null);
    setIsFormVisible(false);
  };

  const handleSave = (workerData) => {
    if (editingWorker) {
      updateWorkerData(editingWorker._id, workerData);
    } else {
      addWorker(workerData);
    }
    setIsFormVisible(false);
    setEditingWorker(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Gestión de Trabajadores</h2>

      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={handleAddNew}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus size={20} />
          Agregar Trabajador
        </button>
        <button
          onClick={assignRandomRoles}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center gap-2"
        >
          <Shuffle size={20} />
          Asignar Roles Aleatorios
        </button>
        <button
          onClick={assignRandomDaysOff}
          className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 flex items-center gap-2"
        >
          <CalendarOff size={20} />
          Asignar Días Libres Aleatorios
        </button>
      </div>

      {isFormVisible && (
        <WorkerForm
          editingWorker={editingWorker}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
      
      <WorkersTable onEdit={handleEdit} />
    </div>
  );
};

export default WorkersTab;