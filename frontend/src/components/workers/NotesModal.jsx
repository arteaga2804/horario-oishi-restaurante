import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';

const NotesModal = ({ worker, onSave, onClose }) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (worker && worker.notes) {
      setNotes(worker.notes);
    } else {
      setNotes('');
    }
  }, [worker]);

  const handleSave = () => {
    onSave(worker._id, { ...worker, notes });
    onClose();
  };

  if (!worker) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Notas para {worker.name}</h2>
        
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full h-48 p-2 border rounded-lg mb-4 resize-y"
          placeholder="Escribe tus notas aquí..."
        />
        
        <div className="mt-auto flex justify-end gap-4 pt-4 border-t">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 flex items-center gap-2"
          >
            <X size={18} />
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <Save size={18} />
            Guardar Notas
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesModal;
