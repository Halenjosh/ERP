// QuestionBank.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../App';
import Sidebar from '../layout/Sidebar';
import Header from '../layout/Header';
import { useData } from '../../contexts/DataContext.jsx';
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileDown,
  LayoutDashboard,
  PlusSquare,
  MinusSquare
} from 'lucide-react';

/**
 * Full QuestionBank component
 * - Typed template slots for custom paper templates
 * - Strict template totals (50/100)
 * - Fill typed slots first, then pool-by-type, then placeholders
 * - Scrollable Add Paper modal & Preview modal with sticky header/footer
 *
 * Drop into a React + Vite project using Tailwind + lucide-react.
 */

/* ---------- question pool (starts empty) ---------- */
const sampleQuestions = [];

const subjects = ['all', 'OS', 'C', 'Python', 'Database Systems', 'Data Structures', 'Software Engineering'];
const difficulties = ['all', 'easy', 'medium', 'hard'];
// departments are sourced from DataContext
const QUESTION_TYPES = ['mcq', 'short', 'long', 'practical'];

const PAGE_SIZE = 5;

const formatDate = (iso) => {
  try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
};

/* ---------- Compose: use typed slots first, then pool by type, else placeholder ---------- */
const composePaperWithTypedSlots = ({ questions, rows, subjectFilter, department, year, type }) => {
  const pool = questions.filter(q => {
    const subjMatch = subjectFilter === 'all' || q.subject === subjectFilter;
    const deptMatch = !department || department === 'All Departments' || (q.dept === department);
    
    // Year-wise filtering: filter by academic year level if specified
    let yearMatch = true;
    if (type === 'year-wise' && year) {
      // For now, we'll use a simple approach - you can enhance this based on your question metadata
      // This assumes questions have a 'year' or 'academicYear' field, or we can use difficulty as a proxy
      // For example: easy questions = 1st year, medium = 2nd-3rd year, hard = 4th year
      if (q.academicYear) {
        yearMatch = q.academicYear === year;
      } else if (q.difficulty) {
        // Use difficulty as a proxy for academic year
        if (year === 1) yearMatch = q.difficulty === 'easy';
        else if (year === 2) yearMatch = q.difficulty === 'easy' || q.difficulty === 'medium';
        else if (year === 3) yearMatch = q.difficulty === 'medium';
        else if (year === 4) yearMatch = q.difficulty === 'hard' || q.difficulty === 'medium';
      } else {
        // If no year info, include all questions for year-wise papers
        yearMatch = true;
      }
    }
    
    return subjMatch && deptMatch && yearMatch;
  });

  const usedIds = new Set();
  const final = [];

  rows.forEach((row, rowIndex) => {
    const rowType = row.type;
    const perMark = Number(row.marks) || 0;
    const slots = row.slots || [];

    for (let s = 0; s < (Number(row.count) || 0); s++) {
      const slot = slots[s];
      if (slot && slot.questionText && slot.questionText.trim().length > 0) {
        final.push({
          id: `manual-${rowIndex}-${s}-${Date.now()}`,
          question: slot.questionText.trim(),
          type: rowType,
          subject: subjectFilter === 'all' ? (slot.subject || 'Any') : subjectFilter,
          dept: department,
          assignedMarks: perMark,
          isManual: true,
          createdBy: slot.createdBy || 'Manual entry'
        });
      } else {
        const candidate = pool.find(q => q.type === rowType && !usedIds.has(q.id));
        if (candidate) {
          usedIds.add(candidate.id);
          final.push({
            ...candidate,
            assignedMarks: perMark,
            templateRowLabel: `Row ${rowIndex + 1}`
          });
        } else {
          final.push({
            id: `placeholder-${rowType}-${rowIndex}-${s}`,
            question: `MISSING: Add ${rowType.toUpperCase()} question (${perMark} marks) for row ${rowIndex + 1}`,
            type: rowType,
            subject: subjectFilter === 'all' ? 'Any' : subjectFilter,
            dept: department,
            assignedMarks: perMark,
            isPlaceholder: true
          });
        }
      }
    }
  });

  const totalMarks = rows.reduce((s, r) => s + (Number(r.count) || 0) * (Number(r.marks) || 0), 0);
  return { questions: final, totalMarks };
};

