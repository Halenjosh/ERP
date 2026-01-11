import React, { useContext, useMemo, useState } from 'react';
import Sidebar from '../../layout/Sidebar';
import Header from '../../layout/Header';
import { AuthContext } from '../../../App';
import { useRevaluation } from '../../../contexts/RevaluationContext.jsx';

const IntakeQueue = () => {
  const { user, sidebarVisible } = useContext(AuthContext);
  const { applications, timelines, markPaymentVerified, updateApplicationStatus, addTimeline, setAssignments, saveRevisedMarks, approveResults, publishResults } = useRevaluation();

  const [program, setProgram] = useState('');
  const [semester, setSemester] = useState('');
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState('');
  const [paid, setPaid] = useState(''); // '', 'Paid', 'Unpaid'
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState({});
  const [examinerId, setExaminerId] = useState('EXAMINER-001');
  const [dueDays, setDueDays] = useState(7);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (applications || []).filter(a => {
      if (status && a.status !== status) return false;
      if (paid && a.paymentStatus !== paid) return false;
      if (q) {
        const blob = `${a.id} ${a.studentId} ${a.subjectIds?.join(' ') || ''}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      // program/semester/subject filters are placeholders (require richer model)
      if (subject && !(a.subjectIds || []).includes(subject)) return false;
      return true;
    });
  }, [applications, status, paid, subject, query]);

  const toggleSelect = (id) => setSelectedIds(prev => ({ ...prev, [id]: !prev[id] }));
  const selectedList = Object.keys(selectedIds).filter(id => selectedIds[id]);

  const bulkVerify = () => {
    if (selectedList.length === 0) return;
    selectedList.forEach(id => {
      markPaymentVerified(id, 'BULK');
    });
    alert('Marked selected as Payment Verified');
  };

  const bulkAssign = () => {
    if (selectedList.length === 0) return;
    const now = new Date();
    const dueAt = new Date(now.getTime() + (Number(dueDays)||7)*24*60*60*1000).toISOString();
    const created = selectedList.map(appId => ({ id: `ASSIGN-${Date.now()}-${appId}`, applicationId: appId, examinerId, assignedAt: now.toISOString(), dueAt }));
    setAssignments(prev => [...prev, ...created]);
    selectedList.forEach(appId => addTimeline({ applicationId: appId, label: 'Assigned', note: `Examiner ${examinerId}, due ${dueAt.slice(0,10)}`, actorRole: user?.role || 'admin' }));
    alert(`Assigned ${selectedList.length} applications to ${examinerId}`);
    setSelectedIds({});
  };

  const bulkReject = () => {
    if (selectedList.length === 0) return;
    const reason = prompt('Reject reason?');
    if (!reason) return;
    selectedList.forEach(id => {
      updateApplicationStatus(id, { status: 'Rejected', rejectionReason: reason });
      addTimeline({ applicationId: id, label: 'Rejected', note: reason, actorRole: user?.role || 'admin' });
    });
    alert('Rejected selected applications');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">Revaluation Intake Queue</h1>

            <div className="bg-white border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                <input className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Search (App ID, Student, Subject)" value={query} onChange={(e)=> setQuery(e.target.value)} />
                <select className="border rounded-lg px-3 py-2" value={status} onChange={(e)=> setStatus(e.target.value)}>
                  <option value="">All Status</option>
                  {['Submitted','Payment Verified','Under Review','Awaiting Examiner','Revaluated','Result Approved','Published','Closed','Rejected'].map(s=> <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="border rounded-lg px-3 py-2" value={paid} onChange={(e)=> setPaid(e.target.value)}>
                  <option value="">Paid/Unpaid</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
                <input className="border rounded-lg px-3 py-2" placeholder="Filter Subject (code)" value={subject} onChange={(e)=> setSubject(e.target.value.toUpperCase())} />
              </div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                <div className="md:col-span-2 flex items-center gap-2">
                  <button className="px-3 py-2 border rounded-lg hover:bg-gray-50" onClick={bulkVerify}>Verify Payment</button>
                  <button className="px-3 py-2 border rounded-lg hover:bg-gray-50" onClick={bulkReject}>Reject Selected</button>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Examiner</label>
                  <input className="w-full border rounded-lg px-3 py-2" placeholder="EXAMINER-001" value={examinerId} onChange={(e)=> setExaminerId(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-gray-600">SLA (days)</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2" value={dueDays} onChange={(e)=> setDueDays(e.target.value)} />
                </div>
                <div className="md:col-span-1">
                  <button className="w-full px-3 py-2 border rounded-lg hover:bg-gray-50" onClick={bulkAssign} disabled={selectedList.length===0}>Assign Selected</button>
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
                    <th className="text-left px-4 py-2">Paid?</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Submitted</th>
                    <th className="text-left px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-gray-500">No applications</td>
                    </tr>
                  ) : rows.map(a => (
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
                      <td className="px-4 py-2">{a.paymentStatus || '-'}</td>
                      <td className="px-4 py-2">{a.status}</td>
                      <td className="px-4 py-2">{(a.submittedAt||'').slice(0,10)}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          {a.paymentStatus !== 'Paid' && (
                            <button className="px-2 py-1 border rounded hover:bg-gray-50" onClick={()=> markPaymentVerified(a.id, 'MANUAL')}>Mark Paid</button>
                          )}
                          {a.status !== 'Rejected' && (
                            <button className="px-2 py-1 border rounded hover:bg-gray-50" onClick={()=> {
                              const reason = prompt('Reject reason?');
                              if (!reason) return;
                              updateApplicationStatus(a.id, { status: 'Rejected', rejectionReason: reason });
                              addTimeline({ applicationId: a.id, label: 'Rejected', note: reason, actorRole: user?.role || 'admin' });
                            }}>Reject</button>
                          )}
                          {/* Quick demo actions for workflow */}
                          <button className="px-2 py-1 border rounded hover:bg-gray-50" onClick={() => {
                            // Simple demo: set newMarks = oldMarks + 5 for all items
                            const entries = (a.items || []).map(it => ({ subjectId: it.subjectId, newMarks: (Number(it.oldMarks)||0) + 5, remarks: 'Updated by examiner' }));
                            if (entries.length === 0) { alert('No subjects/items to update'); return; }
                            saveRevisedMarks({ applicationId: a.id, entries, finalize: true });
                            alert('Examiner marks saved and finalized (status -> Revaluated)');
                          }}>Enter Marks</button>
                          <button className="px-2 py-1 border rounded hover:bg-gray-50" onClick={() => {
                            approveResults(a.id);
                            alert('Results approved by CoE');
                          }}>Approve</button>
                          <button className="px-2 py-1 border rounded hover:bg-gray-50" onClick={() => {
                            publishResults(a.id);
                            alert('Results published by CoE');
                          }}>Publish</button>
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

export default IntakeQueue;
