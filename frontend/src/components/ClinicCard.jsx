import { useNavigate } from 'react-router-dom';

const StarRating = ({ rating }) => {
  const stars = Math.round(rating || 0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= stars ? 'text-amber-400' : 'text-slate-300'}`}
          fill="currentColor" viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-slate-500 text-xs ml-1">{rating?.toFixed(1) || 'N/A'}</span>
    </div>
  );
};

export default function ClinicCard({ clinic }) {
  const navigate = useNavigate();
  // Backwards compatibility or place API field matching
  const name = clinic.name || 'Unknown Clinic';
  const address = clinic.address || clinic.location || 'Address not available';
  const rating = clinic.rating || 0;
  const ratingsTotal = clinic.userRatingsTotal || 0;
  const distance = clinic.distanceKm ? `${clinic.distanceKm.toFixed(1)} km away` : '';
  const isOpen = clinic.isOpen;
  // Use placeId for dynamic routes, fallback to id for old ones temporarily
  const routeId = clinic.placeId || clinic.id;

  const handleClick = () => {
    navigate(`/clinics/${routeId}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="card group cursor-pointer animate-fade-in flex flex-col h-full hover:shadow-md transition-shadow active:scale-[0.99]"
    >
      {/* Photo header or Color header */}
      {clinic.photoUrl ? (
        <div 
          className="h-32 bg-cover bg-center rounded-t-2xl"
          style={{ backgroundImage: `url(${clinic.photoUrl})` }}
        />
      ) : (
        <div className="h-2 bg-gradient-to-r from-primary-400 to-sky-300 rounded-t-2xl" />
      )}

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">
            {name}
          </h3>
          {distance && (
            <span className="badge-primary whitespace-nowrap shrink-0">{distance}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-3">
          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-2">{address}</span>
        </div>

        {isOpen !== undefined && (
          <div className="mb-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isOpen ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
               {isOpen ? 'Open Now' : 'Closed'}
             </span>
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StarRating rating={rating} />
            <span className="text-xs text-slate-500">({ratingsTotal})</span>
          </div>
          <div className="text-primary-600 group-hover:text-primary-700 text-xs font-semibold transition-colors flex items-center gap-1">
            View Details
            <svg className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
