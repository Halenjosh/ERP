import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../App';
import { useData } from '../../contexts/DataContext.jsx';
import { useToaster } from '../../contexts/ToastContext.jsx';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import { CheckCircle2, XCircle, Users, Calendar, ClipboardList, Download, Search } from 'lucide-react';

// LocalStorage helpers
const LS_KEY = 'examAttendance';
const NOTES_KEY = 'examAttendanceNotes';
const loadAttendance = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
};
const saveAttendance = (data) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
};
const loadNotes = () => {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '{}'); } catch { return {}; }
};
const saveNotes = (data) => {
  try { localStorage.setItem(NOTES_KEY, JSON.stringify(data)); } catch {}
};

const ExamAttendance = () => {
  const { user, sidebarVisible } = useContext(AuthContext);
  const toaster = useToaster();
  const { exams = [], students = [], examTypes = [], selectedDepartment: globalDepartment } = useData();

  const [selectedExamId, setSelectedExamId] = useState('');
  const [dept, setDept] = useState(globalDepartment || '');
  const [sem, setSem] = useState('');
  const [query, setQuery] = useState('');
  const [attendance, setAttendance] = useState(() => loadAttendance());
  const [notes, setNotes] = useState(() => loadNotes());
  const [statusFilter, setStatusFilter] = useState('all'); // all|present|absent

  useEffect(() => { setDept(globalDepartment || ''); }, [globalDepartment]);

  const selectedExam = useMemo(() => exams.find(e => e.id === selectedExamId), [exams, selectedExamId]);

  // Derive eligible students: by chosen department + semester or from selected exam meta
  const eligibleStudents = useMemo(() => {
    let s = students;
    const d = dept || selectedExam?.department;
    const se = (sem || selectedExam?.semester || '').toString();
    if (d) s = s.filter(x => x.department === d);
    if (se) s = s.filter(x => String(x.semester) === String(se));
    if (query) {
      const q = query.toLowerCase();
      s = s.filter(x => x.name.toLowerCase().includes(q) || x.rollNumber.toLowerCase().includes(q));
    }
    return s;
  }, [students, dept, sem, selectedExam, query]);

  // Current exam attendance map
  const currentMap = useMemo(() => attendance[selectedExamId] || {}, [attendance, selectedExamId]);
  const currentNotes = useMemo(() => notes[selectedExamId] || {}, [notes, selectedExamId]);

  const presentCount = useMemo(() => Object.values(currentMap).filter(v => v === true).length, [currentMap]);

  const toggle = (sid, val) => {
    const examId = selectedExamId || 'unspecified';
    setAttendance(prev => {
      const next = { ...prev, [examId]: { ...(prev[examId] || {}), [sid]: val } };
      saveAttendance(next);
      return next;
    });
  };

  const markAll = (val) => {
    if (!selectedExamId && !dept && !sem) { toaster.info('Select an exam or filters first'); return; }
    setAttendance(prev => {
      const nextMap = { ...(prev[selectedExamId] || {}) };
      eligibleStudents.forEach(s => { nextMap[s.id] = val; });
      const next = { ...prev, [selectedExamId || 'unspecified']: nextMap };
      saveAttendance(next);
      return next;
    });
  };

  const setReason = (sid, value) => {
    const examId = selectedExamId || 'unspecified';
    setNotes(prev => {
      const next = { ...prev, [examId]: { ...(prev[examId] || {}), [sid]: value } };
      saveNotes(next);
      return next;
    });
  };

  const exportCSV = () => {
    if (!eligibleStudents.length) { toaster.error('No students to export'); return; }
    const rows = [['ExamId','RollNumber','Name','Department','Semester','Present']];
    eligibleStudents.forEach(s => {
      rows.push([selectedExamId, s.rollNumber, s.name, s.department, s.semester, (currentMap[s.id] ? 'Yes' : 'No')]);
    });
    const csv = rows.map(r => r.map(cell => {
      const v = cell == null ? '' : String(cell);
      return /[",\n]/.test(v) ? '"' + v.replace(/"/g,'""') + '"' : v;
    }).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedExamId || 'filtered'}.csv`;
    document.body.appendChild(a);
    a.click(); a.remove(); URL.revokeObjectURL(url);
    toaster.success('Attendance exported');
  };

  const exportAbsentCSV = () => {
    const filtered = eligibleStudents.filter(s => !currentMap[s.id]);
    if (!filtered.length) { toaster.info('No absent students to export'); return; }
    const rows = [['ExamId','RollNumber','Name','Department','Semester','Reason']];
    filtered.forEach(s => rows.push([selectedExamId, s.rollNumber, s.name, s.department, s.semester, currentNotes[s.id] || '' ]));
    const csv = rows.map(r => r.map(cell => {
      const v = cell == null ? '' : String(cell);
      return /[",\n]/.test(v) ? '"' + v.replace(/"/g,'""') + '"' : v;
    }).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `absent_${selectedExamId || 'filtered'}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    toaster.success('Absent list exported');
  };

  const clearCurrentExam = () => {
    if (!selectedExamId) { toaster.info('Select an exam first'); return; }
    const next = { ...attendance };
    delete next[selectedExamId];
    setAttendance(next); saveAttendance(next);
    const nextNotes = { ...notes }; delete nextNotes[selectedExamId]; setNotes(nextNotes); saveNotes(nextNotes);
    toaster.success('Cleared attendance for selected exam');
  };

  // --- Folder upload: import multiple CSVs ---
  const parseCsvSimple = (text) => {
    // very light parser: split lines, first line headers, simple comma split with quote handling minimal
    const lines = text.split(/\r?\n/).filter(l => l.trim().length);
    if (lines.length === 0) return [];
    const split = (line) => {
      const out = []; let cur = ''; let inQ = false;
      for (let i=0;i<line.length;i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQ && line[i+1] === '"') { cur += '"'; i++; }
          else inQ = !inQ;
        } else if (ch === ',' && !inQ) { out.push(cur); cur = ''; }
        else cur += ch;
      }
      out.push(cur);
      return out.map(s => s.trim());
    };
    const headers = split(lines[0]).map(h => h.toLowerCase());
    const rows = [];
    for (let i=1;i<lines.length;i++) {
      const vals = split(lines[i]);
      if (vals.length === 1 && vals[0] === '') continue;
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = vals[idx]; });
      rows.push(obj);
    }
    return rows;
  };

  const importFolderCsv = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter(f => f.name.toLowerCase().endsWith('.csv'));
    if (files.length === 0) { toaster.info('No CSV files in selected folder'); return; }

    // Read all files
    const readText = (file) => new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = reject;
      fr.readAsText(file);
    });

    const nextAttendance = { ...attendance };
    for (const file of files) {
      try {
        const text = await readText(file);
        const rows = parseCsvSimple(text);
        // Expect columns like: ExamId, RollNumber, Present (Yes/No or 1/0)
        rows.forEach(row => {
          const examId = (row.examid || row["exam id"] || '').toString() || selectedExamId || 'unspecified';
          if (!nextAttendance[examId]) nextAttendance[examId] = {};
          const roll = (row.rollnumber || row.roll || row["roll no"] || '').toString();
          if (!roll) return;
          const student = students.find(s => s.rollNumber === roll);
          if (!student) return;
          const presentRaw = (row.present || row.attendance || row.status || '').toString().toLowerCase();
          const present = presentRaw === 'yes' || presentRaw === 'present' || presentRaw === '1' || presentRaw === 'true' || presentRaw === 'y';
          nextAttendance[examId][student.id] = present;
        });
      } catch (e) {
        // continue other files
      }
    }
    setAttendance(nextAttendance);
    saveAttendance(nextAttendance);
    toaster.success('Folder imported');
  };

  // Student self view
  if (user?.role === 'student') {
    const myRoll = user.rollNumber || user.id;
    const myAttendance = Object.entries(attendance).flatMap(([examId, map]) => {
      const exam = exams.find(e => e.id === examId);
      if (!exam) return [];
      const val = map?.[students.find(s => s.rollNumber === myRoll || s.id === myRoll)?.id];
      return [{ exam, present: !!val }];
    });

    return (
      <div className="flex h-screen bg-gray-50">
        {sidebarVisible && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">My Exam Attendance</h1>
                  <p className="text-gray-600">Presence status for scheduled examinations</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left px-4 py-2">Exam</th>
                      <th className="text-left px-4 py-2">Course</th>
                      <th className="text-left px-4 py-2">Date</th>
                      <th className="text-left px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myAttendance.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No attendance records yet</td></tr>
                    ) : myAttendance.map((r, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2">{r.exam?.title || r.exam?.courseName || r.exam?.courseCode}</td>
                        <td className="px-4 py-2">{r.exam?.courseCode} - {r.exam?.courseName}</td>
                        <td className="px-4 py-2">{r.exam?.date}</td>
                        <td className="px-4 py-2">{r.present ? 'Present' : 'Absent'}</td>
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
  }

  // Admin/Faculty view (default)
  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Exam Attendance</h1>
                <p className="text-gray-600">Mark and export attendance for scheduled examinations</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                <button onClick={() => markAll(true)} className="px-3 py-2 rounded bg-green-600 text-white flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Mark All Present</button>
                <button onClick={() => markAll(false)} className="px-3 py-2 rounded bg-red-600 text-white flex items-center gap-2"><XCircle className="w-4 h-4"/> Mark All Absent</button>
                <button onClick={exportCSV} className="px-3 py-2 rounded bg-blue-600 text-white flex items-center gap-2"><Download className="w-4 h-4"/> Export CSV</button>
                <button onClick={exportAbsentCSV} className="px-3 py-2 rounded bg-amber-600 text-white flex items-center gap-2"><Download className="w-4 h-4"/> Export Absent</button>
                <label className="px-3 py-2 rounded bg-white border flex items-center gap-2 cursor-pointer">
                  <input type="file" multiple webkitdirectory="true" directory="true" className="hidden" onChange={(e)=> importFolderCsv(e.target.files)} />
                  Import Folder (CSV)
                </label>
                <button onClick={clearCurrentExam} className="px-3 py-2 rounded bg-gray-200 text-gray-800">Clear Exam</button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-white p-4 border rounded-lg">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Exam</label>
                <select value={selectedExamId} onChange={e=> setSelectedExamId(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="">Select Exam</option>
                  {exams.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.courseCode} - {ex.courseName} ({ex.academicYear})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Department</label>
                <select value={dept} onChange={e=> setDept(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="">All</option>
                  {[...new Set(students.map(s=> s.department))].filter(Boolean).map(d=> (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Semester</label>
                <select value={sem} onChange={e=> setSem(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="">All</option>
                  {[...new Set(students.map(s=> String(s.semester)))].filter(Boolean).map(s=> (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
                  <input value={query} onChange={e=> setQuery(e.target.value)} placeholder="Search by name or roll number" className="w-full border rounded px-9 py-2"/>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Status</label>
                <select value={statusFilter} onChange={e=> setStatusFilter(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="all">All</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-2 w-10">#</th>
                    <th className="text-left px-4 py-2">Student</th>
                    <th className="text-left px-4 py-2">Roll No</th>
                    <th className="text-left px-4 py-2">Dept</th>
                    <th className="text-left px-4 py-2">Sem</th>
                    <th className="text-left px-4 py-2">Present</th>
                    <th className="text-left px-4 py-2">Reason (if Absent)</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let rows = eligibleStudents;
                    if (statusFilter === 'present') rows = rows.filter(s => !!currentMap[s.id]);
                    if (statusFilter === 'absent') rows = rows.filter(s => !currentMap[s.id]);
                    if (rows.length === 0) {
                      return (<tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No students match filters</td></tr>);
                    }
                    return rows.map((s, idx) => (
                      <tr key={s.id} className="border-t">
                        <td className="px-4 py-2">{idx+1}</td>
                        <td className="px-4 py-2">{s.name}</td>
                        <td className="px-4 py-2">{s.rollNumber}</td>
                        <td className="px-4 py-2">{s.department}</td>
                        <td className="px-4 py-2">{s.semester}</td>
                        <td className="px-4 py-2">
                          <label className="inline-flex items-center gap-2">
                            <input type="checkbox" checked={!!currentMap[s.id]} onChange={e=> toggle(s.id, e.target.checked)} />
                            <span>{currentMap[s.id] ? 'Present' : 'Absent'}</span>
                          </label>
                        </td>
                        <td className="px-4 py-2">
                          {!currentMap[s.id] && (
                            <select value={currentNotes[s.id] || ''} onChange={e=> setReason(s.id, e.target.value)} className="border rounded px-2 py-1">
                              <option value="">-</option>
                              <option>Medical</option>
                              <option>On Duty</option>
                              <option>Late</option>
                              <option>Other</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex items-center gap-3 text-sm text-gray-700 flex-wrap">
              <div className="px-3 py-2 bg-green-50 border border-green-200 rounded">Present: <strong>{presentCount}</strong></div>
              <div className="px-3 py-2 bg-red-50 border border-red-200 rounded">Absent: <strong>{Math.max(0, eligibleStudents.length - presentCount)}</strong></div>
              {selectedExam && (
                <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded">Exam: <strong>{selectedExam.courseCode} - {selectedExam.courseName}</strong></div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExamAttendance;
