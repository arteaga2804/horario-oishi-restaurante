import React, { useState, useContext } from 'react';
import { DataContext } from '../../context/DataContext';
import EditAssignmentModal from './EditAssignmentModal';
import AddAssignmentModal from './AddAssignmentModal';
import { Calendar, FileDown, MessageCircle, AlertTriangle, PlusCircle } from 'lucide-react';

const ScheduleTab = () => {
  const { schedule, roles, workers, dailyStaffConfig, generateSchedule, exportToPDF, exportToExcel, weeklyHours, isLoading, updateAssignment,
swapAssignments, createAssignment, user } = useContext(DataContext);
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

  const handleReassignSave = (assignmentId, newWorkerId) => {
    updateAssignment(assignmentId, newWorkerId);
  };

  const handleSwapSave = (assignmentA_id, assignmentB_id) => {
    swapAssignments(assignmentA_id, assignmentB_id);
  };

  const handleAddSave = (newAssignment) => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    const weekId = `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;

    createAssignment({ ...newAssignment, weekId });
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

  const renderShift = (dayIndex, shiftType) => {
    const assignments = schedule[dayIndex]?.[shiftType] || [];
    const staffNeeded = dailyStaffConfig[dayIndex]?.[shiftType] || 0;
    const emptySlots = staffNeeded - assignments.length;

    return (
      <div className="flex flex-col gap-1">
        {assignments.map((assignment, idx) => (
          <button
            key={assignment._id || `assign-${idx}`}
            onClick={() => handleAssignmentClick(assignment)}
            className={`px-2 py-1 rounded text-white text-xs font-medium shadow-sm truncate text-left w-full ${user && user.role === 'admin' ? 
'cursor-pointer' : 'cursor-default'}`}
            style={{ backgroundColor: assignment.role?.color || '#888' }}
            title={`${assignment.role?.name} - ${assignment.worker?.name}`}
          >
            <span className="font-bold">{assignment.role?.code}</span> - <span>{assignment.worker?.name} ({hoursByShift[shiftType]}h)</span>
          </button>
        ))}
        {user && user.role === 'admin' && Array.from({ length: emptySlots > 0 ? emptySlots : 0 }).map((_, idx) => (
            <button
                key={`empty-${dayIndex}-${shiftType}-${idx}`}
                onClick={() => handleAddClick(dayIndex, shiftType)}
                className="px-2 py-1 rounded text-gray-500 bg-gray-100 border-dashed border-2 border-gray-300 text-xs font-medium shadow-sm
truncate text-center w-full hover:bg-gray-200 flex items-center justify-center gap-1"
            >
                <PlusCircle size={12} /> Agregar
            </button>
        ))}
      </div>
    );
  };

  return (
    <div>
      {isEditModalOpen && (
        <EditAssignmentModal
          assignment={editingAssignment}
          onClose={handleCloseModals}
          onSave={handleReassignSave}
          onSwap={handleSwapSave}
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
        <div id="schedule-calendar-view" className="bg-white rounded-lg shadow-inner p-4">
          <div className="grid grid-cols-7 border-t border-l border-gray-300">
            {daysOfWeek.map(day => (
              <div key={day} className="text-center font-bold py-3 bg-gray-100 border-b border-r border-gray-300">{day}</div>
            ))}

            {daysOfWeek.map((day, index) => (
              <div
                key={index}
                className={`relative min-h-[250px] border-b border-r border-gray-300 ${highDays.includes(index) ? 'bg-red-50' : 'bg-white'}`}
              >
                <div className="p-2">
                  <div className="mb-4">
                    <h5 className="font-semibold text-blue-600 mb-2">Apertura</h5>
                    {renderShift(index, 'opening')}
                  </div>

                  <div>
                    <h5 className="font-semibold text-red-600 mb-2">Cierre</h5>
                    {renderShift(index, 'closing')}
                  </div>
                </div>
                {highDays.includes(index) && (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-red-200 text-red-800 text-xs font-bold rounded">ALTO</span>
                )}
              </div>
            ))}
          </div>
        </div>
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
