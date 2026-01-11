import React, { useMemo, useState } from 'react';
import { useRevaluation } from '../../../contexts/RevaluationContext.jsx';
import { useData } from '../../../contexts/DataContext.jsx';
import { AuthContext } from '../../../App';
import { useContext } from 'react';
import Sidebar from '../../layout/Sidebar';
import Header from '../../layout/Header';

const SubjectPicker = ({ subjects, selected, onToggle }) => {
  return (
    <div className="border rounded-lg">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="text-left px-3 py-2">Select</th>
            <th className="text-left px-3 py-2">Subject</th>
            <th className="text-left px-3 py-2">Old Marks</th>
          </tr>
        </thead>
        <tbody>
          {(subjects || []).map(s => (
            <tr key={s.courseCode} className="border-t">
              <td className="px-3 py-2">
                <input type="checkbox" checked={!!selected[s.courseCode]} onChange={() => onToggle(s)} />
              </td>
              <td className="px-3 py-2">{s.courseName || s.courseCode}</td>
              <td className="px-3 py-2">{s.total} ({s.grade})</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const FeeSummaryBar = ({ count, perSubjectFee = 500, lateFee = 0, lastDate }) => {
  const subtotal = count * perSubjectFee;
  const total = subtotal + lateFee;
  return (
    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm">
      <div>
        <span className="font-medium">Subjects:</span> {count} • <span className="font-medium">Per Subject:</span> ₹{perSubjectFee} • <span className="font-medium">Late Fee:</span> ₹{lateFee}
      </div>
      <div className="font-semibold">Total: ₹{total} {lastDate ? <span className="font-normal text-gray-600">• Last date: {lastDate}</span> : null}</div>
    </div>
  );
};

const Apply = () => {
  const { user, sidebarVisible } = useContext(AuthContext);
  const studentId = user?.id || user?.studentId || 'STU-001';
  const { getResultsByStudent, semesters, getExamsBySemester } = useData();
  const { getFeesRule, applyRevaluation, addFile, markPaymentVerified } = useRevaluation();

  const [semester, setSemester] = useState('6');
  const [selected, setSelected] = useState({});
  const [reason, setReason] = useState('');
  const [lastAppId, setLastAppId] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [receiptObjUrl, setReceiptObjUrl] = useState('');

  const allResults = getResultsByStudent(studentId);
  const latestByCourse = useMemo(() => {
    const map = new Map();
    (allResults || []).forEach(r => {
      if (String(r.semester) !== String(semester)) return;
      const prev = map.get(r.courseCode);
      if (!prev || (r.version||0) > (prev.version||0)) map.set(r.courseCode, r);
    });
    return Array.from(map.values()).sort((a,b)=> (a.courseCode||'').localeCompare(b.courseCode||''));
  }, [allResults, semester]);

  // Fallback to scheduled exams if no results found for the semester
  const availableSubjects = useMemo(() => {
    if (latestByCourse.length > 0) return latestByCourse;
    const exams = getExamsBySemester(semester) || [];
    // Map exams to subject-like entries (no old marks)
    return exams.map(x => ({
      courseCode: x.courseCode || x.subject,
      courseName: x.courseName || x.title || x.subject,
      total: '-',
      grade: '-'
    })).filter(s => !!s.courseCode);
  }, [latestByCourse, semester, getExamsBySemester]);

  const program = 'BTech-CS';
  const feeRule = getFeesRule({ program, semester });
  const perSubjectFee = feeRule?.perSubjectFee || 500;
  const lateFee = 0; // compute from date if needed

  const toggleSubject = (r) => {
    setSelected(prev => {
      const next = { ...prev };
      if (next[r.courseCode]) delete next[r.courseCode]; else next[r.courseCode] = r;
      return next;
    });
  };

  const setSelectedFromCodes = (codes = []) => {
    const map = new Map(availableSubjects.map(r => [r.courseCode, r]));
    const next = {};
    codes.forEach(c => { if (map.has(c)) next[c] = map.get(c); });
    setSelected(next);
  };

  const onSubjectsDropdownChange = (e) => {
    const options = Array.from(e.target.selectedOptions).map(o => o.value);
    setSelectedFromCodes(options);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const subjectIds = Object.keys(selected);
    if (subjectIds.length === 0) {
      alert('Select at least one subject');
      return;
    }
    const feeAmount = subjectIds.length * perSubjectFee + lateFee;
    const oldMarksBySubject = Object.fromEntries(subjectIds.map(k => [k, selected[k].total]));
    const app = applyRevaluation({
      studentId,
      examId: `EXAM-${semester}`,
      subjectIds,
      oldMarksBySubject,
      reasonText: reason,
      feeAmount,
      paymentStatus: 'Unpaid',
      paymentRef: ''
    });
    alert(`Application submitted: ${app.id}`);
    setLastAppId(app.id);
    setSelected({});
    setReason('');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">Apply for Revaluation</h1>

            <div className="bg-white p-4 border rounded-lg space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Semester</label>
                  <select className="w-full border rounded-lg px-3 py-2" value={semester} onChange={(e)=> setSemester(e.target.value)}>
                    {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Reason (optional)</label>
                  <input className="w-full border rounded-lg px-3 py-2" placeholder="Reason for revaluation" value={reason} onChange={(e)=> setReason(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-gray-600">Select Subject(s)</label>
                    <div className="flex items-center gap-2">
                      <button type="button" className="text-sm px-2 py-1 border rounded hover:bg-gray-50"
                        onClick={() => setSelectedFromCodes(latestByCourse.map(r => r.courseCode))}>Select All</button>
                      <button type="button" className="text-sm px-2 py-1 border rounded hover:bg-gray-50"
                        onClick={() => setSelected({})}>Clear</button>
                    </div>
                  </div>
                  <select
                    multiple
                    size={Math.min(8, Math.max(3, availableSubjects.length))}
                    className="w-full border rounded-lg px-3 py-2"
                    value={Object.keys(selected)}
                    onChange={onSubjectsDropdownChange}
                  >
                    {availableSubjects.map(r => (
                      <option key={r.courseCode} value={r.courseCode}>
                        {r.courseCode} — {r.courseName} (Old: {r.total}, {r.grade})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {latestByCourse.length === 0 && (
                <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  No previous marks found for this semester. Showing subjects from the exam schedule.
                </div>
              )}
              <SubjectPicker subjects={availableSubjects} selected={selected} onToggle={toggleSubject} />
              <FeeSummaryBar count={Object.keys(selected).length} perSubjectFee={perSubjectFee} lateFee={lateFee} lastDate={feeRule?.lastDate} />

              <div className="flex items-center gap-2">
                <button onClick={onSubmit} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Submit</button>
                <button onClick={()=> setSelected({})} className="px-4 py-2 rounded-lg border hover:bg-gray-50">Clear</button>
              </div>

              {lastAppId && (
                <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold">Payment</h2>
                    <span className="text-sm text-gray-600">Application: {lastAppId}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div className="md:col-span-1">
                      <label className="text-sm text-gray-600">Payment Reference</label>
                      <input className="w-full border rounded-lg px-3 py-2" placeholder="TXN123456" value={paymentRef} onChange={(e)=> setPaymentRef(e.target.value)} />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-sm text-gray-600">Upload Receipt (optional)</label>
                      <input type="file" accept="image/*,application/pdf" className="w-full border rounded-lg px-3 py-2" onChange={(e)=> {
                        const f = e.target.files?.[0];
                        if (f) {
                          const url = URL.createObjectURL(f);
                          setReceiptObjUrl(url);
                        }
                      }} />
                    </div>
                    <div className="md:col-span-1 flex items-center gap-2">
                      <button type="button" className="px-3 py-2 border rounded-lg hover:bg-gray-100" onClick={() => {
                        if (!receiptObjUrl) { alert('Choose a receipt file first'); return; }
                        addFile({ applicationId: lastAppId, kind: 'receipt', url: receiptObjUrl });
                        alert('Receipt attached');
                      }}>Upload Receipt</button>
                      <button type="button" className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700" onClick={() => {
                        if (!paymentRef) { alert('Enter payment reference'); return; }
                        markPaymentVerified(lastAppId, paymentRef);
                        alert('Payment marked as verified');
                      }}>Mark Paid</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Apply;
