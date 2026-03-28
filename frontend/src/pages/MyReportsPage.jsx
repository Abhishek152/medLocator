import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyReports } from '../api/reports';

const URGENCY_STYLES = {
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
  CRITICAL: 'bg-red-50 text-red-700 border-red-200',
};

const STATUS_STYLES = {
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
  PENDING: 'bg-slate-50 text-slate-600 border-slate-200',
  FAILED: 'bg-red-50 text-red-700 border-red-200',
};

export default function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getMyReports();
        setReports(data);
      } catch (err) {
        setError(err.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">My Reports</h1>
          <p className="text-slate-500 text-sm">Your uploaded medical reports and AI analysis results.</p>
        </div>
        <Link to="/reports/upload" className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Report
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-52 animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-slate-700 mb-2">No reports yet</p>
          <p className="text-sm text-slate-500 mb-4">Upload your first medical report to get started.</p>
          <Link to="/reports/upload" className="btn-primary">Upload Report</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {reports.map((report) => (
            <Link
              key={report.id}
              to={`/reports/${report.id}`}
              className="card group cursor-pointer flex flex-col h-full"
            >
              {/* Status bar */}
              <div className={`h-1.5 ${report.status === 'COMPLETED' ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : report.status === 'FAILED' ? 'bg-red-400' : 'bg-blue-400'}`} />

              <div className="p-5 flex-1 flex flex-col">
                {/* File icon + name */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                    {report.contentType?.includes('pdf') ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 text-sm truncate group-hover:text-primary-600 transition-colors">
                      {report.fileName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(report.uploadedAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Summary preview */}
                {report.summary && (
                  <p className="text-sm text-slate-600 line-clamp-3 mb-3 leading-relaxed">
                    {report.summary}
                  </p>
                )}

                {/* Badges */}
                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                  <span className={`badge border ${STATUS_STYLES[report.status] || STATUS_STYLES.PENDING}`}>
                    {report.status}
                  </span>
                  {report.urgency && (
                    <span className={`badge border ${URGENCY_STYLES[report.urgency] || URGENCY_STYLES.LOW}`}>
                      {report.urgency}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
