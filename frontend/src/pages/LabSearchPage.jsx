import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { recommendTests, getNearbyLabs } from '../api/ai';
import ClinicCard from '../components/ClinicCard';
import { useSearchCache } from '../context/SearchContext';

/**
 * Map test categories to specific Google Places search keywords.
 * The backend now does a SINGLE direct query — so whatever we send 
 * here is exactly what Google searches for. Be specific.
 */
const CATEGORY_SEARCH_MAP = {
  'hematology':   'pathology lab',
  'biochemistry': 'pathology lab',
  'microbiology': 'pathology lab',
  'hepatology':   'pathology lab',
  'endocrinology':'pathology lab',
  'immunology':   'pathology lab',
  'urology':      'urology diagnostic lab',
  'radiology':    'radiology center',
  'cardiology':   'cardiology clinic',
  'orthopedic':   'orthopedic clinic',
  'ophthalmology':'eye clinic',
  'dental':       'dental clinic dentist',
  'dentistry':    'dental clinic dentist',
  'gastroenterology': 'gastro diagnostic center',
  'pulmonology':  'pulmonology clinic',
  'neurology':    'neurology clinic',
  'dermatology':  'dermatology skin clinic',
  'ent':          'ENT clinic',
};

function getSearchQuery(testName, category) {
  // 1. Try category match first
  if (category) {
    const key = category.toLowerCase().trim();
    for (const [cat, query] of Object.entries(CATEGORY_SEARCH_MAP)) {
      if (key.includes(cat) || cat.includes(key)) return query;
    }
  }

  // 2. Infer from the test name itself
  const lower = testName.toLowerCase();
  if (lower.includes('dental') || lower.includes('tooth') || lower.includes('teeth') || lower.includes('oral')) {
    return 'dental clinic dentist';
  }
  if (lower.includes('x-ray') || lower.includes('mri') || lower.includes('ct scan') || lower.includes('ultrasound') || lower.includes('dexa')) {
    return 'radiology center';
  }
  if (lower.includes('ecg') || lower.includes('echo') || lower.includes('treadmill')) {
    return 'cardiology clinic';
  }
  if (lower.includes('eye') || lower.includes('vision')) {
    return 'eye clinic';
  }
  if (lower.includes('skin') || lower.includes('allergy')) {
    return 'dermatology skin clinic';
  }
  if (lower.includes('ear') || lower.includes('nose') || lower.includes('throat')) {
    return 'ENT clinic';
  }

  // 3. Default: generic diagnostic lab
  return 'diagnostic lab pathology';
}

