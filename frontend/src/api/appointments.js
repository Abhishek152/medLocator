import API from './axios';

export const bookAppointment = (data) =>
  API.post('/appointments', data).then((r) => r.data);

export const getUserAppointments = (userId, status) =>
  API.get(`/appointments/user/${userId}`, {
    params: status ? { status } : {},
  }).then((r) => r.data);
