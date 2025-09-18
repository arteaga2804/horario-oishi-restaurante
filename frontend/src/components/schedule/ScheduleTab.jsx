import React, { useState, useContext } from 'react';
import { DataContext } from '../../context/DataContext';
import EditAssignmentModal from './EditAssignmentModal';
import AddAssignmentModal from './AddAssignmentModal';
import { Calendar, FileDown, MessageCircle, AlertTriangle, PlusCircle } from 'lucide-react';
import ScheduleGrid from './ScheduleGrid';

const ScheduleTab = () => {
  const { schedule, roles, workers, dailyStaffConfig, generateSchedule, exportToPDF, exportToExcel, weeklyHours, isLoading, updateAssignment,
swapAssignments, createAssignment, deleteAssignment, user } = useContext(DataContext);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [addingToSlot, setAddingToSlot] = useState(null);

  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const hoursByShift = { opening: 6, closing: 4 };

  const highDays = dailyStaffConfig.map((d, i) => d.demand === 'Alto' ? i : -1).filter(i => i !== -1);

  const handleAssignmentClick = (assignment) => {
    if (user && user.role === 'admin') {
      setEditingAssignment(assignment);
      setIsEditModalOpen(true);
    }
  };

  const handleAddClick = (day, shift) => {
    if (user && user.role === 'admin') {
      setAddingToSlot({ day, shift });
      setIsAddModalOpen(true);
    }
  };

  const handleCloseModals = () => {
    setIsEditModalOpen(false);
    setEditingAssignment(null);
    setIsAddModalOpen(false);
    setAddingToSlot(null);
  };

  const handleModalSave = (assignmentId, updates) => {
    updateAssignment(assignmentId, updates);
  };

  const handleSwapSave = (assignmentA_id, assignmentB_id) => {
    swapAssignments(assignmentA_id, assignmentB_id);
  };

  const handleAddSave = (newAssignment) => {
    // --- Calculate weekId ---
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    const weekId = `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;

    // --- Calculate specific date ---
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0=Sunday
    const sundayOfThisWeek = new Date(today);
    sundayOfThisWeek.setDate(today.getDate() - currentDayOfWeek);
    sundayOfThisWeek.setHours(0, 0, 0, 0);
    
    const assignmentDate = new Date(sundayOfThisWeek);
    assignmentDate.setDate(sundayOfThisWeek.getDate() + newAssignment.day);

    // --- Call createAssignment with all required fields ---
    createAssignment({ ...newAssignment, weekId, date: assignmentDate });
  };

  const validateCoverage = () => {
    const alerts = [];
    if (Object.keys(schedule).length === 0 || !dailyStaffConfig || dailyStaffConfig.length === 0) return alerts;

    daysOfWeek.forEach((day, dayIndex) => {
      const config = dailyStaffConfig[dayIndex];
      if(!config) return;
      const openingAssignments = schedule[dayIndex]?.opening?.length || 0;
      const closingAssignments = schedule[dayIndex]?.closing?.length || 0;

      if (openingAssignments < config.opening) {
        alerts.push(`Faltan ${config.opening - openingAssignments} trabajador(es) en Apertura el ${day}`);
      }
      if (closingAssignments < config.closing) {
        alerts.push(`Faltan ${config.closing - closingAssignments} trabajador(es) en Cierre el ${day}`);
      }
    });

    return alerts;
  };

  const handleSendWhatsApp = (worker) => {
    if (!worker.phone) {
      alert('Este trabajador no tiene un número de teléfono configurado.');
      return;
    }

    let message = `¡Hola ${worker.name}! Aquí está tu horario para la semana:\n\n`;
    const workerAssignments = [];

    daysOfWeek.forEach((day, dayIndex) => {
      const openingShift = schedule[dayIndex]?.opening.find(a => a.worker?._id === worker._id);
      const closingShift = schedule[dayIndex]?.closing.find(a => a.worker?._id === worker._id);

      if (openingShift) {
        workerAssignments.push(`${day}: Apertura (${openingShift.role?.name})`);
      }
      if (closingShift) {
        workerAssignments.push(`${day}: Cierre (${closingShift.role?.name})`);
      }
    });

    if (workerAssignments.length > 0) {
      message += workerAssignments.join('\n');
    } else {
      message += 'No tienes turnos asignados esta semana.';
    }

    const totalHours = weeklyHours[worker._id] || 0;
    message += `\n\nTotal de horas: ${totalHours}h.`;

    const phoneNumber = worker.phone.replace(/\s|\+/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };

  

  return (
    <div>
      {isEditModalOpen && (
        <EditAssignmentModal
          assignment={editingAssignment}
          onClose={handleCloseModals}
          onSave={handleModalSave}
          onSwap={handleSwapSave}
          onDelete={deleteAssignment}
        />
      )}
      {isAddModalOpen && (
        <AddAssignmentModal
          day={addingToSlot.day}
          shift={addingToSlot.shift}
          onClose={handleCloseModals}
          onSave={handleAddSave}
        />
      )}
      <h2 className="text-2xl font-bold mb-6">Generación de Horarios</h2>

      {user && user.role === 'admin' && (
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={generateSchedule}
            disabled={isLoading}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 flex items-center gap-2 disabled:bg-gray-400"
          >
            <Calendar size={20} />
            {isLoading ? 'Generando...' : 'Generar Horario Completo'}
          </button>

          <button
            onClick={exportToPDF}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 flex items-center gap-2"
          >
            <FileDown size={20} />
            Exportar PDF
          </button>

          <button
            onClick={exportToExcel}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <FileDown size={20} />
            Exportar Excel
          </button>
        </div>
      )}

      {Object.keys(schedule).length > 0 && (
        <div className="mb-6">
          {validateCoverage().length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-red-800 font-semibold mb-2">
                <AlertTriangle size={20} />
                Alertas de Cobertura
              </div>
              <ul className="list-disc list-inside text-red-700">
                {validateCoverage().map((alert, index) => (
                  <li key={index}>{alert}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {roles.length > 0 && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Leyenda de Roles</h3>
          <div className="flex flex-wrap gap-3">
            {roles.map(role => (
              <div key={role._id} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: role.color }}
                ></div>
                <span className="text-sm font-medium">{role.code}</span>
                <span className="text-sm text-gray-600">{role.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(schedule).length > 0 && (
        <ScheduleGrid 
          schedule={schedule}
          dailyStaffConfig={dailyStaffConfig}
          highDays={highDays}
          onAssignmentClick={handleAssignmentClick}
          onAddClick={handleAddClick}
          user={user}
        />
      )}

      {Object.keys(weeklyHours).length > 0 && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Control de Horas Semanales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workers.map(worker => {
              const assignedHours = weeklyHours[worker._id] || 0;
              const requiredHours = worker.weeklyHours;
              const isComplete = assignedHours === requiredHours;
              const isOvertime = assignedHours > requiredHours;

              return (
                <div
                  key={worker._id}
                  className={`p-3 rounded border-2 ${
                    isComplete ? 'border-green-500 bg-green-50' :
                    isOvertime ? 'border-red-500 bg-red-50' :
                    'border-yellow-500 bg-yellow-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{worker.name}</div>
                    <button
                      onClick={() => handleSendWhatsApp(worker)}
                      className="p-1 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:bg-gray-400"
                      title={`Enviar horario a ${worker.name} por WhatsApp`}
                      disabled={!worker.phone}
                    >
                      <MessageCircle size={16} />
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    {assignedHours}h / {requiredHours}h
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        isComplete ? 'bg-green-500' :
                        isOvertime ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.min((assignedHours / requiredHours) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleTab;
