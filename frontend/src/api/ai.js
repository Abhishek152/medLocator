import API from './axios';

export const recommendTests = (symptoms) =>
  API.post('/ai/recommend-tests', { symptoms }).then((r) => r.data);

export const getNearbyLabs = (lat, lng, query) =>
  API.get('/ai/nearby-labs', { params: { lat, lng, query } }).then((r) => r.data);
