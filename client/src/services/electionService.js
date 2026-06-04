import api from './api';

export const getElections = (params) => api.get('/elections', { params });
export const getElection = (id) => api.get(`/elections/${id}`);