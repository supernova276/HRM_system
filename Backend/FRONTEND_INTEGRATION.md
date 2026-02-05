# Frontend Integration Guide

Step-by-step guide to connect your React HRM frontend with the Django backend API.

## Overview

Your current frontend uses `localStorage` for data persistence. We'll replace it with API calls to the Django backend.

## Setup

### 1. Backend Running

Ensure backend is running:
```bash
cd hrm_backend
python manage.py runserver
# Running at http://localhost:8000
```

### 2. Frontend Configuration

Create an API configuration file in your frontend:

**File: `frontend/src/api/config.js`**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export default API_BASE_URL;
```

**File: `frontend/.env.local`**
```env
REACT_APP_API_URL=http://localhost:8000/api
```

## API Service Layer

Create a centralized API service for making requests:

**File: `frontend/src/api/apiService.js`**
```javascript
import API_BASE_URL from './config';

class APIService {
  // Helper method for making requests
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      return data.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Employee APIs
  async getEmployees(searchQuery = '') {
    const query = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '';
    return this.request(`/employees/${query}`);
  }

  async getEmployee(id) {
    return this.request(`/employees/${id}/`);
  }

  async createEmployee(employeeData) {
    return this.request('/employees/', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  }

  async updateEmployee(id, employeeData) {
    return this.request(`/employees/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(employeeData),
    });
  }

  async deleteEmployee(id) {
    return this.request(`/employees/${id}/`, {
      method: 'DELETE',
    });
  }

  // Attendance APIs
  async getAttendance(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const query = params ? `?${params}` : '';
    return this.request(`/attendance/${query}`);
  }

  async markAttendance(attendanceData) {
    return this.request('/attendance/', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    });
  }

  async getAttendanceByDate(date) {
    return this.request(`/attendance/by-date/?date=${date}`);
  }

  async getEmployeeAttendanceHistory(employeeId) {
    return this.request(`/attendance/by-employee/?employee_id=${employeeId}`);
  }

  async getStatistics() {
    return this.request('/attendance/statistics/');
  }
}

export default new APIService();
```

## Update EmployeeContext

Replace localStorage with API calls:

**File: `frontend/src/context/EmployeeContext.js`**
```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../api/apiService';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load employees on mount
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await apiService.getEmployees();
      
      // Map API response to match frontend format
      const mappedEmployees = data.map(emp => ({
        id: emp.employee_id,  // Use employee_id as id for consistency
        name: emp.name,
        email: emp.email,
        department: emp.department
      }));
      
      setEmployees(mappedEmployees);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employee) => {
    try {
      // Send to API with correct field mapping
      const apiData = {
        employee_id: employee.id,
        name: employee.name,
        email: employee.email,
        department: employee.department
      };
      
      await apiService.createEmployee(apiData);
      await loadEmployees(); // Reload to get fresh data
      return { success: true, employee };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteEmployee = async (employeeId) => {
    try {
      // Find the database ID for this employee
      const data = await apiService.getEmployees();
      const employee = data.find(emp => emp.employee_id === employeeId);
      
      if (employee) {
        await apiService.deleteEmployee(employee.id);
        await loadEmployees(); // Reload to get fresh data
      }
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const markAttendance = async (employeeId, date, status) => {
    try {
      const attendanceData = {
        employee_id: employeeId,
        date: date,
        status: status
      };
      
      await apiService.markAttendance(attendanceData);
      return { success: true };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getEmployeeAttendance = async (employeeId) => {
    try {
      const data = await apiService.getEmployeeAttendanceHistory(employeeId);
      return data.records.map(record => ({
        employeeId: record.employee.employee_id,
        date: record.date,
        status: record.status
      }));
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  const getAttendanceByDate = async (date) => {
    try {
      const data = await apiService.getAttendanceByDate(date);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  const getStatistics = async () => {
    try {
      const stats = await apiService.getStatistics();
      
      return {
        totalEmployees: stats.total_employees,
        presentToday: stats.present_today,
        absentToday: stats.absent_today,
        attendanceRate: stats.attendance_rate
      };
    } catch (err) {
      setError(err.message);
      return {
        totalEmployees: 0,
        presentToday: 0,
        absentToday: 0,
        attendanceRate: 0
      };
    }
  };

  const value = {
    employees,
    attendance,
    loading,
    error,
    addEmployee,
    deleteEmployee,
    markAttendance,
    getEmployeeAttendance,
    getAttendanceByDate,
    getStatistics,
    refreshEmployees: loadEmployees
  };

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};
```

## Update Components

### Dashboard Component

**File: `frontend/src/components/Dashboard.js`**

Update the statistics loading:

```javascript
import React, { useEffect, useState } from 'react';
import { useEmployees } from '../context/EmployeeContext';
import './Dashboard.css';

const Dashboard = ({ onNavigate }) => {
  const { employees, loading, getStatistics } = useEmployees();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const statistics = await getStatistics();
    setStats(statistics);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  // Rest of your Dashboard component remains the same
  // Just use 'stats' instead of calling getStatistics() directly
};

export default Dashboard;
```

### Attendance Management Component

**File: `frontend/src/components/AttendanceManagement.js`**

Update to fetch attendance by date:

```javascript
import React, { useState, useEffect } from 'react';
import { useEmployees } from '../context/EmployeeContext';
import './AttendanceManagement.css';

const AttendanceManagement = () => {
  const { employees, loading, markAttendance, getAttendanceByDate, getEmployeeAttendance } = useEmployees();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadAttendanceForDate();
  }, [selectedDate, employees]);

  const loadAttendanceForDate = async () => {
    const records = await getAttendanceByDate(selectedDate);
    
    // Merge with employee data
    const merged = employees.map(employee => {
      const record = records.find(r => r.employee.employee_id === employee.id);
      return {
        ...employee,
        status: record?.status || null
      };
    });
    
    setAttendanceData(merged);
  };

  const handleMarkAttendance = async (employeeId, status) => {
    try {
      await markAttendance(employeeId, selectedDate, status);
      await loadAttendanceForDate(); // Reload attendance
      
      const employeeName = employees.find(e => e.id === employeeId)?.name;
      setSuccessMessage(`Attendance marked as ${status} for ${employeeName}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to mark attendance:', error);
    }
  };

  const handleViewHistory = async (employee) => {
    const history = await getEmployeeAttendance(employee.id);
    setSelectedEmployee({
      ...employee,
      history: history
    });
    setShowHistory(true);
  };

  // Rest of your component remains similar
  // Use attendanceData instead of getTodayAttendance()
};

export default AttendanceManagement;
```

## Error Handling

Add error display in your components:

```javascript
const { error } = useEmployees();

// In your JSX:
{error && (
  <div className="error-message">
    <span className="error-icon">⚠️</span>
    {error}
  </div>
)}
```

**CSS for error message:**
```css
.error-message {
  background-color: #fee;
  border: 1px solid #fcc;
  color: #c00;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-icon {
  font-size: 20px;
}
```

## Testing Integration

### 1. Test Employee Creation

```javascript
// In your browser console:
fetch('http://localhost:8000/api/employees/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    employee_id: 'EMP001',
    name: 'Test User',
    email: 'test@example.com',
    department: 'Engineering'
  })
})
.then(r => r.json())
.then(console.log);
```

### 2. Test from Frontend

1. Start backend: `python manage.py runserver`
2. Start frontend: `npm start`
3. Try adding an employee through the UI
4. Check backend terminal for API logs
5. Check browser DevTools Network tab

## Common Issues

### CORS Errors

If you see CORS errors:

1. Check backend `.env`:
   ```env
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

