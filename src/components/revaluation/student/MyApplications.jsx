import React, { useContext, useMemo } from 'react';
import Sidebar from '../../layout/Sidebar';
import Header from '../../layout/Header';
import { AuthContext } from '../../../App';
import { useRevaluation } from '../../../contexts/RevaluationContext.jsx';

const MyApplications = () => {
  const { user, sidebarVisible } = useContext(AuthContext);
  const studentId = user?.id || user?.studentId || 'STU-001';
  const { listApplications, timelines } = useRevaluation();

  const apps = listApplications({ studentId });
  const rows = useMemo(() => apps.map(a => {
    const tl = timelines.filter(t => t.applicationId === a.id).sort((x,y)=> (x.createdAt||'').localeCompare(y.createdAt||''));
    const submitted = a.submittedAt || tl[0]?.createdAt || '';
    const eta = '';
    // pretty subjects with old marks e.g., CS301(90)
    const oldBySub = new Map((a.items || []).map(it => [it.subjectId, it.oldMarks]));
    const subjects = (a.subjectIds || []).map(sid => `${sid}${oldBySub.has(sid) ? `(${oldBySub.get(sid) ?? '-'})` : ''}`).join(', ');
    return { ...a, submitted, eta, subjects };
  }), [apps, timelines]);

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">My Revaluation Applications</h1>

            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-2">App ID</th>
                    <th className="text-left px-4 py-2">Subject(s) • Old Marks</th>
                    <th className="text-left px-4 py-2">Fee</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Submitted on</th>
                    <th className="text-left px-4 py-2">ETA</th>
                    <th className="text-left px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No applications yet</td>
                    </tr>
                  ) : rows.map(r => (
                    <tr key={r.id} className="border-t">
                      <td className="px-4 py-2 font-mono">{r.id}</td>
                      <td className="px-4 py-2">{r.subjects}</td>
                      <td className="px-4 py-2">₹{r.feeAmount || 0}</td>
                      <td className="px-4 py-2">{r.status}</td>
                      <td className="px-4 py-2">{r.submitted?.slice(0,10)}</td>
                      <td className="px-4 py-2">{r.eta || '-'}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <button className="px-2 py-1 border rounded hover:bg-gray-50">View</button>
                          <button className="px-2 py-1 border rounded hover:bg-gray-50">Download Receipt</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyApplications;
