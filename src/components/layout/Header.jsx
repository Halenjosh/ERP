import React, { useContext, useState } from 'react';
import { AuthContext } from '../../App';
import { Bell, Search, User, LayoutDashboard } from 'lucide-react';

const Header = () => {
  const { user, toggleSidebar } = useContext(AuthContext);
  const [query, setQuery] = useState('');

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
        <div className="flex items-center space-x-3">
          <button aria-label="Toggle sidebar" className="p-2 rounded-lg hover:bg-gray-100" onClick={toggleSidebar}>
            <LayoutDashboard className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-2xl font-semibold text-gray-900">
            Welcome back, {displayName}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
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

          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" onClick={() => window.alert('Notifications (stub)')}>
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center space-x-3">
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