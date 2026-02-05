import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { employeeAPI, attendanceAPI } from '../services/api';

const EmployeeContext = createContext();

export const useEmployees = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
};

export const EmployeeProvider = ({ children }) => {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load employees from API
  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getAll();
      if (response.success) {
        setEmployees(response.data);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load statistics from API
  const loadStatistics = useCallback(async () => {
    try {
      const response = await attendanceAPI.getStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  }, []);

  // Load attendance records
  const loadAttendance = useCallback(async (params = {}) => {
    try {
      const response = await attendanceAPI.getAll(params);
      if (response.success) {
        setAttendance(response.data);
      }
    } catch (err) {
      console.error('Error loading attendance:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadEmployees();
    loadStatistics();
  }, [loadEmployees, loadStatistics]);

  // Add new employee
  const addEmployee = async (employeeData) => {
    try {
      // Map frontend field names to backend field names
      const backendData = {
        employee_id: employeeData.id,
        name: employeeData.name,
        email: employeeData.email,
        department: employeeData.department,
      };

      const response = await employeeAPI.create(backendData);
      
      if (response.success) {
        // Reload employees to get the updated list
        await loadEmployees();
        await loadStatistics();
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (err) {
      console.error('Error adding employee:', err);
      return { 
        success: false, 
        error: err.error || err.message || 'Failed to add employee' 
      };
    }
  };

  // Update employee
  const updateEmployee = async (employeeId, employeeData) => {
    try {
      const backendData = {
        employee_id: employeeData.id || employeeData.employee_id,
        name: employeeData.name,
        email: employeeData.email,
        department: employeeData.department,
      };

      const response = await employeeAPI.update(employeeId, backendData);
      
      if (response.success) {
        await loadEmployees();
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (err) {
      console.error('Error updating employee:', err);
      return { 
        success: false, 
        error: err.error || err.message || 'Failed to update employee' 
      };
    }
  };

  // Delete employee
  const deleteEmployee = async (employeeId) => {
    try {
      const response = await employeeAPI.delete(employeeId);
      
      if (response.success) {
        // Reload employees and statistics
        await loadEmployees();
        await loadStatistics();
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (err) {
      console.error('Error deleting employee:', err);
      return { 
        success: false, 
        error: err.error || err.message || 'Failed to delete employee' 
      };
    }
  };

  // Mark attendance
  const markAttendance = async (employeeId, date, status) => {
    try {
      const attendanceData = {
        employee_id: employeeId,
        date: date,
        status: status,
      };

      const response = await attendanceAPI.mark(attendanceData);
      
      if (response.success) {
        // Reload attendance and statistics
        await loadAttendance();
        await loadStatistics();
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (err) {
      console.error('Error marking attendance:', err);
      return { 
        success: false, 
        error: err.error || err.message || 'Failed to mark attendance' 
      };
    }
  };

  // Get attendance for an employee
  const getEmployeeAttendance = async (employeeId) => {
    try {
      const response = await attendanceAPI.getByEmployee(employeeId);
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error('Error getting employee attendance:', err);
      return null;
    }
  };

  // Get attendance for a specific date
  const getAttendanceByDate = async (date) => {
    try {
      const response = await attendanceAPI.getByDate(date);
      if (response.success) {
        return response.data;
      }
      return [];
    } catch (err) {
      console.error('Error getting attendance by date:', err);
      return [];
    }
  };

  // Search employees
  const searchEmployees = async (query) => {
    try {
      const response = await employeeAPI.search(query);
      if (response.success) {
        return response.data;
      }
      return [];
    } catch (err) {
      console.error('Error searching employees:', err);
      return [];
    }
  };

  // Get statistics (from cached state or fetch fresh)
  const getStatistics = useCallback(() => {
    if (!statistics) {
      loadStatistics();
    }
    return statistics || {
      totalEmployees: 0,
      presentToday: 0,
      absentToday: 0,
      notMarkedToday: 0,
      attendanceRate: 0,
      department_breakdown: [],
    };
  }, [statistics, loadStatistics]);

  const value = {
    employees,
    attendance,
    statistics,
    loading,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    markAttendance,
    getEmployeeAttendance,
    getAttendanceByDate,
    searchEmployees,
    getStatistics,
    loadEmployees,
    loadStatistics,
    loadAttendance,
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};
