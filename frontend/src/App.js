import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import AttendanceManagement from './components/AttendanceManagement';
import { EmployeeProvider } from './context/EmployeeContext';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'employees':
        return <EmployeeList />;
      case 'attendance':
        return <AttendanceManagement />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <EmployeeProvider>
      <div className="app">
        <Sidebar 
          currentView={currentView} 
          onNavigate={setCurrentView}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <main className="main-content">
          <header className="top-bar">
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 12h18M3 6h18M3 18h18" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="top-bar-content">
              <h1 className="page-title">
                {currentView === 'dashboard' && 'Dashboard'}
                {currentView === 'employees' && 'Employee Management'}
                {currentView === 'attendance' && 'Attendance Tracking'}
              </h1>
              <div className="user-profile">
                <div className="user-avatar">AD</div>
                <span className="user-name">Admin</span>
              </div>
            </div>
          </header>
          <div className="content-area">
            {renderView()}
          </div>
        </main>
      </div>
    </EmployeeProvider>
  );
}

export default App;
