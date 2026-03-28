import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getReportDetail } from '../api/reports';

const URGENCY_CONFIG = {
  LOW: { color: 'emerald', label: 'Low Risk', icon: '✓' },
  MEDIUM: { color: 'amber', label: 'Moderate', icon: '⚠' },
  HIGH: { color: 'orange', label: 'High Risk', icon: '⚠' },
  CRITICAL: { color: 'red', label: 'Critical', icon: '🚨' },
};

export default function ReportDetailPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await getReportDetail(id);
        setReport(data);
      } catch (err) {
        setError(err.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded-lg w-1/3" />
          <div className="h-4 bg-slate-200 rounded w-2/3" />
          <div className="card h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-6 py-4">
          <p className="font-semibold">Error</p>
          <p className="text-sm mt-1">{error}</p>
          <Link to="/reports" className="btn-outline mt-4 inline-block">← Back to Reports</Link>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const urgency = URGENCY_CONFIG[report.urgency] || URGENCY_CONFIG.LOW;

  return (
    <div className="page-container max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link to="/reports" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to My Reports
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{report.fileName}</h1>
            <p className="text-sm text-slate-500 mt-1">
              Uploaded on {new Date(report.uploadedAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          {report.urgency && (
            <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold
              bg-${urgency.color}-50 text-${urgency.color}-700 border border-${urgency.color}-200`}>
              <span>{urgency.icon}</span>
              {urgency.label}
            </span>
          )}
        </div>
      </div>

      {report.status !== 'COMPLETED' ? (
        <div className="card p-8 text-center">
          <p className="text-slate-500">
            {report.status === 'PROCESSING' && 'Report is being analyzed by AI...'}
            {report.status === 'PENDING' && 'Report is queued for analysis...'}
            {report.status === 'FAILED' && 'Analysis failed. Please try uploading again.'}
          </p>
        </div>
      ) : (
        <>
          {/* Email Notification Success */}
          {report.emailSent && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
              <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>A professional AI summary of this report has been sent to your registered email address.</span>
            </div>
          )}

          {/* Summary */}
          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Summary
            </h2>
            <p className="text-slate-700 leading-relaxed">{report.summary}</p>
            {report.confidenceScore && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-slate-500">AI Confidence:</span>
                <div className="flex-1 max-w-xs h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-500"
                    style={{ width: `${(report.confidenceScore * 100).toFixed(0)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600">
                  {(report.confidenceScore * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>

          {/* Findings */}
          {report.findings && report.findings.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Key Findings
              </h2>
              <ul className="space-y-3">
                {report.findings.map((finding, i) => (
                  <li key={i} className="flex items-start gap-3 bg-slate-50 rounded-xl px-4 py-3">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-700 leading-relaxed">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Original Report Preview */}
          {report.fileUrl && (
            <div className="card p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Original Report
                </h2>
                <a 
                  href={report.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  Open in New Tab
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden min-h-[200px] flex items-center justify-center">
                {report.contentType?.includes('pdf') ? (
                  <div className="text-center p-8">
                    <svg className="w-16 h-16 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-slate-500">PDF Document - Use "Open in New Tab" to view full report</p>
                  </div>
                ) : (
                  <img 
                    src={report.fileUrl} 
                    alt="Original Medical Report" 
                    className="max-w-full h-auto object-contain shadow-sm"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentNode.innerHTML = '<div class="p-8 text-slate-400 text-sm">Failed to load preview</div>';
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations && report.recommendations.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Recommendations
              </h2>
              <ul className="space-y-3">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 bg-emerald-50/50 rounded-xl px-4 py-3">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-slate-700 leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
        <strong>Medical Disclaimer:</strong> This AI-generated analysis is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
      </div>
    </div>
  );
}
