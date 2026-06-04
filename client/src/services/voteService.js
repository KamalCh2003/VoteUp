import api from './api';

export const castVote = (data) => api.post('/votes', data);
export const checkVoted = (electionId) => api.get(`/votes/check/${electionId}`);
export const getResults = (electionId) => api.get(`/votes/results/${electionId}`);