/* ---------- small UI components ---------- */
const StatCard = ({ title, value, icon }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center">
      <div className="mr-3">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-3xl font-bold text-gray-700">{value}</p>
      </div>
    </div>
  </div>
);

const QuestionCard = ({ q, onPreview, onEdit, onDelete, user }) => (
  <div className="p-6 hover:bg-gray-50">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{q.type?.toUpperCase()}</span>
          <span className="text-sm text-gray-500">{q.marks || q.assignedMarks || ''} marks</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{q.question}</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>Subject: {q.subject}</span>
          <span>Dept: {q.dept || 'N/A'}</span>
          <span>Created by: {q.createdBy || '—'}</span>
          <span>Date: {formatDate(q.createdAt || '')}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 ml-4">
        <button title="Preview" className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg" onClick={() => onPreview(q)}><Eye className="w-4 h-4" /></button>
        <button title="Edit" className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg" onClick={() => onEdit(q)}><Edit className="w-4 h-4" /></button>
        {(user?.role === 'coe' || user?.role === 'assistant_coe') && <button title="Delete" className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => onDelete(q)}><Trash2 className="w-4 h-4" /></button>}
      </div>
    </div>
  </div>
);

/* ---------- Main component ---------- */
const QuestionBank = () => {
  const { user, sidebarVisible } = useContext(AuthContext);
  const { departments } = useData();

  // data & UI state
  const [questions, setQuestions] = useState(sampleQuestions);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  // papers and modal state
  const LS_PAPERS = 'question_papers_v1';
  const [papers, setPapers] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_PAPERS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });
  const [showAddPaper, setShowAddPaper] = useState(false);
  const [paperTotal, setPaperTotal] = useState(50); // 50 or 100
  const [paperTitle, setPaperTitle] = useState('');
  const [paperSubject, setPaperSubject] = useState('all');
  const [paperDepartment, setPaperDepartment] = useState('All Departments');
  const [paperYear, setPaperYear] = useState(1);
  const [paperType, setPaperType] = useState('regular'); // regular, year-wise, department-wise

  // template rows (each row has slots: array of { id, questionText })
  const [templateRows, setTemplateRows] = useState([
    { id: Date.now(), type: 'long', count: 2, marks: 10, slots: [{ id: 0, questionText: '' }, { id: 1, questionText: '' }] }
  ]);

  // preview modal
  const [showPaperPreview, setShowPaperPreview] = useState(false);
  const [previewPaper, setPreviewPaper] = useState(null);

  // persist papers
  useEffect(() => {
    try {
      localStorage.setItem(LS_PAPERS, JSON.stringify(papers));
    } catch {}
  }, [papers]);

  // search debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => setPage(1), [selectedSubject, selectedDifficulty, debouncedQuery, sortKey, sortDir]);

  const filtered = useMemo(() => {
    const q = debouncedQuery;
    const list = questions.filter((item) => {
      const subjectMatch = selectedSubject === 'all' || item.subject === selectedSubject;
      const difficultyMatch = selectedDifficulty === 'all' || item.difficulty === selectedDifficulty;
      const searchMatch =
        q.length === 0 ||
        item.question.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        (item.createdBy || '').toLowerCase().includes(q);
      return subjectMatch && difficultyMatch && searchMatch;
    });

    const sorted = [...list].sort((a, b) => {
      if (sortKey === 'marks') {
        return sortDir === 'asc' ? (a.marks || 0) - (b.marks || 0) : (b.marks || 0) - (a.marks || 0);
      } else {
        const da = new Date(a.createdAt || 0).getTime();
        const db = new Date(b.createdAt || 0).getTime();
        return sortDir === 'asc' ? da - db : db - da;
      }
    });

    return sorted;
  }, [questions, selectedSubject, selectedDifficulty, debouncedQuery, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleQuestions = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ---------- Template rows helpers (manage slots when count changes) ---------- */
  const addTemplateRow = () => {
    setTemplateRows(prev => [...prev, { id: Date.now() + Math.random(), type: 'short', count: 1, marks: 5, slots: [{ id: 0, questionText: '' }] }]);
  };

  const removeTemplateRow = (id) => {
    setTemplateRows(prev => prev.filter(r => r.id !== id));
  };

  const updateTemplateRow = (id, patch) => {
    setTemplateRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, ...patch };
      if (patch.hasOwnProperty('count')) {
        const newCount = Number(patch.count) || 0;
        const oldSlots = updated.slots || [];
        if (newCount > oldSlots.length) {
          const extras = Array.from({ length: newCount - oldSlots.length }, (_, i) => ({ id: Date.now() + Math.random() + i, questionText: '' }));
          updated.slots = [...oldSlots, ...extras];
        } else if (newCount < oldSlots.length) {
          updated.slots = oldSlots.slice(0, newCount);
        }
      }
      return updated;
    }));
  };

  const updateSlotQuestionText = (rowId, slotIndex, text) => {
    setTemplateRows(prev => prev.map(r => {
      if (r.id !== rowId) return r;
      const slots = (r.slots || []).map((s, idx) => idx === slotIndex ? { ...s, questionText: text } : s);
      return { ...r, slots };
    }));
  };

  const computeTemplateTotal = () => templateRows.reduce((s, r) => s + (Number(r.count) || 0) * (Number(r.marks) || 0), 0);

  /* ---------- Create paper: typed slots -> pool-by-type -> placeholder ---------- */
  const handleCreatePaper = () => {
    const totalFromRows = computeTemplateTotal();
    if (totalFromRows !== Number(paperTotal)) {
      window.alert(`Template total mismatch: sum(count × marks) = ${totalFromRows} but selected template total = ${paperTotal}. Please fix rows.`);
      return;
    }

    const { questions: paperQs, totalMarks } = composePaperWithTypedSlots({
      questions,
      rows: templateRows,
      subjectFilter: paperSubject,
      department: paperDepartment,
      year: paperYear,
      type: paperType
    });

    const generatePaperTitle = () => {
      if (paperTitle) return paperTitle;
      
      const yearText = paperType === 'year-wise' ? ` - ${paperYear}${paperYear === 1 ? 'st' : paperYear === 2 ? 'nd' : paperYear === 3 ? 'rd' : 'th'} Year` : '';
      const deptText = paperType === 'department-wise' ? ` - ${paperDepartment}` : '';
      const subjectText = paperSubject === 'all' ? 'Mixed Subjects' : paperSubject;
      
      return `${subjectText} Paper${yearText}${deptText} - ${paperTotal} Marks`;
    };

    const newPaper = {
      id: `${Date.now()}`,
      title: generatePaperTitle(),
      subjectFilter: paperSubject,
      department: paperDepartment,
      year: paperYear,
      type: paperType,
      templateRows,
      questions: paperQs,
      totalMarks,
      createdAt: new Date().toISOString(),
      templateTotal: paperTotal
    };

    setPapers(prev => [newPaper, ...prev]);
    setShowAddPaper(false);
    setPreviewPaper(newPaper);
    setShowPaperPreview(true);
  };

  const openAddPaperModal = () => {
    setPaperTitle('');
    setPaperTotal(50);
    setPaperSubject('all');
    setPaperDepartment('All Departments');
    setPaperYear(1);
    setPaperType('regular');
    setTemplateRows([{ id: Date.now(), type: 'long', count: 2, marks: 10, slots: [{ id: 0, questionText: '' }, { id: 1, questionText: '' }] }]);
    setShowAddPaper(true);
  };

  const handlePreviewPaper = (paper) => {
    setPreviewPaper(paper);
    setShowPaperPreview(true);
  };

  const exportPaperAsText = (paper) => {
    const rows = [];
    rows.push(`${paper.title}`);
    rows.push(`Department: ${paper.department}`);
    rows.push(`Subject filter: ${paper.subjectFilter}`);
    if (paper.type && paper.type !== 'regular') {
      rows.push(`Paper type: ${paper.type === 'year-wise' ? `${paper.year}${paper.year === 1 ? 'st' : paper.year === 2 ? 'nd' : paper.year === 3 ? 'rd' : 'th'} Year` : 'Department-wise'}`);
    }
    rows.push(`Template total: ${paper.templateTotal}`);
    rows.push('');
    paper.questions.forEach((q, i) => {
      const markStr = q.assignedMarks || q.marks || '';
      const placeholderTag = q.isPlaceholder ? ' [PLACEHOLDER]' : (q.isManual ? ' [MANUAL]' : '');
      rows.push(`${i + 1}. (${markStr}) ${q.question}${placeholderTag}`);
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- Render ---------- */
  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">DSU Question Bank & Paper Generator</h1>
                <p className="text-gray-600 mt-2">Type questions directly into template slots when creating papers. Typed slots are used as-is.</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center" onClick={openAddPaperModal}>
                  <LayoutDashboard className="w-5 h-5 mr-2" /> Add Question Paper
                  </button>

                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center" onClick={() => window.alert('Add question (stub)')}>
                  <Plus className="w-5 h-5 mr-2" /> Add Question
                </button>
              </div>
            </div>

            {/* question repository (kept minimal) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input placeholder="Search questions..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>

                  <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="border px-3 py-2 rounded-lg">
                    {subjects.map(s => <option key={s} value={s}>{s === 'all' ? 'All Subjects' : s}</option>)}
                  </select>

                  <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} className="border px-3 py-2 rounded-lg">
                    {difficulties.map(d => <option key={d} value={d}>{d === 'all' ? 'All Difficulties' : d}</option>)}
                  </select>
                </div>

                <div className="text-sm text-gray-600">Questions: <strong>{questions.length}</strong></div>
              </div>

              <div className="divide-y divide-gray-200 min-h-[120px]">
                {visibleQuestions.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No matching questions.</div>
                ) : (
                  visibleQuestions.map(q => <QuestionCard key={q.id} q={q} user={user} onPreview={() => window.alert('Preview question (stub)')} onEdit={() => window.alert('Edit (stub)')} onDelete={() => setQuestions(prev => prev.filter(x => x.id !== q.id))} />)
                )}
              </div>

              <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing <strong>{filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}</strong> - <strong>{Math.min(page * PAGE_SIZE, filtered.length)}</strong> of <strong>{filtered.length}</strong>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
                  <div>Page <strong>{page}</strong> of <strong>{totalPages}</strong></div>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
            </div>

            {/* papers list */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Generated Papers</h2>
              </div>

              {papers.length === 0 ? (
                <div className="text-gray-500">No papers yet. Click Add Question Paper and type your template rows (e.g., 10×2-mark, 4×15-mark).</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {papers.map(paper => (
                    <div key={paper.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-sm text-gray-500">{formatDate(paper.createdAt)}</div>
                          {paper.type && paper.type !== 'regular' && (
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              paper.type === 'year-wise' ? 'bg-blue-100 text-blue-800' : 
                              paper.type === 'department-wise' ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {paper.type === 'year-wise' ? `${paper.year}${paper.year === 1 ? 'st' : paper.year === 2 ? 'nd' : paper.year === 3 ? 'rd' : 'th'} Year` : 
                               paper.type === 'department-wise' ? 'Dept-wise' : 
                               paper.type}
                            </span>
                          )}
                        </div>
                        <div className="text-lg font-medium text-gray-900">{paper.title}</div>
                        <div className="text-sm text-gray-600">Dept: {paper.department} • Template total: {paper.templateTotal} • Filled marks: {paper.totalMarks}</div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg" onClick={() => handlePreviewPaper(paper)} title="Preview"><Eye className="w-5 h-5" /></button>
                        <button className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg" onClick={() => exportPaperAsText(paper)} title="Export"><FileDown className="w-5 h-5" /></button>
                        <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => {
                          if (window.confirm('Delete paper?')) setPapers(prev => prev.filter(x => x.id !== paper.id));
                        }} title="Delete"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Questions" value={questions.length} icon={<FileText className="w-8 h-8 text-blue-600" />} />
              <StatCard title="Subjects Covered" value={subjects.length - 1} icon={<FileText className="w-8 h-8 text-green-600" />} />
              <StatCard title="Papers Generated" value={papers.length} icon={<FileText className="w-8 h-8 text-purple-600" />} />
            </div>
          </div>
        </main>
      </div>

      {/* ---------- Add Paper Modal (with typed slots, scrollable body) ---------- */}
      {showAddPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header (sticky) */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <h3 className="text-xl font-semibold">Create Paper — Type questions into slots</h3>
              <button onClick={() => setShowAddPaper(false)} className="text-gray-600">Close</button>
            </div>

            {/* Body (scrollable) */}
            <div className="p-6 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Total</label>
                  <select value={paperTotal} onChange={(e) => setPaperTotal(Number(e.target.value))} className="w-full border px-3 py-2 rounded-lg">
                    <option value={50}>50 Marks</option>
                    <option value={100}>100 Marks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paper Type</label>
                  <select value={paperType} onChange={(e) => setPaperType(e.target.value)} className="w-full border px-3 py-2 rounded-lg">
                    <option value="regular">Regular Paper</option>
                    <option value="year-wise">Year-wise Paper</option>
                    <option value="department-wise">Department-wise Paper</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paper Title (optional)</label>
                  <input value={paperTitle} onChange={(e) => setPaperTitle(e.target.value)} className="w-full border px-3 py-2 rounded-lg" placeholder="e.g. OS - Midterm - April 2025" />
                  </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Filter</label>
                  <select value={paperSubject} onChange={(e) => setPaperSubject(e.target.value)} className="w-full border px-3 py-2 rounded-lg">
                    {subjects.map(s => <option key={s} value={s}>{s === 'all' ? 'All Subjects' : s}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select value={paperDepartment} onChange={(e) => setPaperDepartment(e.target.value)} className="w-full border px-3 py-2 rounded-lg">
                    <option value="All Departments">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                  
                {paperType === 'year-wise' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                    <select value={paperYear} onChange={(e) => setPaperYear(Number(e.target.value))} className="w-full border px-3 py-2 rounded-lg">
                      <option value={1}>1st Year (Easy questions)</option>
                      <option value={2}>2nd Year (Easy + Medium questions)</option>
                      <option value={3}>3rd Year (Medium questions)</option>
                      <option value={4}>4th Year (Hard + Medium questions)</option>
                    </select>
                    <div className="text-xs text-gray-500 mt-1">
                      Questions are filtered by difficulty level: 1st year = easy, 2nd year = easy+medium, 3rd year = medium, 4th year = hard+medium
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Template Rows (type → count × marks)</div>
                  <div className="text-sm text-gray-500">Sum: <strong>{computeTemplateTotal()}</strong> / <strong>{paperTotal}</strong> marks</div>
                        </div>
                        
                <div className="space-y-4">
                  {templateRows.map((row, rowIndex) => (
                    <div key={row.id} className="border p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <select value={row.type} onChange={(e) => updateTemplateRow(row.id, { type: e.target.value })} className="border px-2 py-2 rounded-lg">
                          {QUESTION_TYPES.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                        </select>

                        <input type="number" min={1} value={row.count} onChange={(e) => updateTemplateRow(row.id, { count: Number(e.target.value) })} className="w-24 border px-2 py-2 rounded-lg" placeholder="Count" />
                        <span className="text-sm">×</span>
                        <input type="number" min={1} value={row.marks} onChange={(e) => updateTemplateRow(row.id, { marks: Number(e.target.value) })} className="w-24 border px-2 py-2 rounded-lg" placeholder="Marks" />
                        <div className="text-sm text-gray-600">= <strong>{(Number(row.count) || 0) * (Number(row.marks) || 0)}</strong> marks</div>

                        <button onClick={() => removeTemplateRow(row.id)} className="ml-auto p-1 text-red-600" title="Remove"><MinusSquare className="w-5 h-5" /></button>
                          </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Slots (type: {row.type.toUpperCase()}) — type question text into a slot to use it directly</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          {(row.slots || []).map((slot, slotIdx) => (
                            <div key={slot.id} className="border p-2 rounded-md">
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-xs text-gray-600">Slot {slotIdx + 1} • {row.marks} marks</div>
                                <div className="text-xs text-gray-400">{row.type.toUpperCase()}</div>
                              </div>
                              <textarea
                                value={slot.questionText}
                                onChange={(e) => updateSlotQuestionText(row.id, slotIdx, e.target.value)}
                                className="w-full border rounded-md px-2 py-2 text-sm"
                                placeholder={`Type question for slot ${slotIdx + 1} (or leave empty to auto-fill from pool)`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                      </div>
                      
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={addTemplateRow} className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg">
                    <PlusSquare className="w-4 h-4" /> Add Row
                          </button>
                    </div>
                  </div>

              <div className="mt-4 text-sm text-gray-500">
                Typed slot questions will be used exactly as entered. Empty slots will be filled only with matching-type questions from the question pool; if none available, placeholders are inserted.
              </div>
            </div>

            {/* Footer (sticky) */}
            <div className="p-4 border-t sticky bottom-0 bg-white z-10 flex items-center justify-end gap-3">
              <button className="px-4 py-2 rounded-lg border" onClick={() => setShowAddPaper(false)}>Cancel</button>
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white" onClick={handleCreatePaper}>Create Paper</button>
                  </div>
                </div>
              </div>
      )}

      {/* ---------- Paper Preview Modal (scrollable with sticky header/footer) ---------- */}
      {showPaperPreview && previewPaper && (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black/50 p-6">
          <div className="bg-white rounded-lg w-full md:w-3/4 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between p-4 border-b sticky top-0 bg-white z-10">
                  <div>
                <h2 className="text-2xl font-bold">{previewPaper.title}</h2>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-sm text-gray-600">Department: <strong>{previewPaper.department}</strong> • Subject filter: <strong>{previewPaper.subjectFilter}</strong> • Template total: <strong>{previewPaper.templateTotal}</strong></div>
                  {previewPaper.type && previewPaper.type !== 'regular' && (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      previewPaper.type === 'year-wise' ? 'bg-blue-100 text-blue-800' : 
                      previewPaper.type === 'department-wise' ? 'bg-green-100 text-green-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {previewPaper.type === 'year-wise' ? `${previewPaper.year}${previewPaper.year === 1 ? 'st' : previewPaper.year === 2 ? 'nd' : previewPaper.year === 3 ? 'rd' : 'th'} Year` : 
                       previewPaper.type === 'department-wise' ? 'Dept-wise' : 
                       previewPaper.type}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-1">Generated: {formatDate(previewPaper.createdAt)}</div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="px-3 py-2 border rounded-lg" onClick={() => exportPaperAsText(previewPaper)}>Export Text</button>
                <button className="px-3 py-2 border rounded-lg" onClick={() => window.print()}>Print</button>
                <button className="px-3 py-2 rounded-lg bg-gray-100" onClick={() => { setShowPaperPreview(false); setPreviewPaper(null); }}>Close</button>
                  </div>
                </div>

            {/* Body (scrollable) */}
            <div className="p-6 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold">Dhanalakshmi Srinivasan University</h3>
                <div className="text-sm text-gray-600">Question Paper (Generated Template)</div>
              </div>

              <ol className="list-decimal pl-6 space-y-4">
                {previewPaper.questions.length === 0 && <div className="text-gray-500">No questions in this paper.</div>}

                {previewPaper.questions.map((q, idx) => (
                  <li key={q.id || idx} className={`leading-relaxed ${q.isPlaceholder ? 'opacity-80' : ''}`}>
                    <div className="flex items-baseline justify-between">
                      <div className={`text-gray-900 ${q.isPlaceholder ? 'italic text-red-600' : ''}`}>{q.question}</div>
                      <div className="text-sm text-gray-600 ml-4">({q.assignedMarks || q.marks || 0}){q.isManual ? ' • MANUAL' : ''}</div>
                    </div>

                    {q.options && q.options.length > 0 && (
                      <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                        {q.options.map((opt, i) => <li key={i}>{opt}</li>)}
                      </ul>
                    )}

                    {q.isPlaceholder && <div className="text-xs text-gray-500 mt-1">Placeholder — add a real question of this type to replace it.</div>}
                    {q.isManual && <div className="text-xs text-gray-500 mt-1">Manual slot — typed while creating template.</div>}
                  </li>
                ))}
              </ol>

              <div className="mt-6 text-sm text-gray-600">Important: This paper strictly follows your typed template and typed slot questions.</div>
            </div>

            {/* Footer (sticky) */}
            <div className="p-3 border-t sticky bottom-0 bg-white z-10 flex items-center justify-end gap-2">
              <button className="px-3 py-2 border rounded-lg" onClick={() => exportPaperAsText(previewPaper)}>Export Text</button>
              <button className="px-3 py-2 border rounded-lg" onClick={() => window.print()}>Print</button>
              <button className="px-3 py-2 rounded-lg bg-gray-100" onClick={() => { setShowPaperPreview(false); setPreviewPaper(null); }}>Close</button>
            </div>
          </div>
      </div>
      )}
    </div>
  );
};

export default QuestionBank;