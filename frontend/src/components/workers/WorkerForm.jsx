import React, { useState, useContext, useEffect } from 'react';
import { DataContext } from '../../context/DataContext';
import MultiSelectDropdown from '../common/MultiSelectDropdown';

const WorkerForm = ({ onSave, onCancel, editingWorker }) => {
  const { roles, addWorker, updateWorkerData } = useContext(DataContext);
  const [form, setForm] = useState({
    name: '', phone: '', contractType: 'Tiempo Completo', weeklyHours: 40, 
    daysOff: [], primaryRole: '', secondaryRole: '', tertiaryRole: ''
  });

  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  useEffect(() => {
    if (editingWorker) {
      setForm({
        name: editingWorker.name,
        phone: editingWorker.phone || '',
        contractType: editingWorker.contractType,
        weeklyHours: editingWorker.weeklyHours,
        daysOff: editingWorker.daysOff || [],
        primaryRole: editingWorker.primaryRole?._id || '',
        secondaryRole: editingWorker.secondaryRole?._id || '',
        tertiaryRole: editingWorker.tertiaryRole?._id || '',
      });
    } else {
      setForm({
        name: '', phone: '', contractType: 'Tiempo Completo', weeklyHours: 40, 
        daysOff: [], primaryRole: '', secondaryRole: '', tertiaryRole: ''
      });
    }
  }, [editingWorker]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) {
      alert('El nombre del trabajador es obligatorio.');
      return;
    }
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
        <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full p-2 border rounded-lg" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (WhatsApp)</label>
        <input type="tel" name="phone" placeholder="Código país + número" value={form.phone} onChange={handleChange} className="w-full p-2 border rounded-lg" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Contrato</label>
        <select name="contractType" value={form.contractType} onChange={handleChange} className="w-full p-2 border rounded-lg">
          <option value="Tiempo Completo">Tiempo Completo</option>
          <option value="Part Time Dia">Part Time Dia</option>
          <option value="Part Time Noche">Part Time Noche</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Horas Semanales</label>
        <input type="number" name="weeklyHours" placeholder="Horas semanales" value={form.weeklyHours} onChange={handleChange} className="w-full p-2 border rounded-lg" />
      </div>
      
      <div className="lg:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Días Libres</label>
        <MultiSelectDropdown
          options={daysOfWeek}
          selectedOptions={form.daysOff}
          onChange={(newDaysOff) => setForm({ ...form, daysOff: newDaysOff })}
          placeholder="Seleccionar días libres"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Puesto Primario</label>
        <select name="primaryRole" value={form.primaryRole} onChange={handleChange} className="w-full p-2 border rounded-lg">
          <option value="">Puesto Primario</option>
          {roles.map(role => (
            <option key={role._id} value={role._id}>{role.code} - {role.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Puesto Secundario</label>
        <select name="secondaryRole" value={form.secondaryRole} onChange={handleChange} className="w-full p-2 border rounded-lg">
          <option value="">Puesto Secundario</option>
          {roles.map(role => (
            <option key={role._id} value={role._id}>{role.code} - {role.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Puesto Terciario</label>
        <select name="tertiaryRole" value={form.tertiaryRole} onChange={handleChange} className="w-full p-2 border rounded-lg">
          <option value="">Puesto Terciario</option>
          {roles.map(role => (
            <option key={role._id} value={role._id}>{role.code} - {role.name}</option>
          ))}
        </select>
      </div>
      
      <div className="flex gap-2 items-end">
        <button type="submit" className="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2">
          {editingWorker ? 'Actualizar' : 'Agregar'}
        </button>
        {editingWorker && (
          <button type="button" onClick={onCancel} className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default WorkerForm;