export default function LabSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initSymptoms = searchParams.get('symptoms') || '';
  const { symptomCache, updateSymptomCache } = useSearchCache();
  const [symptoms, setSymptoms] = useState(initSymptoms || symptomCache.symptoms);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // AI Response
  const [explanation, setExplanation] = useState(symptomCache.explanation || '');
  const [tests, setTests] = useState(symptomCache.tests || []);

  // Nearby Labs State
  const [selectedTest, setSelectedTest] = useState(symptomCache.selectedTest || null);
  const [labs, setLabs] = useState(symptomCache.labs || []);
  const [labsLoading, setLabsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // If we have URL params BUT no cache OR different cache, perform fresh analysis
    if (initSymptoms && initSymptoms !== symptomCache.symptoms) {
      handleAnalyze(null, initSymptoms);
    }
    // If we have URL params AND they match cache, state is already initialized by useState defaults
  }, [initSymptoms]);

  const handleAnalyze = async (e, forceSymptoms = null) => {
    if (e) e.preventDefault();
    const query = forceSymptoms || symptoms;
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setExplanation('');
    setTests([]);
    setLabs([]);
    setSelectedTest(null);

    setSearchParams({ symptoms: query });

    try {
      const data = await recommendTests(query);
      setExplanation(data.aiExplanation);
      setTests(data.suggestedTests || []);
      
      // Update cache
      updateSymptomCache({
        symptoms: query,
        explanation: data.aiExplanation,
        tests: data.suggestedTests || [],
        selectedTest: null,
        labs: []
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze symptoms.');
    } finally {
      setLoading(false);
    }
  };

  const findLabsForTest = (testName, category) => {
    setSelectedTest(testName);
    setLabsLoading(true);
    setLabs([]);

    const searchQuery = getSearchQuery(testName, category);

    const fetchLabs = async (lat, lng) => {
      try {
        const data = await getNearbyLabs(lat, lng, searchQuery);
        setLabs(data || []);
        
        // Update cache with labs
        updateSymptomCache({
          selectedTest: testName,
          labs: data || []
        });
      } catch (err) {
        console.error('Failed to fetch labs:', err);
      } finally {
        setLabsLoading(false);
      }
    };

    if (userLocation) {
      fetchLabs(userLocation.lat, userLocation.lng);
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          fetchLabs(loc.lat, loc.lng);
        },
        () => {
          console.warn('Geolocation denied or failed for labs');
        },
        { timeout: 8000 }
      );
    }
  };

  return (
    <div className="page-container flex flex-col gap-10">
      {/* Header */}
      <div className="max-w-3xl">
        <h1 className="section-title">Symptom Checker & Lab Finder</h1>
        <p className="section-subtitle">Describe your symptoms to get recommended medical tests and find nearby diagnostic labs.</p>
      </div>

      {/* Input Section */}
      <div className="card p-6 sm:p-8 bg-white border-slate-200 shadow-sm">
        <form onSubmit={handleAnalyze} className="flex flex-col gap-4">
          <label className="text-sm font-semibold text-slate-700">What are you experiencing?</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              className="input flex-1"
              placeholder="e.g. I have frequent trips to the bathroom and feel very thirsty..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
            <button type="submit" disabled={loading} className="btn-primary min-w-[140px] justify-center">
              {loading ? 'Analyzing...' : 'Analyze Symptoms'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* AI Results */}
      {explanation && !loading && (
        <div className="animate-slide-up space-y-8">
          <div className="bg-primary-50 p-6 rounded-2xl border border-primary-100 shadow-sm">
            <h3 className="text-lg font-bold text-primary-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 13a1 1 0 112 0v-4a1 1 0 11-2 0v4zm1-8a1 1 0 110 2 1 1 0 010-2z" />
              </svg>
              Assessment Summary
            </h3>
            <p className="text-slate-700 leading-relaxed">{explanation}</p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-6">Recommended Tests</h3>
            {tests.length === 0 ? (
              <p className="text-slate-500">No specific tests found in our catalog for these symptoms.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {tests.map(test => {
                  const isSelected = selectedTest === test.testName;
                  return (
                    <div key={test.id} className="card bg-white p-5 border border-slate-200 hover:border-primary-300 transition-colors flex flex-col h-full shadow-sm">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h4 className="font-bold text-slate-900 text-lg">{test.testName}</h4>
                        <span className="badge-primary shrink-0">{test.category}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-4 flex-1">{test.description}</p>
                      
                      <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                        <div className="text-sm">
                          <span className="text-slate-500 block text-xs">Estimated Cost</span>
                          <span className="text-primary-700 font-semibold">₹{test.typicalMinPrice} - ₹{test.typicalMaxPrice}</span>
                        </div>
                        
                        <button 
                          onClick={() => findLabsForTest(test.testName, test.category)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'border-slate-300 text-slate-600 hover:border-primary-400 hover:text-primary-600'
                          }`}
                        >
                          {isSelected ? '✓ Selected' : 'Find Labs Near Me'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nearby Labs Section */}
      {(labsLoading || labs.length > 0 || (selectedTest && labs.length === 0 && !labsLoading)) && (
        <div className="mt-8 pt-8 border-t border-slate-200 animate-fade-in">
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Nearby Labs & Diagnostic Centers
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            These are labs near your location that may offer <strong>{selectedTest}</strong>. Please call to confirm availability and pricing before visiting.
          </p>
          
          {labsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => <div key={i} className="card h-48 animate-pulse" />)}
            </div>
          ) : labs.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {labs.map((lab, i) => <ClinicCard key={lab.placeId || i} clinic={lab} />)}
            </div>
          ) : (
             <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-500">No labs found nearby. Try expanding your search on the Clinic Search page.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
