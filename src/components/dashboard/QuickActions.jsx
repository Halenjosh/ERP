import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';
import { Plus, Calendar, FileText, Award, Download, Upload } from 'lucide-react';

const QuickActions = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const getActionsForRole = () => {
    switch (user?.role) {
      case 'coe':
      case 'assistant_coe':
        return [
          { icon: Plus, label: 'Schedule Exam', action: () => navigate('/exam-scheduling'), color: 'blue' },
          { icon: FileText, label: 'Add Question', action: () => navigate('/question-bank'), color: 'green' },
          { icon: Award, label: 'Publish Results', action: () => navigate('/results'), color: 'purple' },
          { icon: Download, label: 'Generate Reports', action: () => navigate('/analytics'), color: 'yellow' },
        ];
      case 'faculty':
        return [
          { icon: FileText, label: 'Add Question', action: () => navigate('/question-bank'), color: 'green' },
          { icon: Upload, label: 'Submit Marks', action: () => navigate('/mark-entry'), color: 'blue' },
          { icon: Calendar, label: 'View Schedule', action: () => navigate('/exam-scheduling'), color: 'purple' },
        ];
      case 'student':
        return [
          { icon: Download, label: 'Download Hall Ticket', action: () => navigate('/hall-tickets'), color: 'blue' },
          { icon: Award, label: 'View Results', action: () => navigate('/results'), color: 'green' },
          { icon: Calendar, label: 'Exam Schedule', action: () => navigate('/exam-scheduling'), color: 'purple' },
        ];
      case 'dept_coordinator':
        return [
          { icon: Plus, label: 'Schedule Exam', action: () => navigate('/exam-scheduling'), color: 'blue' },
          { icon: FileText, label: 'Review Papers', action: () => navigate('/question-bank'), color: 'green' },
          { icon: Award, label: 'View Results', action: () => navigate('/results'), color: 'purple' },
          { icon: Download, label: 'Department Reports', action: () => navigate('/analytics'), color: 'yellow' },
        ];
      default:
        return [];
    }
  };

  const actions = getActionsForRole();

  const colorClasses = {
    blue: 'bg-blue-500 hover:bg-blue-600 text-white',
    green: 'bg-green-500 hover:bg-green-600 text-white',
    purple: 'bg-purple-500 hover:bg-purple-600 text-white',
    yellow: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    red: 'bg-red-500 hover:bg-red-600 text-white',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <p className="text-sm text-gray-600 mt-1">Frequently used functions</p>
      </div>
      
      <div className="p-6">
        <div className="space-y-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            const colorClass = colorClasses[action.color] || colorClasses.blue;
            return (
              <button
                key={index}
                onClick={action.action}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${colorClass}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;