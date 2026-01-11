import React, { useContext, useMemo } from 'react';
import Sidebar from '../../layout/Sidebar';
import Header from '../../layout/Header';
import { AuthContext } from '../../../App';
import { useRevaluation } from '../../../contexts/RevaluationContext.jsx';

const ChangeBadge = ({ oldMarks, newMarks }) => {
  if (newMarks == null || newMarks === undefined || oldMarks == null || oldMarks === undefined) {
    return <span className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700">Pending</span>;
  }
  if (newMarks > oldMarks) return <span className="px-2 py-0.5 text-xs rounded bg-emerald-100 text-emerald-700">Increased</span>;
  if (newMarks < oldMarks) return <span className="px-2 py-0.5 text-xs rounded bg-rose-100 text-rose-700">Decreased</span>;
  return <span className="px-2 py-0.5 text-xs rounded bg-amber-100 text-amber-700">No Change</span>;
};

const Results = () => {
  const { user, sidebarVisible } = useContext(AuthContext);
  const studentId = user?.id || user?.studentId || 'STU-001';
  const { applications } = useRevaluation();

  const myApps = useMemo(() => (applications || []).filter(a => a.studentId === studentId && (a.status === 'Revaluated' || a.status === 'Result Approved' || a.status === 'Published' || a.status === 'Closed'))
    .sort((a,b)=> (a.submittedAt||'').localeCompare(b.submittedAt||'')), [applications, studentId]);

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">Revaluation Results</h1>

            {myApps.length === 0 ? (
              <div className="bg-white border rounded-lg p-6 text-gray-600">No revaluation results yet. Check back after your application is processed.</div>
            ) : myApps.map(app => (
              <div key={app.id} className="bg-white border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Application {app.id}</div>
                    <div className="text-sm text-gray-600">Status: {app.status} • Fee: ₹{app.feeAmount || 0}</div>
                  </div>
                </div>
                <div className="p-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="text-left px-3 py-2">Subject</th>
                        <th className="text-left px-3 py-2">Old Marks</th>
                        <th className="text-left px-3 py-2">New Marks</th>
                        <th className="text-left px-3 py-2">Change</th>
                        <th className="text-left px-3 py-2">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(app.items || []).map(it => (
                        <tr key={it.subjectId} className="border-t">
                          <td className="px-3 py-2">{it.subjectId}</td>
                          <td className="px-3 py-2">{it.oldMarks ?? '-'}</td>
                          <td className="px-3 py-2">{it.newMarks ?? '-'}</td>
                          <td className="px-3 py-2"><ChangeBadge oldMarks={it.oldMarks} newMarks={it.newMarks} /></td>
                          <td className="px-3 py-2">{it.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Results;
