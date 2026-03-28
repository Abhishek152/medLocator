import API from './axios';

export const getNearbyPlaces = (lat, lng, query, radius = 5000) =>
  API.get('/places/nearby', { params: { lat, lng, query, radius } }).then((r) => r.data);

export const getPlaceDetails = (placeId, lat = null, lng = null) =>
  API.get(`/places/${placeId}`, { params: { lat, lng } }).then((r) => r.data);
