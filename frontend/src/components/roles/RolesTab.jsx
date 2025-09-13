import React, { useContext, useState } from 'react';
import { DataContext } from '../../context/DataContext';
import { Save, Plus, Pencil, Trash2 } from 'lucide-react';

      const RolesTab = () => {
          const { roles, addRole, removeRole, updateRole, user } = useContext(DataContext);
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
                  </div>

                  {user && user.role === 'admin' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-end gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
                          <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                              <input
                                  type="text"
                                  placeholder="ej: ROL01"
                                  value={roleForm.code}
                                  onChange={(e) => setRoleForm({...roleForm, code: e.target.value})}
                                  className="w-full p-2 border rounded-lg"
                                  disabled={!!editingRole}
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
                                          className="flex-1 bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 flex items-centerjustify-center gap-2"
                                      >
                                          <Save size={18} />
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
                                      <Plus size={18} />
                                      Agregar Rol
                                  </button>
                              )}
                          </div>
                      </div>
                  )}

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
                              {user && user.role === 'admin' && (
                                  <div className="flex gap-2">
                                      <button
                                          onClick={() => handleEditClick(role)}
                                          className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                      >
                                          <Pencil size={16} />
                                      </button>
                                      <button
                                          onClick={() => removeRole(role._id)}
                                          className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                                      >
                                          <Trash2 size={16} />
                                      </button>
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              </div>
          );
      };
export default RolesTab;