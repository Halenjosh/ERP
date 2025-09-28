import React, { useContext, useState, useMemo, useEffect, useRef } from "react";
import { AuthContext } from "../../App";
import Sidebar from "../layout/Sidebar";
import Header from "../layout/Header";
import { useData } from "../../contexts/DataContext.jsx";
import {
  Award,
  Download,
  Eye,
  Lock,
  Unlock,
  Search,
  CheckSquare,
  Square,
  Printer,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToaster } from "../../contexts/ToastContext.jsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import QRCode from 'qrcode';

const UNIVERSITY_LOGO = 
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/OOjs_UI_icon_academic.svg/1200px-OOjs_UI_icon_academic.svg.png"; // Replace with your logo URL

// Add watermark function
const addWatermark = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(80);
    doc.setTextColor(240, 240, 240);
    doc.text('OFFICIAL', 105, 150, { angle: 45, align: 'center' });
    doc.text('DOCUMENT', 105, 200, { angle: 45, align: 'center' });
    doc.setTextColor(0, 0, 0);
  }
};

const ResultProcessing = () => {
  const { user, sidebarVisible } = useContext(AuthContext);
  const toaster = useToaster();
  const { departments, selectedDepartment: globalDepartment, semesters } = useData();
  const [selectedSemester, setSelectedSemester] = useState("6");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResults, setSelectedResults] = useState([]);
  const [results, setResults] = useState([]);
  const [deptFilter, setDeptFilter] = useState(globalDepartment || "");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [previewStudent, setPreviewStudent] = useState(null);
  const printRef = useRef(null);

  useEffect(() => {
    const storedResults = localStorage.getItem("resultsData");
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    } else {
      const defaultResults = [
        {
          id: "1",
          studentId: "CS2021001",
          studentName: "Alex Rodriguez",
          semester: 6,
          department: "CS",
          subjects: [
            { name: "Computer Networks", marks: 85, grade: "A" },
            { name: "Database Systems", marks: 92, grade: "A+" },
            { name: "Software Engineering", marks: 78, grade: "B+" },
            { name: "Operating Systems", marks: 88, grade: "A" },
          ],
          gpa: 8.7,
          cgpa: 8.5,
          status: "published",
        },
        {
          id: "2",
          studentId: "CS2021002",
          studentName: "Sarah Johnson",
          semester: 6,
          department: "CS",
          subjects: [
            { name: "Computer Networks", marks: 92, grade: "A+" },
            { name: "Database Systems", marks: 89, grade: "A" },
            { name: "Software Engineering", marks: 94, grade: "A+" },
            { name: "Operating Systems", marks: 91, grade: "A+" },
          ],
          gpa: 9.2,
          cgpa: 9.0,
          status: "published",
        },
        {
          id: "3",
          studentId: "CS2021003",
          studentName: "Michael Chen",
          semester: 6,
          department: "CS",
          subjects: [
            { name: "Computer Networks", marks: 76, grade: "B+" },
            { name: "Database Systems", marks: 82, grade: "A" },
            { name: "Software Engineering", marks: 79, grade: "B+" },
            { name: "Operating Systems", marks: 85, grade: "A" },
          ],
          gpa: 8.1,
          cgpa: 7.9,
          status: "draft",
        },
      ];
      setResults(defaultResults);
      localStorage.setItem("resultsData", JSON.stringify(defaultResults));
    }
  }, []);

  // Keep local department filter in sync with global selection
  useEffect(() => {
    setDeptFilter(globalDepartment || "");
  }, [globalDepartment]);

  

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "published":
        return "bg-green-100 text-green-800";
      case "certified":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      const semOk = r.semester.toString() === selectedSemester;
      const queryOk = r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || r.studentId.toLowerCase().includes(searchQuery.toLowerCase());
      const deptOk = !deptFilter || !r.department || r.department === deptFilter;
      return semOk && queryOk && deptOk;
    });
  }, [results, selectedSemester, searchQuery, deptFilter]);

  const toggleSelect = (id) => {
    setSelectedResults((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleStatusUpdate = (id, newStatus) => {
    const updatedResults = results.map((r) =>
      r.id === id ? { ...r, status: newStatus } : r
    );
    setResults(updatedResults);
    localStorage.setItem("resultsData", JSON.stringify(updatedResults));
    toaster.success(`Status updated to ${newStatus}`);
  };

  const handlePublish = () => {
    const updatedResults = results.map((r) =>
      r.semester.toString() === selectedSemester
        ? { ...r, status: "published" }
        : r
    );
    setResults(updatedResults);
    localStorage.setItem("resultsData", JSON.stringify(updatedResults));
    toaster.success("All results published!");
    setShowConfirmModal(false);
  };

  const generateTranscriptPDF = async (student) => {
    const doc = new jsPDF();
    
    // Add header with logo and title
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 0, 220, 30, 'F');
    try {
      doc.addImage(UNIVERSITY_LOGO, "PNG", 15, 5, 20, 20);
    } catch (e) {
      // Logo failed to load; continue without it
      toaster.info("Logo unavailable; generating transcript without header image.");
    }
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text("UNIVERSITY OF TECHNOLOGY", 105, 15, { align: "center" });
    doc.setFontSize(14);
    doc.text("OFFICIAL ACADEMIC TRANSCRIPT", 105, 22, { align: "center" });
    
    // Student Information Section
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text("STUDENT INFORMATION", 20, 40);
    doc.setFont(undefined, 'normal');
    
    const studentInfo = [
      { label: "Full Name", value: student.studentName },
      { label: "Student ID", value: student.studentId },
      { label: "Program", value: "Bachelor of Technology (Computer Science)" },
      { label: "Semester", value: `Semester ${student.semester}` },
      { label: "Academic Year", value: "2024-2025" },
      { label: "Date of Issue", value: new Date().toLocaleDateString() },
    ];
    
    studentInfo.forEach((info, index) => {
      doc.text(`${info.label}:`, 30, 50 + (index * 5));
      doc.text(info.value, 60, 50 + (index * 5));
    });
    
    // Academic Performance
    doc.setFont(undefined, 'bold');
    doc.text("ACADEMIC PERFORMANCE", 20, 85);
    
    // Subjects Table
    const tableData = student.subjects.map((s) => [
      s.name,
      s.credits || "3", // Default to 3 credits if not specified
      s.marks,
      s.grade,
      getGradePoints(s.grade),
    ]);
    
    doc.autoTable({
      startY: 95,
      head: [["Subject", "Credits", "Marks", "Grade", "Grade Points"]],
      body: tableData,
      headStyles: { fillColor: [41, 128, 185] },
      theme: 'grid',
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 30 }
      },
    });
    
    // Summary Section
    const summaryY = doc.autoTable.previous.finalY + 10;
    doc.setFont(undefined, 'bold');
    doc.text("PERFORMANCE SUMMARY", 20, summaryY);
    doc.setFont(undefined, 'normal');
    
    doc.text(`Semester GPA: ${student.gpa}`, 30, summaryY + 10);
    doc.text(`Cumulative GPA (CGPA): ${student.cgpa}`, 30, summaryY + 15);
    doc.text(`Total Credits Earned: ${student.subjects.length * 3}`, 30, summaryY + 20);
    
    // Generate QR Code
    const verificationUrl = `https://university-verify.example.com/verify?studentId=${student.studentId}&semester=${student.semester}`;
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
      // Add QR Code and Verification Info
      doc.addImage(qrCodeDataUrl, 'PNG', 150, summaryY, 30, 30);
      doc.setFontSize(8);
      doc.text("Scan to verify authenticity", 150, summaryY + 35);
    } catch (e) {
      toaster.error("Could not generate QR code. Proceeding without QR.");
    }
    
    // Add footer
    const footerY = summaryY + 50;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, footerY, 190, footerY);
    doc.setFontSize(8);
    doc.text("This is an electronically generated document. No signature is required.", 105, footerY + 5, { align: "center" });
    doc.text("©️ 2024 University of Technology. All rights reserved.", 105, footerY + 10, { align: "center" });
    
    // Add watermarks
    addWatermark(doc);
    
    // Save the PDF
    doc.save(`${student.studentName}_Sem${student.semester}_Transcript_${new Date().toISOString().split('T')[0]}.pdf`);
    toaster.success(`Transcript downloaded for ${student.studentName}`);
  };
  
  // Helper function to convert grade to grade points
  const getGradePoints = (grade) => {
    const gradeMap = {
      'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D': 4, 'F': 0
    };
    return gradeMap[grade] || 'N/A';
  };
  
  // Function to download multiple results as a single PDF
  const downloadMultipleTranscripts = async (selectedIds) => {
    const selectedStudents = results.filter(r => selectedIds.includes(r.id));
    if (selectedStudents.length === 0) {
      toaster.error("No students selected");
      return;
    }
    
    const doc = new jsPDF();
    
    for (let i = 0; i < selectedStudents.length; i++) {
      const student = selectedStudents[i];
      
      if (i > 0) doc.addPage();
      
      // Add student's transcript to the PDF
      await generateTranscriptPDF(student, false);
    }
    
    // Save the combined PDF
    doc.save(`Batch_Transcripts_${new Date().toISOString().split('T')[0]}.pdf`);
    toaster.success(`Downloaded ${selectedStudents.length} transcripts`);
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open("", "_blank");
    const currentDate = new Date().toLocaleDateString();
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Transcript - ${previewStudent.studentName}</title>
          <style>
            @page { size: A4; margin: 1cm; }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 20px;
              color: #333;
              position: relative;
              background-color: #fff;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #eee;
            }
            .header img {
              height: 80px;
              margin-bottom: 10px;
            }
            .header h1 {
              margin: 5px 0;
              font-size: 18px;
              color: #2c3e50;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .header h2 {
              margin: 0;
              font-size: 16px;
              color: #7f8c8d;
              font-weight: normal;
            }
            .student-info {
              margin: 20px 0;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 5px;
              border-left: 4px solid #3498db;
            }
            .student-info p {
              margin: 5px 0;
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 13px;
            }
            th {
              background-color: #3498db;
              color: white;
              padding: 10px;
              text-align: left;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #ddd;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .summary {
              margin: 20px 0;
              padding: 15px;
              background: #f1f8ff;
              border-radius: 5px;
              border-left: 4px solid #3498db;
            }
            .summary h3 {
              margin-top: 0;
              color: #2c3e50;
              font-size: 15px;
            }
            .verification {
              position: absolute;
              bottom: 20px;
              right: 20px;
              text-align: right;
              font-size: 11px;
              color: #7f8c8d;
            }
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 80px;
              opacity: 0.05;
              z-index: -1;
              white-space: nowrap;
              font-weight: bold;
              color: #999;
              pointer-events: none;
            }
            .footer {
              margin-top: 30px;
              padding-top: 10px;
              border-top: 1px solid #eee;
              font-size: 11px;
              color: #7f8c8d;
              text-align: center;
            }
            .signature {
              float: right;
              margin-top: 30px;
              text-align: center;
            }
            .signature-line {
              width: 200px;
              border-top: 1px solid #333;
              margin: 0 auto;
              padding-top: 5px;
            }
          </style>
        </head>
        <body>
          <img src="${UNIVERSITY_LOGO}" class="watermark" />
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">DSU Result Processing</h1>
                <p className="text-sm text-gray-600">Manage and process student results for each semester</p>
              </div>
              <div className="flex space-x-4">
                <select
                  className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                >
                  <option value="">All Semesters</option>
                  {semesters.map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
                
                {selectedResults.length > 0 && (
                  <button
                    onClick={() => downloadMultipleTranscripts(selectedResults)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Selected ({selectedResults.length})
                  </button>
                )}
                
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Publish All
                </button>
              </div>
            </div>
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                >
                  {semesters.map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
                <span className="px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200" title="Current Semester">
                  Sem: {selectedSemester}
                </span>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                  title="Department"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 w-10"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredResults.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <button onClick={() => toggleSelect(r.id)}>
                          {selectedResults.includes(r.id) ? (
                            <CheckSquare className="text-blue-600" />
                          ) : (
                            <Square className="text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium">{r.studentName}</p>
                        <p className="text-gray-500 text-sm">{r.studentId}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-blue-600 font-bold">
                          GPA: {r.gpa}
                        </span>{" "}
                        |{" "}
                        <span className="text-green-600 font-bold">
                          CGPA: {r.cgpa}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            r.status
                          )}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => setPreviewStudent(r)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => generateTranscriptPDF(r)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {r.status === "draft" && (
                          <button
                            onClick={() => handleStatusUpdate(r.id, "published")}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Transcript Preview */}
            {previewStudent && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="bg-white p-6 rounded-xl shadow-xl max-w-lg w-full">
                  <div ref={printRef}>
                    <img src={UNIVERSITY_LOGO} alt="University Logo" className="logo w-20 mx-auto mb-3" />
                    <h1 className="text-2xl font-bold text-center mb-4">
                      University Transcript
                    </h1>
                    <p className="text-gray-700">
                      <strong>Name:</strong> {previewStudent.studentName}
                    </p>
                    <p className="text-gray-700">
                      <strong>ID:</strong> {previewStudent.studentId}
                    </p>
                    <p className="text-gray-700 mb-3">
                      <strong>Semester:</strong> {previewStudent.semester}
                    </p>
                    <table className="w-full border mb-4">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2 text-left">Subject</th>
                          <th className="p-2 text-left">Marks</th>
                          <th className="p-2 text-left">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewStudent.subjects.map((sub, i) => (
                          <tr key={i} className="border-t">
                            <td className="p-2">{sub.name}</td>
                            <td className="p-2">{sub.marks}</td>
                            <td className="p-2">{sub.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-blue-600">
                      <strong>GPA:</strong> {previewStudent.gpa}
                    </p>
                    <p className="text-green-600 mb-4">
                      <strong>CGPA:</strong> {previewStudent.cgpa}
                    </p>
                    <div className="footer">
                      <strong>Controller of Examinations</strong>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={() => setPreviewStudent(null)}
                      className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                    >
                      Close
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
                    >
                      <Printer className="w-4 h-4 mr-2" /> Print
                    </button>
                    <button
                      onClick={() => generateTranscriptPDF(previewStudent)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Download PDF
                    </button>
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

export default ResultProcessing;