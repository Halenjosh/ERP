import React, { useContext } from 'react';
import { AuthContext } from '../../App';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

const UpcomingExams = () => {
  const { user } = useContext(AuthContext);

  const getUpcomingExams = () => {
    const baseExams = [
      {
        id: '1',
        title: 'Computer Networks',
        type: 'Final Exam',
        date: '2025-03-18',
        time: '10:00 AM',
        duration: '3 hours',
        venue: 'Hall A',
        students: 67,
        status: 'scheduled'
      },
      {
        id: '2',
        title: 'Database Systems',
        type: 'Midterm',
        date: '2025-03-20',
        time: '2:00 PM',
        duration: '2 hours',
        venue: 'Hall B',
        students: 89,
        status: 'scheduled'
      },
      {
        id: '3',
        title: 'Software Engineering',
        type: 'Final Exam',
        date: '2025-03-22',
        time: '9:00 AM',
        duration: '3 hours',
        venue: 'Hall C',
        students: 124,
        status: 'scheduled'
      },
      {
        id: '4',
        title: 'Operating Systems',
        type: 'Retest',
        date: '2025-03-25',
        time: '11:00 AM',
        duration: '3 hours',
        venue: 'Hall A',
        students: 12,
        status: 'scheduled'
      }
    ];

    if (user?.role === 'student') {
      return baseExams.slice(0, 3);
    } else if (user?.role === 'faculty') {
      return baseExams.filter(exam => ['Computer Networks', 'Database Systems'].includes(exam.title));
    } else if (user?.role === 'dept_coordinator') {
      return baseExams;
    }
    
    return baseExams;
  };

  const exams = getUpcomingExams();

  const getStatusColor = () => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Exams</h3>
        <p className="text-sm text-gray-600 mt-1">Schedule for the next two weeks</p>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {exams.map((exam) => (
            <div key={exam.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{exam.title}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                  {exam.type}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(exam.date).toLocaleDateString()}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {exam.time} ({exam.duration})
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {exam.venue}
                </div>
                
                {user?.role !== 'student' && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {exam.students} students
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <button className="w-full text-center py-2 px-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
            View complete schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpcomingExams;