# DSU CoE ERP

A Vite + React application branded for Dhanalakshmi Srinivasan University (DSU) to manage examination workflows: scheduling, hall tickets, question bank, mark entry, analytics, and result processing.

## Quick Start

- Node 18+
- Install and run:

```bash
npm install
npm run dev
```

Open http://localhost:5173 and you will be taken to the DSU Login page. If you select "Remember me", your session is restored on subsequent visits.

Place your crest image at `public/crest.png` for local, reliable branding. A remote fallback is used if missing.

## Project Structure

- `src/App.jsx`: App routes and `AuthContext` provider
- `src/main.jsx`: App bootstrap; wraps app with `ToasterProvider` and `DataProvider`
- `src/contexts/DataContext.jsx`: Single source of truth for exams/students with helpers and localStorage persistence
- `src/contexts/ToastContext.jsx`: Lightweight toast system with `ToasterProvider` and `useToaster()`
- `src/components/`
  - `exam/ExamScheduling.jsx`: Schedule and manage exams; persists to DataContext/localStorage
  - `exam/HallTickets.jsx`: Generate and print student hall tickets
  - `exam/QuestionBank.jsx`: Typed template paper generator; persistent papers
  - `evaluation/MarkEntry.jsx`: Class-wise mark entry, CSV import/export, publish
  - `results/ResultProcessing.jsx`: Manage results and generate PDF transcripts
  - `layout/Header.jsx`, `layout/Sidebar.jsx`: App chrome

## DSU Branding

- Title, favicon, and meta description are set in `index.html`.
- Header and Login pages include the DSU crest and copy.
- Page headings across modules are prefixed with "DSU" (e.g., `DSU Exam Scheduling`).
- Colors: A small DSU theme is defined in `src/index.css`.
  - Utility classes:
    - `.btn-dsu-primary` for primary buttons (Sky blue)
    - `.badge-dsu-primary` for accent badges
  - We use Tailwind CSS; the editor may show warnings for `@tailwind` and `@apply`, which are expected and safe in the Tailwind build pipeline.

### Crest

- Local: `public/crest.png` is preferred by `index.html`, `Header.jsx`, and `Login.jsx`.
- Fallback: If the local file is missing, components automatically load the provided remote crest URL.

## Contexts

### AuthContext (in `src/App.jsx`)
Holds `user`, `login`, `logout`, `sidebarVisible`, `toggleSidebar`. Wraps the Router.

### DataContext (in `src/contexts/DataContext.jsx`)
Single source of truth for app data. Exposes:

- `useData()`
- `exams`, `students`, `hallTickets`
- `setExams`, `setStudents`, `setHallTickets`
- Helpers: `getExamsBySemester`, `getStudentsBySemester`, `generateHallTickets`
- `departments` master list
- `examTypes` and `getExamTypeLabel()` for uniform exam labeling

Persistence:

- Exams persisted to `localStorage` key `exam_scheduling_v1_aligned` in a normalized shape that works for both `ExamScheduling` and `HallTickets`.

Normalization bridges fields between modules:

- `subject` ⇄ `courseCode`
- `time` ⇄ `startTime`
- `type` ⇄ `examType`

### ToastContext (in `src/contexts/ToastContext.jsx`)
Provides app-wide non-blocking notifications.

- Wrap with `<ToasterProvider>` (already done in `src/main.jsx`)
- Consume with `const toaster = useToaster()` and call `toaster.success|error|info(text)`
- Styled with icons, close button, transitions

## Key Modules

### ExamScheduling (`src/components/exam/ExamScheduling.jsx`)
- Uses `useData()` for shared exams
- Validates Title/Subject/Date/Time, Department (from context), and Semester (1–10)
- Toaster-based validation

### HallTickets (`src/components/exam/HallTickets.jsx`)
- Generates tickets for filtered students and matching exams
- QR generation via CDN (`qrcode`) already handled by ResultProcessing; HallTickets loads QR via `<script>` tag
- Toaster-based validation and success feedback
 - DSU-branded headings for student and admin views

### QuestionBank (`src/components/exam/QuestionBank.jsx`)
- Typed template rows: fills manual slots first, then pool-by-type, then placeholders
- Papers persisted to `localStorage` key `question_papers_v1`
- Uses departments from DataContext

### MarkEntry (`src/components/evaluation/MarkEntry.jsx`)
- Inline edit, bulk edit, add/delete rows
- CSV import/export:
  - Export uses Papa if available on `window`, else uses a tiny CSV fallback
  - Import dynamically loads PapaParse via CDN at runtime to avoid bundling issues
- Optimistic save and publish stubs; clamped marks; banner + toaster feedback
 - DSU-branded heading and theme-ready primary buttons

### ResultProcessing (`src/components/results/ResultProcessing.jsx`)
- Manage results with status updates and publish-all
- PDF transcripts using `jspdf` + `jspdf-autotable`
- QR codes using `qrcode`
- Hardened against image/QR load failures; continues generation and shows a toast
- Layout aligned with shared app style
 - Heading branded as DSU Result Processing

## Dependencies

Runtime libs used in modules:

- `jspdf` and `jspdf-autotable` for transcripts (PDF)
- `qrcode` for QR generation
- `lucide-react` for icons
- `framer-motion` (present; optional usage for animations)

CSV parsing:

- `MarkEntry` loads PapaParse from CDN when importing CSV; export works even without Papa thanks to a tiny fallback
- If you prefer a local dependency, install and import:

```bash
npm install papaparse
```

Then replace the dynamic loader with `import Papa from 'papaparse'` in `MarkEntry.jsx`

## Notes & Conventions

- Departments are IDs like `CS`, `IT`, etc., provided by `DataContext`
- Prefer semesters as strings (e.g., `'6'`) for consistency across components
- All blocking alerts replaced by toasts; long-lived contextual messages remain inline where helpful (e.g., MarkEntry banner)
- Session restore is only enabled when "Remember me" is selected on Login; otherwise the app starts at the Login page.

## Demo Accounts

- CoE: `coe` / `coe123`
- Assistant CoE: `acoe` / `acoe123`
- Faculty: `faculty` / `faculty123`
- Student: `student` / `student123`
- Department Coordinator: `coord` / `coord123`

These are for demonstration only and are handled in `Login.jsx`.

## Scripts

- `npm run dev` – Start Vite dev server
- `npm run build` – Build for production
- `npm run preview` – Preview production build

## Troubleshooting

- Vite overlay import errors usually indicate missing packages:
  - Install: `jspdf`, `jspdf-autotable`, `qrcode`, `framer-motion`
  - For CSV import: ensure network allows CDN (jsDelivr) or install `papaparse`
- If PDFs miss logo/QR, generation continues and a toast explains what failed

## Next Ideas

- Global department filter in `Header` syncing to `DataContext`
- Expose `semesters` master list from `DataContext`
- Replace inline banners with toasts where appropriate, or vice-versa depending on UX preference
# exam-cell
