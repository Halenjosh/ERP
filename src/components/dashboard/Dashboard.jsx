import React, { useContext } from 'react';
import { AuthContext } from '../../App';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import DashboardStats from './DashboardStats';
import RecentActivity from './RecentActivity';
import UpcomingExams from './UpcomingExams';
import QuickActions from './QuickActions';

const Dashboard = () => {
  const { user, sidebarVisible } = useContext(AuthContext);

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">
                {user?.role === 'coe' && "Controller of Examinations - Manage all examination processes"}
                {user?.role === 'assistant_coe' && "Assistant CoE - Support examination management"}
                {user?.role === 'faculty' && "Faculty Dashboard - Manage your subjects and evaluations"}
                {user?.role === 'student' && "Student Portal - View your exams and results"}
                {user?.role === 'dept_coordinator' && "Department Coordinator - Oversee departmental examinations"}
              </p>
            </div>

            <DashboardStats />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              <div className="lg:col-span-2 space-y-6">
                <RecentActivity />
                <UpcomingExams />
              </div>
              
              <div className="space-y-6">
                <QuickActions />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;