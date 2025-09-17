const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => {
    return localStorage.getItem('token');
};

const authHeader = () => {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const fetchWithAuth = (url, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...authHeader(),
        ...options.headers,
    };
    return fetch(url, { ...options, headers });
};

// Worker API calls
export const getWorkers = () => fetchWithAuth(`${API_URL}/workers`);
export const addWorker = (worker) => fetchWithAuth(`${API_URL}/workers`, {
    method: 'POST',
    body: JSON.stringify(worker)
});
export const updateWorker = (id, worker) => fetchWithAuth(`${API_URL}/workers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(worker)
});
export const deleteWorker = (id) => fetchWithAuth(`${API_URL}/workers/${id}`, { method: 'DELETE' });

// Role API calls
export const getRoles = () => fetchWithAuth(`${API_URL}/roles`);
export const createRole = (role) => fetchWithAuth(`${API_URL}/roles`, {
    method: 'POST',
    body: JSON.stringify(role)
});
export const deleteRole = (id) => fetchWithAuth(`${API_URL}/roles/${id}`, { method: 'DELETE' });
export const updateRole = (id, role) => fetchWithAuth(`${API_URL}/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(role)
});

// Schedule API calls
export const getSchedule = () => fetchWithAuth(`${API_URL}/schedule`);
export const generateSchedule = () => fetchWithAuth(`${API_URL}/schedule/generate`, { method: 'POST' });
export const updateAssignment = (id, assignment) => fetchWithAuth(`${API_URL}/schedule/${id}`, {
    method: 'PUT',
    body: JSON.stringify(assignment)
});
export const swapAssignments = (assignmentA_id, assignmentB_id) => fetchWithAuth(`${API_URL}/schedule/swap`, {
    method: 'POST',
    body: JSON.stringify({ assignmentA_id, assignmentB_id })
});
export const createAssignment = (assignment) => fetchWithAuth(`${API_URL}/schedule`, {
    method: 'POST',
    body: JSON.stringify(assignment)
});
export const deleteAssignment = (id) => fetchWithAuth(`${API_URL}/schedule/${id}`, { method: 'DELETE' });

// Config API calls
export const getDailyStaffConfig = () => fetchWithAuth(`${API_URL}/config`);
export const updateDailyStaffConfig = (config) => fetchWithAuth(`${API_URL}/config`, {
    method: 'PUT',
    body: JSON.stringify(config)
});

// Dashboard API calls
export const getDashboardSummary = (startDate, endDate) => {
    return fetchWithAuth(`${API_URL}/dashboard/summary?startDate=${startDate}&endDate=${endDate}`);
};

// History API calls
export const getScheduleHistoryList = () => fetchWithAuth(`${API_URL}/history`);
export const getScheduleHistoryById = (id) => fetchWithAuth(`${API_URL}/history/${id}`);

// Auth API calls
export const registerUser = (userData) => fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
});

export const loginUser = (userData) => fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
});

export const getMe = () => fetchWithAuth(`${API_URL}/auth/me`);