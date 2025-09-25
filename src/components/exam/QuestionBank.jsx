import React, { useContext, useState } from 'react';
import { AuthContext } from '../../App';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { FileText, Plus, Search, Filter, Edit, Trash2, Eye, Download } from 'lucide-react';

const QuestionBank = () => {
  const { user, sidebarVisible } = useContext(AuthContext);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const questions = [
    { id: '1', question: 'Explain the OSI model and its seven layers in detail.', type: 'long', subject: 'Computer Networks', difficulty: 'medium', marks: 10, createdBy: 'Dr. Emma Wilson', createdAt: '2025-01-15', options: [] },
    { id: '2', question: 'Which of the following is NOT a type of database constraint?', type: 'mcq', subject: 'Database Systems', difficulty: 'easy', marks: 2, createdBy: 'Prof. Michael Chen', createdAt: '2025-01-14', options: ['Primary Key', 'Foreign Key', 'Unique Key', 'Composite Key'], answer: 'Composite Key' },
    { id: '3', question: 'Write a program to implement binary search algorithm.', type: 'practical', subject: 'Data Structures', difficulty: 'hard', marks: 15, createdBy: 'Dr. Sarah Johnson', createdAt: '2025-01-13', options: [] },
    { id: '4', question: 'Define normalization and explain 1NF, 2NF, and 3NF.', type: 'short', subject: 'Database Systems', difficulty: 'medium', marks: 5, createdBy: 'Prof. Michael Chen', createdAt: '2025-01-12', options: [] }
  ];

  const subjects = ['all', 'Computer Networks', 'Database Systems', 'Data Structures', 'Software Engineering'];
  const difficulties = ['all', 'easy', 'medium', 'hard'];

  const query = searchQuery.trim().toLowerCase();
  const filteredQuestions = questions.filter(q => {
    const subjectMatch = selectedSubject === 'all' || q.subject === selectedSubject;
    const difficultyMatch = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    const searchMatch =
      query.length === 0 ||
      q.question.toLowerCase().includes(query) ||
      q.subject.toLowerCase().includes(query) ||
      q.createdBy.toLowerCase().includes(query);
    return subjectMatch && difficultyMatch && searchMatch;
  });

  const getTypeColor = (type) => {
    switch (type) {
      case 'mcq': return 'bg-blue-100 text-blue-800';
      case 'short': return 'bg-green-100 text-green-800';
      case 'long': return 'bg-purple-100 text-purple-800';
      case 'practical': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
                <p className="text-gray-600 mt-2">Manage exam questions and generate question papers</p>
              </div>
              
              <div className="flex items-center space-x-4">
                {(user?.role === 'coe' || user?.role === 'assistant_coe') && (
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center" onClick={() => window.alert('Generate paper (stub)')}>
                    <Download className="w-5 h-5 mr-2" />
                    Generate Paper
                  </button>
                )}
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center" onClick={() => window.alert('Add question (stub)')}>
                  <Plus className="w-5 h-5 mr-2" />
                  Add Question
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Question Repository</h2>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search questions..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>
                          {subject === 'all' ? 'All Subjects' : subject}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {difficulties.map(difficulty => (
                        <option key={difficulty} value={difficulty}>
                          {difficulty === 'all' ? 'All Difficulties' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 mt-1" onClick={() => window.alert('More filters (stub)')}>
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredQuestions.map((question) => (
                  <div key={question.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(question.type)}`}>
                            {question.type.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty}
                          </span>
                          <span className="text-sm text-gray-500">{question.marks} marks</span>
                        </div>
                        
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{question.question}</h3>
                        
                        {question.options && question.options.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Options:</p>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                              {question.options.map((option, index) => (
                                <li key={index} className={option === question.answer ? 'font-semibold text-green-600' : ''}>
                                  {option} {option === question.answer && '(Correct)'}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Subject: {question.subject}</span>
                          <span>Created by: {question.createdBy}</span>
                          <span>Date: {new Date(question.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" onClick={() => window.alert('Preview question (stub)')}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" onClick={() => window.alert('Edit question (stub)')}>
                          <Edit className="w-4 h-4" />
                        </button>
                        {(user?.role === 'coe' || user?.role === 'assistant_coe') && (
                          <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={() => window.confirm('Delete question? (stub)')}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Total Questions</h3>
                    <p className="text-3xl font-bold text-blue-600">{questions.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Subjects Covered</h3>
                    <p className="text-3xl font-bold text-green-600">{subjects.length - 1}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Papers Generated</h3>
                    <p className="text-3xl font-bold text-purple-600">23</p>
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

export default QuestionBank;