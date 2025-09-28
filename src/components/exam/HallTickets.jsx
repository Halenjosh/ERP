import React, { useState, useContext, useEffect } from 'react';
import { CreditCard, Download, QrCode, Calendar, Clock, MapPin, User, Search, Filter, Printer, FileText } from 'lucide-react';
import { AuthContext } from '../../App';
import { useData } from '../../contexts/DataContext';
import { useToaster } from '../../contexts/ToastContext.jsx';
import Header from '../layout/Header';
import Sidebar from '../layout/Sidebar';

const HallTickets = () => {
  const { user, sidebarVisible } = useContext(AuthContext);
  const toaster = useToaster();
  const { 
    exams, 
    students, 
    hallTickets, 
    dispatch, 
    ActionTypes, 
    getExamsBySemester, 
    getStudentsBySemester,
    generateHallTickets,
    selectedDepartment: globalDepartment,
    examTypes
  } = useData();

  // --- Start: Generation Feature Logic ---
  const [qrCodeLibLoaded, setQrCodeLibLoaded] = useState(false);

  useEffect(() => {
    // Dynamically load the qrcode.js library from a CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js';
    script.onload = () => setQrCodeLibLoaded(true);
    script.onerror = () => console.error('Failed to load QRCode library');
    document.body.appendChild(script);
    
    return () => {
      // Check if the script is still a child of the body before removing
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    }
  }, []);

  // Academic year and semester data
  const academicYears = [
    { id: '2024-25', label: '2024-25', isCurrent: true },
    { id: '2023-24', label: '2023-24', isCurrent: false },
    { id: '2022-23', label: '2022-23', isCurrent: false },
    { id: '2021-22', label: '2021-22', isCurrent: false },
    { id: '2020-21', label: '2020-21', isCurrent: false }
  ];

  // Add the missing classes definition
  const classes = [
    { id: 'CS-A', name: 'CS-A' },
    { id: 'CS-B', name: 'CS-B' },
    { id: 'CS-C', name: 'CS-C' },
    { id: 'IT-A', name: 'IT-A' },
    { id: 'IT-B', name: 'IT-B' },
    { id: 'IT-C', name: 'IT-C' },
    { id: 'ECE-A', name: 'ECE-A' },
    { id: 'ECE-B', name: 'ECE-B' },
    { id: 'ECE-C', name: 'ECE-C' },
    { id: 'EEE-A', name: 'EEE-A' },
    { id: 'EEE-B', name: 'EEE-B' },
    { id: 'ME-A', name: 'ME-A' },
    { id: 'ME-B', name: 'ME-B' },
    { id: 'CE-A', name: 'CE-A' },
    { id: 'CE-B', name: 'CE-B' },
    { id: 'BIO-A', name: 'BIO-A' },
    { id: 'BIO-B', name: 'BIO-B' },
    { id: 'CHEM-A', name: 'CHEM-A' },
    { id: 'MATH-A', name: 'MATH-A' },
    { id: 'PHY-A', name: 'PHY-A' }
  ];

  const semesters = [
    { id: '1', label: 'Semester 1', code: 'S1' },
    { id: '2', label: 'Semester 2', code: 'S2' },
    { id: '3', label: 'Semester 3', code: 'S3' },
    { id: '4', label: 'Semester 4', code: 'S4' },
    { id: '5', label: 'Semester 5', code: 'S5' },
    { id: '6', label: 'Semester 6', code: 'S6' },
    { id: '7', label: 'Semester 7', code: 'S7' },
    { id: '8', label: 'Semester 8', code: 'S8' }
  ];

  const departments = [
    { id: 'CS', name: 'Computer Science', code: 'CS' },
    { id: 'IT', name: 'Information Technology', code: 'IT' },
    { id: 'ECE', name: 'Electronics & Communication', code: 'ECE' },
    { id: 'EEE', name: 'Electrical & Electronics', code: 'EEE' },
    { id: 'ME', name: 'Mechanical Engineering', code: 'ME' },
    { id: 'CE', name: 'Civil Engineering', code: 'CE' },
    { id: 'BIO', name: 'Biotechnology', code: 'BIO' },
    { id: 'CHEM', name: 'Chemical Engineering', code: 'CHEM' },
    { id: 'MATH', name: 'Mathematics', code: 'MATH' },
    { id: 'PHY', name: 'Physics', code: 'PHY' },
    { id: 'ENG', name: 'English', code: 'ENG' },
    { id: 'BBA', name: 'Business Administration', code: 'BBA' },
    { id: 'MBA', name: 'Master of Business Administration', code: 'MBA' },
    { id: 'MCA', name: 'Master of Computer Applications', code: 'MCA' }
  ];

  // examTypes provided by DataContext

  // Using exams from centralized data context

  // Using students from centralized data context

  // Enhanced filtering states
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2024-25');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(globalDepartment || '');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [showExamFilter, setShowExamFilter] = useState(false);
  const [showStudentSelection, setShowStudentSelection] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [generatedTicketsSearchTerm, setGeneratedTicketsSearchTerm] = useState('');
  const [generatedTickets, setGeneratedTickets] = useState([]);
  const [showQRDemo, setShowQRDemo] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [ticketsToShow, setTicketsToShow] = useState(9);

  // Get unique batches from students
  const batches = [...new Set(students.map(student => student.batch))];

  // Keep local department in sync with global selection
  useEffect(() => {
    if (globalDepartment && globalDepartment !== selectedDepartment) {
      setSelectedDepartment(globalDepartment);
    }
  }, [globalDepartment]);

  // Helper functions for filtering
  const getFilteredExams = () => {
    return exams.filter(exam => {
      const yearMatch = !selectedAcademicYear || exam.academicYear === selectedAcademicYear;
      const semesterMatch = !selectedSemester || exam.semester === selectedSemester;
      const deptMatch = !selectedDepartment || exam.department === selectedDepartment;
      const typeMatch = !selectedExamType || exam.examType === selectedExamType;
      
      return yearMatch && semesterMatch && deptMatch && typeMatch;
    });
  };

  // Helper function to group students by class
  const getStudentsGroupedByClass = () => {
    const filteredStudents = getFilteredStudents();
    return filteredStudents.reduce((groups, student) => {
      const classId = student.class || 'Unassigned';
      if (!groups[classId]) {
        groups[classId] = [];
      }
      groups[classId].push(student);
      return groups;
    }, {});
  };

  // Helper function to filter students by name search
  const filterStudentsByName = (students) => {
    if (!studentSearchTerm) return students;
    
    return students.filter(student => 
      student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(studentSearchTerm.toLowerCase())
    );
  };

  const getFilteredStudents = () => {
    return students.filter(student => 
      (!selectedSemester || student.semester === selectedSemester) &&
      (!selectedDepartment || student.department === selectedDepartment) &&
      (!selectedClass || student.class === selectedClass) &&
      (!selectedAcademicYear || student.academicYear === selectedAcademicYear)
    );
  };

  // Toggle student selection
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Select all filtered students
  const selectAllFilteredStudents = () => {
    const filteredStudentIds = getFilteredStudents().map(student => student.id);
    setSelectedStudents(filteredStudentIds);
  };

  // Clear all student selections
  const clearStudentSelection = () => {
    setSelectedStudents([]);
  };

  const getExamTypeLabel = (examType) => {
    const type = examTypes.find(t => t.id === examType);
    return type ? type.label : examType;
  };

  const getSemesterLabel = (semesterId) => {
    const semester = semesters.find(s => s.id === semesterId);
    return semester ? semester.label : `Semester ${semesterId}`;
  };

  const getDepartmentLabel = (deptId) => {
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : deptId;
  };

  const generateQRCode = async (data) => {
    if (!qrCodeLibLoaded || !window.QRCode) {
        console.error('QRCode library not loaded yet.');
        return '';
    }
    try {
      return await window.QRCode.toDataURL(data, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
    } catch (error) {
      console.error('QR Code generation failed:', error);
      return '';
    }
  };

  const handleGenerateTickets = async () => {
  // Instead of requiring a selected exam, we'll generate tickets for all applicable exams
  if (selectedStudents.length === 0 && !selectedDepartment && !selectedSemester) {
    toaster.error('Please select at least a department, semester, or specific students.');
    return;
  }

  // Determine which students to generate tickets for
  let eligibleStudents;
  
  if (showStudentSelection && selectedStudents.length > 0) {
    // Use specifically selected students
    eligibleStudents = students.filter(student => selectedStudents.includes(student.id));
  } else {
    // Use all filtered students based on department and semester
    eligibleStudents = students.filter(student => 
      (!selectedDepartment || student.department === selectedDepartment) &&
      (!selectedSemester || student.semester === selectedSemester) &&
      (!selectedClass || student.class === selectedClass)
    );
  }
  
  if (eligibleStudents.length === 0) {
    toaster.error('No eligible students found for the selected criteria.');
    return;
  }

  setIsGenerating(true);
  try {
    const tickets = await Promise.all(
      eligibleStudents.map(async (student, index) => {
        // Get all exams applicable for this student
        let studentExams = exams.filter(exam => 
          exam.semester === student.semester && 
          exam.department === student.department &&
          exam.academicYear === student.academicYear &&
          (!selectedExamType || exam.examType === selectedExamType)
        );
        
        // If a specific exam is selected, filter to only that exam
        if (selectedExam) {
          studentExams = studentExams.filter(exam => exam.id === selectedExam);
        }
        
        if (studentExams.length === 0) {
          return null; // Skip students with no applicable exams
        }
        
        if (studentExams.length === 0) {
          return null; // Skip students with no applicable exams
        }

        // Create a single ticket with all exams
        const ticketData = {
          studentId: student.id,
          rollNumber: student.rollNumber,
          name: student.name,
          batch: student.batch,
          semester: student.semester,
          department: student.department,
          academicYear: student.academicYear,
          class: student.class,
          exams: studentExams.map((exam, examIndex) => ({
            examId: exam.id,
            examTitle: exam.title,
            courseCode: exam.courseCode,
            courseName: exam.courseName,
            examType: exam.examType,
            examCode: exam.examCode,
            date: exam.date,
            time: `${exam.startTime} - ${exam.endTime}`,
            duration: exam.duration,
            venue: exam.venue,
            maxMarks: exam.maxMarks,
            passingMarks: exam.passingMarks,
            seatNumber: `${exam.venue.replace('Hall ', '')}-${(index + 1).toString().padStart(3, '0')}`
          })),
          seatNumber: `${student.department}-${student.rollNumber}`
        };
        
        const qrData = JSON.stringify({ 
          studentId: student.id, 
          rollNumber: student.rollNumber, 
          semester: student.semester,
          department: student.department
        });
        const qrCodeDataUrl = await generateQRCode(qrData);
        return { ...ticketData, qrCode: qrCodeDataUrl, generatedAt: new Date().toISOString() };
      })
    );
    
    // Filter out null tickets (students with no exams)
    const validTickets = tickets.filter(ticket => ticket !== null);
    
    if (validTickets.length === 0) {
      toaster.error('No tickets could be generated. No matching exams found for the selected students.');
      setIsGenerating(false);
      return;
    }
    
    setGeneratedTickets(validTickets);
    setTicketsToShow(9); // Reset to show first 9 tickets
    setShowSuccessMessage(true);
    toaster.success(`Generated ${validTickets.length} hall ticket${validTickets.length !== 1 ? 's' : ''}.`);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  } catch (error) {
    console.error('Error generating tickets:', error);
  } finally {
    setIsGenerating(false);
  }
  };

  const handleDownloadTicket = (ticket) => {
    // Create a printable version of the ticket
    const printWindow = window.open('', '_blank');

    
    // Generate the exam schedule HTML
    const examScheduleRows = ticket.exams.map(exam => `
      <tr>
        <td class="exam-cell">${exam.courseCode}</td>
        <td class="exam-cell">${exam.courseName}</td>
        <td class="exam-cell">${exam.date}</td>
        <td class="exam-cell">${exam.time}</td>
        <td class="exam-cell">${exam.venue}</td>
        <td class="exam-cell">${exam.seatNumber}</td>
      </tr>
    `).join('');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Hall Ticket - ${ticket.name}</title>
          <meta charset="UTF-8">
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Times New Roman', serif;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
              background: #fff;
            }
            
            .hall-ticket {
              width: 100%;
              max-width: 210mm;
              margin: 0 auto;
              border: 3px solid #000;
              background: #fff;
              position: relative;
            }
            
            .university-header {
              text-align: center;
              padding: 15px 20px;
              border-bottom: 2px solid #000;
              background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
              color: white;
              position: relative;
            }
            
            .university-logo {
              width: 60px;
              height: 60px;
              background: #fff;
              border-radius: 50%;
              margin: 0 auto 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              color: #1e3a8a;
              font-size: 18px;
            }
            
            .university-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .university-subtitle {
              font-size: 14px;
              margin-bottom: 8px;
              opacity: 0.9;
            }
            
            .hall-ticket-title {
              font-size: 20px;
              font-weight: bold;
              background: #fff;
              color: #1e3a8a;
              padding: 8px 25px;
              border-radius: 25px;
              display: inline-block;
              margin-top: 10px;
              border: 2px solid #fff;
              letter-spacing: 2px;
            }
            
            .ticket-body {
              padding: 25px;
              position: relative;
            }
            
            .student-photo-section {
              float: right;
              width: 120px;
              margin-left: 20px;
              margin-bottom: 15px;
            }
            
            .photo-placeholder {
              width: 100px;
              height: 120px;
              border: 2px solid #000;
              background: #f9fafb;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              color: #6b7280;
              text-align: center;
              margin-bottom: 8px;
            }
            
            .signature-box {
              width: 100px;
              height: 30px;
              border-bottom: 1px solid #000;
              margin-bottom: 3px;
            }
            
            .signature-label {
              font-size: 9px;
              text-align: center;
              color: #6b7280;
            }
            
            .details-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px 25px;
              margin-bottom: 20px;
              clear: both;
            }
            
            .detail-item {
              display: flex;
              align-items: baseline;
              border-bottom: 1px dotted #d1d5db;
              padding-bottom: 3px;
            }
            
            .detail-label {
              font-weight: bold;
              min-width: 100px;
              color: #374151;
              font-size: 11px;
            }
            
            .detail-value {
              flex: 1;
              margin-left: 10px;
              font-weight: 600;
              color: #000;
            }
            
            .exam-schedule {
              background: #f0f9ff;
              border: 1px solid #0ea5e9;
              border-radius: 5px;
              padding: 15px;
              margin: 20px 0;
            }
            
            .schedule-title {
              font-weight: bold;
              color: #0369a1;
              margin-bottom: 10px;
              text-align: center;
              font-size: 13px;
            }
            
            .exam-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            
            .exam-table th {
              background-color: #0ea5e9;
              color: white;
              font-size: 11px;
              padding: 8px;
              text-align: left;
              border: 1px solid #0284c7;
            }
            
            .exam-table td {
              padding: 8px;
              font-size: 10px;
              border: 1px solid #0284c7;
            }
            
            .exam-cell {
              font-weight: 600;
            }
            
            .instructions {
              background: #fef2f2;
              border: 1px solid #fca5a5;
              border-radius: 5px;
              padding: 12px;
              margin: 20px 0;
            }
            
            .instructions-title {
              font-weight: bold;
              color: #dc2626;
              margin-bottom: 8px;
              font-size: 12px;
            }
            
            .instructions-list {
              font-size: 10px;
              line-height: 1.5;
              color: #7f1d1d;
            }
            
            .instructions-list li {
              margin-bottom: 3px;
            }
            
            .footer-section {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 25px;
              padding-top: 15px;
              border-top: 1px dashed #d1d5db;
            }
            
            .qr-code-section {
              text-align: center;
            }
            
            .qr-code-img {
              width: 80px;
              height: 80px;
              margin-bottom: 5px;
            }
            
            .qr-code-text {
              font-size: 8px;
              color: #6b7280;
            }
            
            .official-signature {
              text-align: center;
              width: 120px;
            }
            
            .signature-line {
              width: 100%;
              height: 40px;
              border-bottom: 1px solid #000;
              margin-bottom: 5px;
            }
            
            .official-title {
              font-size: 10px;
              font-weight: bold;
            }
            
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 80px;
              color: rgba(0, 0, 0, 0.03);
              font-weight: bold;
              white-space: nowrap;
              pointer-events: none;
              z-index: 0;
            }
            
            @media print {
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              .hall-ticket {
                border: 3px solid #000 !important;
              }
              
              .university-header {
                background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%) !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              .exam-table th {
                background-color: #0ea5e9 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="hall-ticket">
            <div class="university-header">
              <div class="university-logo">UNIV</div>
              <div class="university-name">UNIVERSITY OF TECHNOLOGY</div>
              <div class="university-subtitle">Established under University Act 2010</div>
              <div class="hall-ticket-title">HALL TICKET</div>
            </div>
            
            <div class="ticket-body">
              <div class="watermark">OFFICIAL DOCUMENT</div>
              
              <div class="student-photo-section">
                <div class="photo-placeholder">
                  Student<br>Photo<br>Here
                </div>
                <div class="signature-box"></div>
                <div class="signature-label">Student's Signature</div>
              </div>
              
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-label">Student Name:</div>
                  <div class="detail-value">${ticket.name}</div>
                </div>
                
                <div class="detail-item">
                  <div class="detail-label">Roll Number:</div>
                  <div class="detail-value">${ticket.rollNumber}</div>
                </div>
                
                <div class="detail-item">
                  <div class="detail-label">Department:</div>
                  <div class="detail-value">${getDepartmentLabel(ticket.department)}</div>
                </div>
                
                <div class="detail-item">
                  <div class="detail-label">Semester:</div>
                  <div class="detail-value">${getSemesterLabel(ticket.semester)}</div>
                </div>
                
                <div class="detail-item">
                  <div class="detail-label">Academic Year:</div>
                  <div class="detail-value">${ticket.academicYear}</div>
                </div>
                
                <div class="detail-item">
                  <div class="detail-label">Class:</div>
                  <div class="detail-value">${ticket.class || 'N/A'}</div>
                </div>
              </div>
              
              <div class="exam-schedule">
                <div class="schedule-title">EXAMINATION SCHEDULE</div>
                <table class="exam-table">
                  <thead>
                    <tr>
                      <th>Course Code</th>
                      <th>Course Name</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Venue</th>
                      <th>Seat No.</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${examScheduleRows}
                  </tbody>
                </table>
              </div>
              
              <div class="instructions">
                <div class="instructions-title">IMPORTANT INSTRUCTIONS</div>
                <ol class="instructions-list">
                  <li>Students must bring this Hall Ticket to every examination.</li>
                  <li>Students should be present in the examination hall 30 minutes before the commencement of the examination.</li>
                  <li>No student will be allowed to enter the examination hall after 30 minutes of the commencement of the examination.</li>
                  <li>Students are not allowed to leave the examination hall before 1 hour after the start of the examination.</li>
                  <li>Mobile phones and other electronic devices are strictly prohibited in the examination hall.</li>
                  <li>Students must follow all the instructions given by the invigilator.</li>
                  <li>Any form of malpractice will result in disciplinary action as per university rules.</li>
                </ol>
              </div>
              
              <div class="footer-section">
                <div class="qr-code-section">
                  <img src="${ticket.qrCode}" class="qr-code-img" alt="QR Code" />
                  <div class="qr-code-text">Scan for verification</div>
                </div>
                
                <div class="official-signature">
                  <div class="signature-line"></div>
                  <div class="official-title">Controller of Examinations</div>
                </div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const handleDownloadAllTickets = () => {
    if (generatedTickets.length === 0) return;
    
    generatedTickets.forEach((ticket, index) => {
      setTimeout(() => {
        handleDownloadTicket(ticket);
      }, index * 1000); // Stagger downloads by 1 second
    });
  };

  const handleQRDemo = async () => {
    const demoData = JSON.stringify({ examId: 'DEMO-001', studentId: 'STU-001', rollNumber: 'CS2021001', seatNumber: 'A-001', timestamp: new Date().toISOString() });
    const qrUrl = await generateQRCode(demoData);
    setQrCodeUrl(qrUrl);
    setShowQRDemo(true);
  };

  const generationFilteredTickets = generatedTickets.filter(ticket =>
    ticket.name.toLowerCase().includes(generatedTicketsSearchTerm.toLowerCase()) ||
    ticket.rollNumber.toLowerCase().includes(generatedTicketsSearchTerm.toLowerCase())
  );
  // --- End: Generation Feature Logic ---


  // --- Start: Static Data & Management Logic ---
  const [managementSearchTerm, setManagementSearchTerm] = useState('');
  const staticHallTickets = [
    {
      id: '1',
      studentId: 'CS2021001',
      studentName: 'Alex Rodriguez',
      examId: '1',
      examTitle: 'Computer Networks',
      subject: 'CS301',
      date: '2025-03-18',
      time: '10:00 AM',
      venue: 'Hall A',
      seatNumber: 'A-15',
      qrCode: 'QR123456789',
      status: 'active'
    },
     {
      id: '2',
      studentId: 'CS2021002',
      studentName: 'Sarah Johnson',
      examId: '2',
      examTitle: 'Database Systems',
      subject: 'CS302',
      date: '2025-03-20',
      time: '2:00 PM',
      venue: 'Hall B',
      seatNumber: 'B-23',
      qrCode: 'QR987654321',
      status: 'active'
    },
    {
      id: '3',
      studentId: 'CS2021003',
      studentName: 'Michael Chen',
      examId: '3',
      examTitle: 'Software Engineering',
      subject: 'CS401',
      date: '2025-03-22',
      time: '9:00 AM',
      venue: 'Hall C',
      seatNumber: 'C-07',
      qrCode: 'QR456789123',
      status: 'active'
    },
    {
      id: '4',
      studentId: 'IT2021004',
      studentName: 'Emily Davis',
      examId: '7',
      examTitle: 'Web Technologies',
      subject: 'IT301',
      date: '2025-03-19',
      time: '3:00 PM',
      venue: 'Lab 1',
      seatNumber: 'L1-12',
      qrCode: 'QR789123456',
      status: 'active'
    },
    {
      id: '5',
      studentId: 'ECE2021005',
      studentName: 'David Wilson',
      examId: '9',
      examTitle: 'Digital Signal Processing',
      subject: 'ECE301',
      date: '2025-03-21',
      time: '2:00 PM',
      venue: 'Hall H',
      seatNumber: 'H-34',
      qrCode: 'QR321654987',
      status: 'active'
    },
    {
      id: '6',
      studentId: 'EEE2021006',
      studentName: 'Lisa Anderson',
      examId: '11',
      examTitle: 'Power Electronics',
      subject: 'EEE301',
      date: '2025-03-23',
      time: '10:00 AM',
      venue: 'Hall J',
      seatNumber: 'J-18',
      qrCode: 'QR654987321',
      status: 'used'
    },
    {
      id: '7',
      studentId: 'ME2021007',
      studentName: 'James Brown',
      examId: '13',
      examTitle: 'Thermodynamics',
      subject: 'ME301',
      date: '2025-03-27',
      time: '9:00 AM',
      venue: 'Hall L',
      seatNumber: 'L-45',
      qrCode: 'QR147258369',
      status: 'active'
    },
    {
      id: '8',
      studentId: 'CE2021008',
      studentName: 'Maria Garcia',
      examId: '15',
      examTitle: 'Structural Analysis',
      subject: 'CE301',
      date: '2025-03-29',
      time: '11:00 AM',
      venue: 'Hall N',
      seatNumber: 'N-22',
      qrCode: 'QR963852741',
      status: 'active'
    },
    {
      id: '9',
      studentId: 'CS2021009',
      studentName: 'Robert Taylor',
      examId: '4',
      examTitle: 'Data Structures and Algorithms',
      subject: 'CS201',
      date: '2025-03-15',
      time: '11:00 AM',
      venue: 'Hall D',
      seatNumber: 'D-67',
      qrCode: 'QR852741963',
      status: 'active'
    },
    {
      id: '10',
      studentId: 'IT2021010',
      studentName: 'Jennifer Martinez',
      examId: '8',
      examTitle: 'Mobile Application Development',
      subject: 'IT401',
      date: '2025-03-24',
      time: '9:30 AM',
      venue: 'Hall G',
      seatNumber: 'G-29',
      qrCode: 'QR741963852',
      status: 'cancelled'
    },
    {
      id: '11',
      studentId: 'ECE2021011',
      studentName: 'Kevin Lee',
      examId: '10',
      examTitle: 'VLSI Design',
      subject: 'ECE401',
      date: '2025-03-26',
      time: '11:00 AM',
      venue: 'Hall I',
      seatNumber: 'I-56',
      qrCode: 'QR369258147',
      status: 'active'
    },
    {
      id: '12',
      studentId: 'EEE2021012',
      studentName: 'Amanda White',
      examId: '12',
      examTitle: 'Control Systems',
      subject: 'EEE201',
      date: '2025-03-17',
      time: '1:00 PM',
      venue: 'Hall K',
      seatNumber: 'K-41',
      qrCode: 'QR258147369',
      status: 'active'
    },
    {
      id: '13',
      studentId: 'ME2021013',
      studentName: 'Christopher Harris',
      examId: '14',
      examTitle: 'Fluid Mechanics',
      subject: 'ME201',
      date: '2025-03-16',
      time: '2:00 PM',
      venue: 'Hall M',
      seatNumber: 'M-78',
      qrCode: 'QR147369258',
      status: 'active'
    },
    {
      id: '14',
      studentId: 'CE2021014',
      studentName: 'Ashley Clark',
      examId: '16',
      examTitle: 'Surveying',
      subject: 'CE201',
      date: '2025-03-20',
      time: '4:00 PM',
      venue: 'Hall O',
      seatNumber: 'O-33',
      qrCode: 'QR369147258',
      status: 'active'
    },
    {
      id: '15',
      studentId: 'MATH2021015',
      studentName: 'Matthew Lewis',
      examId: '17',
      examTitle: 'Engineering Mathematics III',
      subject: 'MATH301',
      date: '2025-03-18',
      time: '8:00 AM',
      venue: 'Hall P',
      seatNumber: 'P-91',
      qrCode: 'QR258369147',
      status: 'active'
    },
    {
      id: '16',
      studentId: 'PHY2021016',
      studentName: 'Jessica Walker',
      examId: '18',
      examTitle: 'Physics Laboratory',
      subject: 'PHY201',
      date: '2025-03-22',
      time: '2:00 PM',
      venue: 'Physics Lab',
      seatNumber: 'PL-05',
      qrCode: 'QR147258369',
      status: 'active'
    },
    {
      id: '17',
      studentId: 'CHEM2021017',
      studentName: 'Daniel Hall',
      examId: '19',
      examTitle: 'Chemistry Lab',
      subject: 'CHEM201',
      date: '2025-03-25',
      time: '10:00 AM',
      venue: 'Chemistry Lab',
      seatNumber: 'CL-14',
      qrCode: 'QR369258147',
      status: 'active'
    },
    {
      id: '18',
      studentId: 'ENG2021018',
      studentName: 'Sophia Young',
      examId: '20',
      examTitle: 'English Communication',
      subject: 'ENG101',
      date: '2025-03-21',
      time: '12:00 PM',
      venue: 'Hall Q',
      seatNumber: 'Q-87',
      qrCode: 'QR741852963',
      status: 'used'
    },
    {
      id: '19',
      studentId: 'CS2021019',
      studentName: 'Ryan King',
      examId: '5',
      examTitle: 'Operating Systems',
      subject: 'CS303',
      date: '2025-03-25',
      time: '1:00 PM',
      venue: 'Hall E',
      seatNumber: 'E-62',
      qrCode: 'QR852963741',
      status: 'active'
    },
    {
      id: '20',
      studentId: 'CS2021020',
      studentName: 'Olivia Wright',
      examId: '6',
      examTitle: 'Machine Learning',
      subject: 'CS501',
      date: '2025-03-28',
      time: '10:00 AM',
      venue: 'Hall F',
      seatNumber: 'F-38',
      qrCode: 'QR963741852',
      status: 'active'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const studentFilteredTickets = user?.role === 'student' 
    ? staticHallTickets.filter(ticket => ticket.studentName === user.name)
    : staticHallTickets;
    
  const managementFilteredTickets = staticHallTickets.filter(ticket =>
    ticket.studentName.toLowerCase().includes(managementSearchTerm.toLowerCase()) ||
    ticket.studentId.toLowerCase().includes(managementSearchTerm.toLowerCase())
  );
  // --- End: Static Data & Management Logic ---

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {user?.role === 'student' ? (
              // --- Unchanged Student View ---
              <>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">DSU Hall Tickets</h1>
                    <p className="text-gray-600 mt-2">Download your exam hall tickets</p>
                  </div>
                  <button className="btn-dsu-primary px-4 py-2 rounded-lg transition-colors flex items-center">
                    <Download className="w-5 h-5 mr-2" />
                    Download All
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studentFilteredTickets.map((ticket) => (
                    <div key={ticket.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                        <div className="flex items-center justify-between"><div><h3 className="font-semibold text-lg">{ticket.examTitle}</h3><p className="text-blue-100">{ticket.subject}</p></div><CreditCard className="w-8 h-8 text-blue-200" /></div>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center"><User className="w-5 h-5 text-gray-400 mr-3" /><div><p className="font-medium text-gray-900">{ticket.studentName}</p><p className="text-sm text-gray-500">{ticket.studentId}</p></div></div>
                          <div className="flex items-center"><Calendar className="w-5 h-5 text-gray-400 mr-3" /><div><p className="font-medium text-gray-900">{new Date(ticket.date).toLocaleDateString()}</p><p className="text-sm text-gray-500">Exam Date</p></div></div>
                          <div className="flex items-center"><Clock className="w-5 h-5 text-gray-400 mr-3" /><div><p className="font-medium text-gray-900">{ticket.time}</p><p className="text-sm text-gray-500">Start Time</p></div></div>
                          <div className="flex items-center"><MapPin className="w-5 h-5 text-gray-400 mr-3" /><div><p className="font-medium text-gray-900">{ticket.venue} - Seat {ticket.seatNumber}</p><p className="text-sm text-gray-500">Venue & Seat</p></div></div>
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200"><div className="flex items-center"><QrCode className="w-5 h-5 text-gray-400 mr-2" /><span className="text-sm text-gray-500">QR: {ticket.qrCode}</span></div><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>{ticket.status}</span></div>
                        </div>
                        <button 
                          onClick={() => handleDownloadTicket(ticket)}
                          className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                          <Download className="w-4 h-4 mr-2" />Download Hall Ticket
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              // --- Admin View with Generation Feature & Management Table ---
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">DSU Hall Ticket Dashboard</h1>
                    <p className="text-gray-600 mt-1">Generate new tickets or manage existing ones.</p>
                  </div>
                  <div className="flex space-x-2"><button onClick={handleQRDemo} className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"><QrCode className="h-4 w-4 mr-2" />QR Demo</button></div>
                </div>

                {/* Enhanced Generation Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Generate Hall Tickets</h2>
                  
                  {/* Filter Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                      <select 
                        value={selectedAcademicYear} 
                        onChange={(e) => setSelectedAcademicYear(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {academicYears.map(year => (
                          <option key={year.id} value={year.id}>
                            {year.label} {year.isCurrent ? '(Current)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                      <select 
                        value={selectedSemester} 
                        onChange={(e) => setSelectedSemester(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Semesters</option>
                        {semesters.map(semester => (
                          <option key={semester.id} value={semester.id}>
                            {semester.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <select 
                        value={selectedDepartment} 
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                      <select 
                        value={selectedClass} 
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Classes</option>
                        {classes.map(cls => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Exam Type Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                    <select 
                      value={selectedExamType} 
                      onChange={(e) => setSelectedExamType(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Exam Types</option>
                      {examTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Specific Exam Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Examination (Optional)</label>
                    <select 
                      value={selectedExam} 
                      onChange={(e) => setSelectedExam(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Applicable Exams</option>
                      {getFilteredExams().map(exam => (
                        <option key={exam.id} value={exam.id}>
                          {exam.courseCode} - {exam.courseName} ({getSemesterLabel(exam.semester)}) - {getExamTypeLabel(exam.examType)} - {new Date(exam.date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                  

                  {/* Student Selection Toggle */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="select-specific-students"
                          type="checkbox"
                          checked={showStudentSelection}
                          onChange={() => setShowStudentSelection(!showStudentSelection)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="select-specific-students" className="ml-2 block text-sm text-gray-700">
                          Select specific students
                        </label>
                      </div>
                      
                      {showStudentSelection && selectedStudents.length > 0 && (
                        <span className="text-sm text-blue-600 font-medium">
                          {selectedStudents.length} student(s) selected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Student Selection (Only shown when toggle is on) */}
                  {showStudentSelection && (
                    <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search Students</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input 
                            type="text" 
                            placeholder="Search by name or roll number..." 
                            value={studentSearchTerm} 
                            onChange={(e) => setStudentSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Student List</h4>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              const filteredStudents = getFilteredStudents().filter(student => 
                                student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                                student.rollNumber.toLowerCase().includes(studentSearchTerm.toLowerCase())
                              );
                              setSelectedStudents(filteredStudents.map(s => s.id));
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Select All Filtered
                          </button>
                          <button 
                            onClick={() => setSelectedStudents([])}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Clear Selection
                          </button>
                        </div>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg bg-white max-h-60 overflow-y-auto">
                        {/* Group by Class */}
                        {(() => {
                          // Get filtered students
                          const filteredStudents = getFilteredStudents().filter(student => 
                            student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                            student.rollNumber.toLowerCase().includes(studentSearchTerm.toLowerCase())
                          );
                          
                          // Group by class
                          const groupedByClass = filteredStudents.reduce((groups, student) => {
                            const classId = student.class || 'Unassigned';
                            if (!groups[classId]) {
                              groups[classId] = [];
                            }
                            groups[classId].push(student);
                            return groups;
                          }, {});
                          
                          if (filteredStudents.length === 0) {
                            return (
                              <div className="p-4 text-center text-gray-500">
                                No students match your search criteria
                              </div>
                            );
                          }
                          
                          return Object.entries(groupedByClass).map(([classId, classStudents]) => {
                            const classInfo = classes.find(c => c.id === classId) || { name: classId === 'Unassigned' ? 'Unassigned' : `Class ${classId}` };
                            
                            return (
                              <div key={classId} className="border-b border-gray-200 last:border-b-0">
                                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                                  <h5 className="text-xs font-medium text-gray-700">{classInfo.name} <span className="text-gray-500">({classStudents.length})</span></h5>
                                </div>
                                <div>
                                  {classStudents.map(student => (
                                    <div 
                                      key={student.id} 
                                      className="flex items-center px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                      onClick={() => {
                                        setSelectedStudents(prev => {
                                          if (prev.includes(student.id)) {
                                            return prev.filter(id => id !== student.id);
                                          } else {
                                            return [...prev, student.id];
                                          }
                                        });
                                      }}
                                    >
                                      <input 
                                        type="checkbox" 
                                        checked={selectedStudents.includes(student.id)} 
                                        onChange={() => {}} // Handled by the div click
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                                      />
                                      <div>
                                        <p className="text-sm font-medium text-gray-800">{student.name}</p>
                                        <p className="text-xs text-gray-500">{student.rollNumber} | {student.department} | Semester {student.semester}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Exam Details Display */}
                  {selectedExam && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      {(() => {
                        const exam = exams.find(e => e.id === selectedExam);
                        if (!exam) return null;
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <span className="text-sm font-medium text-blue-800">Course:</span>
                              <p className="text-blue-900">{exam.courseCode} - {exam.courseName}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-blue-800">Semester:</span>
                              <p className="text-blue-900">{getSemesterLabel(exam.semester)}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-blue-800">Exam Type:</span>
                              <p className="text-blue-900">{getExamTypeLabel(exam.examType)}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-blue-800">Date & Time:</span>
                              <p className="text-blue-900">{new Date(exam.date).toLocaleDateString()} at {exam.startTime}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-blue-800">Duration:</span>
                              <p className="text-blue-900">{exam.duration}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-blue-800">Venue:</span>
                              <p className="text-blue-900">{exam.venue}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-blue-800">Max Marks:</span>
                              <p className="text-blue-900">{exam.maxMarks}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-blue-800">Passing Marks:</span>
                              <p className="text-blue-900">{exam.passingMarks}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-blue-800">Eligible Students:</span>
                              <p className="text-blue-900">{getFilteredStudents().length}</p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Generate Button */}
                  <div className="flex justify-center">
                    <button 
                      onClick={handleGenerateTickets} 
                      disabled={!qrCodeLibLoaded || isGenerating} 
                      className="inline-flex items-center px-8 py-3 btn-dsu-primary text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      {isGenerating ? 'Generating...' : qrCodeLibLoaded ? 'Generate Hall Tickets' : 'Loading...'}
                    </button>
                  </div>

                  {showSuccessMessage && (
                    <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                      ✅ Successfully generated {generatedTickets.length} hall tickets!
                    </div>
                  )}
                </div>

                {showQRDemo && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">QR Code Verification Demo</h3>
                      <div className="text-center">
                        {qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-4" /> : <p>Generating QR Code...</p>}
                        <p className="text-sm text-gray-600 mb-4">This QR code contains encrypted student and exam information for secure verification.</p>
                        <div className="bg-gray-50 p-3 rounded-lg text-left text-xs text-gray-700 mb-4"><strong>QR Data Includes:</strong><br/>• Exam ID & Student ID<br/>• Roll Number & Seat Assignment<br/>• Timestamp & Security Hash</div>
                        <button onClick={() => setShowQRDemo(false)} className="w-full btn-dsu-primary py-2 rounded-lg">Close Demo</button>
                      </div>
                    </div>
                  </div>
                )}

                {generatedTickets.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Generated Hall Tickets</h2>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={handleDownloadAllTickets}
                          className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Download className="h-4 w-4 mr-2" />Download All
                        </button>
                        <button 
                          onClick={handleDownloadAllTickets}
                          className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Printer className="h-4 w-4 mr-2" />Print All
                        </button>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /><input type="text" placeholder="Search by name or roll number..." value={generatedTicketsSearchTerm} onChange={(e) => setGeneratedTicketsSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {generationFilteredTickets.slice(0, ticketsToShow).map((ticket) => (
                        <div key={`${ticket.examId}-${ticket.studentId}`} className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border-2 border-dashed border-blue-300">
                          <div className="flex items-start justify-between mb-4">
                            <div><h3 className="font-bold text-blue-900">HALL TICKET</h3><p className="text-xs text-blue-700">Boult Next Technology</p></div>
                            {ticket.qrCode && (<img src={ticket.qrCode} alt="QR Code" className="w-16 h-16" />)}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div><span className="font-semibold text-gray-700">Name:</span><p className="text-gray-900">{ticket.name}</p></div>
                            <div><span className="font-semibold text-gray-700">Roll No:</span><p className="text-gray-900">{ticket.rollNumber}</p></div>
                            <div><span className="font-semibold text-gray-700">Batch:</span><p className="text-gray-900">{ticket.batch}</p></div>
                            <div><span className="font-semibold text-gray-700">Course:</span><p className="text-gray-900">{ticket.courseCode} - {ticket.courseName}</p></div>
                            <div><span className="font-semibold text-gray-700">Semester:</span><p className="text-gray-900">{getSemesterLabel(ticket.semester)}</p></div>
                            <div><span className="font-semibold text-gray-700">Exam Type:</span><p className="text-gray-900">{getExamTypeLabel(ticket.examType)}</p></div>
                            <div className="grid grid-cols-2 gap-2"><div><span className="font-semibold text-gray-700">Date:</span><p className="text-gray-900 text-xs">{ticket.date}</p></div><div><span className="font-semibold text-gray-700">Time:</span><p className="text-gray-900 text-xs">{ticket.time}</p></div></div>
                            <div className="grid grid-cols-2 gap-2"><div><span className="font-semibold text-gray-700">Duration:</span><p className="text-gray-900 text-xs">{ticket.duration}</p></div><div><span className="font-semibold text-gray-700">Venue:</span><p className="text-gray-900 text-xs">{ticket.venue}</p></div></div>
                            <div className="grid grid-cols-2 gap-2"><div><span className="font-semibold text-gray-700">Seat:</span><p className="text-gray-900 text-xs font-bold">{ticket.seatNumber}</p></div><div><span className="font-semibold text-gray-700">Max Marks:</span><p className="text-gray-900 text-xs">{ticket.maxMarks}</p></div></div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-blue-200">
                            <div className="flex justify-between items-center">
                              <button 
                                onClick={() => handleDownloadTicket(ticket)}
                                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <Download className="h-3 w-3 inline mr-1" />Download
                              </button>
                              <button 
                                onClick={() => handleDownloadTicket(ticket)}
                                className="text-xs text-purple-600 hover:text-purple-800 transition-colors"
                              >
                                <Printer className="h-3 w-3 inline mr-1" />Print
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {generationFilteredTickets.length > ticketsToShow && (
                      <div className="text-center mt-4">
                        <p className="text-gray-600">Showing {ticketsToShow} of {generationFilteredTickets.length} tickets</p>
                        <button 
                          onClick={() => setTicketsToShow(prev => Math.min(prev + 9, generationFilteredTickets.length))}
                          className="mt-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          Load More
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Management Table Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Hall Tickets Management</h2>
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search students..."
                              value={managementSearchTerm}
                              onChange={(e) => setManagementSearchTerm(e.target.value)}
                              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue & Seat</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {managementFilteredTickets.map((ticket) => (
                            <tr key={ticket.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{ticket.studentName}</div>
                                  <div className="text-sm text-gray-500">{ticket.studentId}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{ticket.examTitle}</div>
                                  <div className="text-sm text-gray-500">{ticket.subject}</div>
                                  <div className="text-sm text-gray-500">{new Date(ticket.date).toLocaleDateString()} at {ticket.time}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{ticket.venue}</div>
                                <div className="text-sm text-gray-500">Seat: {ticket.seatNumber}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                  {ticket.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button className="text-blue-600 hover:text-blue-900 mr-4"><Download className="w-4 h-4" /></button>
                                <button className="text-gray-600 hover:text-gray-900"><QrCode className="w-4 h-4" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
export default HallTickets;