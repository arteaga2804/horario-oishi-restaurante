import React from 'react';
import { PlusCircle } from 'lucide-react';

// This is a presentational component for displaying a schedule grid.
const ScheduleGrid = ({ 
    schedule, 
    dailyStaffConfig, 
    highDays = [], 
    onAssignmentClick, 
    onAddClick, 
    user 
}) => {
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const hoursByShift = { opening: 6, closing: 4 };

    const renderShift = (dayIndex, shiftType) => {
        const assignments = schedule[dayIndex]?.[shiftType] || [];
        const staffNeeded = dailyStaffConfig[dayIndex]?.[shiftType] || 0;
        const emptySlots = staffNeeded - assignments.length;

        return (
            <div className="flex flex-col gap-1">
                {assignments.map((assignment, idx) => (
                    <button
                        key={assignment._id || `assign-${idx}`}
                        onClick={() => onAssignmentClick && onAssignmentClick(assignment)}
                        className={`px-2 py-1 rounded text-white text-xs font-medium shadow-sm truncate text-left w-full ${onAssignmentClick && user && user.role === 'admin' ? 'cursor-pointer' : 'cursor-default'}`}
                        style={{ backgroundColor: assignment.role?.color || '#888' }}
                        title={`${assignment.role?.name} - ${assignment.worker?.name}`}
                    >
                        <span className="font-bold">{assignment.role?.code}</span> - <span>{assignment.worker?.name} ({hoursByShift[shiftType]}h)</span>
                    </button>
                ))}
                {onAddClick && user && user.role === 'admin' && Array.from({ length: emptySlots > 0 ? emptySlots : 0 }).map((_, idx) => (
                    <button
                        key={`empty-${dayIndex}-${shiftType}-${idx}`}
                        onClick={() => onAddClick(dayIndex, shiftType)}
                        className="px-2 py-1 rounded text-gray-500 bg-gray-100 border-dashed border-2 border-gray-300 text-xs font-medium shadow-sm truncate text-center w-full hover:bg-gray-200 flex items-center justify-center gap-1"
                    >
                        <PlusCircle size={12} /> Agregar
                    </button>
                ))}
            </div>
        );
    };

    return (
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
    );
};

export default ScheduleGrid;
