import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import SearchBar from '../components/SearchBar';
import ClinicCard from '../components/ClinicCard';
import { getNearbyPlaces } from '../api/places';
import { useSearchCache } from '../context/SearchContext';

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'AI Symptom Checker',
    desc: 'Describe how you feel and get instant, clinically-relevant test recommendations.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Report Intelligence',
    desc: 'Upload lab reports to get AI-powered insights and scan for critical health markers.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Clinic Insights',
    desc: 'View AI-generated pros and cons of local labs based on real patient reviews.',
  },
];

export default function HomePage() {
  const { cache, updateCache } = useSearchCache();
  const [featured, setFeatured] = useState(cache.query === 'clinic' ? cache.results.slice(0, 3) : []);
  const [loading, setLoading] = useState(cache.query === 'clinic' ? false : true);
  const homeSearchRef = useRef(null);

  useEffect(() => {
    if (homeSearchRef.current === 'clinic') return;
    homeSearchRef.current = 'clinic';

    const fetchClinics = (lat, lng) => {
      // Only show loading if we don't have cached clinics
      if (cache.query !== 'clinic' || cache.results.length === 0) {
        setLoading(true);
      }
      getNearbyPlaces(lat, lng, 'clinic', 5000)
        .then((data) => {
          const top3 = (data || []).slice(0, 3);
          setFeatured(top3);
          updateCache('clinic', data || [], { lat, lng });
        })
        .catch(() => setFeatured([]))
        .finally(() => setLoading(false));
    };

    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => fetchClinics(pos.coords.latitude, pos.coords.longitude),
      () => {
        setLoading(false);
        console.warn('Geolocation denied or failed on home page');
      },
      { timeout: 8000 }
    );
  }, []);

  return (
    <div className="animate-fade-in bg-surface">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
              Trusted Healthcare Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
              Find Clinics Near You,{' '}
              <span className="text-primary-600">
                Check Symptoms Instantly
              </span>
            </h1>
            <p className="text-slate-600 text-lg mb-10 leading-relaxed">
              Search trusted clinics, check your symptoms with AI, and call to book appointments — all in one place.
            </p>
            <div className="flex justify-center">
              <SearchBar />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-12 pt-12 border-t border-slate-100">
            {[['500+', 'Clinics in Delhi'], ['< 30s', 'AI Analysis'], ['10K+', 'Reports Scanned']].map(([n, l]) => (
              <div key={l} className="text-center">
                <p className="text-2xl font-extrabold text-slate-800">{n}</p>
                <p className="text-slate-500 text-xs mt-1 uppercase tracking-wider font-semibold">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose MedLocator?</h2>
            <p className="text-slate-600">The most practical way to find healthcare near you.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 mb-6">
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-lg">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Clinics */}
      <section className="page-container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Featured Clinics</h2>
            <p className="section-subtitle">Top-rated clinics near you</p>
          </div>
          <Link to="/clinics" className="btn-outline text-xs">View All →</Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-36 animate-pulse bg-surface-card" />
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((clinic, i) => (
              <ClinicCard key={clinic.placeId || i} clinic={clinic} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500">
            <p>No clinics available near your location right now.</p>
          </div>
        )}
      </section>
    </div>
  );
}
