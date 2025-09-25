import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext } from '../../App';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import {
  Calendar,
  Plus,
  Filter,
  Search,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  ArrowUpDown,
} from 'lucide-react';

const LS_KEY = 'exam_scheduling_v1_aligned';

const sampleExams = [
  { id: '1', title: 'Computer Networks', subject: 'CS301', date: '2025-03-18', time: '10:00', duration: '03:00', type: 'final', venue: 'Hall A', department: 'Computer Science', semester: 6, status: 'scheduled', students: 67 },
  { id: '2', title: 'Database Systems', subject: 'CS302', date: '2025-03-20', time: '14:00', duration: '02:00', type: 'midterm', venue: 'Hall B', department: 'Computer Science', semester: 4, status: 'scheduled', students: 89 },
  { id: '3', title: 'Software Engineering', subject: 'CS401', date: '2025-03-22', time: '09:00', duration: '03:00', type: 'final', venue: 'Hall C', department: 'Computer Science', semester: 8, status: 'scheduled', students: 124 },
];

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const getStatusColor = (status) => {
  switch (status) {
    case 'scheduled': return 'bg-blue-100 text-blue-800';
    case 'ongoing': return 'bg-green-100 text-green-800';
    case 'completed': return 'bg-gray-100 text-gray-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTypeColor = (type) => {
  switch (type) {
    case 'midterm': return 'bg-yellow-100 text-yellow-800';
    case 'final': return 'bg-purple-100 text-purple-800';
    case 'retest': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const fmtDate = (iso) => {
  try {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString();
  } catch { return iso; }
};

const ExamScheduling = () => {
  const { user, sidebarVisible } = useContext(AuthContext);
  const canEdit = ['coe', 'assistant_coe', 'dept_coordinator'].includes(user?.role);

  const [exams, setExams] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return sampleExams;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterDept, setFilterDept] = useState('all');
  const [sortBy, setSortBy] = useState('date-asc');
  const [view, setView] = useState('list');
  const [currentMonth, setCurrentMonth] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); });

  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editExam, setEditExam] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [detailsExam, setDetailsExam] = useState(null);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(exams)); } catch {}
  }, [exams]);

  const departments = useMemo(() => Array.from(new Set(exams.map((e) => e.department))), [exams]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const pipeline = exams
    .filter((e) => {
      if (!normalizedQuery) return true;
      return e.title.toLowerCase().includes(normalizedQuery) || e.subject.toLowerCase().includes(normalizedQuery) || e.department.toLowerCase().includes(normalizedQuery);
    })
    .filter((e) => (filterStatus === 'all' ? true : e.status === filterStatus))
    .filter((e) => (filterType === 'all' ? true : e.type === filterType))
    .filter((e) => (filterDept === 'all' ? true : e.department === filterDept));

  const sorted = pipeline.sort((a, b) => {
    if (sortBy === 'date-asc') return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
    if (sortBy === 'date-desc') return b.date.localeCompare(a.date) || b.time.localeCompare(a.time);
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAddModal = () => { setEditExam(null); setIsAddEditOpen(true); };
  const openEditModal = (exam) => { setEditExam(exam); setIsAddEditOpen(true); };
  const saveExam = (data) => {
    if (!data.title || !data.subject || !data.date || !data.time) { alert('Please fill Title, Subject, Date and Time.'); return; }
    if (data.id) { setExams((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } : p))); }
    else { setExams((prev) => [{ ...data, id: uid() }, ...prev]); }
    setIsAddEditOpen(false);
  };
  const confirmDelete = (exam) => { setToDelete(exam); setIsDeleteOpen(true); };
  const doDelete = () => { if (!toDelete) return; setExams((prev) => prev.filter((e) => e.id !== toDelete.id)); setIsDeleteOpen(false); setToDelete(null); };

  const examsInMonth = (monthStart) => {
    const yr = monthStart.getFullYear(); const mon = monthStart.getMonth();
    return exams.filter((e) => { const d = new Date(e.date + 'T00:00:00'); return d.getFullYear() === yr && d.getMonth() === mon; });
  };

  const examsOnDate = (isoDate) => exams.filter((e) => e.date === isoDate);
  const prevMonth = () => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setIsAddEditOpen(false); setIsDeleteOpen(false); setDetailsExam(null); } };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);

  const EmptyState = () => (
    <div className="p-8 text-center text-gray-500">
      <p className="mb-2">No exams found.</p>
      {canEdit && <button onClick={() => openAddModal()} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"><Plus className="w-4 h-4" />Schedule an exam</button>}
    </div>
  );

  const AddEditModal = ({ exam, onClose, onSave }) => {
    const [form, setForm] = useState(exam || { title: '', subject: '', date: '', time: '', duration: '02:00', type: 'midterm', venue: '', department: '', semester: 1, status: 'scheduled', students: 0 });
    const initialRef = useRef(null);
    useEffect(() => { initialRef.current?.focus(); }, []);
    const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden />
        <div className="relative z-60 w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">{exam ? 'Edit Exam' : 'Schedule New Exam'}</h3>
            <button onClick={onClose} className="p-2 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input ref={initialRef} value={form.title} onChange={(e) => update('title', e.target.value)} className="mt-1 block w-full rounded-lg border px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <input value={form.subject} onChange={(e) => update('subject', e.target.value)} className="mt-1 block w-full rounded-lg border px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className="mt-1 block w-full rounded-lg border px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Time</label>
              <input type="time" value={form.time} onChange={(e) => update('time', e.target.value)} className="mt-1 block w-full rounded-lg border px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Duration (HH:MM)</label>
              <input value={form.duration} onChange={(e) => update('duration', e.target.value)} className="mt-1 block w-full rounded-lg border px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select value={form.type} onChange={(e) => update('type', e.target.value)} className="mt-1 block w-full rounded-lg border px-3 py-2">
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
                <option value="retest">Retest</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Venue</label>
              <input value={form.venue} onChange={(e) => update('venue', e.target.value)} className="mt-1 block w-full rounded-lg border px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <input value={form.department} onChange={(e) => update('department', e.target.value)} className="mt-1 block w-full rounded-lg border px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Semester</label>
              <input type="number" min="1" max="10" value={form.semester} onChange={(e) => update('semester', Number(e.target.value))} className="mt-1 block w-full rounded-lg border px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Students</label>
              <input type="number" min="0" value={form.students} onChange={(e) => update('students', Number(e.target.value))} className="mt-1 block w-full rounded-lg border px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select value={form.status} onChange={(e) => update('status', e.target.value)} className="mt-1 block w-full rounded-lg border px-3 py-2">
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="p-4 border-t flex items-center justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Cancel</button>
            <button onClick={() => onSave(form)} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              {exam ? 'Save Changes' : 'Schedule Exam'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DetailsModal = ({ exam, onClose }) => {
    if (!exam) return null;
    const styles = { status: getStatusColor(exam.status), type: getTypeColor(exam.type) };
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden />
        <div className="relative z-60 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">{exam.title}</h3>
            <button onClick={onClose} className="p-2 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium">{fmtDate(exam.date)} • {exam.time}</div>
                <div className="text-sm text-gray-500">{exam.duration} • Semester {exam.semester}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div className="text-sm">{exam.venue} • {exam.department}</div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-gray-400" />
              <div className="text-sm">{exam.students} students</div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles.status}`}>{exam.status}</span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${styles.type}`}>{exam.type}</span>
            </div>

            <div className="text-sm text-gray-700"><strong>Subject:</strong> {exam.subject}</div>
          </div>

          <div className="p-4 border-t flex items-center justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Close</button>
          </div>
        </div>
      </div>
    );
  };

  const ConfirmDelete = ({ exam, onCancel, onConfirm }) => {
    if (!exam) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/40" onClick={onCancel} aria-hidden />
        <div className="relative z-60 w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4">
            <h4 className="text-lg font-semibold">Delete exam</h4>
            <p className="text-sm text-gray-600 mt-2">Are you sure you want to delete <strong>{exam.title}</strong>? This action cannot be undone.</p>
          </div>

          <div className="p-4 border-t flex items-center justify-end gap-2">
            <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Cancel</button>
            <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
          </div>
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startWeekday = start.getDay();
    const daysInMonth = end.getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push(iso);
    }
    while (cells.length % 7 !== 0) cells.push(null);
    const monthExams = examsInMonth(currentMonth);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={prevMonth} className="p-2 rounded hover:bg-gray-100"><ChevronLeft className="w-5 h-5" /></button>
            <div className="text-lg font-semibold">{currentMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
            <button onClick={nextMonth} className="p-2 rounded hover:bg-gray-100"><ChevronRight className="w-5 h-5" /></button>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">{monthExams.length} exams this month</div>
            {canEdit && <button onClick={() => openAddModal()} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white"><Plus className="w-4 h-4" />New</button>}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (<div key={d} className="text-xs text-gray-500 text-center">{d}</div>))}

          {cells.map((iso, idx) => {
            const dayExams = iso ? examsOnDate(iso) : [];
            const isToday = iso === new Date().toISOString().slice(0, 10);
            return (
              <div key={idx} className={`min-h-[90px] p-2 rounded border ${iso ? 'bg-white' : 'bg-gray-50'} ${isToday ? 'ring-2 ring-indigo-100' : ''} flex flex-col`}>
                {iso ? (
                  <>
                    <div className="text-sm font-medium mb-1">{Number(iso.slice(-2))}</div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                      {dayExams.slice(0, 3).map((e) => (
                        <button key={e.id} onClick={() => setDetailsExam(e)} className="block text-xs text-left truncate w-full" title={e.title}>• {e.title}</button>
                      ))}
                      {dayExams.length > 3 && <div className="text-xs text-gray-400">+{dayExams.length - 3} more</div>}
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Exam Scheduling</h1>
                <p className="text-gray-600 mt-1">Manage exam timetables and schedules</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="search" placeholder="Search by title, subject or department..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} className="pl-10 pr-3 py-2 border rounded-lg w-80" />
                </div>

                <div className="flex items-center gap-2">
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
                    <option value="all">All status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
                    <option value="all">All types</option>
                    <option value="midterm">Midterm</option>
                    <option value="final">Final</option>
                    <option value="retest">Retest</option>
                  </select>

                  <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
                    <option value="all">All departments</option>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>

                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-lg border px-3 py-2 text-sm">
                    <option value="date-asc">Date ↑</option>
                    <option value="date-desc">Date ↓</option>
                    <option value="title">Title</option>
                  </select>

                  <button onClick={() => setView((v) => (v === 'list' ? 'calendar' : 'list'))} className="px-3 py-2 rounded-lg border text-sm">
                    {view === 'list' ? 'Calendar view' : 'List view'}
                  </button>

                  {canEdit && <button onClick={() => openAddModal()} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white"><Plus className="w-4 h-4" />Schedule</button>}
                </div>
              </div>
            </div>

            {view === 'calendar' ? renderCalendar() : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Exam Calendar</h2>
                  <div className="text-sm text-gray-600">{sorted.length} result{sorted.length !== 1 ? 's' : ''}</div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Schedule</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Venue & Students</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Status</th>
                        {canEdit && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Actions</th>}
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {sorted.length === 0 ? (
                        <tr><td colSpan={canEdit ? 5 : 4}><EmptyState /></td></tr>
                      ) : (
                        paginated.map((exam) => (
                          <tr key={exam.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 align-middle">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                                <div className="text-sm text-gray-500">{exam.subject} • Semester {exam.semester}</div>
                                <div className="text-sm text-gray-500">{exam.department}</div>
                              </div>
                            </td>

                            <td className="px-6 py-4 align-middle">
                              <div className="flex items-center text-sm text-gray-900">
                                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                {fmtDate(exam.date)}
                              </div>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                {exam.time} ({exam.duration})
                              </div>
                            </td>

                            <td className="px-6 py-4 align-middle">
                              <div className="flex items-center text-sm text-gray-900">
                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                {exam.venue}
                              </div>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Users className="w-4 h-4 mr-2 text-gray-400" />
                                {exam.students} students
                              </div>
                            </td>

                            <td className="px-6 py-4 align-middle">
                              <div className="space-y-1">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(exam.status)}`}>{exam.status}</span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(exam.type)}`}>{exam.type}</span>
                              </div>
                            </td>

                            {canEdit && (
                              <td className="px-6 py-4 align-middle text-sm font-medium">
                                <div className="flex items-center space-x-3">
                                  <button title="View details" onClick={() => setDetailsExam(exam)} className="text-indigo-600 hover:text-indigo-800"><Eye className="w-4 h-4" /></button>
                                  <button title="Edit exam" onClick={() => openEditModal(exam)} className="text-blue-600 hover:text-blue-900"><Edit className="w-4 h-4" /></button>
                                  <button title="Delete exam" onClick={() => confirmDelete(exam)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {sorted.length > PAGE_SIZE && (
                  <div className="p-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">Page {page} / {totalPages}</div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-2 rounded-lg border"><ChevronLeft className="w-4 h-4" /></button>
                      <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="p-2 rounded-lg border"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {isAddEditOpen && canEdit && <AddEditModal exam={editExam} onClose={() => setIsAddEditOpen(false)} onSave={(d) => saveExam(d)} />}
      {isDeleteOpen && <ConfirmDelete exam={toDelete} onCancel={() => setIsDeleteOpen(false)} onConfirm={doDelete} />}
      {detailsExam && <DetailsModal exam={detailsExam} onClose={() => setDetailsExam(null)} />}
    </div>
  );
};

export default ExamScheduling;
