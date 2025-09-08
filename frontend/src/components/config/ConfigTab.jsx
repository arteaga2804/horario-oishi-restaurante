import React, { useContext } from 'react';
import { DataContext } from '../../context/DataContext';

const ConfigTab = () => {
  const { dailyStaffConfig, updateDailyStaffConfig } = useContext(DataContext);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Configuración de Personal por Día</h2>
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <div className="grid grid-cols-4 gap-4 font-semibold text-gray-600 border-b pb-2">
          <div className="text-left">Día de la Semana</div>
          <div className="text-center">Personal de Apertura</div>
          <div className="text-center">Personal de Cierre</div>
          <div className="text-center">Demanda</div>
        </div>
        {dailyStaffConfig.map((config, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 items-center p-2 rounded-md hover:bg-gray-100">
            <div className="font-bold text-gray-800">{config.day}</div>
            <div className="flex justify-center">
              <input
                type="number"
                min="1"
                value={config.opening}
                onChange={(e) => {
                  const newConfig = [...dailyStaffConfig];
                  newConfig[index].opening = parseInt(e.target.value, 10) || 1;
                  updateDailyStaffConfig(newConfig);
                }}
                className="w-20 p-2 text-center border rounded-lg"
              />
            </div>
            <div className="flex justify-center">
              <input
                type="number"
                min="1"
                value={config.closing}
                onChange={(e) => {
                  const newConfig = [...dailyStaffConfig];
                  newConfig[index].closing = parseInt(e.target.value, 10) || 1;
                  updateDailyStaffConfig(newConfig);
                }}
                className="w-20 p-2 text-center border rounded-lg"
              />
            </div>
            <div className="flex justify-center">
              <select
                value={config.demand}
                onChange={(e) => {
                  const newConfig = [...dailyStaffConfig];
                  newConfig[index].demand = e.target.value;
                  updateDailyStaffConfig(newConfig);
                }}
                className="w-24 p-2 text-center border rounded-lg bg-white"
              >
                <option value="Bajo">Bajo</option>
                <option value="Alto">Alto</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConfigTab;
