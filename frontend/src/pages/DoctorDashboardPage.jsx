import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AppointmentList from '../components/AppointmentList';

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      const response = await axios.get(`/appointments/doctor/user/${user.id}`);
      setAppointments(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (apptId, newStatus) => {
    try {
      await axios.patch(`/appointments/${apptId}/status`, null, {
        params: { status: newStatus }
      });
      // Refresh list
      loadAppointments();
    } catch (err) {
      alert('Failed to update status: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading) {
    return <div className="page-container py-20 text-center text-slate-400">Loading dashboard...</div>;
  }

  return (
    <div className="page-container max-w-5xl">
       <div className="mb-8">
        <h1 className="section-title">Doctor Dashboard</h1>
        <p className="section-subtitle">Welcome back, Dr. {user?.name}</p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 rounded-xl px-4 py-3 mb-8">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white mb-4">Patient Appointments</h2>
        
        {appointments.length === 0 ? (
          <div className="card p-20 text-center text-slate-500">
            No appointments scheduled yet.
          </div>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appt) => (
              <div key={appt.id} className="card p-5 group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-white text-base">Patient: {appt.userId}</span>
                    <span className={`badge ${
                      appt.status === 'PENDING' ? 'badge-yellow' : 
                      appt.status === 'CONFIRMED' ? 'badge-green' : 
                      appt.status === 'CANCELLED' ? 'badge-red' : 'badge-primary'
                    }`}>
                      {appt.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">
                    {new Date(appt.appointmentTime).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                  {appt.notes && <p className="text-slate-500 text-xs italic mt-2">"{appt.notes}"</p>}
                </div>

                <div className="flex items-center gap-2">
                  {appt.status === 'PENDING' && (
                    <button 
                      onClick={() => updateStatus(appt.id, 'CONFIRMED')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-600/30 transition-colors"
                    >
                      Confirm
                    </button>
                  )}
                  {appt.status !== 'COMPLETED' && appt.status !== 'CANCELLED' && (
                    <>
                      <button 
                        onClick={() => updateStatus(appt.id, 'COMPLETED')}
                        className="px-3 py-1.5 rounded-lg bg-primary-600/20 text-primary-400 text-xs font-semibold hover:bg-primary-600/30 transition-colors"
                      >
                        Mark Completed
                      </button>
                      <button 
                        onClick={() => updateStatus(appt.id, 'CANCELLED')}
                        className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 text-xs font-semibold hover:bg-red-600/30 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
