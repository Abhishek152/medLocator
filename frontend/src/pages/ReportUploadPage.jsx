import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadReport } from '../api/reports';

export default function ReportUploadPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFile = useCallback((f) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(f.type)) {
      setError('Only PDF, PNG, and JPG files are allowed.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return;
    }
    setFile(f);
    setError('');
    setResult(null);

    // Generate preview for images
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await uploadReport(file);
      setResult(res);
      if (res.status === 'COMPLETED' || res.status === 'PENDING') {
        // Navigate to the list after a brief moment
        setTimeout(() => navigate('/reports'), 2000);
      }
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-container max-w-3xl mx-auto">
      <h1 className="section-title">Upload Medical Report</h1>
      <p className="section-subtitle">
        Upload your medical report (PDF or image) and get an AI-powered analysis with findings, recommendations, and urgency level.
      </p>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer
          ${dragging 
            ? 'border-primary-500 bg-primary-50 scale-[1.01]' 
            : file 
              ? 'border-emerald-400 bg-emerald-50/50' 
              : 'border-slate-300 bg-white hover:border-primary-400 hover:bg-primary-50/30'
          }`}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <input
          id="fileInput"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          className="hidden"
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
        />

        {file ? (
          <div className="space-y-3">
            {preview && (
              <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl shadow-md" />
            )}
            {!preview && (
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            )}
            <p className="text-slate-900 font-semibold">{file.name}</p>
            <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <p className="text-xs text-emerald-600 font-medium">✓ Ready to analyze</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-slate-700 font-semibold">Drag & drop your report here</p>
            <p className="text-sm text-slate-500">or click to browse · PDF, PNG, JPG up to 10MB</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Upload Button */}
      {file && !result && (
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="btn-primary w-full mt-6 py-3"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing with AI... This may take 30-60 seconds
            </span>
          ) : (
            'Upload & Analyze Report'
          )}
        </button>
      )}

      {/* Success */}
      {result && (result.status === 'COMPLETED' || result.status === 'PENDING') && (
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 text-center">
          <p className="text-emerald-800 font-semibold text-lg">✓ Report Uploaded!</p>
          <p className="text-sm text-emerald-600 mt-1">AI analysis has started. Redirecting to your reports...</p>
        </div>
      )}

      {result && result.status === 'FAILED' && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <p className="text-red-800 font-semibold">Analysis Failed</p>
          <p className="text-sm text-red-600 mt-1">{result.message}</p>
          <button onClick={() => { setResult(null); setFile(null); }} className="btn-outline mt-3">
            Try Again
          </button>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
        <strong>Medical Disclaimer:</strong> AI analysis is for informational purposes only and is not a substitute for professional medical advice. Always consult a qualified healthcare provider for medical decisions.
      </div>
    </div>
  );
}
