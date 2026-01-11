import React, { createContext, useContext, useMemo, useState } from 'react';

// Create the context
const DataContext = createContext(null);

// Hook to consume the context
export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within a DataProvider');
  }
  return ctx;
};

// Sample data shaped to what HallTickets expects
const sampleExams = [
  // CS - multiple semesters and types
  { id: 'EX-001', title: 'Computer Networks', courseCode: 'CS301', courseName: 'Computer Networks', examType: 'final', examCode: 'FE-CN-301', academicYear: '2024-25', department: 'CS', semester: '6', date: '2025-03-18', startTime: '10:00', endTime: '13:00', duration: '03:00', venue: 'Hall A', maxMarks: 100, passingMarks: 40, subject: 'CS301', time: '10:00', type: 'final', status: 'scheduled', students: 67 },
  { id: 'EX-002', title: 'Database Systems', courseCode: 'CS302', courseName: 'Database Systems', examType: 'midterm', examCode: 'MT-DB-302', academicYear: '2024-25', department: 'CS', semester: '4', date: '2025-03-20', startTime: '14:00', endTime: '16:00', duration: '02:00', venue: 'Hall B', maxMarks: 50, passingMarks: 20, subject: 'CS302', time: '14:00', type: 'midterm', status: 'scheduled', students: 89 },
  { id: 'EX-003', title: 'Software Engineering', courseCode: 'CS401', courseName: 'Software Engineering', examType: 'final', examCode: 'FE-SE-401', academicYear: '2024-25', department: 'CS', semester: '8', date: '2025-03-22', startTime: '09:00', endTime: '12:00', duration: '03:00', venue: 'Hall C', maxMarks: 100, passingMarks: 40, subject: 'CS401', time: '09:00', type: 'final', status: 'scheduled', students: 124 },
  { id: 'EX-004', title: 'Operating Systems', courseCode: 'CS303', courseName: 'Operating Systems', examType: 'practical', examCode: 'PR-OS-303', academicYear: '2024-25', department: 'CS', semester: '6', date: '2025-03-25', startTime: '09:00', endTime: '11:00', duration: '02:00', venue: 'Lab 2', maxMarks: 50, passingMarks: 20, subject: 'CS303', time: '09:00', type: 'practical', status: 'scheduled', students: 60 },

  // IT - ensure data for typical filters
  { id: 'EX-101', title: 'Web Technologies', courseCode: 'IT301', courseName: 'Web Technologies', examType: 'midterm', examCode: 'MT-WT-301', academicYear: '2024-25', department: 'IT', semester: '6', date: '2025-03-19', startTime: '11:00', endTime: '13:00', duration: '02:00', venue: 'Hall D', maxMarks: 50, passingMarks: 20, subject: 'IT301', time: '11:00', type: 'midterm', status: 'scheduled', students: 70 },
  { id: 'EX-102', title: 'Mobile Apps', courseCode: 'IT401', courseName: 'Mobile Application Development', examType: 'final', examCode: 'FE-MAD-401', academicYear: '2024-25', department: 'IT', semester: '8', date: '2025-03-24', startTime: '09:30', endTime: '12:30', duration: '03:00', venue: 'Hall G', maxMarks: 100, passingMarks: 40, subject: 'IT401', time: '09:30', type: 'final', status: 'scheduled', students: 80 },

  // ECE
  { id: 'EX-201', title: 'Digital Electronics', courseCode: 'ECE201', courseName: 'Digital Electronics', examType: 'midterm', examCode: 'MT-DE-201', academicYear: '2024-25', department: 'ECE', semester: '4', date: '2025-03-21', startTime: '10:00', endTime: '12:00', duration: '02:00', venue: 'Hall H', maxMarks: 50, passingMarks: 20, subject: 'ECE201', time: '10:00', type: 'midterm', status: 'scheduled', students: 75 },
  { id: 'EX-202', title: 'VLSI Design', courseCode: 'ECE401', courseName: 'VLSI Design', examType: 'final', examCode: 'FE-VLSI-401', academicYear: '2024-25', department: 'ECE', semester: '8', date: '2025-03-26', startTime: '11:00', endTime: '14:00', duration: '03:00', venue: 'Hall I', maxMarks: 100, passingMarks: 40, subject: 'ECE401', time: '11:00', type: 'final', status: 'scheduled', students: 65 },

  // EEE
  { id: 'EX-301', title: 'Power Electronics', courseCode: 'EEE301', courseName: 'Power Electronics', examType: 'final', examCode: 'FE-PE-301', academicYear: '2024-25', department: 'EEE', semester: '6', date: '2025-03-23', startTime: '10:00', endTime: '13:00', duration: '03:00', venue: 'Hall J', maxMarks: 100, passingMarks: 40, subject: 'EEE301', time: '10:00', type: 'final', status: 'scheduled', students: 55 },

  // ME
  { id: 'EX-401', title: 'Thermodynamics', courseCode: 'ME301', courseName: 'Thermodynamics', examType: 'midterm', examCode: 'MT-TH-301', academicYear: '2024-25', department: 'ME', semester: '6', date: '2025-03-27', startTime: '09:00', endTime: '11:00', duration: '02:00', venue: 'Hall L', maxMarks: 50, passingMarks: 20, subject: 'ME301', time: '09:00', type: 'midterm', status: 'scheduled', students: 45 },

  // CE
  { id: 'EX-501', title: 'Structural Analysis', courseCode: 'CE301', courseName: 'Structural Analysis', examType: 'final', examCode: 'FE-SA-301', academicYear: '2024-25', department: 'CE', semester: '6', date: '2025-03-29', startTime: '11:00', endTime: '14:00', duration: '03:00', venue: 'Hall N', maxMarks: 100, passingMarks: 40, subject: 'CE301', time: '11:00', type: 'final', status: 'scheduled', students: 40 },
];

