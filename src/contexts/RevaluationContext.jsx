import React, { createContext, useContext, useMemo, useState } from 'react';

const RevaluationContext = createContext(null);

export const useRevaluation = () => {
  const ctx = useContext(RevaluationContext);
  if (!ctx) throw new Error('useRevaluation must be used within a RevaluationProvider');
  return ctx;
};

// Minimal in-memory stores (can be swapped with API/json-server later)
export const RevaluationProvider = ({ children }) => {
  // id generator available before seeding
  const genId = (p) => `${p}-${Date.now()}-${Math.floor(Math.random()*1000)}`;

  // Seed some demo data so student pages show meaningful content immediately
  const seedData = (() => {
    try {
      const now = new Date().toISOString();
      const appId = genId('REVAPP');
      const itemsRaw = [
        { subjectId: 'CS601', oldMarks: 42, newMarks: 55, remarks: 'Increased after recheck' },
        { subjectId: 'CS602', oldMarks: 68, newMarks: 68, remarks: 'No change' },
        { subjectId: 'CS603', oldMarks: 75, newMarks: null, remarks: '' },
      ];
      const items = itemsRaw.map(it => ({ id: genId('REVAPP_ITEM'), appId: appId, ...it }));
      const app = {
        id: appId,
        studentId: 'STU-001',
        examId: 'EXAM-6',
        subjectIds: itemsRaw.map(i => i.subjectId),
        items,
        status: 'Published',
        submittedAt: now,
        publishedAt: now,
        feeAmount: items.length * 500,
        paymentStatus: 'Paid',
        paymentRef: 'TXN-DEMO',
        reasonText: 'Demo seeded application',
        rejectionReason: ''
      };
      const timelines = [
        { id: genId('REVTIM'), applicationId: appId, label: 'Submitted', note: 'Application submitted', createdAt: now, actorRole: 'student' },
        { id: genId('REVTIM'), applicationId: appId, label: 'Payment Verified', note: 'Ref: TXN-DEMO', createdAt: now, actorRole: 'finance' },
        { id: genId('REVTIM'), applicationId: appId, label: 'Revaluated', note: 'Examiner submitted final marks', createdAt: now, actorRole: 'examiner' },
        { id: genId('REVTIM'), applicationId: appId, label: 'Published', note: 'Results published', createdAt: now, actorRole: 'system' },
      ];
      return { applications: [app], timelines };
    } catch {
      return { applications: [], timelines: [] };
    }
  })();

  const [applications, setApplications] = useState(seedData.applications); // reval_applications
  const [assignments, setAssignments] = useState([]);   // reval_assignments
  const [timelines, setTimelines] = useState(seedData.timelines);       // reval_timelines
  const [feesRules, setFeesRules] = useState([          // reval_fees_rules (seed one)
    { id: 'FR-CS-6', program: 'BTech-CS', semester: '6', perSubjectFee: 500, lateFee: 100, lastDate: '2025-03-31' },
  ]);
  const [files, setFiles] = useState([]);               // files

  const getFeesRule = ({ program, semester }) => {
    return feesRules.find(r => r.program === program && String(r.semester) === String(semester)) || null;
  };

  const listApplications = ({ studentId } = {}) => {
    if (!studentId) return applications;
    return applications.filter(a => a.studentId === studentId);
  };

  const applyRevaluation = ({ studentId, examId, subjectIds = [], oldMarksBySubject = {}, reasonText = '', feeAmount = 0, paymentStatus = 'Unpaid', paymentRef = '' }) => {
    const id = genId('REVAPP');
    const now = new Date().toISOString();
    const created = subjectIds.map((subId) => ({
      id: genId('REVAPP_ITEM'),
      appId: id,
      subjectId: subId,
      oldMarks: oldMarksBySubject[subId] ?? null,
      newMarks: null,
      resultChange: 'NO_CHANGE'
    }));

    const app = {
      id,
      studentId,
      examId,
      subjectIds,
      items: created,
      status: 'Submitted',
      submittedAt: now,
      publishedAt: null,
      feeAmount,
      paymentStatus,
      paymentRef,
      reasonText,
      rejectionReason: ''
    };
    setApplications(prev => [...prev, app]);
    setTimelines(prev => [...prev, { id: genId('REVTIM'), applicationId: id, label: 'Submitted', note: 'Application submitted', createdAt: now, actorRole: 'student' }]);
    return app;
  };

  const isPaymentVerified = (app) => (app?.paymentStatus === 'Paid');
  const guardedStatuses = new Set(['Under Review','Awaiting Examiner','Revaluated','QA/Second Check','Result Approved','Published','Closed']);
  const canProcessStatus = (nextStatus) => !guardedStatuses.has(nextStatus);

  const updateApplicationStatus = (id, patch) => {
    setApplications(prev => {
      const apps = prev.map(a => {
        if (a.id !== id) return a;
        // if trying to move into a processing status without payment, block
        if (patch?.status && guardedStatuses.has(patch.status) && !isPaymentVerified(a)) {
          // log timeline that transition failed
          const note = `Blocked moving to '${patch.status}' — payment not verified`;
          const createdAt = new Date().toISOString();
          setTimelines((tPrev) => [...tPrev, { id: genId('REVTIM'), applicationId: id, label: 'Transition Blocked', note, createdAt, actorRole: 'system' }]);
          return a; // do not change
        }
        return { ...a, ...patch };
      });
      return apps;
    });
  };

  const addTimeline = ({ applicationId, label, note = '', actorRole = 'system' }) => {
    const id = genId('REVTIM');
    const createdAt = new Date().toISOString();
    setTimelines(prev => [...prev, { id, applicationId, label, note, createdAt, actorRole }]);
  };

  const addFile = ({ applicationId, kind = 'receipt', url }) => {
    const id = genId('REVFILE');
    const createdAt = new Date().toISOString();
    setFiles(prev => [...prev, { id, applicationId, kind, url, createdAt }]);
    return { id, applicationId, kind, url };
  };

  const markPaymentVerified = (applicationId, paymentRef = '') => {
    const now = new Date().toISOString();
    setApplications(prev => prev.map(a => a.id === applicationId ? { ...a, paymentStatus: 'Paid', paymentRef, status: a.status === 'Submitted' ? 'Payment Verified' : a.status } : a));
    addTimeline({ applicationId, label: 'Payment Verified', note: paymentRef ? `Ref: ${paymentRef}` : '', actorRole: 'finance' });
  };

  const saveRevisedMarks = ({ applicationId, entries = [], finalize = false }) => {
    setApplications(prev => prev.map(a => {
      if (a.id !== applicationId) return a;
      const items = (a.items || []).map(it => {
        const upd = entries.find(e => e.subjectId === it.subjectId);
        if (!upd) return it;
        return { ...it, newMarks: upd.newMarks, remarks: upd.remarks };
      });
      const next = { ...a, items };
      if (finalize) {
        if (a.paymentStatus === 'Paid') {
          next.status = 'Revaluated';
          addTimeline({ applicationId, label: 'Revaluated', note: 'Examiner submitted final marks', actorRole: 'examiner' });
        } else {
          addTimeline({ applicationId, label: 'Transition Blocked', note: 'Finalize blocked — payment not verified', actorRole: 'system' });
        }
      } else {
        addTimeline({ applicationId, label: 'Draft Saved', note: 'Examiner saved draft marks', actorRole: 'examiner' });
      }
      return next;
    }));
  };

  // CoE actions
  const approveResults = (applicationId) => {
    setApplications(prev => prev.map(a => {
      if (a.id !== applicationId) return a;
      if (a.paymentStatus !== 'Paid') {
        addTimeline({ applicationId, label: 'Transition Blocked', note: 'Approve blocked — payment not verified', actorRole: 'system' });
        return a;
      }
      if (a.status !== 'Revaluated') {
        addTimeline({ applicationId, label: 'Transition Blocked', note: `Approve blocked — status is '${a.status}', expected 'Revaluated'`, actorRole: 'system' });
        return a;
      }
      addTimeline({ applicationId, label: 'Result Approved', note: 'Approved by CoE', actorRole: 'coe' });
      return { ...a, status: 'Result Approved' };
    }));
  };

  const publishResults = (applicationId) => {
    const now = new Date().toISOString();
    setApplications(prev => prev.map(a => {
      if (a.id !== applicationId) return a;
      if (a.paymentStatus !== 'Paid') {
        addTimeline({ applicationId, label: 'Transition Blocked', note: 'Publish blocked — payment not verified', actorRole: 'system' });
        return a;
      }
      if (a.status !== 'Result Approved' && a.status !== 'Revaluated') {
        addTimeline({ applicationId, label: 'Transition Blocked', note: `Publish blocked — status is '${a.status}', expected 'Result Approved'`, actorRole: 'system' });
        return a;
      }
      addTimeline({ applicationId, label: 'Published', note: 'Results published by CoE', actorRole: 'coe' });
      return { ...a, status: 'Published', publishedAt: now };
    }));
  };

  const value = useMemo(() => ({
    applications,
    assignments,
    timelines,
    feesRules,
    files,
    setApplications,
    setAssignments,
    setTimelines,
    setFeesRules,
    setFiles,
    // helpers
    getFeesRule,
    listApplications,
    applyRevaluation,
    updateApplicationStatus,
    addTimeline,
    addFile,
    markPaymentVerified,
    saveRevisedMarks,
    approveResults,
    publishResults,
  }), [applications, assignments, timelines, feesRules, files]);

  return (
    <RevaluationContext.Provider value={value}>{children}</RevaluationContext.Provider>
  );
};
