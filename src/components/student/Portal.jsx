import React, { useContext } from 'react';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { AuthContext } from '../../App';
import { Link } from 'react-router-dom';
import { Award, FileText, Edit3, CreditCard, Calendar, ClipboardList } from 'lucide-react';

const Card = ({ to, icon: Icon, title, desc }) => (
  <Link to={to} className="block border rounded-xl p-4 hover:shadow bg-white">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-blue-50 text-blue-700"><Icon className="w-5 h-5" /></div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-gray-600">{desc}</div>
      </div>
    </div>
  </Link>
);

const Portal = () => {
  const { sidebarVisible } = useContext(AuthContext);

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Student Portal</h1>
              <p className="text-gray-600">Quick access to your results, revaluation, hall tickets and exam schedule.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card to="/results" icon={Award} title="View Results" desc="See semester-wise marks, SGPA/CGPA and history." />
              <Card to="/reval/apply" icon={Edit3} title="Revaluation Apply" desc="Request revaluation for selected subjects." />
              <Card to="/reval/my-applications" icon={FileText} title="My Applications" desc="Track your revaluation requests and status." />
              <Card to="/reval/results" icon={FileText} title="Revaluation Results" desc="Compare old vs new marks and changes." />
              <Card to="/hall-tickets" icon={CreditCard} title="Hall Tickets" desc="Download your hall tickets." />
              <Card to="/exam-scheduling" icon={Calendar} title="Exam Schedule" desc="View upcoming exams and timetable." />
              <Card to="/exam-attendance" icon={ClipboardList} title="Exam Attendance" desc="View your presence status for each exam." />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Portal;