// Sample results with versioning per course/semester
const sampleResults = [
  // STU-001: Fill semesters 1..8 with at least one course each
  { id: 'RES-001', studentId: 'STU-001', courseCode: 'CS101', courseName: 'Programming I', semester: '1', internal: 20, external: 45, practical: 10, total: 75, grade: 'A', resultStatus: 'pass', version: 1, updatedAt: '2024-10-01', updatedBy: 'faculty' },
  { id: 'RES-004', studentId: 'STU-001', courseCode: 'MA101', courseName: 'Engineering Mathematics I', semester: '1', internal: 18, external: 42, practical: 0, total: 60, grade: 'B', resultStatus: 'pass', version: 1, updatedAt: '2024-10-01', updatedBy: 'faculty' },

  { id: 'RES-005', studentId: 'STU-001', courseCode: 'CS102', courseName: 'Programming II', semester: '2', internal: 22, external: 40, practical: 10, total: 72, grade: 'A', resultStatus: 'pass', version: 1, updatedAt: '2025-02-01', updatedBy: 'faculty' },
  { id: 'RES-006', studentId: 'STU-001', courseCode: 'MA102', courseName: 'Engineering Mathematics II', semester: '2', internal: 15, external: 30, practical: 0, total: 45, grade: 'C', resultStatus: 'pass', version: 1, updatedAt: '2025-02-01', updatedBy: 'faculty' },

  { id: 'RES-007', studentId: 'STU-001', courseCode: 'CS201', courseName: 'Data Structures', semester: '3', internal: 25, external: 35, practical: 10, total: 70, grade: 'A', resultStatus: 'pass', version: 1, updatedAt: '2025-07-01', updatedBy: 'faculty' },
  { id: 'RES-008', studentId: 'STU-001', courseCode: 'EC201', courseName: 'Digital Logic', semester: '3', internal: 20, external: 28, practical: 0, total: 48, grade: 'C', resultStatus: 'pass', version: 1, updatedAt: '2025-07-01', updatedBy: 'faculty' },

  { id: 'RES-009', studentId: 'STU-001', courseCode: 'CS302', courseName: 'Database Systems', semester: '4', internal: 18, external: 20, practical: 0, total: 38, grade: 'F', resultStatus: 'fail', version: 1, updatedAt: '2026-01-15', updatedBy: 'faculty' },
  // Later override by CoE to pass
  { id: 'RES-010', studentId: 'STU-001', courseCode: 'CS302', courseName: 'Database Systems', semester: '4', internal: 20, external: 25, practical: 0, total: 45, grade: 'C', resultStatus: 'pass', version: 2, updatedAt: '2026-02-10', updatedBy: 'coe', overrideReason: 'Moderation' },

  { id: 'RES-011', studentId: 'STU-001', courseCode: 'CS301', courseName: 'Computer Networks', semester: '6', internal: 40, external: 50, practical: 0, total: 90, grade: 'A', resultStatus: 'pass', version: 1, updatedAt: '2026-12-01', updatedBy: 'faculty' },
  { id: 'RES-012', studentId: 'STU-001', courseCode: 'CS303', courseName: 'Operating Systems', semester: '6', internal: 30, external: 40, practical: 0, total: 70, grade: 'A', resultStatus: 'pass', version: 1, updatedAt: '2026-12-01', updatedBy: 'faculty' },

  { id: 'RES-013', studentId: 'STU-001', courseCode: 'CS401', courseName: 'Software Engineering', semester: '8', internal: 35, external: 50, practical: 0, total: 85, grade: 'A+', resultStatus: 'pass', version: 1, updatedAt: '2027-06-01', updatedBy: 'faculty' },
  { id: 'RES-014', studentId: 'STU-001', courseCode: 'IT401', courseName: 'Mobile Application Development', semester: '8', internal: 28, external: 45, practical: 0, total: 73, grade: 'A', resultStatus: 'pass', version: 1, updatedAt: '2027-06-01', updatedBy: 'faculty' },

  // Fill remaining semesters with one course each for visibility
  { id: 'RES-015', studentId: 'STU-001', courseCode: 'MA201', courseName: 'Probability & Statistics', semester: '5', internal: 22, external: 30, practical: 0, total: 52, grade: 'B', resultStatus: 'pass', version: 1, updatedAt: '2026-08-01', updatedBy: 'faculty' },
  { id: 'RES-016', studentId: 'STU-001', courseCode: 'CS202', courseName: 'OOP with Java', semester: '5', internal: 25, external: 32, practical: 10, total: 67, grade: 'B', resultStatus: 'pass', version: 1, updatedAt: '2026-08-01', updatedBy: 'faculty' },

  { id: 'RES-017', studentId: 'STU-001', courseCode: 'CS203', courseName: 'Computer Organization', semester: '4', internal: 20, external: 30, practical: 0, total: 50, grade: 'C', resultStatus: 'pass', version: 1, updatedAt: '2026-01-15', updatedBy: 'faculty' },

  { id: 'RES-018', studentId: 'STU-001', courseCode: 'HU101', courseName: 'Professional Communication', semester: '7', internal: 24, external: 26, practical: 0, total: 50, grade: 'C', resultStatus: 'pass', version: 1, updatedAt: '2027-02-01', updatedBy: 'faculty' },
  { id: 'RES-019', studentId: 'STU-001', courseCode: 'CS402', courseName: 'Distributed Systems', semester: '7', internal: 28, external: 40, practical: 0, total: 68, grade: 'B', resultStatus: 'pass', version: 1, updatedAt: '2027-02-01', updatedBy: 'faculty' },

  // STU-002: a few entries
  { id: 'RES-020', studentId: 'STU-002', courseCode: 'CS302', courseName: 'Database Systems', semester: '4', internal: 22, external: 28, practical: 0, total: 50, grade: 'C', resultStatus: 'pass', version: 1, updatedAt: '2025-03-01', updatedBy: 'faculty' },
  { id: 'RES-021', studentId: 'STU-002', courseCode: 'CS201', courseName: 'Data Structures', semester: '3', internal: 24, external: 35, practical: 10, total: 69, grade: 'B', resultStatus: 'pass', version: 1, updatedAt: '2024-11-01', updatedBy: 'faculty' },
];

