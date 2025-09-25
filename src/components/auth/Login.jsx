import React, { useState, useContext } from 'react';
import { AuthContext } from '../../App';
import { User, FileText, Lock } from 'lucide-react';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const demoUsers = [
    { id: '1', username: 'coe', password: 'coe123', name: 'Dr. Sarah Johnson', role: 'coe', department: 'Administration', email: 'coe@university.edu' },
    { id: '2', username: 'acoe', password: 'acoe123', name: 'Prof. Michael Chen', role: 'assistant_coe', department: 'Administration', email: 'acoe@university.edu' },
    { id: '3', username: 'faculty', password: 'faculty123', name: 'Dr. Emma Wilson', role: 'faculty', department: 'Computer Science', email: 'emma@university.edu' },
    { id: '4', username: 'student', password: 'student123', name: 'Alex Rodriguez', role: 'student', department: 'Computer Science', email: 'alex@university.edu' },
    { id: '5', username: 'coord', password: 'coord123', name: 'Prof. David Kumar', role: 'dept_coordinator', department: 'Computer Science', email: 'coord@university.edu' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = demoUsers.find(
      u => u.username === credentials.username && u.password === credentials.password
    );

    if (user) {
      login(user);
    } else {
      setError('Invalid credentials. Try: coe/coe123, faculty/faculty123, student/student123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">CoE ERP System</h1>
          <p className="text-gray-600 mt-2">Controller of Examinations Portal</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Demo Accounts:</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>CoE:</strong> coe / coe123</p>
            <p><strong>Assistant CoE:</strong> acoe / acoe123</p>
            <p><strong>Faculty:</strong> faculty / faculty123</p>
            <p><strong>Student:</strong> student / student123</p>
            <p><strong>Coordinator:</strong> coord / coord123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;