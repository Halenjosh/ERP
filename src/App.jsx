import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import ExamScheduling from './components/exam/ExamScheduling';
import HallTickets from './components/exam/HallTickets';
import QuestionBank from './components/exam/QuestionBank';
import MarkEntry from './components/evaluation/MarkEntry';
import ResultProcessing from './components/results/ResultProcessing';
import Analytics from './components/analytics/Analytics';
import UserManagement from './components/admin/UserManagement';
import Notifications from './components/notifications/Notifications';

export const AuthContext = React.createContext({
  user: null,
  login: () => {},
  logout: () => {},
  sidebarVisible: true,
  toggleSidebar: () => {},
});

function App() {
  const [user, setUser] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    // Restore session only if 'remember' was set
    try {
      const remember = localStorage.getItem('remember') === '1';
      const savedUser = localStorage.getItem('user');
      if (remember && savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('remember');
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  const login = (userData, remember = false) => {
    setUser(userData);
    try {
      if (remember) {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('remember', '1');
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('remember');
      }
    } catch {}
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const toggleSidebar = () => setSidebarVisible((prev) => !prev);

  return (
    <AuthContext.Provider value={{ user, login, logout, sidebarVisible, toggleSidebar }}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/exam-scheduling" element={user ? <ExamScheduling /> : <Navigate to="/login" />} />
            <Route path="/hall-tickets" element={user ? <HallTickets /> : <Navigate to="/login" />} />
            <Route path="/question-bank" element={user ? <QuestionBank /> : <Navigate to="/login" />} />
            <Route path="/mark-entry" element={user ? <MarkEntry /> : <Navigate to="/login" />} />
            <Route path="/results" element={user ? <ResultProcessing /> : <Navigate to="/login" />} />
            <Route path="/analytics" element={user ? <Analytics /> : <Navigate to="/login" />} />
            <Route path="/users" element={user ? <UserManagement /> : <Navigate to="/login" />} />
            <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          </Routes>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;