2. Restart Django server

### 404 Errors

Ensure endpoints match:
- Backend: `/api/employees/`
- Frontend: `${API_BASE_URL}/employees/`

### Data Format Mismatches

Backend uses:
- `employee_id` (string, e.g., "EMP001")
- `id` (integer, database ID)

Frontend expects:
- `id` (should map to `employee_id`)

Use mapping in EmployeeContext as shown above.

## Migration Checklist

- [ ] Backend running on port 8000
- [ ] Frontend API config created
- [ ] API service layer implemented
- [ ] EmployeeContext updated
- [ ] Dashboard component updated
- [ ] EmployeeList component updated
- [ ] AttendanceManagement component updated
- [ ] Error handling added
- [ ] CORS configured
- [ ] Test employee creation
- [ ] Test employee deletion
- [ ] Test attendance marking
- [ ] Test dashboard statistics
- [ ] Remove localStorage calls

## Performance Tips

1. **Debounce search**: Add delay to search input
   ```javascript
   const [searchTerm, setSearchTerm] = useState('');
   const [debouncedTerm, setDebouncedTerm] = useState('');

   useEffect(() => {
     const timer = setTimeout(() => {
       setDebouncedTerm(searchTerm);
     }, 300);
     return () => clearTimeout(timer);
   }, [searchTerm]);
   ```

2. **Cache data**: Store fetched data temporarily
3. **Loading states**: Show spinners during API calls
4. **Error boundaries**: Catch and display errors gracefully

## Next Steps

1. Remove all `localStorage` code
2. Add loading states to all API calls
3. Add error handling to all components
4. Test thoroughly
5. Deploy both frontend and backend

## Production Considerations

Before deploying:

1. Update API URL in frontend:
   ```env
   REACT_APP_API_URL=https://api.yourdomain.com/api
   ```

2. Configure CORS in backend for production domain
3. Enable HTTPS
4. Add authentication if needed
5. Set up proper error logging

---

## Need Help?

- Check browser console for errors
- Check Django terminal for backend errors
- Use DevTools Network tab to inspect API calls
- Review `API_DOCUMENTATION.md` for endpoint details

Happy integrating! 🚀
