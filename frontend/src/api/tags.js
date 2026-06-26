import api from '../utils/axiosInstance';

export const getTags = () =>
  api.get('/api/tags/');

export const createTag = (data) =>
  api.post('/api/tags/', data);
