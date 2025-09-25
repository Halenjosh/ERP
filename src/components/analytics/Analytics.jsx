import React, { useContext, useState } from 'react';
import { AuthContext } from '../../App';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { BarChart3, TrendingUp, Users, Award, Calendar, Download, Filter } from 'lucide-react';

const Analytics = () => {
  const { user, sidebarVisible } = useContext(AuthContext);
  const [selectedPeriod, setSelectedPeriod] = useState('semester');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const analyticsData = {
    overview: {
      totalExams: 24,
      totalStudents: 3456,
      averageScore: 78.5,
      passRate: 89.2
    },
    subjectPerformance: [
      { subject: 'Computer Networks', avgScore: 82.3, passRate: 92, totalStudents: 156 },
      { subject: 'Database Systems', avgScore: 79.1, passRate: 88, totalStudents: 142 },
      { subject: 'Software Engineering', avgScore: 85.7, passRate: 94, totalStudents: 134 },
      { subject: 'Operating Systems', avgScore: 76.8, passRate: 85, totalStudents: 148 },
      { subject: 'Data Structures', avgScore: 74.2, passRate: 82, totalStudents: 167 }
    ],
    gradeDistribution: [
      { grade: 'A+', count: 245, percentage: 15.2 },
      { grade: 'A', count: 387, percentage: 24.1 },
      { grade: 'B+', count: 456, percentage: 28.4 },
      { grade: 'B', count: 298, percentage: 18.5 },
      { grade: 'C+', count: 145, percentage: 9.0 },
      { grade: 'C', count: 67, percentage: 4.2 },
      { grade: 'F', count: 9, percentage: 0.6 }
    ],
    trends: [
      { month: 'Jan', passRate: 85.2, avgScore: 76.8 },
      { month: 'Feb', passRate: 87.1, avgScore: 78.2 },
      { month: 'Mar', passRate: 89.2, avgScore: 78.5 },
      { month: 'Apr', passRate: 88.7, avgScore: 79.1 },
      { month: 'May', passRate: 90.3, avgScore: 80.2 }
    ]
  };

  const departments = ['all', 'Computer Science', 'Information Technology', 'Electronics', 'Mechanical'];
  const periods = ['semester', 'year', 'custom'];

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
                <p className="text-gray-600 mt-2">Comprehensive examination analytics and performance insights</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Export Report
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Analytics Filters</h2>
                  <div className="flex items-center space-x-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                      <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {periods.map(period => (
                          <option key={period} value={period}>
                            {period.charAt(0).toUpperCase() + period.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {departments.map(dept => (
                          <option key={dept} value={dept}>
                            {dept === 'all' ? 'All Departments' : dept}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 mt-6">
                      <Filter className="w-4 h-4 mr-2" />
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Exams</h3>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalExams}</p>
                    <p className="text-sm text-green-600">+3 this month</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.totalStudents.toLocaleString()}</p>
                    <p className="text-sm text-green-600">+45 this semester</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Average Score</h3>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.averageScore}%</p>
                    <p className="text-sm text-green-600">+2.3% improvement</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Pass Rate</h3>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.passRate}%</p>
                    <p className="text-sm text-green-600">+1.8% increase</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Subject-wise Performance</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analyticsData.subjectPerformance.map((subject, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{subject.subject}</h4>
                          <p className="text-sm text-gray-500">{subject.totalStudents} students</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">{subject.avgScore}%</p>
                          <p className="text-sm text-green-600">{subject.passRate}% pass rate</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Grade Distribution</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {analyticsData.gradeDistribution.map((grade, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                            {grade.grade}
                          </span>
                          <span className="font-medium text-gray-900">{grade.count} students</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${grade.percentage * 3}px` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{grade.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-green-600">Improving trend</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-5 gap-4">
                  {analyticsData.trends.map((trend, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">{trend.month}</h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-500">Pass Rate</p>
                          <p className="text-lg font-bold text-green-600">{trend.passRate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Avg Score</p>
                          <p className="text-lg font-bold text-blue-600">{trend.avgScore}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;