import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlaceDetails } from '../api/places';

const StarRating = ({ rating }) => {
  const stars = Math.round(rating || 0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-4 h-4 ${s <= stars ? 'text-amber-400' : 'text-slate-300'}`}
          fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-slate-600 font-semibold ml-1">{rating?.toFixed(1) || 'N/A'}</span>
    </div>
  );
};

export default function ClinicDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWithLocation = (lat = null, lng = null) => {
      getPlaceDetails(id, lat, lng)
        .then(setClinic)
        .catch((err) => setError(err.message || 'Failed to fetch clinic details.'))
        .finally(() => setLoading(false));
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWithLocation(pos.coords.latitude, pos.coords.longitude),
        () => fetchWithLocation(),
        { timeout: 5000 }
      );
    } else {
      fetchWithLocation();
    }
  }, [id]);

  const phoneHref = clinic?.phoneNumber
    ? `tel:${clinic.phoneNumber.replace(/\s+/g, '')}`
    : null;

  if (loading) {
    return (
      <div className="page-container">
        <div className="card h-64 animate-pulse mb-6" />
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container text-center py-20">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="btn-outline">← Go Back</button>
      </div>
    );
  }

  return (
    <div className="page-container animate-slide-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-slate-500 text-sm mb-6">
        <button onClick={() => navigate(-1)} className="hover:text-primary-600 transition-colors">Back to Search</button>
        <span>/</span>
        <span className="text-slate-700">{clinic?.name}</span>
      </div>

      {/* Clinic header card */}
      <div className="card mb-6 overflow-hidden">
        {clinic?.photoUrl ? (
          <div 
            className="h-48 sm:h-64 bg-cover bg-center"
            style={{ backgroundImage: `url(${clinic.photoUrl})` }}
          />
        ) : (
          <div className="h-4 bg-gradient-to-r from-primary-600 via-sky-500 to-teal-400" />
        )}
        
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{clinic?.name}</h1>
                {clinic?.isOpen !== undefined && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${clinic.isOpen ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {clinic.isOpen ? 'Open Now' : 'Closed'}
                  </span>
                )}
              </div>
              <p className="text-slate-600 flex items-center gap-2 mt-1">
                 <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {clinic?.address}
              </p>
            </div>

            {/* Call to Book CTA */}
            {phoneHref ? (
              <a
                href={phoneHref}
                className="btn-primary shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call to Book
              </a>
            ) : (
              <span className="text-sm text-slate-400 italic">Phone not available</span>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 pt-6 border-t border-slate-200">
            {/* Phone */}
            <div className="flex items-start gap-3">
               <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0 border border-primary-100">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
               </div>
               <div>
                  <h4 className="text-slate-900 font-bold mb-0.5">Contact</h4>
                  <p className="text-slate-600 text-sm">
                    {clinic?.phoneNumber ? (
                      <a href={phoneHref} className="hover:text-primary-600 transition-colors">
                        {clinic.phoneNumber}
                      </a>
                    ) : 'Not available'}
                  </p>
               </div>
            </div>

            {/* Rating */}
            <div className="flex items-start gap-3">
               <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                  <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
               </div>
               <div>
                  <h4 className="text-slate-900 font-bold mb-0.5">Rating</h4>
                  <div className="flex items-center gap-2">
                    <StarRating rating={clinic?.rating} />
                    <span className="text-slate-500 text-sm font-medium">({clinic?.userRatingsTotal || 0} reviews)</span>
                  </div>
               </div>
            </div>
            
            {/* Distance */}
             <div className="flex items-start gap-3">
               <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
               </div>
               <div>
                  <h4 className="text-slate-900 font-bold mb-0.5">Distance</h4>
                  <p className="text-slate-600 text-sm">
                    {clinic?.distanceKm ? `${clinic.distanceKm.toFixed(1)} km away` : 'Distance unknown'}
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      {(clinic?.pros?.length > 0 || clinic?.cons?.length > 0) && (
        <div className="card mb-8 p-6 sm:p-8 bg-gradient-to-br from-white to-slate-50 border-primary-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <svg className="w-24 h-24 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">AI Review Insights</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {clinic?.pros?.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-emerald-700 font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  What patients love
                </h3>
                <ul className="space-y-3">
                  {clinic.pros.map((pro, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-700 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {clinic?.cons?.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-amber-700 font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Points for improvement
                </h3>
                <ul className="space-y-3">
                  {clinic.cons.map((con, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-700 bg-amber-50/50 p-3 rounded-xl border border-amber-100/50 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-[10px] text-slate-400">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            AI-generated summary based on Google Reviews.
          </div>
        </div>
      )}

      {clinic?.reviews?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Recent Reviews
          </h2>
          <div className="grid gap-4">
            {clinic.reviews.slice(0, 3).map((review, idx) => (
              <div key={idx} className="card p-5 bg-white border border-slate-100">
                <p className="text-slate-600 text-sm italic leading-relaxed">"{review}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call-to-action bottom section */}
      <div className="mt-12 text-center bg-slate-50 border border-slate-200 rounded-2xl p-8 shadow-sm">
         <h2 className="text-xl font-extrabold text-slate-900 mb-2">Want to visit {clinic?.name}?</h2>
         <p className="text-slate-600 mb-6 max-w-lg mx-auto">
           Call the clinic directly to schedule your appointment, ask about availability, or get directions.
         </p>
         {phoneHref ? (
           <a href={phoneHref} className="btn-primary mx-auto inline-flex">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                 d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
             </svg>
             Call {clinic?.phoneNumber}
           </a>
         ) : (
           <p className="text-sm text-slate-400 italic">Phone number not available for this clinic.</p>
         )}
      </div>
    </div>
  );
}
