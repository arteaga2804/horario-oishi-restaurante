import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import ExcelJS from "exceljs";
import { toast } from 'react-toastify';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [workers, setWorkers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [weeklyHours, setWeeklyHours] = useState({});
  const [dailyStaffConfig, setDailyStaffConfig] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null); // Add user state

  const fetchSchedule = async () => {
    try {
      const [scheduleRes, workersRes] = await Promise.all([api.getSchedule(), api.getWorkers()]);
      const scheduleData = await scheduleRes.json();
      const workersData = await workersRes.json();

      if (scheduleData.success && workersData.success) {
        const newSchedule = {};
        const newWeeklyHours = {};
        
        const currentWorkers = workersData.data;
        currentWorkers.forEach(worker => newWeeklyHours[worker._id] = 0);

        scheduleData.data.forEach(assignment => {
          if (!newSchedule[assignment.day]) {
            newSchedule[assignment.day] = { opening: [], closing: [] };
          }
          newSchedule[assignment.day][assignment.shift].push(assignment);
          if (newWeeklyHours[assignment.worker?._id.toString()] !== undefined) {
              newWeeklyHours[assignment.worker._id.toString()] += (assignment.shift === 'opening' ? 6 : 4);
          }
        });
        setSchedule(newSchedule);
        setWeeklyHours(newWeeklyHours);
        setWorkers(currentWorkers); // Actualizar el estado de los trabajadores
      }
    } catch (e) {
        console.error("Failed to fetch schedule", e);
        setError(e.message);
        toast.error(`Error al cargar horario: ${e.message}`);
    }
  };

  const refreshData = useCallback(async () => {
    console.log("Fetching all data...");
    setIsLoading(true);
    setError(null);
    try {
        const [rolesRes, configRes] = await Promise.all([
            api.getRoles(),
            api.getDailyStaffConfig()
        ]);

        const rolesData = await rolesRes.json();
        const configData = await configRes.json();

        if (rolesData.success) {
            setRoles(rolesData.data);
        }
       
        if (configData.success) setDailyStaffConfig(configData.data.dailyStaffConfig);
        
        await fetchSchedule();
        toast.success("Datos actualizados correctamente.");

    } catch (e) {
        setError(e.message);
        console.error("Failed to refresh all data", e);
        toast.error(`Error al actualizar datos: ${e.message}`);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      refreshData();
    }
  }, [refreshData, token]);


  const addRole = async (role) => {
    const res = await api.createRole(role);
    const data = await res.json();
    if (data.success) {
      setRoles(prevRoles => [...prevRoles, data.data]);
      toast.success("Rol agregado correctamente.");
    } else {
      toast.error(`Error al agregar rol: ${data.error}`);
    }
  };

  const removeRole = async (id) => {
    const res = await api.deleteRole(id);
    if (res.ok) {
      setRoles(prevRoles => prevRoles.filter(r => r._id !== id));
      toast.info("Rol eliminado correctamente.");
    } else {
      const data = await res.json();
      toast.error(`Error al eliminar rol: ${data.error}`);
    }
  };

  const updateRole = async (id, updatedRole) => {
    const res = await api.updateRole(id, updatedRole);
    const data = await res.json();
    if (data.success) {
      setRoles(prevRoles => prevRoles.map(r => (r._id === id ? data.data : r)));
      toast.success("Rol actualizado correctamente.");
    } else {
      toast.error(`Error al actualizar rol: ${data.error}`);
    }
  };

  const addWorker = async (worker) => {
    const res = await api.addWorker(worker);
    const data = await res.json();
    if (data.success) {
      setWorkers(prevWorkers => [...prevWorkers, data.data]);
      toast.success("Trabajador agregado correctamente.");
    } else {
      toast.error(`Error al agregar trabajador: ${data.error}`);
    }
  };

  const removeWorker = async (id) => {
    const res = await api.deleteWorker(id);
    if (res.ok) {
      setWorkers(prevWorkers => prevWorkers.filter(w => w._id !== id));
      toast.info("Trabajador eliminado correctamente.");
    } else {
      const data = await res.json();
      toast.error(`Error al eliminar trabajador: ${data.error}`);
    }
  };

  const updateWorkerData = async (id, updatedWorker) => {
    try {
      const workerToSend = { ...updatedWorker };
      if (workerToSend.primaryRole === '') workerToSend.primaryRole = null;
      if (workerToSend.secondaryRole === '') workerToSend.secondaryRole = null;
      if (workerToSend.tertiaryRole === '') workerToSend.tertiaryRole = null;

      const res = await api.updateWorker(id, workerToSend);
      const data = await res.json();
      if (data.success) {
        setWorkers(prevWorkers => prevWorkers.map(w => (w._id === id ? data.data : w)));
        toast.success("Trabajador actualizado correctamente.");
      } else {
        toast.error(`Error al actualizar trabajador: ${data.error}`);
      }
    } catch (e) {
      toast.error(`Error al actualizar trabajador: ${e.message}`);
    }
  };

  const updateDailyStaffConfig = async (newConfig) => {
    try {
      const res = await api.updateDailyStaffConfig({ dailyStaffConfig: newConfig });
      const data = await res.json();
      if (data.success) {
        setDailyStaffConfig(data.data.dailyStaffConfig);
        toast.success("Configuración actualizada correctamente.");
      } else {
        console.error("Error al actualizar configuración:", data.error);
        toast.error(`Error al actualizar configuración: ${data.error}`);
      }
    } catch (e) {
      console.error("Fallo la llamada a la API para actualizar configuración:", e);
      toast.error(`Fallo la llamada a la API para actualizar configuración: ${e.message}`);
    }
  };
  
  const generateSchedule = async () => {
    console.log('Generando horario...');
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.generateSchedule();
      const data = await res.json();
      if (data.success) {
        await fetchSchedule();
        toast.success("Horario generado correctamente.");
      } else {
        toast.error(`Error al generar horario: ${data.error}`);
      }
    } catch (e) {
      setError(e.message);
      toast.error(`Error al generar horario: ${e.message}`);
    }
  };

  const assignRandomRoles = async () => {
    if (roles.length < 1) {
      toast.warn("No hay roles definidos para asignar.");
      return;
    }

    const updatePromises = workers.map(worker => {
      const shuffledRoles = [...roles].sort(() => 0.5 - Math.random());
      const primaryRole = shuffledRoles[0]?._id || null;
      const secondaryRole = shuffledRoles[1]?._id || null;
      const tertiaryRole = shuffledRoles[2]?._id || null;

      const updatedWorker = {
        ...worker,
        primaryRole,
        secondaryRole,
        tertiaryRole,
      };
      return api.updateWorker(worker._id, updatedWorker);
    });

    try {
      await Promise.all(updatePromises);
      await refreshData();
      toast.success("Roles aleatorios asignados con éxito.");
    } catch (e) {
      toast.error(`Error al asignar roles aleatorios: ${e.message}`);
    }
  };

  const assignRandomDaysOff = async () => {
    if (workers.length === 0) return;

    const days = [0, 1, 2, 3, 4, 5, 6];
    
    const updatePromises = workers.map(worker => {
      const shuffledDays = [...days].sort(() => 0.5 - Math.random());
      const updatedWorker = { ...worker, daysOff: [shuffledDays[0]] };
      return api.updateWorker(worker._id, updatedWorker);
    });

    try {
      await Promise.all(updatePromises);
      await refreshData();
      toast.success("Días libres aleatorios asignados con éxito.");
    } catch (e) {
      toast.error(`Error al asignar días libres: ${e.message}`);
    }
  };

  const updateAssignment = async (assignmentId, newWorkerId) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.updateAssignment(assignmentId, { worker: newWorkerId });
      const data = await res.json();
      if (data.success) {
        await refreshData();
        toast.success("Turno actualizado correctamente.");
      } else {
        toast.error(`Error al actualizar el turno: ${data.error}`);
      }
    } catch (e) {
      setError(e.message);
      toast.error(`Error al actualizar el turno: ${e.message}`);
    }
  };

  const swapAssignments = async (assignmentA_id, assignmentB_id) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.swapAssignments(assignmentA_id, assignmentB_id);
      const data = await res.json();
      if (data.success) {
        await refreshData();
        toast.success("Intercambio de turnos realizado correctamente.");
      } else {
        toast.error(`Error al intercambiar turnos: ${data.error}`);
      }
    } catch (e) {
      setError(e.message);
      toast.error(`Error al intercambiar turnos: ${e.message}`);
    }
  };

  const createAssignment = async (assignment) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.createAssignment(assignment);
      const data = await res.json();
      if (data.success) {
        await refreshData();
        toast.success("Turno agregado correctamente.");
      } else {
        toast.error(`Error al crear el turno: ${data.error}`);
      }
    } catch (e) {
      setError(e.message);
      toast.error(`Error al crear el turno: ${e.message}`);
    }
  };

  const deleteAssignment = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.deleteAssignment(id);
      if (res.ok) {
        await refreshData(); // Using refreshData to ensure weeklyHours are recalculated
        toast.success("Turno eliminado correctamente.");
      } else {
        const data = await res.json();
        toast.error(`Error al eliminar el turno: ${data.error}`);
      }
    } catch (e) {
      setError(e.message);
      toast.error(`Error al eliminar el turno: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = () => {
    if (Object.keys(schedule).length === 0) {
      toast.warn('Primero debes generar un horario para poder exportarlo.');
      return;
    }
    const scheduleElement = document.getElementById('schedule-calendar-view');
    
    if (scheduleElement) {
      setTimeout(() => {
        html2canvas(scheduleElement, { scale: 2, useCORS: true }).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'pt',
            format: [canvas.width, canvas.height]
          });
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
          pdf.save('horario-restaurante.pdf');
          toast.success("PDF exportado correctamente.");
        }).catch(error => {
          console.error("Error en html2canvas:", error);
          toast.error("Ocurrió un error al intentar generar el PDF. Por favor, inténtalo de nuevo.");
        });
      }, 100);
    } else {
      toast.error("Error: No se pudo encontrar el contenedor del horario para exportar.");
    }
  };

    const exportToExcel = async () => {
    if (Object.keys(schedule).length === 0) {
      toast.warn('Primero debes generar un horario para poder exportarlo.');
      return;
    }
    
    const dataForExcel = [];
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    dataForExcel.push(['Día', 'Turno', 'Puesto', 'Trabajador']);

    daysOfWeek.forEach((day, index) => {
      schedule[index]?.opening?.forEach(assignment => {
        dataForExcel.push([day, 'Apertura', assignment.role?.name, assignment.worker?.name]);
      });
      schedule[index]?.closing?.forEach(assignment => {
        dataForExcel.push([day, 'Cierre', assignment.role?.name, assignment.worker?.name]);
      });
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Horario');

    dataForExcel.forEach(row => {
      worksheet.addRow(row);
    });

    worksheet.columns.forEach((col, i) => {
      let maxLength = 10;
      col.eachCell?.({ includeEmpty: true }, cell => {
        const cellLength = cell.value ? cell.value.toString().length : 0;
        if (cellLength > maxLength) maxLength = cellLength;
      });
      col.width = maxLength + 2;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Horario.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Excel exportado correctamente.");
  };

  const value = {
    workers,
    roles,
    schedule,
    weeklyHours,
    dailyStaffConfig,
    addRole,
    removeRole,
    updateRole,
    addWorker,
    removeWorker,
    updateWorkerData,
    generateSchedule,
    exportToPDF,
    exportToExcel,
    refreshData,
    updateDailyStaffConfig,
    assignRandomRoles,
    assignRandomDaysOff,
    isLoading,
    error,
    updateAssignment,
    swapAssignments,
    createAssignment,
    deleteAssignment, // <-- Add this
    user, // Expose user
    setUser, // Expose setUser
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};