import React, { useContext, useMemo, useState, useEffect } from 'react';
import { AuthContext } from '../../App';
import { useData } from '../../contexts/DataContext.jsx';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import { Calendar, Search, Download } from 'lucide-react';

const ExamTimeTable = () => {
  const { user, sidebarVisible } = useContext(AuthContext);
  const { exams = [], students = [], selectedDepartment: globalDepartment, examTypes = [] } = useData();

  // Student defaults
  const myStudent = useMemo(() => {
    if (user?.role !== 'student') return null;
    return students.find(s => s.id === user.id || s.rollNumber === user.rollNumber) || null;
  }, [user, students]);

  const [dept, setDept] = useState('');
  const [sem, setSem] = useState('');
  const [year, setYear] = useState('');
  const [etype, setEtype] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (user?.role === 'student' && myStudent) {
      setDept(myStudent.department || '');
      setSem(String(myStudent.semester || ''));
      setYear(myStudent.academicYear || '');
    } else if (globalDepartment) {
      setDept(globalDepartment);
    }
  }, [user, myStudent, globalDepartment]);

  const normalizeType = (t) => {
    const x = String(t || '').toLowerCase().replace(/[-_]/g, ' ').trim();
    if (/(cat\s*1|cia\s*1|unit\s*test\s*1|midterm\s*1)/.test(x)) return 'CAT1';
    if (/(cat\s*2|cia\s*2|unit\s*test\s*2|midterm\s*2)/.test(x)) return 'CAT2';
    if (/(model|pre\s*final|revision)/.test(x)) return 'MODEL';
    if (/(final|end\s*sem|external|main)/.test(x)) return 'FINAL';
    if (x) return x.toUpperCase();
    return '';
  };

  const filtered = useMemo(() => {
    let list = exams.slice();
    if (dept) list = list.filter(e => e.department === dept);
    if (sem) list = list.filter(e => String(e.semester) === String(sem));
    if (year) list = list.filter(e => e.academicYear === year);
    if (etype) list = list.filter(e => normalizeType(e.examType || e.type || e.title) === etype);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(e =>
        (e.courseCode || '').toLowerCase().includes(q) ||
        (e.courseName || '').toLowerCase().includes(q) ||
        (e.title || '').toLowerCase().includes(q)
      );
    }
    list.sort((a,b) => String(a.date).localeCompare(String(b.date)) || String(a.startTime).localeCompare(String(b.startTime)));
    return list.map(e => ({ ...e, _normType: normalizeType(e.examType || e.type || e.title) }));
  }, [exams, dept, sem, year, etype, query]);

  const exportCSV = () => {
    const rows = [[
      'Date','Start','End','CourseCode','CourseName','Title','ExamType','Department','Semester','AcademicYear','ExamId','ExamCode','Subject','Status','Students'
    ]];
    filtered.forEach(e => rows.push([
      e.date,
      e.startTime,
      e.endTime,
      e.courseCode,
      e.courseName,
      e.title || e.courseName,
      e._normType || e.examType || e.type || '',
      e.department,
      e.semester,
      e.academicYear,
      e.id,
      e.examCode,
      e.subject,
      e.status,
      e.students
    ]));
    const csv = rows.map(r => r.map(v => {
      const s = v == null ? '' : String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
    }).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'exam_timetable.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };
  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2"><Calendar className="w-6 h-6"/> Exam Time Table</h1>
                <p className="text-gray-600">Filter and export scheduled examinations</p>
              </div>
              <button onClick={exportCSV} className="px-3 py-2 rounded bg-blue-600 text-white flex items-center gap-2"><Download className="w-4 h-4"/> Export CSV</button>
            </div>

            {/* Quick type filters */}
            <div className="bg-white p-3 border rounded-lg flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 mr-2">Type:</span>
              {['', 'CAT1', 'CAT2', 'MODEL', 'FINAL'].map(t => (
                <button
                  key={t || 'ALL'}
                  onClick={() => setEtype(t)}
                  className={`px-3 py-1.5 rounded-full text-sm border ${etype===t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >{t || 'All'}</button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-white p-4 border rounded-lg">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Department</label>
                <select value={dept} onChange={e=> setDept(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="">All</option>
                  {[...new Set(exams.map(e=> e.department))].filter(Boolean).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Semester</label>
                <select value={sem} onChange={e=> setSem(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="">All</option>
                  {[...new Set(exams.map(e=> String(e.semester)))].filter(Boolean).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Academic Year</label>
                <select value={year} onChange={e=> setYear(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="">All</option>
                  {[...new Set(exams.map(e=> e.academicYear))].filter(Boolean).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Exam Type</label>
                <select value={etype} onChange={e=> setEtype(e.target.value)} className="w-full border rounded px-3 py-2">
                  <option value="">All</option>
                  {[...new Set(exams.map(e=> e.examType || e.type))].filter(Boolean).map(t => (
                    <option key={t} value={normalizeType(t)}>{normalizeType(t)}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
                  <input value={query} onChange={e=> setQuery(e.target.value)} placeholder="Search by course code/name or title" className="w-full border rounded px-9 py-2"/>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-2">Date</th>
                    <th className="text-left px-4 py-2">Time</th>
                    <th className="text-left px-4 py-2">Course</th>
                    <th className="text-left px-4 py-2">Title</th>
                    <th className="text-left px-4 py-2">Exam Type</th>
                    <th className="text-left px-4 py-2">Dept</th>
                    <th className="text-left px-4 py-2">Sem</th>
                    <th className="text-left px-4 py-2">AY</th>
                    <th className="text-left px-4 py-2">Exam ID</th>
                    <th className="text-left px-4 py-2">Exam Code</th>
                    <th className="text-left px-4 py-2">Subject</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-left px-4 py-2">Students</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={13} className="px-4 py-8 text-center text-gray-500">No exams match selected filters</td></tr>
                  ) : filtered.map((e, idx) => (
                    <tr key={e.id || idx} className="border-t">
                      <td className="px-4 py-2">{e.date}</td>
                      <td className="px-4 py-2">{e.startTime} - {e.endTime}</td>
                      <td className="px-4 py-2">{e.courseCode}</td>
                      <td className="px-4 py-2">{e.title || e.courseName}</td>
                      <td className="px-4 py-2">{e._normType || e.examType || e.type}</td>
                      <td className="px-4 py-2">{e.department}</td>
                      <td className="px-4 py-2">{e.semester}</td>
                      <td className="px-4 py-2">{e.academicYear}</td>
                      <td className="px-4 py-2">{e.id}</td>
                      <td className="px-4 py-2">{e.examCode}</td>
                      <td className="px-4 py-2">{e.subject}</td>
                      <td className="px-4 py-2">{e.status}</td>
                      <td className="px-4 py-2">{e.students}</td>
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

export default ExamTimeTable;
