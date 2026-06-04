import api from './api';

export const applyCandidacy = (data) => api.post('/candidates/apply', data);
export const getMyCandidacy = () => api.get('/candidates/me');
export const updateCandidacy = (data) => api.put('/candidates/me', data);
export const getAnalytics = () => api.get('/candidates/me/analytics');