import React, { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { toast } from 'react-toastify';
import ScheduleGrid from '../schedule/ScheduleGrid';
import { ArrowLeft, Trash2 } from 'lucide-react';

const HistoryTab = () => {
    const [historyList, setHistoryList] = useState([]);
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchHistoryList();
    }, []);

    const handleDeleteHistory = async (historyId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este registro del historial? Esta acción no se puede deshacer.')) {
            try {
                const res = await api.deleteScheduleHistory(historyId);
                if (res.ok) {
                    toast.success('Registro del historial eliminado correctamente.');
                    setHistoryList(prevList => prevList.filter(item => item._id !== historyId));
                } else {
                    const data = await res.json();
                    toast.error(`Error al eliminar el historial: ${data.error}`);
                }
            } catch (err) {
                toast.error(`Error de conexión: ${err.message}`);
            }
        }
    };

    const fetchHistoryList = async () => {
        setIsLoading(true);
        try {
            const res = await api.getScheduleHistoryList();
            const data = await res.json();
            if (data.success) {
                setHistoryList(data.data);
            } else {
                toast.error(`Error al cargar el historial: ${data.error}`);
            }
        } catch (err) {
            toast.error(`Error de conexión: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectHistory = async (historyId) => {
        setIsLoading(true);
        try {
            const res = await api.getScheduleHistoryById(historyId);
            const data = await res.json();
            if (data.success) {
                // Re-format the schedule data for the grid component
                const formattedSchedule = {};
                data.data.assignments.forEach(assignment => {
                    if (!formattedSchedule[assignment.day]) {
                        formattedSchedule[assignment.day] = { opening: [], closing: [] };
                    }
                    formattedSchedule[assignment.day][assignment.shift].push(assignment);
                });
                setSelectedHistory({ ...data.data, schedule: formattedSchedule });
            } else {
                toast.error(`Error al cargar el detalle del historial: ${data.error}`);
            }
        } catch (err) {
            toast.error(`Error de conexión: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !selectedHistory) {
        return <div>Cargando historial...</div>;
    }

    if (selectedHistory) {
        return (
            <div>
                <button 
                    onClick={() => setSelectedHistory(null)} 
                    className="flex items-center gap-2 px-4 py-2 mb-4 rounded-lg font-medium text-white bg-gray-500 hover:bg-gray-600 transition-all"
                >
                    <ArrowLeft size={20} />
                    Volver al Historial
                </button>
                <h3 className="text-xl font-bold mb-2">Detalle del Horario</h3>
                <p className="mb-4 text-gray-600">
                    Generado por: <span className="font-semibold">{selectedHistory.generatedBy?.username}</span> el <span className="font-semibold">{new Date(selectedHistory.generationDate).toLocaleString()}</span>
                </p>
                <ScheduleGrid 
                    schedule={selectedHistory.schedule}
                    dailyStaffConfig={selectedHistory.dailyStaffConfig}
                />
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Historial de Horarios Generados</h2>
            <div className="space-y-3">
                {historyList.map(item => (
                    <div key={item._id} className="p-4 border rounded-lg hover:bg-gray-50 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-lg">Semana: {item.weekId}</p>
                            <p className="text-sm text-gray-500">
                                Generado por <span className="font-medium">{item.generatedBy?.username}</span> el {new Date(item.generationDate).toLocaleString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handleSelectHistory(item._id)}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Ver Detalle
                            </button>
                            <button 
                                onClick={() => handleDeleteHistory(item._id)}
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                title="Eliminar registro"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
                 {historyList.length === 0 && !isLoading && (
                    <p>No hay registros de horarios en el historial.</p>
                )}
            </div>
        </div>
    );
};

export default HistoryTab;
