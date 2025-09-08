import React, { useContext, useState } from 'react';
import { DataContext } from '../../context/DataContext';

const RolesTab = () => {
    const { roles, addRole, removeRole, updateRole, refreshData } = useContext(DataContext);
  const [roleForm, setRoleForm] = useState({ code: '', name: '', color: '#FF6B6B' });
  const [editingRole, setEditingRole] = useState(null);

  const handleAddOrUpdateRole = () => {
    if (!roleForm.code || !roleForm.name) return;

    if (editingRole) {
      updateRole(editingRole._id, roleForm);
      setEditingRole(null);
    } else {
      addRole(roleForm);
    }
    setRoleForm({ code: '', name: '', color: '#FF6B6B' });
  };

  const handleEditClick = (role) => {
    setEditingRole(role);
    setRoleForm({ code: role.code, name: role.name, color: role.color });
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
    setRoleForm({ code: '', name: '', color: '#FF6B6B' });
  };

  return (
    <div>
            <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Roles y Códigos</h2>
        <button 
          onClick={refreshData} 
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.899 2.802 1 1 0 11-1.99.198A5.002 5.002 0 006 7.101V9a1 1 0 11-2 0V3a1 1 0 011-1zm12 14a1 1 0 01-1-1v-2.101a7.002 7.002 0 01-11.899-2.802 1 1 0 111.99-.198A5.002 5.002 0 0014 12.899V15a1 1 0 01-1 1z" clipRule="evenodd" />
          </svg>
          Actualizar
        </button>
      </div>
      
      {/* Formulario de rol */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-end gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
          <input
            type="text"
            placeholder="ej: ROL01"
            value={roleForm.code}
            onChange={(e) => setRoleForm({...roleForm, code: e.target.value})}
            className="w-full p-2 border rounded-lg"
            disabled={!!editingRole} // Disable code editing when in edit mode
          />
        </div>
        
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Rol</label>
          <input
            type="text"
            placeholder="Nombre del rol"
            value={roleForm.name}
            onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
            className="w-full p-2 border rounded-lg"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <input
            type="color"
            value={roleForm.color}
            onChange={(e) => setRoleForm({...roleForm, color: e.target.value})}
            className="w-full h-10 p-1 border rounded-lg"
          />
        </div>
        
        <div className="flex gap-2">
          {editingRole ? (
            <>
              <button
                onClick={handleAddOrUpdateRole}
                className="flex-1 bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
              >
                <span>💾</span>
                Actualizar
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={handleAddOrUpdateRole}
              className="flex-1 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <span>➕</span>
              Agregar Rol
            </button>
          )}
        </div>
      </div>
      
      {/* Lista de roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map(role => (
          <div key={role._id} className="border rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded"
                style={{ backgroundColor: role.color }}
              ></div>
              <div>
                <span className="font-semibold">{role.code}</span>
                <p className="text-gray-600">{role.name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEditClick(role)}
                className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                <span>✏️</span>
              </button>
              <button
                onClick={() => removeRole(role._id)}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <span>🗑️</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RolesTab;
