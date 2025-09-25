import React, { useContext, useState } from 'react';
import { AuthContext } from '../../App';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { Edit3, Save, Upload, Download, Search, Filter, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const MarkEntry = () => {
  const { user, sidebarVisible } = useContext(AuthContext);
  const [selectedExam, setSelectedExam] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');

  const exams = [
    { id: '1', title: 'Computer Networks - Final Exam', subject: 'CS301', date: '2025-03-18' },
    { id: '2', title: 'Database Systems - Midterm', subject: 'CS302', date: '2025-03-20' },
    { id: '3', title: 'Software Engineering - Final Exam', subject: 'CS401', date: '2025-03-22' }
  ];

  const studentMarks = [
    { id: '1', studentId: 'CS2021001', studentName: 'Alex Rodriguez', examId: '1', subject: 'Computer Networks', marksObtained: 85, totalMarks: 100, grade: 'A', status: 'submitted', evaluatedBy: 'Dr. Emma Wilson' },
    { id: '2', studentId: 'CS2021002', studentName: 'Sarah Johnson', examId: '1', subject: 'Computer Networks', marksObtained: 92, totalMarks: 100, grade: 'A+', status: 'verified', evaluatedBy: 'Dr. Emma Wilson' },
    { id: '3', studentId: 'CS2021003', studentName: 'Michael Chen', examId: '1', subject: 'Computer Networks', marksObtained: 0, totalMarks: 100, grade: '', status: 'pending', evaluatedBy: '' },
    { id: '4', studentId: 'CS2021004', studentName: 'Emma Wilson', examId: '1', subject: 'Computer Networks', marksObtained: 78, totalMarks: 100, grade: 'B+', status: 'submitted', evaluatedBy: 'Dr. Emma Wilson' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'submitted': return <AlertCircle className="w-4 h-4" />;
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'published': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+': return 'text-green-600 font-bold';
      case 'A': return 'text-green-600';
      case 'B+': return 'text-blue-600';
      case 'B': return 'text-blue-600';
      case 'C+': return 'text-yellow-600';
      case 'C': return 'text-yellow-600';
      case 'D': return 'text-orange-600';
      case 'F': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredMarks = studentMarks
    .filter(mark => mark.examId === selectedExam)
    .filter(mark => {
      const q = searchQuery.trim().toLowerCase();
      return q.length === 0 ||
        mark.studentName.toLowerCase().includes(q) ||
        mark.studentId.toLowerCase().includes(q);
    });

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mark Entry & Evaluation</h1>
                <p className="text-gray-600 mt-2">Enter and manage student examination marks</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center" onClick={() => window.alert('Bulk upload (stub)')}>
                  <Upload className="w-5 h-5 mr-2" />
                  Bulk Upload
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center" onClick={() => window.alert('Export marks (stub)')}>
                  <Download className="w-5 h-5 mr-2" />
                  Export Marks
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Select Examination</h2>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <select
                      value={selectedExam}
                      onChange={(e) => setSelectedExam(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {exams.map(exam => (
                        <option key={exam.id} value={exam.id}>
                          {exam.title} - {new Date(exam.date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50" onClick={() => window.alert('Open filters (stub)')}>
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marks Obtained
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Marks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMarks.map((mark) => (
                      <tr key={mark.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{mark.studentName}</div>
                            <div className="text-sm text-gray-500">{mark.studentId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {mark.status === 'pending' ? (
                            <input
                              type="number"
                              min="0"
                              max={mark.totalMarks}
                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0"
                              onBlur={() => window.alert('Saved (stub)')}
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-900">{mark.marksObtained}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{mark.totalMarks}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {mark.marksObtained > 0 ? ((mark.marksObtained / mark.totalMarks) * 100).toFixed(1) + '%' : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getGradeColor(mark.grade)}`}>
                            {mark.grade || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(mark.status)}`}>
                              {getStatusIcon(mark.status)}
                              <span className="ml-1">{mark.status}</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {mark.status === 'pending' && (
                              <button className="text-green-600 hover:text-green-900" onClick={() => window.alert('Saved (stub)')}>
                                <Save className="w-4 h-4" />
                              </button>
                            )}
                            <button className="text-blue-600 hover:text-blue-900" onClick={() => window.alert('Edit (stub)')}>
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Edit3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
                    <p className="text-2xl font-bold text-gray-900">{filteredMarks.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {filteredMarks.filter(m => m.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {filteredMarks.filter(m => m.status !== 'pending').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Average</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {filteredMarks.filter(m => m.marksObtained > 0).length > 0 
                        ? (filteredMarks.reduce((sum, m) => sum + m.marksObtained, 0) / filteredMarks.filter(m => m.marksObtained > 0).length).toFixed(1)
                        : '0'
                      }%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MarkEntry;