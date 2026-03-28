import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AiClinicsAssistant() {
  const [symptoms, setSymptoms] = useState('');
  const navigate = useNavigate();

  const handleRecommend = (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    navigate(`/labs?symptoms=${encodeURIComponent(symptoms)}`);
  };

  return (
    <div className="card p-6 sm:p-8 bg-gradient-to-br from-primary-50 to-sky-50 border-primary-100 overflow-hidden relative shadow-sm">
      {/* Subtle medical cross background icon */}
      <div className="absolute top-0 right-0 p-8 text-primary-200/20 pointer-events-none">
        <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary-600 shadow-sm border border-primary-100">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Symptom Checker</h2>
            <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider">Powered by MedLocator AI</p>
          </div>
        </div>
        
        <p className="text-slate-600 mb-6 max-w-lg leading-relaxed">
          Describe your symptoms to identify appropriate medical tests and find nearby specialized diagnostic centers using real-time GPS data.
        </p>

        <form onSubmit={handleRecommend} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            className="input flex-1 bg-white"
            placeholder="e.g. I have a sharp pain in my lower back..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
          <button 
            type="submit" 
            className="btn-primary whitespace-nowrap px-8"
          >
            Find Tests & Labs
          </button>
        </form>
      </div>
    </div>
  );
}
