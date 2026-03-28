import API from './axios';

export const getTests = (category = '') =>
  API.get('/tests', { params: { category } }).then((r) => r.data);

export const searchTests = (q) =>
  API.get('/tests/search', { params: { q } }).then((r) => r.data);
