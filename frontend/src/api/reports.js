import API from './axios';

export const uploadReport = (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return API.post('/reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000, // 2 minutes — AI processing takes time
  }).then((r) => r.data);
};

export const getMyReports = () =>
  API.get('/reports').then((r) => r.data);

export const getReportDetail = (id) =>
  API.get(`/reports/${id}`).then((r) => r.data);
