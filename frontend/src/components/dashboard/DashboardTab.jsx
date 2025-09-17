import React, { useContext } from 'react';
import { DataContext } from '../../context/DataContext';

const DashboardTab = () => {
    const {
        dashboardSummary,
        dashboardStartDate,
        dashboardEndDate,
        generateDashboardReport,
        isLoading
    } = useContext(DataContext);

    // Local state for inputs to avoid re-rendering the whole context on every keystroke
    const [localStartDate, setLocalStartDate] = React.useState(dashboardStartDate);
    const [localEndDate, setLocalEndDate] = React.useState(dashboardEndDate);

    const handleGenerateReport = () => {
        generateDashboardReport(localStartDate, localEndDate);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard de RRHH</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg items-end">
                <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                    <input
                        type="date"
                        id="start-date"
                        value={localStartDate}
                        onChange={(e) => setLocalStartDate(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
                    <input
                        type="date"
                        id="end-date"
                        value={localEndDate}
                        onChange={(e) => setLocalEndDate(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                <button
                    onClick={handleGenerateReport}
                    disabled={isLoading}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 h-10"
                >
                    {isLoading ? 'Generando...' : 'Generar Reporte'}
                </button>
            </div>

            {dashboardSummary.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-3 text-left">Trabajador</th>
                                <th className="border p-3 text-center">Horas Contratadas (Semanal)</th>
                                <th className="border p-3 text-center">Horas Agendadas</th>
                                <th className="border p-3 text-center">Horas Extra</th>
                                <th className="border p-3 text-center">Turnos Apertura</th>
                                <th className="border p-3 text-center">Turnos Cierre</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboardSummary.map(item => (
                                <tr key={item.workerId} className="hover:bg-gray-50">
                                    <td className="border p-3">{item.workerName}</td>
                                    <td className="border p-3 text-center">{item.contractedHours}h</td>
                                    <td className="border p-3 text-center">{item.scheduledHours}h</td>
                                    <td className="border p-3 text-center font-bold text-red-600">{item.overtimeHours > 0 ? `${item.overtimeHours}h` : '-'}</td>
                                    <td className="border p-3 text-center">{item.shiftDistribution.opening}</td>
                                    <td className="border p-3 text-center">{item.shiftDistribution.closing}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DashboardTab;
