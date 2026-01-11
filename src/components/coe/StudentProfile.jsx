import React, { useContext, useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { AuthContext } from '../../App';
import { useData } from '../../contexts/DataContext.jsx';
import { ArrowLeft, Edit3, Save, ShieldAlert, Eye, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const SemestersOverview = ({ results, onView }) => {
  const semesters = ['1','2','3','4','5','6','7','8'];
  // latest per course within each semester
  const bySemLatest = useMemo(() => {
    const map = new Map();
    semesters.forEach(s => map.set(s, new Map()));
    (results || []).forEach(r => {
      const sem = String(r.semester || '');
      if (!map.has(sem)) return;
      const courseMap = map.get(sem);
      const existing = courseMap.get(r.courseCode);
      if (!existing || (r.version || 0) > (existing.version || 0)) {
        courseMap.set(r.courseCode, r);
      }
    });
    return map;
  }, [results]);

  return (
    <div className="space-y-4">
      {semesters.map(sem => {
        const courseMap = bySemLatest.get(sem);
        const list = courseMap ? Array.from(courseMap.values()) : [];
        return (
          <div key={sem} className="border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
              <div>
                <div className="font-semibold">Semester {sem}</div>
                <div className="text-xs text-gray-600">{list.length} courses</div>
              </div>
              <button
                className="inline-flex items-center px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50"
                onClick={() => onView(sem)}
                title={`View Semester ${sem} results`}
              >
                <Eye className="w-4 h-4 mr-2" /> View
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Student avatar that prefers provided photoUrl; otherwise fetches Indian face once and caches
const StudentAvatar = ({ student }) => {
  const [src, setSrc] = useState('');
  const size = 128;
  const cacheKey = `stu_photo_in_${student?.id || student?.rollNumber || 'unknown'}`;

  useEffect(() => {
    let mounted = true;
    // 1) explicit photo
    if (student?.photoUrl) {
      setSrc(student.photoUrl);
      return () => { mounted = false; };
    }
    try {
      // 2) cache
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setSrc(cached);
        return () => { mounted = false; };
      }
    } catch {}

    // 3) fetch indian nationality face using deterministic seed
    const seed = encodeURIComponent(student?.id || student?.rollNumber || 'seed');
    fetch(`https://randomuser.me/api/?nat=in&results=1&seed=${seed}`)
      .then(r => r.json())
      .then(json => {
        const url = json?.results?.[0]?.picture?.large;
        if (url && mounted) {
          setSrc(url);
          try { localStorage.setItem(cacheKey, url); } catch {}
        }
      })
      .catch(() => {
        // fallback to pravatar deterministic
        if (mounted) setSrc(`https://i.pravatar.cc/${size}?u=${seed}`);
      });

    return () => { mounted = false; };
  }, [student]);

  const fallback = `https://i.pravatar.cc/${size}?u=${encodeURIComponent(student?.id || student?.rollNumber || 'student')}`;

  return (
    <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
      <img
        src={src || fallback}
        alt={`${student?.name || 'Student'} photo`}
        className="w-full h-full object-cover"
        onError={(e) => { e.currentTarget.src = fallback; }}
      />
    </div>
  );
};

// Simple modal for semester results (up to 8 subjects)
const SemesterModal = ({ open, onClose, semester, results }) => {
  if (!open) return null;
  // latest per course within the selected semester
  const courseMap = new Map();
  (results || [])
    .filter(r => String(r.semester) === String(semester))
    .forEach(r => {
      const prev = courseMap.get(r.courseCode);
      if (!prev || (r.version || 0) > (prev.version || 0)) courseMap.set(r.courseCode, r);
    });
  const list = Array.from(courseMap.values())
    .sort((a,b)=> (a.courseCode||'').localeCompare(b.courseCode||''))
    .slice(0, 8);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Semester {semester} • Results (max 8 subjects)</h3>
          <button className="p-2 rounded hover:bg-gray-100" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <table className="min-w-full text-sm">
            <thead className="text-gray-600">
              <tr>
                <th className="text-left px-2 py-1">Course</th>
                <th className="text-left px-2 py-1">Internal</th>
                <th className="text-left px-2 py-1">External</th>
                <th className="text-left px-2 py-1">Practical</th>
                <th className="text-left px-2 py-1">Total</th>
                <th className="text-left px-2 py-1">Grade</th>
                <th className="text-left px-2 py-1">Status</th>
                <th className="text-left px-2 py-1">Version</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-2 py-6 text-center text-gray-500">No results yet</td>
                </tr>
              ) : (
                list.map(v => (
                  <tr key={v.courseCode} className="border-t">
                    <td className="px-2 py-1">{v.courseName || v.courseCode}</td>
                    <td className="px-2 py-1">{v.internal}</td>
                    <td className="px-2 py-1">{v.external}</td>
                    <td className="px-2 py-1">{v.practical}</td>
                    <td className="px-2 py-1">{v.total}</td>
                    <td className="px-2 py-1">{v.grade}</td>
                    <td className="px-2 py-1">{v.resultStatus}</td>
                    <td className="px-2 py-1">{v.version}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t flex justify-end">
          <button className="px-3 py-2 border rounded-lg hover:bg-gray-50" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const GroupedResults = ({ results }) => {
  // group by courseCode
  const groups = useMemo(() => {
    const map = new Map();
    (results || []).forEach(r => {
      const key = r.courseCode;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    });
    // sort each group by version asc
    Array.from(map.values()).forEach(arr => arr.sort((a,b) => (a.version||0)-(b.version||0)));
    return map;
  }, [results]);

  if (!results || results.length === 0) {
    return <div className="text-gray-500">No result history.</div>;
  }

  return (
    <div className="space-y-4">
      {Array.from(groups.entries()).map(([courseCode, items]) => {
        const latest = items[items.length - 1];
        return (
          <div key={courseCode} className="border rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
              <div>
                <div className="font-semibold">{latest.courseName || courseCode} ({courseCode})</div>
                <div className="text-xs text-gray-600">Semester {latest.semester}</div>
              </div>
              <div className="text-sm">
                <span className={`px-2 py-1 rounded-full border ${latest.resultStatus === 'pass' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{latest.resultStatus}</span>
              </div>
            </div>
            <div className="p-4">
              <table className="min-w-full text-sm">
                <thead className="text-gray-600">
                  <tr>
                    <th className="text-left px-2 py-1">Version</th>
                    <th className="text-left px-2 py-1">Internal</th>
                    <th className="text-left px-2 py-1">External</th>
                    <th className="text-left px-2 py-1">Practical</th>
                    <th className="text-left px-2 py-1">Total</th>
                    <th className="text-left px-2 py-1">Grade</th>
                    <th className="text-left px-2 py-1">Updated</th>
                    <th className="text-left px-2 py-1">By</th>
                    <th className="text-left px-2 py-1">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(v => (
                    <tr key={v.id} className="border-t">
                      <td className="px-2 py-1">{v.version}</td>
                      <td className="px-2 py-1">{v.internal}</td>
                      <td className="px-2 py-1">{v.external}</td>
                      <td className="px-2 py-1">{v.practical}</td>
                      <td className="px-2 py-1">{v.total}</td>
                      <td className="px-2 py-1">{v.grade}</td>
                      <td className="px-2 py-1">{v.updatedAt}</td>
                      <td className="px-2 py-1">{v.updatedBy}</td>
                      <td className="px-2 py-1">{v.overrideReason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const MalpracticeList = ({ items }) => {
  if (!items || items.length === 0) return <div className="text-gray-500">No malpractice records.</div>;
  return (
    <div className="space-y-2">
      {items.map(m => (
        <div key={m.id} className="border rounded-lg p-3 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <div className="flex-1">
            <div className="font-medium">{m.courseCode} • {m.assessment}</div>
            <div className="text-sm text-gray-600">{m.date} • {m.description}</div>
          </div>
          <div>
            <span className="text-xs px-2 py-1 rounded-full border bg-gray-50 text-gray-700">{m.status}{m.action ? ` • ${m.action}` : ''}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const CoEOverrideForm = ({ studentId, courses, onSubmit, disabled }) => {
  const [courseCode, setCourseCode] = useState(courses[0]?.courseCode || '');
  const [internal, setInternal] = useState('');
  const [external, setExternal] = useState('');
  const [practical, setPractical] = useState('');
  const [reason, setReason] = useState('');

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit({ studentId, courseCode, updates: { internal: Number(internal||0), external: Number(external||0), practical: Number(practical||0) }, reason }); }}
      className="bg-white border rounded-lg p-4 space-y-3"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <select value={courseCode} onChange={e => setCourseCode(e.target.value)} className="border rounded-lg px-3 py-2">
          {courses.map(c => (
            <option key={c.courseCode} value={c.courseCode}>{c.courseName || c.courseCode}</option>
          ))}
        </select>
        <input type="number" placeholder="Internal" value={internal} onChange={e => setInternal(e.target.value)} className="border rounded-lg px-3 py-2" />
        <input type="number" placeholder="External" value={external} onChange={e => setExternal(e.target.value)} className="border rounded-lg px-3 py-2" />
        <input type="number" placeholder="Practical" value={practical} onChange={e => setPractical(e.target.value)} className="border rounded-lg px-3 py-2" />
        <input type="text" placeholder="Reason (required)" value={reason} onChange={e => setReason(e.target.value)} className="border rounded-lg px-3 py-2" required />
      </div>
      <button disabled={disabled} className={`inline-flex items-center px-3 py-2 rounded-lg text-white ${disabled ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
        <Save className="w-4 h-4 mr-2" /> Save Override
      </button>
    </form>
  );
};

const StudentProfile = () => {
  const { id } = useParams();
  const { sidebarVisible, user } = useContext(AuthContext);
  const { getStudentById, getResultsByStudent, getMalpracticesByStudent, addCoEOverrideResult } = useData();
  const [viewSem, setViewSem] = useState(null);

  const student = getStudentById(id);
  const results = getResultsByStudent(id);
  const malpractices = getMalpracticesByStudent(id);

  const coursesForOverride = useMemo(() => {
    // derive unique courses from existing results
    const map = new Map();
    results.forEach(r => { if (!map.has(r.courseCode)) map.set(r.courseCode, { courseCode: r.courseCode, courseName: r.courseName }); });
    return Array.from(map.values());
  }, [results]);

  const isCoE = user?.role === 'coe' || user?.role === 'assistant_coe';

  if (!student) {
    return (
      <div className="flex h-screen bg-gray-50">
        {sidebarVisible && <Sidebar />}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              <Link to="/coe/academics" className="inline-flex items-center text-blue-600 hover:underline"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Link>
              <div className="mt-6">Student not found.</div>
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
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <StudentAvatar student={student} />
                <div>
                  <Link to="/coe/academics" className="inline-flex items-center text-blue-600 hover:underline"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Link>
                  <h1 className="text-3xl font-bold text-gray-900 mt-2">{student.name}</h1>
                  <p className="text-gray-600">{student.rollNumber} • {student.department} • Batch {student.batch} • Sem {student.semester}</p>
                </div>
              </div>
              <div>
                {isCoE && (
                  <span className="inline-flex items-center text-sm px-3 py-1 rounded-full border bg-blue-50 text-blue-700"><Edit3 className="w-4 h-4 mr-2" /> CoE Override Enabled</span>
                )}
              </div>
            </div>

            <section>
              <h2 className="text-xl font-semibold mb-3">Semesters Overview</h2>
              <SemestersOverview results={results} onView={(sem) => setViewSem(sem)} />
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Malpractice</h2>
              <MalpracticeList items={malpractices} />
            </section>

            {isCoE && coursesForOverride.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-3">CoE Override</h2>
                <CoEOverrideForm
                  studentId={student.id}
                  courses={coursesForOverride}
                  disabled={!isCoE}
                  onSubmit={({ studentId, courseCode, updates, reason }) => {
                    addCoEOverrideResult({ studentId, courseCode, updates, reason, updatedBy: user?.role || 'coe' });
                    alert('Override saved. New version added.');
                  }}
                />
              </section>
            )}
          </div>
          <SemesterModal open={!!viewSem} semester={viewSem} results={results} onClose={() => setViewSem(null)} />
        </main>
      </div>
    </div>
  );
};

export default StudentProfile;
