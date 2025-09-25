import React, { useContext, useState } from 'react';
import { AuthContext } from '../../App';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { Award, Download, Eye, Lock, Unlock, Search, Filter, TrendingUp, Users, FileText } from 'lucide-react';

const ResultProcessing = () => {
  const { user, sidebarVisible } = useContext(AuthContext);
  const [selectedSemester, setSelectedSemester] = useState('6');

  const results = [
    {
      id: '1',
      studentId: 'CS2021001',
      studentName: 'Alex Rodriguez',
      semester: 6,
      subjects: [
        { name: 'Computer Networks', marks: 85, grade: 'A' },
        { name: 'Database Systems', marks: 92, grade: 'A+' },
        { name: 'Software Engineering', marks: 78, grade: 'B+' },
        { name: 'Operating Systems', marks: 88, grade: 'A' }
      ],
      gpa: 8.7,
      cgpa: 8.5,
      status: 'published'
    },
    {
      id: '2',
      studentId: 'CS2021002',
      studentName: 'Sarah Johnson',
      semester: 6,
      subjects: [
        { name: 'Computer Networks', marks: 92, grade: 'A+' },
        { name: 'Database Systems', marks: 89, grade: 'A' },
        { name: 'Software Engineering', marks: 94, grade: 'A+' },
        { name: 'Operating Systems', marks: 91, grade: 'A+' }
      ],
      gpa: 9.2,
      cgpa: 9.0,
      status: 'published'
    },
    {
      id: '3',
      studentId: 'CS2021003',
      studentName: 'Michael Chen',
      semester: 6,
      subjects: [
        { name: 'Computer Networks', marks: 76, grade: 'B+' },
        { name: 'Database Systems', marks: 82, grade: 'A' },
        { name: 'Software Engineering', marks: 79, grade: 'B+' },
        { name: 'Operating Systems', marks: 85, grade: 'A' }
      ],
      gpa: 8.1,
      cgpa: 7.9,
      status: 'draft'
    }
  ];

  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

  const getStatusColor = () => {
    switch (status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'certified': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = () => {
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

  const filteredResults = user?.role === 'student' 
    ? results.filter(result => result.studentName === user.name)
    : results.filter(result => result.semester.toString() === selectedSemester);

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Results & Transcripts</h1>
                <p className="text-gray-600 mt-2">
                  {user?.role === 'student' 
                    ? 'View your academic results and download transcripts' 
                    : 'Process and publish student results'
                  }
                </p>
              </div>
              
              {user?.role !== 'student' && (
                <div className="flex items-center space-x-4">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Publish Results
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                    <Download className="w-5 h-5 mr-2" />
                    Generate Transcripts
                  </button>
                </div>
              )}
            </div>

            {user?.role !== 'student' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Result Management</h2>
                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                        <select
                          value={selectedSemester}
                          onChange={(e) => setSelectedSemester(e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {semesters.map(sem => (
                            <option key={sem} value={sem}>Semester {sem}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search students..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {user?.role === 'student' ? (
              <div className="space-y-6">
                {filteredResults.map((result) => (
                  <div key={result.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">Semester {result.semester} Results</h3>
                          <p className="text-gray-600">{result.studentName} ({result.studentId})</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-500">GPA</p>
                            <p className="text-2xl font-bold text-blue-600">{result.gpa}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500">CGPA</p>
                            <p className="text-2xl font-bold text-green-600">{result.cgpa}</p>
                          </div>
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(result.status)}`}>
                            {result.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Subject-wise Results</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.subjects.map((subject, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium text-gray-900">{subject.name}</h5>
                                <p className="text-sm text-gray-500">Marks: {subject.marks}/100</p>
                              </div>
                              <span className={`text-lg font-bold ${getGradeColor(subject.grade)}`}>
                                {subject.grade}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 flex items-center justify-end space-x-4">
                        <button className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          <Download className="w-4 h-4 mr-2" />
                          Download Transcript
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Academic Performance
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
                      {filteredResults.map((result) => (
                        <tr key={result.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{result.studentName}</div>
                              <div className="text-sm text-gray-500">{result.studentId}</div>
                              <div className="text-sm text-gray-500">Semester {result.semester}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-4">
                              <div className="text-center">
                                <p className="text-sm text-gray-500">GPA</p>
                                <p className="text-lg font-bold text-blue-600">{result.gpa}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-gray-500">CGPA</p>
                                <p className="text-lg font-bold text-green-600">{result.cgpa}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}>
                              {result.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <Download className="w-4 h-4" />
                              </button>
                              {result.status === 'draft' && (
                                <button className="text-purple-600 hover:text-purple-900">
                                  <Unlock className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {user?.role !== 'student' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
                      <p className="text-2xl font-bold text-gray-900">{results.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">Published</h3>
                      <p className="text-2xl font-bold text-gray-900">
                        {results.filter(r => r.status === 'published').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                      <p className="text-2xl font-bold text-gray-900">
                        {results.filter(r => r.status === 'draft').length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResultProcessing;