import React, { useContext } from 'react';
import { AuthContext } from '../../App';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { CreditCard, Download, QrCode, Calendar, Clock, MapPin, User, Search, Filter } from 'lucide-react';

const HallTickets = () => {
  const { user, sidebarVisible } = useContext(AuthContext);

  const hallTickets = [
    {
      id: '1',
      studentId: 'CS2021001',
      studentName: 'Alex Rodriguez',
      examId: '1',
      examTitle: 'Computer Networks',
      subject: 'CS301',
      date: '2025-03-18',
      time: '10:00 AM',
      venue: 'Hall A',
      seatNumber: 'A-15',
      qrCode: 'QR123456789',
      status: 'active'
    },
    {
      id: '2',
      studentId: 'CS2021002',
      studentName: 'Sarah Johnson',
      examId: '2',
      examTitle: 'Database Systems',
      subject: 'CS302',
      date: '2025-03-20',
      time: '2:00 PM',
      venue: 'Hall B',
      seatNumber: 'B-23',
      qrCode: 'QR987654321',
      status: 'active'
    },
    {
      id: '3',
      studentId: 'CS2021003',
      studentName: 'Michael Chen',
      examId: '3',
      examTitle: 'Software Engineering',
      subject: 'CS401',
      date: '2025-03-22',
      time: '9:00 AM',
      venue: 'Hall C',
      seatNumber: 'C-07',
      qrCode: 'QR456789123',
      status: 'active'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = user?.role === 'student' 
    ? hallTickets.filter(ticket => ticket.studentName === user.name)
    : hallTickets;

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Hall Tickets</h1>
                <p className="text-gray-600 mt-2">
                  {user?.role === 'student' 
                    ? 'Download your exam hall tickets' 
                    : 'Manage and generate hall tickets for students'
                  }
                </p>
              </div>
              
              {user?.role === 'student' && (
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Download All
                </button>
              )}
            </div>

            {user?.role === 'student' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{ticket.examTitle}</h3>
                          <p className="text-blue-100">{ticket.subject}</p>
                        </div>
                        <CreditCard className="w-8 h-8 text-blue-200" />
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{ticket.studentName}</p>
                            <p className="text-sm text-gray-500">{ticket.studentId}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{new Date(ticket.date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-500">Exam Date</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{ticket.time}</p>
                            <p className="text-sm text-gray-500">Start Time</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{ticket.venue} - Seat {ticket.seatNumber}</p>
                            <p className="text-sm text-gray-500">Venue & Seat</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center">
                            <QrCode className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-500">QR: {ticket.qrCode}</span>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </div>
                      </div>
                      
                      <button className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                        <Download className="w-4 h-4 mr-2" />
                        Download Hall Ticket
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Hall Tickets Management</h2>
                    <div className="flex items-center space-x-4">
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

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Exam Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Venue & Seat
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
                      {hallTickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{ticket.studentName}</div>
                              <div className="text-sm text-gray-500">{ticket.studentId}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{ticket.examTitle}</div>
                              <div className="text-sm text-gray-500">{ticket.subject}</div>
                              <div className="text-sm text-gray-500">{new Date(ticket.date).toLocaleDateString()} at {ticket.time}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{ticket.venue}</div>
                            <div className="text-sm text-gray-500">Seat: {ticket.seatNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-4">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <QrCode className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HallTickets;