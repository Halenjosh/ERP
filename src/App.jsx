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
import Academics from './components/coe/Academics';
import StudentProfile from './components/coe/StudentProfile';
import { RevaluationProvider } from './contexts/RevaluationContext.jsx';
import RevalApply from './components/revaluation/student/Apply.jsx';
import RevalMyApps from './components/revaluation/student/MyApplications.jsx';
import RevalStudentResults from './components/revaluation/student/Results.jsx';
import RevalAdminIntake from './components/revaluation/admin/IntakeQueue.jsx';
import RevalAdminAssignment from './components/revaluation/admin/Assignment.jsx';
import RevalExaminerWorkbench from './components/revaluation/examiner/Workbench.jsx';
import StudentPortal from './components/student/Portal.jsx';
import ExamAttendance from './components/exam/ExamAttendance.jsx';
import ExamHallPresence from './components/exam/ExamHallPresence.jsx';
import ExamTimeTable from './components/exam/ExamTimeTable.jsx';
import ExamPaperBundles from './components/exam/ExamPaperBundles.jsx';

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
        <RevaluationProvider>
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
            <Route path="/exam-attendance" element={user ? <ExamAttendance /> : <Navigate to="/login" />} />
            <Route path="/exam-hall-presence" element={user ? <ExamHallPresence /> : <Navigate to="/login" />} />
            <Route path="/exam-timetable" element={user ? <ExamTimeTable /> : <Navigate to="/login" />} />
            <Route path="/paper-bundles" element={user ? <ExamPaperBundles /> : <Navigate to="/login" />} />
            <Route path="/coe/academics" element={user ? <Academics /> : <Navigate to="/login" />} />
            <Route path="/coe/academics/:id" element={user ? <StudentProfile /> : <Navigate to="/login" />} />
            {/* Revaluation - Student */}
            <Route path="/reval/apply" element={user ? <RevalApply /> : <Navigate to="/login" />} />
            <Route path="/reval/my-applications" element={user ? <RevalMyApps /> : <Navigate to="/login" />} />
            <Route path="/reval/results" element={user ? <RevalStudentResults /> : <Navigate to="/login" />} />
            {/* Revaluation - Admin */}
            <Route path="/reval/admin/intake" element={user ? <RevalAdminIntake /> : <Navigate to="/login" />} />
            <Route path="/reval/admin/assignment" element={user ? <RevalAdminAssignment /> : <Navigate to="/login" />} />
            {/* Revaluation - Examiner */}
            <Route path="/reval/examiner" element={user ? <RevalExaminerWorkbench /> : <Navigate to="/login" />} />
            {/* Student Portal */}
            <Route path="/student" element={user ? <StudentPortal /> : <Navigate to="/login" />} />
            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
            </Routes>
          </div>
        </RevaluationProvider>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;