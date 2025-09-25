import React, { useContext, useMemo, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../../App';
import {
  Calendar,
  FileText,
  Award,
  Bell,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  MailOpen,
  Check,
  X,
} from 'lucide-react';

/**
 * RecentActivity - Full implementation
 * - View all activity modal
 * - Per-item Details modal
 * - Mark read/unread + Mark all read
 * - Accessible (aria, focus return, Escape to close)
 * - No external dependencies besides lucide-react + Tailwind for styling
 */

const typeStyles = {
  success: { bg: 'bg-green-50', text: 'text-green-700', label: 'Success' },
  info: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Info' },
  warning: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Warning' },
  error: { bg: 'bg-red-50', text: 'text-red-700', label: 'Error' },
};

const defaultActivitiesForRole = (role) => {
  switch (role) {
    case 'coe':
    case 'assistant_coe':
      return [
        { icon: FileText, title: 'Question paper approved', description: 'Computer Networks - Final Exam', time: '2 hours ago', type: 'success' },
        { icon: Calendar, title: 'Exam scheduled', description: 'Database Systems - Midterm Exam on March 15', time: '4 hours ago', type: 'info' },
        { icon: Award, title: 'Results published', description: '156 students - Operating Systems', time: '1 day ago', type: 'success' },
        { icon: Bell, title: 'Hall tickets generated', description: 'Batch processed for 247 students', time: '1 day ago', type: 'info' },
        { icon: AlertCircle, title: 'Pending approval', description: 'Software Engineering question paper', time: '2 days ago', type: 'warning' },
      ];
    case 'faculty':
      return [
        { icon: FileText, title: 'Question paper submitted', description: 'Data Structures - Final Exam', time: '3 hours ago', type: 'info' },
        { icon: Award, title: 'Marks submitted', description: 'Graded 45 answer scripts', time: '6 hours ago', type: 'success' },
        { icon: Calendar, title: 'Exam reminder', description: 'Algorithms exam tomorrow at 10 AM', time: '12 hours ago', type: 'info' },
        { icon: Bell, title: 'Evaluation request', description: '23 scripts pending evaluation', time: '1 day ago', type: 'warning' },
      ];
    case 'student':
      return [
        { icon: Calendar, title: 'Exam scheduled', description: 'Computer Networks - March 18, 10:00 AM', time: '2 hours ago', type: 'info' },
        { icon: Award, title: 'Result published', description: 'Operating Systems - Grade: A (89/100)', time: '1 day ago', type: 'success' },
        { icon: FileText, title: 'Hall ticket available', description: 'Database Systems - Midterm Exam', time: '2 days ago', type: 'info' },
        { icon: Bell, title: 'Exam reminder', description: 'Software Engineering exam in 3 days', time: '3 days ago', type: 'warning' },
      ];
    case 'dept_coordinator':
      return [
        { icon: CheckCircle, title: 'Department approval', description: 'Approved 5 question papers for CS dept', time: '1 hour ago', type: 'success' },
        { icon: Calendar, title: 'Schedule coordinated', description: 'Resolved conflict for 3 concurrent exams', time: '4 hours ago', type: 'success' },
        { icon: FileText, title: 'Review completed', description: 'Computer Graphics question bank updated', time: '8 hours ago', type: 'info' },
        { icon: Award, title: 'Results reviewed', description: 'Machine Learning - 78 students passed', time: '1 day ago', type: 'success' },
      ];
    default:
      return [];
  }
};

const RecentActivity = ({ initialLimit = 5 }) => {
  const { user } = useContext(AuthContext);

  const initialActivities = useMemo(() => {
    return defaultActivitiesForRole(user?.role).map((a, idx) => ({
      id: `${user?.role || 'guest'}-${idx}-${a.title.replace(/\s+/g, '-')}`,
      ...a,
      read: false,
    }));
  }, [user?.role]);

  const [activities, setActivities] = useState(initialActivities);
  const [limit, setLimit] = useState(initialLimit);

  // Modal state for "View all activity"
  const [isAllModalOpen, setIsAllModalOpen] = useState(false);
  const allOpenerRef = useRef(null);
  const allCloseRef = useRef(null);

  // Modal state for per-item Details
  const [selectedActivity, setSelectedActivity] = useState(null);
  const detailsOpenerRef = useRef(null);
  const detailsCloseRef = useRef(null);

  const unreadCount = activities.filter((a) => !a.read).length;

  const markAllRead = () => setActivities((prev) => prev.map((a) => ({ ...a, read: true })));
  const toggleRead = (id) => setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, read: !a.read } : a)));

  // Open/close handlers
  const openAllModal = () => setIsAllModalOpen(true);
  const closeAllModal = () => setIsAllModalOpen(false);

  const openDetails = (activity, openerRef = null) => {
    if (openerRef) detailsOpenerRef.current = openerRef;
    setSelectedActivity(activity);
  };
  const closeDetails = () => setSelectedActivity(null);

  // Escape handling for both modals
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (selectedActivity) {
          closeDetails();
        } else if (isAllModalOpen) {
          closeAllModal();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isAllModalOpen, selectedActivity]);

  // Manage focus return after modals close
  useEffect(() => {
    if (!isAllModalOpen && allOpenerRef.current) {
      allOpenerRef.current.focus();
    } else if (isAllModalOpen && allCloseRef.current) {
      allCloseRef.current.focus();
    }
  }, [isAllModalOpen]);

  useEffect(() => {
    if (!selectedActivity && detailsOpenerRef.current) {
      try {
        detailsOpenerRef.current.focus();
      } catch (e) {
        /* ignore */
      }
    } else if (selectedActivity && detailsCloseRef.current) {
      detailsCloseRef.current.focus();
    }
  }, [selectedActivity]);

  const visible = activities.slice(0, limit);

  return (
    <>
      <div className="bg-white rounded-2xl shadow p-0 border border-gray-200">
        <div className="p-5 flex items-start justify-between border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500 mt-1">Latest updates and notifications</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center text-sm text-gray-600">
              <MailOpen className="w-4 h-4 mr-1 text-gray-400" aria-hidden />
              <span aria-live="polite" aria-atomic="true">{unreadCount} unread</span>
            </div>

            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                unreadCount === 0
                  ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                  : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:ring-indigo-200'
              }`}
              aria-label="Mark all activity as read"
              title="Mark all as read"
            >
              <Check className="w-4 h-4" aria-hidden />
              Mark all read
            </button>
          </div>
        </div>

        <div className="p-4">
          {activities.length === 0 ? (
            <div className="py-6 text-center text-gray-500">
              <p>No recent activity</p>
            </div>
          ) : (
            <ul role="list" className="space-y-3">
              {visible.map((activity) => {
                const Icon = activity.icon || FileText;
                const styles = typeStyles[activity.type] || typeStyles.info;
                return (
                  <li
                    key={activity.id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-shadow focus-within:shadow-lg ${
                      activity.read ? 'bg-white' : 'bg-gray-50 ring-1 ring-indigo-50'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${styles.bg} ${styles.text}`}
                      aria-hidden
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-xs text-gray-400 mt-1" aria-hidden>{activity.time}</p>
                        </div>

                        <div className="ml-2 flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}
                            aria-label={`Type: ${styles.label}`}
                          >
                            {styles.label}
                          </span>

                          <button
                            onClick={() => toggleRead(activity.id)}
                            className="inline-flex items-center justify-center p-1 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-200"
                            aria-pressed={activity.read}
                            aria-label={activity.read ? 'Mark as unread' : 'Mark as read'}
                            title={activity.read ? 'Mark as unread' : 'Mark as read'}
                          >
                            {activity.read ? <MailOpen className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p
                          className="text-sm text-gray-600 truncate"
                          title={activity.description}
                          tabIndex={0}
                          aria-label={`${activity.title} — ${activity.description}`}
                        >
                          {activity.description}
                        </p>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => openDetails(activity, e.currentTarget)}
                            className="ml-3 inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 rounded"
                            aria-label={`View details for ${activity.title}`}
                            title="View details"
                          >
                            <span>Details</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {visible.length} of {activities.length}
            </div>

            <div className="flex items-center gap-2">
              {activities.length > initialLimit && (
                <button
                  onClick={() => setLimit((l) => (l === activities.length ? initialLimit : activities.length))}
                  className="text-sm px-3 py-1 rounded-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-200"
                  aria-expanded={limit === activities.length}
                >
                  {limit === activities.length ? 'Show less' : 'Show more'}
                </button>
              )}

              <button
                ref={allOpenerRef}
                onClick={openAllModal}
                className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 rounded"
                aria-haspopup="dialog"
                aria-controls="activity-all-modal"
              >
                View all activity
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* All-activity Modal */}
      {isAllModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="activity-all-modal-title"
          id="activity-all-modal"
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
        >
          {/* backdrop */}
          <div className="fixed inset-0 bg-black/40" onClick={closeAllModal} aria-hidden />

          {/* modal panel */}
          <div className="relative z-50 w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h2 id="activity-all-modal-title" className="text-lg font-semibold text-gray-900">All Activity</h2>
                <p className="text-sm text-gray-500">Full activity log — latest first</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={markAllRead}
                  disabled={unreadCount === 0}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    unreadCount === 0 ? 'text-gray-400 bg-gray-50 cursor-not-allowed' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:ring-indigo-200'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  Mark all read
                </button>

                <button
                  ref={allCloseRef}
                  onClick={closeAllModal}
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  aria-label="Close activity modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
              {activities.length === 0 ? (
                <div className="py-6 text-center text-gray-500">No activity found.</div>
              ) : (
                <ul role="list" className="divide-y">
                  {activities.map((activity) => {
                    const Icon = activity.icon || FileText;
                    const styles = typeStyles[activity.type] || typeStyles.info;
                    return (
                      <li key={activity.id} className="p-3 flex items-start gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${styles.bg} ${styles.text}`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                              <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles.bg} ${styles.text}`}>
                                {styles.label}
                              </span>

                              <button
                                onClick={() => toggleRead(activity.id)}
                                className="inline-flex items-center justify-center p-1 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                aria-pressed={activity.read}
                                aria-label={activity.read ? 'Mark as unread' : 'Mark as read'}
                              >
                                {activity.read ? <MailOpen className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                              </button>

                              <button
                                onClick={(e) => openDetails(activity, e.currentTarget)}
                                className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 rounded"
                                aria-label={`Open details for ${activity.title}`}
                              >
                                Details
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className="mt-2 text-sm text-gray-600">{activity.description}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={closeAllModal}
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal (per-item) */}
      {selectedActivity && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="activity-details-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* backdrop */}
          <div className="fixed inset-0 bg-black/40" onClick={closeDetails} aria-hidden />

          {/* modal panel */}
          <div className="relative z-60 w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <h3 id="activity-details-title" className="text-lg font-semibold text-gray-900">
                  {selectedActivity.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{selectedActivity.time}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  ref={detailsCloseRef}
                  onClick={closeDetails}
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  aria-label="Close details modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${(typeStyles[selectedActivity.type] || typeStyles.info).bg} ${(typeStyles[selectedActivity.type] || typeStyles.info).text}`}>
                  {selectedActivity.icon ? React.createElement(selectedActivity.icon, { className: 'w-6 h-6' }) : <FileText className="w-6 h-6" />}
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2"><strong>Type:</strong> {(typeStyles[selectedActivity.type] || typeStyles.info).label}</p>
                  <p className="text-sm text-gray-700">{selectedActivity.description}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  toggleRead(selectedActivity.id);
                }}
                className="px-3 py-1.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-sm text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                {selectedActivity.read ? 'Mark as unread' : 'Mark as read'}
              </button>

              <button
                onClick={closeDetails}
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecentActivity;