// Sample malpractice records
const sampleMalpractices = [
  { id: 'MP-001', studentId: 'STU-001', courseCode: 'CS302', assessment: 'final', date: '2025-03-22', status: 'adjudicated', action: 'withheld', description: 'Possession of notes', reportedBy: 'invigilator' },
  { id: 'MP-002', studentId: 'STU-202', courseCode: 'ECE401', assessment: 'final', date: '2025-03-26', status: 'pending', action: '', description: 'Mobile phone usage', reportedBy: 'invigilator' },
];

const sampleStudents = [
  // CS
  { id: 'STU-001', rollNumber: 'CS2021001', name: 'Alex Rodriguez', batch: '2021', semester: '6', department: 'CS', academicYear: '2024-25', class: 'CS-A' },
  { id: 'STU-002', rollNumber: 'CS2021002', name: 'Sarah Johnson', batch: '2021', semester: '4', department: 'CS', academicYear: '2024-25', class: 'CS-B' },
  { id: 'STU-003', rollNumber: 'CS2021003', name: 'Michael Chen', batch: '2021', semester: '8', department: 'CS', academicYear: '2024-25', class: 'CS-C' },
  // IT
  { id: 'STU-101', rollNumber: 'IT2021001', name: 'Priya Singh', batch: '2021', semester: '6', department: 'IT', academicYear: '2024-25', class: 'IT-A' },
  { id: 'STU-102', rollNumber: 'IT2021002', name: 'Rahul Verma', batch: '2021', semester: '8', department: 'IT', academicYear: '2024-25', class: 'IT-B' },
  // ECE
  { id: 'STU-201', rollNumber: 'EC2021001', name: 'Neha Gupta', batch: '2021', semester: '4', department: 'ECE', academicYear: '2024-25', class: 'ECE-A' },
  { id: 'STU-202', rollNumber: 'EC2021002', name: 'Arjun Mehta', batch: '2021', semester: '8', department: 'ECE', academicYear: '2024-25', class: 'ECE-B' },
  // EEE
  { id: 'STU-301', rollNumber: 'EE2021001', name: 'Karthik Nair', batch: '2021', semester: '6', department: 'EEE', academicYear: '2024-25', class: 'EEE-A' },
  // ME
  { id: 'STU-401', rollNumber: 'ME2021001', name: 'Sanjay Patel', batch: '2021', semester: '6', department: 'ME', academicYear: '2024-25', class: 'ME-A' },
  // CE
  { id: 'STU-501', rollNumber: 'CE2021001', name: 'Aditi Rao', batch: '2021', semester: '6', department: 'CE', academicYear: '2024-25', class: 'CE-A' },
];

