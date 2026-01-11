import React, { useContext, useMemo, useState } from 'react';
import Sidebar from '../../layout/Sidebar';
import Header from '../../layout/Header';
import { AuthContext } from '../../../App';
import { useRevaluation } from '../../../contexts/RevaluationContext.jsx';

const Assignment = () => {
  const { user, sidebarVisible } = useContext(AuthContext);
  const { applications, assignments, setAssignments, addTimeline } = useRevaluation();

  const [selectedIds, setSelectedIds] = useState({});
  const [examinerId, setExaminerId] = useState('EXAMINER-001');
  const [dueDays, setDueDays] = useState(7);

  const awaiting = useMemo(() => (applications || []).filter(a => (a.status === 'Payment Verified' || a.status === 'Under Review')), [applications]);

  const toggleSelect = (id) => setSelectedIds(prev => ({ ...prev, [id]: !prev[id] }));
  const selectedList = Object.keys(selectedIds).filter(id => selectedIds[id]);

  const assignSelected = () => {
    if (selectedList.length === 0) return;
    const now = new Date();
    const dueAt = new Date(now.getTime() + dueDays*24*60*60*1000).toISOString();
    const created = selectedList.map(appId => ({ id: `ASSIGN-${Date.now()}-${appId}`, applicationId: appId, examinerId, assignedAt: now.toISOString(), dueAt }));
    setAssignments((prev) => [...prev, ...created]);
    selectedList.forEach(appId => addTimeline({ applicationId: appId, label: 'Assigned', note: `Examiner ${examinerId}, due ${dueAt.slice(0,10)}`, actorRole: user?.role || 'admin' }));
    alert(`Assigned ${selectedList.length} applications to ${examinerId}`);
    setSelectedIds({});
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">Revaluation Assignment</h1>

            <div className="bg-white border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="text-sm text-gray-600">Examiner</label>
                  <input className="w-full border rounded-lg px-3 py-2" value={examinerId} onChange={(e)=> setExaminerId(e.target.value)} placeholder="EXAMINER-001" />
                </div>
                <div>
                  <label className="text-sm text-gray-600">SLA (days)</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2" value={dueDays} onChange={(e)=> setDueDays(Number(e.target.value)||7)} />
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <button className="px-3 py-2 border rounded-lg hover:bg-gray-50" onClick={assignSelected} disabled={selectedList.length===0}>Assign Selected ({selectedList.length})</button>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-2">Select</th>
                    <th className="text-left px-4 py-2">App ID</th>
                    <th className="text-left px-4 py-2">Student</th>
                    <th className="text-left px-4 py-2">Subject(s) • Old Marks</th>
                    <th className="text-left px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {awaiting.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">No applications awaiting assignment</td></tr>
                  ) : awaiting.map(a => (
                    <tr key={a.id} className="border-t">
                      <td className="px-4 py-2"><input type="checkbox" checked={!!selectedIds[a.id]} onChange={()=> toggleSelect(a.id)} /></td>
                      <td className="px-4 py-2 font-mono">{a.id}</td>
                      <td className="px-4 py-2">{a.studentId}</td>
                      <td className="px-4 py-2">{
                        (() => {
                          const oldBy = new Map((a.items || []).map(it => [it.subjectId, it.oldMarks]));
                          return (a.subjectIds || []).map(sid => `${sid}${oldBy.has(sid) ? `(${oldBy.get(sid) ?? '-'})` : ''}`).join(', ');
                        })()
                      }</td>
                      <td className="px-4 py-2">{a.status}</td>
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

export default Assignment;
