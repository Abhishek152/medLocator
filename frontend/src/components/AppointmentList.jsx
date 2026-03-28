const STATUS_STYLES = {
  PENDING:   'badge-yellow',
  CONFIRMED: 'badge-green',
  CANCELLED: 'badge-red',
  COMPLETED: 'badge-primary',
};

export default function AppointmentList({ appointments }) {
  if (!appointments?.length) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-surface-card border border-slate-700 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-slate-400 font-medium">No appointments found</p>
        <p className="text-slate-600 text-sm mt-1">Book your first appointment to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appt) => (
        <div key={appt.id} className="card p-5 hover:!-translate-y-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-white text-base">{appt.clinicName || `Clinic #${appt.clinicId}`}</h3>
                <span className={STATUS_STYLES[appt.status] || 'badge'}>{appt.status}</span>
              </div>
              {appt.doctorName && (
                <p className="text-slate-400 text-sm mb-2">
                  Dr. {appt.doctorName}
                </p>
              )}
              {appt.notes && (
                <p className="text-slate-500 text-xs italic">"{appt.notes}"</p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-primary-400 font-semibold text-sm">
                {new Date(appt.appointmentTime).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                {new Date(appt.appointmentTime).toLocaleTimeString('en-IN', {
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
