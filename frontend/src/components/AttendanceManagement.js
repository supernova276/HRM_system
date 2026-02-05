import React, { useState, useEffect } from 'react';
import { useEmployees } from '../context/EmployeeContext';
import { attendanceAPI } from '../services/api';
import './AttendanceManagement.css';

const AttendanceManagement = () => {
  const { employees, loading, markAttendance } = useEmployees();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [historyData, setHistoryData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  // Load attendance for selected date
  useEffect(() => {
    const loadAttendanceForDate = async () => {
      if (employees.length === 0) return;
      
      setLoadingData(true);
      try {
        const response = await attendanceAPI.getByDate(selectedDate);
        if (response.success) {
          // Merge employee data with attendance records
          const attendanceMap = new Map(
            response.data.map(record => [
              record.employee.employee_id,
              record.status
            ])
          );
          
          const mergedData = employees.map(employee => ({
            ...employee,
            status: attendanceMap.get(employee.employee_id) || null
          }));
          
          setAttendanceData(mergedData);
        }
      } catch (error) {
        console.error('Error loading attendance:', error);
      } finally {
        setLoadingData(false);
      }
    };

    loadAttendanceForDate();
  }, [selectedDate, employees]);

  const handleMarkAttendance = async (employeeId, status) => {
    const result = await markAttendance(employeeId, selectedDate, status);
    
    if (result.success) {
      const employee = employees.find(e => e.employee_id === employeeId);
      setSuccessMessage(`Attendance marked as ${status} for ${employee?.name}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Update local state
      setAttendanceData(prev => 
        prev.map(emp => 
          emp.employee_id === employeeId 
            ? { ...emp, status } 
            : emp
        )
      );
    } else {
      setSuccessMessage(`Error: ${result.error}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleViewHistory = async (employee) => {
    setSelectedEmployee(employee);
    setShowHistory(true);
    setHistoryData(null);
    
    try {
      const response = await attendanceAPI.getByEmployee(employee.employee_id);
      if (response.success) {
        setHistoryData(response.data);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading attendance...</p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="empty-state">
        <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
          <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round"/>
          <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round"/>
          <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
        </svg>
        <h3 className="empty-state-title">No employees to track</h3>
        <p className="empty-state-description">
          Add employees first to start tracking attendance
        </p>
      </div>
    );
  }

  return (
    <div className="attendance-management">
      {successMessage && (
        <div className={`success-message ${successMessage.startsWith('Error') ? 'error-message' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {successMessage}
        </div>
      )}

      <div className="attendance-header">
        <div className="date-selector">
          <label className="date-label">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round"/>
              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round"/>
              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
            </svg>
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="date-info">
          <span className="date-display">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
          {selectedDate === new Date().toISOString().split('T')[0] && (
            <span className="today-badge">Today</span>
          )}
        </div>
      </div>

      <div className="attendance-grid">
        {attendanceData.map((employee) => (
          <div key={employee.employee_id} className="attendance-card">
            <div className="attendance-card-header">
              <div className="employee-info">
                <div className="employee-avatar">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="employee-details-compact">
                  <div className="employee-name-compact">{employee.name}</div>
                  <div className="employee-meta">
                    <span className="employee-id-compact">{employee.employee_id}</span>
                    <span className="employee-dept-compact">{employee.department}</span>
                  </div>
                </div>
              </div>
              <button
                className="btn-icon btn-secondary view-history-btn"
                onClick={() => handleViewHistory(employee)}
                title="View attendance history"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            <div className="attendance-actions">
              {employee.status ? (
                <div className="attendance-status">
                  <span className={`badge badge-${employee.status.toLowerCase()}`}>
                    {employee.status}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleMarkAttendance(employee.employee_id, employee.status === 'Present' ? 'Absent' : 'Present')}
                  >
                    Change to {employee.status === 'Present' ? 'Absent' : 'Present'}
                  </button>
                </div>
              ) : (
                <div className="attendance-buttons">
                  <button
                    className="btn btn-success"
                    onClick={() => handleMarkAttendance(employee.employee_id, 'Present')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Present
                  </button>
                  <button
                    className="btn btn-absent"
                    onClick={() => handleMarkAttendance(employee.employee_id, 'Absent')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Absent
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showHistory && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Attendance History</h2>
                <p className="modal-subtitle">{selectedEmployee.name} ({selectedEmployee.employee_id})</p>
              </div>
              <button className="modal-close" onClick={() => setShowHistory(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {!historyData ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Loading history...</p>
                </div>
              ) : historyData.records.length === 0 ? (
                <div className="empty-state-small">
                  <p>No attendance records found</p>
                </div>
              ) : (
                <>
                  <div className="history-stats">
                    <div className="history-stat">
                      <div className="history-stat-value">{historyData.total_days}</div>
                      <div className="history-stat-label">Total Days</div>
                    </div>
                    <div className="history-stat">
                      <div className="history-stat-value" style={{ color: 'var(--success)' }}>
                        {historyData.present_count}
                      </div>
                      <div className="history-stat-label">Present</div>
                    </div>
                    <div className="history-stat">
                      <div className="history-stat-value" style={{ color: 'var(--error)' }}>
                        {historyData.absent_count}
                      </div>
                      <div className="history-stat-label">Absent</div>
                    </div>
                    <div className="history-stat">
                      <div className="history-stat-value" style={{ color: 'var(--accent)' }}>
                        {historyData.attendance_rate}%
                      </div>
                      <div className="history-stat-label">Attendance Rate</div>
                    </div>
                  </div>

                  <div className="history-table-container">
                    <table className="history-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Day</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyData.records.map((record, index) => (
                          <tr key={index}>
                            <td>
                              {new Date(record.date + 'T00:00:00').toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </td>
                            <td>
                              {new Date(record.date + 'T00:00:00').toLocaleDateString('en-US', { 
                                weekday: 'long' 
                              })}
                            </td>
                            <td>
                              <span className={`badge badge-${record.status.toLowerCase()}`}>
                                {record.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
