import React, { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { AuthContext } from '../../App';
import { useData } from '../../contexts/DataContext.jsx';
import { Upload, Search, Filter, Download, Users } from 'lucide-react';

const parseCSV = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result || '';
        const lines = String(text).split(/\r?\n/).filter(Boolean);
        if (lines.length === 0) return resolve([]);
        const header = lines[0].split(',').map(h => h.trim());
        const rows = lines.slice(1).map(line => {
          const cols = line.split(',');
          const obj = {};
          header.forEach((h, i) => { obj[h] = (cols[i] || '').trim(); });
          return obj;
        });
        resolve(rows);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const Academics = () => {
  const { sidebarVisible } = useContext(AuthContext);
  const { students, setStudents, departments } = useData();

  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('');
  const [batchFrom, setBatchFrom] = useState('');
  const [batchTo, setBatchTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const batches = useMemo(() => {
    const unique = Array.from(new Set((students || []).map(s => s.batch))).filter(Boolean);
    return unique.sort();
  }, [students]);

  const applyBatchRange = (from, to) => {
    setBatchFrom(String(from || ''));
    setBatchTo(String(to || ''));
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const res = (students || []).filter(s => {
      if (dept && s.department !== dept) return false;
      if (batchFrom && String(s.batch) < String(batchFrom)) return false;
      if (batchTo && String(s.batch) > String(batchTo)) return false;
      if (!q) return true;
      const blob = `${s.name} ${s.rollNumber} ${s.id}`.toLowerCase();
      return blob.includes(q);
    });
    return res;
  }, [students, query, dept, batchFrom, batchTo]);

  // clamp current page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [query, dept, batchFrom, batchTo]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const onImportCSV = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseCSV(file);
      // Expected headers: id,rollNumber,name,batch,semester,department,academicYear,class
      const mapped = rows.map((r, idx) => ({
        id: r.id || `IMP-${Date.now()}-${idx}`,
        rollNumber: r.rollNumber || r.roll || '',
        name: r.name || r.fullName || '',
        batch: r.batch || r.admissionYear || '',
        semester: r.semester || r.sem || '',
        department: r.department || r.dept || '',
        academicYear: r.academicYear || '',
        class: r.class || r.section || '',
      }));
      // Merge by id or rollNumber
      setStudents(prev => {
        const byKey = new Map();
        (prev || []).forEach(s => byKey.set(s.id || s.rollNumber, s));
        mapped.forEach(m => {
          const key = m.id || m.rollNumber;
          byKey.set(key, { ...byKey.get(key), ...m });
        });
        return Array.from(byKey.values());
      });
      e.target.value = '';
      window.alert(`Imported ${mapped.length} student records`);
    } catch (err) {
      console.error(err);
      window.alert('Failed to import CSV. Ensure the file has a header row.');
    }
  };

  const onExportCSV = () => {
    const header = ['id','rollNumber','name','batch','semester','department','academicYear','class'];
    const lines = [header.join(',')].concat(
      filtered.map(s => header.map(h => (s[h] ?? '')).join(','))
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">CoE Academics</h1>
                <p className="text-gray-600">University-wide student data from inception to present</p>
              </div>
              <div className="flex gap-2">
                <label className="inline-flex items-center px-3 py-2 bg-white border rounded-lg cursor-pointer hover:bg-gray-50">
                  <Upload className="w-4 h-4 mr-2" />
                  <span>Import CSV</span>
                  <input type="file" accept=".csv" className="hidden" onChange={onImportCSV} />
                </label>
                <button onClick={onExportCSV} className="inline-flex items-center px-3 py-2 bg-white border rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4 mr-2" /> Export
                </button>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search name or roll no."
                    className="w-full pl-9 pr-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select value={dept} onChange={(e) => setDept(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                    <option value="">All Departments</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <input value={batchFrom} onChange={(e) => setBatchFrom(e.target.value)} placeholder="Batch from (e.g., 2016)" className="w-full border rounded-lg px-3 py-2" />
                <input value={batchTo} onChange={(e) => setBatchTo(e.target.value)} placeholder="Batch to (e.g., 2025)" className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600 mr-2">Quick ranges:</span>
                <button
                  type="button"
                  onClick={() => applyBatchRange('2021','2025')}
                  className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                  title="Show batches 2021 to 2025"
                >2021–2025</button>
                <button
                  type="button"
                  onClick={() => { setBatchFrom(''); setBatchTo(''); setDept(''); setQuery(''); setPage(1); }}
                  className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
                  title="Clear filters"
                >Clear</button>
              </div>
              <div className="mt-3 text-sm text-gray-600 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{total} students</span>
                  <span className="text-gray-400">|</span>
                  <span>
                    Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-gray-600">Rows:</label>
                  <select
                    className="border rounded-lg px-2 py-1"
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  >
                    {[10,25,50,100].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <button
                    className="px-3 py-1 border rounded-lg disabled:opacity-50"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >Prev</button>
                  <span className="text-gray-600">{page} / {totalPages}</span>
                  <button
                    className="px-3 py-1 border rounded-lg disabled:opacity-50"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >Next</button>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left px-4 py-2">Roll No</th>
                    <th className="text-left px-4 py-2">Name</th>
                    <th className="text-left px-4 py-2">Department</th>
                    <th className="text-left px-4 py-2">Batch</th>
                    <th className="text-left px-4 py-2">Semester</th>
                    <th className="text-left px-4 py-2">Class</th>
                    <th className="text-left px-4 py-2">Academic Year</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((s) => (
                    <tr key={s.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-blue-700 hover:underline"><Link to={`/coe/academics/${s.id}`} style={{ textDecoration: 'none' }}><span className="hover:underline">{s.rollNumber}</span></Link></td>
                      <td className="px-4 py-2 text-blue-700 hover:underline"><Link to={`/coe/academics/${s.id}`} style={{ textDecoration: 'none' }}><span className="hover:underline">{s.name}</span></Link></td>
                      <td className="px-4 py-2">{s.department}</td>
                      <td className="px-4 py-2">{s.batch}</td>
                      <td className="px-4 py-2">{s.semester}</td>
                      <td className="px-4 py-2">{s.class}</td>
                      <td className="px-4 py-2">{s.academicYear}</td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No students found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Academics;
