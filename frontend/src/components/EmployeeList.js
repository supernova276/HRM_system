import React, { useState} from 'react';
import { useEmployees } from '../context/EmployeeContext';
import './EmployeeList.css';

const EmployeeList = () => {
  const { employees, loading, addEmployee, deleteEmployee, error } = useEmployees();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    department: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const departments = ['Engineering', 'Marketing', 'Human Resources', 'Sales', 'Finance', 'Operations'];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.id.trim()) {
      newErrors.id = 'Employee ID is required';
    } else if (employees.some(emp => emp.employee_id === formData.id)) {
      newErrors.id = 'Employee ID already exists';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    
    if (validateForm()) {
      setSubmitting(true);
      const result = await addEmployee(formData);
      setSubmitting(false);

      if (result.success) {
        setShowModal(false);
        setFormData({ id: '', name: '', email: '', department: '' });
        setErrors({});
      } else {
        // Handle backend validation errors
        if (typeof result.error === 'object') {
          const backendErrors = {};
          Object.keys(result.error).forEach(key => {
            const frontendKey = key === 'employee_id' ? 'id' : key;
            backendErrors[frontendKey] = Array.isArray(result.error[key]) 
              ? result.error[key][0] 
              : result.error[key];
          });
          setErrors(backendErrors);
        } else {
          setApiError(result.error);
        }
      }
    }
  };

  const handleDelete = async (employeeId) => {
    setSubmitting(true);
    const result = await deleteEmployee(employeeId);
    setSubmitting(false);
    
    if (result.success) {
      setDeleteConfirm(null);
    } else {
      setApiError(result.error);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const search = searchTerm.toLowerCase();
    return (
      emp.name.toLowerCase().includes(search) ||
      emp.employee_id.toLowerCase().includes(search) ||
      emp.email.toLowerCase().includes(search) ||
      emp.department.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading employees...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-text">Error: {error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="employee-list">
      <div className="employee-list-header">
        <div className="search-bar">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" strokeWidth="2"/>
            <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search employees by name, ID, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round"/>
            <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Add Employee
        </button>
      </div>

      {apiError && (
        <div className="api-error-banner">
          <p>{apiError}</p>
          <button onClick={() => setApiError(null)}>×</button>
        </div>
      )}

      {filteredEmployees.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2"/>
            <circle cx="9" cy="7" r="4" strokeWidth="2"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2"/>
          </svg>
          <h3 className="empty-state-title">
            {searchTerm ? 'No employees found' : 'No employees yet'}
          </h3>
          <p className="empty-state-description">
            {searchTerm 
              ? 'Try adjusting your search criteria'
              : 'Get started by adding your first employee to the system'
            }
          </p>
          {!searchTerm && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Add First Employee
            </button>
          )}
        </div>
      ) : (
        <div className="employee-grid">
          {filteredEmployees.map((employee) => (
            <div key={employee.employee_id} className="employee-card">
              <div className="employee-card-header">
                <div className="employee-avatar-large">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </div>
                <button
                  className="btn-icon btn-secondary delete-btn"
                  onClick={() => setDeleteConfirm(employee.employee_id)}
                  title="Delete employee"
                  disabled={submitting}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="3 6 5 6 21 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              
              <div className="employee-card-body">
                <h3 className="employee-name">{employee.name}</h3>
                <div className="employee-id-badge">{employee.employee_id}</div>
                
                <div className="employee-details">
                  <div className="employee-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeWidth="2"/>
                      <polyline points="22,6 12,13 2,6" strokeWidth="2"/>
                    </svg>
                    <span>{employee.email}</span>
                  </div>
                  <div className="employee-detail">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2"/>
                      <circle cx="12" cy="7" r="4" strokeWidth="2"/>
                    </svg>
                    <span>{employee.department}</span>
                  </div>
                </div>
              </div>

              {deleteConfirm === employee.employee_id && (
                <div className="delete-confirm">
                  <p>Delete this employee?</p>
                  <div className="delete-confirm-actions">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(employee.employee_id)}
                      disabled={submitting}
                    >
                      {submitting ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setDeleteConfirm(null)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => !submitting && setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Employee</h2>
              <button 
                className="modal-close" 
                onClick={() => setShowModal(false)}
                disabled={submitting}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              {apiError && (
                <div className="form-error-banner">
                  {apiError}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Employee ID *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., EMP001"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  disabled={submitting}
                />
                {errors.id && <div className="form-error">{errors.id}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={submitting}
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g., john.doe@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={submitting}
                />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Department *</label>
                <select
                  className="form-select"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  disabled={submitting}
                >
                  <option value="">Select a department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {errors.department && <div className="form-error">{errors.department}</div>}
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
