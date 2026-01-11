import React, { useContext, useMemo, useState } from 'react';
import { AuthContext } from '../../App';
import { useData } from '../../contexts/DataContext.jsx';
import { useToaster } from '../../contexts/ToastContext.jsx';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';
import { Package, Users, ClipboardList, Download, RefreshCw } from 'lucide-react';

const LS_KEY = 'examPaperBundles';
const loadBundles = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
};
const saveBundles = (data) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
};

const ATTENDANCE_KEY = 'examAttendance';
const loadAttendance = () => {
  try { return JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || '{}'); } catch { return {}; }
};

const BUNDLE_COUNT = 10;
const BUNDLE_CAPACITY = 25; // per bundle total across categories

const ensureExamBundles = (store, examId) => {
  const next = { ...(store || {}) };
  if (!next[examId]) {
    next[examId] = {
      updatedAt: new Date().toISOString(),
      bundles: Array.from({ length: BUNDLE_COUNT }, (_, i) => ({
        id: i + 1,
        present: [],
        absent: [],
        malpractice: [],
      }))
    };
  }
  return next;
};

const ExamPaperBundles = () => {
  const { user, sidebarVisible } = useContext(AuthContext);
  const toaster = useToaster();
  const { exams = [], students = [], selectedDepartment: globalDepartment } = useData();

  const [selectedExamId, setSelectedExamId] = useState('');
  const [store, setStore] = useState(() => loadBundles());
  const [attendance] = useState(() => loadAttendance());
  const [dept, setDept] = useState(globalDepartment || '');
  const [sem, setSem] = useState('');

  const selectedExam = useMemo(() => exams.find(e => e.id === selectedExamId), [exams, selectedExamId]);

  const eligible = useMemo(() => {
    let list = students;
    const d = dept || selectedExam?.department;
    const s = sem || selectedExam?.semester;
    if (d) list = list.filter(x => x.department === d);
    if (s) list = list.filter(x => String(x.semester) === String(s));
    return list;
  }, [students, dept, sem, selectedExam]);

  const examBundles = useMemo(() => ensureExamBundles(store, selectedExamId || 'unspecified')[selectedExamId || 'unspecified'], [store, selectedExamId]);

  const bundleCounts = (b) => {
    const p = (b.present || []).length;
    const a = (b.absent || []).length;
    const m = (b.malpractice || []).length;
    const total = p + a + m;
    return { p, a, m, total, remaining: Math.max(0, BUNDLE_CAPACITY - total) };
  };

  const addToBundle = (bundleIdx, category, student) => {
    const examKey = selectedExamId || 'unspecified';
    setStore(prev => {
      const next = ensureExamBundles(prev, examKey);
      const b = { ...next[examKey].bundles[bundleIdx] };
      const counts = bundleCounts(b);
      if (counts.remaining <= 0) return prev; // capacity full
      // avoid duplicates across all categories in this bundle
      const allIds = new Set([...(b.present||[]), ...(b.absent||[]), ...(b.malpractice||[])]);
      if (allIds.has(student.id)) return prev;
      const updated = { ...b, [category]: [...(b[category] || []), student.id] };
      next[examKey] = {
        ...next[examKey],
        updatedAt: new Date().toISOString(),
        bundles: next[examKey].bundles.map((x, i) => i === bundleIdx ? updated : x)
      };
      saveBundles(next);
      return next;
    });
  };

  const moveWithinBundle = (bundleIdx, fromCat, toCat, studentId) => {
    const examKey = selectedExamId || 'unspecified';
    setStore(prev => {
      const next = ensureExamBundles(prev, examKey);
      const b = { ...next[examKey].bundles[bundleIdx] };
      const counts = bundleCounts(b);
      if (toCat !== fromCat && counts.remaining <= 0 && !(b[toCat] || []).includes(studentId)) return prev;
      const from = (b[fromCat] || []).filter(id => id !== studentId);
      const to = (b[toCat] || []).includes(studentId) ? b[toCat] : [ ...(b[toCat] || []), studentId ];
      const updated = { ...b, [fromCat]: from, [toCat]: to };
      next[examKey] = { ...next[examKey], bundles: next[examKey].bundles.map((x, i) => i === bundleIdx ? updated : x), updatedAt: new Date().toISOString() };
      saveBundles(next);
      return next;
    });
  };

  const removeFromBundle = (bundleIdx, studentId) => {
    const examKey = selectedExamId || 'unspecified';
    setStore(prev => {
      const next = ensureExamBundles(prev, examKey);
      const b = { ...next[examKey].bundles[bundleIdx] };
      const updated = {
        ...b,
        present: (b.present||[]).filter(id => id !== studentId),
        absent: (b.absent||[]).filter(id => id !== studentId),
        malpractice: (b.malpractice||[]).filter(id => id !== studentId),
      };
      next[examKey] = { ...next[examKey], bundles: next[examKey].bundles.map((x,i)=> i===bundleIdx?updated:x), updatedAt: new Date().toISOString() };
      saveBundles(next);
      return next;
    });
  };

  const autoFillFromAttendance = () => {
    if (!selectedExamId) {
      toaster.info('Select an exam first');
      return;
    }
    
    // Reload latest attendance from localStorage
    const fresh = loadAttendance();
    const rawMap = fresh[selectedExamId] || fresh['unspecified'] || {};
    const presentStudents = eligible.filter(s => !!rawMap[s.id]);
    
    if (presentStudents.length === 0) {
      toaster.info('No present students found for current exam/filters');
      return;
    }

    const examKey = selectedExamId || 'unspecified';
    const next = ensureExamBundles(store, examKey);
    
    // Calculate how many full bundles we can make (max 10 bundles)
    const totalStudents = presentStudents.length;
    const maxPossibleBundles = Math.min(BUNDLE_COUNT, Math.ceil(totalStudents / BUNDLE_CAPACITY));
    
    // Create new bundles array
    const newBundles = [];
    let studentIndex = 0;
    
    // Fill each bundle with exactly 25 students (or remaining for last bundle)
    for (let i = 0; i < maxPossibleBundles; i++) {
      const studentsForThisBundle = presentStudents.slice(
        studentIndex, 
        studentIndex + BUNDLE_CAPACITY
      );
      
      newBundles.push({
        id: i + 1,
        present: studentsForThisBundle.map(s => s.id),
        absent: [],
        malpractice: []
      });
      
      studentIndex += studentsForThisBundle.length;
    }
    
    // Fill any remaining empty bundles (if we have fewer than 10 bundles)
    while (newBundles.length < BUNDLE_COUNT) {
      newBundles.push({
        id: newBundles.length + 1,
        present: [],
        absent: [],
        malpractice: []
      });
    }
    
    // Update store with new bundles
    next[examKey] = {
      ...next[examKey],
      bundles: newBundles,
      updatedAt: new Date().toISOString()
    };
    
    setStore(next);
    saveBundles(next);
    
    const totalPlaced = newBundles.reduce((acc, b) => acc + (b.present || []).length, 0);
    toaster.success(`Auto-filled ${totalPlaced} papers into ${maxPossibleBundles} bundles.`);
  };

  const exportCSV = () => {
    if (!selectedExamId) return;
    const examKey = selectedExamId;
    const data = ensureExamBundles(store, examKey)[examKey];
    const rows = [[ 'BundleNo','Category','StudentId','RollNumber','Name','Department','Semester' ]];
    const mapStudent = (id) => students.find(s => s.id === id) || {};
    data.bundles.forEach(b => {
      [['present','Present'],['absent','Absent'],['malpractice','Malpractice']].forEach(([key,label]) => {
        (b[key]||[]).forEach(sid => {
          const s = mapStudent(sid);
          rows.push([b.id, label, s.id || sid, s.rollNumber || '', s.name || '', s.department || '', s.semester || '']);
        });
      });
    });
    const csv = rows.map(r => r.map(v => {
      const s = v == null ? '' : String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
    }).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `paper_bundles_${examKey}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const studentCard = (s, onAdd) => (
    <div key={s.id} className="border rounded px-3 py-2 text-sm flex items-center justify-between">
      <div>
        <div className="font-medium">{s.rollNumber} • {s.name}</div>
        <div className="text-gray-500">{s.department} • Sem {s.semester}</div>
      </div>
      <button onClick={onAdd} className="px-2 py-1 text-xs bg-blue-600 text-white rounded">Add</button>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="w-6 h-6"/> Paper Bundles</h1>
                <p className="text-gray-600">10 bundles • 25 papers per bundle • categories: Present / Absent / Malpractice</p>
              </div>
              <div className="flex gap-2">
                <button onClick={autoFillFromAttendance} className="px-3 py-2 rounded bg-purple-600 text-white flex items-center gap-2"><RefreshCw className="w-4 h-4"/> Auto Fill from Attendance</button>
                <button onClick={exportCSV} className="px-3 py-2 rounded bg-blue-600 text-white flex items-center gap-2"><Download className="w-4 h-4"/> Export CSV</button>
              </div>
            </div>

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
            </div>

            {/* Bundles grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {examBundles.bundles.map((b, i) => {
                const counts = bundleCounts(b);
                return (
                  <div key={b.id} className="bg-white border rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b flex items-center justify-between">
                      <div className="font-semibold flex items-center gap-2"><ClipboardList className="w-4 h-4"/> Bundle #{b.id}</div>
                      <div className="text-sm text-gray-600">{counts.total}/25 • Rem {counts.remaining}</div>
                    </div>

                    <div className="grid grid-cols-3 divide-x">
                      {['present','absent','malpractice'].map(cat => (
                        <div key={cat} className="p-3">
                          <div className="text-xs font-semibold mb-2 flex items-center gap-2">
                            <Users className="w-3 h-3"/> {cat.charAt(0).toUpperCase()+cat.slice(1)} ({(b[cat]||[]).length})
                          </div>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {(b[cat]||[]).map(sid => {
                              const s = students.find(x => x.id === sid);
                              if (!s) return null;
                              return (
                                <div key={sid} className="border rounded px-2 py-1 text-xs">
                                  <div className="font-medium">{s.rollNumber} • {s.name}</div>
                                  <div className="mt-1 flex gap-1">
                                    {cat !== 'present' && <button onClick={()=> moveWithinBundle(i, cat, 'present', sid)} className="px-2 py-0.5 bg-green-600 text-white rounded">Present</button>}
                                    {cat !== 'absent' && <button onClick={()=> moveWithinBundle(i, cat, 'absent', sid)} className="px-2 py-0.5 bg-amber-600 text-white rounded">Absent</button>}
                                    {cat !== 'malpractice' && <button onClick={()=> moveWithinBundle(i, cat, 'malpractice', sid)} className="px-2 py-0.5 bg-red-600 text-white rounded">Malpractice</button>}
                                    <button onClick={()=> removeFromBundle(i, sid)} className="px-2 py-0.5 bg-gray-200 rounded">Remove</button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick add from eligible list */}
                    <div className="p-3 border-t">
                      <div className="text-xs text-gray-600 mb-2">Add from eligible students</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto">
                        {eligible.slice(0, 50).map(s => studentCard(s, () => addToBundle(i, 'present', s)))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExamPaperBundles;
