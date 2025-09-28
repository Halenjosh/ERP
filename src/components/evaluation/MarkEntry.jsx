import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../App";
import Sidebar from "../layout/Sidebar";
import Header from "../layout/Header";
import { useToaster } from "../../contexts/ToastContext.jsx";
import { useData } from "../../contexts/DataContext.jsx";
import {
  Save,
  Upload,
  Download,
  Search,
  Trash,
  Plus,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
// CSV parsing: we dynamically load PapaParse from CDN when needed to avoid bundler errors

// Single-file, self-contained MarkEntry component with: 
// - Program/Dept/Year/Section filters
// - Inline edit, bulk edit, add/delete rows
// - CSV import/export
// - Role-based controls (admin publish)
// - Confirmation modal for publish
// - Pagination + optional server-side hooks (stubs + optimistic updates)
// - Improved UI/UX and accessible controls

const PER_PAGE = 12; // default page size

// Dynamically load PapaParse from CDN if not already available
const loadPapa = () => new Promise((resolve, reject) => {
  if (typeof window !== 'undefined' && window.Papa) return resolve(window.Papa);
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js';
  script.async = true;
  script.onload = () => resolve(window.Papa);
  script.onerror = () => reject(new Error('Failed to load PapaParse'));
  document.body.appendChild(script);
});

// Lightweight CSV unparse as a fallback (quotes fields and joins)
const unparseCSV = (rows) => {
  if (!Array.isArray(rows) || rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (val) => {
    const s = val == null ? '' : String(val);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const lines = [];
  lines.push(headers.map(escape).join(','));
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
};

const fakeServerDelay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

// Mock API helpers (replace with real endpoints)
const api = {
  async saveMarks(bulkUpdates) {
    // optimistic update simulated server save
    await fakeServerDelay(600);
    // simulate possible failure 3%
    if (Math.random() < 0.03) throw new Error("Server error saving marks");
    return { ok: true };
  },
  async publishClass(payload) {
    await fakeServerDelay(800);
    return { ok: true, publishedAt: new Date().toISOString() };
  },
};

const sampleStudents = Array.from({ length: 34 }).map((_, i) => ({
  id: String(i + 1),
  studentId: `CS20${1000 + i}`,
  studentName: `Student ${i + 1}`,
  marksObtained: Math.random() > 0.6 ? Math.floor(Math.random() * 101) : 0,
  totalMarks: 100,
  status: Math.random() > 0.7 ? "verified" : Math.random() > 0.5 ? "submitted" : "pending",
  grade: "",
}));

const computeGrade = (marks, total) => {
  if (marks === null || marks === undefined) return "";
  const p = (marks / total) * 100;
  if (marks === 0) return "";
  if (p >= 90) return "A+";
  if (p >= 80) return "A";
  if (p >= 70) return "B+";
  if (p >= 60) return "B";
  if (p >= 50) return "C";
  if (p >= 40) return "D";
  return "F";
};

const getStatusColor = (s) => {
  switch (s) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "submitted":
      return "bg-blue-100 text-blue-800";
    case "verified":
      return "bg-green-100 text-green-800";
    case "published":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function MarkEntry() {
  const { user = { name: "Guest", role: "teacher" }, sidebarVisible } = useContext(AuthContext) || {};
  const toaster = useToaster();
  const { departments, selectedDepartment: globalDepartment } = useData();

  // filters
  const [program, setProgram] = useState("BTech");
  const [department, setDepartment] = useState(globalDepartment || "CSE");
  const [year, setYear] = useState("III");
  const [section, setSection] = useState("A1");
  const [selectedExam, setSelectedExam] = useState("net-final-2025");

  // keep department in sync with global selection
  useEffect(() => {
    if (globalDepartment) setDepartment(globalDepartment);
  }, [globalDepartment]);

  // data
  const [students, setStudents] = useState(() => sampleStudents.map((s) => ({ ...s, grade: computeGrade(s.marksObtained, s.totalMarks) })));
  const [search, setSearch] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(PER_PAGE);

  // UI state
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [bulkEditValue, setBulkEditValue] = useState("");
  const [loadingSave, setLoadingSave] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [importBusy, setImportBusy] = useState(false);
  const [message, setMessage] = useState(null);

  // Derived
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (!q) return true;
      return s.studentName.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q) || String(s.id) === q;
    });
  }, [students, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [pageCount, page]);

  const pageItems = useMemo(() => filtered.slice((page - 1) * perPage, page * perPage), [filtered, page, perPage]);

  const toggleRow = (id) => {
    setSelectedRows((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  };

  const handleInlineChange = (id, value) => {
    setStudents((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const raw = value === "" ? 0 : Number(value);
        const clamped = Math.max(0, Math.min(raw, r.totalMarks));
        return {
          ...r,
          marksObtained: clamped,
          grade: computeGrade(clamped, r.totalMarks),
          status: clamped === 0 ? "pending" : "submitted",
        };
      })
    );
  };

  const handleSaveSelected = async () => {
    if (selectedRows.size === 0) { setMessage({ type: "info", text: "No rows selected." }); toaster.info("No rows selected."); return; }
    setLoadingSave(true);
    const updates = students.filter((s) => selectedRows.has(s.id)).map((s) => ({ id: s.id, marksObtained: s.marksObtained, grade: s.grade, status: s.status }));
    // Optimistic UI already applied; now call API
    try {
      await api.saveMarks(updates);
      setMessage({ type: "success", text: `Saved ${updates.length} row(s).` });
      toaster.success(`Saved ${updates.length} row(s).`);
      setSelectedRows(new Set());
    } catch (err) {
      setMessage({ type: "error", text: `Save failed: ${err.message}` });
      toaster.error(`Save failed: ${err.message}`);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleBulkEditApply = () => {
    if (bulkEditValue === "") { setMessage({ type: "info", text: "Enter a value to apply." }); toaster.info("Enter a value to apply."); return; }
    setStudents((prev) => prev.map((r) => (selectedRows.has(r.id) ? { ...r, marksObtained: Number(bulkEditValue), grade: computeGrade(Number(bulkEditValue), r.totalMarks), status: "submitted" } : r)));
    setMessage({ type: "success", text: `Applied ${bulkEditValue} to ${selectedRows.size} row(s).` });
    toaster.success(`Applied ${bulkEditValue} to ${selectedRows.size} row(s).`);
    setBulkEditValue("");
  };

  const handleAddRow = () => {
    const newId = String(Date.now());
    setStudents((prev) => [{ id: newId, studentId: `NEW${newId.slice(-4)}`, studentName: "New Student", marksObtained: 0, totalMarks: 100, status: "pending", grade: "" }, ...prev]);
    setMessage({ type: "success", text: "New row added (unsaved)." });
    toaster.success("New row added (unsaved).");
  };

  const handleDeleteRow = (id) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setSelectedRows((prev) => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });
    setMessage({ type: "success", text: "Row removed." });
    toaster.success("Row removed.");
  };

  const exportCSV = () => {
    const rows = students.map((s) => ({ StudentID: s.studentId, Name: s.studentName, Marks: s.marksObtained, Total: s.totalMarks, Status: s.status, Grade: s.grade }));
    const csv = (typeof window !== 'undefined' && window.Papa && window.Papa.unparse)
      ? window.Papa.unparse(rows)
      : unparseCSV(rows);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${program}_${department}_${year}_${section}_marks.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMessage({ type: "success", text: "CSV exported." });
    toaster.success("CSV exported.");
  };

  const importCSV = async (file) => {
    if (!file) return;
    setImportBusy(true);
    try {
      const Papa = await loadPapa();
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => {
          const parsed = res.data.map((row, idx) => ({
            id: String(Date.now() + idx),
            studentId: row.StudentID || row.studentId || `IMP${idx}`,
            studentName: row.Name || row.studentName || `Imported ${idx + 1}`,
            marksObtained: Number(row.Marks || row.marks || 0),
            totalMarks: Number(row.Total || 100),
            status: row.Status || "submitted",
            grade: computeGrade(Number(row.Marks || row.marks || 0), Number(row.Total || 100)),
          }));
          setStudents((prev) => [...parsed, ...prev]);
          setMessage({ type: "success", text: `Imported ${parsed.length} rows.` });
          toaster.success(`Imported ${parsed.length} rows.`);
          setImportBusy(false);
        },
        error: (err) => {
          setImportBusy(false);
          setMessage({ type: "error", text: `Import failed: ${err.message}` });
          toaster.error(`Import failed: ${err.message}`);
        },
      });
    } catch (err) {
      setImportBusy(false);
      setMessage({ type: "error", text: `Could not load CSV parser: ${err.message}` });
      toaster.error(`Could not load CSV parser: ${err.message}`);
    }
  };

  const handlePublish = async () => {
    setShowPublishModal(false);
    setLoadingSave(true);
    try {
      const payload = { program, department, year, section, exam: selectedExam, timestamp: new Date().toISOString() };
      const res = await api.publishClass(payload);
      if (res.ok) {
        // mark all students as published
        setStudents((prev) => prev.map((s) => ({ ...s, status: "published" })));
        setMessage({ type: "success", text: `Published successfully at ${res.publishedAt}` });
        toaster.success("Published successfully.");
      }
    } catch (err) {
      setMessage({ type: "error", text: `Publish failed: ${err.message}` });
      toaster.error(`Publish failed: ${err.message}`);
    } finally {
      setLoadingSave(false);
    }
  };

  // small helper UI pieces
  const Stat = ({ label, value }) => (
    <div className="bg-white p-4 rounded shadow-sm border">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
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
                <h1 className="text-2xl font-bold text-gray-900">DSU Mark Entry & Evaluation</h1>
                <p className="text-sm text-gray-600">Class-wise mark entry — simple, fast & accessible</p>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={exportCSV} className="flex items-center gap-2 btn-dsu-primary px-3 py-2 rounded shadow-sm">
                  <Download className="w-4 h-4" /> Export CSV
                </button>
                <label className="flex items-center gap-2 bg-white border px-3 py-2 rounded shadow-sm cursor-pointer hover:bg-gray-50">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept=".csv" className="hidden" onChange={(e) => importCSV(e.target.files?.[0])} />
                  <span>{importBusy ? "Importing..." : "Import CSV"}</span>
                </label>
                {user?.role === "admin" && (
                  <button onClick={() => setShowPublishModal(true)} className="bg-purple-600 text-white px-3 py-2 rounded shadow-sm hover:bg-purple-700">Publish</button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <select value={program} onChange={(e) => setProgram(e.target.value)} className="border rounded p-2">
                <option>BTech</option>
                <option>MTech</option>
                <option>BSc</option>
              </select>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} className="border rounded p-2">
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <select value={year} onChange={(e) => setYear(e.target.value)} className="border rounded p-2">
                <option>I</option>
                <option>II</option>
                <option>III</option>
                <option>IV</option>
              </select>
              <select value={section} onChange={(e) => setSection(e.target.value)} className="border rounded p-2">
                <option>A1</option>
                <option>A2</option>
                <option>B1</option>
              </select>
              <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)} className="border rounded p-2 col-span-2 md:col-span-2">
                <option value="net-final-2025">Computer Networks - Final 2025</option>
                <option value="db-mid-2025">Database - Mid 2025</option>
              </select>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students or ID" className="pl-10 pr-3 py-2 border rounded w-full md:w-80" />
                </div>

                <button onClick={handleAddRow} className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded">
                  <Plus className="w-4 h-4" /> Add Row
                </button>
                <button onClick={() => { setSelectedRows(new Set(students.map((s) => s.id))); setMessage({ type: 'info', text: 'All rows selected' }); }} className="px-3 py-2 border rounded">Select All</button>
                <button onClick={() => { setSelectedRows(new Set()); setMessage({ type: 'info', text: 'Selection cleared' }); }} className="px-3 py-2 border rounded">Clear</button>
              </div>

              <div className="flex items-center gap-2">
                <input placeholder="Bulk marks" value={bulkEditValue} onChange={(e) => setBulkEditValue(e.target.value)} className="border rounded px-2 py-2 w-28" />
                <button disabled={selectedRows.size === 0} onClick={handleBulkEditApply} className={`px-3 py-2 rounded ${selectedRows.size === 0 ? 'bg-gray-200' : 'bg-indigo-600 text-white'}`}>Apply</button>
                <button disabled={selectedRows.size === 0} onClick={handleSaveSelected} className={`px-3 py-2 rounded ${loadingSave ? 'bg-gray-300' : 'btn-dsu-primary'}`}>
                  {loadingSave ? 'Saving...' : 'Save Selected'}
                </button>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-3 rounded ${message.type === 'success' ? 'bg-green-50 border-green-200' : message.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                <div className="text-sm text-gray-800">{message.text}</div>
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded shadow overflow-hidden">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left w-8"><input type="checkbox" checked={selectedRows.size > 0 && selectedRows.size === students.length} onChange={(e) => { if (e.target.checked) setSelectedRows(new Set(students.map(s => s.id))); else setSelectedRows(new Set()); }} /></th>
                    <th className="p-3 text-left">Student</th>
                    <th className="p-3 text-left w-28">Marks</th>
                    <th className="p-3 text-left w-20">Total</th>
                    <th className="p-3 text-left w-20">%</th>
                    <th className="p-3 text-left w-24">Grade</th>
                    <th className="p-3 text-left w-28">Status</th>
                    <th className="p-3 text-right w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((s) => (
                    <tr key={s.id} className="border-t hover:bg-gray-50">
                      <td className="p-3"><input type="checkbox" checked={selectedRows.has(s.id)} onChange={() => toggleRow(s.id)} /></td>
                      <td className="p-3">
                        <div className="font-medium">{s.studentName}</div>
                        <div className="text-xs text-gray-500">{s.studentId}</div>
                      </td>
                      <td className="p-3">
                        <input aria-label={`marks-${s.studentId}`} value={s.marksObtained} onChange={(e) => handleInlineChange(s.id, e.target.value)} type="number" min={0} max={s.totalMarks} className="w-full border rounded px-2 py-1" />
                      </td>
                      <td className="p-3">{s.totalMarks}</td>
                      <td className="p-3">{s.marksObtained > 0 ? ((s.marksObtained / s.totalMarks) * 100).toFixed(1) + '%' : '-'}</td>
                      <td className="p-3">{s.grade || '-'}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-2 px-2 py-1 rounded text-xs font-semibold ${getStatusColor(s.status)}`}>
                          {s.status === 'pending' ? <Clock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          <span className="capitalize">{s.status}</span>
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button title="Save row" onClick={() => { setSelectedRows(new Set([s.id])); handleSaveSelected(); }} className="p-2 rounded bg-green-50 hover:bg-green-100">
                            <Save className="w-4 h-4 text-green-700" />
                          </button>
                          <button title="Delete row" onClick={() => handleDeleteRow(s.id)} className="p-2 rounded bg-red-50 hover:bg-red-100">
                            <Trash className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between p-3 border-t bg-gray-50">
                <div className="flex items-center gap-3">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-2 rounded hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /></button>
                  <div className="text-sm">Page <strong>{page}</strong> of {pageCount}</div>
                  <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} className="p-2 rounded hover:bg-gray-100"><ChevronRight className="w-4 h-4" /></button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600">Rows per page</div>
                  <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="border rounded px-2 py-1">
                    <option value={10}>10</option>
                    <option value={12}>12</option>
                    <option value={25}>25</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Stat label="Total Students" value={students.length} />
              <Stat label="Pending" value={students.filter(s => s.status === 'pending').length} />
              <Stat label="Completed" value={students.filter(s => s.status !== 'pending').length} />
              <Stat label="Average (%)" value={students.filter(s => s.marksObtained > 0).length ? ((students.reduce((a,b) => a + b.marksObtained, 0) / students.filter(s => s.marksObtained > 0).length).toFixed(1)) : '0'} />
            </div>

            {/* Publish Modal */}
            {showPublishModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold">Confirm Publish</h3>
                  <p className="text-sm text-gray-600 mt-2">You are about to publish results for <strong>{program}-{department}-{year}-{section}</strong>. This action will mark the class as published and cannot be undone via this UI.</p>
                  <div className="mt-4 flex justify-end gap-2">
                    <button onClick={() => setShowPublishModal(false)} className="px-3 py-2 border rounded">Cancel</button>
                    <button onClick={handlePublish} className="px-3 py-2 bg-purple-600 text-white rounded">Publish</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}