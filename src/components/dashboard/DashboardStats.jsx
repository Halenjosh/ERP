import React, { useContext } from 'react';
import { AuthContext } from '../../App';
import { Calendar, CreditCard, FileText, Users, Award, TrendingUp } from 'lucide-react';

const DashboardStats = () => {
  const { user } = useContext(AuthContext);

  const getStatsForRole = () => {
    switch (user?.role) {
      case 'coe':
      case 'assistant_coe':
        return [
          { icon: Calendar, label: 'Scheduled Exams', value: '24', change: '+2 this week', color: 'blue' },
          { icon: CreditCard, label: 'Hall Tickets Generated', value: '1,247', change: '+156 today', color: 'green' },
          { icon: FileText, label: 'Question Papers', value: '89', change: '+12 pending', color: 'yellow' },
          { icon: Users, label: 'Total Students', value: '3,456', change: 'Active semester', color: 'purple' },
        ];
      case 'faculty':
        return [
          { icon: FileText, label: 'My Subjects', value: '3', change: 'Active courses', color: 'blue' },
          { icon: Calendar, label: 'Upcoming Exams', value: '5', change: 'Next 2 weeks', color: 'green' },
          { icon: Award, label: 'Pending Evaluations', value: '47', change: 'To be graded', color: 'red' },
          { icon: Users, label: 'My Students', value: '156', change: 'Enrolled', color: 'purple' },
        ];
      case 'student':
        return [
          { icon: Calendar, label: 'Upcoming Exams', value: '4', change: 'Next 2 weeks', color: 'blue' },
          { icon: CreditCard, label: 'Hall Tickets', value: '4', change: 'Available', color: 'green' },
          { icon: Award, label: 'Results', value: '6', change: 'Published', color: 'yellow' },
          { icon: TrendingUp, label: 'Current CGPA', value: '8.7', change: '+0.2 improvement', color: 'purple' },
        ];
      case 'dept_coordinator':
        return [
          { icon: Calendar, label: 'Department Exams', value: '12', change: 'This month', color: 'blue' },
          { icon: Users, label: 'Department Students', value: '456', change: 'Total enrolled', color: 'green' },
          { icon: FileText, label: 'Question Banks', value: '23', change: 'Subjects covered', color: 'yellow' },
          { icon: Award, label: 'Results Pending', value: '8', change: 'To be published', color: 'red' },
        ];
      default:
        return [];
    }
  };

  const stats = getStatsForRole();

  const colorClasses = {
    blue: 'bg-blue-500 text-blue-50',
    green: 'bg-green-500 text-green-50',
    yellow: 'bg-yellow-500 text-yellow-50',
    purple: 'bg-purple-500 text-purple-50',
    red: 'bg-red-500 text-red-50',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const colorClass = colorClasses[stat.color] || colorClasses.blue;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;