export const DataProvider = ({ children }) => {
  const LS_KEY = 'exam_scheduling_v1_aligned';

  const departments = [
    { id: 'CS', name: 'Computer Science' },
    { id: 'IT', name: 'Information Technology' },
    { id: 'ECE', name: 'Electronics & Communication' },
    { id: 'EEE', name: 'Electrical & Electronics' },
    { id: 'ME', name: 'Mechanical Engineering' },
    { id: 'CE', name: 'Civil Engineering' },
    { id: 'BIO', name: 'Biotechnology' },
    { id: 'CHEM', name: 'Chemical Engineering' },
    { id: 'MATH', name: 'Mathematics' },
    { id: 'PHY', name: 'Physics' },
    { id: 'ENG', name: 'English' },
    { id: 'BBA', name: 'Business Administration' },
    { id: 'MBA', name: 'Master of Business Administration' },
    { id: 'MCA', name: 'Master of Computer Applications' },
  ];

  const getExamTypeLabel = (id) => {
    const t = examTypes.find((x) => x.id === id);
    return t ? t.label : id;
  };

  // Optional global filters
  const [selectedDepartment, setSelectedDepartment] = React.useState(() => {
    try { return localStorage.getItem('global_department') || ''; } catch { return ''; }
  });
  const semesters = ['1','2','3','4','5','6','7','8'];
  const examTypes = [
    { id: 'midterm', label: 'Midterm Examination', code: 'MT' },
    { id: 'final', label: 'Final Examination', code: 'FE' },
    { id: 'supplementary', label: 'Supplementary Examination', code: 'SE' },
    { id: 'improvement', label: 'Improvement Examination', code: 'IE' },
    { id: 'practical', label: 'Practical Examination', code: 'PE' },
    { id: 'viva', label: 'Viva Voce', code: 'VV' },
    { id: 'quiz', label: 'Quiz', code: 'QZ' },
    { id: 'assignment', label: 'Assignment', code: 'AS' },
    { id: 'project', label: 'Project Evaluation', code: 'PR' },
    { id: 'seminar', label: 'Seminar', code: 'SM' }
  ];

  const normalizeExam = (e) => {
    // Accepts either scheduling-shaped or ticket-shaped exam and returns unified shape
    const semester = String(e.semester ?? e.semesterId ?? '');
    const type = e.type ?? e.examType ?? 'midterm';
    const courseCode = e.courseCode ?? e.subject ?? '';
    const courseName = e.courseName ?? e.title ?? '';
    const time = e.time ?? e.startTime ?? '';
    const duration = e.duration ?? '';
    const startTime = e.startTime ?? (time || '').slice(0, 5);
    const endTime = e.endTime ?? '';
    const academicYear = e.academicYear ?? '2024-25';
    // Normalize department: accept either ID or Name, map Names to IDs
    let department = e.department ?? 'CS';
    const deptById = departments.find((d) => d.id === department);
    if (!deptById) {
      const byName = departments.find((d) => d.name === department);
      if (byName) department = byName.id;
    }
    const status = e.status ?? 'scheduled';
    const students = e.students ?? 0;
    const examCode = e.examCode ?? `${type?.toUpperCase()?.slice(0,2) || 'EX'}-${courseCode}`;
    return {
      id: e.id,
      title: e.title ?? courseName,
      courseCode,
      courseName,
      examType: type,
      examCode,
      academicYear,
      department,
      semester,
      date: e.date ?? '',
      startTime,
      endTime,
      duration,
      venue: e.venue ?? '',
      maxMarks: e.maxMarks ?? 100,
      passingMarks: e.passingMarks ?? 40,
      // compatibility
      subject: courseCode,
      time: startTime,
      type,
      status,
      students,
    };
  };

  const loadInitialExams = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map(normalizeExam);
        }
      }
    } catch {}
    return sampleExams;
  };

  const [exams, setExams] = useState(loadInitialExams);
  const [students, setStudents] = useState(sampleStudents);
  const [hallTickets, setHallTickets] = useState([]);
  const [results, setResults] = useState(sampleResults);
  const [malpractices, setMalpractices] = useState(sampleMalpractices);

  const getExamsBySemester = (sem) => exams.filter((e) => e.semester === String(sem));
  const getStudentsBySemester = (sem) => students.filter((s) => s.semester === String(sem));

  // Placeholder ActionTypes and dispatch for compatibility
  const ActionTypes = { ADD_TICKET: 'ADD_TICKET' };
  const dispatch = (action) => {
    switch (action.type) {
      case ActionTypes.ADD_TICKET:
        setHallTickets((prev) => [...prev, action.payload]);
        break;
      default:
        break;
    }
  };

  const generateHallTickets = (payload) => {
    // Minimal no-op to satisfy consumers; HallTickets builds tickets itself
    return payload || [];
  };

  // Persist exams in a shape compatible with legacy ExamScheduling
  React.useEffect(() => {
    try {
      const minimal = exams.map((e) => ({
        id: e.id,
        title: e.title,
        subject: e.courseCode ?? e.subject,
        date: e.date,
        time: e.startTime ?? e.time,
        duration: e.duration,
        type: e.examType ?? e.type,
        venue: e.venue,
        department: e.department,
        semester: Number(e.semester),
        status: e.status ?? 'scheduled',
        students: e.students ?? 0,
      }));
      localStorage.setItem(LS_KEY, JSON.stringify(minimal));
    } catch {}
  }, [exams]);

  // Persist global department
  React.useEffect(() => {
    try { localStorage.setItem('global_department', selectedDepartment || ''); } catch {}
  }, [selectedDepartment]);

  const value = useMemo(() => ({
    exams,
    students,
    hallTickets,
    results,
    malpractices,
    dispatch,
    ActionTypes,
    getExamsBySemester,
    getStudentsBySemester,
    generateHallTickets,
    // expose setters in case needed later
    setExams,
    setStudents,
    setHallTickets,
    setResults,
    setMalpractices,
    departments,
    selectedDepartment,
    setSelectedDepartment,
    semesters,
    examTypes,
    getExamTypeLabel,
    // helpers
    getStudentById: (id) => (students || []).find(s => s.id === id),
    getResultsByStudent: (studentId) => (results || []).filter(r => r.studentId === studentId),
    getMalpracticesByStudent: (studentId) => (malpractices || []).filter(m => m.studentId === studentId),
    addCoEOverrideResult: ({ studentId, courseCode, updates, reason, updatedBy = 'coe' }) => {
      setResults((prev) => {
        const current = prev.filter(r => r.studentId === studentId && r.courseCode === courseCode);
        const latest = current.sort((a,b) => (b.version||0)-(a.version||0))[0];
        const base = latest || { id: `RES-${Date.now()}`, studentId, courseCode, courseName: courseCode, semester: '', internal: 0, external: 0, practical: 0, total: 0, grade: 'NA', resultStatus: 'pending', version: 0 };
        const next = { ...base, ...updates };
        next.version = (base.version || 0) + 1;
        next.updatedAt = new Date().toISOString().slice(0,10);
        next.updatedBy = updatedBy;
        next.overrideReason = reason || '';
        // recompute total and status if fields present
        const internal = Number(next.internal||0);
        const external = Number(next.external||0);
        const practical = Number(next.practical||0);
        next.total = internal + external + practical;
        next.resultStatus = next.total >= 40 ? 'pass' : 'fail';
        // naive grade mapping
        next.grade = next.total >= 85 ? 'A+' : next.total >= 70 ? 'A' : next.total >= 55 ? 'B' : next.total >= 40 ? 'C' : 'F';
        return [...prev, { ...next, id: `RES-${Date.now()}` }];
      });
    },
  }), [exams, students, hallTickets, selectedDepartment]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
