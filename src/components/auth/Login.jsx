import React, { useState, useContext } from 'react';
import { AuthContext } from '../../App';
import { User, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  // University crest: prefer local public/crest.png, fallback to provided URL
  const crestPrimary = '/crest.png';
  const crestFallback = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2nYg0uISpS5J-ijZ6m7-vTQgpc3gTOeRwjyHOeSKJfz0l7FWgDg0MpESj8wnAADE32UA&usqp=CAU';

  const demoUsers = [
    { id: '1', username: 'coe', password: 'coe123', name: 'Dr. Sarah Johnson', role: 'coe', department: 'Administration', email: 'coe@university.edu' },
    { id: '2', username: 'acoe', password: 'acoe123', name: 'Prof. Michael Chen', role: 'assistant_coe', department: 'Administration', email: 'acoe@university.edu' },
    { id: '3', username: 'faculty', password: 'faculty123', name: 'Dr. Emma Wilson', role: 'faculty', department: 'Computer Science', email: 'emma@university.edu' },
    { id: '4', username: 'student', password: 'student123', name: 'Alex Rodriguez', role: 'student', department: 'Computer Science', email: 'alex@university.edu' },
    { id: '5', username: 'coord', password: 'coord123', name: 'Prof. David Kumar', role: 'dept_coordinator', department: 'Computer Science', email: 'coord@university.edu' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const user = demoUsers.find(
        (u) => u.username === credentials.username && u.password === credentials.password
      );
      setLoading(false);
      if (user) {
        login(user, remember);
        const role = user.role;
        if (role === 'coe' || role === 'assistant_coe') navigate('/dashboard');
        else if (role === 'dept_coordinator') navigate('/exam-scheduling');
        else if (role === 'faculty') navigate('/mark-entry');
        else if (role === 'student') navigate('/hall-tickets');
        else navigate('/dashboard');
      } else {
        setError('Invalid credentials. Try: coe/coe123, faculty/faculty123, student/student123');
      }
    }, 350);
  };

  return (
    <div className="w-full h-screen flex overflow-hidden bg-gradient-to-br from-slate-50 to-white">
      {/* LEFT: Branding */}
      <aside className="hidden md:flex md:w-1/2 lg:w-2/5 xl:w-1/3 items-center justify-center px-12 bg-gradient-to-b from-sky-700 to-indigo-700 text-white" aria-hidden>
        <div className="max-w-xs text-center space-y-6">
          <div className="mx-auto">
            <img
              src={crestPrimary}
              onError={(e) => { if (e.currentTarget.src !== crestFallback) e.currentTarget.src = crestFallback; }}
              alt="University crest"
              className="w-28 h-28 object-contain rounded-full border-2 border-white/20 mx-auto bg-white/10 p-1"
            />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold leading-tight">Dhanalakshmi Srinivasan University</h1>
            <p className="text-sm text-white/90 mt-1">Controller of Examinations Portal</p>
          </div>
        </div>
      </aside>

      {/* RIGHT: Login */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <div className="text-sm text-slate-600">Welcome</div>
            <h2 className="text-3xl font-bold text-slate-900">Sign in to CoE ERP</h2>
            <p className="text-sm text-slate-500 mt-2">Use your university account to access the portal.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><User className="w-5 h-5" /></span>
                <input id="username" name="username" autoComplete="username" type="text" value={credentials.username} onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))} className="w-full pl-12 pr-3 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" placeholder="Enter username" required />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Lock className="w-5 h-5" /></span>
                <input id="password" name="password" autoComplete="current-password" type="password" value={credentials.password} onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))} className="w-full pl-12 pr-3 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" placeholder="Enter password" required />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Remember me
              </label>
              <button type="button" onClick={() => alert('Password reset not available in demo.')} className="text-sky-600 hover:underline">Forgot?</button>
            </div>

            <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-sky-600 text-white px-4 py-3 font-semibold hover:bg-sky-700">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 bg-white rounded-md border border-slate-100 p-4 text-sm text-slate-700">
            <strong>Demo accounts:</strong>
            <div className="mt-2 space-y-1">
              <div>CoE: <span className="font-medium">coe / coe123</span></div>
              <div>Assistant CoE: <span className="font-medium">acoe / acoe123</span></div>
              <div>Faculty: <span className="font-medium">faculty / faculty123</span></div>
              <div>Student: <span className="font-medium">student / student123</span></div>
              <div>Coordinator: <span className="font-medium">coord / coord123</span></div>
            </div>
          </div>

          <div className="mt-6 text-xs text-center text-slate-400">©️ {new Date().getFullYear()} Dhanalakshmi Srinivasan University</div>
        </div>
      </main>
    </div>
  );
};

export default Login;