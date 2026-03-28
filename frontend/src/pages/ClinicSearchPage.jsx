import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ClinicCard from '../components/ClinicCard';
import AiClinicsAssistant from '../components/AiClinicsAssistant';
import { getNearbyPlaces } from '../api/places';
import { useSearchCache } from '../context/SearchContext';

export default function ClinicSearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || 'clinic'; 
  const { cache, updateCache } = useSearchCache();

  const [clinics, setClinics] = useState(cache.query === q ? cache.results : []);
  const [loading, setLoading] = useState(cache.query === q ? false : true);
  const [error, setError] = useState('');
  const [locationStatus, setLocationStatus] = useState(cache.query === q ? '' : 'Getting location...');
  const searchRef = useRef(null);

  const fetchPlaces = useCallback(async (lat, lng) => {
    // Only show full loading if we don't have cached results for this query
    if (cache.query !== q || cache.results.length === 0) {
      setLoading(true);
    }
    setError('');
    setLocationStatus('');
    try {
      const data = await getNearbyPlaces(lat, lng, q, 5000);
      setClinics(data || []);
      updateCache(q, data || [], { lat, lng });
    } catch (err) {
      setError(err.message || 'Failed to fetch nearby clinics');
    } finally {
      // Always stop loading after fetch
      setLoading(false);
    }
  }, [q, updateCache]);

  useEffect(() => {
    // Avoid double fetching if we already have it in the same mount cycle
    if (searchRef.current === q) return;
    searchRef.current = q;

    // Basic fallback location (Bangalore / Default)
    const fallbackLat = 12.9716;
    const fallbackLng = 77.5946;

    if (!navigator.geolocation) {
      fetchPlaces(fallbackLat, fallbackLng);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchPlaces(position.coords.latitude, position.coords.longitude);
      },
      (geoError) => {
        console.warn('Geolocation failed, using fallback.', geoError);
        fetchPlaces(fallbackLat, fallbackLng);
      },
      { timeout: 5000 } // Don't hang forever
    );
  }, [q, fetchPlaces]);

  return (
    <div className="page-container flex flex-col gap-10">
      {/* Header & AI Section */}
      <div className="space-y-10">
        <div className="max-w-3xl">
          <h1 className="section-title">Find a Clinic</h1>
          <p className="section-subtitle">Search by name, location or specialization</p>
          <div className="mt-6 max-w-md">
            <SearchBar initialValue={q === 'clinic' ? '' : q} />
          </div>
        </div>

        <AiClinicsAssistant />
      </div>

      <hr className="border-slate-200" />

      {/* Results Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            {q !== 'clinic' ? `Results for "${q}"` : 'Nearby Clinics'}
          </h2>
          {!loading && (
            <span className="text-sm text-slate-500">
              {clinics.length} found nearby
            </span>
          )}
        </div>

        {/* Error / Status */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}
        {locationStatus && !error && (
           <div className="text-primary-300 text-sm animate-pulse">{locationStatus}</div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-48 animate-pulse" />
            ))}
          </div>
        ) : clinics.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinics.map((c, i) => <ClinicCard key={c.placeId || i} clinic={c} />)}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
            <p className="text-lg font-semibold text-slate-700 mb-2">No clinics found within 5km</p>
            <p className="text-sm text-slate-500">Try adjusting your search query</p>
          </div>
        )}
      </div>
    </div>
  );
}
