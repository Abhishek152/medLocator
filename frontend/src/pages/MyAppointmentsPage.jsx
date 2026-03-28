import { useEffect, useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppointmentList from '../components/AppointmentList';
import { getUserAppointments } from '../api/appointments';

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // For showing success toast if redirected from booking page
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(!!location.state?.success);

  useEffect(() => {
    // Hide success message after 5 seconds
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      getUserAppointments(user.id)
        .then(setAppointments)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="page-container max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">My Appointments</h1>
          <p className="section-subtitle mb-0">Manage your upcoming and past visits</p>
        </div>
        <Link to="/clinics" className="btn-outline text-xs hidden sm:inline-flex">
          Book New
        </Link>
      </div>

      {showSuccess && (
        <div className="bg-emerald-900/40 border border-emerald-700/50 text-emerald-300 rounded-xl px-5 py-3.5 mb-8 flex items-center gap-3 animate-slide-up">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm font-medium">Appointment successfully booked!</p>
        </div>
      )}

      {error ? (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}
        </div>
      ) : (
        <AppointmentList appointments={appointments} />
      )}
    </div>
  );
}
