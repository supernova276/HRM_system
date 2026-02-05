import React, { useEffect } from 'react';
import { useEmployees } from '../context/EmployeeContext';
import './Dashboard.css';

const Dashboard = ({ onNavigate }) => {
  const { employees, loading, getStatistics, loadStatistics } = useEmployees();
  const stats = getStatistics();

  // Refresh statistics when component mounts
  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, icon, color, onClick }) => (
    <div className={`stat-card stat-card-${color}`} onClick={onClick}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      </div>
      <div className="stat-arrow">→</div>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Welcome back, Admin</h2>
          <p className="dashboard-subtitle">Here's what's happening with your team today</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Employees"
          value={stats.total_employees || stats.totalEmployees || 0}
          subtitle="Active workforce"
          color="primary"
          onClick={() => onNavigate('employees')}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2"/>
              <circle cx="9" cy="7" r="4" strokeWidth="2"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2"/>
            </svg>
          }
        />

        <StatCard
          title="Present Today"
          value={stats.present_today || stats.presentToday || 0}
          subtitle={`${stats.absent_today || stats.absentToday || 0} absent`}
          color="success"
          onClick={() => onNavigate('attendance')}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="9 11 12 14 22 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        />

        <StatCard
          title="Attendance Rate"
          value={`${stats.attendance_rate || stats.attendanceRate || 0}%`}
          subtitle="This month"
          color="accent"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          }
        />

        <StatCard
          title="Not Marked"
          value={stats.not_marked_today || stats.notMarkedToday || 0}
          subtitle="Pending today"
          color="warning"
          onClick={() => onNavigate('attendance')}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          }
        />
      </div>

      <div className="dashboard-content">
        <div className="card quick-actions-card">
          <div className="card-header">
            <h3 className="card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Quick Actions
            </h3>
          </div>
          <div className="quick-actions-grid">
            <button className="quick-action-btn" onClick={() => onNavigate('employees')}>
              <div className="quick-action-icon quick-action-icon-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="quick-action-content">
                <div className="quick-action-title">Add Employee</div>
                <div className="quick-action-desc">Register new team member</div>
              </div>
            </button>

            <button className="quick-action-btn" onClick={() => onNavigate('attendance')}>
              <div className="quick-action-icon quick-action-icon-success">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="9 11 12 14 22 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeWidth="2"/>
                </svg>
              </div>
              <div className="quick-action-content">
                <div className="quick-action-title">Mark Attendance</div>
                <div className="quick-action-desc">Track daily presence</div>
              </div>
            </button>

            <button className="quick-action-btn" onClick={() => onNavigate('employees')}>
              <div className="quick-action-icon quick-action-icon-accent">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2"/>
                  <circle cx="9" cy="7" r="4" strokeWidth="2"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2"/>
                </svg>
              </div>
              <div className="quick-action-content">
                <div className="quick-action-title">View Employees</div>
                <div className="quick-action-desc">Browse team directory</div>
              </div>
            </button>

            <button className="quick-action-btn" onClick={() => onNavigate('attendance')}>
              <div className="quick-action-icon quick-action-icon-warning">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"/>
                </svg>
              </div>
              <div className="quick-action-content">
                <div className="quick-action-title">Attendance Records</div>
                <div className="quick-action-desc">View history & reports</div>
              </div>
            </button>
          </div>
        </div>

        <div className="card recent-employees-card">
          <div className="card-header">
            <h3 className="card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2"/>
                <circle cx="8.5" cy="7" r="4" strokeWidth="2"/>
                <polyline points="17 11 19 13 23 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Recent Employees
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('employees')}>
              View All
            </button>
          </div>
          {employees.length === 0 ? (
            <div className="empty-state-small">
              <p>No employees yet</p>
              <button className="btn btn-primary btn-sm" onClick={() => onNavigate('employees')}>
                Add First Employee
              </button>
            </div>
          ) : (
            <div className="employee-list-preview">
              {employees.slice(0, 5).map((employee) => (
                <div key={employee.employee_id || employee.id} className="employee-preview-item">
                  <div className="employee-preview-avatar">
                    {employee.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="employee-preview-info">
                    <div className="employee-preview-name">{employee.name}</div>
                    <div className="employee-preview-dept">{employee.department}</div>
                  </div>
                  <div className="employee-preview-id">{employee.employee_id || employee.id}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
