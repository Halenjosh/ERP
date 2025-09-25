/**
 * Global JSDoc typedefs for the app (JS equivalent of former TypeScript interfaces).
 * These provide IntelliSense/documentation in editors without TypeScript.
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} username
 * @property {string} name
 * @property {'coe'|'assistant_coe'|'faculty'|'student'|'dept_coordinator'} role
 * @property {string} [department]
 * @property {string} email
 * @property {string} [avatar]
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User|null} user
 * @property {(user: User) => void} login
 * @property {() => void} logout
 */

/**
 * @typedef {Object} Exam
 * @property {string} id
 * @property {string} title
 * @property {string} subject
 * @property {string} date
 * @property {string} time
 * @property {number} duration
 * @property {'midterm'|'final'|'retest'} type
 * @property {string} venue
 * @property {string} department
 * @property {number} semester
 * @property {'scheduled'|'ongoing'|'completed'|'cancelled'} status
 */

/**
 * @typedef {Object} HallTicket
 * @property {string} id
 * @property {string} studentId
 * @property {string} studentName
 * @property {string} examId
 * @property {string} examTitle
 * @property {string} date
 * @property {string} time
 * @property {string} venue
 * @property {string} seatNumber
 * @property {string} qrCode
 * @property {'active'|'used'|'cancelled'} status
 */

/**
 * @typedef {Object} Question
 * @property {string} id
 * @property {string} question
 * @property {'mcq'|'short'|'long'|'practical'} type
 * @property {string} subject
 * @property {'easy'|'medium'|'hard'} difficulty
 * @property {number} marks
 * @property {string[]} [options]
 * @property {string} [answer]
 * @property {string} createdBy
 * @property {string} createdAt
 */

/**
 * @typedef {Object} StudentMark
 * @property {string} id
 * @property {string} studentId
 * @property {string} studentName
 * @property {string} examId
 * @property {string} subject
 * @property {number} marksObtained
 * @property {number} totalMarks
 * @property {string} grade
 * @property {'pending'|'submitted'|'verified'|'published'} status
 * @property {string} evaluatedBy
 */

/**
 * @typedef {Object} Result
 * @property {string} id
 * @property {string} studentId
 * @property {string} studentName
 * @property {number} semester
 * @property {{name: string; marks: number; grade: string}[]} subjects
 * @property {number} gpa
 * @property {number} cgpa
 * @property {'draft'|'published'|'certified'} status
 */

// This file intentionally has no runtime exports. It exists for editor tooling.


