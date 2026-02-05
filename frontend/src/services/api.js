import axios from 'axios';

// Base API URL - will use proxy in development
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle API responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Employee API calls
export const employeeAPI = {
  // Get all employees with optional search and filters
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/employees/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single employee by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/employees/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new employee
  create: async (employeeData) => {
    try {
      const response = await api.post('/employees/', employeeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update employee (full update)
  update: async (id, employeeData) => {
    try {
      const response = await api.put(`/employees/${id}/`, employeeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Partial update employee
  partialUpdate: async (id, employeeData) => {
    try {
      const response = await api.patch(`/employees/${id}/`, employeeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete employee
  delete: async (id) => {
    try {
      const response = await api.delete(`/employees/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Search employees
  search: async (query) => {
    try {
      const response = await api.get('/employees/', { params: { q: query } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

// Attendance API calls
export const attendanceAPI = {
  // Get all attendance records with optional filters
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/attendance/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark attendance
  mark: async (attendanceData) => {
    try {
      const response = await api.post('/attendance/', attendanceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get attendance by date
  getByDate: async (date) => {
    try {
      const params = date ? { date } : {};
      const response = await api.get('/attendance/by_date/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get employee attendance history
  getByEmployee: async (employeeId) => {
    try {
      const response = await api.get('/attendance/by_employee/', {
        params: { employee_id: employeeId },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get dashboard statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/attendance/statistics/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default api;
