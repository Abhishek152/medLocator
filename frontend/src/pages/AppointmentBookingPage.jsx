import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getPlaceDetails } from '../api/places';
import { bookAppointment } from '../api/appointments';
import { useAuth } from '../context/AuthContext';

export default function AppointmentBookingPage() {
  const { clinicId } = useParams(); // Now this is placeId
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [doctorName, setDoctorName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Check if we passed the clinic object via navigation state (optimistic load)
    if (location.state?.clinic) {
      setClinic(location.state.clinic);
      setLoading(false);
    }

    // Always fetch details because we need phone/hours which might not be in the list view
    getPlaceDetails(clinicId)
      .then((data) => {
        setClinic(data);
      })
      .catch((err) => {
        if (!location.state?.clinic) {
          setError("Could not load clinic details. " + err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [clinicId, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!date || !time) {
      setError('Please select a date and time');
      return;
    }

    setSubmitting(true);
    try {
      await bookAppointment({
        userId: user.id, 
        placeId: clinicId,
        clinicName: clinic?.name || 'Unknown Clinic',
        clinicAddress: clinic?.address || '',
        clinicPhone: clinic?.phoneNumber || '',
        doctorName: doctorName || 'Any Available Doctor',
        appointmentTime: `${date}T${time}:00`,
        notes
      });
      navigate('/my-appointments', { state: { success: true } });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to book appointment');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-container flex justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" /></div>;
  }

  if (error && !clinic) {
    return <div className="page-container text-center py-20 text-red-400">{error}</div>;
  }

  // Calculate min date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page-container max-w-2xl animate-slide-up">
      <div className="mb-8">
        <h1 className="section-title">Book Appointment</h1>
        <p className="section-subtitle mb-0">At <span className="text-white font-semibold">{clinic?.name}</span></p>
        <p className="text-slate-400 text-sm mt-1">{clinic?.address}</p>
      </div>

      <div className="card p-6 sm:p-8">
        {error && (
          <div className="bg-red-900/30 border border-red-700/50 text-red-300 rounded-xl px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Doctor Name Manual Entry (since doctors are no longer tied in DB) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Specific Doctor (Optional)
            </label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="input"
              placeholder="e.g. Dr. Rajesh Sharma"
            />
            <p className="text-xs text-slate-500 mt-1">Leave blank for any available doctor.</p>
          </div>

          {/* Date & Time */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date
              </label>
              <input
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="input"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Reason for visit / Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="input resize-none"
              placeholder="Briefly describe your symptoms or reason for visit..."
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full justify-center py-3.5 text-base"
          >
            {submitting ? 'Confirming Booking...' : 'Process Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
