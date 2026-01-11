import React, { useContext, useState } from 'react';
import { AuthContext } from '../../App';
import { Bell, Search, User, LayoutDashboard } from 'lucide-react';
import { useData } from '../../contexts/DataContext.jsx';

const Header = () => {
  const { user, toggleSidebar } = useContext(AuthContext);
  const { departments, selectedDepartment, setSelectedDepartment } = useData();
  const [query, setQuery] = useState('');
  const deptLabel = selectedDepartment ? (departments.find(d => d.id === selectedDepartment)?.name || selectedDepartment) : 'All Departments';
  const crestPrimary = '/crest.png';
  const crestFallback = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2nYg0uISpS5J-ijZ6m7-vTQgpc3gTOeRwjyHOeSKJfz0l7FWgDg0MpESj8wnAADE32UA&usqp=CAU';

  const displayName = user?.name || 'Guest';
  const displayRole = user?.role?.replace('_', ' ') || 'guest';

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      window.alert(`Search for: ${query}`);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and welcome message */}
        <div className="flex items-center">
          <button 
            aria-label="Toggle sidebar" 
            className="p-2 rounded-lg hover:bg-gray-100 mr-4" 
            onClick={toggleSidebar}
          >
            <LayoutDashboard className="w-5 h-5 text-gray-700" />
          </button>
          
          <div className="flex items-center">
            <img
              src={crestPrimary}
              onError={(e) => { if (e.currentTarget.src !== crestFallback) e.currentTarget.src = crestFallback; }}
              alt="DSU crest"
              className="w-8 h-8 rounded-full border border-gray-200"
            />
            <span className="font-semibold text-gray-900 ml-3">DSU CoE ERP</span>
            <span className="text-gray-300 mx-4">|</span>
            <h2 className="text-xl font-medium text-gray-900">Welcome back, {displayName}</h2>
          </div>
        </div>

        {/* Right side - Controls and user info */}
        <div className="flex items-center gap-4">
          <div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
              title="Global Department Filter"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          
          {selectedDepartment && (
            <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-200" title="Current Department">
              Dept: {deptLabel}
            </span>
          )}
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>

          <button 
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" 
            onClick={() => window.alert('Notifications (stub)')}
          >
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-600 capitalize">{displayRole}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;