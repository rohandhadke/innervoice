import api from '../utils/axiosInstance';

export const logMood = (data) =>
  api.post('/api/mood/', data);

export const getMoodLogs = () =>
  api.get('/api/mood/');
