import api from './api';

export const getStats = () => api.get('/admin/stats');
export const getUsers = () => api.get('/admin/users');
export const approveCandidate = (id, status) => api.put(`/admin/candidates/${id}`, { status });
export const getAuditLogs = () => api.get('/admin/audit-logs');