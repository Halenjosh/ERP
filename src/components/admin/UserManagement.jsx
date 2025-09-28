import React, { useContext, useState } from 'react';
import { AuthContext } from '../../App';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { Users, Plus, Search, Filter, Edit, Trash2, Shield, Mail, Phone } from 'lucide-react';

const UserManagement = () => {
  const { user, sidebarVisible } = useContext(AuthContext);
  const [selectedRole, setSelectedRole] = useState('all');

  const users = [
    {
      id: '1',
      username: 'coe',
      name: 'Dr. Sarah Johnson',
      role: 'coe',
      department: 'Administration',
      email: 'coe@university.edu',
      phone: '+1 234-567-8901',
      status: 'active',
      lastLogin: '2025-01-15T10:30:00Z',
      createdAt: '2024-08-01T00:00:00Z'
    },
    {
      id: '2',
      username: 'acoe',
      name: 'Prof. Michael Chen',
      role: 'assistant_coe',
      department: 'Administration',
      email: 'acoe@university.edu',
      phone: '+1 234-567-8902',
      status: 'active',
      lastLogin: '2025-01-15T09:15:00Z',
      createdAt: '2024-08-01T00:00:00Z'
    },
    {
      id: '3',
      username: 'faculty1',
      name: 'Dr. Emma Wilson',
      role: 'faculty',
      department: 'Computer Science',
      email: 'emma@university.edu',
      phone: '+1 234-567-8903',
      status: 'active',
      lastLogin: '2025-01-14T16:45:00Z',
      createdAt: '2024-08-15T00:00:00Z'
    },
    {
      id: '4',
      username: 'coord1',
      name: 'Prof. David Kumar',
      role: 'dept_coordinator',
      department: 'Computer Science',
      email: 'coord@university.edu',
      phone: '+1 234-567-8904',
      status: 'active',
      lastLogin: '2025-01-14T14:20:00Z',
      createdAt: '2024-09-01T00:00:00Z'
    },
    {
      id: '5',
      username: 'student1',
      name: 'Alex Rodriguez',
      role: 'student',
      department: 'Computer Science',
      email: 'alex@university.edu',
      phone: '+1 234-567-8905',
      status: 'active',
      lastLogin: '2025-01-15T11:00:00Z',
      createdAt: '2024-08-20T00:00:00Z'
    },
    {
      id: '6',
      username: 'faculty2',
      name: 'Dr. Lisa Park',
      role: 'faculty',
      department: 'Information Technology',
      email: 'lisa@university.edu',
      phone: '+1 234-567-8906',
      status: 'inactive',
      lastLogin: '2025-01-10T08:30:00Z',
      createdAt: '2024-09-15T00:00:00Z'
    }
  ];

  const roles = ['all', 'coe', 'assistant_coe', 'faculty', 'student', 'dept_coordinator'];

  const getRoleColor = (role) => {
    switch (role) {
      case 'coe': return 'bg-purple-100 text-purple-800';
      case 'assistant_coe': return 'bg-blue-100 text-blue-800';
      case 'faculty': return 'bg-green-100 text-green-800';
      case 'student': return 'bg-yellow-100 text-yellow-800';
      case 'dept_coordinator': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRole = (role) => {
    return (role || '').replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const filteredUsers = selectedRole === 'all' 
    ? users 
    : users.filter(u => u.role === selectedRole);
  
  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
  <div className="max-w-7xl mx-auto">
    {/* Page header */}
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">DSU User Management</h1>
        <p className="text-gray-600 mt-2">Manage system users and their permissions</p>
      </div>
      <button className="btn-dsu-primary px-4 py-2 rounded-lg transition-colors flex items-center">
        <Plus className="w-5 h-5 mr-2" />
        Add New User
      </button>
    </div>

    {/* Filters/Search */}
    <div className="p-6 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">System Users</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role === 'all' ? 'All Roles' : formatRole(role)}
              </option>
            ))}
          </select>
        </div>

        <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 mt-6">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </button>
      </div>
    </div>

    {/* Users table */}
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Details</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role & Department</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Information</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredUsers.map((userData) => (
            <tr key={userData.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">{userData.name.charAt(0)}</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{userData.name}</div>
                    <div className="text-sm text-gray-500">@{userData.username}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(userData.role)}`}>
                    {formatRole(userData.role)}
                  </span>
                  <div className="text-sm text-gray-500 mt-1">{userData.department}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-900">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {userData.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {userData.phone}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(userData.status)}`}>
                  {userData.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(userData.lastLogin).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-900"><Edit className="w-4 h-4" /></button>
                  <button className="text-green-600 hover:text-green-900"><Shield className="w-4 h-4" /></button>
                  <button className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Stats grid */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
            <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'active').length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Faculty</h3>
            <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'faculty').length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500">Students</h3>
            <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'student').length}</p>
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

export default UserManagement;