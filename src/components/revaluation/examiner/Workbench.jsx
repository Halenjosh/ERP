import React, { useContext, useMemo, useState } from 'react';
import Sidebar from '../../layout/Sidebar';
import Header from '../../layout/Header';
import { AuthContext } from '../../../App';
import { useRevaluation } from '../../../contexts/RevaluationContext.jsx';

const Workbench = () => {
  const { user, sidebarVisible } = useContext(AuthContext);
  const { assignments, applications, saveRevisedMarks } = useRevaluation();
  // Build list of available examiner IDs from assignments for convenience
  const examinerOptions = useMemo(() => Array.from(new Set((assignments || []).map(a => a.examinerId))).filter(Boolean).sort(), [assignments]);

  const inferredExaminerId = useMemo(() => {
    // Try to infer from user fields
    const tryIds = [user?.examinerId, user?.id, user?.email, user?.username, user?.name].filter(Boolean);
    for (const v of tryIds) {
      if (examinerOptions.includes(v)) return v;
    }
    // fallback: first available or default seed
    return examinerOptions[0] || 'EXAMINER-001';
  }, [user, examinerOptions]);

  const [filterExaminerId, setFilterExaminerId] = useState(inferredExaminerId);

  const myApps = useMemo(() => {
    const appIds = new Set((assignments || []).filter(a => a.examinerId === filterExaminerId).map(a => a.applicationId));
    return (applications || []).filter(a => appIds.has(a.id));
  }, [assignments, applications, filterExaminerId]);

  const [editing, setEditing] = useState({}); // { appId: { subjectId: { newMarks, remarks }}}

  const setEntry = (appId, subjectId, field, value) => {
    setEditing(prev => ({
      ...prev,
      [appId]: { ...(prev[appId] || {}), [subjectId]: { ...(prev[appId]?.[subjectId] || {}), [field]: value } }
    }));
  };

  const saveDraft = (appId, items) => {
    const entries = Object.entries(editing[appId] || {}).map(([subjectId, v]) => ({ subjectId, newMarks: Number(v.newMarks) || null, remarks: v.remarks || '' }));
    saveRevisedMarks({ applicationId: appId, entries, finalize: false });
    alert('Draft saved');
  };

  const submitFinal = (appId) => {
    const entries = Object.entries(editing[appId] || {}).map(([subjectId, v]) => ({ subjectId, newMarks: Number(v.newMarks) || null, remarks: v.remarks || '' }));
    saveRevisedMarks({ applicationId: appId, entries, finalize: true });
    alert('Submitted final');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Examiner Workbench</h1>
              <div className="flex items-end gap-2">
                <div>
                  <label className="text-sm text-gray-600">Examiner</label>
                  <div className="flex items-center gap-2">
                    <select className="border rounded-lg px-3 py-2" value={filterExaminerId} onChange={(e)=> setFilterExaminerId(e.target.value)}>
                      {examinerOptions.length === 0 ? (
                        <option value={filterExaminerId}>{filterExaminerId}</option>
                      ) : examinerOptions.map(id => <option key={id} value={id}>{id}</option>)}
                    </select>
                    <input className="border rounded-lg px-3 py-2" placeholder="or type ID" value={filterExaminerId} onChange={(e)=> setFilterExaminerId(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            {myApps.length === 0 ? (
              <div className="bg-white border rounded-lg p-6 text-gray-600">
                <div className="font-medium mb-1">No assigned applications</div>
                <div className="text-sm">Tip: Ensure assignments use this Examiner ID: <span className="font-mono">{filterExaminerId}</span>. You can change it above. Available IDs: {examinerOptions.length ? examinerOptions.join(', ') : 'none yet'}.</div>
              </div>
            ) : myApps.map(app => (
              <div key={app.id} className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold">{app.id}</div>
                    <div className="text-sm text-gray-600">Student: {app.studentId}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-2 border rounded-lg hover:bg-gray-50" onClick={()=> saveDraft(app.id)}>Save Draft</button>
                    <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700" onClick={()=> submitFinal(app.id)}>Submit Final</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="text-left px-3 py-2">Subject</th>
                        <th className="text-left px-3 py-2">Old Marks</th>
                        <th className="text-left px-3 py-2">New Marks</th>
                        <th className="text-left px-3 py-2">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(app.items || []).map(it => (
                        <tr key={it.subjectId} className="border-t">
                          <td className="px-3 py-2">{it.subjectId}</td>
                          <td className="px-3 py-2">{it.oldMarks ?? '-'}</td>
                          <td className="px-3 py-2">
                            <input type="number" className="w-24 border rounded px-2 py-1" value={editing[app.id]?.[it.subjectId]?.newMarks ?? ''} onChange={(e)=> setEntry(app.id, it.subjectId, 'newMarks', e.target.value)} />
                          </td>
                          <td className="px-3 py-2">
                            <input className="w-full border rounded px-2 py-1" placeholder="Remarks" value={editing[app.id]?.[it.subjectId]?.remarks ?? ''} onChange={(e)=> setEntry(app.id, it.subjectId, 'remarks', e.target.value)} />
                          </td>
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

export default Workbench;
