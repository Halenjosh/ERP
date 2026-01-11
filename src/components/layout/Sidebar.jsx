import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../App';
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  FileText,
  Edit3,
  Award,
  BarChart3,
  Users,
  Bell,
  ClipboardList,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const safeLogout = logout || (() => {});

  const getMenuItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: Bell, label: 'Notifications', path: '/notifications' },
    ];

    const roleSpecificItems = {
      coe: [
        { icon: Calendar, label: 'Exam Scheduling', path: '/exam-scheduling' },
        { icon: Calendar, label: 'Exam Time Table', path: '/exam-timetable' },
        { icon: CreditCard, label: 'Hall Tickets', path: '/hall-tickets' },
        { icon: ClipboardList, label: 'Exam Attendance', path: '/exam-attendance' },
        { icon: ClipboardList, label: 'Paper Bundles', path: '/paper-bundles' },
        { icon: Users, label: 'Hall Presence', path: '/exam-hall-presence' },
        { icon: FileText, label: 'Question Bank', path: '/question-bank' },
        { icon: Edit3, label: 'Mark Entry', path: '/mark-entry' },
        { icon: Users, label: 'Academics', path: '/coe/academics' },
        { icon: FileText, label: 'Reval Intake', path: '/reval/admin/intake' },
        { icon: Edit3, label: 'Reval Assignment', path: '/reval/admin/assignment' },
        { icon: Award, label: 'Results', path: '/results' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics' },
        { icon: Users, label: 'User Management', path: '/users' },
      ],
      assistant_coe: [
        { icon: Calendar, label: 'Exam Scheduling', path: '/exam-scheduling' },
        { icon: Calendar, label: 'Exam Time Table', path: '/exam-timetable' },
        { icon: CreditCard, label: 'Hall Tickets', path: '/hall-tickets' },
        { icon: ClipboardList, label: 'Exam Attendance', path: '/exam-attendance' },
        { icon: ClipboardList, label: 'Paper Bundles', path: '/paper-bundles' },
        { icon: Users, label: 'Hall Presence', path: '/exam-hall-presence' },
        { icon: FileText, label: 'Question Bank', path: '/question-bank' },
        { icon: Edit3, label: 'Mark Entry', path: '/mark-entry' },
        { icon: Users, label: 'Academics', path: '/coe/academics' },
        { icon: FileText, label: 'Reval Intake', path: '/reval/admin/intake' },
        { icon: Edit3, label: 'Reval Assignment', path: '/reval/admin/assignment' },
        { icon: Award, label: 'Results', path: '/results' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics' },
      ],
      faculty: [
        { icon: FileText, label: 'Question Bank', path: '/question-bank' },
        { icon: Edit3, label: 'Mark Entry', path: '/mark-entry' },
        { icon: Calendar, label: 'Exam Schedule', path: '/exam-scheduling' },
        { icon: Calendar, label: 'Exam Time Table', path: '/exam-timetable' },
        { icon: ClipboardList, label: 'Exam Attendance', path: '/exam-attendance' },
        { icon: ClipboardList, label: 'Paper Bundles', path: '/paper-bundles' },
        { icon: Users, label: 'Hall Presence', path: '/exam-hall-presence' },
        { icon: Edit3, label: 'Reval Workbench', path: '/reval/examiner' },
      ],
      student: [
        { icon: CreditCard, label: 'Hall Tickets', path: '/hall-tickets' },
        { icon: Award, label: 'Results', path: '/results' },
        { icon: Calendar, label: 'Exam Schedule', path: '/exam-scheduling' },
        { icon: Calendar, label: 'Exam Time Table', path: '/exam-timetable' },
        { icon: ClipboardList, label: 'Exam Attendance', path: '/exam-attendance' },
        { icon: Edit3, label: 'Revaluation Apply', path: '/reval/apply' },
        { icon: FileText, label: 'My Applications', path: '/reval/my-applications' },
        { icon: FileText, label: 'Revaluation Results', path: '/reval/results' },
      ],
      dept_coordinator: [
        { icon: Calendar, label: 'Exam Scheduling', path: '/exam-scheduling' },
        { icon: Calendar, label: 'Exam Time Table', path: '/exam-timetable' },
        { icon: FileText, label: 'Question Bank', path: '/question-bank' },
        { icon: Edit3, label: 'Mark Entry', path: '/mark-entry' },
        { icon: ClipboardList, label: 'Exam Attendance', path: '/exam-attendance' },
        { icon: ClipboardList, label: 'Paper Bundles', path: '/paper-bundles' },
        { icon: Users, label: 'Hall Presence', path: '/exam-hall-presence' },
        { icon: Award, label: 'Results', path: '/results' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics' },
      ],
    };

    const role = user?.role || 'student';
    return [...baseItems, ...(roleSpecificItems[role] || [])];
  };

  const menuItems = getMenuItems();
  const displayName = user?.name || 'Guest';
  const displayInitial = displayName.charAt(0);
  const displayRole = user?.role?.replace('_', ' ') || 'guest';

  return (
    <div className="bg-white w-64 h-screen border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">CoE ERP</h1>
        <p className="text-sm text-gray-600 mt-1">Exam Management System</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {displayInitial}
            </span>
          </div>
          <div className="ml-3">
            <p className="font-medium text-gray-900">{displayName}</p>
            <p className="text-sm text-gray-600 capitalize">{displayRole}</p>
          </div>
        </div>
        <button
          onClick={safeLogout}
          className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
