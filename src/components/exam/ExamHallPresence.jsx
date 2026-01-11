import React, { useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';
import { useData } from '../../contexts/DataContext.jsx';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import { Printer, Download, Users } from 'lucide-react';

const LS_KEY = 'examAttendance';
const loadAttendance = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; } };

const ExamHallPresence = () => {
  const { user, sidebarVisible } = useContext(AuthContext);
  const { exams = [], students = [] } = useData();
  const [selectedExamId, setSelectedExamId] = useState('');
  const [dept, setDept] = useState('');
  const [sem, setSem] = useState('');
  const [klass, setKlass] = useState('');
  const [year, setYear] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('present'); // present|absent|all
  const [sortBy, setSortBy] = useState('roll'); // roll|name
  const [sortDir, setSortDir] = useState('asc'); // asc|desc

  const attendance = useMemo(() => loadAttendance(), []);
  const navigate = useNavigate();
  const selectedExam = useMemo(() => exams.find(e => e.id === selectedExamId), [exams, selectedExamId]);
  // Eligible students based on filters (independent of attendance)
  const eligibleFiltered = useMemo(() => {
    let list = students.slice();
    if (dept) list = list.filter(s => s.department === dept);
    if (sem) list = list.filter(s => String(s.semester) === String(sem));
    if (klass) list = list.filter(s => (s.class || '') === klass);
    if (year) list = list.filter(s => (s.academicYear || '') === year);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(s => s.rollNumber.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }
    return list;
  }, [students, dept, sem, klass, year, query]);

  const presentStudents = useMemo(() => {
    if (!selectedExamId) return [];
    const map = attendance[selectedExamId] || {};
    // Apply status filter on eligible set
    let list = eligibleFiltered.filter(s => {
      const isPresent = !!map[s.id];
      if (statusFilter === 'present') return isPresent;
      if (statusFilter === 'absent') return !isPresent;
      return true;
    });
    list.sort((a,b) => {
      const keyA = sortBy === 'name' ? (a.name||'') : (a.rollNumber||'');
      const keyB = sortBy === 'name' ? (b.name||'') : (b.rollNumber||'');
      const cmp = String(keyA).localeCompare(String(keyB));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }, [attendance, selectedExamId, eligibleFiltered, statusFilter, sortBy, sortDir]);

  // Counters
  const counts = useMemo(() => {
    const map = attendance[selectedExamId] || {};
    const total = eligibleFiltered.length;
    const present = eligibleFiltered.filter(s => !!map[s.id]).length;
    const absent = Math.max(0, total - present);
    return { total, present, absent, hasAny: Object.keys(map).length > 0 };
  }, [attendance, selectedExamId, eligibleFiltered]);

  const groupedByHall = useMemo(() => {
    if (!selectedExam) return {};
    // For simplicity, everyone shares the same venue from exam data; but support multiple venues if exams array contains split sessions
    const byHall = {};
    const hall = selectedExam.venue || 'Hall';
    byHall[hall] = presentStudents.map(s => ({
      rollNumber: s.rollNumber,
      name: s.name,
      department: s.department,
      semester: s.semester,
      class: s.class || '-',
      academicYear: s.academicYear || '-',
    }));
    byHall[hall] = presentStudents;
    return byHall;
  }, [presentStudents, selectedExam]);

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    if (!selectedExamId) return;
    const rows = [['ExamId','Hall','RollNumber','Name','Department','Semester','Class','AcademicYear','ExamType','Venue','Date','Status']];
    Object.entries(groupedByHall).forEach(([hall, list]) => {
      list.forEach(s => rows.push([
        selectedExamId,
        hall,
        s.rollNumber,
        s.name,
        s.department,
        s.semester,
        (s.class || ''),
        (s.academicYear || ''),
        (selectedExam?.examType || selectedExam?.type || ''),
        (selectedExam?.venue || ''),
        (selectedExam?.date || ''),
        'Present'
      ]));
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `hall_presence_${selectedExamId}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const exportAbsentCSV = () => {
    if (!selectedExamId) return;
    const map = attendance[selectedExamId] || {};
    const rows = [['ExamId','RollNumber','Name','Department','Semester','Class','AcademicYear','ExamType','Venue','Date','Status']];
    students
      .filter(s => !map[s.id])
      .filter(s => (dept ? s.department === dept : true))
      .filter(s => (sem ? String(s.semester) === String(sem) : true))
      .filter(s => (klass ? (s.class || '') === klass : true))
      .filter(s => (year ? (s.academicYear || '') === year : true))
      .forEach(s => rows.push([
        selectedExamId,
        s.rollNumber,
        s.name,
        s.department,
        s.semester,
        (s.class || ''),
        (s.academicYear || ''),
        (selectedExam?.examType || selectedExam?.type || ''),
        (selectedExam?.venue || ''),
        (selectedExam?.date || ''),
        'Absent'
      ]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `hall_absent_${selectedExamId}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  if (user?.role === 'student') {
    // Students shouldn't access hall-wise presence list
    return (
      <div className="flex h-screen bg-gray-50">
        {sidebarVisible && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-2xl font-bold">Hall Presence</h1>
              <p className="text-gray-600">This section is for exam staff. Please contact invigilator for attendance queries.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Exam Hall Presence</h1>
                <p className="text-gray-600">Hall-wise list of present students for the selected exam</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={exportCSV} className="px-3 py-2 rounded bg-blue-600 text-white flex items-center gap-2"><Download className="w-4 h-4"/> Export Present</button>
                <button onClick={exportAbsentCSV} className="px-3 py-2 rounded bg-amber-600 text-white flex items-center gap-2"><Download className="w-4 h-4"/> Export Absent</button>
                <button onClick={handlePrint} className="px-3 py-2 rounded bg-gray-800 text-white flex items-center gap-2"><Printer className="w-4 h-4"/> Print</button>
              </div>
            </div>

            <div className="bg-white p-4 border rounded-lg grid grid-cols-1 md:grid-cols-8 gap-3">
              <div className="md:col-span-1">
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
                  {[...new Set(students.map(s=> String(s.semester)))].filter(Boolean).map(v=> (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Class</label>
                <select value={klass} onChange={e=> setKlass(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="">All</option>
                  {[...new Set(students.map(s=> s.class))].filter(Boolean).map(v=> (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Academic Year</label>
                <select value={year} onChange={e=> setYear(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="">All</option>
                  {[...new Set(students.map(s=> s.academicYear))].filter(Boolean).map(v=> (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lists */}
            {(!selectedExamId) ? (
              <div className="text-gray-500">Select an exam to view hall-wise presence list.</div>
            ) : (
              Object.entries(groupedByHall).map(([hall, list]) => (
                <div key={hall} className="bg-white border rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b flex items-center justify-between">
                    <div className="font-semibold flex items-center gap-2"><Users className="w-4 h-4"/> {hall} • Present: {list.length}</div>
                    {selectedExam && (
                      <div className="text-sm text-gray-600">
                        {selectedExam.courseCode} - {selectedExam.courseName} • {selectedExam.date}
                        {dept && <> • Dept: {dept}</>}
                        {sem && <> • Sem: {sem}</>}
                        {klass && <> • Class: {klass}</>}
                        {year && <> • AY: {year}</>}
                      </div>
                    )}
                  </div>
                  {/* Counters */}
                  <div className="px-4 py-3 flex items-center gap-3 text-sm">
                    <span className="px-2.5 py-1 rounded bg-green-50 border border-green-200">Present: <strong>{counts.present}</strong></span>
                    <span className="px-2.5 py-1 rounded bg-red-50 border border-red-200">Absent: <strong>{counts.absent}</strong></span>
                    <span className="px-2.5 py-1 rounded bg-gray-50 border border-gray-200">Total (filtered): <strong>{counts.total}</strong></span>
                  </div>

                  {/* Empty state if no attendance yet */}
                  {counts.hasAny ? (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="text-left px-4 py-2 w-10">#</th>
                        <th className="text-left px-4 py-2">Roll No</th>
                        <th className="text-left px-4 py-2">Name</th>
                        <th className="text-left px-4 py-2">Dept</th>
                        <th className="text-left px-4 py-2">Sem</th>
                        <th className="text-left px-4 py-2">Class</th>
                        <th className="text-left px-4 py-2">Academic Year</th>
                        <th className="text-left px-4 py-2">Exam Type</th>
                        <th className="text-left px-4 py-2">Venue</th>
                        <th className="text-left px-4 py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.length === 0 ? (
                        <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-500">No students match filters</td></tr>
                      ) : list.map((s, idx) => (
                        <tr key={s.id} className="border-t">
                          <td className="px-4 py-2">{idx+1}</td>
                          <td className="px-4 py-2">{s.rollNumber}</td>
                          <td className="px-4 py-2">{s.name}</td>
                          <td className="px-4 py-2">{s.department}</td>
                          <td className="px-4 py-2">{s.semester}</td>
                          <td className="px-4 py-2">{s.class || '-'}</td>
                          <td className="px-4 py-2">{s.academicYear || '-'}</td>
                          <td className="px-4 py-2">{selectedExam?.examType || selectedExam?.type || '-'}</td>
                          <td className="px-4 py-2">{selectedExam?.venue || '-'}</td>
                          <td className="px-4 py-2">{selectedExam?.date || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-600">
                      <div className="mb-2 font-medium">No attendance captured for this exam yet.</div>
                      <div className="mb-4 text-sm">Use Exam Attendance to mark presence, or import from CSV/folder.</div>
                      <button onClick={() => navigate('/exam-attendance')} className="px-3 py-2 rounded bg-blue-600 text-white">Go to Mark Attendance</button>
                      {eligibleFiltered.length > 0 && (
                        <div className="mt-6 text-sm text-gray-700">
                          <div className="font-semibold mb-2">Eligible students (based on current filters): {eligibleFiltered.length}</div>
                          <div className="max-h-48 overflow-y-auto border rounded">
                            <table className="w-full text-xs">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="text-left px-3 py-2">Roll No</th>
                                  <th className="text-left px-3 py-2">Name</th>
                                  <th className="text-left px-3 py-2">Dept</th>
                                  <th className="text-left px-3 py-2">Sem</th>
                                </tr>
                              </thead>
                              <tbody>
                                {eligibleFiltered.map(s => (
                                  <tr key={s.id} className="border-t">
                                    <td className="px-3 py-1">{s.rollNumber}</td>
                                    <td className="px-3 py-1">{s.name}</td>
                                    <td className="px-3 py-1">{s.department}</td>
                                    <td className="px-3 py-1">{s.semester}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExamHallPresence;
