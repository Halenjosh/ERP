import React, { useContext, useState } from 'react';
import { AuthContext } from '../../App';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { Bell, Plus, Search, Filter, Calendar, FileText, Award, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const Notifications = () => {
  const { user, sidebarVisible } = useContext(AuthContext);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = [
    {
      id: '1',
      title: 'Exam Schedule Updated',
      message: 'Computer Networks exam has been rescheduled to March 20, 2025 at 10:00 AM',
      type: 'exam',
      priority: 'high',
      status: 'unread',
      createdAt: '2025-01-15T10:30:00Z',
      recipient: 'all_students',
      sender: 'Dr. Sarah Johnson'
    },
    {
      id: '2',
      title: 'Hall Tickets Available',
      message: 'Hall tickets for Database Systems midterm exam are now available for download',
      type: 'hall_ticket',
      priority: 'medium',
      status: 'read',
      createdAt: '2025-01-15T09:15:00Z',
      recipient: 'cs_students',
      sender: 'System'
    },
    {
      id: '3',
      title: 'Results Published',
      message: 'Operating Systems final exam results have been published. Check your student portal.',
      type: 'result',
      priority: 'high',
      status: 'unread',
      createdAt: '2025-01-14T16:45:00Z',
      recipient: 'semester_6',
      sender: 'Prof. Michael Chen'
    },
    {
      id: '4',
      title: 'Question Paper Submission Reminder',
      message: 'Reminder: Question papers for Software Engineering exam are due by January 18, 2025',
      type: 'reminder',
      priority: 'medium',
      status: 'read',
      createdAt: '2025-01-14T14:20:00Z',
      recipient: 'faculty',
      sender: 'CoE Office'
    },
    {
      id: '5',
      title: 'Mark Entry Deadline',
      message: 'Faculty members must submit marks for Computer Networks exam by January 20, 2025',
      type: 'deadline',
      priority: 'high',
      status: 'unread',
      createdAt: '2025-01-14T11:00:00Z',
      recipient: 'faculty',
      sender: 'Dr. Sarah Johnson'
    },
    {
      id: '6',
      title: 'System Maintenance Notice',
      message: 'The ERP system will be under maintenance on January 16, 2025 from 2:00 AM to 4:00 AM',
      type: 'system',
      priority: 'low',
      status: 'read',
      createdAt: '2025-01-13T18:30:00Z',
      recipient: 'all_users',
      sender: 'IT Department'
    }
  ];

  const types = ['all', 'exam', 'hall_ticket', 'result', 'reminder', 'deadline', 'system'];
  const statuses = ['all', 'read', 'unread'];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'exam': return <Calendar className="w-5 h-5" />;
      case 'hall_ticket': return <FileText className="w-5 h-5" />;
      case 'result': return <Award className="w-5 h-5" />;
      case 'reminder': return <Clock className="w-5 h-5" />;
      case 'deadline': return <AlertCircle className="w-5 h-5" />;
      case 'system': return <Bell className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'exam': return 'bg-blue-100 text-blue-600';
      case 'hall_ticket': return 'bg-green-100 text-green-600';
      case 'result': return 'bg-purple-100 text-purple-600';
      case 'reminder': return 'bg-yellow-100 text-yellow-600';
      case 'deadline': return 'bg-red-100 text-red-600';
      case 'system': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const formatType = (type) => {
    return (type || '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const query = searchQuery.trim().toLowerCase();
  const filteredNotifications = notifications.filter(notification => {
    const typeMatch = selectedType === 'all' || notification.type === selectedType;
    const statusMatch = selectedStatus === 'all' || notification.status === selectedStatus;
    const searchMatch =
      query.length === 0 ||
      notification.title.toLowerCase().includes(query) ||
      notification.message.toLowerCase().includes(query) ||
      notification.sender.toLowerCase().includes(query) ||
      notification.recipient.toLowerCase().includes(query);
    return typeMatch && statusMatch && searchMatch;
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
                <h1 className="text-3xl font-bold text-gray-900">DSU Notifications</h1>
                <p className="text-gray-600 mt-2">Stay updated with important announcements and alerts</p>
              </div>
              
              {(user?.role === 'coe' || user?.role === 'assistant_coe') && (
                <button className="btn-dsu-primary px-4 py-2 rounded-lg transition-colors flex items-center" onClick={() => window.alert('Compose notification (stub)')}>
                  <Plus className="w-5 h-5 mr-2" />
                  Send Notification
                </button>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">All Notifications</h2>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search notifications..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {types.map(type => (
                        <option key={type} value={type}>
                          {type === 'all' ? 'All Types' : formatType(type)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 mt-6" onClick={() => window.alert('More filters (stub)')}>
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-6 hover:bg-gray-50 border-l-4 ${getPriorityColor(notification.priority)} ${
                      notification.status === 'unread' ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(notification.type)}`}>
                          {getTypeIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className={`text-lg font-medium ${notification.status === 'unread' ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            {notification.status === 'unread' && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-3">{notification.message}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>From: {notification.sender}</span>
                            <span>To: {(notification.recipient || '').replace('_', ' ')}</span>
                            <span>{new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                          notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {notification.priority}
                        </span>
                        
                        {notification.status === 'unread' ? (
                          <button className="p-2 text-blue-600 hover:text-blue-800" onClick={() => window.alert('Marked as read (stub)')}>
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Bell className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total</h3>
                    <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Unread</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {notifications.filter(n => n.status === 'unread').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">High Priority</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {notifications.filter(n => n.priority === 'high').length}
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
                    <h3 className="text-sm font-medium text-gray-500">Read</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {notifications.filter(n => n.status === 'read').length}
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

export default Notifications;